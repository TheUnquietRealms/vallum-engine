# Vallum Engine Project State

## Current status

Vallum Engine is live as a GitHub Pages static app.

Live path:

https://theunquietrealms.github.io/vallum-engine/

Current release posture: **v0.6.0 release candidate (state-gated consequence) — static verification passed; founder live UAT remains required for visual load, comprehension and the series' tone.**

Reconciled 2026-06-23 to match the shipped code. The earlier "v0.3.4" posture in this file was stale by several minor versions.

The live build is now a **deterministic, authored-prose tabletop engine** (no runtime AI). The browser-side Anthropic Game Master remains in `gm-engine.js` but is gated off behind `AI_ENABLED = false` in `app.js` — no API key is ever requested at runtime. The v0.4–v0.6 line added the book-cover entry, the VTT board surface with miniature tokens, the original-player-character pivot, the **Surge** mechanic (a spendable reserve of power: reach to push a failed roll or overdraw into Hollow; hold to accept the cost and refill), and state-gated choices.

## Naming (2026-06-14)

The world line previously labelled "The Stormwright Cycle" is renamed **The Unquiet Marches** to match the finished manuscript (*The Noise of Purpose*, Book One). "Stormwright" appears nowhere in the manuscript and is retired as the world/series name; the far-future mythology that used it (the Aethers, the Turning, the Ven Codex, the Stormwright pattern) is moved to the private content repo as not-yet-canon. Dated release-history entries below keep their original names. The internal CSS theme class is `.unquiet-theme`.

## Product direction

Vallum is now governed by the digital kitchen-table metaphor:

- the player enters the world of The Unquiet Marches before the first decision;
- the player is invited to sit down at a virtual table;
- a VTT board becomes the centre of play;
- the Game Master sits behind a screen and hides resolution machinery;
- Kael is represented by a dimensional tabletop token;
- character state and the Account sit beside the board;
- future AI companions create party presence;
- consequences alter board, character, Account and future possibility.

Canonical design documents:

- `docs/TABLETOP_EXPERIENCE_BLUEPRINT.md`;
- `docs/PRODUCT_ROADMAP_MVP_MLP.md`;
- `docs/DESIGN_WORKSHOP.md`;
- `docs/VTT_BOARD_AND_TOKEN_STANDARD.md`;
- `docs/LOOP.md`.

## Master world guide

The *The Unquiet Marches* manuscript (Book One: *The Noise of Purpose*) is the master canon source for Vallum's first original world line. It is held local-only in the private content repo, not in this public repo.

Canon and adaptation:

- `docs/world/UNQUIET_MARCHES_CANON.md`;
- `docs/world/UNQUIET_MARCHES_ADAPTATION.md`.

The first module is `The Noise of Purpose`, adapted from Book I Chapter 1: the ridge, burning caravan, civilians, raider captain, surge and aftermath.

## Current implementation

The repository currently provides:

- GitHub Pages static deployment;
- book-cover entry and "ride east" transition to the table;
- world landing and module loading (live module: **`reshen-ashes`**, original-player-character canon);
- deterministic Game Master narration from authored scene prose (runtime AI gated off);
- bounded decision cards with **state-gated choices** (prior moral/Surge/objective state can lock, unlock or reframe an option);
- hidden d20 resolution;
- the **Surge** mechanic — spend to push a failed roll, overdraw into Hollow, or hold to refill;
- post-choice consequence display;
- moral state: Force, Restraint, Witness, Hollow and Reputation;
- objective and field state;
- VTT board surface with miniature hero/companion tokens;
- multi-seat party rendering (`renderSeats`) — companion presence scaffolded;
- character panel and drawer;
- Account/journal;
- local save, continue and new session;
- ambience;
- session-complete overlay;
- final moral portrait and forward hook;
- internal UAT and release signoff standards;
- favicon and series palette.

Three campaign modules are on disk: `noise-of-purpose` (26 scenes, Book I full adaptation, single party), `reshen-ashes` (6 scenes, **live**, new original-PC canon) and `western-road` (5 scenes, 4-member party — companion/party testbed).

## Release history summary

### v0.1 — engine proof

Delivered static shell, sample campaign, SVG map, choices, dice, combat, HP, journal, ambience and local save.

### v0.2 — product UX baseline

Delivered campaign cover, continue/new flow, title chrome, outcome, route highlighting, clickable character sheet and product documentation.

