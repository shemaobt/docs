# RFC 003: Analysis of Robotic Audio Artifacts

- Feature Name: `robotic_analysis`
- Start Date: 2026-02-09
- RFC PR: [bible-audio-training/rfcs/0006-robotic-analysis.md](https://github.com/placeholder)
- Related: RFC 003 (Architecture)

# Summary

This RFC documents the "Post-Mortem" analysis of the **V1 Vocoder**, which suffered from severe "robotic" and monotonic audio quality. It identifies **Pitch Information Loss** as the primary root cause and justifies the architectural shift to **Pitch-Conditioned HiFi-GAN** (V2).

# Motivation

Early experiments with a simple convolutional vocoder (V1) produced intelligible but unnatural speech. The audio lacked intonation (flat pitch) and had metallic artifacts. Understanding *why* this happened was critical to designing the successful V2 architecture. This RFC serves as a record of those design decisions.

# Guide-level explanation

We identified 5 critical failure modes in V1:

1.  **Pitch Loss**: The acoustic units (from XLSR-53) are pitch-invariant. The model knew *what* was said, but not *how*. It defaulted to a monotone "mean pitch," sounding robotic.
2.  **Discriminator Collapse**: The discriminator often learned too fast, driving its loss to 0. This meant it stopped providing useful feedback to the generator.
3.  **Insufficient Context**: 1-second segments were too short to capture sentence-level prosody (rhythm).
4.  **Spectral Gaps**: Using only Mel-L1 loss ignored phase and harmonic structure, causing "phasey" or metallic sounds.
5.  **Architecture**: Simple Transposed Convolutions introduced "checkerboard artifacts."

# Reference-level explanation

## The Solutions (Implemented in V2)

### 1. Pitch Conditioning (The "Cure")
*   **Problem**: Units `[31, 31, 42]` have no pitch info.
*   **Solution**: We explicitly extract F0 (Fundamental Frequency) from the source audio, quantize it into 32 bins, and feed it into the generator alongside the units.
*   **Result**: The model is forced to generate audio at the requested pitch, restoring natural intonation.

### 2. Multi-Period Discriminator (MPD)
*   **Problem**: Single-scale discriminators miss periodic patterns (like buzzing).
*   **Solution**: MPD reshapes audio by prime periods `[2, 3, 5, 7, 11]` to expose periodic artifacts to 2D convolutions.

### 3. Multi-Receptive Field Fusion (MRF)
*   **Problem**: Fixed kernel sizes miss features at different scales.
*   **Solution**: Summing outputs from ResBlocks with kernels `[3, 7, 11]` allows the generator to model both fine texture and broad structure simultaneously.

### 4. Loss Function Upgrade
We moved from simple L1 to a compound loss:
*   **Mel L1**: 45.0 weight (Content)
*   **Feature Matching**: 2.0 weight (Stability)
*   **Multi-Res STFT**: 2.0 weight (Harmonics)
*   **Adversarial**: 1.0 weight (Realism)

# Rationale and alternatives

### Alternative: Autoregressive Models (WaveNet)
*   *Pros*: Perfect quality.
*   *Cons*: Extremely slow inference (unusable for real-time).
*   *Decision*: Rejected in favor of GANs (Parallel generation).

### Alternative: End-to-End (VITS)
*   *Pros*: Joint training of acoustic + vocoder.
*   *Cons*: Extremely complex training, hard to debug.
*   *Decision*: Rejected. We prefer the modular "Unit-to-Speech" approach for flexibility.

# Drawbacks

*   **Complexity**: V2 is significantly more complex (multiple discriminators, specific loss weighting).
*   **Data Req**: Pitch conditioning requires an external F0 extractor (Parselmouth/PyWorld) during preprocessing.

# Future possibilities

*   **Diffusion Vocoders**: Models like **DiffWave** offer even better quality than GANs but at the cost of inference speed.
*   **BigVGAN**: Scaling up the generator parameters (100M+) for universal vocoding capabilities.
