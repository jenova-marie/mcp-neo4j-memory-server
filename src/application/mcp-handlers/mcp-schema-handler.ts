/**
 * MCP Schema Handler
 * Single responsibility: handle schema-related MCP requests (GET/PUT)
 */
import { DIContainer } from '../../container/di-container';
import { SchemaService, SchemaDefinition, SchemaDefinitionSchema, ValidationResult } from '../../infrastructure/services';
import { MCPValidationError, MCPErrorCodes } from '../../infrastructure/errors';

interface BreakingChange {
  type: 'removed_type' | 'removed_relation';
  message: string;
  affectedCount: number;
  details: any;
}

export class McpSchemaHandler {
  private container: DIContainer;
  private schemaService: SchemaService | null = null;

  constructor() {
    this.container = DIContainer.getInstance();
  }

  /**
   * Lazy initialization of schema service
   */
  private getSchemaService(): SchemaService {
    if (!this.schemaService) {
      this.schemaService = this.container.getSchemaService();
    }
    return this.schemaService;
  }

  /**
   * Handle GET or PUT schema operation
   * GET: No schema param - returns current schema
   * PUT: Schema param provided - validates and stores new schema
   */
  async handleSchemaOperation(params: {
    schema?: SchemaDefinition;
    force?: boolean;
  }): Promise<any> {

    if (params.schema) {
      // PUT - Store new schema
      return this.setSchema(params.schema, params.force || false);
    } else {
      // GET - Retrieve current schema
      return this.getSchema();
    }
  }

  /**
   * GET: Retrieve current schema
   */
  private async getSchema(): Promise<{
    database: string;
    schema: SchemaDefinition | null;
    hasSchema: boolean;
  }> {
    const schemaService = this.getSchemaService();
    const schema = await schemaService.getSchema();
    const currentDb = this.container.getCurrentDatabase();

    return {
      database: currentDb.database,
      schema,
      hasSchema: schema !== null
    };
  }

  /**
   * PUT: Validate and store new schema with auto-versioning
   */
  private async setSchema(
    schema: SchemaDefinition,
    force: boolean
  ): Promise<{
    success: boolean;
    memoryId: string;
    version: string;
    previousVersion?: string;
    schema: SchemaDefinition;
    forced: boolean;
  }> {

    // 1. Validate schema structure
    let validated: SchemaDefinition;
    try {
      validated = SchemaDefinitionSchema.parse(schema);
    } catch (error: any) {
      throw new MCPValidationError(
        `Invalid schema structure: ${error.message}`,
        MCPErrorCodes.INVALID_SCHEMA_STRUCTURE,
        { zodError: error }
      );
    }

    // 2. Get current schema
    const schemaService = this.getSchemaService();
    const currentSchema = await schemaService.getSchema();

    // 3. Auto-version bump
    const newVersion = this.bumpVersion(
      currentSchema?.schema_version || '0.0.0',
      validated.schema_version
    );
    validated.schema_version = newVersion;
    validated.last_updated = new Date().toISOString();

    // 4. Detect breaking changes (if current schema exists)
    if (currentSchema && !force) {
      const breakingChanges = await this.detectBreakingChanges(
        currentSchema,
        validated
      );

      if (breakingChanges.length > 0) {
        throw new MCPValidationError(
          'Breaking changes detected. Use force=true to override.',
          MCPErrorCodes.SCHEMA_BREAKING_CHANGES,
          {
            breakingChanges,
            force_required: true,
            hint: 'Call memory_schema with force=true to override these warnings'
          }
        );
      }
    }

    // 5. Store as new _schema_definition memory
    const createUseCase = this.container.getCreateMemoryUseCase();

    const memory = {
      name: `${validated.domain || 'Schema'} v${validated.schema_version}`,
      memoryType: "_schema_definition",
      metadata: validated,
      observations: [
        `Schema version ${validated.schema_version}`,
        currentSchema ? `Upgraded from v${currentSchema.schema_version}` : 'Initial schema definition',
        force ? 'FORCED UPDATE - breaking changes ignored' : 'Clean upgrade - no breaking changes'
      ]
    };

    const result = await createUseCase.execute(memory);

    // 6. Invalidate cache
    schemaService.invalidateCache();

    return {
      success: true,
      memoryId: result.id,
      version: validated.schema_version,
      previousVersion: currentSchema?.schema_version,
      schema: validated,
      forced: force
    };
  }

