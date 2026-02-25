---
title: OBT Mentor Companion
sidebar_position: 2
---

# OBT Mentor Companion

## What it is and why it exists

The **OBT Mentor Companion** is an AI-powered app that helps **facilitators** in **Oral Bible Translation (OBT)** programs track their growth, manage their portfolio, and get mentorship guidance. OBT facilitators are people who support mother-tongue translators (often in oral-culture contexts); they need to demonstrate and improve a set of **competencies** (e.g. intercultural communication, translation theory, consulting) and keep evidence of **qualifications** and **activities**. This system centralizes that: users update their competency levels, log activities, attach documents, chat with an AI mentor, and generate **quarterly reports** (DOCX) for supervisors. Without it, facilitators would rely on spreadsheets and email; with it, progress and evidence live in one place and the AI can give contextual advice based on their profile and past conversations.

**In one sentence:** It is a portfolio and mentorship app for OBT facilitators: competency tracking, qualifications, activities, AI chat with semantic memory, and auto-generated quarterly reports.

---

## Key terms (defined)

- **OBT** — Oral Bible Translation: programs that help communities produce Scripture in their language using oral-first methods (e.g. storying, recording, community checking).
- **Facilitator** — A person who supports OBT teams (training, consulting, quality, logistics). They are the primary users of this system.
- **Competency** — One of 11 core skill areas (e.g. Interpersonal Skills, Biblical Languages, Planning & Quality Assurance). Each has a **status level**: Not Yet Started → Emerging → Growing → Proficient → Advanced. Competencies can only move forward (no downgrades).
- **Qualification** — A credential or training the facilitator has completed (e.g. a course, certificate). Stored with attachments and optional evidence; can influence whether they can reach “Advanced” in a competency.
- **Mentorship activity** — A logged activity (e.g. mentoring a team, attending a workshop) that contributes to their portfolio and can be cited in reports.
- **Quarterly report** — A DOCX report auto-generated from the facilitator’s competencies, qualifications, activities, and optional AI-generated narrative; used for supervisor review.
- **AI mentor** — A chat assistant (Google Gemini) that gives guidance based on the user’s profile and on **semantic memory** (Qdrant): past conversations are embedded and searched so the AI can refer to earlier context.

---

## Purpose

- **Solves:** The need for OBT facilitators to track competencies, store qualifications and activities, get consistent AI mentorship, and produce quarterly reports without manual copy-paste.
- **Target users:** OBT facilitators (and admins who approve users and manage documents).
- **Primary outcomes:** Up-to-date competency levels with business rules (no downgrades; Advanced requires degree + experience), qualifications and activities with attachments, AI chat with cross-session memory, and generated DOCX reports.

---

## Core flows (what a user does)

1. **Sign up, get approved, and maintain profile**  
   Users register (e.g. email/password or OIDC); an admin approves them. They set up their **facilitator profile** (and optional profile image). All other flows assume they are logged in.

2. **Track competencies**  
   The user sees the 11 competencies and their current level. They update a level (e.g. “Growing” → “Proficient”) when they have evidence. The system enforces: no downgrades, and “Advanced” only if they have both a Bachelor+ and 3+ years of relevant experience. Change history is stored for auditing.

3. **Manage qualifications and activities**  
   The user adds **qualifications** (with optional PDF/DOCX/image attachments and short evidence text) and **mentorship activities** (what they did, when). These feed into reports and can be used by the AI mentor for context.

4. **Chat with the AI mentor**  
   The user opens a chat (or continues an existing one), sends messages (text or voice — audio can be transcribed), and gets replies from the AI. The AI uses the facilitator’s competencies, qualifications, and activities, plus **semantic search** over past conversations (Qdrant), so it can give tailored guidance. Optionally, voice output (TTS) is available.

5. **Generate and download quarterly reports**  
   The user triggers “Generate report” for a time range. The backend builds a DOCX from their data and, optionally, an AI-generated narrative. The user downloads the file for their supervisor.

Admins can approve/reject users, manage **RAG documents** (uploaded PDF/DOCX/TXT that are chunked and searchable for the AI), and view feedback.

