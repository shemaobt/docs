# RFC 010: Parallel Acousteme-to-Acousteme Translation Track

- Feature Name: `parallel_acousteme_translation`
- Start Date: 2026-02-23
- RFC PR: [bible-audio-training/rfcs/0010-parallel-acousteme-latent-translation.md](https://github.com/placeholder)
- Related: RFC 006 (AudioLM Integration), RFC 007 (Raw Acoustemes Storage), RFC 008 (Semantic-Acoustic Linking), RFC 009 (XEUS vs MMS)

# Summary

This RFC proposes a parallel R&D track: train a translation model directly on **paired source-target audio** by converting both sides into acousteme sequences and learning translation in a **shared latent space**.

This track is explicitly **text-free by design**. Text transcripts, ASR outputs, and MT text supervision are out of scope for training and inference.

The system learns mapping:

`source_audio -> source_acoustemes -> latent_translation -> target_acoustemes -> target_audio`

Recommendation: start this as a **parallel experimental pipeline** while keeping the current production path unchanged. The approach is promising for low-resource oral settings but requires careful handling of alignment, duration mismatch, semantic drift, and text-free evaluation reliability.

# Motivation

Our current trajectory already builds strong acousteme infrastructure (extraction, storage, linking, vocoder conditioning). The missing piece is whether acoustemes can become the primary translation substrate, not just a synthesis intermediate.

Why this is compelling:
- We already have paired audio examples.
- Text may be unavailable, noisy, or culturally misaligned in oral-first contexts.
- Discrete token spaces can simplify modeling compared to waveform-to-waveform translation.
- A latent translation model can potentially generalize better across speakers and recording conditions.

## Hard Constraint: No Text Dependency

In this RFC, "text-free" means:
- No source transcripts in training.
- No target transcripts in training.
- No ASR-generated pseudo text as intermediate supervision.
- No text MT system in the inference path.

Allowed metadata:
- Pair ids, speaker ids, timestamps, quality tags, and semantic/event ids from audio annotation workflows (RFC 008), as long as these are not text sentence targets.

# Guide-level Explanation

## Core Idea

1. Extract token streams from source and target audio using the selected backbone (`mms` or `xeus`) plus tokenization.
2. Train an encoder-decoder (or latent sequence model) that maps source token sequences to target token sequences.
3. Decode predicted target acoustemes into waveform with the target vocoder stack.

The model predicts **target speech units** directly and never predicts text tokens.

## Why "Latent Space" Matters

Direct token-to-token translation can overfit surface patterns. A latent bottleneck helps the model represent:
- semantic intent,
- discourse function,
- coarse prosody/structure,
- speaker-invariant content factors.

This makes it easier to translate meaning while keeping acoustic generation controllable downstream.

# Reference-level Explanation

## Proposed Architecture

### Input/Output Units

- Input: source acousteme sequence `U_src = [u1, u2, ... uT]`
- Output: target acousteme sequence `U_tgt = [v1, v2, ... vK]`
- Note: `T != K` is expected due to speaking-rate and language-structure differences.

### Model Family Options

Option A (recommended start): **Seq2Seq discrete unit translator**
- Encoder over `U_src`
- Latent bottleneck `Z`
- Autoregressive decoder over target units
- Loss: cross-entropy on target unit prediction

Option B: **Non-autoregressive latent translator**
- CTC/duration-aware decoding
- Faster inference but often less stable in low-resource settings

Option C: **Latent diffusion over unit sequences**
- Potentially higher quality and diversity
- Highest complexity and training cost

## Latent-Space Learning Objectives

Base objective:
- `L_unit`: token prediction loss for target acoustemes

Recommended auxiliary objectives:
- `L_align`: monotonic/soft alignment regularization between source and target timelines
- `L_contrastive`: pull paired utterances together in latent space, push negatives apart
- `L_cycle` (optional): source->target->source consistency in token space
- `L_duration`: predicted duration prior to avoid degenerate short/long outputs

Total loss:
- `L = lambda1*L_unit + lambda2*L_align + lambda3*L_contrastive + lambda4*L_duration (+ lambda5*L_cycle)`

## Data and Alignment Strategy

### Minimum Data Contract
- Paired utterances: `(audio_src_i, audio_tgt_i)`
- Pair-level metadata: pericope/chunk id, speaker id (if known), quality tag
- No transcript fields required or consumed by the model

### Alignment Levels
- Level 1: Pair-level only (fastest start, no internal timestamps)
- Level 2: Segment-level alignment (better training stability)
- Level 3: Event/semantic-slot alignment from RFC 008 (best for difficult pairs)

Start at Level 1, but invest early in Level 2 for quality gains.

## Where This Fits in Current Stack

Parallel track, not replacement:
- Existing track: current translation/synthesis pipeline remains default.
- New track: acousteme translation model trained/evaluated in isolation.
- Integration point: same vocoder backend for waveform generation from predicted target units.

This preserves roadmap safety while enabling direct measurement of acousteme-first translation potential.

# Rationale

Why this can work:
- Discrete units reduce output search space compared to raw waveform prediction.
- Latent modeling can abstract away speaker and channel variation.
- Paired audio supervision directly matches the final task objective.

Why this can fail:
- Acoustemes may entangle content and speaker/prosody in unstable ways.
- Unit mismatch across languages can produce semantically plausible but wrong outputs.
- Without strong alignment constraints, the model may collapse to frequent token patterns.

# Alternative Approaches

| Approach | Pros | Cons |
|----------|------|------|
| Cascaded ASR->MT->TTS | Mature ecosystem, easy metrics | Needs text/transcripts, error compounding |
| End-to-end waveform S2ST | Direct objective | Heavy training, difficult in low-resource |
| UnitY/Seamless-style fine-tuning | Strong prior models | Less control of acousteme internals |
| Parallel acousteme latent translation (this RFC) | Oral-first, transcript-light, controllable units | Alignment and token semantics are hard |

# Implementation

## Phase A: Dataset and Token Pipeline (1-2 weeks)

1. Build paired dataset manifest with quality filters.
2. Extract source/target acoustemes with fixed backbone config.
3. Validate token statistics (length ratios, OOV/unit frequency tails).

## Phase B: Baseline Translator (2-3 weeks)

1. Train Option A seq2seq translator with `L_unit`.
2. Decode with existing target vocoder.
3. Establish first baseline on a controlled test set.

## Phase C: Latent and Alignment Enhancements (2-4 weeks)

1. Add `L_align` and `L_contrastive`.
2. Introduce duration predictor/constraint.
3. Run ablations to quantify each objective's value.

## Phase D: Comparative Evaluation and Gate

Compare against current baseline system on:
- semantic faithfulness,
- intelligibility,
- naturalness,
- robustness in noisy/reverberant source audio.

Text-free evaluation stack:
- Human semantic judgment on paired audio.
- Embedding-space semantic similarity between generated target audio and reference target audio.
- Keyword/event preservation checks using acousteme-linked anchors from RFC 008.

Promote beyond R&D only if:
- clear improvement in at least two core quality dimensions,
- no severe regression in semantic faithfulness,
- inference/training cost remains operationally acceptable.

# Success Criteria

- **Translation quality**: Human and embedding-based metrics show meaningful gains over baseline in low-resource scenarios.
- **Semantic reliability**: Reduced critical meaning errors on theological keyword/event sets.
- **Stability**: No token-collapse failure mode across evaluation shards.
- **Operational fit**: Training and inference can be reproduced in our existing infrastructure.
- **Text independence**: End-to-end pipeline runs without transcript artifacts or ASR/MT text components.

# Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Weak source-target alignment | Semantic drift | Add segment-level alignment and `L_align` |
| Token collapse / generic output | Low diversity, wrong content | Contrastive objectives + frequency balancing |
| Speaker leakage in latent space | Style over meaning | Speaker-invariant regularization and adversarial speaker loss (optional) |
| Duration mismatch failures | Truncated or overly long outputs | Explicit duration modeling and length penalties |
| Backbone dependency sensitivity | Reproducibility risk | Keep dual-backbone experiments (`mms`, `xeus`) with fixed extraction configs |

# Open Questions

1. Should we use one shared unit vocabulary across languages or separate vocabularies with mapping layers?
2. Is semantic faithfulness better served by event-aware supervision from RFC 008 during training?
3. Which latent translator family gives best quality/cost ratio for our data scale: autoregressive, CTC, or diffusion?
4. Do we optimize for single-speaker target voice first, then expand to multi-speaker?

# References

1. Chen et al. (2024), *Towards Robust Speech Representation Learning for Thousands of Languages*: https://aclanthology.org/2024.emnlp-main.570/
2. Pratap et al. (2023), *Scaling Speech Technology to 1,000+ Languages*: https://arxiv.org/abs/2305.13516
3. Borsos et al. (2023), *AudioLM: a Language Modeling Approach to Audio Generation*: https://arxiv.org/abs/2209.03143
4. Jia et al. (2022), *Translatotron 2*: https://arxiv.org/abs/2107.08661
5. Barrault et al. (2023), *SeamlessM4T*: https://arxiv.org/abs/2308.11596
