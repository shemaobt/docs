# RFC 007: Raw-First Acousteme Storage Strategy

- Feature Name: `raw_acousteme_storage`
- Start Date: 2026-02-09
- RFC PR: [bible-audio-training/rfcs/0001-raw-storage.md](https://github.com/placeholder)
- Related: RFC 008 (Semantic Mapping)

# Summary

This RFC defines the **Standard Storage Format** for the acoustic model's output (`acoustemes.json`). It establishes that the backend's responsibility is solely to produce a faithful, high-resolution stream of acoustic segments. The responsibility for **grouping, smoothing, and visualization** (e.g., creating "beads") lies entirely with consuming applications like the [`beads`](https://github.com/shemaobt/beads) frontend.

# Motivation

We must decouple **Data Generation** (Backend) from **Data Presentation** (Frontend).
*   **Backend Constraint**: Must capture the "Acoustic Reality" without loss. If the model hears a 20ms glitch, it must be stored.
*   **Frontend Need**: Users need a "Manageable View". A stream of 12,000 tiny segments is unusable.

**The Solution**: Store the Raw Segments. Let the frontend (`beads`) decide how to "chunk" them.

# Guide-level explanation

## The Architecture

```mermaid
graph LR
    A[Audio File] -->|Inference| B[Model (MMS-300M)]
    B -->|Raw Output| C(acoustemes.json)
    C -->|Load| D[Beads Frontend]
    D -->|User Selector| E{Granularity}
    E -->|Small| F[Show Raw Details]
    E -->|Large| G[Aggregated Beads]
```

### 1. The Storage (`acoustemes.json`)
This file is the **Immutable Source of Truth**. It contains the exact output of the acoustic model, compressed only by lossless Run-Length Encoding (RLE) to decrease file size (e.g. from 50MB to ~300KB for 1 min) without losing precision.

### 2. The Manipulator (`beads`)
The `beads` directory contains a reference implementation of a **Consumer**. It acts as a projection layer:
*   **Dynamic Granularity**: It groups raw RLE segments into UI-friendly "chunks" (default `chunkSize = 25` segments).
    *   *Time Boxing*: Each chunk's start/end time is derived from its first and last constituent segments.
*   **Two-Phase Workflow**:
    *   **Phase 1 (Structure)**: Users click chunks to mark **Breakpoints**, splitting the stream into larger semantic segments.
    *   **Phase 2 (Meaning)**: Users attach tags (Gloss, Event, Participant) to these user-defined segments.
*   **Non-Destructive**: The user's preferences (e.g., breakpoints, tags) are stored separately. The raw `acoustemes.json` remains untouched.

# Reference-level explanation

## The Standard Schema (`acoustemes.json`)

The backend *must* output files adhering to this strict schema:

```json
{
  "duration_sec": 238.6024,
  "num_frames": 11929,
  "segments": [
    {
      "start": 0.0,
      "end": 0.02,
      "unit_id": 31
    },
    {
      "start": 0.02,
      "end": 0.04,
      "unit_id": 38
    },
    ...
  ]
}
```

### Field Definitions
*   `duration_sec`: Float. Total duration of the audio file in seconds.
*   `num_frames`: Integer. Total number of analysis frames (typically 50Hz).
*   `segments`: Array of objects.
    *   `start`: Float. Start time in seconds.
    *   `end`: Float. End time in seconds.
    *   `unit_id`: Integer. The discrete code from the model's codebook.

## The Beads Manipulation Logic (`beads/index.html`)
The `beads` reference implementation demonstrates the "Consumer-Driven" philosophy:
1.  **Iterative Grouping**: The `updateChunkedAcoustemes()` function iterates through the raw `segments` array, slicing it into batches of size `chunkSize`.
2.  **Visual Abstraction**: Each batch is rendered as a single interactive element (a "bead"), abstracting roughly 0.5s - 1.0s of audio associated with those ~25 raw segments.
3.  **Breakpoint Logic**: The `finishSegmentation()` function uses user-defined indices (`breakPoints`) to merge these visual beads into larger, permanent segments for tagging.

# Rationale

This approach prevents "Premature Optimization". If we pre-grouped the data in the backend (e.g., "only save segments > 100ms"), we would permanently destroy acoustic information. By storing raw RLE segments, we allow the `beads` tool—and future AI agents—to "zoom in" to the 20ms level when necessary.

# Drawbacks

*   **File Size**: `acoustemes.json` can be large for long audio (approx. 300KB per minute of audio).
*   **Frontend Load**: The browser must hold the entire segment list in memory.

