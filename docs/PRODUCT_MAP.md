# Vallum Engine Product Map

## Product definition

Vallum Engine is a solo tabletop story engine for turning original worlds, characters, campaign notes, and lore packs into playable browser sessions.

The first official world line is The Stormwright Cycle, using the uploaded series bible as the master canon source.

The product is not a clone of any commercial tabletop or video game property. It is an original engine with its own module format, runtime, presentation model, and release path.

## Product thesis

The engine should let a creator feed in a story world and then experience that world as a playable solo tabletop campaign: map, party, narration, choices, dice, consequences, character state, ambience, and saved progress.

For Stormwright, the playable experience must prioritise moral pressure, restraint, violence, reputation, witness, and consequence over generic fantasy progression.

## Current release line

### v0.1 — Playable static vertical slice

Purpose: prove the engine can run a bounded solo campaign session in the browser.

Delivered:

- static GitHub Pages deployment
- campaign module loading
- top-down SVG map
- party token display
- GM narration panel
- bounded choices
- dice checks
- simple combat resolution
- party HP state
- journal state
- generated ambience
- local save state

### v0.2 — Product UX formalisation

Purpose: make the prototype behave more like a formal game product and less like a technical demo.

Delivered:

- campaign cover screen
- continue session and start session entry points
- campaign title chrome
- visible save status
- visible ambience state
- latest outcome panel
- route highlighting for recent movement
- party-cluster map token
- clickable party members
- character sheet drawer
- product documentation baseline

### v0.2.1 — Stormwright canon alignment

Purpose: make The Stormwright Cycle the formal master world guide for Vallum's first original content line.

Delivered:

- Stormwright canon guide
- Stormwright-to-Vallum adaptation plan
- first real module target selected: The Noise of Purpose
- product roadmap aligned to Stormwright content

## Delivered releases

### v0.3.x — Stormwright module one: The Noise of Purpose (Act I) + engine hardening

Delivered:

- Stormwright source books ingested (Series Bible, Book I Complete, Book I Making of the Storm, Book II Weight of Still Water)
- First five scenes adapted from Chapter I: ridge, civilians, command, surge, aftermath
- Force, Restraint, Witness, Hollow, Reputation moral state engine
- Civilians, raider threat, captain pressure as field objectives
- Session complete screen with full account, moral portrait, and conditional forward hook
- Dice check system (d20 + stat bonus, success/failure narrative)
- Character sheet drawer
- UX audit pass: decision cards, state hierarchy, dice log, outcome scroll
- Static UAT matrix (UAT-001 through UAT-027) validated

### v0.4 — Tabletop Entry and Orientation

Delivered:

- Campaign cover screen with Kael character card and rules reference
- Continue Session / Begin on the Ridge entry points
- Save state with version-keyed localStorage
- AI GM engine (Claude Opus 4-8) with streaming SSE narration
- Open-scene prompt, choice-consequence prompt, free-form Ask GM input
- API key modal with offline fallback path

### v0.5 — VTT Board Foundation

Delivered:

- Parchment cartographic SVG map with terrain texture, road, river, forest, smoke, compass, scale bar
- Location nodes with cartographic icons by kind (ridge, fire, objective, threat, road)
- Dimensional tabletop tokens: party cluster, threat pieces, kind palette
- Token shadow, pulse ring, damage indicator
- Board-first three-zone layout (GM panel | board + scenario | Kael/account)

### v0.6 — Board Consequence + AI GM

Delivered:

- AI GM system prompt enriched with full NPC voice roster from Stormwright manuscripts (Caeden, Sera, Mael, Edric, Davan, Calla, Raider Captain)
- Core themes and writing style constraints in system prompt
- choicePrompt includes hollow severity, surge line, reshenCost, accountLines
- Per-act map switching: scene.locations override updates state.activeLocations; all subsequent scenes in act inherit

### v0.7 — Module One Completion: Full 8-hour adventure

Delivered:

- 24 scenes across 7 acts — complete Book I + early Book II Stormwright material
- Act II: Caeden commission, Reshen operation, Edric tells the truth
- Act III: Sera marches, hollow night, departure
- Act IV: Mael spotted at market, the alley, stepping back
- Act V: Davan encounter, road north, stone chamber found
- Act VI: Calla's petition, Edric returns with folio, Fen named
- Act VII: Caeden dead, village fire, bucket chain, chamber return, the account
- Each act-opener scene carries its own locations array for map context
- STORMWRIGHT_INGESTION.md canon reference committed to repo
- reshenCost and accountLines added to objective state

## Delivered releases (continued)

### v0.8 — Persistence and Resume ✅ Delivered (2026-06-10)

- localStorage.setItem wrapped in try-catch — prevents "Table interrupted" crash on iOS private mode or full storage
- gm-engine.js key/setKey/clearKey wrapped in try-catch — prevents uncaught throw on restricted storage
- escapeHtml() converted from String.replaceAll to .replace(/regex/g) — works on iOS Safari < 13.1 and Chrome < 85
- toggleAmbience() wrapped in try-catch — AudioContext failure no longer becomes unhandled rejection
- SVG filter removed from location nodes — halves GPU draw calls per render on mobile
- -webkit-backdrop-filter added to API modal — iOS Safari < 16 compat

Pending UAT (v0.8):

- founder live test: save → close tab → reopen → Continue Session
- founder live test on mobile (iOS Safari, Android Chrome)

### v0.9 — Narrative Quality + Story Book 🔄 In Progress (2026-06-10)

Completed:

- Full Act I rewrite: five scenes rewritten for narrative continuity, trap payoff in ridge choice 4, aftermath loop broken
- Four targeted prose fixes: reshen_road weight, Ser Crane → Torven name error, crossroads_davan split-speech, sera_hollow_night generic line
- Phase 1 lore fixes: ashen_standing path continuity (kill vs step-back), sera_marches time marker
- Story book feature: session complete 'Generate your story' button — Claude rewrites player's journal as 450–600 word prose chapter in Stormwright literary voice. Streams into serif panel. Copy and Download .txt.

Pending (v0.9):

- Founder full playthrough UAT (24 scenes to The Account)
- Founder live test on mobile iOS Safari and Android Chrome
- v1.1 scope flagged: hollow state-gated narration, decline path hollow source, Caeden texture, Act VII dice check review

## Release roadmap

### v0.9 — MVP UAT Candidate

Goal: full internal acceptance test pass before public MVP release.

Scope:

- founder live session on desktop and mobile
- UAT matrix updated with 8-hour adventure test cases
- accessibility and visual hierarchy review
- mobile layout verified on iOS Safari and Android Chrome
- all critical gates pass (UAT-001, -002, -004, -005, -009, -012, -013)

Success condition: Phil plays from the ridge to The Account and signs off.

### v1.0 — MVP Release

Goal: one complete Stormwright tabletop session, stable and publicly playable.

Success condition: a first-time player can sit at the table, play through The Noise of Purpose, and finish with a complete account of what Kael did and what it cost.

### v1.1+ — MLP Sequence

See PRODUCT_ROADMAP_MVP_MLP.md for the full MLP arc (state-gated consequence, Module Two, companion foundation, world memory, authoring kit).

## Product principles

The runtime engine must stay stable and deterministic.

AI belongs first in authoring, lore extraction, and module compilation, not in unbounded runtime improvisation.

The first playable path should always matter more than theoretical platform completeness.

Every release must update documentation, project state, and the changelog.
