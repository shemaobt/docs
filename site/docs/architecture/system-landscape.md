---
title: System Landscape
sidebar_position: 1
---

# System Landscape

This page describes how current Shema systems fit together and where to document details.

## Portfolio map

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#f8fafc', 'primaryBorderColor':'#cbd5e1', 'lineColor':'#64748b', 'secondaryColor':'#f1f5f9', 'tertiaryColor':'#e2e8f0'}}}%%
flowchart LR
  subgraph Shared["Shared capabilities"]
    G(proprietary-ml-models)
    H(LLM agents)
  end

  subgraph Tripod["Tripod Methodology"]
    subgraph MeaningMap["Meaning Map"]
      D(tripod-studio)
      E(meaning-map-generator)
      F(oral-bridge)
    end
    subgraph LanguageArchive["Language Archive"]
      W(oral-capture)
    end
    subgraph ConceptBank["Concept Bank"]
      U(to be defined)
    end
  end

  subgraph MissionaryTraining["Missionary Training"]
    A(obt-mentor-companion)
  end

  subgraph MissionarySupport["Missionary Support"]
    B(translation-helper)
  end

  G --> W
  G --> U
  G --> D
  G --> E
  H --> A
  H --> B
  H --> E

  classDef shared fill:#e0f2fe,stroke:#0ea5e9,stroke-width:1px
  classDef tripod fill:#fef3c7,stroke:#d97706,stroke-width:1px
  classDef training fill:#d1fae5,stroke:#059669,stroke-width:1px
  classDef support fill:#ede9fe,stroke:#7c3aed,stroke-width:1px
  class G,H shared
  class D,E,F,W,U tripod
  class A training
  class B support
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
