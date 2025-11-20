# Memory Schema Guide: Dynamic Domain Modeling

> **Audience**: This guide is designed for both AI agents and human developers working with the MCP Neo4j Memory Server.
>
> **For AI Agents**: Use this guide to understand schema conventions, validate data before storage, and discover domain models dynamically.
>
> **For Humans**: This provides technical details on schema design, validation workflows, and best practices.

A comprehensive guide to modeling domain-specific data using the MCP Neo4j Memory Server's flexible meta-schema system.

---

## Why Use Schemas?

### Agent Benefits

**Self-Validation**: Agents can validate data before storing, catching errors early:
- Call `memory_validate()` before `memory_store()` to check conformance
- Get specific error messages instead of silent failures
- Reduce wasted operations and token usage on invalid data

**Discovery**: New agents can understand existing domains instantly:
- Call `memory_schema()` to discover memoryTypes, required fields, and relationship types
- No need to embed schema rules in system prompts
- Adapt behavior based on discovered conventions

**Consistency**: Schemas persist across sessions and agents:
- Multiple agents share the same schema source of truth
- No schema drift between conversations
- Maintain modeling consistency over time

### Human Benefits

**Documentation**: Schemas serve as living documentation:
- Self-describing domain models
- Field descriptions explain intent and constraints
- Relationship types document semantic connections

**Safety**: Breaking change detection prevents data loss:
- Automatic checks for removed types that would orphan data
- Force flag for intentional breaking changes
- Version tracking for schema evolution

**Templates**: Ready-to-use patterns for common domains:
- Software development, testing, research, task management
- Copy-paste schemas with examples and query patterns
- Faster onboarding for new projects

---

## Quick Start

**Do I need a schema?**
- **Schemas are optional** - The server works without validation
- **Validation is best practice** - Always check schema before writing

### Mandatory Agent Workflow

**⚠️ IMPORTANT FOR AI AGENTS**: You MUST follow this workflow before writing ANY memories:

```javascript
// Step 1: Switch to your database
database_switch({ databaseName: "my_project" })

// Step 2: Get existing schema (MANDATORY - always call this first!)
memory_schema()
// Returns: { database: "my_project", schema: {...} or null, hasSchema: true/false }

// Step 3: If no schema exists, optionally create one
memory_schema({
  schema: {
    schema_version: "1.0.0",
    domain: "my_domain",
    defines_types: {
      "task": {
        description: "Work items",
        required_metadata: ["status"],
        metadata_schema: {
          "status": {
            type: "enum",
            values: ["todo", "in_progress", "done"]
          }
        }
      }
    },
    defines_relations: {
      "DEPENDS_ON": {
        description: "Blocking dependency"
      }
    }
  }
})

// Step 4: Validate BEFORE storing (MANDATORY if schema exists!)
memory_validate({
  memoryType: "task",
  metadata: { status: "todo", priority: "high" }
})
// Returns: {
//   valid: true,
//   errors: [],
//   hasSchema: true,
//   message: "Validated against schema for 'task'"
// }

// Step 5: Store memories (only after validation passes)
memory_store({
  memories: [{
    name: "My First Memory",
    memoryType: "task",
    metadata: { status: "todo", priority: "high" },
    observations: ["This is a test"]
  }]
})

// Step 6: Query memories
memory_find({ query: "test" })
```

### Why This Workflow Matters

**For Agents:**
- ✅ `memory_schema()` discovers existing conventions - don't guess!
- ✅ `memory_validate()` catches errors before writing - save tokens!
- ✅ Invalid data fails validation, not storage - explicit errors!
- ❌ Skipping validation = inconsistent data = query failures!