  /**
   * Auto-bump version number
   */
  private bumpVersion(current: string, proposed: string): string {
    // Parse versions
    const currentParts = current.split('.').map(Number);
    const proposedParts = proposed.split('.').map(Number);

    // Check if proposed is greater than current
    const isGreater = this.compareVersions(proposed, current) > 0;

    if (isGreater) {
      // Use proposed version
      return proposed;
    } else {
      // Auto-bump minor version
      const [major, minor, patch] = currentParts;
      return `${major}.${minor + 1}.0`;
    }
  }

  /**
   * Compare version strings (semver-like)
   * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;

      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }

    return 0;
  }

  /**
   * Detect breaking changes (simplified - only orphaned data)
   * Fast: Only indexed property scans, no JSON parsing
   */
  private async detectBreakingChanges(
    current: SchemaDefinition,
    proposed: SchemaDefinition
  ): Promise<BreakingChange[]> {

    const changes: BreakingChange[] = [];
    const sessionFactory = this.container.getSessionFactory();
    const session = sessionFactory.createSession();

    try {
      // Check 1: Removed memory types (FAST - indexed property scan)
      const currentTypes = Object.keys(current.defines_types);
      const proposedTypes = Object.keys(proposed.defines_types);
      const removedTypes = currentTypes.filter(t => !proposedTypes.includes(t));

      if (removedTypes.length > 0) {
        const result = await session.run(
          `MATCH (m:Memory)
           WHERE m.memoryType IN $removedTypes
           RETURN m.memoryType as type, count(m) as count`,
          { removedTypes }
        );

        for (const record of result.records) {
          const type = record.get('type');
          const count = record.get('count').toNumber();

          if (count > 0) {
            changes.push({
              type: 'removed_type',
              message: `Cannot remove memoryType '${type}': ${count} existing memories would be orphaned`,
              affectedCount: count,
              details: { memoryType: type }
            });
          }
        }
      }

      // Check 2: Removed relationship types (FAST - indexed property scan)
      if (current.defines_relations && proposed.defines_relations) {
        const currentRels = Object.keys(current.defines_relations);
        const proposedRels = Object.keys(proposed.defines_relations);
        const removedRels = currentRels.filter(r => !proposedRels.includes(r));

        if (removedRels.length > 0) {
          const result = await session.run(
            `MATCH ()-[r:RELATES_TO]->()
             WHERE r.relationType IN $removedRels
             RETURN r.relationType as type, count(r) as count`,
            { removedRels }
          );

          for (const record of result.records) {
            const type = record.get('type');
            const count = record.get('count').toNumber();

            if (count > 0) {
              changes.push({
                type: 'removed_relation',
                message: `Cannot remove relationType '${type}': ${count} existing relations would be orphaned`,
                affectedCount: count,
                details: { relationType: type }
              });
            }
          }
        }
      }

    } finally {
      await session.close();
    }

    return changes;
  }

  /**
   * Validate memory data against schema
   * If no schema exists, validation passes
   */
  async handleValidate(params: {
    memoryType: string;
    metadata: Record<string, any>;
    database?: string;
  }): Promise<ValidationResult> {
    // Input validation
    if (!params.memoryType || typeof params.memoryType !== 'string') {
      throw new MCPValidationError(
        'memoryType must be a non-empty string',
        MCPErrorCodes.INVALID_REQUEST
      );
    }

    if (!params.metadata || typeof params.metadata !== 'object') {
      throw new MCPValidationError(
        'metadata must be an object',
        MCPErrorCodes.INVALID_REQUEST
      );
    }

    const schemaService = this.getSchemaService();
    return await schemaService.validate(params);
  }
}
