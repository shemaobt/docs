---
title: Oral Bridge
sidebar_position: 7
---

# Oral Bridge

## What it is and why it exists

**Oral Bridge** is the system that sits between **meaning maps** (semantic, passage-level structure from the Meaning Map Generator) and **oral or language-specific output**: it “bridges” the shared meaning representation into forms that support oral Scripture production in a given language. For example, it can take a passage’s meaning map and produce or refine **oral renditions**, **training data**, or **acousteme-style** representations for a target language (e.g. Hindi). **This approach is suitable for high-resource languages** — languages with substantial written corpora, existing models, and tooling; low-resource languages may need different or complementary strategies. In the Shema landscape it lives in the **Meaning Map** layer of the Tripod methodology, alongside **tripod-studio** and **meaning-map-generator**, and uses shared capabilities (proprietary ML models, LLM agents). Without it, the step from “meaning map” to “language-specific oral pipeline” would be ad hoc or manual.

**In one sentence:** It bridges meaning-map content to oral/language-specific outputs (e.g. Hindi) so that rehearsal, translation, or training pipelines can consume a consistent semantic representation.

---

## Key terms (defined)

- **Meaning map** — A structured representation of a passage (participants, events, discourse, clause-level data). Produced by the Meaning Map Generator; see [Meaning Map Generator](/docs/systems/meaning-map-generator).
- **Oral bridge** — The process or system that converts (or enriches) meaning-map data into formats suitable for oral delivery, language-specific models, or downstream tools (e.g. acousteme training, TTS, rehearsal scripts in a target language).
- **Target language** — The language of the oral output (e.g. Hindi). Implementations may be language-specific (e.g. **oral-bridge-hindi** for Hindi).
- **High-resource language** — A language with substantial written corpora, existing NLP/ML models, and tooling (e.g. Hindi). The Oral Bridge approach is suited to such languages; low-resource languages may need different strategies.
- **Tripod methodology** — Shema’s framework for oral Scripture: Meaning Map (structure), Language Archive (data), Concept Bank (concepts). Oral Bridge belongs to the Meaning Map subgraph.

---

## Purpose

- **Solves:** The need to go from a **meaning map** (language-agnostic structure) to **oral/language-specific** artifacts (e.g. renditions, segments, training data) that other Tripod or ML systems can use.
- **Target users:** Teams and pipelines that consume meaning maps and need Hindi (or another language) oral output; integrators of Tripod Studio, meaning-map-generator, or acousteme/translation tooling.
- **Primary outcomes:** Language-specific outputs derived from meaning maps (e.g. Hindi oral content, aligned segments, or formats for rehearsal/TTS/training), with a clear contract between meaning-map and oral layers.

---

## Core flows (what a user or system does)

1. **Consume meaning-map data**  
   The bridge receives meaning-map content (e.g. TRIPOD export or API payload) for one or more passages: participants, events, discourse, clause-level data, optional translations.

2. **Produce oral/language-specific output**  
   The system transforms or enriches that data for the target language (e.g. Hindi): e.g. oral renditions, segment boundaries, script for rehearsal or TTS, or training-ready representations (e.g. acousteme-related). Optional use of LLMs or proprietary models for generation or alignment.

3. **Feed downstream systems**  
   Outputs are consumed by Tripod Studio (rehearsal/approval), translation or acousteme pipelines, or data-collection/language-archive tooling. Contracts (formats, APIs) define how meaning-map and oral sides integrate.

*(Note: The **oral-bridge-hindi** repository was not in the docs workspace when this page was written. When that repo is available, these flows should be updated to match its actual features and APIs.)*

---

## Architecture (in plain terms)

- **Role in landscape:** Oral Bridge is a **Meaning Map** system: it reads from the meaning-map layer (and shared ML/LLM capabilities) and writes into oral/language-specific pipelines. It may be implemented as a service, a library, or a per-language repo (e.g. oral-bridge-hindi).

- **Inputs:** Meaning-map data (TRIPOD-shaped JSON or equivalent API), optional config (target language, options). May call shared LLM or ML services.

- **Outputs:** Language-specific artifacts (e.g. Hindi oral text, segments, training manifests). Format depends on the implementation and downstream consumers.

- **Boundaries:** No direct database in the landscape diagram; it may use file I/O, object storage, or APIs. Frontend/backend split is implementation-dependent (e.g. oral-bridge-hindi may be CLI, batch, or API).

*(When **oral-bridge-hindi** is documented, replace this section with its actual stack: runtime, services, storage, and deployment.)*

---

## Runtime and deployment

- **Environments:** To be specified per implementation (e.g. oral-bridge-hindi). Likely local or cloud batch, or a small service alongside Tripod/meaning-map tooling.
- **Build/deploy path:** To be documented from the implementation repo.
- **Operational dependencies:** Meaning-map data source (Meaning Map Generator or TRIPOD export); optional LLM/ML APIs; target-language config or models.

---

## Integrations

- **Inputs:** Meaning maps (TRIPOD export or API from meaning-map-generator); optional LLM/proprietary models (shared capabilities).
- **Outputs:** Oral/language-specific outputs (e.g. Hindi scripts, segments, training data) for Tripod Studio, translation helpers, or language-archive systems.
- **Contracts:** To be defined with meaning-map-generator (export format, passage scope) and with consumers (Tripod Studio, acousteme/translation pipelines). Document once oral-bridge-hindi (or the canonical implementation) is available.

---

## Related software

- **oral-bridge-hindi** — Language-specific implementation or pilot for Hindi. Repository: expected at `shemaobt/oral-bridge-hindi` (or equivalent). It was not in the docs workspace when this page was written; add a link and a short description here once the repo is accessible and documented.
- **meaning-map-generator** — Produces the meaning maps this system consumes. See [Meaning Map Generator](/docs/systems/meaning-map-generator).
- **tripod-studio** — Consumes rehearsal/approval flows; may consume Oral Bridge output for oral practice and approval.

---

## Related RFCs

- [Semantic Acoustic Mapping](/rfcs/semantic-acoustic-mapping), [Semantic Acoustic Linking](/rfcs/semantic-acoustic-linking) — semantic representation and linking.
- [Parallel Acousteme Latent Translation](/rfcs/parallel-acousteme-latent-translation), [Oral-First Translation Reframe](/rfcs/oral-first-acousteme-translation-reframe) — translation direction and oral-first flow; relevant to how the bridge produces oral output.

---

## Roadmap and open questions

- **Near-term:** Document **oral-bridge-hindi** (purpose, flows, APIs, deployment) once the repo is available; define clear contracts with meaning-map-generator and downstream consumers.
- **Risks:** Dependency on meaning-map format stability; per-language implementations may diverge if not aligned on a common bridge contract.
- **Decisions pending:** Canonical naming (Oral Bridge vs. oral-bridge-hindi); single multi-language service vs. one repo per language; exact output formats and ownership in the system landscape.
