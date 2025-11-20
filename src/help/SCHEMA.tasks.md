# Task Management Domain Schema Template

Ready-to-use schema for project management, agile workflows, and roadmap planning.

**Use for:** Sprint planning, backlog management, dependency tracking, team coordination

---

## Install Schema

Copy-paste this to set up your task management domain:

```
memory_schema({
  schema: {
    "schema_version": "1.0.0",
    "domain": "task_management",
    "defines_types": {
      "epic": {
        "description": "Large feature or initiative",
        "required_metadata": ["status", "priority"],
        "metadata_schema": {
          "status": {
            "type": "enum",
            "values": ["backlog", "planned", "in_progress", "done", "cancelled"],
            "description": "Current epic status"
          },
          "priority": {
            "type": "enum",
            "values": ["critical", "high", "medium", "low"],
            "description": "Business priority"
          },
          "target_quarter": {
            "type": "string",
            "optional": true,
            "description": "Target quarter (e.g., 'Q1 2025')"
          },
          "estimated_weeks": {
            "type": "number",
            "optional": true,
            "description": "Estimated duration in weeks"
          },
          "business_value": {
            "type": "number",
            "optional": true,
            "description": "Business value score (0-100)"
          },
          "tags": {
            "type": "array",
            "optional": true,
            "description": "Feature tags"
          }
        }
      },
      "task": {
        "description": "Individual work item",
        "required_metadata": ["status", "priority"],
        "metadata_schema": {
          "status": {
            "type": "enum",
            "values": ["todo", "in_progress", "in_review", "done", "blocked", "cancelled"],
            "description": "Current task status"
          },
          "priority": {
            "type": "enum",
            "values": ["critical", "high", "medium", "low"],
            "description": "Task priority"
          },
          "assignee": {
            "type": "string",
            "optional": true,
            "description": "Person assigned to task"
          },
          "estimated_hours": {
            "type": "number",
            "optional": true,
            "description": "Estimated effort in hours"
          },
          "actual_hours": {
            "type": "number",
            "optional": true,
            "description": "Actual time spent in hours"
          },
          "due_date": {
            "type": "date",
            "optional": true,
            "description": "Task due date (ISO format)"
          },
          "labels": {
            "type": "array",
            "optional": true,
            "description": "Task labels/tags"
          },
          "story_points": {
            "type": "number",
            "optional": true,
            "description": "Complexity estimate (Fibonacci)"
          }
        }
      },
      "subtask": {
        "description": "Granular task breakdown",
        "required_metadata": ["status"],
        "metadata_schema": {
          "status": {
            "type": "enum",
            "values": ["todo", "in_progress", "done"],
            "description": "Subtask status"
          },
          "assignee": {
            "type": "string",
            "optional": true,
            "description": "Person assigned"
          },
          "estimated_hours": {
            "type": "number",
            "optional": true,
            "description": "Estimated hours"
          }
        }
      },
      "milestone": {
        "description": "Key project checkpoint",
        "required_metadata": ["status", "target_date"],
        "metadata_schema": {
          "status": {
            "type": "enum",
            "values": ["planned", "at_risk", "achieved", "missed"],
            "description": "Milestone status"
          },
          "target_date": {
            "type": "date",
            "description": "Target completion date"
          },
          "actual_date": {
            "type": "date",
            "optional": true,
            "description": "Actual completion date"
          },
          "completion_percentage": {
            "type": "number",
            "optional": true,
            "description": "Progress percentage (0-100)"
          }
        }
      },
      "sprint": {
        "description": "Time-boxed iteration",
        "required_metadata": ["status", "start_date", "end_date"],
        "metadata_schema": {
          "status": {
            "type": "enum",
            "values": ["planned", "active", "completed"],
            "description": "Sprint status"
          },
          "start_date": {
            "type": "date",
            "description": "Sprint start date"
          },
          "end_date": {
            "type": "date",
            "description": "Sprint end date"
          },
          "planned_points": {
            "type": "number",
            "optional": true,
            "description": "Planned story points"
          },
          "completed_points": {
            "type": "number",
            "optional": true,
            "description": "Completed story points"
          },
          "velocity": {
            "type": "number",
            "optional": true,
            "description": "Team velocity metric"
          }
        }
      },
      "bug": {
        "description": "Defect or issue",
        "required_metadata": ["severity", "status"],
        "metadata_schema": {
          "severity": {
            "type": "enum",
            "values": ["critical", "high", "medium", "low"],
            "description": "Bug severity"
          },
          "status": {
            "type": "enum",
            "values": ["open", "triaged", "in_progress", "fixed", "verified", "wontfix", "duplicate"],
            "description": "Bug status"
          },
          "assignee": {
            "type": "string",
            "optional": true,
            "description": "Person assigned to fix"
          },
          "reported_by": {
            "type": "string",
            "optional": true,
            "description": "Bug reporter"
          },
          "environment": {
            "type": "string",
            "optional": true,
            "description": "Environment where found (prod, staging, etc.)"
          },
          "ticket_url": {
            "type": "string",
            "optional": true,
            "description": "Issue tracker URL"
          }
        }
      }
    },
    "defines_relations": {
      "PART_OF": {
        "from_types": ["task", "subtask", "bug"],
        "to_types": ["epic", "task", "sprint"],
        "description": "Item belongs to parent container"
      },
      "DEPENDS_ON": {
        "from_types": ["task", "epic", "milestone"],
        "to_types": ["task", "epic", "milestone"],
        "description": "Item has blocking dependency",
        "strength_guidance": "1.0 for hard blocker, 0.5 for soft dependency"
      },
      "BLOCKS": {
        "from_types": ["task", "bug"],
        "to_types": ["task", "epic", "milestone"],
        "description": "Item prevents progress on another"
      },
      "RELATES_TO": {
        "from_types": ["task", "bug", "epic"],
        "to_types": ["task", "bug", "epic"],
        "description": "Items are related but not blocking",
        "strength_guidance": "0.3 for weak relation, 0.7 for strong"
      },
      "ASSIGNED_TO": {
        "from_types": ["task", "subtask", "bug"],
        "to_types": ["task"],
        "description": "Task assigned to team member (store person name in metadata instead)"
      },
      "TARGETS": {
        "from_types": ["epic", "task"],
        "to_types": ["milestone"],
        "description": "Work item targets milestone"
      },
      "DUPLICATES": {
        "from_types": ["task", "bug"],
        "to_types": ["task", "bug"],
        "description": "Duplicate item"
      }
    }
  }
})
```

