# RFC 008: Semantic-Acoustic Linking Strategy

- Feature Name: `semantic_acoustic_linking`
- Start Date: 2026-02-09
- RFC PR: [bible-audio-training/rfcs/0008-linking.md](https://github.com/placeholder)
- Related: RFC 007 (Raw Storage & Beads), RFC 009 (Labeling Assistance), mm_poc_v2 (Meaning Map)

# Summary

This RFC defines a simple strategy to automatically link **pre-labeled monolingual audio** (from the [`beads`](https://github.com/shemaobt/beads) tool) to the corresponding semantic slots in the **Abstract Meaning Map** (Mini-Map). The primary approach uses **rule-based matching** with an optional semantic similarity fallback for handling annotation inconsistencies.

# Motivation

## The Problem

We have two data sources that need to be connected:

**1. Mini-Map (Abstract Semantic Structure)**
```json
{
  "pericope_id": "Mark_14:66-72",
  "events": [
    {"id": "evt_denial_01", "actor": "Peter", "action": "Denial", "emotion": "Fear", "audio_ref": null}
  ]
}
```

**2. Labeled Audio (Beads Output)**
```json
{
  "language": "Satere-Mawe",
  "segments": [
    {"id": "seg_001", "start": 12.4, "end": 15.8, "tags": {"actor": "Peter", "action": "Denial", "emotion": "Fear"}}
  ]
}
```

Currently, linking these requires **manual matching** (30 min per pericope). For 1000 pericopes, this is impractical.

# Guide-level Explanation

## Approach 1: Rule-Based Matching (Primary)

If both datasets use the **same controlled vocabulary**, use exact string matching:

```python
def link_audio_to_minimap(minimap_event, audio_segments):
    for segment in audio_segments:
        if all([
            segment.tags.get("actor") == minimap_event.actor,
            segment.tags.get("action") == minimap_event.action,
            segment.tags.get("emotion") == minimap_event.emotion
        ]):
            return segment.id  # Perfect match
    return None  # No match found
```

**When this works**: 
- Vocabularies are identical and controlled
- Expected success rate: >90%

## Approach 2: Semantic Similarity (Fallback)

For handling annotation inconsistencies (e.g., "Grief" vs "Sorrow"), use a pre-trained sentence encoder:

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

def semantic_match(minimap_event, audio_segments):
    query = f"{minimap_event.actor} {minimap_event.action} {minimap_event.emotion}"
    query_emb = model.encode(query)
    
    best_match = None
    best_score = 0
    
    for segment in audio_segments:
        text = f"{segment.tags.actor} {segment.tags.action} {segment.tags.emotion}"
        score = cosine_similarity(query_emb, model.encode(text))
        if score > best_score:
            best_score = score
            best_match = segment
    
    return best_match if best_score > 0.85 else None
```

**When this helps**:
- Synonyms: "Grief" ≈ "Sorrow"
- Typos: "Denial" vs "Deniall"
- Hierarchies: "Speaking" ⊃ "Commanding"

# Reference-level Explanation

## Implementation Strategy

### Phase 1: Exact Matching
1. Normalize field names (lowercase, strip whitespace)
2. Build index of audio segments by semantic tags
3. For each Mini-Map event, look up in index
4. Return match if found

### Phase 2: Fuzzy Matching (if needed)
1. For unmatched events, compute semantic embeddings
2. Rank audio segments by similarity score
3. Return top match if score > threshold (0.85)
4. Flag low-confidence matches (0.7-0.85) for human review

### Output Format
```json
{
  "evt_denial_01": {
    "audio_ref": "seg_001",
    "match_type": "exact",
    "confidence": 1.0
  },
  "evt_weeping_01": {
    "audio_ref": "seg_005",
    "match_type": "semantic",
    "confidence": 0.92
  }
}
```

# Rationale

**Start Simple**: Rule-based matching requires zero training data and is deterministic. Most real-world vocabularies (especially for biblical narratives) are controlled and consistent.

**Add Complexity Only When Needed**: If >10% of matches fail, add semantic similarity. If >30% fail, consider RFC 009 (labeling improvements).

# Alternative Approaches

| Approach | Pros | Cons |
|----------|------|------|
| **Manual Linking** | 100% accurate | Labor-intensive (30 min/pericope) |
| **Exact Matching** | Fast, deterministic, no training | Fails on synonyms/typos |
| **Fuzzy String Match** | Handles typos | Doesn't understand semantics ("Grief" ≠ "Joy") |
| **Cross-Encoder Model** | High accuracy | Requires training data, complex setup |

**Recommended**: Exact matching + Sentence Transformer fallback

# Implementation

**Estimated Effort**: 2-3 days
- Day 1: Build exact matching script
- Day 2: Add semantic similarity fallback
- Day 3: Test on 100 pericopes, measure accuracy

**Dependencies**:
- `sentence-transformers` (if using semantic matching)
- Access to Mini-Map database schema
- Beads output format (JSON)

# Success Criteria

- **Accuracy**: >95% correct matches on test set (100 pericopes)
- **Speed**: <1 second per pericope
- **Human Review**: <5% of matches flagged for manual verification
