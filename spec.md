# Shooting Target Trainer — Product Specification

## 1. Overview

A mobile-first web app that generates randomized target engagement sequences for shooting training drills. The shooter reads the sequence, then engages physical targets in the displayed order.

---

## 2. Functional Requirements

### 2.1 Sequence Generation

| # | Requirement |
|---|-------------|
| F1 | Generate a random sequence of target labels for each drill |
| F2 | Support two label types: **Capital Letters** (A, B, C…) or **Numbers** (1, 2, 3…) |
| F3 | User selects the **number of distinct targets** (e.g., 3 targets → labels A, B, C) |
| F4 | User selects the **total engagements** — how many shots appear in the sequence; minimum value is equal to the distinct target count (so every target can appear at least once) |
| F5 | Every distinct target label must appear **at least once** in the sequence |
| F5b | If `total engagements = distinct targets`, the sequence is a pure random permutation — each label appears exactly once |
| F5c | If `total engagements > distinct targets`, the extra shots are distributed randomly across labels; the same label may appear multiple times beyond its guaranteed single appearance |

### 2.2 Start Signal

| # | Requirement |
|---|-------------|
| F6 | A **Start** button initiates the drill with a random delay of **4–5 seconds**, then emits an audible start signal |
| F7 | The delay is randomized on each press (uniform random within the 4–5 s window) to prevent anticipation |
| F8 | The start signal mimics a shooting timer beep: a short, sharp, high-pitched tone generated via the Web Audio API (no audio file dependency) |
| F9 | While waiting for the beep, the UI indicates the drill is in progress (e.g., button disabled or shows "Ready…") |
| F10 | The Start button is large and easy to tap with one hand |

### 2.3 Regeneration

| # | Requirement |
|---|-------------|
| F11 | A single, prominent action (button or gesture) regenerates a new random sequence instantly |
| F12 | Regeneration requires no page reload or navigation |

### 2.4 Configuration

| # | Requirement |
|---|-------------|
| F13 | Label type selector: Letters or Numbers |
| F14 | Distinct target count input (minimum 2, reasonable maximum e.g. 26 for letters, 99 for numbers) |
| F15 | Total engagements input — minimum value enforced to equal the current distinct target count |
| F16 | Configuration persists within the session so the user can regenerate without re-entering values |

---

## 3. UI / UX Requirements

### 3.1 Layout

| # | Requirement |
|---|-------------|
| U1 | Optimized for **portrait orientation on a smartphone** |
| U2 | Sequence is displayed in a large, highly legible font suitable for quick scanning |
| U3 | Configuration controls grouped separately from the sequence display |
| U4 | Regenerate action is always visible without scrolling |
| U5 | Start button visually distinct from the Regenerate button (different color/size) |

### 3.2 Usability

| # | Requirement |
|---|-------------|
| U6 | Minimal taps to reach a new sequence from a fresh session |
| U7 | No account, login, or network request required to use core functionality |

---

## 4. Technical Requirements

| # | Requirement |
|---|-------------|
| T1 | Implemented as a client-side web app (HTML/CSS/JS) — no backend needed |
| T2 | Works offline after initial load |
| T3 | Responsive layout using viewport units or flexbox/grid |
| T4 | No external runtime dependencies required (vanilla JS acceptable) |
| T5 | Start signal generated via **Web Audio API** (`AudioContext`) — no audio files, no network requests |

---

## 5. Out of Scope (v1)

- Audio/voice readout of sequences
- Visible countdown timer during the pre-beep delay
- Score tracking or history
- Multi-user or cloud sync
- Landscape orientation optimization
