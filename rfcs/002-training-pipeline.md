# RFC 002: Training Pipeline Execution

- Feature Name: `training_pipeline`
- Start Date: 2026-02-09
- RFC PR: [bible-audio-training/rfcs/0004-pipeline.md](https://github.com/placeholder)
- Related: RFC 003 (Architecture)

# Summary

This RFC standardizes the execution flow for the acoustic model training pipeline. It defines a **4-Phase Process** optimized for distributed execution on **Modal**:
1.  **Phase 0**: Data Preparation (Local/Hybrid)
2.  **Phase 1**: Acoustic Tokenization (MMS-300M + K-Means)
3.  **Phase 2**: BPE Motif Discovery (SentencePiece)
4.  **Phase 3**: Vocoder Training (HiFi-GAN V2)

# Motivation

Training high-fidelity speech models requires orchestrating complex dependencies (segmentation, feature extraction, GAN training) across heterogeneous compute resources (CPU for prep, GPU for training).

We chose **Modal** as the execution backend to:
1.  **Parallelize** data processing (e.g., K-Means prediction on thousands of files).
2.  **Abstract** infrastructure (no manual GPU provisioning).
3.  **Persist** intermediate data in a unified cloud volume (`bible-audio-data`).

# Guide-level explanation

The pipeline transforms raw MP3s into a trained Vocoder capable of speaking the target language.

## Phase 0: Data Preparation
*   **Goal**: Create clean, 2-10 second audio segments.
*   **Action**: You run `segment_audio.py` locally to split MP3s by silence. Then `upload_to_modal.py` syncs them to the cloud.

## Phase 1: Acoustic Tokenization
*   **Goal**: Convert audio segments into "Acousteme Sequences".
*   **Action**: The `phase1_acoustic.py` script runs MMS-300M to extract features and K-Means to cluster them into 100 discrete units.

## Phase 2: BPE Motif Discovery
*   **Goal**: Find common patterns (motifs) in the acousteme sequences.
*   **Action**: `phase2_bpe.py` trains a SentencePiece model on the acousteme text, creating a "vocabulary" of common sound patterns.

## Phase 3: Vocoder Training
*   **Goal**: Teach the model to speak.
*   **Action**: `phase3_vocoder_v2.py` trains a HiFi-GAN generator to convert Acoustemes + Pitch back into Audio.

# Reference-level explanation

## Prerequisites
*   **Modal Account**: Authenticated via `modal token set`.
*   **Volume**: A unified volume `bible-audio-data` mounted at `/mnt/audio_data/`.

## Phase details

### Phase 0: Data Prep
*   **Script**: `scripts/segment_audio.py`
*   **Key Params**: Silence threshold `-40dB`, Min silence `0.5s`.
*   **Output**: WAV files (16kHz mono) in `local_segments_<lang>/`.

### Phase 1: Tokenization
*   **Script**: `src/training/phase1_acoustic.py`
*   **Model**: `meta/mms-300m` (Layer 14).
*   **Output**: `<lang>_corpus_timestamped.json` (~50MB). containing unit sequences `[31, 31, 42...]`.
*   **Compute**: A10G GPU.

### Phase 2: BPE
*   **Script**: `src/training/phase2_bpe.py`
*   **Algorithm**: SentencePiece (BPE).
*   **Output**: `<lang>_bpe.model` and `<lang>_bpe.vocab`.
*   **Compute**: CPU (fast).

### Phase 3: Vocoder (V2)
*   **Script**: `src/training/phase3_vocoder_v2.py`
*   **Architecture**: HiFi-GAN V2 (see RFC 003).
*   **Hyperparameters**:
    *   `batch_size`: 12
    *   `segment_length`: 32000 (2 seconds)
    *   `lr`: 0.0002
*   **Output**: Checkpoints in `vocoder_v2_checkpoints/`.

## Execution Commands

### Portuguese (Standard)
```bash
# Phase 1
python3 -m modal run --detach src/training/phase1_acoustic.py::main_skip_segmentation

# Phase 2
python3 -m modal run --detach src/training/phase2_bpe.py::main

# Phase 3
python3 -m modal run --detach src/training/phase3_vocoder_v2.py::main
```

### Sateré (Low Resource)
```bash
# Phase 1
python3 -m modal run --detach src/training/phase1_acoustic.py::main_skip_segmentation --language satere

# Phase 2
python3 -m modal run --detach src/training/phase2_bpe.py::main --language satere

# Phase 3
python3 -m modal run --detach src/training/phase3_vocoder_v2.py::main --language satere
```

# Drawbacks

*   **Modal Dependency**: The entire pipeline is tightly coupled to Modal's proprietary API and volume structure. Porting to bare-metal AWS/GCP would require significant refactoring of data loading and checkpointing logic.
*   **Latency**: Uploading thousands of small audio clips to Modal Volume can be slow compared to local SSDs.

# Future possibilities

*   **End-to-End Script**: A single `run_pipeline.py` orchestrator that triggers all phases sequentially, waiting for completion (partially implemented).
*   **Streaming Inference**: Optimizing Phase 3 for real-time generation rather than batch offline training.
