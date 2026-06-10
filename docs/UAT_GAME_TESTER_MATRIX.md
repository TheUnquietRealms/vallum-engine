# Vallum Engine UAT and Game Tester Matrix

## Purpose

This matrix defines the internal acceptance gate before Phil gives final release signoff.

A release is not complete because code is committed. A release is complete only when it passes internal UAT, game-feel review, layout review, runtime stability checks, and founder signoff.

## Release signoff model

| Gate | Owner | Purpose | Required Before Release Signoff |
|---|---|---|---|
| Build Check | Implementation Lead | Confirm the deployed page loads and does not crash. | Yes |
| Runtime Check | Implementation Lead | Confirm buttons, state changes, scene transitions, and account updates work. | Yes |
| UX Check | UX Lead | Confirm layout hierarchy, readability, spacing, and visual load. | Yes |
| Game Design Check | Game Designer | Confirm the player understands role, situation, stakes, and consequence. | Yes |
| Lore Check | World Designer | Confirm Stormwright tone, character, and canon are not flattened into generic fantasy. | Yes |
| Founder UAT | Phil | Confirm the experience feels playable, comprehensible, and worth continuing. | Yes |

## Current UAT target

| Release | UAT Target | Status |
|---|---|---|
| v0.9 Story Book | Complete session. Click 'Generate your story'. Prose streams into panel. Copy and Download work. Output is literary, past-tense, Stormwright voice. | Pending founder live test |
| v0.9 Narrative Quality | Play Act I (ridge through aftermath). Prose feels connected, not standalone scenes. Captain watching/smiling. Trap revealed on breath choice. Aftermath routes to commission. | Pending founder read |
| v0.8 Mobile Stability | Load on iOS Safari and Android Chrome. Begin on the Ridge. Make 3 choices. No crash. localStorage errors silently handled. | Pending founder mobile test |
| v0.8 Save / Resume | Play 5+ scenes. Save. Close tab. Reopen. Continue Session resumes correctly. State intact. | Pending founder live test |
| v0.7 Full Adventure Loop | Play from ridge through The Account (24 scenes). Session complete screen renders with full journal. | Pending founder live playthrough |
| v0.7 AI GM | Open scene narration fires. Choice narration streams. Ask GM responds. GM offline falls back cleanly. | Pending founder live test |
| v0.3.4 (UX) | Favicon visible. Decision cards distinct. State hierarchy readable. | Closed — static pass |
| v0.3.4 Loop and Session Complete | Superseded by v0.7 full adventure. | Closed |

## Internal UAT matrix