### v0.2.1 — Stormwright canon alignment

Accepted the Stormwright Cycle as the first world authority and defined `The Noise of Purpose`.

### v0.3 — Stormwright module execution

Added Kael, battlefield tableau, objective state, moral state and Stormwright tone.

### v0.3.1 — game-feel hardening

Added structured consequence, state labels, battlefield zones and aftermath reporting.

### v0.3.2 — layout and engagement correction

Moved Game Master left, map centre, Kael/Account right, narration below board and raw dice behind the screen.

### v0.3.3 — engine reconnection

Resolved the runtime/DOM disconnect, defined missing `setStatus()`, restored the full engine, capped state and removed recovery labels.

### v0.3.4 — loop and identity candidate

Formalised `ESTABLISH → DECIDE → PEAK → LAND → CLOSE`, added session complete, full Account, moral portrait, conditional forward hook, palette, favicon and decision-card styling.

## Accepted system decisions

- pre-choice state deltas remain hidden;
- moral state does not provide direct dice bonuses;
- values are bounded between 0 and 10;
- state should later open, close or reframe narrative choices;
- Hollow is a cost, not a reward;
- AI remains outside unbounded runtime improvisation;
- critical UAT failures block feature work;
- live wiring and user-path evidence determine release truth.

## MVP

The MVP is one complete, stable Unquiet Marches tabletop session with:

- world landing;
- sit-down-at-the-table transition;
- VTT board and Kael token;
- Game Master information boundary;
- complete module loop;
- Account and session complete;
- save and continue;
- internal UAT and founder signoff.

## MLP

The MLP is a three-module Unquiet Marches arc with:

- cross-module state;
- meaningful irreversible consequence;
- multiple VTT boards;
- world response;
- at least two bounded AI companions;
- persistent party presence;
- repeatable story-to-module authoring.

## Next release

### v0.6 — State-Gated Consequence (this candidate)

Required outcome:

- prior moral state, Surge and objective state can lock, unlock or reframe a choice;
- locked choices are shown with their requirement, not hidden, so the player feels the road narrowing;
- gating is data-driven in campaign JSON (`requires` on a choice) — no engine change needed to author new gates;
- existing modules play unchanged when no `requires` is present;
- release passes internal UAT and founder live signoff.

### Subsequent releases (MVP → MLP, shipped via Sprints)

We work in **Epics and Sprints** for high-velocity release. UAT is run at Sprint boundaries (the end of a Sprint), not per-merge. Merges go directly to `main` and ship to production.

- **Epic A — Engine Foundations (Sprint 1)**
  - **A.1** v0.6.0 — State-Gated Consequence (shipped).
  - **A.2** v0.7.0 — Companion Foundation (party seats, token family, bounded companion interventions).
  - **A.3** v0.8.0 — World Memory (cross-module account, NPC acknowledgement, persistent obligations).
  - **A.4** v0.9.0 — Authoring Kit (story-to-module guide, board schema, validation, canon controls).
- **Epic B — Content & MLP (Sprint 2)**
  - **B.1** v1.0.0 — MVP Release (one complete, stable `reshen-ashes` session, full UAT).
  - **B.2** v1.1.0 — Module Two: *Reputation* (non-battlefield board, original canon).
  - **B.3** v1.2.0 — Module Three: *Recognition* (consequence convergence, original canon).
  - **B.4** v2.0.0 — MLP Release (three-module arc, full UAT, public launch).

See `docs/PRODUCT_ROADMAP_MVP_MLP.md` for the complete release sequence.

## Product control rule

Every release must update `CHANGELOG.md`, `PROJECT_STATE.md` and affected roadmap or guide documents. Releases ship to `main` and deploy to production. **UAT is executed at Sprint boundaries**, not per-merge, to maintain velocity. Critical bugs found in production revert immediately via hotfix.

## Deployment

The product deploys from the `main` branch root through GitHub Pages.

Current architecture remains plain HTML, CSS and JavaScript with local browser persistence and no backend, database, login or multiplayer service.

## Product control rule

Every future release must update `CHANGELOG.md`, `PROJECT_STATE.md` and affected roadmap or guide documents. Releases ship to `main` and deploy to production. **UAT is executed at Sprint boundaries**, not per-merge, to maintain velocity. Critical bugs found in production revert immediately via hotfix.