---

## Example Data

Store sample project tasks:

```
memory_store({
  memories: [
    {
      "name": "User Authentication System",
      "memoryType": "epic",
      "localId": "epic_auth",
      "metadata": {
        "status": "in_progress",
        "priority": "critical",
        "target_quarter": "Q1 2025",
        "estimated_weeks": 6,
        "business_value": 95,
        "tags": ["security", "authentication", "infrastructure"]
      },
      "observations": [
        "Implement comprehensive user authentication system",
        "Includes OAuth2, JWT tokens, password reset, 2FA"
      ]
    },
    {
      "name": "Sprint 12 - January 2025",
      "memoryType": "sprint",
      "localId": "sprint_12",
      "metadata": {
        "status": "active",
        "start_date": "2025-01-13T00:00:00Z",
        "end_date": "2025-01-26T23:59:59Z",
        "planned_points": 34,
        "completed_points": 18,
        "velocity": 32
      },
      "observations": [
        "Focus on authentication and security features",
        "Team velocity trending up from last sprint"
      ]
    },
    {
      "name": "Implement OAuth2 login flow",
      "memoryType": "task",
      "localId": "task_oauth",
      "metadata": {
        "status": "in_progress",
        "priority": "high",
        "assignee": "alice@example.com",
        "estimated_hours": 16,
        "actual_hours": 12,
        "due_date": "2025-01-20T00:00:00Z",
        "story_points": 8,
        "labels": ["backend", "auth", "oauth"]
      },
      "observations": [
        "Support Google and GitHub OAuth providers",
        "Include token refresh and revocation flows"
      ]
    },
    {
      "name": "Add OAuth provider configuration",
      "memoryType": "subtask",
      "localId": "subtask_oauth_config",
      "metadata": {
        "status": "done",
        "assignee": "alice@example.com",
        "estimated_hours": 3
      },
      "observations": [
        "Configure client IDs and secrets for providers",
        "Completed on 2025-01-15"
      ]
    },
    {
      "name": "Implement token refresh logic",
      "memoryType": "subtask",
      "localId": "subtask_refresh",
      "metadata": {
        "status": "in_progress",
        "assignee": "alice@example.com",
        "estimated_hours": 5
      },
      "observations": [
        "Handle token expiration and automatic refresh",
        "In progress, 60% complete"
      ]
    },
    {
      "name": "Create JWT helper functions",
      "memoryType": "task",
      "localId": "task_jwt",
      "metadata": {
        "status": "done",
        "priority": "high",
        "assignee": "bob@example.com",
        "estimated_hours": 8,
        "actual_hours": 6,
        "story_points": 5,
        "labels": ["backend", "auth", "jwt"]
      },
      "observations": [
        "Token generation, validation, and decoding utilities",
        "Completed ahead of schedule"
      ]
    },
    {
      "name": "Session tokens not invalidated on logout",
      "memoryType": "bug",
      "localId": "bug_session",
      "metadata": {
        "severity": "high",
        "status": "in_progress",
        "assignee": "alice@example.com",
        "reported_by": "qa@example.com",
        "environment": "staging",
        "ticket_url": "https://github.com/org/repo/issues/456"
      },
      "observations": [
        "Users remain authenticated after logout",
        "Security vulnerability requiring immediate fix"
      ]
    },
    {
      "name": "Beta Launch",
      "memoryType": "milestone",
      "localId": "milestone_beta",
      "metadata": {
        "status": "planned",
        "target_date": "2025-01-31T00:00:00Z",
        "completion_percentage": 65
      },
      "observations": [
        "First beta release with authentication system",
        "Requires OAuth and JWT tasks completed"
      ]
    }
  ],
  relations: [
    {
      "from": "task_oauth",
      "to": "epic_auth",
      "type": "PART_OF",
      "strength": 1.0
    },
    {
      "from": "task_jwt",
      "to": "epic_auth",
      "type": "PART_OF",
      "strength": 1.0
    },
    {
      "from": "task_oauth",
      "to": "sprint_12",
      "type": "PART_OF",
      "strength": 1.0
    },
    {
      "from": "task_jwt",
      "to": "sprint_12",
      "type": "PART_OF",
      "strength": 1.0
    },
    {
      "from": "subtask_oauth_config",
      "to": "task_oauth",
      "type": "PART_OF",
      "strength": 1.0
    },
    {
      "from": "subtask_refresh",
      "to": "task_oauth",
      "type": "PART_OF",
      "strength": 1.0
    },
    {
      "from": "task_oauth",
      "to": "task_jwt",
      "type": "DEPENDS_ON",
      "strength": 1.0
    },
    {
      "from": "bug_session",
      "to": "task_oauth",
      "type": "BLOCKS",
      "strength": 1.0
    },
    {
      "from": "epic_auth",
      "to": "milestone_beta",
      "type": "TARGETS",
      "strength": 1.0
    }
  ]
})
```

