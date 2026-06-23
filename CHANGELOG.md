# Changelog

> Note: v0.4 and v0.5 (book-cover entry, VTT board surface, original-player-character
> pivot, the Surge mechanic) shipped to `main` without dedicated changelog entries.
> History was reconciled in PROJECT_STATE.md on 2026-06-23. Entries resume below at v0.6.0.

## v0.6.0 - State-gated consequence

Status: committed on main.

Added:

- `evaluateGate(requires)` in app.js — data-driven choice gating. A choice may carry a `requires` object evaluated against current state; prior moral state, Surge, objectives, party HP, or scenes seen can lock an option. Schema documented inline above the function.
- locked choices render visibly disabled (`.storm-choice.is-locked`) with their reason shown beneath the label (`.choice-lock`), rather than being hidden — the player feels the road narrowing.
- defensive guard in `choose()` — a locked choice can never execute even if invoked programmatically.
- live gate on `reshen-ashes` → `surveyor_post`: "Out-argue him…" now requires Witness ≥ 4 and names copied ≥ 2, with an authored reason. A brute-played character can no longer corner the surveyor on the record.
- `.choice-lock` / `.storm-choice.is-locked` styling in ux.css.

Changed:

- `renderChoices()` evaluates each choice's gate and skips the click handler when locked.
- save key bumped to `vallum.engine.session.reshen-ashes.v0.6.0`.

Authoring contract:

- gating is fully data-driven — new gates need no engine change, only a `requires` block on a choice in campaign JSON.
- each leaf condition is `{ min?, max? }` or a bare number (treated as `min`); all conditions are ANDed.
- authors should supply `requires.reason` for player-facing flavour; without it a generic "Locked — needs X" is shown.

Verified:

- 11/11 headless gate-logic tests pass (no-requires, qualified/brute/threshold players, min/max, surge, hp, scenesSeen).
- `node --check` clean on app.js and gm-engine.js; all three campaign JSON files parse.

Known constraints:

- founder live UAT (visual load, comprehension, tone) remains the release gate — not yet run.
- generic auto-reason text is lowercased (`needs hollow 6 or less`); the live gate uses an authored reason, so players don't see the generic form.

## v0.3.4 - Loop definition and session complete

Status: committed on main.

Added:

- `docs/LOOP.md` — formal Vallum module loop definition (Establish → Decide → Peak → Land → Close)
- session complete screen (`#sessionComplete`) — full-page overlay rendered when `state.sessionComplete === true`
- `renderSessionComplete()` in app.js — populates complete screen with account, portrait, hook, restart button
- `buildPortraitLines()` — generates narrative sentence per moral state dimension at session end
- `buildForwardHook()` — builds a conditional forward hook based on final Hollow, Reputation, Restraint, and Civilians state
- `completeRestartBtn` wired in `wireControls()` and `startNewSession()` hides the session complete screen on restart
- `outcomeText.scrollIntoView()` in `choose()` — consequence scrolls into view immediately after each decision

Changed:

- `render()` now checks `state.sessionComplete` first — if true, routes to `renderSessionComplete()` and returns; aftermath no longer self-loops visually
- `startNewSession()` hides `#sessionComplete` before calling `closeCover()`
- `dom` object extended with `sessionComplete`, `completeTitle`, `completeEyebrow`, `completeJournal`, `completePortrait`, `completeHook`, `completeRestartBtn`

Session complete screen content:

- full journal (all entries, not capped at 6)
- moral portrait: one narrative sentence per state dimension (Force, Restraint, Witness, Hollow, Reputation, The Field)
- forward hook text: conditional on final moral state — different hook for high-Hollow, high-Reputation/low-Restraint, civilian-focused, or default
- restart button returns player to play table (skips cover screen)

Known constraints:

- terminal choice detection still requires `"result": "The module ends..."` in campaign JSON — unchanged from v0.3.3
- session complete screen is full-page overlay; play table remains underneath but is not accessible during it
- forward hook references Module 2 locations and situations that do not yet exist as playable content

