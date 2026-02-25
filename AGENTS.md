# Agent Guidelines (docs-deploy)

This document defines engineering and documentation standards for LLM agents working in this repository.

Use this file as the default behavior guide for changes in `docs-deploy/`.

---

## 1. Mission and Scope

- This repository hosts the Shema documentation website.
- The site must serve both:
  - evergreen product and architecture documentation, and
  - RFC documents as a dedicated section, not the full site.
- Prefer MDX-ready authoring for rich documentation experiences.

---

## 2. Documentation Architecture

- Keep system and process documentation in `site/docs/`.
- Keep RFC source files in the RFC repository and render them under the dedicated RFC route.
- Do not duplicate RFC content inside system docs. Summarize and link instead.
- Use stable, domain-oriented sections:
  - `Overview`
  - `Architecture`
  - `Systems`
  - `Process`
  - `Reference`
  - `RFCs`

---

## 3. Writing Standards

- Prefer concise, factual, implementation-oriented writing.
- Use headings and short sections.
- Use clear names and domain vocabulary.
- Avoid filler and marketing language.
- Keep one source of truth for each concept.

### Recommended system page structure

- Purpose
- Core flows
- Architecture
- Runtime and deployment
- Integrations
- Related RFCs
- Roadmap and open questions

---

## 4. MDX and Content Format

- Prefer Markdown for static content.
- Use MDX when richer content improves understanding (Mermaid diagrams, callouts, reusable components).
- Keep pages readable as plain Markdown when possible.
- Ensure links between docs and RFC pages are explicit and maintained.

---

## 5. Frontend and Site Conventions

This repo uses Docusaurus (React + TypeScript). For frontend-facing edits, apply these principles inspired by `mm_poc_v2` AGENTS:

- Prefer functional components over classes.
- Keep components small and composable.
- Use self-explanatory naming and avoid comments that restate code.
- Reuse existing patterns in `site/src/` before introducing new abstractions.
- Avoid overengineering. Implement the smallest useful change first.

---

## 6. Configuration and Operations

- Keep `docusaurus.config.ts` and sidebars aligned with the content structure.
- Avoid leaving starter/tutorial pages in production navigation.
- When adding a major section, update:
  - navigation,
  - sidebars,
  - homepage entry points.

---

## 7. Secrets and Safety

- Never hardcode secrets, keys, or credentials.
- Keep sensitive values in environment variables used by CI/CD.
- Do not commit generated artifacts unless the repository intentionally tracks them.

---

## 8. Version Control

- Do not commit unless the user explicitly asks.
- When requested to commit:
  - inspect status and diff first,
  - group changes by logical scope,
  - use semantic commit messages (`type(scope): description`).

---

## 9. Quick Checklist

- [ ] Docs are organized by domain and lifecycle, not by ad hoc pages.
- [ ] RFCs are available but isolated in a dedicated section.
- [ ] System pages exist for current portfolio systems.
- [ ] Sidebars and navbar reflect actual information architecture.
- [ ] Writing is concise, technical, and link-rich.
- [ ] No secrets or unsafe defaults introduced.
