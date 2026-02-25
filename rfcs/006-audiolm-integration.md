# RFC 006: AudioLM Integration Strategy

- Feature Name: `audiolm_integration`
- Start Date: 2026-02-09
- RFC PR: [bible-audio-training/rfcs/0007-audiolm.md](https://github.com/placeholder)
- Related: RFC 003 (Architecture)

# Summary

This RFC analyzes **Google's AudioLM** and proposes a roadmap to integrate its key innovation—**Acoustic Tokens** (via SoundStream)—into our pipeline. While our current system uses only "Semantic Units" (K-Means), AudioLM proves that adding "Acoustic Units" preserves speaker identity and recording quality, enabling truly natural synthesis.

# Motivation

Our current pipeline (XLSR-53 → K-Means → Vocoder) suffers from information loss. K-Means discards speaker identity and prosody, forcing the vocoder to hallucinate it (often poorly).
AudioLM solves this by using **two token streams**:
1.  **Semantic Tokens** (w2v-BERT): Content (What is said).
2.  **Acoustic Tokens** (SoundStream): Details (How it is said).

Adopting this would allow **Voice Cloning**, **Speech-to-Speech Translation**, and higher fidelity.

# Guide-level explanation

AudioLM treats audio generation as a Language Modeling problem.

## The 3-Stage Generation
1.  **Semantic Stage**: A Transformer predicts *Semantic Tokens* (meaning) from text or context.
2.  **Coarse Acoustic Stage**: A Transformer predicts *Coarse Acoustic Tokens* (SoundStream layers 1-4) conditioned on the semantic tokens. This determines the speaker's voice and rough prosody.
3.  **Fine Acoustic Stage**: A Transformer predicts *Fine Acoustic Tokens* (SoundStream layers 5-8) to add high-fidelity texture.

## Our Current vs. Proposed Flow
*   **Current**: `Audio → [XLSR-53] → Units → [Vocoder] → Audio`
*   **Proposed**: `Audio → [MMS] + [SoundStream] → Semantic + Acoustic Tokens → [Enhanced Vocoder] → Audio`

# Reference-level explanation

## SoundStream Neural Codec
The cornerstone of AudioLM is SoundStream, a neural audio codec.
*   **Encoder**: CNN downsamples audio 320x (to 50Hz).
*   **Quantizer (RVQ)**: Residual Vector Quantization with 8 layers/codebooks.
    *   Layer 1: Base waveform shape.
    *   Layer 8: Fine residuals.
*   **Decoder**: Reconstructs audio from codes.

## Integration Roadmap

### Phase 1: Hybrid Vocoder (Feasible Now)
Instead of a full Language Model, we modify our V2 Vocoder to accept Acoustic Tokens as conditioning.
*   **Inputs**: `Semantic Units [T]`, `Acoustic Tokens [T, 8]`.
*   **Generator**: `Embed(Units) + Embed(Acoustic) -> HiFi-GAN`.
*   **Benefit**: The vocoder no longer guesses pitch/timbre; it is explicitly told what to generate.

### Phase 2: Acoustic Language Model (Long Term)
Train a Transformer to predict Acoustic Tokens from Semantic Tokens.
*   **Training**: `Input: Semantic[t] -> Output: Acoustic[t]`.
*   **Inference**: `Text -> Semantic -> (Model) -> Acoustic -> Audio`.
*   **Benefit**: Enables zero-shot voice cloning (prompt the model with 3s of acoustic tokens).

# Rationale and alternatives

## Why not just use AudioLM as-is?
AudioLM requires massive datasets (60k+ hours) to train the Transformers from scratch. We are working with Low-Resource languages (1-10 hours).
**Decision**: Adopt the *architecture ideas* (SoundStream, Dual Tokens) but use a lighter, GAN-based generator (HiFi-GAN) instead of massive Transformers for the synthesis stage.

# Drawbacks

*   **Complexity**: Training a SoundStream codec is non-trivial and adds another model to the pipeline.
*   **Data Hunger**: Neural codecs need diverse audio to generalize well.

# Future possibilities

*   **Speech-to-Speech Translation**: `Portugese Audio -> Semantic Tokens -> (Translation Model) -> Satere Semantic Tokens -> (Acoustic Model) -> Satere Audio`.
