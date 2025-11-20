/**
 * Schema Service - Manages schema definitions and validation
 * Single responsibility: Schema retrieval, caching, and validation logic
 */

import { z } from 'zod';
import { SessionFactory } from '../database/session-factory';
import { Neo4jDriverManager } from '../database/neo4j-driver';
import { MCPValidationError, MCPErrorCodes } from '../errors';

// Zod schema for validation
export const SchemaDefinitionSchema = z.object({
  schema_version: z.string(),
  domain: z.string().optional(),
  last_updated: z.string().optional(),
  defines_types: z.record(z.object({
    description: z.string().optional(),
    required_metadata: z.array(z.string()).optional(),
    metadata_schema: z.record(z.object({
      type: z.string(),
      values: z.array(z.any()).optional(),
      optional: z.boolean().optional(),
      description: z.string().optional()
    })).optional()
  })),
  defines_relations: z.record(z.object({
    from_types: z.array(z.string()).optional(),
    to_types: z.array(z.string()).optional(),
    description: z.string().optional(),
    strength_guidance: z.string().optional()
  })).optional()
});

export type SchemaDefinition = z.infer<typeof SchemaDefinitionSchema>;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class SchemaService {
  // Cache: database -> schema definition
  private schemaCache: Map<string, SchemaDefinition | null> = new Map();

  constructor(
    private sessionFactory: SessionFactory,
    private driverManager: Neo4jDriverManager
  ) {}

  /**
   * Get schema definition for current database
   * Returns null if no schema is defined
   */
  async getSchema(database?: string): Promise<SchemaDefinition | null> {
    const dbName = database || this.driverManager.getCurrentDatabase().database;

    // Check cache
    if (this.schemaCache.has(dbName)) {
      return this.schemaCache.get(dbName)!;
    }

    // Query for _schema_definition memories
    const session = this.sessionFactory.createSession(database);

    try {
      const result = await session.run(`
        MATCH (m:Memory)
        WHERE m.memoryType = '_schema_definition'
        RETURN m.metadata as metadata
        ORDER BY m.createdAt DESC
        LIMIT 1
      `);

      if (result.records.length === 0) {
        // No schema defined - cache null
        this.schemaCache.set(dbName, null);
        return null;
      }

      const metadataJson = result.records[0].get('metadata');
      const schema = JSON.parse(metadataJson) as SchemaDefinition;

      // Cache and return
      this.schemaCache.set(dbName, schema);
      return schema;
    } finally {
      await session.close();
    }
  }

  /**
   * Validate memory data against schema
   * If no schema exists, validation passes
   */
  async validate(params: {
    memoryType: string;
    metadata: Record<string, any>;
    database?: string;
  }): Promise<ValidationResult> {
    const { memoryType, metadata } = params;

    // Get schema
    const schema = await this.getSchema(params.database);

    // If no schema, validation passes but indicate no schema exists
    if (!schema) {
      return {
        valid: true,
        errors: [],
        hasSchema: false,
        message: 'No schema defined - validation skipped'
      };
    }

    // If memoryType not in schema, validation passes but indicate type not in schema
    const typeSchema = schema.defines_types[memoryType];
    if (!typeSchema) {
      return {
        valid: true,
        errors: [],
        hasSchema: true,
        message: `memoryType '${memoryType}' not defined in schema - validation skipped`
      };
    }

    const errors: string[] = [];

    // Check required fields
    if (typeSchema.required_metadata) {
      for (const requiredField of typeSchema.required_metadata) {
        if (metadata[requiredField] === undefined || metadata[requiredField] === null) {
          errors.push(`Missing required field: metadata.${requiredField}`);
        }
      }
    }

    // Validate field types and values
    if (typeSchema.metadata_schema) {
      for (const [fieldName, fieldSchema] of Object.entries(typeSchema.metadata_schema)) {
        const value = metadata[fieldName];

        // Skip if field is optional and missing
        if (fieldSchema.optional && (value === undefined || value === null)) {
          continue;
        }

        // Skip if field is present but optional wasn't checked (for required fields)
        if (value === undefined || value === null) {
          continue; // Already caught by required_metadata check
        }

        // Type validation
        const actualType = Array.isArray(value) ? 'array' : typeof value;

        if (fieldSchema.type === 'enum') {
          if (fieldSchema.values && !fieldSchema.values.includes(value)) {
            errors.push(
              `Invalid value for metadata.${fieldName}: '${value}' ` +
              `(must be one of: ${fieldSchema.values.join(', ')})`
            );
          }
        } else if (fieldSchema.type === 'date') {
          // Validate ISO date format
          if (typeof value !== 'string' || isNaN(Date.parse(value))) {
            errors.push(`Invalid date for metadata.${fieldName}: must be ISO date string`);
          }
        } else if (fieldSchema.type === 'number') {
          if (typeof value !== 'number') {
            errors.push(`Invalid type for metadata.${fieldName}: expected number, got ${actualType}`);
          }
        } else if (fieldSchema.type === 'string') {
          if (typeof value !== 'string') {
            errors.push(`Invalid type for metadata.${fieldName}: expected string, got ${actualType}`);
          }
        } else if (fieldSchema.type === 'boolean') {
          if (typeof value !== 'boolean') {
            errors.push(`Invalid type for metadata.${fieldName}: expected boolean, got ${actualType}`);
          }
        } else if (fieldSchema.type === 'array') {
          if (!Array.isArray(value)) {
            errors.push(`Invalid type for metadata.${fieldName}: expected array, got ${actualType}`);
          }
        } else if (fieldSchema.type === 'object') {
          if (typeof value !== 'object' || Array.isArray(value)) {
            errors.push(`Invalid type for metadata.${fieldName}: expected object, got ${actualType}`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      hasSchema: true,
      message: errors.length === 0
        ? `Validated against schema for '${memoryType}'`
        : `Validation failed for '${memoryType}'`
    };
  }

  /**
   * Invalidate schema cache for a database
   * Call this when _schema_definition is updated
   */
  invalidateCache(database?: string): void {
    const dbName = database || this.driverManager.getCurrentDatabase().database;
    this.schemaCache.delete(dbName);
  }

  /**
   * Clear all cached schemas
   */
  clearCache(): void {
    this.schemaCache.clear();
  }
}
