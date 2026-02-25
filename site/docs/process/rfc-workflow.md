---
title: RFC Workflow
sidebar_position: 1
---

# RFC Workflow

RFCs are for significant technical decisions, alternatives, and trade-off records.

## When to write an RFC

Create an RFC when changes affect:

- platform architecture,
- data contracts between systems,
- model strategy or training lifecycle,
- operational risk or deployment topology.

## Lifecycle

1. Draft in `rfcs` repository.
2. Circulate for technical review.
3. Mark as accepted, superseded, or rejected.
4. Implement and update the corresponding system docs.
5. Link implementation status from the RFC.

## Required sections

- Context
- Problem statement
- Options considered
- Chosen direction
- Consequences and risks
- Rollout plan

## Relationship with system docs

RFCs explain why a decision was made. System docs explain what currently exists.