## v0.3.4 - UX clarity, palette, buttons, and favicon pass

Status: committed on main.

Added:

- `assets/favicon.svg` — original shield sigil (V mark, gold on void), SVG format
- `<meta name="theme-color" content="#06080A">` in index.html
- `<link rel="icon">` pointing to favicon in index.html

Changed — palette:

- formalised Stormwright token set: `--void`, `--iron`, `--ash`, `--parchment`, `--ink`, `--candle`, `--blood`, `--storm`, `--moss`, `--hollow`
- all existing aliases (`--bg`, `--panel`, `--text`, `--muted`, `--gold`, `--red`, `--green`, `--blue`) preserved via `var()` references — no app.js or engine breakage

Changed — buttons and choices:

- `button:focus-visible` focus ring added globally for accessibility
- `.primary` button: stronger gradient, heavier border, padded and weighted for cover screen
- `.storm-choice` redesigned as decision card: left accent rail (3px `border-left`), subtle background, `translateX` hover shift, gold rail on hover/focus
- `renderChoices()` now emits `<span class="choice-number">` and `<span class="choice-title">` separately for independent styling
- choice number rendered muted gold; choice label remains parchment

Changed — map frame:

- `.storm-map-frame` given stronger inner shadow (140px), outer glow, darker background, explicit border and border-radius

Changed — outcome panel:

- `.outcome-grid` uses `repeat(auto-fit, minmax(220px, 1fr))` — no empty third column when only two items render
- `.report-grid` uses `repeat(auto-fit, minmax(160px, 1fr))`
- outcome panel has left accent rail (3px border-left) matching decision card language

Changed — Kael state panel:

- `state-line em` (descriptor label, e.g. "ready") is now visually prominent: gold tint, font-weight 600, uppercase
- `state-line strong` (numeric value) demoted to secondary: muted opacity, lighter weight
- objective state lines use storm blue for descriptor, candle for number — distinct from moral state

Changed — header:

- `.status-chip` visual weight reduced: smaller padding, lower opacity border, dimmer background
- `.compact-control` quieter by default, colour brightens on hover

Known constraints:

- outcome panel scroll position unchanged — below-map location remains for v0.4 spatial review
- character drawer style updated but not repositioned
- responsive layout unchanged

## v0.3.3 - Engine reconnection and runtime stabilisation

Status: committed on main.

Fixed:

- defined missing `setStatus()` function — root cause of choice-click crash in app.js
- reconnected app.js to index.html (stable-play.js was emergency fallback; full engine now runs)
- rebuilt index.html DOM with all required element IDs for app.js
- linked styles.css and ux.css in index.html (were absent; engine-rendered classes had no styles)
- added `applyDelta` ceiling of 10 — prevents unbounded moral/objective state accumulation
- `continueBtn` now hidden when no save exists; shown when saved session detected
- removed "Interactive Recovery Build" and "Interactive recovery mode" player-facing labels
- moved `timeBox` to topbar as status chip
- added `title="Toggle Music"` tooltip to ambience button

Known constraints:

- requires live browser review after GitHub Pages refresh
- responsive layout falls back to one column under 1300px
- choice impact hints removed — state deltas no longer shown before selection; moral uncertainty preserved
- `statBonus()` decoupled from moralState — dice rolls are now pure d20; moral state affects narrative only

## v0.3.2 - Layout and engagement correction

Status: committed on main.

Added:

- proper Stormwright prologue landing page
- explicit player-role introduction for Kael Vorn
- three-zone play layout: Game Master left, map centre, Kael/account right
- scenario narration below the central map
- `What Changed` outcome panel below the map
- compact `M` music toggle
- `layout-fix.js` to keep the music control compact after interaction

Changed:

- replaced the previous two-column app layout with a centred play-table structure
- moved available actions into the left Game Master panel
- moved character state and account to the right panel
- hid raw dice log from normal play view
- reduced top controls to compact save, new session, music, and state indicators
- landing page now explains who Kael is and why the ridge matters before play begins

