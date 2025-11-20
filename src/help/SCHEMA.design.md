# Domain Model Design Guide

A comprehensive guide to designing effective domain models using the Memory Server's flexible meta-schema system.

---

## Overview

The Memory Server provides a **meta-schema** - a generic structure that can represent any specific domain model through three flexible dimensions:

1. **`memoryType`** - Acts as your custom node label/entity type
2. **`metadata`** - Contains all domain-specific properties (nested objects, arrays, any JSON)
3. **`relationType`** (in relations) - Defines semantic relationship types between entities

**Key Insight:** You're not locked into predefined types. Every `memoryType` you use creates a new entity type in your domain model. Every `relationType` creates a new relationship semantic.

---

## Step 1: Define Your Entity Types (memoryType)

Choose clear, semantic entity types for your domain.

### Naming Convention

**Use lowercase with underscores**

✅ **Good:**
- `"feature_request"`
- `"user_story"`
- `"test_case"`
- `"api_endpoint"`

❌ **Avoid:**
- `"FeatureRequest"` (PascalCase)
- `"FEATURE_REQUEST"` (SCREAMING_CASE)
- `"featureRequest"` (camelCase)

### Common Patterns by Domain

**Code Domain:**
- `"function"` - Individual functions/methods
- `"class"` - Classes or types
- `"module"` - Source files or modules
- `"interface"` - Interfaces or protocols
- `"package"` - Libraries or packages

**Task Management:**
- `"epic"` - Large initiatives
- `"task"` - Individual work items
- `"bug"` - Defects or issues
- `"milestone"` - Project milestones
- `"sprint"` - Time-boxed iterations

**Research:**
- `"paper"` - Academic papers
- `"concept"` - Theoretical concepts
- `"author"` - Researchers
- `"experiment"` - Experimental work
- `"dataset"` - Research datasets

**Business:**
- `"company"` - Organizations
- `"person"` - Individuals
- `"opportunity"` - Sales opportunities
- `"contract"` - Agreements
- `"meeting"` - Meetings or events

### Design Tips

1. **Be Specific**: `"api_endpoint"` is better than `"endpoint"`
2. **Use Nouns**: Entity types are things, not actions
3. **Singular Form**: `"task"` not `"tasks"`
4. **Domain Language**: Use terms your domain experts use
5. **Consistency**: Pick one naming style and stick with it

---

## Step 2: Design Your Metadata Schemas

Define consistent metadata structures for each memoryType.

### Design Principles

1. **Required vs Optional** - Mark truly required fields
   - Only make fields required if they're essential
   - Optional fields provide flexibility

2. **Use Enums** - For fields with fixed values
   - `status`, `priority`, `severity`, `type`
   - Prevents typos and ensures consistency

3. **Type Appropriately** - Choose the right type
   - `string` - Text values
   - `number` - Numeric values
   - `boolean` - True/false flags
   - `array` - Lists of values
   - `object` - Nested structures
   - `date` - ISO 8601 datetime strings
   - `enum` - Fixed set of values

4. **Stay Flat** - Avoid deep nesting when possible
   - Flat structures are easier to query
   - Use separate memory types instead of deep nesting

### Example: Task Management

For `"task"` memoryType:

**Required Fields:**
- `status` - Current state
- `priority` - Importance level

**Optional Fields:**
- `assignee` - Who's working on it
- `dueDate` - When it's due
- `tags` - Categorization
- `estimatedHours` - Effort estimate

**Type Definitions:**
```javascript
{
  "status": {
    "type": "enum",
    "values": ["todo", "in_progress", "done", "blocked"],
    "description": "Current task state"
  },
  "priority": {
    "type": "enum",
    "values": ["low", "medium", "high", "critical"],
    "description": "Task importance"
  },
  "assignee": {
    "type": "string",
    "optional": true,
    "description": "Person assigned to task"
  },
  "dueDate": {
    "type": "date",
    "optional": true,
    "description": "Target completion date (ISO 8601)"
  },
  "tags": {
    "type": "array",
    "optional": true,
    "description": "Category tags for filtering"
  },
  "estimatedHours": {
    "type": "number",
    "optional": true,
    "description": "Estimated effort in hours"
  }
}
```

