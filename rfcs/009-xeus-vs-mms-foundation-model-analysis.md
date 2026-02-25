# RFC 009: Foundation Model Update Analysis (XEUS vs MMS)

- Feature Name: `foundation_model_update`
- Start Date: 2026-02-23
- RFC PR: [bible-audio-training/rfcs/0009-xeus-vs-mms.md](https://github.com/placeholder)
- Related: RFC 005 (MMS vs XLSR-53), RFC 006 (AudioLM Integration), RFC 007 (Raw Acoustemes Storage), RFC 008 (Semantic-Acoustic Linking)

# Summary

This RFC provides a deeper analysis of whether we should adopt **XEUS** (Chen et al., EMNLP 2024 Best Paper) as the default self-supervised speech backbone instead of **MMS** for semantic/acoustic representation learning in low-resource languages.

Recommendation: move to a **staged adoption** strategy where XEUS is introduced as an experimental backbone and promoted to default only after passing task-level quality and operational gates. XEUS has stronger multilingual coverage and better benchmark evidence, but integration complexity and reproducibility risks are materially higher than MMS in our current stack.

# Motivation

RFC 005 selected MMS as a clear upgrade over XLSR-53. Since then, XEUS introduced new evidence:

- XEUS was trained on ~1.1M hours across 4,057 languages.
- XEUS reports state-of-the-art on ML-SUPERB and outperforms MMS 1B by 0.8% on that benchmark.
- XEUS adds robustness objectives (denoising + dereverberation) that are directly relevant for field recordings.

Our decision is no longer "MMS vs XLSR-53." It is now "keep MMS for stability" vs "switch to XEUS for higher multilingual robustness and likely better transfer to underrepresented languages."

# Guide-level Explanation

## What Changes If We Switch?

Current practical posture:
- MMS is easy to consume through Hugging Face Wav2Vec2 APIs.
- Existing scripts and ecosystem support are mature and widely used.

XEUS posture:
- Better multilingual scale and robustness claims.
- Current reference usage is tied to ESPnet SSL loading patterns, not the simple Wav2Vec2 drop-in path.
- Engineering effort shifts from "model replacement" to "model integration + validation."

## Decision Frame

We should optimize for **end-to-end outcomes**, not benchmark scores alone:

1. Representation quality for our target language families.
2. Vocoder conditioning quality (naturalness, intelligibility, stability).
3. Operational reliability (reproducible training, predictable infra footprint, maintainable code).
4. Governance (license clarity, long-term maintainability, ecosystem support).

# Reference-level Explanation

## Evidence Base (What the Sources Support)

From the XEUS paper and project pages:
- 1M+ hours, 4,057 languages.
- New dereverberation objective and denoising augmentation.
- ML-SUPERB gain over MMS 1B (+0.8% absolute in reported aggregate metric).
- Open release of checkpoints/code/data references.

From MMS model references:
- ~500k hours and 1,400+ languages for SSL pretraining.
- Mature integration path via Hugging Face Wav2Vec2 models.
- Existing adoption in our codebase and prior RFC rationale.

## Architectural Differences (Why They Matter)

The choice is not only about data scale. XEUS and MMS are different model families with different integration surfaces.

### Encoder Architecture

- MMS uses the Wav2Vec2-style Transformer encoder family.
- XEUS uses a 19-layer E-Branchformer encoder.

Implication:
- Representations can differ in temporal locality, contextual mixing behavior, and downstream layer utility.
- "Same layer index" does not imply equivalent linguistic/acoustic abstraction across backbones.

### Pretraining Objective

- MMS is trained with Wav2Vec2 self-supervised objectives.
- XEUS uses HuBERT-style masked prediction over discrete speech targets, plus denoising and dereverberation training objectives.

Implication:
- XEUS is more explicitly optimized for robustness to noisy/reverberant conditions.
- Token separability and clustering behavior may shift enough to require retuning K-Means and downstream thresholds.

### Runtime Interface and Tooling

- MMS integrates directly via stable Hugging Face Wav2Vec2 APIs already aligned with our scripts.
- XEUS currently relies on ESPnet SSL loading flows and checkpoint handling patterns.

Implication:
- Architectural differences translate to real operational differences: loader code, dependency footprint, checkpoint conventions, and reproducibility workflows.
- Migration is a systems change, not only a model-name substitution.

## Direct Implications for Our Pipeline

### 1) Semantic Unit Extraction (Phase 1)

Potential upside with XEUS:
- Better phonetic separation for low-resource and noisy speech.
- Potentially cleaner clustering boundaries for K-Means tokenization.

Potential downside:
- Feature distribution shift can invalidate current cluster counts and downstream hyperparameters.
- Existing heuristics tuned on MMS embeddings may degrade.

### 2) Acoustic Conditioning (RFC 007/008/006 trajectory)

Potential upside with XEUS:
- Robust pretraining objective may preserve more usable cues under noisy/reverberant audio.
- Could improve alignment stability between semantic slots and audio segments.

Potential downside:
- Any gain at representation level is only valuable if preserved through tokenization and vocoder stages.
- End-to-end improvements are not guaranteed without retuning.

### 3) Tooling and Operations

MMS:
- Lower friction, strong ecosystem, straightforward reproducibility.

XEUS:
- Requires ESPnet-oriented loading path and extra integration work.
- Higher onboarding and maintenance cost.
- Greater risk of environment drift if we depend on fork-specific behavior.

## Risk Analysis

### Technical Risk
- Benchmark uplift may not transfer to our specific languages/tasks.
- Unknown compatibility assumptions in downstream modules (feature dimensionality, layer semantics, token statistics).

### Delivery Risk
- Integration complexity can delay roadmap items unrelated to backbone selection.
- Additional infra/runtime tuning may be required before parity is reached.

### Governance and Licensing Risk
- MMS model card indicates CC-BY-NC 4.0 license constraints.
- XEUS model release indicates MIT for model artifacts, while released data sources include non-commercial licenses.
- We need explicit legal review for intended product usage regardless of model quality.

## Decision Matrix

| Dimension | MMS | XEUS | Direction |
|----------|-----|------|-----------|
| Multilingual coverage scale | Strong | Very strong | XEUS |
| Reported multilingual benchmark performance | Strong | Stronger | XEUS |
| Noise/reverb robustness objective | Standard SSL | Explicitly improved | XEUS |
| Architectural compatibility with current pipeline | High | Medium/low | MMS |
| Integration simplicity (current stack) | Very high | Medium/low | MMS |
| Reproducibility with existing scripts | High | Medium | MMS |
| Ecosystem maturity in our stack | High | Medium | MMS |
| Strategic ceiling for low-resource expansion | Medium/high | High | XEUS |

Interpretation:
- MMS wins for immediate delivery speed and predictable engineering.
- XEUS wins for long-term multilingual robustness and likely quality ceiling.

# Rationale

Adopt **XEUS as a gated candidate**, not an immediate hard replacement.

Why:
- The quality signal is strong enough to justify serious evaluation.
- The integration risk is high enough to avoid a blind default switch.
- A staged approach protects roadmap velocity while enabling technical upside.

# Alternative Approaches

| Approach | Pros | Cons |
|----------|------|------|
| Keep MMS only | Minimal engineering risk, fastest execution | Leaves potential quality gains untapped |
| Full immediate switch to XEUS | Maximum strategic ambition | High regression and delivery risk |
| Dual-backbone support (recommended) | Controlled comparison, reversible rollout | Temporary code complexity |
| Task-specific mixed strategy (MMS for prod, XEUS for R&D) | Preserves stability while learning | Slower convergence on one standard |

# Implementation

## Phase A: Controlled Backbone Abstraction (1-2 weeks)

1. Add a backbone interface in Phase 1 (`mms`, `xeus`) with identical output contract.
2. Keep current MMS path untouched as baseline.
3. Add XEUS extraction path behind a feature flag.
4. Log embedding stats (shape, frame rate, variance) to detect silent incompatibilities.

## Phase B: Side-by-side Evaluation (1-2 weeks)

Run both backbones on the same corpus subset and compare:
- Clustering quality: silhouette score, Davies-Bouldin index.
- Token utility proxy: downstream reconstruction/intelligibility deltas.
- Alignment quality (RFC 008): confidence distribution and human-review rate.
- Robustness slices: noisy, reverberant, and clean subsets.

## Phase C: Downstream Validation (1-2 weeks)

1. Retrain or retune downstream components with XEUS features.
2. Evaluate end-to-end speech quality with objective and human metrics.
3. Stress-test inference/training reproducibility across environments.

## Phase D: Promotion Gate

Promote XEUS to default only if all are true:
- >= 5% relative gain in at least two core quality metrics.
- No statistically meaningful regression in intelligibility on clean speech.
- Runtime/resource overhead stays within agreed budget.
- Integration is reproducible in CI/dev environments.
- License/governance review is green.

# Success Criteria

- **Quality**: XEUS outperforms MMS on our internal benchmark suite, not only public benchmarks.
- **Robustness**: XEUS shows clear gains on noisy/reverberant data slices.
- **Operational**: No increase in critical pipeline failure rate after adoption.
- **Maintainability**: Backbone integration remains simple enough for routine model updates.
- **Governance**: Documented license decision and approved usage constraints.

# Open Questions

1. Which internal metric should be the primary promotion gate: intelligibility, naturalness, or semantic faithfulness?
2. Do we standardize on one embedding layer across both models or allow model-specific optimal layers?
3. Is dual-backbone support acceptable long-term, or should we enforce single-backbone convergence after evaluation?
4. What is our explicit commercial/non-commercial deployment target, and how does it constrain model selection?

# References

1. Chen et al. (2024), *Towards Robust Speech Representation Learning for Thousands of Languages* (EMNLP 2024 Best Paper): https://aclanthology.org/2024.emnlp-main.570/
2. WAVLab XEUS project page: https://www.wavlab.org/activities/2024/xeus/
3. Hugging Face model card, `espnet/xeus`: https://huggingface.co/espnet/xeus
4. Pratap et al. (2023), *Scaling Speech Technology to 1,000+ Languages* (MMS): https://arxiv.org/abs/2305.13516
5. Hugging Face model card, `facebook/mms-300m`: https://huggingface.co/facebook/mms-300m