---

## Common Queries

### Find all tasks in current sprint

```
memory_find({
  "traverseFrom": "<sprint_memory_id>",
  "traverseRelations": ["PART_OF"],
  "traverseDirection": "inbound",
  "memoryTypes": ["task"],
  "includeContext": "full"
})
```

### Find blocked tasks

```
memory_find({
  "query": "status:blocked",
  "memoryTypes": ["task"],
  "includeContext": "full"
})
```

### Find high priority tasks assigned to someone

```
memory_find({
  "query": "priority:high assignee:alice",
  "memoryTypes": ["task"],
  "includeContext": "full"
})
```

### Find all tasks for an epic

```
memory_find({
  "traverseFrom": "<epic_memory_id>",
  "traverseRelations": ["PART_OF"],
  "traverseDirection": "inbound",
  "memoryTypes": ["task", "subtask"],
  "includeContext": "full"
})
```

### Find task dependencies

```
memory_find({
  "traverseFrom": "<task_memory_id>",
  "traverseRelations": ["DEPENDS_ON"],
  "traverseDirection": "outbound",
  "memoryTypes": ["task"],
  "includeContext": "full"
})
```

### Find what a bug is blocking

```
memory_find({
  "traverseFrom": "<bug_memory_id>",
  "traverseRelations": ["BLOCKS"],
  "traverseDirection": "outbound",
  "memoryTypes": ["task", "epic", "milestone"],
  "includeContext": "full"
})
```

