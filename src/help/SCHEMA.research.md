# Research & Knowledge Domain Schema Template

Ready-to-use schema for academic research, citation networks, and knowledge graphs.

**Use for:** Literature review, citation analysis, research collaboration, knowledge management

---

## Install Schema

Copy-paste this to set up your research domain:

```
memory_schema({
  schema: {
    "schema_version": "1.0.0",
    "domain": "research_knowledge",
    "defines_types": {
      "paper": {
        "description": "Academic paper or publication",
        "required_metadata": ["year", "type"],
        "metadata_schema": {
          "year": {
            "type": "number",
            "description": "Publication year"
          },
          "type": {
            "type": "enum",
            "values": ["journal", "conference", "preprint", "thesis", "book", "workshop"],
            "description": "Publication type"
          },
          "doi": {
            "type": "string",
            "optional": true,
            "description": "Digital Object Identifier"
          },
          "arxiv_id": {
            "type": "string",
            "optional": true,
            "description": "ArXiv identifier"
          },
          "venue": {
            "type": "string",
            "optional": true,
            "description": "Journal or conference name"
          },
          "citations": {
            "type": "number",
            "optional": true,
            "description": "Citation count"
          },
          "impact_factor": {
            "type": "number",
            "optional": true,
            "description": "Journal impact factor"
          },
          "tags": {
            "type": "array",
            "optional": true,
            "description": "Research topics/keywords"
          }
        }
      },
      "author": {
        "description": "Research author",
        "required_metadata": ["affiliation_type"],
        "metadata_schema": {
          "affiliation_type": {
            "type": "enum",
            "values": ["academic", "industry", "independent", "government"],
            "description": "Primary affiliation type"
          },
          "h_index": {
            "type": "number",
            "optional": true,
            "description": "H-index metric"
          },
          "orcid": {
            "type": "string",
            "optional": true,
            "description": "ORCID identifier"
          },
          "email": {
            "type": "string",
            "optional": true,
            "description": "Contact email"
          },
          "homepage": {
            "type": "string",
            "optional": true,
            "description": "Personal/academic homepage URL"
          }
        }
      },
      "institution": {
        "description": "Research institution",
        "required_metadata": ["type", "country"],
        "metadata_schema": {
          "type": {
            "type": "enum",
            "values": ["university", "research_lab", "company", "hospital", "government"],
            "description": "Institution type"
          },
          "country": {
            "type": "string",
            "description": "Country code (ISO 3166-1 alpha-2)"
          },
          "ranking": {
            "type": "number",
            "optional": true,
            "description": "Global ranking if available"
          }
        }
      },
      "concept": {
        "description": "Research concept or topic",
        "required_metadata": ["field"],
        "metadata_schema": {
          "field": {
            "type": "enum",
            "values": ["cs", "physics", "biology", "medicine", "math", "engineering", "social", "other"],
            "description": "Primary research field"
          },
          "maturity": {
            "type": "enum",
            "values": ["emerging", "established", "mature", "declining"],
            "optional": true,
            "description": "Concept maturity level"
          },
          "first_introduced": {
            "type": "number",
            "optional": true,
            "description": "Year concept was introduced"
          }
        }
      },
      "experiment": {
        "description": "Research experiment or study",
        "required_metadata": ["status", "type"],
        "metadata_schema": {
          "status": {
            "type": "enum",
            "values": ["planned", "running", "completed", "failed", "abandoned"],
            "description": "Experiment status"
          },
          "type": {
            "type": "enum",
            "values": ["computational", "lab", "field", "survey", "meta_analysis"],
            "description": "Experiment type"
          },
          "start_date": {
            "type": "date",
            "optional": true,
            "description": "Start date"
          },
          "end_date": {
            "type": "date",
            "optional": true,
            "description": "Completion date"
          },
          "sample_size": {
            "type": "number",
            "optional": true,
            "description": "Sample size or data points"
          },
          "reproducible": {
            "type": "boolean",
            "optional": true,
            "description": "Code/data available for reproduction"
          }
        }
      },
      "dataset": {
        "description": "Research dataset",
        "required_metadata": ["size", "license"],
        "metadata_schema": {
          "size": {
            "type": "string",
            "description": "Dataset size (e.g., '10GB', '1M samples')"
          },
          "license": {
            "type": "enum",
            "values": ["public", "cc_by", "cc_by_sa", "proprietary", "restricted"],
            "description": "Data license"
          },
          "url": {
            "type": "string",
            "optional": true,
            "description": "Download URL"
          },
          "format": {
            "type": "string",
            "optional": true,
            "description": "Data format (CSV, JSON, HDF5, etc.)"
          }
        }
      }
    },
    "defines_relations": {
      "CITES": {
        "from_types": ["paper"],
        "to_types": ["paper"],
        "description": "Paper cites another paper"
      },
      "AUTHORED_BY": {
        "from_types": ["paper"],
        "to_types": ["author"],
        "description": "Paper written by author",
        "strength_guidance": "1.0 for first author, 0.7 for corresponding, 0.5 for co-author"
      },
      "AFFILIATED_WITH": {
        "from_types": ["author"],
        "to_types": ["institution"],
        "description": "Author affiliated with institution"
      },
      "INTRODUCES": {
        "from_types": ["paper"],
        "to_types": ["concept"],
        "description": "Paper introduces new concept"
      },
      "BUILDS_ON": {
        "from_types": ["concept", "paper"],
        "to_types": ["concept"],
        "description": "Extends or refines existing concept"
      },
      "USES": {
        "from_types": ["paper", "experiment"],
        "to_types": ["concept", "dataset"],
        "description": "Uses concept or dataset in research"
      },
      "REPORTS": {
        "from_types": ["paper"],
        "to_types": ["experiment"],
        "description": "Paper reports experimental results"
      },
      "COLLABORATES_WITH": {
        "from_types": ["author"],
        "to_types": ["author"],
        "description": "Authors have collaborated",
        "strength_guidance": "Based on number of co-authored papers"
      },
      "REPLICATES": {
        "from_types": ["experiment"],
        "to_types": ["experiment"],
        "description": "Replication study"
      }
    }
  }
})
```

