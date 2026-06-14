# Vallum Engine Project State

## Current status

Vallum Engine is live as a GitHub Pages static app.

Live path:

https://theunquietrealms.github.io/vallum-engine/

Current release posture: **v0.3.4 release candidate — static verification passed; founder live UAT remains required for visual load, comprehension and the series' tone.**

The v0.3.x line restored the full runtime, formalised the module loop, removed pre-choice moral deltas, decoupled moral state from dice bonuses, added session complete and introduced UX identity improvements.

## Naming (2026-06-14)

The world line previously labelled "The Stormwright Cycle" is renamed **The Unquiet Marches** to match the finished manuscript (*The Noise of Purpose*, Book One). "Stormwright" appears nowhere in the manuscript and is retired as the world/series name; the far-future mythology that used it (the Aethers, the Turning, the Ven Codex, the Stormwright pattern) is moved to the private content repo as not-yet-canon. Dated release-history entries below keep their original names. The internal CSS theme class `.stormwright-theme` is unchanged for now (cosmetic only).

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
- world landing and module loading;
- Game Master narration;
- bounded decision cards;
- hidden d20 resolution;
- post-choice consequence display;
- moral state: Force, Restraint, Witness, Hollow and Reputation;
- objective and field state;
- Kael character panel and drawer;
- Account/journal;
- local save, continue and new session;
- ambience;
- session-complete overlay;
- final moral portrait and forward hook;
- internal UAT and release signoff standards;
- favicon and series palette.

The current board remains a symbolic coded map. It proves state and movement but does not yet meet the accepted tabletop immersion target.

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

### v0.4 — Tabletop Entry and Orientation

Required outcome:

- landing page introduces the world of The Unquiet Marches and Kael clearly;
- transition explicitly brings the player to the table;
- Game Master, board and character positions are staged coherently;
- first-time player understands identity, place, pressure and role before the first choice;
- no new mechanical expansion beyond what supports the opening experience;
- release passes internal UAT and founder live signoff.

### Subsequent releases

- v0.5 — VTT Board Foundation;
- v0.6 — Board Consequence;
- v0.7 — Module One Completion;
- v0.8 — Persistence and Resume hardening;
- v0.9 — MVP UAT candidate;
- v1.0 — MVP release;
- v2.0 — Minimum Lovable Product three-module arc.

See `docs/PRODUCT_ROADMAP_MVP_MLP.md` for the complete release sequence.

## Current decisions required

- complete the full design workshop;
- approve landing-page world depth and copy;
- approve sit-down transition storyboard;
- approve the first VTT board specification;
- approve Kael token design;
- expand Module One to the standard loop depth;
- reconcile implementation tags and release documentation before the next public claim;
- define state-gate behaviour and future companion architecture.

## Deployment

The product deploys from the `main` branch root through GitHub Pages.

Current architecture remains plain HTML, CSS and JavaScript with local browser persistence and no backend, database, login or multiplayer service.

## Product control rule

Every future release must update `CHANGELOG.md`, `PROJECT_STATE.md` and affected roadmap or guide documents. A release is not final until internal UAT and founder live signoff are complete.
