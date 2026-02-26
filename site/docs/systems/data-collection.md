---
title: Data Collection
sidebar_position: 9
---

# Data collection app

## Purpose

Mobile and web app for missionaries to collect monolingual audio data with local people. The system replaces manual, resource-heavy workflows (e.g. Adobe Podcast) with an offline-first app: record or upload audio, tag by predefined genre/subcategory, sync when online, and optionally clean audio via API (web). Target users are field collectors and project admins; outcomes are categorized, per-language audio corpora with clear ownership, upload status, and support for a “not clean” / cleaning workflow.

## Core capabilities

- **Offline-first recording and tagging** — Record in-app or upload existing files; assign project, genre, and subcategory/prompt. Recordings and metadata are stored locally first; sync runs when online.
- **Projects and roles** — Projects are per language. Roles: Admin (system), Project Admin (create projects, invite users), User (record and self-service). Role checks at entry points protect admin and project management.
- **Predefined genres and per-category duration** — Genres and subcategories/prompts come from a predefined list (aligned with existing audio-tagging). Per-category duration (hours/minutes) per language is shown and updated when recordings change.
- **Edit and upload** — Users can edit recordings (crop, delete, move category). Upload of existing audio is supported on mobile and web; files are treated like in-app recordings (local first, then sync).
- **“Not clean” and cleaning** — Recordings can be marked “needs cleaning.” Web-only flow: call a third-party API (e.g. Cleanvoice or Auphonic) to clean audio, store result in cloud storage (e.g. GCS), and update recording status. Only tagged recordings are eligible.

## Architecture and data flow

- **Client:** Flutter app (iOS, Android, web). Local persistence (e.g. SQLite/Drift) for projects, genres, subcategories, and recordings (file reference, metadata, upload status, “needs cleaning” flag).
- **Sync:** When online, pending recordings sync to the server; optional removal of local file after upload to free space while keeping metadata for timers and lists.
- **Storage:** Server/backend stores recordings; cleaned audio and final assets in cloud bucket (e.g. GCS) with links in recording metadata.
- **Cleaning (web only):** Web backend or serverless function uploads audio to chosen provider API, runs cleaning, retrieves result, stores in GCS, and updates recording status (e.g. clear “needs cleaning” or set “cleaned”).

## Runtime and deployment

- **Environments:** Mobile (iOS/Android via Flutter), web (Flutter web or separate web app). Backend/sync service and optional cleaning pipeline (web-triggered).
- **Build/deploy path:** Flutter build and distribution for mobile; web build and static/server hosting; backend and serverless functions per existing Shema deployment practices.
- **Operational dependencies:** Backend/sync API, cloud storage (e.g. GCS), third-party cleaning API (Cleanvoice or Auphonic) and API keys; auth/invite flow for projects and roles.

## Integrations

- **Audio-tagging system** — Shared predefined genres and subcategories/prompts (source: product/Melissa/Kim).
- **Cloud storage (GCS)** — Persistence of uploaded and cleaned audio; project/language structure.
- **Audio cleaning APIs** — Cleanvoice.ai or Auphonic for web-only cleaning; upload → process → retrieve URL/file; store result in GCS and update recording.
- **Backend** — Sync, auth, project and user/role management, invite flow.

## Related RFCs

- to be added

## Roadmap and open questions

- **Near-term milestones:** Phases 1–3 (setup, data model, roles, projects, admin, genres, timers); phases 4–6 (record, upload/sync, edit, upload existing mobile/web); phase 7 (“not clean” flag and workflow); phase 8 (audio cleaning via API, web only).
- **Known risks:** Dependency on third-party cleaning API (pricing, rate limits, availability); web-only cleaning excludes mobile-only users until a later phase.
- **Decisions pending:** Final choice of cleaning provider (Cleanvoice vs Auphonic); backend and invite mechanism (e.g. email, deep link); exact “cleaned” status and UX for pending/cleaning/cleaned/failed.