| Test ID | Area | Test Scenario | Expected Result | Pass / Fail | Notes |
|---|---|---|---|---|---|
| UAT-001 | Load | Open the live GitHub Pages site. | Landing page loads without blank screen or crash. | Static PASS — server returns 200, HTML valid | Hard refresh required on GitHub Pages after push. |
| UAT-002 | Landing | Click Begin on the Ridge. | Landing closes or table becomes playable without crash. | Static PASS — startBtn present, closeCover() wired | Requires founder live test to confirm no browser error. |
| UAT-003 | Layout | Review desktop layout. | Game Master is left, map is central, Kael/account is right, scenario and outcome are below map. | Static PASS — 3-zone play-layout grid confirmed in HTML | Must be reviewed on large screen. |
| UAT-004 | Choice Interaction | Click each available action from the first scene in separate test runs. | Action is clickable and updates the story state. | Static PASS — renderChoices() builds buttons with listeners; setStatus() defined; no ReferenceError path | Requires founder live click test. |
| UAT-005 | Scene Transition | Choose a path to civilians, command, surge, and aftermath. | Scene title, situation, scenario, choices, and token position update. | Static PASS — scene graph fully connected; all 5 scenes verified | Requires founder live test across all paths. |
| UAT-006 | Kael State | Trigger choices that change Force, Restraint, Witness, Hollow, or Reputation. | Right panel updates with changed state labels. | Static PASS — renderCharacterPanel() reads moralState and renders label functions | Requires founder live test. |
| UAT-007 | Field State | Trigger choices that change civilians, raider threat, or captain pressure. | Field state changes are reflected in the right panel or outcome text. | Static PASS — applyDelta wired to objectives; capped 0–10 | Requires founder live test. |
| UAT-008 | Account | Make two or more choices. | The Account records recent consequences in reverse chronological order. | Static PASS — renderJournal() renders last 6 entries reversed | Requires founder live test. |
| UAT-009 | Outcome | Make a choice. | What Changed updates with the immediate consequence and state change. | Static PASS — renderOutcome() reads latestOutcome; setStatus() no longer crashes | Requires founder live test. |
| UAT-010 | Map | Make choices that move Kael. | Kael token moves to the relevant battlefield location. | Static PASS — renderKaelToken() reads scene.location; all locations defined | Requires founder live test. |
| UAT-011 | Restart | Click New or reload the page. | User can return to a clean starting state or reload without crash. | Static PASS — startNewSession() clears STORAGE_KEY and re-initialises | Requires founder live test. |
| UAT-012 | Visual Load | Review full screen at normal distance. | Player can immediately identify map, action choices, Kael, and outcome without overload. | Pending founder review | Cannot verify statically. Requires large screen review. |
| UAT-013 | Comprehension | Read landing and first table screen. | Player understands who Kael is, where he is, what is happening, and what the decision pressure is. | Pending founder review | Cannot verify statically. Requires first-read test. |
| UAT-014 | Stormwright Tone | Review copy and outcome language. | Tone feels restrained, severe, moral, and Stormwright-specific. | Pending founder review | Cannot verify statically. Requires world designer read. |
| UAT-015 | Regression | Confirm no external runtime crash path remains. | Page continues to function after refresh and action click. | Static PASS — setStatus() defined; all DOM IDs present; no uncaught reference paths in choose() | Requires founder live regression run. |
| UAT-016 | Favicon | Open site in browser tab. | Favicon appears as a small gold shield sigil in the browser tab. | Pending founder live test | SVG favicon; may not display in older browsers — acceptable. |
| UAT-017 | Button Hierarchy | Review landing and play table buttons. | Primary button (Begin / Continue) is visually distinct from utility buttons (Save, New, M). | Static PASS — `.primary` has stronger gradient, border, weight vs `.compact-control` | Requires founder visual review. |
| UAT-018 | Decision Cards | Review available action buttons in GM panel. | Choice buttons feel like decisions, not navigation links. Left gold rail visible. Number muted. Label prominent. | Static PASS — border-left rail, muted number span, parchment title span | Requires founder visual and interaction review. |
| UAT-019 | State Hierarchy | Review Kael panel state lines. | Descriptor label (e.g. "READY") reads before the number. Number is secondary. | Static PASS — em is gold weight-600; strong is muted 0.45 opacity | Requires founder visual review. |
| UAT-020 | Outcome Grid | Make a choice and review What Changed. | Two outcome cells render cleanly without obvious empty third column. | Static PASS — auto-fit minmax(220px, 1fr) confirmed | Requires founder live test. |
| UAT-021 | Outcome Scroll | Make a choice. | What Changed panel scrolls into view automatically. | Static PASS — scrollIntoView(smooth) in choose() | Requires founder live test. |
| UAT-022 | Session Complete Trigger | Select "End the session at the edge of the hollow" in aftermath. | Session complete screen appears. Play table is replaced by full-screen overlay. | Static PASS — render() routes on sessionComplete flag | Requires founder live test. |
| UAT-023 | Session Complete Account | View session complete screen. | All journal entries render in full (not capped at 6). | Static PASS — full state.journal rendered | Requires founder live test. |
| UAT-024 | Session Complete Portrait | View session complete screen. | Narrative portrait sentence appears per state dimension (Force, Restraint, Witness, Hollow, Reputation, The Field). | Static PASS — buildPortraitLines() verified | Requires founder live test. |
| UAT-025 | Forward Hook Conditional | Complete two sessions with different moral paths. | Forward hook text differs based on final Hollow vs Reputation vs Civilian state. | Static PASS — three conditional branches in buildForwardHook() | Requires founder two-run comparison. |
| UAT-026 | Session Restart | Click restart on session complete screen. | Returns to play table in new session. Cover screen does not appear. State is fresh. | Static PASS — completeRestartBtn calls startNewSession() which hides sessionComplete | Requires founder live test. |
| UAT-027 | Aftermath No Self-Loop | After selecting any non-terminal aftermath choice, confirm loop. | Aftermath scene re-renders with choices visible. Terminal choice still available. | Static PASS — render() only redirects on sessionComplete flag, not on currentScene | Requires founder live test. |
| UAT-028 | Act Transition | Complete aftermath. Confirm scene advances to caeden_summons. | New act opens. Scene title, narration, choices update. Map switches to Act II locations. | Static PASS — aftermath choice 4 nextScene: caeden_summons verified | Requires founder live test. |
| UAT-029 | Per-Act Map | Advance to each act-opener scene (caeden_summons, sera_marches, ashen_crossing_market, crossroads_davan, calla_petition, caeden_dead). | Map updates to show act-specific locations. Token moves to scene.location in new act. | Static PASS — all 6 act-openers have locations arrays; renderMap reads state.activeLocations | Requires founder live test. |
| UAT-030 | Full Adventure Length | Play all 24 scenes to The Account. | Session complete screen renders. All 7 acts traversed. Journal contains entries from multiple acts. | Pending founder full playthrough | Critical path for v0.9 signoff. |
| UAT-031 | Mobile Load | Open site on iOS Safari and Android Chrome. Tap Begin on the Ridge. | Page loads. Cover screen visible. Tap works. No crash on first render. | Pending mobile test | localStorage and SVG filter fixes applied 2026-06-10. |
| UAT-032 | AI GM Scene Open | Enter API key. Begin session. | GM opens the ridge scene with narration within 5 seconds. Streaming text appears. | Pending founder live test | Requires valid Anthropic API key. |
| UAT-033 | AI GM Ask | Type a question in Ask box. Press Ask or Enter. | GM responds in character within 10 seconds. Response is under 200 words. | Pending founder live test | |
| UAT-034 | Story Book — Generate | Complete session. Click 'Generate your story'. | Prose streams into panel. 3–4 paragraphs. Third person, past tense. Stormwright voice. No generic fantasy language. | Pending founder live test | Requires valid Anthropic API key. |
| UAT-035 | Story Book — Export | Story generated. Click Copy then Download. | Clipboard receives plain text. .txt file downloads as kael-vorn-YYYY-MM-DD.txt. | Pending founder live test | |

