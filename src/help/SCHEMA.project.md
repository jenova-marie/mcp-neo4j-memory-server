# Software Development Domain Schema Template

Ready-to-use schema for code knowledge graphs and software architecture modeling.

**Use for:** Code documentation, dependency tracking, architecture analysis, refactoring planning

---

## Install Schema

Copy-paste this to set up your software development domain:

```
memory_schema({
  schema: {
    "schema_version": "1.0.0",
    "domain": "software_development",
    "defines_types": {
      "package": {
        "description": "Software package/library",
        "required_metadata": ["language", "version"],
        "metadata_schema": {
          "language": {
            "type": "enum",
            "values": ["typescript", "javascript", "python", "java", "go", "rust", "other"],
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
          },
          "tags": {
            "type": "array",
            "optional": true,
            "description": "Technology tags"
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
            "values": ["typescript", "javascript", "python", "java", "go", "rust", "other"],
            "description": "Programming language"
          },
          "lines_of_code": {
            "type": "number",
            "optional": true,
            "description": "Total lines of code"
          },
          "complexity": {
            "type": "number",
            "optional": true,
            "description": "Cyclomatic complexity score"
          },
          "last_modified": {
            "type": "date",
            "optional": true,
            "description": "Last modification timestamp"
          }
        }
      },
      "class": {
        "description": "Class definition",
        "required_metadata": ["visibility"],
        "metadata_schema": {
          "visibility": {
            "type": "enum",
            "values": ["public", "private", "protected", "internal"],
            "description": "Access modifier"
          },
          "abstract": {
            "type": "boolean",
            "optional": true,
            "description": "Is abstract class"
          },
          "methods_count": {
            "type": "number",
            "optional": true,
            "description": "Number of methods"
          },
          "properties_count": {
            "type": "number",
            "optional": true,
            "description": "Number of properties"
          }
        }
      },
      "function": {
        "description": "Function or method",
        "required_metadata": ["visibility"],
        "metadata_schema": {
          "visibility": {
            "type": "enum",
            "values": ["public", "private", "protected", "internal", "exported"],
            "description": "Access modifier"
          },
          "async": {
            "type": "boolean",
            "optional": true,
            "description": "Is async function"
          },
          "parameters_count": {
            "type": "number",
            "optional": true,
            "description": "Number of parameters"
          },
          "return_type": {
            "type": "string",
            "optional": true,
            "description": "Return type annotation"
          },
          "complexity": {
            "type": "number",
            "optional": true,
            "description": "Cyclomatic complexity"
          }
        }
      },
      "interface": {
        "description": "Interface or type definition",
        "required_metadata": ["type"],
        "metadata_schema": {
          "type": {
            "type": "enum",
            "values": ["interface", "type", "abstract_class", "protocol"],
            "description": "Type definition kind"
          },
          "properties_count": {
            "type": "number",
            "optional": true,
            "description": "Number of properties"
          },
          "generic": {
            "type": "boolean",
            "optional": true,
            "description": "Has generic parameters"
          }
        }
      },
      "dependency": {
        "description": "External dependency",
        "required_metadata": ["version", "type"],
        "metadata_schema": {
          "version": {
            "type": "string",
            "description": "Dependency version"
          },
          "type": {
            "type": "enum",
            "values": ["production", "development", "peer", "optional"],
            "description": "Dependency type"
          },
          "license": {
            "type": "string",
            "optional": true,
            "description": "License identifier"
          }
        }
      }
    },
    "defines_relations": {
      "CONTAINS": {
        "from_types": ["package", "module", "class"],
        "to_types": ["module", "class", "function", "interface"],
        "description": "Parent contains child entity"
      },
      "IMPORTS": {
        "from_types": ["module", "class", "function"],
        "to_types": ["module", "class", "function", "interface", "dependency"],
        "description": "Imports or requires dependency"
      },
      "CALLS": {
        "from_types": ["function"],
        "to_types": ["function"],
        "description": "Function calls another function",
        "strength_guidance": "1.0 for direct call, 0.5 for conditional"
      },
      "EXTENDS": {
        "from_types": ["class", "interface"],
        "to_types": ["class", "interface"],
        "description": "Inheritance relationship"
      },
      "IMPLEMENTS": {
        "from_types": ["class"],
        "to_types": ["interface"],
        "description": "Class implements interface"
      },
      "USES": {
        "from_types": ["function", "class"],
        "to_types": ["class", "interface"],
        "description": "Uses type in implementation",
        "strength_guidance": "1.0 for composition, 0.3 for parameter"
      },
      "DEPENDS_ON": {
        "from_types": ["package", "module"],
        "to_types": ["package", "dependency"],
        "description": "Package or module dependency"
      }
    }
  }
})
```

---

## Example Data

Store sample code structure:

