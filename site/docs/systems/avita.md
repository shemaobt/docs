---
title: AViTA (Aural-Visual Tagging App)
sidebar_position: 10
---

# AViTA (Aural-Visual Tagging App)

## Purpose

AViTA is the critical "human-in-the-loop" interface and the linchpin of the Tripod Oral architecture. It operates during Phase 2C of the pipeline to create the Semantic-Acoustic Bridge without relying on written text.

Target users: trained facilitators and native speakers working together.

Primary outcomes:
- supervised training data for the Seq2Seq Transformer model,
- timestamped links between semantic meaning (Ontology tags) and acoustic motifs,
- audio glosses and feature bundles for complex grammatical markers.

## Core capabilities

- Import and visualize acoustic motifs (BPE vocabulary from Phase 2B).
- Receive active learning prompts targeting high-value segments.
- Play audio on loop for native speaker analysis.
- Apply ontology tags to motif spans with precise timestamp boundaries.
- Record audio glosses for newly tagged motifs.
- Generate tag consistency reports for quality control.

## Inputs

AViTA does not process text or traditional transcripts. Its inputs are:

- **Raw audio segments**: untranscribed, natural speech clips from the 100+ hour Language Archive.
- **Acoustic motifs (pseudo-text)**: BPE vocabulary (typically 500–1000 tokens) produced by Phase 2B. These are the unlabelled morphological building blocks of the language.
- **Active learning prompts**: algorithmic requests from the Pareto-Active Learning framework. The system identifies where it is confused (low confidence or attention misalignment) and feeds AViTA specific 5-minute clips or 10–20 high-value candidate segments to be tagged.
- **Ontology v5.3 question library**: built-in library of plain-language questions designed to elicit complex grammatical categories from the Tripod Ontology without metalinguistic jargon.

## Outputs

AViTA generates the supervised training data that the Seq2Seq Transformer model needs to learn the language's grammar:

- **Aligned training dataset (`.pt` file)**: machine-readable file that permanently links abstract semantic meaning to exact sounds.
- **Timestamped semantic-acoustic anchors**: precise timestamps linking specific ontology tags (e.g., `[ASPECT:perfective]`) to specific acoustic motifs (e.g., `<45_12>`). This dense supervision covers both content words (like "David") and functional grammar.
- **Feature bundles**: for complex grammatical markers where multiple sounds indicate a single meaning, AViTA outputs grouped sound features.
- **Audio glosses**: voice notes recorded by the facilitator attached to newly identified motifs to explain their function for future reference.

## Workflow

The workflow is a conversational interview format executed by a trained Facilitator and a Native Speaker.

### Step 1: System-directed targeting (active learning)

The facilitator does not choose audio randomly. AViTA presents targeted prompts based on the model's uncertainty.

Example prompt:
> Model is unsure how `[ASPECT:perfective]` sounds in rapid speech. Here are 10 candidate clips where it might occur. Please tag 2–3 clear examples.

### Step 2: Elicitation protocol

The facilitator plays the selected audio segment on a loop for the native speaker. Instead of asking for translations, the facilitator asks specific, plain-language questions mapped to the ontology:

- **Evidentiality**: "How does the storyteller know this? (by seeing / by hearing / someone told / figured out / just assumed)"
- **Reality**: "Did this really happen in the story? (yes it happened / might happen / imagining / should happen)"
- **Time frame**: "When does this happen in the story? (before / now / later / always true)"

### Step 3: Acoustic isolation

Relying entirely on implicit grammatical knowledge, the native speaker listens to the audio and isolates the exact part of the sound that answers the facilitator's question (e.g., pointing out the specific prefix or tone change that means the event happened in the past).

### Step 4: Painting meaning onto audio (UI interaction)

Once the sound is isolated, the facilitator interacts with AViTA's visual interface to map the meaning to the sound:

- Press and hold on the visual representation of the acoustic motif to apply the specific ontology tag.
- Drag the edges of the tag to refine its exact start and end boundaries, ensuring the timestamp perfectly aligns with the spoken morpheme.
- Use multi-track tagging to handle overlapping concepts or complex markers.

### Step 5: Consolidation and quality control

- The facilitator can record an audio gloss to attach a spoken explanation to the newly tagged motif.
- During intensive tagging sessions, the team spends time reviewing tags for consistency, flagging uncertain segments for follow-up, and generating tag consistency reports.

## Tagging depth strategy

AViTA is used to execute a highly strategic three-layer annotation rather than tagging the entire archive:

- **Dense tagging (5–10 hours)**: every single grammatical feature in the segment is tagged to build the foundational core system.
- **Semi-dense tagging (1–2 hours)**: only narrative-specific features are tagged to adapt the model to biblical storytelling styles.
- **Minimal tagging (1 hour)**: only specific, confusing features (flagged by active learning) are tagged to catch rare edge cases (e.g., tagging only the difference between "He ate" and "He was eating").

## Runtime and deployment

- **Environment**: web application accessible to facilitators and native speakers.
- **Build/deploy path**: standard web stack (to be defined).
- **Operational dependencies**: requires Phase 2B outputs (BPE vocabulary, segmented audio), Tripod Ontology v5.3, active learning service.

## Integrations

- **Inputs from**: Language Archive, Phase 2B BPE motifs, Tripod Ontology, active learning service.
- **Outputs to**: Seq2Seq Transformer training pipeline (Phase 3), Concept Bank (for validated key-term anchors).

## Related RFCs

- [Semantic acoustic mapping](/rfcs/semantic-acoustic-mapping)
- [Semantic acoustic linking](/rfcs/semantic-acoustic-linking)
- [Segmentation strategy](/rfcs/segmentation-strategy)

## Roadmap and open questions

- **Near-term milestones**:
  - finalize UI/UX for multi-track tagging,
  - integrate active learning prompt service,
  - implement tag consistency reports.
- **Known risks**:
  - facilitator fatigue during dense tagging sessions,
  - inter-annotator consistency across facilitators,
  - edge-case coverage for rare grammatical features.