---
title: Documentation Map
sidebar_position: 1
---

# Documentation Map

This repository now separates evergreen product/system documentation from RFC decision records.

## Top-level structure

| Section | Purpose | Typical content |
| --- | --- | --- |
| `Overview` | Orientation for contributors | Information architecture, contribution flow |
| `Architecture` | Cross-system understanding | Platform map, integration boundaries, shared dependencies |
| `Systems` | Detailed product pages | Scope, components, runtime, deployment, roadmap |
| `Process` | How teams work | RFC workflow, review protocol, governance |
| `Reference` | Shared standards | Glossary, templates, conventions |
| `RFCs` | Historical and active proposals | Design options, trade-offs, accepted decisions |

## Content strategy

- Keep long-lived factual documentation in `Docs`.
- Keep design decisions and alternatives in `RFCs`.
- Link from system pages to relevant RFCs.
- Link from RFCs back to system pages when implementation lands.

## Recommended writing flow

1. Create or update a system page in `Systems`.
2. Add architecture implications in `Architecture` if cross-cutting.
3. If a decision needs alternatives and approval, write an RFC in `/rfcs`.
4. Backlink both directions to preserve context.
