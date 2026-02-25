---
title: Translation Helper
sidebar_position: 3
---

# Translation Helper

## What it is and why it exists

The **Translation Helper** is an AI-powered **voice and translation** app for missionaries and translation teams. It provides **context-aware translation** (Google Gemini), **speech-to-text** (voice input), **text-to-speech** (Google Cloud TTS) for playback, and **specialized assistants** (e.g. Storyteller, Oral Performer, Back Translation Checker) that help with Bible translation and oral delivery. Users can translate text between languages, speak or type into a chat, get streaming AI responses, and manage conversation history. In the Shema landscape it sits under **Missionary Support** and consumes **LLM agents** (shared capability). It is cost-oriented (Gemini 2.0 Flash, ~$0.13/M tokens) and supports both **public endpoints** (translate, transcribe, speak, rate-limited) and **authenticated chat** with multiple agent types.

**In one sentence:** It is a voice-enabled translation and assistant app: translate, transcribe, speak, and chat with specialized AI agents (Storyteller, Oral Performer, OBT Health Assessor, Back Translation Checker) for Bible translation and oral Scripture work.

---

## Key terms (defined)

- **Assistants (agents)** — Specialized AI personas, each with a prompt and model (e.g. Gemini 2.0 Flash). Prompts are stored in the database and editable by admins. See **Assistants (agents)** below for each agent and its purpose.
- **Public API** — Endpoints that do not require login: translate, transcribe, speak. Rate-limited (e.g. 50 requests per 15 minutes per IP) for anonymous or external use.
- **Streaming** — AI responses are sent incrementally via **Server-Sent Events (SSE)** so the user sees output as it is generated.
- **OBT** — Oral Bible Translation; the Health Assessor assistant supports evaluating OBT projects.

---

## Assistants (agents)

Each assistant is a distinct AI persona with a system prompt and a short description shown in the UI. Users choose one when starting a chat; conversation history is per chat and per assistant.

| Agent | Purpose |
|-------|--------|
| **Storyteller** | Helps translation teams understand biblical words and concepts by telling **engaging, culturally-relevant stories** that illustrate meaning. When users ask about a term or concept that is hard to translate, the Storyteller offers stories so they can choose the best word or phrase. Focus: making abstract biblical ideas concrete and applicable. |
| **Conversation Partner** | Acts as a **knowledgeable discussion partner** for exploring Bible concepts. Explains terms, passages, and context; answers questions; helps users think through translation choices and consider different interpretations. Role: exegetical expert and supportive friend to help teams translate accurately and effectively. |
| **Oral Performer** | Presents biblical passages in **clear, natural spoken language** to help teams grasp meaning. Can adapt style (e.g. young adults, children) and offer different versions: poetic, enthusiastic, simplified, paraphrased, or explanatory. Aims to help users “hear” the text in a fresh way for translation and oral delivery—not as final translations. |
| **OBT Project Health Assessor** | Supports **Oral Bible Translation (OBT) teams** by guiding a story-based conversation about project health. Asks neutral, open-ended questions about team, process, quality, community engagement, and sustainability; does not give advice during the assessment. At the end provides a friendly summary of strengths and growth areas and a simple rating table. Intended to be run with the team about once per quarter (assessment can take over an hour). |
| **Back Translation Checker** | Helps **verify translation accuracy** by comparing a **back translation** to the original biblical text. Identifies possible accuracy issues, missing elements, or additions; checks fidelity to intent and meaning; suggests improvements in a supportive way. Acts as a consultant so translations faithfully convey the original meaning. |

---

## Purpose

- **Solves:** The need for a single app that combines **translation**, **voice in/out**, and **task-specific AI assistants** (storytelling, oral performance, back-translation checking, OBT health) for missionaries and translation teams.
- **Target users:** Missionaries, translation teams, and facilitators who need quick translation, voice input/output, and guided assistance for Bible translation and oral Scripture tasks.
- **Primary outcomes:** Context-aware translation between languages; voice transcription and synthesis; persistent chats with streaming responses from multiple assistants; admin-manageable prompts; public API for integrate-able translate/transcribe/speak.

---

## Core flows (what a user does)

1. **Use public translate / transcribe / speak (no login)**  
   Call `POST /api/public/translate`, `/api/public/transcribe`, or `/api/public/speak` with text or audio. Get translation, transcription, or audio back. Rate limits apply per IP. Used for quick one-off use or by external tools.

2. **Sign up, log in, and manage profile**  
   Users register (e.g. email/password via Passport); they can update profile and password. Authenticated sessions are required for chats and streaming.

