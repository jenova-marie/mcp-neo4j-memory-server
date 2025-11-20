/**
 * Shared Tool Definitions for MCP Memory Server
 * Eliminates duplication between stdio and HTTP transport implementations
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ENHANCED_TOOL_DESCRIPTIONS, ENHANCED_PARAMETER_DESCRIPTIONS } from "./enhanced-tool-descriptions";
import { toMCPError } from "./infrastructure/errors";

export interface HandlerSet {
  unifiedStoreHandler: any;
  unifiedFindHandler: any;
  unifiedModifyHandler: any;
  databaseHandler: any;
  schemaHandler: any;
  helpHandler: any;
}

/**
 * Register all memory tools with enhanced descriptions
 * Used by both stdio and HTTP servers for consistency
 */
export function registerMemoryTools(server: McpServer, getHandlers: () => Promise<HandlerSet>) {
  
  // Tool 1: memory_store
  server.tool(
    "memory_store",
    ENHANCED_TOOL_DESCRIPTIONS.memory_store,
    {
      memories: z.array(z.object({
        name: z.string().describe(ENHANCED_PARAMETER_DESCRIPTIONS["memories.name"]),
        memoryType: z.string().describe(ENHANCED_PARAMETER_DESCRIPTIONS["memories.memoryType"]),
        localId: z.string().optional().describe(ENHANCED_PARAMETER_DESCRIPTIONS["memories.localId"]),
        observations: z.array(z.string()).describe(ENHANCED_PARAMETER_DESCRIPTIONS["memories.observations"]),
        metadata: z.record(z.any()).optional().describe(ENHANCED_PARAMETER_DESCRIPTIONS["memories.metadata"])
      })).describe(ENHANCED_PARAMETER_DESCRIPTIONS.memories),      relations: z.array(z.object({
        from: z.string().describe("Source localId or existing memoryId"),
        to: z.string().describe("Target localId or existing memoryId"),
        type: z.string().describe("Relationship type: INFLUENCES, DEPENDS_ON, EXTENDS, IMPLEMENTS, CONTAINS, etc."),
        strength: z.number().min(0.1).max(1.0).optional().describe("0.1-1.0, defaults to 0.5"),
        source: z.enum(['agent', 'user', 'system']).optional().describe("defaults to 'agent'")
      })).optional().describe(ENHANCED_PARAMETER_DESCRIPTIONS.relations),
      options: z.object({
        validateReferences: z.boolean().optional().describe("Check all target IDs exist (default: true)"),
        allowDuplicateRelations: z.boolean().optional().describe("Skip/error on duplicates (default: false)"),
        transactional: z.boolean().optional().describe("All-or-nothing behavior (default: true)"),
        maxMemories: z.number().optional().describe("Batch size limit per request (default: 50)"),
        maxRelations: z.number().optional().describe("Relations limit per request (default: 200)")
      }).optional().describe("Store options")
    },
    async (args) => {
      try {
        const { unifiedStoreHandler } = await getHandlers();
        const result = await unifiedStoreHandler.handleMemoryStore(args);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      } catch (error) {
        throw toMCPError(error);
      }
    }
  );

  // Tool 2: memory_find
  server.tool(
    "memory_find",
    ENHANCED_TOOL_DESCRIPTIONS.memory_find,
    {
      query: z.union([z.string(), z.array(z.string())]).describe(ENHANCED_PARAMETER_DESCRIPTIONS.query),
      limit: z.number().optional().describe(ENHANCED_PARAMETER_DESCRIPTIONS.limit),
      memoryTypes: z.array(z.string()).optional().describe(ENHANCED_PARAMETER_DESCRIPTIONS.memoryTypes),
      includeContext: z.enum(["minimal", "full", "relations-only"]).optional().describe(ENHANCED_PARAMETER_DESCRIPTIONS.includeContext),
      threshold: z.number().min(0.01).max(1.0).optional().describe(ENHANCED_PARAMETER_DESCRIPTIONS.threshold),
      orderBy: z.enum(["relevance", "created", "modified", "accessed"]).optional().describe("Sort order (default: 'relevance')"),
      
      // Date-based filtering
      createdAfter: z.string().optional().describe(ENHANCED_PARAMETER_DESCRIPTIONS.createdAfter),
      createdBefore: z.string().optional().describe("ISO date or relative"),
      modifiedSince: z.string().optional().describe("ISO date or relative"),
      accessedSince: z.string().optional().describe("ISO date or relative"),
      
      // Graph traversal
      traverseFrom: z.string().optional().describe(ENHANCED_PARAMETER_DESCRIPTIONS.traverseFrom),
      traverseRelations: z.array(z.string()).optional().describe(ENHANCED_PARAMETER_DESCRIPTIONS.traverseRelations),
      maxDepth: z.number().min(1).max(5).optional().describe(ENHANCED_PARAMETER_DESCRIPTIONS.maxDepth),
      traverseDirection: z.enum(["outbound", "inbound", "both"]).optional().describe("Traversal direction (default: 'both')")
    },
    async (args) => {
      try {
        const { unifiedFindHandler } = await getHandlers();
        const result = await unifiedFindHandler.handleMemoryFind(args);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      } catch (error) {
        throw toMCPError(error);
      }
    }
  );

  // Tool 3: memory_modify
  server.tool(
    "memory_modify",
    ENHANCED_TOOL_DESCRIPTIONS.memory_modify,
    {
      operation: z.enum([
        "update", "delete", "batch-delete",
        "add-observations", "delete-observations", 
        "create-relations", "update-relations", "delete-relations"
      ]).describe(ENHANCED_PARAMETER_DESCRIPTIONS.operation),
      target: z.string().optional().describe(ENHANCED_PARAMETER_DESCRIPTIONS.target),
      targets: z.array(z.string()).optional().describe("Multiple IDs for batch operations"),
      changes: z.object({
        name: z.string().optional().describe("New memory name"),
        memoryType: z.string().optional().describe("New memory type"),
        metadata: z.record(z.any()).optional().describe("New metadata (replaces existing)")
      }).optional().describe(ENHANCED_PARAMETER_DESCRIPTIONS.changes),
      observations: z.array(z.object({
        memoryId: z.string().describe("Target memory ID"),
        contents: z.array(z.string()).describe(ENHANCED_PARAMETER_DESCRIPTIONS["observations.contents"])
      })).optional().describe(ENHANCED_PARAMETER_DESCRIPTIONS.observations),
      relations: z.array(z.object({
        from: z.string().describe("Source memory ID"),
        to: z.string().describe("Target memory ID"),
        type: z.string().describe("Relationship type: INFLUENCES, DEPENDS_ON, EXTENDS, IMPLEMENTS, CONTAINS, etc."),
        strength: z.number().min(0.1).max(1.0).optional().describe("For create/update operations (0.1-1.0)"),
        source: z.enum(['agent', 'user', 'system']).optional().describe("For create operations")
      })).optional().describe("Relationships to create/update/delete between existing memories."),
      options: z.object({
        cascadeDelete: z.boolean().optional().describe("Delete related observations/relations (default: true)"),
        validateObservationIds: z.boolean().optional().describe("Validate observation IDs for delete (default: true)"),
        createIfNotExists: z.boolean().optional().describe("For database operations")
      }).optional().describe("Modify options")
    },
    async (args) => {
      try {
        const { unifiedModifyHandler } = await getHandlers();
        const result = await unifiedModifyHandler.handleMemoryModify(args);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      } catch (error) {
        throw toMCPError(error);
      }
    }
  );

  // Tool 4: database_switch
  server.tool(
    "database_switch",
    ENHANCED_TOOL_DESCRIPTIONS.database_switch,
    {
      databaseName: z.string().describe(ENHANCED_PARAMETER_DESCRIPTIONS.databaseName)
    },
    async (args) => {
      try {
        const { databaseHandler } = await getHandlers();
        const result = await databaseHandler.handleDatabaseSwitch(args.databaseName);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      } catch (error) {
        throw toMCPError(error);
      }
    }
  );

  // Tool 5: memory_schema (GET/PUT)
  server.tool(
    "memory_schema",
    ENHANCED_TOOL_DESCRIPTIONS.memory_schema,
    {
      schema: z.object({
        schema_version: z.string(),
        domain: z.string().optional(),
        defines_types: z.record(z.any()),
        defines_relations: z.record(z.any()).optional()
      }).optional().describe("Schema definition to store. Omit to retrieve current schema."),
      force: z.boolean().optional().describe("Force update even with breaking changes (default: false)")
    },
    async (args) => {
      try {
        const { schemaHandler } = await getHandlers();
        const result = await schemaHandler.handleSchemaOperation({
          schema: args.schema,
          force: args.force
        });

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      } catch (error) {
        throw toMCPError(error);
      }
    }
  );

  // Tool 6: memory_validate
  server.tool(
    "memory_validate",
    ENHANCED_TOOL_DESCRIPTIONS.memory_validate,
    {
      memoryType: z.string().describe("Memory type to validate"),
      metadata: z.record(z.any()).describe("Metadata object to validate against schema"),
      database: z.string().optional().describe("Optional database name (defaults to current database)")
    },
    async (args) => {
      try {
        const { schemaHandler } = await getHandlers();
        const result = await schemaHandler.handleValidate({
          memoryType: args.memoryType,
          metadata: args.metadata,
          database: args.database
        });

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      } catch (error) {
        throw toMCPError(error);
      }
    }
  );

  // Tool 7: help
  server.tool(
    "help",
    "Get help documentation for the memory server. Topics: SCHEMA (concepts), design, project, testing, research, tasks",
    {
      topic: z.string().optional().default("SCHEMA").describe("Help topic (design, project, testing, research, tasks)")
    },
    async (args) => {
      try {
        const { helpHandler } = await getHandlers();
        const result = await helpHandler.handleHelp(args.topic);

        return {
          content: [{
            type: "text",
            text: result.content,
          }],
        };
      } catch (error) {
        throw toMCPError(error);
      }
    }
  );

  // Tool 8: init
  server.tool(
    "init",
    `A comprehensive onboarding tool for agents working with the MCP Neo4j Memory Server.
This tool provides essential guidance for setting up and using persistent memory with schema-aware validation.
Helps agents understand the mandatory workflow, schema system, and best practices for consistent memory operations.

When to use this tool:
- First time working with this memory server
- Starting a new project or switching databases
- Need to understand the schema validation workflow
- Unclear about which tools to use and when
- Want to discover existing domain conventions
- Setting up a new domain model from scratch
- Need guidance on memory types and relationships
- Unsure how to validate data before storing

Key features of this memory server:
- **Schema-aware validation**: Discover and validate against domain schemas automatically
- **Multi-database support**: Isolate different projects/domains in separate databases
- **Graph relationships**: Model complex connections between memories with typed relations
- **Semantic search**: Vector-based similarity search on names and observations
- **Local IDs**: Create and relate multiple memories in a single transaction
- **Breaking change detection**: Safely evolve schemas without orphaning data
- **Ready-to-use templates**: Pre-built schemas for software, testing, research, and tasks
- **Batch operations**: Store, find, and modify multiple memories efficiently

You should follow this mandatory workflow:
1. **Switch database** - Call database_switch({ databaseName: "project_name" }) to set context
2. **Discover schema** - ALWAYS call memory_schema() first to see if conventions exist
3. **Review or create schema** - Use help({ topic: "tasks" }) for templates or create custom
4. **Validate before storing** - ALWAYS call memory_validate() before memory_store()
5. **Store with confidence** - Use memory_store() after validation passes
6. **Query effectively** - Use memory_find() with semantic, exact, or graph traversal
7. **Update as needed** - Use memory_modify() for updates, deletions, observations, relations

Why this workflow matters:
- ✅ Schema discovery prevents you from guessing conventions - you discover them dynamically
- ✅ Validation catches errors early - saves tokens and prevents inconsistent data
- ✅ Templates provide instant setup - no need to design schemas from scratch
- ✅ Breaking change detection protects data - you won't accidentally orphan memories
- ✅ Multi-step operations are atomic - create memories and relations in one call
- ❌ Skipping validation = potential data inconsistency and query failures
- ❌ Not checking schema first = missing existing conventions

Quick start example:
1. database_switch({ databaseName: "my_project" })
2. memory_schema() // Check if schema exists
3. If no schema: help({ topic: "tasks" }) // Get template
4. memory_schema({ schema: {...} }) // Install schema
5. memory_validate({ memoryType: "task", metadata: {...} }) // Validate first!
6. memory_store({ memories: [...], relations: [...] }) // Store after validation
7. memory_find({ query: "..." }) // Query your memories

Available templates:
- help({ topic: "project" }) - Software development (classes, functions, modules)
- help({ topic: "testing" }) - QA workflows (test suites, bugs, test runs)
- help({ topic: "research" }) - Academic research (papers, authors, citations)
- help({ topic: "tasks" }) - Project management (epics, tasks, sprints)
- help({ topic: "design" }) - Custom schema design guide

Best practices:
1. Always call memory_schema() before any memory operations
2. Always validate with memory_validate() before storing
3. Use localIds when creating multiple related memories in one call
4. Use observations for narrative context, metadata for structured properties
5. Use semantic memoryType names (lowercase_with_underscores)
6. Use semantic relationTypes (UPPERCASE_WITH_UNDERSCORES)
7. Leverage templates - don't design schemas from scratch unless necessary
8. Check validation.hasSchema to know if conventions exist
9. Add observations when updating status for audit trail
10. Use separate databases for completely different domains

This tool returns this guidance text. For detailed schema documentation, call help({ topic: "SCHEMA" }).`,
    {},
    async () => {
      return {
        content: [{
          type: "text",
          text: `# MCP Neo4j Memory Server - Getting Started

## Mandatory Workflow

**⚠️ IMPORTANT**: Follow these steps for every memory operation:

### 1. Switch Database
\`\`\`
database_switch({ databaseName: "my_project" })
\`\`\`

### 2. Discover Schema (MANDATORY)
\`\`\`
memory_schema()
// Returns: { database: "my_project", schema: {...} or null, hasSchema: true/false }
\`\`\`

### 3. Validate Before Storing (MANDATORY)
\`\`\`
memory_validate({
  memoryType: "task",
  metadata: { status: "todo", priority: "high" }
})
// Returns: { valid: true/false, errors: [], hasSchema: true/false }
\`\`\`

### 4. Store After Validation
\`\`\`
memory_store({
  memories: [{
    name: "Complete authentication",
    memoryType: "task",
    localId: "task1",
    metadata: { status: "todo", priority: "high" },
    observations: ["OAuth2 + JWT implementation"]
  }],
  relations: []
})
\`\`\`

## Available Templates

Get instant schemas with examples:
- \`help({ topic: "project" })\` - Software development
- \`help({ topic: "testing" })\` - QA & testing
- \`help({ topic: "research" })\` - Academic research
- \`help({ topic: "tasks" })\` - Task management
- \`help({ topic: "design" })\` - Custom design guide

## 7 Tools Available

1. **memory_store** - Create memories and relations
2. **memory_find** - Search (semantic, exact, graph)
3. **memory_modify** - Update, delete, add observations
4. **database_switch** - Change active database
5. **memory_schema** - Get/set schema definitions
6. **memory_validate** - Validate before storing
7. **help** - Get documentation

## Why This Workflow?

✅ Schema discovery = no guessing conventions
✅ Validation = catch errors early, save tokens
✅ Templates = instant setup, proven patterns
✅ LocalIds = create + relate in one call
❌ Skip validation = inconsistent data
❌ Skip schema check = miss existing conventions

## Next Steps

For detailed documentation:
\`\`\`
help({ topic: "SCHEMA" })
\`\`\`

For ready-to-use templates:
\`\`\`
help({ topic: "tasks" })
\`\`\`
`,
        }],
      };
    }
  );
}
