# Neo4j Memory Server

A Model Context Protocol (MCP) server that provides AI assistants with persistent, intelligent memory capabilities using Neo4j's graph database with unified architecture

## What it does

This server enables AI assistants to:
- **Remember** - Store memories as interconnected knowledge nodes with observations and metadata
- **Search** - Find relevant memories using semantic vector search, exact matching, and graph traversal
- **Connect** - Create meaningful relationships between memories with batch operations and cross-references
- **Organize** - Separate memories by project using different databases
- **Evolve** - Track how knowledge develops over time with temporal metadata and relationship networks

## Features

### Core Capabilities
- 🧠 **Graph Memory** - Memories as nodes, relationships as edges, observations as content
- 🔍 **Unified Search** - Semantic vectors, exact matching, wildcards, and graph traversal in one tool
- 🔗 **Smart Relations** - Typed connections with strength, source tracking, and temporal metadata
- 📊 **Multi-Database** - Isolated project contexts with instant switching

### Advanced Operations  
- ⚡ **Batch Operations** - Create multiple memories with relationships in single request using localId
- 🎯 **Context Control** - Response detail levels: minimal (lists), full (complete data), relations-only
- 📅 **Time Queries** - Filter by relative ("7d", "30d") or absolute dates on any temporal field
- 🌐 **Graph Traversal** - Navigate networks in any direction with depth control

### Architecture
- 🚀 **MCP Native** - Seamless integration with Claude Desktop and MCP clients
- 💾 **Persistent Storage** - Neo4j graph database with GDS plugin for vector operations
- ⚠️ **Zero-Fallback** - Explicit errors for reliable debugging, no silent failures

## Technical Highlights

- Built on Neo4j for scalable graph operations
- Vector embeddings using sentence transformers (384 dimensions)
- Clean architecture with domain-driven design
- Supports GDS plugin for advanced vector operations (necessary)
- **Unified Architecture** - 4 comprehensive tools for complete memory operations

## Quick Start

```bash
npm install @sylweriusz/mcp-neo4j-memory-server
```

Add to Claude Desktop config:

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@sylweriusz/mcp-neo4j-memory-server"],
      "env": {
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USERNAME": "neo4j", 
        "NEO4J_PASSWORD": "your-password"
      }
    }
  }
}
```

## Neo4j Setup

### Working setup: DozerDB with GDS Plugin

For the database, use DozerDB with the Graph Data Science plug-in, GDS is not only recommended but necessary:

For current installation instructions, see: https://dozerdb.org/

Example setup:
```bash
# Run DozerDB container with latest version
docker run \
    -p 7474:7474 -p 7687:7687 \
    -v $HOME/neo4j/data:/data \
    -v $HOME/neo4j/logs:/logs \
    -v $HOME/neo4j/plugins:/plugins \
    --env NEO4J_AUTH=neo4j/password \
    --env NEO4J_dbms_security_procedures_unrestricted='gds.*' \
    graphstack/dozerdb:latest

# Install GDS plugin - see dozerdb.org for current instructions

# Verify GDS plugin works
# In Neo4j Browser (http://localhost:7474):
# RETURN gds.similarity.cosine([1,2,3], [2,3,4]) as similarity
```

## Unified Tools

The server provides **8 comprehensive MCP tools** that integrate automatically with Claude:

### Core Memory Operations
- `memory_store` - Create memories with observations and immediate relations in ONE operation
- `memory_find` - Unified search/retrieval with semantic search, direct ID lookup, date filtering, and graph traversal
- `memory_modify` - Comprehensive modification operations (update, delete, observations, relations)
- `database_switch` - Switch database context for isolated environments

### Schema Validation
- `memory_schema` - Get/set schema definitions with auto-versioning and breaking change detection
- `memory_validate` - Validate memory data against schema before storing

### Agent Onboarding
- `init` - Comprehensive getting started guide for agents (mandatory workflow, best practices, templates)
- `help` - Access documentation system with domain-specific schema templates

See [`src/help/`](src/help/) for complete template documentation

## Memory Structure

```json
{
  "id": "dZ$abc123",
  "name": "Project Alpha",
  "memoryType": "project",
  "metadata": {"status": "active", "priority": "high"},
  "observations": [
    {"id": "dZ$obs456", "content": "Started development", "createdAt": "2025-06-08T10:00:00Z"}
  ],
  "related": {
    "ancestors": [{"id": "dZ$def789", "name": "Initiative", "relation": "PART_OF", "distance": 1}],
    "descendants": [{"id": "dZ$ghi012", "name": "Task", "relation": "INCLUDES", "distance": 1}]
  }
}
```

## Schema System

The server includes an **optional schema validation system** that enables agents to discover, validate, and evolve their memory structures autonomously.

### Why Use Schemas?

- **Self-Validating Agents** - Validate data before storing, catch errors early
- **Zero-Shot Discovery** - New agents discover domain conventions instantly
- **Consistent Multi-Session** - Schemas persist across conversations
- **Safe Evolution** - Breaking change detection prevents data loss
- **Multi-Domain Intelligence** - Single agent adapts to different domains

### Meta-Schema Pattern

The server uses a flexible **meta-schema** that can represent any domain:

```javascript
Memory {
  memoryType: string      // YOUR domain entity type (e.g., "task", "paper", "class")
  metadata: JSON          // YOUR domain-specific properties
  observations: [...]     // Narrative context
}
```

Think of it as **property graph simulation** - every `memoryType` creates a new entity type, every `relationType` creates a new semantic relationship.

### Agent Workflow

```javascript
// 1. Discover existing schema
memory_schema()  // Returns schema definition or null

// 2. Validate before storing
memory_validate({ memoryType: "task", metadata: {...} })

// 3. Store with confidence
memory_store({ memories: [...] })
```

### Ready-to-Use Templates

The `help` tool provides instant access to domain-specific templates:

- `help({ topic: "project" })` - Software development (classes, functions, modules)
- `help({ topic: "testing" })` - QA workflows (test suites, bugs, test runs)
- `help({ topic: "research" })` - Academic research (papers, authors, citations)
- `help({ topic: "tasks" })` - Task management (epics, tasks, sprints)
- `help({ topic: "design" })` - Custom schema design guide

**Complete Documentation:**
- Technical guide: [`SCHEMA.md`](SCHEMA.md)
- Detailed docs: [`src/help/SCHEMA.md`](src/help/SCHEMA.md)
- Templates: [`src/help/SCHEMA.*.md`](src/help/)

### Schema Storage

Schemas are stored as regular Memory nodes with `memoryType: "_schema_definition"`, giving them:
- Version tracking
- Observation history
- Full search capabilities
- Same persistence as all other memories

## System Prompt

### The simplest use of the memory tool, the following usually is more than enough.

```
## Memory Tool Usage
- Store all memory for this project in database: 'project-database-name'
- Use MCP memory tools exclusively for storing project-related information
- Begin each session by:
  1. Switching to this project's database
  2. Searching memory for data relevant to the user's prompt

```


## Troubleshooting

**Vector Search Issues:**
- Check logs for `[VectorSearch] GDS Plugin detected`
- GDS Plugin requires DozerDB setup (see Neo4j Setup section)

**Connection Issues:**
- Verify Neo4j is running: `docker ps`
- Test connection: `curl http://localhost:7474`
- Check credentials in environment variables

## License

MIT