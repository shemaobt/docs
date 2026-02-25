# RFC 001: Architecture Deep Dive & Design Decisions

- Feature Name: `architecture_deep_dive`
- Start Date: 2026-02-09
- RFC PR: [bible-audio-training/rfcs/0003-architecture.md](https://github.com/placeholder)
- Related: RFC 001, RFC 002

# Summary

This RFC documents the complete technical architecture of the acoustic tokenization and vocoder pipeline. It specifies the use of **XLSR-53** for feature extraction, **K-Means** for discrete tokenization, and a **HiFi-GAN** based Vocoder (V2) for waveform reconstruction. It serves as the canonical reference for layer specifications, dimensions, and hyperparameter choices.

# Motivation

To train a Text-to-Speech (TTS) or Voice Conversion system for low-resource languages (like Sateré-Mawé) without extensive aligned text, we require a **Speech-to-Unit-to-Speech** architecture.
1.  **Speech-to-Unit**: Discretizes continuous audio into finite symbols (Acoustemes) to enable language modeling without text.
2.  **Unit-to-Speech**: Reconstructs high-fidelity audio from these symbols.

This dual-stage approach allows us to separate "content" (units) from "speaker/style" (vocoder), facilitating tasks like voice cloning and unwritten language modeling.

# Guide-level explanation

The pipeline consists of three main stages:

## 1. Feature Extraction (The "Ear")
We use a pre-trained "Ear" model (**XLSR-53**) that has listened to 53 languages. It processes raw audio and outputs a sequence of vectors (embeddings) representing the phonetic content of the speech, while ignoring speaker identity.

## 2. Tokenization (The "Scribe")
Since the "Ear" outputs continuous vectors (infinite possibilities), we use **K-Means Clustering** to snap these vectors to the nearest "Phoneme Cluster". This converts a 5-second audio clip into a sequence of ~250 discrete numbers (0-99). These numbers are the **Acousteme Sequence**.

## 3. The Vocoder (The "Mouth")
The Vocoder takes the Acousteme Sequence and turns it back into sound.
*   **V1 (Basic)**: A simple convolutional decoder. Sounded robotic.
*   **V2 (Advanced)**: A HiFi-GAN architecture with Pitch Conditioning. Sounds natural and preserves the speaker's original timbre.

# Reference-level explanation

## 1. XLSR-53 Feature Extraction

### Architecture
*   **Model**: `facebook/wav2vec2-large-xlsr-53` (315M params)
*   **Input**: 16kHz Mono Audio
*   **Downsampling**: The CNN encoder downsamples audio by **320x**.
    *   16,000 samples/sec -> 50 frames/sec (20ms per frame).
*   **Layer Selection**: We extract features from **Layer 14** (of 24).
    *   *Reasoning*: Layers 13-18 capture phonemic content best, while lower layers capture speaker ID and higher layers capture semantics.

## 2. K-Means Acoustic Clustering

### Specs
*   **Input**: 1024-dim vectors from XLSR-53
*   **Algorithm**: Mini-batch K-Means (Euclidean distance)
*   **Clusters (k)**: 100
    *   *Reasoning*: Covers ~40 core phonemes + ~30 allophones + ~30 transition states.
*   **Output**: Integers [0-99]

## 3. V2 Generator Architecture (HiFi-GAN Style)

### Inputs
*   **Units**: [Batch, Time] (0-99)
*   **Pitch (F0)**: [Batch, Time] (quantized 0-32 bins)

### Layers
1.  **Embeddings**: Unit (256-dim) + Pitch (64-dim) -> Concatenated (320-dim).
2.  **Upsampling**: 4 blocks boosting resolution by factors [5, 4, 4, 4] (Total 320x).
3.  **MRF (Multi-Receptive Field Fusion)**: Each upsample block sums outputs from 3 parallel ResBlocks with kernel sizes [3, 7, 11] to capture patterns at different time scales (phonemic vs sub-phonemic).
4.  **Weight Norm**: Applied to all convolutions for stability.

### Output
*   **Audio**: 16kHz Waveform (Tanh activation: [-1, 1]).

## 4. V2 Discriminator Architecture

We use a compound discriminator to differentiate Real vs Fake audio during training.

### Multi-Period Discriminator (MPD)
*   **Concept**: Reshapes audio by prime periods [2, 3, 5, 7, 11] and applies 2D convs.
*   **Purpose**: Detects repetitive artifacts at specific frequencies (e.g., metallic buzzing).

### Multi-Scale Discriminator (MSD)
*   **Concept**: Analyzes audio at 3 scales (Raw, 2x Downsampled, 4x Downsampled).
*   **Purpose**: Ensures global consistency (prosody) and local detail (texture).

## 5. Loss Functions

The training objective combines four losses:
1.  **Mel Spectrogram Loss** (Weight 45.0): L1 difference between Mel specs. The primary driver of content.
2.  **Multi-Res STFT Loss** (Weight 2.0): Spectral convergence at FFT sizes [512, 1024, 2048].
3.  **Feature Matching Loss** (Weight 2.0): Minimizes distance between discriminator internal feature maps.
4.  **Adversarial Loss** (Weight 1.0): LSGAN loss to fool the discriminators.

# Rationale and alternatives

### Why Layer 14?
We tested multiple layers. Layer 14 provided the best balance of **Speaker Independence** (good for VC) and **Phonetic Clarity** (good for ASR). Lower layers leaked too much speaker identity; higher layers lost temporal precision.

### Why K=100?
*   **K=50**: Too compressed. merged distinct vowels.
*   **K=200**: Too sparse. Created multiple tokens for the exact same sound, making the language modeling task harder.
*   **K=100**: Empirical sweet spot for most languages.

# Drawbacks

*   **V1 Limitations**: The V1 architecture (simple Conv1d) lacked the receptive field to generate coherent phase, resulting in "robotic" and "phasey" audio. It was deprecated in favor of V2.
*   **Input Constraint**: The model strictly requires 16kHz input. 44.1kHz or 48kHz audio must be downsampled, potentially losing "air" frequencies (>8kHz), though these are rarely critical for speech intelligibility.

# Future possibilities

*   **V3 Generator**: Moving to a **Diffusion-based** decoder (e.g., DiffWave) for even higher fidelity, though at the cost of inference speed.
*   **Universal Codebook**: Training the K-Means on 100+ languages simultaneously to create a "Universal IPA" codebook.
