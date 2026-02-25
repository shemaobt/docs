---
title: Meaning Map Generator
sidebar_position: 6
---

# Meaning Map Generator

## What it is and why it exists

The **Meaning Map Generator** is the system that turns a **Biblical Hebrew passage** (e.g. “Ruth 1:1–5”) into a **meaning map**: a structured, editable representation of *who* does *what* in the passage and how the text is organized. That structure is then used by other Shema systems for **rehearsal** (practice scripts), **translation**, and **training**. Without this step, there would be no consistent “map” of a passage for those tools to work from.

**In one sentence:** It takes raw Hebrew text, optionally uses AI to fill in participants and events, and outputs a structured meaning map that Tripod Studio and other systems consume.

---

## What is a meaning map?

A **meaning map** for a passage is a structured description that includes:

- **Participants** — who is in the passage (people, groups, God, etc.) and how they relate to each other.
- **Events** — what happens (actions, speech, movement), tied to participants and to specific clauses in the Hebrew text.
- **Discourse** — how the text is organized (e.g. dialogue, narration, repetition).
- **Clause-level data** — which Hebrew words/clauses correspond to which events and participants.
- **Translation** — optional free translation of each clause (e.g. for rehearsal or checking).
- **Rehearsal** — generated practice text (e.g. in a target language) derived from the meaning map, often with segments and audio.

The source text comes from **BHSA** (Biblia Hebraica Stuttgartensia Amstelodamensis), a standard scholarly dataset of the Hebrew Bible. A **pericope** is simply a passage reference (book, chapter, verse range) that you choose to work on (e.g. “Ruth 1:1–22”). The generator stores everything in a database and can export it in **TRIPOD** format — a JSON structure that other Shema apps understand.

---

## Purpose

- **Solves:** The need to go from “a passage reference” to “a consistent, editable meaning map” that downstream tools can use for rehearsal, translation, and training.
- **Target users:** Translators and teams who prepare oral Scripture products and need structured passage data.
- **Primary outcomes:** Pericope-based meaning maps (participants, events, discourse, clause-level translation), optional AI-assisted analysis, rehearsal generation, and export in TRIPOD format for other systems.

---

## Core flows (what a user does)

1. **Choose a passage and load Hebrew data**  
   The user selects or creates a **pericope** (e.g. “Ruth 1:1–5”). The system needs **BHSA** data loaded (either via a one-time fetch into a shared volume or a GCS mount). Users can lock/unlock pericopes for editing and list contributors and books.

2. **Run AI analysis (optional)**  
   The system can fill in the meaning map using an LLM (e.g. Claude or Gemini):
   - **Phase 1:** Extract participants and relations from the Hebrew passage.
   - **Phase 2:** Add events and discourse structure (requires Phase 1 to be done).  
   Both phases can run in one go or as **streaming** (real-time progress in the UI). There are also options for full prefill or clause-level translation only.

3. **Rehearsal and export**  
   From the meaning map, the user can generate **rehearsal** text (e.g. for oral practice in a target language), save rehearsals with segments and audio, and **export** a passage as TRIPOD-format JSON or **finalize** it for publication. Tripod Studio and other apps call the same APIs for rehearsal and approval.

---

## Architecture (in plain terms)

- **Web app (frontend):** A React app (Vite, Zustand, Tailwind) where users pick passages, run AI analysis, edit participants/events, and trigger rehearsal and export. It talks to the backend over `/api/*`.

- **Backend (API and logic):** A FastAPI service backed by PostgreSQL (via Prisma). It handles: passages and pericopes, participants and relations, events and discourse, BHSA load and passage extraction, AI analysis (prefill, Phase 1, Phase 2, translation), export and finalize, rehearsal and approval (Tripod), audio, auth, and users.

- **Hebrew text source (BHSA):** The Biblia Hebraica Stuttgartensia Amstelodamensis dataset, used via the text-fabric tooling. It is loaded into memory at startup from a shared volume or from Google Cloud Storage; the backend exposes APIs to load it and to extract passage text.

- **AI:** All LLM calls go through a single layer (`app.ai`): LangChain client, prompts for participants, events, translation, clause merge, and rehearsal, plus the TRIPOD schema and target languages. Models used are typically Claude (Anthropic) and/or Gemini (Google).

---

## Runtime and deployment

- **Where it runs:** Locally with Docker Compose; in production, backend and frontend run as separate services on Google Cloud Run.
- **How it’s built and deployed:** Backend image from `backend/` (Dockerfile); frontend from `frontend/` (Vite build). BHSA can be provided by a dedicated `bhsa-fetcher` service that fills a shared volume, or by mounting a GCS bucket and calling `POST /api/bhsa/load` after deploy.
- **What it depends on:** PostgreSQL, the BHSA data source, and GCP Secret Manager for database URL and LLM API keys. CI/CD uses GitHub Actions and repo secrets (`GCP_PROJECT_ID`, `GCP_SA_KEY`, `SECRETS_PROJECT_NUMBER`).

---

## Integrations

- **Inputs:** BHSA (text-fabric) for Hebrew text and structure; optional LLM APIs (Anthropic, Google) for AI analysis and translation.
- **Outputs:** Meaning maps stored in PostgreSQL (passages, participants, events, discourse, rehearsals); export as TRIPOD-shaped JSON via `/api/maps/{passage_id}/export`.
- **Who uses this system:** Tripod Studio calls `/api/tripod/rehearsal/*` and `/api/tripod/approval/*`. Other consumers use the export format and rehearsal segment data.

---

## Related software

- **mm_poc_v2** — The current implementation of the Meaning Map Generator: [shemaobt/mm_poc_v2](https://github.com/shemaobt/mm_poc_v2). It is the Biblical Meaning Maps app (React + FastAPI + PostgreSQL + BHSA + LangChain) that provides pericopes, AI phases, rehearsal, and export.
- **ruth-experiment** — A related codebase for this step; its purpose and flows can be added here once that repo is documented.

---

## Related RFCs

- [Semantic Acoustic Mapping](/rfcs/semantic-acoustic-mapping), [Semantic Acoustic Linking](/rfcs/semantic-acoustic-linking) — semantic representation and linking.
- [Parallel Acousteme Latent Translation](/rfcs/parallel-acousteme-latent-translation), [Oral-First Translation Reframe](/rfcs/oral-first-acousteme-translation-reframe) — translation direction and oral-first flow.

---

## Roadmap and open questions

- **Near-term:** Stabilize streaming AI analysis and Tripod Studio rehearsal integration; document ruth-experiment once available.
- **Risks:** BHSA load can take 10–30 minutes and uses significant memory; the system depends on LLM API keys and quotas.
- **Open:** Clarify naming and ownership of “meaning map generator” vs. mm_poc_v2 vs. ruth-experiment in the system landscape.