3. **Chat with an assistant**  
   The user picks an **assistant** (Storyteller, Oral Performer, Conversation Partner, OBT Health Assessor, or Back Translation Checker), opens or creates a **chat**, and sends messages (text or voice — voice is transcribed via Gemini). The AI replies with **streaming** (SSE) so the response appears in real time. Conversations are stored and listed under “Chats.”

4. **Listen to responses (TTS)**  
   The user can trigger **text-to-speech** for assistant replies (Google Cloud TTS, Neural2 voices). Audio is cached per voice for fast replay.

5. **Admins manage prompts and users**  
   Admins edit **agent prompts** in the database (via Admin UI at `/admin/prompts`), reset prompts to defaults, list users, and view feedback. Default prompts are defined in `server/prompts.ts` and seeded on deploy.

---

## Architecture (in plain terms)

- **Frontend (client):** React 18, TypeScript, Vite, Tailwind, shadcn/ui. Pages for login, chat, assistant selection, and admin (prompts, users, feedback). Consumes backend at `/api/*`; uses SSE for streaming chat responses.

- **Backend (server):** Express (Node.js), TypeScript, Drizzle ORM, PostgreSQL (Neon). **Routes** (auth, users, chats, audio, public, admin) only parse and validate (Zod) and call **services** or **storage**; no business logic in routes. **Storage** holds all Drizzle queries; **services** implement chat, auth, and user logic. **gemini.ts** is the single Gemini client (translation, transcription, streaming); **prompts.ts** holds agent prompt definitions. Session auth via Passport; optional API-key auth for programmatic access.

- **AI:** Google Gemini 2.0 Flash for translation, transcription, and all assistant replies; streaming via SSE. Google Cloud TTS for speech synthesis; voice-specific caching for replay.

- **Database:** PostgreSQL (Neon). Tables include users, chats, messages, prompts, feedback, and related schema. Shared types and Zod schemas in `shared/schema.ts`.

---

## Runtime and deployment

- **Environments:** Local via Docker Compose (client + server containers); production on **Google Cloud Run** (Terraform + GitHub Actions). Database: Neon PostgreSQL.
- **Build/deploy path:** `client/` → frontend build (e.g. Vite); `server/` → backend (Node). Dockerfiles: `Dockerfile.frontend`, `Dockerfile.backend`. Schema sync: `npm run db:push` (or drizzle-kit generate/migrate for production). Deploy: push to main triggers GitHub Actions; secrets (e.g. `NEON_DATABASE_URL`, `GOOGLE_API_KEY`, `SESSION_SECRET`, GCP workload identity) come from GitHub Secrets.
- **Operational dependencies:** Neon PostgreSQL, Google Gemini API key, Google Cloud account (TTS), session secret; for Cloud Run, GCP project and workload identity.

---

## Integrations

- **Inputs:** User text and audio (for translation, transcription, chat); admin edits to prompts. External: Gemini API (translation, transcription, chat), Google Cloud TTS (synthesis).
- **Outputs:** Translation text, transcriptions, synthesized audio (cached); stored chats and messages; prompt versions in DB. Public API returns JSON (translate, transcribe) or audio (speak).
- **Contracts:** REST under `/api/*`. Public: `POST /api/public/translate`, `POST /api/public/transcribe`, `POST /api/public/speak` (rate-limited). Protected: `/api/chats`, `/api/chats/:id/messages`, `/api/chats/:id/stream` (SSE), `/api/auth/*`, `/api/user/*`. Admin: `/api/admin/prompts`, `/api/admin/users`, `/api/admin/feedback`. No formal contracts with other Shema systems; it is a standalone Missionary Support app.

---

## Related software

- **translation-helper** — The implementation: [shemaobt/translation-helper](https://github.com/shemaobt/translation-helper). React client + Express server + Drizzle + Neon + Gemini + Google Cloud TTS. Covers public translate/transcribe/speak, authenticated chat with multiple assistants, streaming, and admin prompt management.

---

## Related RFCs

- Add RFC links here when relevant (e.g. translation quality, assistant design, or public API contracts).

---

## Roadmap and open questions

- **Near-term:** Keep streaming and voice UX stable; consider more assistants or prompt templates; document public API for integrators.
- **Risks:** Dependency on Gemini and Google Cloud TTS availability and quotas; rate limits may need tuning for heavy public API use.
- **Decisions pending:** Whether to formalize public API versioning or SLAs; how Translation Helper might integrate with other Shema systems (e.g. meaning-map-generator, Tripod Studio) if at all.
