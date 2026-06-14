# Vallum Engine Release Guide

Vallum Engine is managed as a formal product. Each release must update the app, project state, changelog, and product map when the roadmap changes.

## Current deployment

The app deploys from the main branch root through GitHub Pages.

Live path:

https://theunquietrealms.github.io/vallum-engine/

The current release line is static. There is no build step, package manager, backend, database, or external asset dependency.

## Pre-release check

Before considering a release complete, confirm that the site loads, the campaign starts, choices resolve, dice outcomes display, party health renders, local save works after refresh, ambience starts and stops, and documentation reflects the current state.

## Version line

v0.1 — first playable static vertical slice. ✅ Delivered.

v0.2 — product UX and documentation baseline. ✅ Delivered.

v0.3.x — Stormwright module one (Act I), engine hardening, UAT matrix. ✅ Delivered.

v0.4 — tabletop entry, AI GM engine, API key flow. ✅ Delivered.

v0.5 — VTT board foundation: parchment map, Kael token, three-zone layout. ✅ Delivered.

v0.6 — board consequence, per-act map switching, AI GM NPC voices. ✅ Delivered.

v0.7 — Module One complete: 24 scenes, 7 acts, full 8-hour adventure. ✅ Delivered.

v0.8 — persistence and resume hardening (localStorage, mobile, save/continue). 🔄 In progress.

v0.9 — MVP UAT candidate: full founder live test, mobile sign-off. ⬜ Upcoming.

v1.0 — MVP release: one complete Unquiet Marches session, publicly playable. ⬜ Upcoming.

## Product roles

Phil is founder, worldbuilder, creative director, and final decision-maker.

Claude Code operates as product manager, game designer, UX lead, technical architect, release manager, and implementation lead.
