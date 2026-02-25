# RFC 005: Foundation Model Selection (MMS vs XLSR-53)

- Feature Name: `model_selection`
- Start Date: 2026-02-09
- RFC PR: [bible-audio-training/rfcs/0008-mms-vs-xlsr53.md](https://github.com/placeholder)
- Related: RFC 003 (Architecture)

# Summary

This RFC recommends replacing **XLSR-53** with Meta's **MMS-300M** (Massively Multilingual Speech) as the default backbone for Acoustic Tokenization. While XLSR-53 was groundbreaking, MMS extends coverage from 53 to **1,400+ languages** (including Sateré-Mawé related families) and was trained on **Religious Texts** (Bible), making it substantially better aligned for our Oral Bible Translation use case.

# Motivation

Our target languages (e.g., Sateré-Mawé, Tupi-Guarani family) are **unseen** by XLSR-53. This forces the model to map indigenous phonemes to the nearest European equivalent (e.g., mapping a glottal stop to a generic silence or 'k'), resulting in loss of meaning.
MMS was explicitly trained on thousands of low-resource languages using aligned Bible datasets. It likely possesses the specific phonetic features we need.

# Guide-level explanation

## The Contenders

### XLSR-53 (Legacy)
*   **Training**: 53 Languages (mostly European/Major Asian).
*   **Data**: CommonVoice, Babel.
*   **Architecture**: Wav2Vec2 (300M).

### MMS (Recommended)
*   **Training**: 1,400+ Languages.
*   **Data**: **New Testament** (1,100 langs), Old Testament, FLEURS.
*   **Architecture**: Wav2Vec2 (300M or 1B).

## Why MMS?
1.  **Bible Data**: It has literally "read" the data we are trying to generate.
2.  **Indigenous Coverage**: It has seen Tupi, Guarani, and Amazonian languages.
3.  **Drop-in Replacement**: It uses the exact same HuggingFace `Wav2Vec2Model` architecture.

# Reference-level explanation

## Integration
MMS-300M is architecturally identical to XLSR-53.
*   **Repo**: `facebook/mms-300m`
*   **Layer**: We extract features from **Layer 14** (same as XLSR-53).
*   **Dim**: 1024.

## Comparison Metrics (from Paper)
*   **Low-Resource ASR**: MMS reduces Word Error Rate by **45%** relative to XLSR-53.
*   **Phoneme Discrimination**: MMS differentiates minimal pairs in unseen languages significantly better.

## Migration Plan

### Step 1: Phase 1 Update
Update `phase1_acoustic.py` to accept `--model mms-300m`.
```python
model = Wav2Vec2Model.from_pretrained("facebook/mms-300m")
```

### Step 2: Evaluation
Run K-Means clustering on Sateré data using both models.
*   **Metric**: Silhouette Score (Cluster tightness).
*   **Visual**: t-SNE plot of units.

### Step 3: Deprecation
Remove XLSR-53 support once MMS is validated.

# Rationale and alternatives

### Alternative: MMS-1B
*   **Pros**: Even better performance.
*   **Cons**: 1280-dim vectors (incompatible with 1024-dim legacy), 4GB VRAM (inference) vs 1.2GB.
*   **Decision**: Start with **MMS-300M** for compatibility. Upgrade to 1B only if quality is lacking.

# Drawbacks

*   **None**: MMS-300M has no performance penalty compared to XLSR-53. It is a strict upgrade.

# Future possibilities

*   **Language Adaptation**: We can use MMS's "Adapter" framework to fine-tune specific layers for Sateré-Mawé if we have 1hr+ of transcribed data.
*   **LID**: Use `mms-lid` to automatically detect language in our unlabeled datasets.
