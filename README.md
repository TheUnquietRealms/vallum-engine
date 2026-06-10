# Vallum Engine

Solo-first digital tabletop story engine for turning original worlds, characters and chapters into playable browser sessions.

Vallum is designed to recreate the emotional structure of sitting around a kitchen table: a central VTT board, a Game Master behind a screen, character tokens and sheets, hidden resolution, an in-world Account and consequences that persist.

Live app:

https://zencloudau.github.io/vallum-engine/

## Product intent

Vallum is an original tabletop engine for Phil's own worlds and stories. It is not a commercial-setting adaptation, a full 3D CRPG or an unrestricted generative chat experience.

The engine is separated from campaign content. Stories become modules. Boards, tokens, state and the Account make those modules playable.

The first canonical world line is The Stormwright Cycle. The first module is `The Noise of Purpose`, centred on Kael Vorn at the ridge above the burning caravan.

## Experience promise

A first-time player should:

1. understand the world and Kael before the first choice;
2. begin the journey and sit down at a virtual table;
3. see the board, Game Master and character position clearly;
4. choose under uncertainty rather than optimise visible moral deltas;
5. see consequences alter the board, character and Account;
6. complete the session with a final portrait and forward hook.

## Current release state

The current v0.3.x line has restored the full runtime, formalised the module loop and added a session-complete state. Static verification has passed; founder live UAT remains the release gate for visual load, comprehension and Stormwright tone.

Current capabilities include:

- Stormwright landing and campaign module;
- Game Master narration and bounded decision cards;
- hidden resolution with post-choice consequence;
- moral state: Force, Restraint, Witness, Hollow and Reputation;
- objective and field state;
- Kael character panel and drawer;
- Account/journal;
- save, continue and new session;
- session-complete overlay with final portrait and forward hook;
- ambience;
- internal UAT and release signoff standards.

The current symbolic board remains an engine proof. The next design phase introduces the table surface, VTT board contract and dimensional hero token.

## Tabletop design authority

- `docs/TABLETOP_EXPERIENCE_BLUEPRINT.md` — player experience and kitchen-table metaphor
- `docs/PRODUCT_ROADMAP_MVP_MLP.md` — MVP and MLP definition and release cycles
- `docs/DESIGN_WORKSHOP.md` — full design workshop plan and required decisions
- `docs/VTT_BOARD_AND_TOKEN_STANDARD.md` — reusable board, zone, overlay and token contract
- `docs/LOOP.md` — module structure: Establish → Decide → Peak → Land → Close
- `docs/world/STORMWRIGHT_CANON.md` — game-design canon extraction
- `docs/world/STORMWRIGHT_VALLUM_ADAPTATION.md` — adaptation boundary and first module

## MVP

The MVP is one complete and stable Stormwright tabletop session with:

- world landing;
- sit-down-at-the-table transition;
- VTT board and Kael token;
- Game Master information boundary;
- complete module loop;
- Account and session complete;
- save and continue;
- internal UAT and founder signoff.

## MLP

The Minimum Lovable Product is a three-module Stormwright arc with:

- cross-module state;
- meaningful irreversible consequence;
- multiple VTT boards;
- world response;
- at least two bounded AI-controlled companions;
- persistent party presence;
- a repeatable story-to-module authoring contract;
- a concrete reason to return.

See `docs/PRODUCT_ROADMAP_MVP_MLP.md` for release sequencing.

## Architecture

The current product uses plain HTML, CSS and JavaScript, deployed from the `main` branch through GitHub Pages.

There is currently no package manager, backend, database, login or multiplayer service. The next board and token layer should preserve the static hosting model and retain coded fallbacks.

Key files:

- `index.html` — application shell and landing
- `styles.css` and `ux.css` — design system and tabletop layout
- `app.js` — runtime engine, choices, state, ambience, save and session complete
- `gm-engine.js` — Game Master narration and decision logic
- `data/campaigns/noise-of-purpose.json` — first Stormwright module
- `PROJECT_STATE.md` — current delivery state
- `CHANGELOG.md` — release history
- `docs/UAT_GAME_TESTER_MATRIX.md` — internal acceptance tests
- `docs/RELEASE_SIGNOFF_STANDARD.md` — final release control

## Design rules

- The table is the product metaphor.
- The board is the centre of play.
- The Game Master hides machinery and reveals consequences.
- Moral state shapes narrative and future possibility, not direct dice advantage.
- Pre-choice state deltas remain hidden.
- AI belongs first in authoring and later in bounded companion behaviour, not unbounded runtime improvisation.
- A release is not final until internal UAT and founder live signoff pass.

---
© 2026 ZenCloud Global Consultants. All rights reserved. Proprietary and confidential.