### Find overdue tasks

```
memory_find({
  "query": "due_date status:todo",
  "memoryTypes": ["task"],
  "includeContext": "full"
})
```

### Find tasks targeting a milestone

```
memory_find({
  "traverseFrom": "<milestone_memory_id>",
  "traverseRelations": ["TARGETS"],
  "traverseDirection": "inbound",
  "memoryTypes": ["epic", "task"],
  "includeContext": "full"
})
```

---

## Workflow Examples

### Sprint Planning

```
# 1. Find backlog tasks by priority
memory_find({
  query: "status:todo priority:high",
  memoryTypes: ["task"],
  includeContext: "full",
  limit: 50
})

# 2. Check task dependencies before adding to sprint
memory_find({
  traverseFrom: "<task_id>",
  traverseRelations: ["DEPENDS_ON"],
  traverseDirection: "both",
  includeContext: "full"
})

# 3. Add tasks to sprint via PART_OF relations
memory_modify({
  operation: "create-relations",
  relations: [
    { from: "<task_id>", to: "<sprint_id>", type: "PART_OF" }
  ]
})
```

### Dependency Analysis

```
# 1. Find blocking bugs
memory_find({
  query: "severity:critical status:open",
  memoryTypes: ["bug"],
  includeContext: "full"
})

# 2. See what the bug blocks
memory_find({
  traverseFrom: "<bug_id>",
  traverseRelations: ["BLOCKS"],
  traverseDirection: "outbound",
  includeContext: "full"
})

# 3. Find dependency chain
memory_find({
  traverseFrom: "<task_id>",
  traverseRelations: ["DEPENDS_ON", "BLOCKS"],
  traverseDirection: "both",
  maxDepth: 3,
  includeContext: "full"
})
```

### Progress Tracking

```
# 1. Check epic progress
memory_find({
  traverseFrom: "<epic_id>",
  traverseRelations: ["PART_OF"],
  traverseDirection: "inbound",
  includeContext: "full"
})

# 2. Update task status
memory_modify({
  operation: "update",
  target: "<task_id>",
  changes: {
    metadata: { status: "done", actual_hours: 12 }
  }
})

# 3. Add progress observation
memory_modify({
  operation: "add-observations",
  observations: [{
    memoryId: "<task_id>",
    contents: ["Completed OAuth integration, all tests passing"]
  }]
})
```

---

## Tips

1. **Sprint velocity** - Track completed_points vs planned_points for capacity planning
2. **Dependency chains** - Use DEPENDS_ON with maxDepth to find critical paths
3. **Blocking items** - High severity bugs should have BLOCKS relations to affected tasks
4. **Story points** - Use Fibonacci sequence (1,2,3,5,8,13) for estimation consistency
5. **Status transitions** - Add observations when status changes to maintain audit trail
6. **Milestone tracking** - Link epics to milestones via TARGETS for roadmap visibility
