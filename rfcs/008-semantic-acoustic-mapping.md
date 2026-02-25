# RFC 008: Proposal: Semantic-Acoustic Linking via Generative Retrieval

- Feature Name: `semantic_acoustic_linking`
- Start Date: 2026-02-09
- RFC PR: [bible-audio-training/rfcs/0002-semantic-linking.md](https://github.com/placeholder)
- Related: RFC 007 (Raw Storage & Beads Labeling), mm_poc_v2 (Meaning Map)

---

# Summary

This RFC proposes using **Generative Retrieval** to automatically link **pre-labeled monolingual audio** (annotated via [`beads`](https://github.com/shemaobt/beads)) to the corresponding semantic slots in the **Abstract Meaning Map** (Mini-Map). 

**The Setup**:
- We have a **Mini-Map**: A language-agnostic semantic structure defining "what happens" in a pericope (actors, actions, emotions)
- We have **Labeled Audio**: Monolingual recordings where segments are already tagged with semantic categories (via `beads`)

**The Challenge**: Automatically match the labeled audio segments to their corresponding Mini-Map slots

**The Proposed Solution**: Train a generative model to encode both semantic descriptions and audio labels into a shared embedding space, enabling semantic search and automatic linking.

---

# Motivation

## The Current State

### What We Have

#### 1. The Mini-Map (Abstract Semantic Structure)
The [Meaning Map](https://github.com/shemaobt/mm_poc_v2) defines **language-agnostic semantic slots** for biblical pericopes:

```json
{
  "pericope_id": "Mark_14:66-72",
  "events": [
    {
      "id": "evt_denial_01",
      "actor": "Peter",
      "action": "Denial",
      "emotion": "Fear",
      "context": "First_Accusation",
      "audio_ref": null  // NEEDS TO BE POPULATED
    },
    {
      "id": "evt_weeping_01",
      "actor": "Peter",
      "action": "Weeping",
      "emotion": "Grief",
      "context": "Realization",
      "audio_ref": null  // NEEDS TO BE POPULATED
    }
  ]
}
```

#### 2. Labeled Monolingual Audio (Beads Output)
Using the `beads` tool (RFC 007), linguists have segmented and tagged the audio:

```json
{
  "language": "Satere-Mawe",
  "pericope_id": "Mark_14:66-72",
  "segments": [
    {
      "id": "seg_001",
      "start": 12.4,
      "end": 15.8,
      "tags": {
        "actor": "Peter",
        "action": "Denial",
        "emotion": "Fear"
      }
    },
    {
      "id": "seg_005",
      "start": 42.1,
      "end": 45.3,
      "tags": {
        "actor": "Peter",
        "action": "Weeping",
        "emotion": "Grief"
      }
    }
  ]
}
```

### The Problem: Manual Linking is Tedious

Currently, to populate the Mini-Map with audio references, a human must:
1. Look at the Mini-Map slot: `"evt_denial_01": {actor: Peter, action: Denial, emotion: Fear}`
2. Search through the labeled audio segments to find: `seg_001: {Peter, Denial, Fear}`
3. Manually create the link: `"audio_ref": "seg_001"`

For a single pericope with 20 events, this takes ~30 minutes. For 1000 pericopes, this is impractical.

### The Opportunity: Automatic Semantic Matching

If we could **automatically match** the semantic descriptions in the Mini-Map to the semantic tags in the labeled audio, we could:
1. **Populate** Mini-Maps with audio evidence at scale
2. **Query** across languages: "Find all audio tagged with 'Grief' across 50 languages"
3. **Validate** annotations: Flag mismatches between expected Mini-Map structure and actual audio tags

---

# Core Proposal

## High-Level Concept

We propose treating this as a **Semantic Retrieval Problem** solved via **Generative Embeddings**.

### The Workflow

```mermaid
graph LR
    A[Mini-Map Slot] -->|Encode| B[Semantic Embedding]
    C[Audio Segment Tags] -->|Encode| D[Audio Label Embedding]
    B -->|Compute Similarity| E{Match?}
    D -->|Compute Similarity| E
    E -->|Yes, High Similarity| F[Create Link]
    E -->|No, Low Similarity| G[Flag for Review]
```

### Step 1: Encoding
- **Mini-Map Slot**: `{actor: Peter, action: Weeping, emotion: Grief}` → Vector $\mathbf{v}_{\text{map}}$
- **Audio Segment**: `{actor: Peter, action: Weeping, emotion: Grief}` → Vector $\mathbf{v}_{\text{audio}}$

### Step 2: Matching
- Compute cosine similarity: $\text{sim}(\mathbf{v}_{\text{map}}, \mathbf{v}_{\text{audio}})$
- If similarity > threshold (e.g., 0.9), create link
- If 0.7 < similarity < 0.9, flag for human review
- If similarity < 0.7, no match

### Step 3: Population
Link the audio segment to the Mini-Map:
```json
{
  "id": "evt_weeping_01",
  "actor": "Peter",
  "action": "Weeping",
  "emotion": "Grief",
  "audio_ref": "seg_005"  // AUTOMATICALLY POPULATED
}
```

---

# Why "Generative"?

You might ask: "Why not just use exact string matching?"

## The Challenge: Semantic Variability

While the core categories might match, there are subtle variations:
- **Mini-Map**: `emotion: "Grief"`
- **Audio Tag**: `emotion: "Sorrow"` (synonym)

Or hierarchical relationships:
- **Mini-Map**: `action: "Speaking"`
- **Audio Tag**: `action: "Commanding"` (more specific)

Or multi-attribute matching:
- **Mini-Map**: `{actor: Peter, action: Denial, context: Third_Accusation}`
- **Audio Segment 1**: `{actor: Peter, action: Denial}` (partial match)
- **Audio Segment 2**: `{actor: Peter, context: Third_Accusation}` (partial match)

**Solution**: Use a **Generative Language Model** (e.g., fine-tuned T5 or GPT) to:
1. Understand semantic equivalence ("Grief" ≈ "Sorrow")
2. Handle hierarchies ("Commanding" ⊂ "Speaking")
3. Compute soft matches for partial overlaps

---

# Technical Architecture

## Proposed Model: Cross-Encoder for Semantic Matching

### Architecture Choice
We propose a **Cross-Encoder** architecture (e.g., fine-tuned BERT/RoBERTa) that takes two inputs:
- Mini-Map semantic description
- Audio segment tags

And outputs a **match score** (0-1).

### Input Format
```
[CLS] actor: Peter | action: Weeping | emotion: Grief [SEP] 
      actor: Peter | action: Weeping | emotion: Grief [SEP]
```

### Training Data
Create synthetic training pairs:
- **Positive pairs**: Identical or compatible tags (score = 1.0)
  - `(Peter, Weeping, Grief)` ↔ `(Peter, Weeping, Grief)` → 1.0
  - `(Mary, Speaking)` ↔ `(Mary, Speaking, Declaration)` → 0.9 (partial)
- **Negative pairs**: Incompatible tags (score = 0.0)
  - `(Peter, Weeping)` ↔ `(Judas, Betrayal)` → 0.0

### Training Objective
Binary cross-entropy on match scores:
```python
loss = -[y * log(p) + (1-y) * log(1-p)]
```
where `y` is ground truth match (0 or 1) and `p` is predicted probability.

---

# Feasibility Analysis

## What Makes This Plausible?

### 1. Structured Data
Both the Mini-Map and audio tags follow the **same semantic schema** (actor, action, emotion, context). This makes matching tractable.

### 2. Small Vocabulary
The semantic categories are drawn from a **controlled ontology** (~100 actions, ~20 emotions). This is much easier than open-ended text matching.

### 3. Transfer Learning
We can fine-tune existing language models (BERT, RoBERTa) that already understand semantic similarity from pre-training.

## Critical Challenges

### 1. Annotation Inconsistencies
**Problem**: What if the audio was tagged as `emotion: "Sadness"` but the Mini-Map uses `emotion: "Grief"`?

**Mitigation**:
- Maintain a **synonym dictionary**: `{Grief: [Sorrow, Sadness, Mourning]}`
- Use the model to learn these equivalences from examples
- Flag low-confidence matches for human verification

### 2. Partial Matches
**Problem**: An audio segment might have `{actor: Peter, action: Weeping}` but the Mini-Map slot has `{actor: Peter, action: Weeping, emotion: Grief, context: Realization}`.

**Mitigation**:
- Use **soft matching**: Partial overlap gets score 0.6-0.8
- Require human confirmation for scores < 0.9
- Alternatively, use this as a signal to improve audio annotations

### 3. Multiple Candidates
**Problem**: Multiple audio segments might match the same Mini-Map slot.

**Mitigation**:
- Return **top-K matches** ranked by score
- Use temporal context: Prefer segments in expected narrative order
- Flag for human selection if top-2 scores are very close

---

# Alternative Approaches

## Option A: Rule-Based String Matching
Exact match on actor, action, emotion fields.

**Pros**: Simple, deterministic, no training needed
**Cons**: Fails on synonyms, can't handle partial matches, brittle

## Option B: Fuzzy String Matching (Levenshtein Distance)
Use edit distance to match similar strings.

**Pros**: Handles typos, simple to implement
**Cons**: Doesn't understand semantics ("Grief" vs "Joy" have similar edit distance but opposite meanings)

## Option C: Manual Embedding with Rules
Hand-craft embedding rules: "Weeping" and "Crying" get same vector.

**Pros**: Interpretable, controllable
**Cons**: Doesn't scale, misses nuanced relationships

**Our Choice**: Cross-Encoder balances accuracy with practical training requirements.

---

# Data Requirements

## Training Dataset

Since both Mini-Map and audio tags follow the same schema, we can create training data **synthetically**:

### Positive Pairs (Score ≈ 1.0)
- Exact matches: `(Peter, Denial, Fear)` ↔ `(Peter, Denial, Fear)`
- Synonyms: `(Peter, Weeping, Grief)` ↔ `(Peter, Crying, Sorrow)`
- Hierarchies: `(Jesus, Speaking)` ↔ `(Jesus, Teaching)` 

### Negative Pairs (Score ≈ 0.0)
- Different actors: `(Peter, Denial)` ↔ `(Judas, Betrayal)`
- Different actions: `(Mary, Weeping)` ↔ `(Mary, Rejoicing)`

### Partial Matches (Score ≈ 0.5-0.8)
- Subset: `(Peter, Denial)` ↔ `(Peter, Denial, Fear, First_Accusation)`
- Overlap: `(Peter, Denial, Fear)` ↔ `(Peter, Fear)`

**Target**: 10,000 training pairs (can be auto-generated from ontology)

---

# Evaluation Strategy

## Metrics

### 1. Retrieval Accuracy (Primary)
**Task**: Given a Mini-Map slot, retrieve the correct audio segment

- **Accuracy@1**: % of times the top match is correct
- **Accuracy@5**: % of times the correct match is in top-5

**Success Criterion**: Accuracy@1 > 85%, Accuracy@5 > 95%

### 2. Time Savings
**Task**: Measure time taken to link 20 Mini-Map slots

- **Baseline (Manual)**: ~30 minutes
- **With Model**: ~5 minutes (reviewing top-3 suggestions)

**Success Criterion**: >80% time reduction

### 3. False Positive Rate
**Task**: Measure how often the model creates incorrect links

**Success Criterion**: <5% false positives (with threshold tuning)

---

# Handling Unlabeled Audio (Extension)

While the core proposal assumes pre-labeled audio, we can extend to **partially labeled** scenarios:

## Scenario: Some Segments Lack Tags

If audio segment `seg_003` has no semantic tags but appears at the right temporal position:

### Option 1: Acoustic Similarity (Future Work)
- Use acousteme embeddings (from RFC 007) to match based on audio patterns
- "This segment sounds similar to other 'Weeping' segments"

### Option 2: Temporal Heuristics
- Use narrative order: If `seg_001` (Denial) and `seg_005` (Weeping) are matched, suggest `seg_003` (in between) for intermediate event

### Option 3: Flag for Manual Labeling
- Simply flag unlabeled segments that occur in expected locations
- Suggest: "Please label `seg_003` - it might be 'Realization'"

**Recommendation**: Start with fully labeled data (Phase 1), then explore acoustic matching (Phase 2)

---

# Implementation Plan

## Phase 1: Proof of Concept (4 weeks)

### Week 1-2: Data Preparation
1. Extract 100 Mini-Map pericopes
2. Extract corresponding labeled audio segments (beads output)
3. Generate synthetic training pairs (10K examples)

### Week 3: Model Training
1. Fine-tune BERT-base on matching task
2. Train cross-encoder with contrastive loss
3. Evaluate on held-out test set (20 pericopes)

### Week 4: Integration & Testing
1. Build linking script: `link_audio_to_minimap.py`
2. Run on 20 test pericopes
3. Measure Accuracy@1, Accuracy@5, time savings

## Phase 2: Production Deployment (4 weeks)

### Week 5-6: Scaling
1. Process 1000 pericopes
2. Optimize inference speed (batching, caching)
3. Build review interface for low-confidence matches

### Week 7-8: Validation & Refinement
1. Linguist review of 100 automatically linked pericopes
2. Collect feedback, retrain model
3. Document failure modes

---

# Success Criteria

This proposal is **successful** if:
1. **Accuracy**: Achieves >85% Accuracy@1 on test set
2. **Efficiency**: Reduces manual linking time by >80%
3. **Adoption**: Linguists prefer using the tool over manual linking

This proposal is **worth continuing** if:
- Accuracy@5 > 70% (even if Accuracy@1 is lower, providing top-5 is helpful)
- Model identifies edge cases that improve ontology design

---

# Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Ontology drift (Mini-Map vs audio tags use different terms) | High | Maintain shared vocabulary; periodic alignment reviews |
| Partial labeling in audio (missing tags) | Medium | Start with fully labeled subset; extend to acoustic matching later |
| Multiple valid matches (ambiguous events) | Medium | Return top-K; use temporal context as tiebreaker |
| Model hallucination (confident wrong match) | High | Confidence thresholding; human review for score < 0.9 |

---

# Future Directions

## If Successful
1. **Cross-Lingual Scaling**: Link Mini-Maps to audio in 50+ minority languages
2. **Acoustic Matching**: Extend to unlabeled audio using acousteme embeddings
3. **Generative Audio Synthesis**: Given a Mini-Map slot with no audio, generate synthetic speech

## If Partially Successful
- Use as **ranking tool**: Present top-5 candidates to speed up manual linking
- Focus on high-confidence categories (exact matches, no ambiguity)

## If Unsuccessful
- Investigate failure modes: Are ontology mismatches systematic?
- Pivot to simpler rule-based matching with human verification

---

# Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 1: Proof of Concept** | 4 weeks | Trained model + test results (Accuracy@1) |
| **Phase 2: Production** | 4 weeks | Linking tool + 1000 linked pericopes |
| **Phase 3: Validation** | 2 weeks | Linguist feedback report + iteration |

**Total**: 10 weeks for production-ready system

---

# References

1. [RFC 007: Raw-First Acousteme Storage](./007-raw-acoustemes-storage.md)
2. [Beads Frontend Repository](https://github.com/shemaobt/beads)
3. [mm_poc_v2: Meaning Map](https://github.com/shemaobt/mm_poc_v2)
4. Reimers & Gurevych, "[Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks](https://arxiv.org/abs/1908.10084)"
5. Humeau et al., "[Poly-encoders: Architectures and Pre-training Strategies for Fast and Accurate Multi-sentence Scoring](https://arxiv.org/abs/1905.01969)"
- Start Date: 2026-02-09
- RFC PR: [bible-audio-training/rfcs/0002-semantic-mapping.md](https://github.com/placeholder)
- Related: RFC 007 (Raw Storage & Beads Labeling), mm_poc_v2 (Meaning Map)

---

# Summary

This RFC proposes an **experimental research direction** to bridge the gap between **Abstract Meaning Maps** (language-agnostic semantic structures) and **Monolingual Audio** (acousteme sequences). By leveraging manually labeled audio segments from the [`beads`](https://github.com/shemaobt/beads) tool (RFC 007) as ground truth, we investigate whether a **Generative Transformer Model** can learn to automatically match unlabeled audio segments to empty slots in the Meaning Map, effectively "filling the map" with acoustic evidence.

**Core Hypothesis**: If we teach a model the relationship between acoustic patterns and abstract semantic categories, it can predict which audio segment corresponds to which meaning slot with sufficient accuracy to accelerate the annotation process.

---

# Motivation

## The Problem Space

### 1. The Abstract Meaning Map
The [Meaning Map](https://github.com/shemaobt/mm_poc_v2) (`mm_poc_v2`) is a **language-agnostic semantic framework** that represents biblical pericopes as structured data:

```json
{
  "pericope_id": "Mark 14:66-72",
  "events": [
    {
      "id": "evt_denial_01",
      "actor": "Peter",
      "action": "Denial",
      "addressee": "Servant Girl",
      "emotion": "Fear",
      "context": "First Accusation"
    },
    {
      "id": "evt_weeping_01",
      "actor": "Peter",
      "action": "Weeping",
      "emotion": "Grief",
      "context": "Realization"
    }
  ]
}
```

This abstraction exists **independently** of any specific language. It describes *what happens* semantically but contains no reference to *how* it sounds in a particular oral tradition.

### 2. The Monolingual Audio Gap
We possess vast amounts of **monolingual audio** (biblical oral narratives in minority languages) that align with these pericopes. However:
- **The Challenge**: We cannot easily determine *which 5-second audio segment* corresponds to *which semantic event* without manual alignment.
- **Current Manual Process**: Linguists use the `beads` tool (RFC 007) to segment and tag audio, but this is labor-intensive (e.g., 1 hour per 5-minute recording).

### 3. The Opportunity
If we could **automate** or **semi-automate** this matching process, we could:
1. Populate Meaning Maps with audio evidence at scale
2. Enable cross-linguistic semantic search ("Find all 'Grief' moments across 50 languages")
3. Accelerate minority language Bible translation workflows

---

# Core Proposal

## High-Level Concept

We propose a **Three-Phase Approach**:

### Phase 1: Ground Truth via Beads
Use the `beads` frontend (RFC 007) to manually label a **seed dataset**:
- **Input**: Raw acousteme sequences from `acoustemes.json`
- **Action**: Human annotators segment and tag audio with Meaning Map categories
- **Output**: Validated pairs `(AcoustemeSequence, SemanticSlot)`

**Example**:
```json
{
  "audio_segment": {
    "start": 142.5,
    "end": 145.8,
    "acoustemes": [31, 42, 99, 105, 31, ...]
  },
  "semantic_label": {
    "event_id": "evt_weeping_01",
    "category": "Weeping",
    "emotion": "Grief"
  }
}
```

### Phase 2: Generative Model Training
Train a **Multimodal Transformer** to learn the joint distribution:
- $P(\text{Acoustemes} \mid \text{Semantic Category})$
- $P(\text{Semantic Category} \mid \text{Acoustemes})$

**Architecture Hypothesis**: Adapt [AudioLM](https://arxiv.org/abs/2209.03143) or similar models that treat discrete audio codes and semantic tokens as parallel languages.

### Phase 3: Gap Filling (Inference)
Given:
- A **partially filled Meaning Map** (e.g., 20% of events have audio links)
- A **full monolingual audio recording** of the pericope

The model:
1. Encodes all audio segments into a latent space
2. Encodes all unfilled semantic slots into the same space
3. Computes distances and proposes matches: *"Audio segment at 02:14-02:18 matches 'evt_denial_01' with 87% confidence"*

---

# Feasibility Analysis

## What Makes This Plausible?

### 1. Discrete Acoustic Representations
Our MMS-300M model (RFC 007) already produces **discrete acousteme codes** (Units 0-1023). This is analogous to:
- Text tokenization for LLMs
- VQ-VAE codes for image generation

**Implication**: We can treat acoustemes like "words in an acoustic language" and apply NLP techniques.

### 2. Transfer Learning from Text-Based Models
Recent work (e.g., [CLIP](https://arxiv.org/abs/2103.00020), [ImageBind](https://arxiv.org/abs/2305.05665)) demonstrates that **multimodal embeddings** can align disparate modalities (text-image, text-audio).

**Adapted Approach**: Train a contrastive loss between:
- Acousteme sequence embeddings
- Semantic category embeddings (derived from Meaning Map ontology)

### 3. Semantic Consistency Across Languages
While acoustic patterns vary across languages, certain **prosodic universals** exist:
- **Grief**: Slower tempo, pitch drops
- **Urgency**: Faster tempo, pitch rises
- **Questions**: Rising intonation

**Hypothesis**: The model can learn these acoustic-semantic correlations even from monolingual data, enabling cross-linguistic transfer.

## Critical Challenges

### 1. Data Scarcity
**Problem**: How many labeled "beads" are needed to train a robust model?

**Mitigation Strategies**:
- **Few-Shot Learning**: Use pre-trained acoustic models (e.g., MMS-300M) as frozen feature extractors
- **Data Augmentation**: Stretch/compress audio segments, add environmental noise
- **Synthetic Data**: Use TTS systems to generate additional training pairs (controversial but worth exploring)

**Proposed Baseline**: Start with 100 labeled segments per semantic category (e.g., 100 "Grief" examples, 100 "Joy" examples).

### 2. Ambiguity in Temporal Alignment
**Problem**: A Meaning Map event might span 10 seconds, but the audio might express it in 2 seconds or spread it across non-contiguous segments.

**Mitigation**:
- **Soft Matching**: Allow the model to propose *multiple* audio segments per semantic slot
- **Confidence Thresholding**: Only auto-fill slots with >90% confidence; flag others for human review

### 3. Speaker vs. Semantic Features
**Problem**: The model might learn "Speaker A's voice" rather than "Grief prosody."

**Mitigation**:
- **Multi-Speaker Training**: Ensure the seed dataset includes multiple speakers expressing the same semantic category
- **Speaker Disentanglement**: Use techniques from voice conversion (e.g., disentangling speaker identity from content)

---

# Technical Architecture

## Proposed Model: Dual-Encoder with Contrastive Learning

### Component 1: Acoustic Encoder
**Input**: Sequence of acousteme IDs `[31, 42, 99, ...]`
**Architecture**: Transformer Encoder (6 layers, 512 hidden dims)
**Output**: Fixed-size embedding $\mathbf{e}_{\text{audio}} \in \mathbb{R}^{512}$

### Component 2: Semantic Encoder
**Input**: Semantic category (e.g., `{"action": "Weeping", "emotion": "Grief"}`)
**Architecture**: Text Encoder (e.g., fine-tuned BERT/RoBERTa on Meaning Map ontology)
**Output**: Fixed-size embedding $\mathbf{e}_{\text{semantic}} \in \mathbb{R}^{512}$

### Training Objective: Contrastive Loss
```python
# Positive pairs: (audio, correct_semantic_label)
# Negative pairs: (audio, random_semantic_label)

loss = -log( exp(sim(e_audio, e_semantic_pos) / τ) / 
             Σ exp(sim(e_audio, e_semantic_neg) / τ) )
```

where `sim(·,·)` is cosine similarity and `τ` is a temperature parameter.

### Inference: Nearest Neighbor Search
For each unfilled semantic slot:
1. Encode the semantic description → $\mathbf{e}_{\text{target}}$
2. Encode all audio segments → $\{\mathbf{e}_{\text{audio}_1}, \mathbf{e}_{\text{audio}_2}, ...\}$
3. Find $\arg\max_i \, \text{sim}(\mathbf{e}_{\text{target}}, \mathbf{e}_{\text{audio}_i})$
4. Return top-K matches with confidence scores

---

# Data Requirements

## Seed Dataset Construction (Phase 1)

### Labeling Protocol via Beads
1. **Selection**: Choose 10 diverse pericopes (varying emotions, actions, speakers)
2. **Annotation**: For each pericope, use `beads` to:
   - Segment audio into meaningful chunks (0.5s - 5s)
   - Tag each chunk with Meaning Map categories
3. **Quality Control**: Cross-validate with 2 annotators per pericope

### Target Metrics
| Category | Min Samples | Ideal Samples |
|----------|-------------|---------------|
| Core Actions (Speak, Move, Weep) | 50 | 200 |
| Emotions (Joy, Grief, Fear, Anger) | 50 | 200 |
| Prosodic Markers (Question, Command) | 30 | 100 |

**Total Labeling Effort**: ~20 hours (assuming 1 min per segment)

---

# Evaluation Strategy

## Metrics

### 1. Retrieval Accuracy (Primary Metric)
**Task**: Given a semantic slot, rank all audio segments. Measure:
- **Recall@5**: Is the correct segment in the top 5 predictions?
- **Mean Reciprocal Rank (MRR)**: Average position of the correct match

**Success Criterion**: MRR > 0.6 (correct match in top 2 on average)

### 2. Temporal Precision
**Task**: Measure overlap between predicted segment boundaries and ground truth
- **Intersection over Union (IoU)**: $\frac{\text{overlap}}{\text{union}}$

**Success Criterion**: IoU > 0.5 for 70% of matches

### 3. Human-in-the-Loop Validation
**Task**: Show linguists the top-3 predicted matches
- **Acceptance Rate**: % of times a linguist accepts one of the top-3

**Success Criterion**: >80% acceptance rate

---

# Alternative Approaches

## Option A: Rule-Based Prosody Analysis
Instead of deep learning, use signal processing:
- Extract pitch, tempo, energy features
- Define heuristics: "Grief = low pitch + slow tempo"

**Pros**: Interpretable, low data requirements
**Cons**: Brittle, language-specific, misses nuanced patterns

## Option B: Fully Supervised Classifier
Train a simple acoustic classifier (e.g., CNN on mel-spectrograms)

**Pros**: Standard approach, well-understood
**Cons**: Requires labeled spectrograms (harder to annotate than beads), doesn't leverage discrete acoustemes

## Option C: Clustering + Manual Assignment
- Cluster acousteme sequences using k-means
- Manually assign cluster centroids to semantic categories

**Pros**: No model training needed
**Cons**: Assumes distinct clusters exist, doesn't generalize well

**Our Choice**: **Proposed Approach** (Dual-Encoder) balances data efficiency with generalization potential.

---

# Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Insufficient labeled data | High | Medium | Start with limited categories; expand iteratively |
| Model overfits to speaker identity | High | High | Multi-speaker training + disentanglement techniques |
| Temporal misalignment | Medium | High | Soft matching + confidence thresholds |
| Cross-linguistic failure | Medium | Low | Initially scope to single language; expand cautiously |
| Meaning Map schema changes | Low | Medium | Version control; retrain incrementally |

---

# Success Criteria

This proposal is **successful** if, after 3 months:
1. **Proof of Concept**: Achieve MRR > 0.5 on a held-out test set (20% of labeled data)
2. **Practical Value**: Reduce manual alignment time by >50% (measured via A/B test with linguists)
3. **Scalability**: Model generalizes to at least 3 distinct speakers without retraining

This proposal is **worth continuing** if:
- Linguists report the predictions are "helpful, even if imperfect"
- The approach uncovers novel insights about acoustic-semantic patterns

---

# Future Directions

## If Successful
1. **Generative Synthesis**: Train the reverse direction ($\text{Semantic} \rightarrow \text{Acoustemes}$) to generate synthetic audio for meaning slots
2. **Cross-Lingual Transfer**: Test whether a model trained on Language A can predict meaning in Language B
3. **Integration with mm_poc_v2**: Add an `audio_refs` table to the database, linking events to timestamped audio

## If Partially Successful
- Use as a **ranking tool**: Present top-10 candidates to linguists for quick selection
- Focus on high-confidence categories (e.g., "Questions" with rising intonation)

## If Unsuccessful
- Document failure modes to inform future prosody research
- Pivot to simpler acoustic feature extraction for Meaning Map enrichment

---

# Timeline & Milestones

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 1: Data Collection** | 4 weeks | 500 labeled beads across 5 categories |
| **Phase 2: Model Development** | 6 weeks | Trained dual-encoder + baseline results |
| **Phase 3: Evaluation** | 2 weeks | MRR metrics + linguist feedback report |
| **Phase 4: Iteration** | 4 weeks | Refinements based on failure analysis |

**Total**: 16 weeks for initial proof-of-concept

---

# References

1. [RFC 007: Raw-First Acousteme Storage](./007-raw-acoustemes-storage.md)
2. [Beads Frontend Repository](https://github.com/shemaobt/beads)
3. [mm_poc_v2: Meaning Map](https://github.com/shemaobt/mm_poc_v2)
4. Borsos et al., "[AudioLM: A Language Modeling Approach to Audio Generation](https://arxiv.org/abs/2209.03143)"
5. Radford et al., "[Learning Transferable Visual Models](https://arxiv.org/abs/2103.00020)" (CLIP)
6. Girdhar et al., "[ImageBind: One Embedding Space](https://arxiv.org/abs/2305.05665)"