---

## Example Data

Store sample research network:

```
memory_store({
  memories: [
    {
      "name": "Attention Is All You Need",
      "memoryType": "paper",
      "localId": "paper_transformer",
      "metadata": {
        "year": 2017,
        "type": "conference",
        "doi": "10.48550/arXiv.1706.03762",
        "venue": "NeurIPS",
        "citations": 98000,
        "tags": ["transformers", "attention", "deep-learning", "nlp"]
      },
      "observations": [
        "Introduced the Transformer architecture based on self-attention",
        "Revolutionized NLP by eliminating recurrence and convolutions",
        "Enabled models like BERT, GPT, and modern LLMs"
      ]
    },
    {
      "name": "Ashish Vaswani",
      "memoryType": "author",
      "localId": "author_vaswani",
      "metadata": {
        "affiliation_type": "industry",
        "h_index": 45
      },
      "observations": [
        "First author on Attention Is All You Need",
        "Former Google Brain researcher"
      ]
    },
    {
      "name": "Google Brain",
      "memoryType": "institution",
      "localId": "inst_google_brain",
      "metadata": {
        "type": "company",
        "country": "US"
      },
      "observations": [
        "Google's AI research division",
        "Pioneer in deep learning research"
      ]
    },
    {
      "name": "Self-Attention Mechanism",
      "memoryType": "concept",
      "localId": "concept_self_attention",
      "metadata": {
        "field": "cs",
        "maturity": "established",
        "first_introduced": 2017
      },
      "observations": [
        "Mechanism for weighting importance of different input elements",
        "Core innovation in Transformer architecture",
        "Replaced recurrence and convolutions in sequence modeling"
      ]
    },
    {
      "name": "WMT 2014 English-German Translation",
      "memoryType": "experiment",
      "localId": "exp_wmt_translation",
      "metadata": {
        "status": "completed",
        "type": "computational",
        "reproducible": true
      },
      "observations": [
        "Benchmark experiment showing Transformer's translation quality",
        "Achieved 28.4 BLEU score on WMT 2014 En-De",
        "Outperformed previous best models with less training time"
      ]
    },
    {
      "name": "WMT 2014 Dataset",
      "memoryType": "dataset",
      "localId": "ds_wmt",
      "metadata": {
        "size": "4.5M sentence pairs",
        "license": "public",
        "format": "parallel text"
      },
      "observations": [
        "Standard benchmark for machine translation",
        "English-German and English-French pairs"
      ]
    }
  ],
  relations: [
    {
      "from": "paper_transformer",
      "to": "author_vaswani",
      "type": "AUTHORED_BY",
      "strength": 1.0
    },
    {
      "from": "author_vaswani",
      "to": "inst_google_brain",
      "type": "AFFILIATED_WITH",
      "strength": 1.0
    },
    {
      "from": "paper_transformer",
      "to": "concept_self_attention",
      "type": "INTRODUCES",
      "strength": 1.0
    },
    {
      "from": "paper_transformer",
      "to": "exp_wmt_translation",
      "type": "REPORTS",
      "strength": 1.0
    },
    {
      "from": "exp_wmt_translation",
      "to": "ds_wmt",
      "type": "USES",
      "strength": 1.0
    }
  ]
})
```