```
memory_store({
  memories: [
    {
      "name": "express",
      "memoryType": "dependency",
      "localId": "dep_express",
      "metadata": {
        "version": "4.18.2",
        "type": "production",
        "license": "MIT"
      },
      "observations": [
        "Fast, unopinionated web framework for Node.js",
        "Core dependency for HTTP server implementation"
      ]
    },
    {
      "name": "src/http/server.ts",
      "memoryType": "module",
      "localId": "mod_server",
      "metadata": {
        "path": "src/http/server.ts",
        "language": "typescript",
        "lines_of_code": 145,
        "last_modified": "2025-01-19T15:30:00Z"
      },
      "observations": [
        "HTTP transport implementation for MCP server",
        "Provides REST-like endpoints for memory operations"
      ]
    },
    {
      "name": "MemoryRepository",
      "memoryType": "interface",
      "localId": "int_memory_repo",
      "metadata": {
        "type": "interface",
        "properties_count": 8,
        "generic": false
      },
      "observations": [
        "Core repository interface for memory CRUD operations",
        "Defines contract for all memory storage implementations"
      ]
    },
    {
      "name": "CompositeMemoryRepository",
      "memoryType": "class",
      "localId": "class_composite",
      "metadata": {
        "visibility": "public",
        "abstract": false,
        "methods_count": 12,
        "properties_count": 3
      },
      "observations": [
        "Aggregates CoreMemoryRepository, ObservationRepository, and RelationRepository",
        "Provides unified interface for complex memory operations"
      ]
    },
    {
      "name": "createMemory",
      "memoryType": "function",
      "localId": "fn_create_memory",
      "metadata": {
        "visibility": "public",
        "async": true,
        "parameters_count": 1,
        "return_type": "Promise<Memory>",
        "complexity": 8
      },
      "observations": [
        "Creates a new memory node with embedding generation",
        "Validates memory structure and generates ULID"
      ]
    },
    {
      "name": "searchMemories",
      "memoryType": "function",
      "localId": "fn_search",
      "metadata": {
        "visibility": "public",
        "async": true,
        "parameters_count": 2,
        "return_type": "Promise<SearchResult[]>",
        "complexity": 15
      },
      "observations": [
        "Semantic vector search across memories",
        "Combines exact match, wildcard, and similarity scoring"
      ]
    }
  ],
  relations: [
    {
      "from": "mod_server",
      "to": "dep_express",
      "type": "IMPORTS",
      "strength": 1.0
    },
    {
      "from": "class_composite",
      "to": "int_memory_repo",
      "type": "IMPLEMENTS",
      "strength": 1.0
    },
    {
      "from": "class_composite",
      "to": "fn_create_memory",
      "type": "CONTAINS",
      "strength": 1.0
    },
    {
      "from": "class_composite",
      "to": "fn_search",
      "type": "CONTAINS",
      "strength": 1.0
    },
    {
      "from": "fn_search",
      "to": "fn_create_memory",
      "type": "CALLS",
      "strength": 0.5
    }
  ]
})
```

---

## Common Queries

### Find all public functions

```
memory_find({
  "query": "visibility:public",
  "memoryTypes": ["function"],
  "includeContext": "full"
})
```

### Find what a module imports

```
memory_find({
  "traverseFrom": "<module_memory_id>",
  "traverseRelations": ["IMPORTS"],
  "traverseDirection": "outbound",
  "includeContext": "full"
})
```

### Find all classes that implement an interface

```
memory_find({
  "traverseFrom": "<interface_memory_id>",
  "traverseRelations": ["IMPLEMENTS"],
  "traverseDirection": "inbound",
  "memoryTypes": ["class"],
  "includeContext": "full"
})
```

### Find high complexity functions

```
memory_find({
  "query": "complexity",
  "memoryTypes": ["function"],
  "includeContext": "full"
})
```

### Find all dependencies of a package

```
memory_find({
  "traverseFrom": "<package_memory_id>",
  "traverseRelations": ["DEPENDS_ON"],
  "traverseDirection": "outbound",
  "memoryTypes": ["dependency"],
  "includeContext": "full"
})
```

### Find what classes use a specific interface

```
memory_find({
  "traverseFrom": "<interface_memory_id>",
  "traverseRelations": ["USES", "IMPLEMENTS"],
  "traverseDirection": "inbound",
  "memoryTypes": ["class"],
  "includeContext": "full"
})
```

### Find function call graph

```
memory_find({
  "traverseFrom": "<function_memory_id>",
  "traverseRelations": ["CALLS"],
  "traverseDirection": "outbound",
  "maxDepth": 3,
  "memoryTypes": ["function"],
  "includeContext": "full"
})
```

---

## Workflow Examples

### Code Refactoring Analysis

```
# 1. Find all usages of a class
memory_find({
  traverseFrom: "<class_id>",
  traverseRelations: ["USES", "EXTENDS", "IMPORTS"],
  traverseDirection: "inbound",
  maxDepth: 2,
  includeContext: "full"
})

# 2. Identify high-coupling modules
memory_find({
  query: "*",
  memoryTypes: ["module"],
  includeContext: "relations-only"
})

# 3. Find circular dependencies
memory_find({
  traverseFrom: "<module_id>",
  traverseRelations: ["IMPORTS", "DEPENDS_ON"],
  maxDepth: 5,
  includeContext: "relations-only"
})
```

### Dependency Audit

```
# 1. List all production dependencies
memory_find({
  query: "type:production",
  memoryTypes: ["dependency"],
  includeContext: "full"
})

# 2. Find what uses a specific dependency
memory_find({
  traverseFrom: "<dependency_id>",
  traverseRelations: ["IMPORTS", "DEPENDS_ON"],
  traverseDirection: "inbound",
  includeContext: "full"
})

# 3. Identify unused dependencies
# (manually compare IMPORTS relations vs declared dependencies)
```

---

## Tips

1. **Module granularity** - Store individual files as modules for fine-grained tracking
2. **Call graphs** - Use CALLS relations with strength to model control flow
3. **Complexity metrics** - Track cyclomatic complexity in metadata for refactoring priorities
4. **Dependency versions** - Always store version to track compatibility
5. **Visibility tracking** - Use visibility metadata to analyze API surface area
