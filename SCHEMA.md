# Schema System Overview

The MCP Neo4j Memory Server provides an optional schema validation system that enables AI agents to understand, validate, and evolve their memory structures autonomously.

## Why Use Schemas?

### 1. **Self-Validating Agents**

Agents can validate data before storing it, catching errors early and reducing wasted operations:

```javascript
// Agent checks schema conventions
memory_validate({
  memoryType: "task",
  metadata: { status: "broken" }  // ❌
})
// Response: {valid: false, errors: ["status must be one of [todo, in_progress, done]"]}

// Agent corrects and stores
memory_store({
  memories: [{
    name: "Fix login bug",
    memoryType: "task",
    metadata: { status: "todo" }  // ✅
  }]
})
```

### 2. **Zero-Shot Domain Understanding**

New agents can discover domain conventions instantly without hardcoded prompts:

```javascript
// Agent joins existing project
database_switch({ database: "codebase_knowledge" })
memory_schema()  // Returns complete schema definition

// Agent now knows:
// - Valid types: "function", "class", "module"
// - Required fields: "language", "visibility"
// - Valid relationships: "CALLS", "IMPORTS", "EXTENDS"
```

### 3. **Consistent Multi-Session Memory**

Schemas persist between conversations, ensuring consistent modeling across sessions:

- Day 1: Agent learns schema conventions
- Day 30: Different agent uses same schema → maintains consistency
- No schema drift, no conflicting conventions

### 4. **Safe Schema Evolution**

Automatic breaking change detection prevents data loss:

```javascript
memory_schema({
  schema: {
    schema_version: "2.0.0",
    defines_types: {
      "task": { ... },
      // Removed "old_task" type
    }
  }
})
// ⚠️ Error: Cannot remove memoryType 'old_task': 47 existing memories would be orphaned
```

### 5. **Multi-Domain Intelligence**

Single agent can adapt to different domains by switching databases and schemas:

```javascript
database_switch({ database: "testing" })
memory_schema()  // Returns test_suite, test_case, bug types

database_switch({ database: "research" })
memory_schema()  // Returns paper, concept, author types

// Agent adapts behavior based on discovered schema
```

### 6. **Reduced Prompt Engineering**

Schema definitions are retrieved dynamically, not embedded in prompts:

- Schema changes don't require prompt updates
- Multiple agents share same schema source of truth
- Templates provide ready-to-use patterns (testing, research, projects)

## How It Works

### The Meta-Schema Concept

The server provides a flexible **meta-schema** that can represent any domain:

```javascript
Memory {
  id: string              // Auto-generated ULID
  name: string            // Display name
  memoryType: string      // YOUR domain entity type
  metadata: JSON          // YOUR domain properties
  observations: [...]     // Narrative context
}
```

Think of it as **property graph simulation through properties**:
- `memoryType` = your custom node label
- `metadata` = your custom properties
- `relationType` = your semantic relationship types

### Optional Validation

Schemas are **completely optional**:

```javascript
// Works without schema (no validation)
memory_store({
  memories: [{ name: "Note", memoryType: "anything", metadata: {...} }]
})

// With schema (validated against conventions)
memory_schema({ schema: { defines_types: {...} } })
memory_validate({ memoryType: "task", metadata: {...} })  // Check first
memory_store({ memories: [...] })  // Store if valid
```

## Schema Templates

Ready-to-use templates for common domains:

**Design Your Own Schema**
```bash
help({ topic: "SCHEMA.design" })
```
Complete guide: Naming conventions, best practices, examples
Use when: Creating custom domain models from scratch

**Software Development**
```bash
help({ topic: "SCHEMA.project" })
```
Types: `function`, `class`, `module`, `interface`
Use for: Code knowledge graphs, dependency tracking

**QA & Testing**
```bash
help({ topic: "SCHEMA.testing" })
```
Types: `test_suite`, `test_case`, `bug`, `test_run`
Use for: Test management, bug tracking

**Research & Knowledge**
```bash
help({ topic: "SCHEMA.research" })
```
Types: `paper`, `concept`, `author`, `experiment`
Use for: Academic research, citation networks

**Task Management**
```bash
help({ topic: "SCHEMA.tasks" })
```
Types: `epic`, `task`, `milestone`, `sprint`
Use for: Project management, agile workflows

## Getting Started

### Mandatory Agent Workflow

**IMPORTANT**: Agents MUST follow this workflow before writing ANY memories:

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
// OR if no schema: { valid: true, hasSchema: false, message: "No schema defined - validation skipped" }

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

### Quick Template Start

```javascript
// Get a ready-to-use template
help({ topic: "SCHEMA.tasks" })

// Install the template schema
memory_schema({ schema: { ... copied from template ... } })

// Always validate before storing
memory_validate({ memoryType: "task", metadata: {...} })

// Then store
memory_store({ memories: [...] })
```

## Documentation

**For AI Agents:**
MCP tool: `help({ topic: "SCHEMA" })` - Complete guide to dynamic domain modeling

**For Humans:**
`src/help/SCHEMA.md` - Detailed technical documentation with examples

**Templates:**
`src/help/SCHEMA.*.md` - Ready-to-use domain schemas

## Key Benefits Summary

| Benefit | Without Schema | With Schema |
|---------|---------------|-------------|
| Validation | No validation | Pre-store validation |
| Discovery | Manual prompts | Auto-discovery |
| Consistency | Prompt-dependent | Schema-enforced |
| Evolution | No safety checks | Breaking change detection |
| Multi-domain | Single model | Per-database schemas |
| Error handling | Silent failures | Explicit errors |

## Philosophy

**Flexibility First**: The meta-schema is intentionally generic to be universally powerful. Through creative use of `memoryType`, `metadata`, and `relationType`, you can model any domain while maintaining a simple, unified interface.

**Opt-In Validation**: Schemas are optional. Start without validation, add it when consistency matters.

**Agent Autonomy**: Agents discover conventions dynamically, enabling self-correction and autonomous decision-making.

**Zero Data Loss**: Breaking change detection ensures schema evolution never orphans data accidentally.

---

**Next Steps:**
- Explore templates: `help({ topic: "SCHEMA.testing" })`
- Read detailed docs: `src/help/SCHEMA.md`
- Start storing: `memory_store({ memories: [...] })`
