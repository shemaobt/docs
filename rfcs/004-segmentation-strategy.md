# RFC 004: Audio Segmentation Strategy

- Feature Name: `segmentation_strategy`
- Start Date: 2026-02-09
- RFC PR: [bible-audio-training/rfcs/0005-segmentation.md](https://github.com/placeholder)
- Related: RFC 004 (Pipeline)

# Summary

This RFC defines the strategy for audio segmentation quality and sizing. It establishes **2 seconds (32,000 samples)** as the optimal training crop size for the V2 Vocoder, balancing GPU memory constraints (A10G) with the need to capture phrase-level prosody. It also mandates **Unit-Boundary Alignment** to prevent phase artifacts.

# Motivation

The quality of the vocoder is strictly limited by the context window it sees during training.
*   **Too Short (<1s)**: The model learns phonemes but fails to learn intonation (prosody), resulting in "robotic" flat speech.
*   **Too Long (>5s)**: GPU memory usage explodes (quadratic in attention, linear in convolution), forcing tiny batch sizes that destabilize training.

We need a sweet spot that maximizes prosody without OOM (Out of Memory) errors. Additionally, random cropping often slices through phonemes, confusing the model.

# Guide-level explanation

## 1. Pre-Segmentation (Phase 0)
When preparing data locally, we slice long audio files into "Training Candidates".
*   **Rule**: Split at natural silence (>0.5s).
*   **Duration**: Keep segments between **2.0s and 5.0s**.
    *   *Why?* Long enough to contain full phrases, short enough to be flexible.

## 2. Training-Time Cropping (Phase 3)
During training, we don't use the full file. We take a random "Crop".
*   **Size**: **2 seconds** (32,000 samples).
*   **Alignment**: The crop start must align perfectly with a Unit Boundary (multiples of 320 samples).

## 3. The "Sweet Spot"
We upgraded from 1s (V1) to 2s (V2).
*   **result**: The model now "sees" across word boundaries, allowing it to learn how pitch rises/falls over a phrase.

# Reference-level explanation

## Memory Impact Analysis (A10G - 24GB)

GPU RAM is consumed by Model Parameters + Activations + Gradients + Data.

| Crop Length | Duration | Units | Max Batch Size | Context Learned | Status |
|-------------|----------|-------|----------------|-----------------|--------|
| 16,000 | 1.0s | 50 | 20 | Word-level | **Too Short** |
| 32,000 | 2.0s | 100 | 12 | Phrase-level | **Optimal** |
| 48,000 | 3.0s | 150 | 8 | Sentence-level | Feasible |
| 80,000 | 5.0s | 250 | 4 | Paragraph-level | Unstable |

## Alignment Algorithm
To prevent "slicing a phoneme in half", the dataloader must enforce:

```python
# Phase 3 Dataloader Logic
unit_index = random(0, valid_units)
audio_start_sample = unit_index * 320  # HOP_LENGTH
crop = audio[audio_start_sample : audio_start_sample + 32000]
```
If `audio_start_sample` were random (e.g., 153), the units would technically refer to audio 0-20ms, but the crop would start at 9ms, misaligning the features.

# Rationale and alternatives

### Why not 5 seconds?
While 5s captures more prosody, the batch size drops to ~4. Small batches yield noisy size gradients, making the GAN unstable (Discriminator overpowers Generator). 2s allows Batch Size 12, which is stable.

### Why not variable length?
Training on variable lengths (with padding) wastes computation on padding tokens and complicates the loss calculation (masking). Fixed-size crops are more efficient.

# Drawbacks

*   **Boundary Effects**: Even with 2s crops, the model doesn't know what happened *before* the crop. It might start a sentence with the wrong pitch.
*   **Data Waste**: Audio shorter than 2s (e.g., single "Yes") is discarded or heavily padded.

# Future possibilities

*   **Grouped Batching**: Grouping segments by length to allow variable-length training without padding.
*   **Gradient Checkpointing**: Trading compute for memory to allow 5s+ context on the same GPU.