---

## Common Queries

### Find highly cited papers

```
memory_find({
  "query": "citations",
  "memoryTypes": ["paper"],
  "includeContext": "full",
  "orderBy": "relevance",
  "limit": 20
})
```

### Find all papers by an author

```
memory_find({
  "traverseFrom": "<author_memory_id>",
  "traverseRelations": ["AUTHORED_BY"],
  "traverseDirection": "inbound",
  "memoryTypes": ["paper"],
  "includeContext": "full"
})
```

### Find citation network of a paper

```
memory_find({
  "traverseFrom": "<paper_memory_id>",
  "traverseRelations": ["CITES"],
  "traverseDirection": "outbound",
  "maxDepth": 3,
  "memoryTypes": ["paper"],
  "includeContext": "full"
})
```

### Find papers that cite a landmark paper

```
memory_find({
  "traverseFrom": "<paper_memory_id>",
  "traverseRelations": ["CITES"],
  "traverseDirection": "inbound",
  "memoryTypes": ["paper"],
  "includeContext": "full"
})
```

### Find collaborators of an author

```
memory_find({
  "traverseFrom": "<author_memory_id>",
  "traverseRelations": ["COLLABORATES_WITH"],
  "traverseDirection": "both",
  "memoryTypes": ["author"],
  "includeContext": "full"
})
```

### Find papers introducing a concept

```
memory_find({
  "traverseFrom": "<concept_memory_id>",
  "traverseRelations": ["INTRODUCES"],
  "traverseDirection": "inbound",
  "memoryTypes": ["paper"],
  "includeContext": "full"
})
```

### Find recent papers in a field

```
memory_find({
  "query": "year:2024 type:conference",
  "memoryTypes": ["paper"],
  "createdAfter": "30d",
  "includeContext": "full"
})
```

### Find datasets used in a paper

```
memory_find({
  "traverseFrom": "<paper_memory_id>",
  "traverseRelations": ["USES"],
  "traverseDirection": "outbound",
  "memoryTypes": ["dataset"],
  "includeContext": "full"
})
```

---

## Workflow Examples

### Literature Review

```
# 1. Find foundational papers on a topic
memory_find({
  query: "transformers attention",
  memoryTypes: ["paper"],
  includeContext: "full",
  limit: 50
})

# 2. Build citation network
memory_find({
  traverseFrom: "<key_paper_id>",
  traverseRelations: ["CITES"],
  traverseDirection: "both",
  maxDepth: 2,
  includeContext: "full"
})

# 3. Find influential authors
memory_find({
  query: "h_index",
  memoryTypes: ["author"],
  includeContext: "full"
})
```

### Research Collaboration Analysis

```
# 1. Find co-authors
memory_find({
  traverseFrom: "<author_id>",
  traverseRelations: ["AUTHORED_BY"],
  traverseDirection: "inbound",
  includeContext: "relations-only"
})

# 2. Find shared institution connections
memory_find({
  traverseFrom: "<author_id>",
  traverseRelations: ["AFFILIATED_WITH"],
  traverseDirection: "both",
  includeContext: "full"
})
```

### Concept Evolution Tracking

```
# 1. Find origin paper
memory_find({
  traverseFrom: "<concept_id>",
  traverseRelations: ["INTRODUCES"],
  traverseDirection: "inbound",
  includeContext: "full"
})

# 2. Find subsequent work
memory_find({
  traverseFrom: "<concept_id>",
  traverseRelations: ["BUILDS_ON"],
  traverseDirection: "inbound",
  maxDepth: 3,
  includeContext: "full"
})
```

---

## Tips

1. **Citation tracking** - Use CITES relations with timestamps to track influence over time
2. **Author strength** - Weight AUTHORED_BY by author position (first=1.0, last=0.7, middle=0.5)
3. **Collaboration networks** - Build COLLABORATES_WITH based on co-authorship patterns
4. **Impact metrics** - Store citations, h-index in metadata for ranking and filtering
5. **Concept evolution** - Use INTRODUCES and BUILDS_ON to track idea lineage
6. **Dataset provenance** - Link papers to datasets via USES for reproducibility tracking