Known constraints:

- requires live browser review after GitHub Pages refresh
- responsive layout falls back to one column under smaller widths
- Kael panel language may still need tightening after playtest
- map remains symbolic pending a future battlefield readability pass

## v0.3.1 - Stormwright game-feel hardening

Status: committed on main.

Added:

- structured outcome display with Roll Result, Immediate Consequence, and State Change
- choice impact hints showing roll tests and state deltas before selection
- moral-state labels for Force, Restraint, Witness, Hollow, and Reputation
- objective labels for civilians, raider threat, and captain pressure
- battlefield zone overlays for ridge, civilians, and captain areas
- aftermath report on the aftermath scene
- session-complete flag for the module-ending choice
- v0.3.1 local save key with migration support from v0.3

Changed:

- latest outcome is now stored as structured state rather than plain text
- outcome panel now presents consequences as a readable game table
- account/journal flow now better supports the Stormwright theme of witness and consequence
- UX styling now supports outcome grids, aftermath grids, and state labels

Known constraints:

- requires live browser testing after GitHub Pages refresh
- aftermath report is generated from state thresholds and may need wording tuning
- battlefield remains symbolic rather than illustrated

## v0.3 - Stormwright playable module execution

Status: committed on main.

Added:

- first Stormwright campaign module: `data/campaigns/noise-of-purpose.json`
- module title: `The Noise of Purpose`
- Kael Vorn as primary playable character
- battlefield tableau map structure
- objective state for civilians, raider threat, and captain pressure
- Stormwright moral state: Force, Restraint, Witness, Hollow, Reputation
- Stormwright-specific roll support
- storm ambience mode
- Stormwright shell copy and cover screen
- sharper visual theme for the Stormwright module

Changed:

- runtime now loads the Stormwright module instead of the original sample campaign
- map rendering now supports battlefield markers and smoke texture
- party display now includes moral and objective state
- character drawer now surfaces Hollow and Reputation
- campaign framing changed from generic solo table to Stormwright table

Known constraints:

- module requires live browser testing after GitHub Pages refresh
- battlefield visuals are still symbolic rather than illustrated
- session-complete state is still handled as a scene choice, not a dedicated screen
- source-canon notes remain in documentation, not in runtime UI

## v0.2.1 - Stormwright canon alignment

Status: committed on main.

Added:

- accepted The Stormwright Cycle as the master world guide for Vallum's first original content line
- created `docs/world/STORMWRIGHT_CANON.md`
- created `docs/world/STORMWRIGHT_VALLUM_ADAPTATION.md`
- selected first real module target: `The Noise of Purpose`
- aligned product map to Stormwright mechanics and release direction
- updated project state with canon and v0.3 implementation requirements

Changed:

- v0.3 is no longer a generic first story module; it is now the first Stormwright adaptation module
- future mechanics now prioritise Force, Restraint, Witness, Hollow, and Reputation

## v0.2 - Product UX formalisation

Status: committed on main.

Added:

- campaign cover screen
- continue session and start session controls
- campaign title chrome
- save status chip
- ambience state chip
- latest outcome panel
- party-cluster token display
- clickable party members
- character sheet drawer
- active route highlighting
- v0.2 UX stylesheet layer
- product map documentation
- release guide documentation

Changed:

- moved runtime storage key to `vallum.engine.session.v0.2`
- retained migration path from v0.1 local save
- improved outcome handling so the latest choice result is visible outside the dice log
- corrected product documentation direction toward a formal release stream

Known constraints:

- still uses static HTML, CSS, and JavaScript by design
- no external audio files yet; ambience remains generated by Web Audio API
- no upload or AI module compiler yet

## v0.1 - First playable static vertical slice

Status: live.

Added:

- static GitHub Pages app shell
- sample campaign module: The Western Road
- top-down SVG map
- party token display
- GM narration panel
- bounded choices
- dice checks
- simple combat resolver
- party HP tracking
- journal tracking
- generated rain, wind, and dungeon ambience
- local browser save state
- proprietary project licence
