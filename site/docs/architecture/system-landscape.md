---
title: System Landscape
sidebar_position: 1
---

# System Landscape

This page describes how current Shema systems fit together and where to document details.

## Portfolio map

```mermaid
flowchart LR
  A[obt-mentor-companion]
  B[translation-helper]
  C[mm_poc_v2]
  D[tripod-studio]
  E[meaning-map-generator]
  F[oral-bridge]
  G[proprietary-ml-models]

  G --> C
  G --> B
  C --> A
  B --> A
  E --> A
  D --> A
  F --> A
```

## System documentation checklist

Every system page should include:

- purpose and scope,
- main user flows,
- architecture and components,
- runtime/deployment model,
- data contracts and dependencies,
- known risks and next milestones.

## Ownership model

Use one page per system in `Systems`. Keep this architecture page focused on cross-system relationships.