### Example: Software Components

For `"function"` memoryType:

**Required Fields:**
- `language` - Programming language
- `visibility` - Public/private/protected

**Optional Fields:**
- `parameters` - Function parameters
- `returnType` - Return type
- `complexity` - Cyclomatic complexity
- `lineCount` - Lines of code

**Type Definitions:**
```javascript
{
  "language": {
    "type": "enum",
    "values": ["typescript", "javascript", "python", "java", "go", "rust"],
    "description": "Programming language"
  },
  "visibility": {
    "type": "enum",
    "values": ["public", "private", "protected", "internal"],
    "description": "Access modifier"
  },
  "parameters": {
    "type": "array",
    "optional": true,
    "description": "Function parameters with types"
  },
  "returnType": {
    "type": "string",
    "optional": true,
    "description": "Return type annotation"
  },
  "complexity": {
    "type": "number",
    "optional": true,
    "description": "Cyclomatic complexity score"
  },
  "lineCount": {
    "type": "number",
    "optional": true,
    "description": "Total lines of code"
  }
}
```

---

## Step 3: Define Relationship Semantics (relationType)

Use meaningful relationship types that express the semantics of connections.

### Naming Convention

**Use UPPERCASE with underscores**

✅ **Good:**
- `"DEPENDS_ON"`
- `"PART_OF"`
- `"IMPLEMENTS"`
- `"CALLS"`

❌ **Avoid:**
- `"depends_on"` (lowercase)
- `"DependsOn"` (PascalCase)
- `"dependsOn"` (camelCase)

### Common Patterns by Category

**Hierarchy Relationships:**
- `"PART_OF"` - Component of a larger whole
- `"CONTAINS"` - Inverse of PART_OF
- `"CHILD_OF"` - Parent-child hierarchy
- `"BELONGS_TO"` - Membership or ownership

**Dependency Relationships:**
- `"DEPENDS_ON"` - Requires another component
- `"BLOCKS"` - Prevents progress on another item
- `"REQUIRES"` - Prerequisite relationship
- `"USES"` - Utilizes another component

**Association Relationships:**
- `"RELATES_TO"` - Generic connection
- `"ASSOCIATED_WITH"` - Related entities
- `"LINKED_TO"` - Cross-reference
- `"REFERENCES"` - Points to another entity

**Semantic Relationships (Code):**
- `"IMPLEMENTS"` - Implements an interface
- `"EXTENDS"` - Inherits from a class
- `"CALLS"` - Function invocation
- `"IMPORTS"` - Module import
- `"EXPORTS"` - Module export

**Semantic Relationships (Research):**
- `"CITES"` - Paper citation
- `"BUILDS_ON"` - Extends previous work
- `"AUTHORED_BY"` - Authorship
- `"INTRODUCES"` - Introduces a concept
- `"VALIDATES"` - Validates a hypothesis

### Relationship Strength (0.1-1.0)

Use strength to indicate importance or coupling:

- **`1.0`** - Critical/blocking dependency
  - Example: Function CALLS another function in every code path

- **`0.7`** - Strong relationship
  - Example: Class IMPLEMENTS an interface

- **`0.5`** - Moderate connection (default)
  - Example: Task RELATES_TO another task

- **`0.3`** - Weak/tangential relationship
  - Example: Paper CITES another for background only

### Directionality Matters

Relationships are directional. Choose the correct direction:

```javascript
// Task A depends on Task B completing
{ from: "task_a_id", to: "task_b_id", type: "DEPENDS_ON" }

// Module A imports Module B
{ from: "module_a_id", to: "module_b_id", type: "IMPORTS" }

// Paper A cites Paper B
{ from: "paper_a_id", to: "paper_b_id", type: "CITES" }
```

**Think**: "From X [relationship] To Y"
- From task_a DEPENDS_ON task_b
- From module_a IMPORTS module_b
- From paper_a CITES paper_b

---

## Putting It All Together

### Example: Complete Schema Definition