## Game tester matrix

| Tester Role | Lens | What They Are Testing | Acceptance Signal |
|---|---|---|---|
| Player Tester | First-time comprehension | Can I understand what is happening without explanation? | Can explain Kael, the ridge, the civilians, and the captain after one minute. |
| UX Tester | Layout and cognitive load | Is the screen readable and comfortable? | No confusion about where to look or what to press. |
| Game Designer | Loop quality | Does the loop feel like a game rather than a page? | Choice creates consequence, consequence changes state, state affects the account. |
| World Designer | Stormwright fidelity | Does the scene preserve Kael's tone and moral pressure? | No generic fantasy drift. |
| Technical Tester | Runtime stability | Does the page crash, freeze, or fail to respond? | No crash during start, action selection, scene transition, or reload. |
| Founder Tester | Product instinct | Is this worth continuing? | Phil wants to play one more scene. |

## Release decision matrix

| Result | Meaning | Action |
|---|---|---|
| All critical tests pass | Release candidate is stable enough for founder signoff. | Present signoff matrix to Phil. |
| One critical test fails | Release is not signoff-ready. | Patch only the failed gate. No new features. |
| Multiple critical tests fail | Runtime or layout is unstable. | Roll back to last known stable release and rebuild incrementally. |
| Game feel fails but runtime passes | Product works but does not engage. | UX/game-design tuning release. |
| Founder rejects | Release does not meet product intent. | Convert feedback into next release scope. |

## Critical tests

The critical tests are UAT-001, UAT-002, UAT-004, UAT-005, UAT-009, UAT-012, and UAT-013.

A release cannot be signed off if any critical test fails.

## Signoff rule

No future release should be presented as final until this matrix has been reviewed and the release-specific signoff table has been provided to Phil.