**Need a template?** See [Schema Templates](#schema-templates) section below.

---

## The Meta-Schema Concept

The Memory Server provides a **meta-schema** - a generic structure that can represent any specific domain model through three flexible dimensions:

1. **`memoryType`** - Acts as your custom node label/entity type
2. **`metadata`** - Contains all domain-specific properties (nested objects, arrays, any JSON)
3. **`relationType`** (in relations) - Defines semantic relationship types between entities

Think of it as a **property graph that simulates a labeled property graph** through properties rather than rigid schema definitions.

**Key Insight:** You're not locked into predefined types. Every `memoryType` you use creates a new entity type in your domain model. Every `relationType` creates a new relationship semantic.

---

## Core Schema Structure

```
Memory Node {
  id: string (ULID, 18 chars)           // Auto-generated unique identifier
  name: string                          // Primary display name
  memoryType: string                    // YOUR domain entity type
  metadata: JSON                        // YOUR domain-specific properties
  createdAt: ISO datetime
  modifiedAt: ISO datetime
  lastAccessed: ISO datetime
  nameEmbedding: vector[384]            // For semantic search on name
}

Observation Node {
  id: string (ULID, 18 chars)
  content: string                       // Text content/notes
  createdAt: ISO datetime
  embedding: vector[384]                // For semantic search on content
}

Relationships:
- (Memory)-[:HAS_OBSERVATION]->(Observation)
- (Memory)-[:RELATES_TO {relationType, strength, source, createdAt}]->(Memory)
```

**When to use what:**
- **name** - Primary identifier (indexed, searchable by vector similarity)
- **memoryType** - Entity type (indexed, fast filtering)
- **metadata** - Structured properties (JSON, fulltext indexed)
- **observations** - Narrative context, notes, updates (vector searchable)
- **relations** - Connections between memories with semantic types

---

## Designing Your Domain Model

**Want to design your own schema?** Use the comprehensive design guide:

```javascript
help({ topic: "design" })
```

**Quick summary:**
1. **Define Entity Types** - Choose semantic `memoryType` values (lowercase_with_underscores)
2. **Design Metadata** - Required fields, enums, type appropriately
3. **Define Relationships** - Semantic `relationType` values (UPPERCASE_WITH_UNDERSCORES)

**Or start with a template** - See [Schema Templates](#schema-templates) below for ready-to-use schemas.

---

## Managing Schemas

### GET: Retrieve Current Schema

```
memory_schema()
```

Returns:
```json
{
  "database": "my_project",
  "schema": { ... } or null,
  "hasSchema": true/false
}
```

### PUT: Store New Schema

```
memory_schema({
  schema: {
    "schema_version": "1.0.0",
    "domain": "my_domain",
    "defines_types": {
      "task": {
        "description": "Individual work items",
        "required_metadata": ["status", "priority"],
        "metadata_schema": {
          "status": {
            "type": "enum",
            "values": ["todo", "in_progress", "done"]
          },
          "priority": {
            "type": "enum",
            "values": ["low", "medium", "high"]
          }
        }
      }
    },
    "defines_relations": {
      "DEPENDS_ON": {
        "from_types": ["task"],
        "to_types": ["task"],
        "description": "Task has blocking dependency"
      }
    }
  }
})
```

**Auto-Versioning:**
- If you provide `schema_version` >= current: uses yours
- Otherwise: auto-bumps minor version (1.2.0 → 1.3.0)
- Automatically adds `last_updated` timestamp

**Breaking Change Detection:**
The server validates that your schema update won't orphan existing data:
- ✅ **Checks**: Removed memoryTypes, removed relationTypes
- ❌ **Skips**: Enum values, required fields, directions (too expensive)

If breaking changes detected:
```json
{
  "error": "Breaking changes detected. Use force=true to override.",
  "breakingChanges": [
    {
      "type": "removed_type",
      "message": "Cannot remove memoryType 'old_task': 47 existing memories would be orphaned",
      "affectedCount": 47
    }
  ]
}
```

### Force Update

```
memory_schema({
  schema: { ... },
  force: true  // Override breaking change warnings
})
```

---

## Schema Evolution

### Safe Changes (No Breaking Changes)

✅ **Adding new types** - Safe, doesn't affect existing data
✅ **Adding new optional fields** - Safe, validation handles missing fields
✅ **Adding new relationships** - Safe, doesn't affect existing relations
✅ **Expanding enum values** - Safe, adds more options

### Breaking Changes (Orphans Data)

⚠️ **Removing memoryTypes** - Orphans all memories of that type
⚠️ **Removing relationTypes** - Orphans all relations of that type

**Migration Strategy:**
1. Check what would break: `memory_schema({ schema: newSchema })`
2. If errors, fix data first:
   - Rename memories: `memory_modify({ operation: "update", ... })`
   - Delete obsolete data: `memory_modify({ operation: "delete", ... })`
3. Retry schema update
4. OR force: `memory_schema({ schema: newSchema, force: true })`

**Versioning Best Practices:**
- Increment **major** version for breaking changes (1.0.0 → 2.0.0)
- Increment **minor** version for new features (1.2.0 → 1.3.0)
- Increment **patch** version for fixes (1.2.3 → 1.2.4)

---

## Troubleshooting

### Error: "Breaking changes detected"

**Cause:** You removed a memoryType or relationType that has existing data.

**Solutions:**
1. **Migrate data first** - Rename or delete existing memories/relations
2. **Force update** - `memory_schema({ schema: {...}, force: true })`
3. **Rename instead of remove** - Keep type, mark as deprecated in description

### Error: "Invalid schema structure"

**Cause:** Schema doesn't match required format.

**Check:**
- `schema_version` is a string (e.g., `"1.0.0"`)
- `defines_types` is an object (not array)
- `defines_relations` is an object (if provided)
- `metadata_schema` uses valid types: string, number, boolean, array, object, date, enum

### Validation always passes?

**Cause:** No schema defined OR memoryType not in schema.

**Check validation response:**
```javascript
const result = memory_validate({
  memoryType: "task",
  metadata: { status: "todo" }
})

// Result shows schema status:
// { valid: true, hasSchema: false, message: "No schema defined - validation skipped" }
// OR
// { valid: true, hasSchema: true, message: "memoryType 'task' not defined in schema - validation skipped" }
```

**Fix:**
1. **No schema**: Create one using `memory_schema({ schema: {...} })`
2. **Type not in schema**: Add the memoryType to your schema's `defines_types`

### Schema not applying to existing data?

**Expected behavior:** Schemas only validate NEW data.

Existing data remains unchanged. Invalid data won't break queries, just fails future validation.

---

## Performance Considerations

### Indexed Fields (Fast Queries)

These are automatically indexed:
- `memoryType` - Use for filtering by type
- `createdAt` - Fast temporal queries
- `RELATES_TO.relationType` - Fast relationship filtering
- `RELATES_TO.strength` - Filter by strength
- `RELATES_TO.source` - Filter by source

### Vector Search (Semantic)

Automatically embedded for similarity search:
- `name` - 384-dimensional vector embedding
- Observation `content` - 384-dimensional vector embedding

Use semantic queries:
```
memory_find({
  query: "authentication security token",
  memoryTypes: ["function"]
})
```

### Metadata Queries (Fulltext)

Metadata is JSON string with fulltext index. Search works across all fields:
```
memory_find({
  query: "status:done priority:high",
  memoryTypes: ["task"]
})
```

**Optimization:** For frequently filtered metadata fields, consider promoting to observations for better vector search.

---

## Schema Templates

Ready-to-use schema templates for common domains. Each template includes:
- Complete schema definition
- Example data
- Common query patterns

### Design Your Own

**Custom Domain Schema Design**
```
help({ topic: "design" })
```
- Step-by-step design guide
- Naming conventions
- Best practices
- Complete examples

### Available Templates

**Software Development**
```
help({ topic: "project" })
```
- Types: `function`, `class`, `module`, `package`, `interface`
- Relations: `CALLS`, `IMPORTS`, `EXTENDS`, `IMPLEMENTS`, `CONTAINS`
- Use for: Code knowledge graphs, dependency tracking, architecture modeling

**QA & Testing**
```
help({ topic: "testing" })
```
- Types: `test_suite`, `test_case`, `bug`, `test_run`
- Relations: `PART_OF`, `FOUND`, `BLOCKS`, `COVERS`
- Use for: Test management, bug tracking, coverage analysis

**Research & Knowledge**
```
help({ topic: "research" })
```
- Types: `paper`, `concept`, `author`, `institution`, `experiment`
- Relations: `CITES`, `BUILDS_ON`, `AUTHORED_BY`, `INTRODUCES`, `USES`
- Use for: Academic research, citation networks, knowledge graphs

**Task Management**
```
help({ topic: "tasks" })
```
- Types: `epic`, `task`, `subtask`, `milestone`, `sprint`
- Relations: `PART_OF`, `DEPENDS_ON`, `BLOCKS`, `ASSIGNED_TO`
- Use for: Project management, agile workflows, roadmap planning

---

## Best Practices

### 1. Consistent Naming

- **memoryTypes**: lowercase_with_underscores
- **relationTypes**: UPPERCASE_WITH_UNDERSCORES
- **metadata fields**: camelCase or snake_case (pick one, be consistent)

### 2. Observations vs Metadata

**Use metadata for:**
- Structured, filterable properties
- Enum values
- Dates, numbers, booleans
- Tags, categories

**Use observations for:**
- Narrative context
- Timestamped notes
- Long-form explanations
- Things that should be semantically searchable

### 3. LocalIds for Batch Operations

When storing multiple memories with relations in one call, use `localId`:

```
memory_store({
  memories: [
    { name: "Task A", memoryType: "task", localId: "task_a", ... },
    { name: "Task B", memoryType: "task", localId: "task_b", ... }
  ],
  relations: [
    { from: "task_b", to: "task_a", type: "DEPENDS_ON" }
  ]
})
```

### 4. Multi-Database Isolation

Use separate databases for completely separate domains:

```
database_switch({ database: "codebase_knowledge" })
database_switch({ database: "project_management" })
database_switch({ database: "research_papers" })
```

### 5. Schema Validation Workflow (MANDATORY FOR AGENTS)

**⚠️ AI Agents: This is NOT optional - follow this pattern for every memory operation:**

```javascript
// Step 1: ALWAYS retrieve schema first (discover conventions)
const schemaResult = memory_schema()
// Returns: { database: "current_db", schema: {...} or null, hasSchema: boolean }

// Step 2: ALWAYS validate before storing (catch errors early)
const validation = memory_validate({
  memoryType: "task",
  metadata: { status: "done", priority: "high" }
})
// Returns: {
//   valid: true/false,
//   errors: [],
//   hasSchema: true/false,
//   message: "Validated against schema for 'task'" OR "No schema defined - validation skipped"
// }

// Step 3: Check validation result and respond accordingly
if (!validation.hasSchema) {
  // No schema exists - consider creating one
  console.log(validation.message) // "No schema defined - validation skipped"
  // Optionally: create schema first
} else if (!validation.valid) {
  // Schema exists but validation failed
  console.log("Validation errors:", validation.errors)
  // Fix errors and retry validation
} else {
  // Validation passed - safe to store
  memory_store({
    memories: [{
      name: "Complete API refactor",
      memoryType: "task",
      metadata: { status: "done", priority: "high" },
      observations: ["Refactored authentication endpoints"]
    }]
  })
}
```

**Why this matters:**
- **hasSchema=true**: You know a schema exists and you're conforming to it
- **hasSchema=false**: You discover no schema exists - consider creating one
- **valid=true + hasSchema=true**: Data conforms to schema - safe to store
- **valid=false**: You catch errors BEFORE wasting a store operation
- **message field**: Clear explanation of validation result
- Token efficiency: Validation is fast, failed stores are expensive

---

## Conclusion

The Memory Server's meta-schema is **intentionally generic to be universally powerful**. Through creative use of `memoryType`, `metadata`, and `relationType`, you can model any domain while maintaining a simple, unified interface.

### Key Takeaways

**For AI Agents:**
1. Call `memory_schema()` to discover domain conventions dynamically
2. Use `memory_validate()` before `memory_store()` to catch errors early
3. Leverage templates for instant domain understanding
4. Adapt behavior based on discovered schema rules

**For Humans:**
1. Schemas are **optional** - validation is opt-in, flexibility is default
2. Use **templates** for quick starts - don't design from scratch
3. **Breaking changes** are checked automatically - you won't orphan data
4. **Evolution is natural** - add types/fields as needed without migrations

### Why This Matters

The schema system enables **agent autonomy**:
- Agents self-validate, reducing errors and wasted operations
- Agents discover conventions, eliminating hardcoded prompts
- Agents adapt to multiple domains by switching databases
- Agents evolve schemas safely with breaking change detection

The result: **Intelligent, self-correcting memory systems** that maintain consistency across sessions, agents, and domains.

### Next Steps

**For AI Agents:**
```javascript
// Discover domain
memory_schema()

// Validate before storing
memory_validate({ memoryType: "task", metadata: {...} })

// Store with confidence
memory_store({ memories: [...] })
```

**For Humans:**
- Read overview: `/SCHEMA.md` in repository root
- Explore [Schema Templates](#schema-templates) for your domain
- Copy-paste from template docs for instant setup

**Templates Available:**
- Software: `help({ topic: "project" })`
- Testing: `help({ topic: "testing" })`
- Research: `help({ topic: "research" })`
- Tasks: `help({ topic: "tasks" })`