```javascript
memory_schema({
  schema: {
    "schema_version": "1.0.0",
    "domain": "software_development",
    "defines_types": {
      "package": {
        "description": "Software package or library",
        "required_metadata": ["language", "version"],
        "metadata_schema": {
          "language": {
            "type": "enum",
            "values": ["typescript", "javascript", "python", "java"],
            "description": "Primary programming language"
          },
          "version": {
            "type": "string",
            "description": "Package version (semver)"
          },
          "repository": {
            "type": "string",
            "optional": true,
            "description": "Repository URL"
          }
        }
      },
      "module": {
        "description": "Source file or module",
        "required_metadata": ["path", "language"],
        "metadata_schema": {
          "path": {
            "type": "string",
            "description": "File path relative to project root"
          },
          "language": {
            "type": "enum",
            "values": ["typescript", "javascript", "python", "java"]
          },
          "lineCount": {
            "type": "number",
            "optional": true
          }
        }
      },
      "function": {
        "description": "Function or method",
        "required_metadata": ["visibility"],
        "metadata_schema": {
          "visibility": {
            "type": "enum",
            "values": ["public", "private", "protected"]
          },
          "async": {
            "type": "boolean",
            "optional": true
          }
        }
      }
    },
    "defines_relations": {
      "CONTAINS": {
        "description": "Package contains modules, modules contain functions",
        "from_types": ["package", "module"],
        "to_types": ["module", "function"]
      },
      "IMPORTS": {
        "description": "Module imports another module",
        "from_types": ["module"],
        "to_types": ["module"]
      },
      "CALLS": {
        "description": "Function calls another function",
        "from_types": ["function"],
        "to_types": ["function"],
        "strength_guidance": "1.0 for every code path, 0.5 for conditional calls"
      }
    }
  }
})
```

---

## Best Practices

### 1. Start Simple, Evolve

Don't design everything upfront:
1. Start with 2-3 core types
2. Add fields as needed
3. Introduce relationships gradually
4. Use templates as inspiration

### 2. Consistency Wins

- Pick naming conventions and stick with them
- Use the same field names across types (e.g., always `status`, not `state` sometimes)
- Document your conventions in schema descriptions

### 3. Favor Flat Structures

**Instead of:**
```javascript
metadata: {
  assignee: {
    name: "Alice",
    email: "alice@example.com",
    team: "Engineering"
  }
}
```

**Prefer:**
```javascript
// Flat metadata
metadata: {
  assignee_name: "Alice",
  assignee_email: "alice@example.com",
  assignee_team: "Engineering"
}

// OR separate memory + relationship
memories: [
  { name: "Task: Fix bug", memoryType: "task" },
  { name: "Alice", memoryType: "person", metadata: { email: "...", team: "..." } }
],
relations: [
  { from: "task_id", to: "person_id", type: "ASSIGNED_TO" }
]
```

### 4. Use Observations for Narrative

**Metadata** = structured, filterable properties
**Observations** = narrative context, notes, explanations

```javascript
memory_store({
  memories: [{
    name: "Implement authentication",
    memoryType: "task",
    metadata: {
      status: "done",
      priority: "high",
      completedDate: "2024-01-15"
    },
    observations: [
      "Implemented OAuth2 with PKCE flow for enhanced security",
      "Encountered rate limiting issue with provider - added exponential backoff",
      "Updated documentation with integration guide"
    ]
  }]
})
```

### 5. Leverage Templates

Don't start from scratch:
1. Browse available templates: `help({ topic: "SCHEMA.project" })`
2. Copy schema structure
3. Customize for your specific domain
4. Add domain-specific types as needed

---

## Next Steps

**Ready to design?**
1. Review templates for similar domains
2. List your core entity types
3. Define required metadata fields
4. Identify key relationships
5. Use `memory_schema()` to install your design
6. Start storing and iterate

**Need inspiration?**
- Software: `help({ topic: "SCHEMA.project" })`
- Testing: `help({ topic: "SCHEMA.testing" })`
- Research: `help({ topic: "SCHEMA.research" })`
- Tasks: `help({ topic: "SCHEMA.tasks" })`

**Learn more:**
- Main guide: `help({ topic: "SCHEMA" })`
- Schema management: See "Managing Schemas" in SCHEMA.md