---

## Architecture (in plain terms)

- **Web app (frontend):** A React app (Vite, TypeScript, Tailwind, shadcn/ui) where users manage profile, competencies, qualifications, activities, chats, and reports. It talks to the backend at `/api/*`. Theming is user-selectable (e.g. Areia, Azul, Verde).

- **Backend (API and logic):** An Express (Node.js) server with TypeScript. It handles: auth (Passport, session), facilitator CRUD, competencies (with rules), qualifications and activities, chats and messages, AI (LangGraph agents), vector memory (Qdrant), report generation (DOCX), document upload/parsing (RAG), and file storage (local uploads or Google Cloud Storage). All persistence goes through **Drizzle ORM** to **PostgreSQL** (typically Neon). Validation uses **Zod**.

- **AI and agents:** **LangGraph** coordinates agents: a **conversational agent** (Gemini 2.5 Pro) for mentorship chat and a **report agent** (Gemini 2.5 Pro) for narrative generation; a **supervisor** routes between them. **Gemini 2.5 Flash** is used for cheaper tasks (e.g. translation). Audio input can be transcribed and synthesized via Gemini.

- **Vector memory:** Past chat messages are embedded with **Google text-embedding-004** and stored in **Qdrant Cloud**. When the user chats, relevant past context is retrieved and passed to the LLM so the mentor can refer to earlier conversations.

- **Storage:** PostgreSQL holds users, facilitators, competencies, qualifications, activities, chats, messages, reports, evidence, and related metadata. Optional **Google Cloud Storage** for report files and RAG document blobs. Config and secrets come from environment variables (e.g. GCP Secret Manager in production).

---

## Runtime and deployment

- **Environments:** Local development with Docker Compose (frontend and backend in containers); production on **Google Cloud Run** (recommended), with Terraform and GitHub Actions for CI/CD. Can also run as a single Node server (e.g. Heroku, Railway, Render) using `npm run build` and `npm start`.

- **Build/deploy path:** Monorepo: `frontend/` (Vite build → static assets), `backend/` (Express server). Build output: `dist/public/` (frontend) and `dist/index.js` (backend). Database schema is applied with `npm run db:push` (Drizzle). BHSA is not used; no Hebrew text pipeline.

- **Operational dependencies:** PostgreSQL (e.g. Neon), Google Gemini API key, Qdrant Cloud (URL + API key), session secret; optional GCS for files. Admin approval flow and optional OIDC for auth.

---

## Integrations

- **Inputs:** User-supplied data (profile, competency updates, qualifications, activities, chat messages, voice); admin-uploaded RAG documents (PDF, DOCX, TXT). External: Gemini API (chat, report narrative, embeddings, audio), Qdrant (vector store).

- **Outputs:** Stored data (competencies, qualifications, activities, chats, reports); generated DOCX reports; optional audio (TTS). No direct export to other Shema systems; the app stands alone for missionary training.

- **Contracts:** Session-based auth; API is REST under `/api/*`. No formal contracts with Tripod Studio or Meaning Map Generator; it sits in the “Missionary Training” part of the landscape and consumes shared capabilities (LLM agents) as documented in the system landscape.

---

## Related software

- **obt-mentor-companion** (this repo) — The implementation: [shemaobt/obt-mentor-companion](https://github.com/shemaobt/obt-mentor-companion). React + Express + Drizzle + PostgreSQL + LangGraph + Qdrant + Gemini. Covers facilitator profile, competencies, qualifications, activities, AI chat, semantic memory, and quarterly reports.

---

## Related RFCs

- Add RFC links here when relevant (e.g. competency framework, mentor workflows, or reporting standards).

---

## Roadmap and open questions

- **Near-term:** Stabilize streaming/UX for chat; optional deeper integration with OBT program workflows or external reporting systems.
- **Risks:** Dependency on Gemini and Qdrant availability and quotas; admin approval bottleneck if not automated.
- **Decisions pending:** Whether to formalize data export (e.g. for program dashboards) or keep the system self-contained.
