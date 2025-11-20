# QA & Testing Domain Schema Template

Ready-to-use schema for quality assurance and software testing projects.

**Use for:** Test management, bug tracking, test coverage analysis, QA workflows

---

## Install Schema

Copy-paste this to set up your testing domain:

```
memory_schema({
  schema: {
    "schema_version": "1.0.0",
    "domain": "qa_testing",
    "defines_types": {
      "test_suite": {
        "description": "Collection of related tests",
        "required_metadata": ["status", "framework"],
        "metadata_schema": {
          "status": {
            "type": "enum",
            "values": ["active", "deprecated", "maintenance"],
            "description": "Current status of test suite"
          },
          "framework": {
            "type": "string",
            "description": "Testing framework (vitest, jest, pytest, etc.)"
          },
          "coverage": {
            "type": "number",
            "optional": true,
            "description": "Code coverage percentage"
          },
          "tags": {
            "type": "array",
            "optional": true,
            "description": "Tags for categorization"
          }
        }
      },
      "test_case": {
        "description": "Individual test",
        "required_metadata": ["status", "type"],
        "metadata_schema": {
          "status": {
            "type": "enum",
            "values": ["passing", "failing", "skipped", "flaky"],
            "description": "Current test status"
          },
          "type": {
            "type": "enum",
            "values": ["unit", "integration", "e2e", "performance", "smoke"],
            "description": "Test type classification"
          },
          "duration_ms": {
            "type": "number",
            "optional": true,
            "description": "Last execution duration in milliseconds"
          },
          "last_run": {
            "type": "date",
            "optional": true,
            "description": "ISO timestamp of last execution"
          },
          "flakiness_score": {
            "type": "number",
            "optional": true,
            "description": "0-100 score indicating test flakiness"
          }
        }
      },
      "bug": {
        "description": "Defect found during testing",
        "required_metadata": ["severity", "status"],
        "metadata_schema": {
          "severity": {
            "type": "enum",
            "values": ["critical", "high", "medium", "low"],
            "description": "Bug severity level"
          },
          "status": {
            "type": "enum",
            "values": ["open", "in_progress", "fixed", "wontfix", "duplicate"],
            "description": "Current bug status"
          },
          "found_by": {
            "type": "string",
            "optional": true,
            "description": "Test case or person who found the bug"
          },
          "ticket_url": {
            "type": "string",
            "optional": true,
            "description": "Link to issue tracker"
          }
        }
      },
      "test_run": {
        "description": "Test execution result",
        "required_metadata": ["status", "timestamp"],
        "metadata_schema": {
          "status": {
            "type": "enum",
            "values": ["success", "failure", "partial", "error"],
            "description": "Overall run status"
          },
          "timestamp": {
            "type": "date",
            "description": "When the test run occurred"
          },
          "environment": {
            "type": "string",
            "optional": true,
            "description": "Test environment (local, staging, ci, etc.)"
          },
          "total_tests": {
            "type": "number",
            "optional": true
          },
          "passed_tests": {
            "type": "number",
            "optional": true
          },
          "failed_tests": {
            "type": "number",
            "optional": true
          }
        }
      }
    },
    "defines_relations": {
      "PART_OF": {
        "from_types": ["test_case"],
        "to_types": ["test_suite"],
        "description": "Test belongs to suite"
      },
      "FOUND": {
        "from_types": ["test_case", "test_run"],
        "to_types": ["bug"],
        "description": "Test or run discovered bug"
      },
      "BLOCKS": {
        "from_types": ["bug"],
        "to_types": ["test_case"],
        "description": "Bug prevents test from passing"
      },
      "COVERS": {
        "from_types": ["test_case"],
        "to_types": ["test_case"],
        "description": "Test covers same code/feature",
        "strength_guidance": "1.0 for duplicate coverage, 0.5 for related"
      },
      "RAN_IN": {
        "from_types": ["test_case"],
        "to_types": ["test_run"],
        "description": "Test executed in run"
      }
    }
  }
})
```

---

## Example Data

Store sample test data:

```
memory_store({
  memories: [
    {
      "name": "Authentication Test Suite",
      "memoryType": "test_suite",
      "localId": "suite_auth",
      "metadata": {
        "status": "active",
        "framework": "vitest",
        "coverage": 87.5,
        "tags": ["auth", "security", "critical"]
      },
      "observations": [
        "Core authentication tests for login, logout, session management",
        "Must pass before any release"
      ]
    },
    {
      "name": "Login with valid credentials",
      "memoryType": "test_case",
      "localId": "test_login_valid",
      "metadata": {
        "status": "passing",
        "type": "integration",
        "duration_ms": 234,
        "last_run": "2025-01-19T10:30:00Z",
        "flakiness_score": 5
      },
      "observations": [
        "Tests successful login with email and password",
        "Verifies JWT token generation and session creation"
      ]
    },
    {
      "name": "Login with invalid password",
      "memoryType": "test_case",
      "localId": "test_login_invalid",
      "metadata": {
        "status": "failing",
        "type": "integration",
        "duration_ms": 112,
        "last_run": "2025-01-19T10:30:15Z"
      },
      "observations": [
        "Should reject login with wrong password",
        "FAILING: Currently returns 500 instead of 401"
      ]
    },
    {
      "name": "Session timeout not enforced",
      "memoryType": "bug",
      "localId": "bug_session_timeout",
      "metadata": {
        "severity": "high",
        "status": "open",
        "found_by": "test_login_invalid",
        "ticket_url": "https://github.com/org/repo/issues/123"
      },
      "observations": [
        "Sessions remain valid indefinitely instead of expiring after 24h",
        "Security risk - allows indefinite access with stolen tokens"
      ]
    },
    {
      "name": "CI Run 2025-01-19 Morning",
      "memoryType": "test_run",
      "localId": "run_20250119_am",
      "metadata": {
        "status": "failure",
        "timestamp": "2025-01-19T10:30:00Z",
        "environment": "ci",
        "total_tests": 247,
        "passed_tests": 246,
        "failed_tests": 1
      },
      "observations": [
        "1 test failure in authentication suite",
        "All other suites passed"
      ]
    }
  ],
  relations: [
    {
      "from": "test_login_valid",
      "to": "suite_auth",
      "type": "PART_OF",
      "strength": 1.0
    },
    {
      "from": "test_login_invalid",
      "to": "suite_auth",
      "type": "PART_OF",
      "strength": 1.0
    },
    {
      "from": "test_login_invalid",
      "to": "bug_session_timeout",
      "type": "FOUND",
      "strength": 1.0
    },
    {
      "from": "bug_session_timeout",
      "to": "test_login_invalid",
      "type": "BLOCKS",
      "strength": 1.0
    },
    {
      "from": "test_login_valid",
      "to": "run_20250119_am",
      "type": "RAN_IN",
      "strength": 1.0
    },
    {
      "from": "test_login_invalid",
      "to": "run_20250119_am",
      "type": "RAN_IN",
      "strength": 1.0
    }
  ]
})
```

---

## Common Queries

### Find all failing tests

```
memory_find({
  "query": "status failing",
  "memoryTypes": ["test_case"],
  "includeContext": "full"
})
```

### Find critical bugs that are still open

```
memory_find({
  "query": "severity:critical status:open",
  "memoryTypes": ["bug"],
  "includeContext": "full"
})
```

### Find all tests in a specific suite

```
memory_find({
  "traverseFrom": "<suite_auth_memory_id>",
  "traverseRelations": ["PART_OF"],
  "traverseDirection": "inbound",
  "memoryTypes": ["test_case"],
  "includeContext": "full"
})
```

### Find what bugs a test discovered

```
memory_find({
  "traverseFrom": "<test_case_memory_id>",
  "traverseRelations": ["FOUND"],
  "traverseDirection": "outbound",
  "memoryTypes": ["bug"],
  "includeContext": "full"
})
```

### Find flaky tests (high flakiness score)

```
memory_find({
  "query": "flakiness_score",
  "memoryTypes": ["test_case"],
  "includeContext": "full"
})
```

### Find tests run in a specific test run

```
memory_find({
  "traverseFrom": "<test_run_memory_id>",
  "traverseRelations": ["RAN_IN"],
  "traverseDirection": "inbound",
  "memoryTypes": ["test_case"],
  "includeContext": "full"
})
```

### Find recent test failures (last 7 days)

```
memory_find({
  "query": "status:failing",
  "memoryTypes": ["test_case"],
  "createdAfter": "7d",
  "includeContext": "full"
})
```

---

## Workflow Examples

### Recording Test Results

```
# 1. Create test run
memory_store({
  memories: [{
    name: "CI Run 2025-01-20",
    memoryType: "test_run",
    localId: "run_today",
    metadata: {
      status: "success",
      timestamp: "2025-01-20T09:00:00Z",
      environment: "ci",
      total_tests: 250,
      passed_tests: 250,
      failed_tests: 0
    }
  }]
})

# 2. Link tests to run
memory_modify({
  operation: "create-relations",
  relations: [
    { from: "<test_id_1>", to: "<run_id>", type: "RAN_IN" },
    { from: "<test_id_2>", to: "<run_id>", type: "RAN_IN" }
  ]
})
```

### Bug Discovery Workflow

```
# 1. Test finds a bug
memory_store({
  memories: [
    {
      name: "Critical security flaw in token validation",
      memoryType: "bug",
      localId: "new_bug",
      metadata: {
        severity: "critical",
        status: "open",
        found_by: "test_token_validation"
      },
      observations: ["Tokens can be forged due to missing signature verification"]
    }
  ],
  relations: [
    { from: "<test_id>", to: "new_bug", type: "FOUND", strength: 1.0 }
  ]
})

# 2. Bug blocks test from passing
memory_modify({
  operation: "create-relations",
  relations: [
    { from: "new_bug", to: "<test_id>", type: "BLOCKS", strength: 1.0 }
  ]
})
```

---

## Tips

1. **Track flakiness** - Use `flakiness_score` to identify unreliable tests
2. **Link runs** - Always connect test_cases to test_runs for historical tracking
3. **Bug lifecycle** - Update bug status as they progress through fix cycle
4. **Coverage tracking** - Store coverage percentage in test_suite metadata
5. **Environment tags** - Use metadata tags to track which environments tests run in
