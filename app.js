const CAMPAIGN_PATH = "data/campaigns/noise-of-purpose.json";
const STORAGE_KEY = "vallum.engine.session.noise-of-purpose.v0.3.2";

// ── Token visual identity ─────────────────────────────────────────

const ROLE_PALETTE = {
  "Iron Captain": { body: "#1a1c1e", rim: "#d8bd84", hi: "#eedfa0" },
  "Wardblade":    { body: "#0d1822", rim: "#4a8aab", hi: "#6aaacb" },
  "Ash Scholar":  { body: "#15101e", rim: "#8a7aae", hi: "#aa9ace" },
  "Road Warden":  { body: "#1a1408", rim: "#8a7050", hi: "#aa9070" },
  "Oath Singer":  { body: "#160c1c", rim: "#8a4aae", hi: "#aa6ace" }
};

const KIND_PALETTE = {
  threat:     { body: "#2a0a0a", rim: "#8b2a2a", hi: "#b34a4a", r: 20 },
  fire:       { body: "#2a1000", rim: "#b35b4f", hi: "#c37b6f", r: 14 },
  objective:  { body: "#0a1820", rim: "#5a8fae", hi: "#7aafce", r: 14 },
  settlement: { body: "#1a1a12", rim: "#9a9a70", hi: "#baba90", r: 16 },
  dungeon:    { body: "#0a0a16", rim: "#6a6a9a", hi: "#8a8aba", r: 16 },
  site:       { body: "#101a10", rim: "#6a9a6a", hi: "#8aba8a", r: 14 }
};

const $ = (id) => document.getElementById(id);

const dom = {
  campaignCover: $("campaignCover"),
  continueBtn: $("continueBtn"),
  startBtn: $("startBtn"),
  coverStatus: $("coverStatus"),
  campaignTitle: $("campaignTitle"),
  saveStatus: $("saveStatus"),
  ambienceState: $("ambienceState"),
  regionTitle: $("regionTitle"),
  timeBox: $("timeBox"),
  routeLayer: $("routeLayer"),
  locationLayer: $("locationLayer"),
  tokenLayer: $("tokenLayer"),
  sceneMood: $("sceneMood"),
  diceLog: $("diceLog"),
  sceneTitle: $("sceneTitle"),
  sceneType: $("sceneType"),
  narration: $("narration"),
  outcomeText: $("outcomeText"),
  choiceList: $("choiceList"),
  partyList: $("partyList"),
  journalList: $("journalList"),
  newGameBtn: $("newGameBtn"),
  saveBtn: $("saveBtn"),
  ambienceBtn: $("ambienceBtn"),
  characterDrawer: $("characterDrawer"),
  closeDrawerBtn: $("closeDrawerBtn"),
  drawerName: $("drawerName"),
  drawerRole: $("drawerRole"),
  drawerStats: $("drawerStats"),
  drawerDrive: $("drawerDrive"),
  sessionComplete: $("sessionComplete"),
  completeTitle: $("completeTitle"),
  completeEyebrow: $("completeEyebrow"),
  completeJournal: $("completeJournal"),
  completePortrait: $("completePortrait"),
  completeHook: $("completeHook"),
  completeRestartBtn: $("completeRestartBtn"),
  storyGenBtn: $("storyGenBtn"),
  storyPanel: $("storyPanel"),
  storyOutput: $("storyOutput"),
  storyControls: $("storyControls"),
  storyCopyBtn: $("storyCopyBtn"),
  storyDownloadBtn: $("storyDownloadBtn"),
  // Intro sequence
  introEnterBtn: $("introEnterBtn"),
  introBeat1: $("introBeat1"),
  introBeat2: $("introBeat2"),
  introBeat3: $("introBeat3"),
  introBeat4: $("introBeat4"),
  introBeat5: $("introBeat5"),
  introStream1: $("introStream1"),
  introStream2: $("introStream2"),
  introSkip1: $("introSkip1"),
  introSkip2: $("introSkip2"),
  introCont1: $("introCont1"),
  introCont2: $("introCont2"),
  introCont3: $("introCont3"),
  // AI GM
  gmResponse: $("gmResponse"),
  gmResponsePanel: $("gmResponsePanel"),
  gmAskInput: $("gmAskInput"),
  gmAskBtn: $("gmAskBtn"),
  aiStatus: $("aiStatus"),
  apiModal: $("apiModal"),
  apiKeyInput: $("apiKeyInput"),
  apiSaveBtn: $("apiSaveBtn"),
  apiSkipBtn: $("apiSkipBtn"),
  apiClearBtn: $("apiClearBtn")
};

let campaign = null;
let state = null;
let audio = { ctx: null, master: null, nodes: [], enabled: false, currentMood: null };
let currentTypewriter = null;

const FOREWORD_TEXT = [
  "What follows is not a chronicle in the conventional sense.",
  "The man who came to be called the Iron Captain left behind no formal record of himself. He held no title that persisted. He served no lord long enough to warrant mention in their accounts. When he finally withdrew from the world of campaigns and commissions, he did so with the practiced completeness of a man who had decided to become difficult to find.",
  "What we have instead are fragments.",
  "A garrison log entry from the eastern marches. A cartographer's private correspondence, never sent. An alley in a border village where, according to a tanner who claimed to have been present, a man let another man walk away when no one would have known the difference.",
  "And then — from much later — a bundle of parchments discovered in the ruins of a small stone fortification in the northern hills. Written in a hand that suggests both formal education and long disuse of it. He wrote plainly, without the instinct to justify. He did not write to be absolved.",
  "He wrote, it seems, to understand.",
  "Any soldier of sufficient skill can be the storm. To sit in a stone chamber and watch one pass — to feel nothing in yourself that answers it — requires a different order of discipline entirely."
].join("\n\n");

const PROLOGUE_TEXT = [
  "The storm had been building since dusk.",
  "From the narrow window of his stone chamber, the valley lay stretched beneath a sky the colour of bruised iron. Lightning stitched briefly across the horizon — too distant yet for thunder — illuminating the road that cut through the fields below.",
  "There had been a time when a sky like this would have stirred him to motion. He had ridden beneath storms with steel in hand and men at his back, rain blinding and thunder shaking the earth. He had mistaken that noise for purpose. Mistaken the charge of blood for clarity.",
  "He stood at the window and watched the storm gather.",
  "The sword rested against the far wall, sheathed, maintained, within reach. He had not cast it away. To discard a blade was easy. To keep it and not draw it required something else.",
  "“There is always a storm,” he said quietly.",
  "Not in challenge. Not in warning.",
  "Only in recognition.",
  "This is the account of how he learned the difference."
].join("\n\n");

wireControls();
boot();

async function boot() {
  try {
    campaign = await loadCampaign();
    state = loadState() || createInitialState(campaign);
    document.body.classList.add("cover-open", "stormwright-theme");
    setText(dom.campaignTitle, campaign.title);
    const hasSave = !!localStorage.getItem(STORAGE_KEY);
    setText(dom.coverStatus, hasSave ? "A saved session was found on this browser." : "");
    if (dom.continueBtn) dom.continueBtn.hidden = !hasSave;
    render();
  } catch (error) {
    showFatalError(error);
  }
}

async function loadCampaign() {
  const response = await fetch(CAMPAIGN_PATH, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load Stormwright campaign module.");
  return response.json();
}

function createInitialState(module) {
  const initialState = {
    campaignId: module.id,
    currentScene: module.startingScene,
    previousScene: null,
    time: { ...(module.initialTime || { day: 1, phase: "Stormlight" }) },
    party: (module.party || []).map((member) => ({ ...member })),
    objectives: { ...(module.objectives || {}) },
    moralState: { ...(module.moralState || {}) },
    journal: [`Campaign started: ${module.title}.`],
    latestOutcome: {
      consequence: "No choices resolved yet.",
      stateChange: "The account is empty."
    },
    completedChoices: [],
    sessionComplete: false,
    activeLocations: null,
    activeRoutes: null
  };
  console.log("Initialized game state:", initialState);
  return initialState;
}

function typewriter(el, text, onDone) {
  el.innerHTML = '';
  let i = 0;
  let buf = '';
  const flush = () => {
    el.innerHTML = '<p>' + buf.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
    el.scrollTop = el.scrollHeight;
  };
  const id = setInterval(() => {
    buf += text.slice(i, i + 3);
    i = Math.min(i + 3, text.length);
    flush();
    if (i >= text.length) {
      clearInterval(id);
      if (onDone) onDone();
    }
  }, 18);
  return () => { clearInterval(id); buf = text; flush(); if (onDone) onDone(); };
}

function showIntroBeat(n) {
  if (currentTypewriter) { currentTypewriter(); currentTypewriter = null; }
  for (let i = 1; i <= 5; i++) {
    const beat = dom[`introBeat${i}`];
    if (beat) beat.hidden = (i !== n);
  }
  if (n === 2 && dom.introStream1) {
    currentTypewriter = typewriter(dom.introStream1, FOREWORD_TEXT, () => {
      currentTypewriter = null;
      if (dom.introCont1) dom.introCont1.hidden = false;
      if (dom.introSkip1) dom.introSkip1.hidden = true;
    });
  }
  if (n === 3 && dom.introStream2) {
    currentTypewriter = typewriter(dom.introStream2, PROLOGUE_TEXT, () => {
      currentTypewriter = null;
      if (dom.introCont2) dom.introCont2.hidden = false;
      if (dom.introSkip2) dom.introSkip2.hidden = true;
    });
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.campaignId !== campaign.id) return null;
    return normaliseState(parsed);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function normaliseState(candidate) {
  const base = createInitialState(campaign);
  return {
    ...base,
    ...candidate,
    time: { ...base.time, ...(candidate.time || {}) },
    objectives: { ...base.objectives, ...(candidate.objectives || {}) },
    moralState: { ...base.moralState, ...(candidate.moralState || {}) },
    latestOutcome: normaliseOutcome(candidate.latestOutcome)
  };
}

function normaliseOutcome(outcome) {
  if (!outcome) return { consequence: "No choices resolved yet.", stateChange: "The account is empty." };
  if (typeof outcome === "string") return { consequence: outcome, stateChange: "State already applied." };
  return {
    consequence: outcome.consequence || outcome.roll || "The choice is recorded.",
    stateChange: outcome.stateChange || "State already applied."
  };
}

function wireControls() {
  on(dom.continueBtn, "click", closeCover);
  on(dom.introEnterBtn, "click", () => showIntroBeat(2));
  on(dom.introSkip1, "click", () => { if (currentTypewriter) { currentTypewriter(); currentTypewriter = null; } });
  on(dom.introSkip2, "click", () => { if (currentTypewriter) { currentTypewriter(); currentTypewriter = null; } });
  on(dom.introCont1, "click", () => showIntroBeat(3));
  on(dom.introCont2, "click", () => showIntroBeat(4));
  on(dom.introCont3, "click", () => showIntroBeat(5));
  on(dom.startBtn, "click", startNewSession);
  on(dom.saveBtn, "click", saveState);
  on(dom.newGameBtn, "click", startNewSession);
  on(dom.ambienceBtn, "click", toggleAmbience);
  on(dom.closeDrawerBtn, "click", closeCharacterSheet);
  on(dom.completeRestartBtn, "click", startNewSession);
  on(dom.storyGenBtn, "click", generateStory);
  on(dom.storyCopyBtn, "click", copyStory);
  on(dom.storyDownloadBtn, "click", downloadStory);
  on(dom.characterDrawer, "click", (event) => {
    if (event.target === dom.characterDrawer) closeCharacterSheet();
  });
  // AI GM controls
  on(dom.gmAskBtn, "click", askGM);
  on(dom.gmAskInput, "keydown", (e) => { if (e.key === "Enter") askGM(); });
  on(dom.aiStatus, "click", showApiModal);
  on(dom.apiSaveBtn, "click", saveApiKey);
  on(dom.apiSkipBtn, "click", hideApiModal);
  on(dom.apiClearBtn, "click", () => { GM.clearKey(); renderAIStatus(); hideApiModal(); });
  on(dom.apiModal, "click", (e) => { if (e.target === dom.apiModal) hideApiModal(); });
  on(dom.apiKeyInput, "keydown", (e) => { if (e.key === "Enter") saveApiKey(); });
}

function closeCover() {
  if (!campaign) return;
  if (dom.campaignCover) dom.campaignCover.hidden = true;
  document.body.classList.remove("cover-open");
  render();
  renderAIStatus();
  if (!GM.hasKey()) {
    showApiModal();
  } else {
    // GM opens the scene — fires on enter, not after a choice
    gmOpenScene();
  }
}

async function gmOpenScene() {
  if (!GM.hasKey() || state.sessionComplete) return;
  const scene = getScene();
  showGMSpeaking();
  await GM.stream({
    userContent: GM.openScenePrompt(state, scene),
    onToken: appendGMToken,
    onDone: doneGMSpeaking,
    onError(err) { showGMError(err); doneGMSpeaking(); }
  });
}

function startNewSession() {
  if (!campaign) return;
  const hasSave = !!localStorage.getItem(STORAGE_KEY);
  if (hasSave && !confirm("Begin a new session? Your current progress will be lost.")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = createInitialState(campaign);
  if (dom.sessionComplete) dom.sessionComplete.hidden = true;
  if (dom.storyPanel) { dom.storyPanel.hidden = true; }
  if (dom.storyOutput) dom.storyOutput.textContent = "";
  if (dom.storyControls) dom.storyControls.hidden = true;
  if (dom.storyGenBtn) { dom.storyGenBtn.disabled = false; dom.storyGenBtn.textContent = "Generate your story"; }
  closeCover();
  setStatus("New session started.");
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  setStatus("Saved.");
}

function saveSilent() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function render() {
  try {
    if (state.sessionComplete) { renderSessionComplete(); return; }
    const scene = getScene();
    if (scene.locations) { state.activeLocations = scene.locations; state.activeRoutes = scene.routes || null; }
    setText(dom.regionTitle, `${campaign.region} · ${campaign.series || "Vallum"}`);
    setText(dom.timeBox, `Day ${state.time.day} · ${state.time.phase}`);
    setText(dom.sceneTitle, scene.title);
    setText(dom.sceneType, scene.type);
    setText(dom.sceneMood, scene.stakes ? `Stakes: ${scene.stakes}` : `Mood: ${scene.mood || "Uncertain"}`);
    renderNarration(scene);
    renderChoices(scene);
    renderCharacterPanel();
    renderJournal();
    renderMap(scene);
    renderOutcome();
    renderAudioState(scene);
    if (audio.enabled) playAmbience(scene.ambience);
  } catch (error) {
    showFatalError(error);
  }
}

function getScene() {
  const scene = campaign.scenes[state.currentScene];
  if (!scene) throw new Error(`Scene not found: ${state.currentScene}`);
  return scene;
}

function getLocation(id) {
  const locs = state?.activeLocations || campaign.locations;
  return locs.find((location) => location.id === id) || locs[0];
}

function renderNarration(scene) {
  if (!dom.narration) return;
  dom.narration.innerHTML = "";
  (scene.narration || []).forEach((line) => {
    const p = document.createElement("p");
    p.textContent = line;
    dom.narration.appendChild(p);
  });
}

function renderChoices(scene) {
  if (!dom.choiceList) return;
  dom.choiceList.innerHTML = "";
  (scene.choices || []).forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = "choice storm-choice";
    button.innerHTML = `<span class="choice-number">${index + 1}.</span><span class="choice-title">${escapeHtml(choice.label)}</span>`;
    button.addEventListener("click", () => choose(choice));
    dom.choiceList.appendChild(button);
  });
}

function choiceMeta(choice) {
  const impacts = [];
  if (choice.objectives) impacts.push(deltaSummary(choice.objectives));
  if (choice.moral) impacts.push(deltaSummary(choice.moral));
  return impacts.length ? `<span class="choice-meta">${escapeHtml(impacts.join(" · "))}</span>` : "";
}

function deltaSummary(delta) {
  return Object.entries(delta).map(([key, value]) => `${value > 0 ? "+" : ""}${value} ${readableKey(key)}`).join(", ");
}

function renderCharacterPanel() {
  if (!dom.partyList) return;
  dom.partyList.innerHTML = "";
  const member = state.party[0];
  if (member) {
    const hpPct = Math.max(0, Math.min(100, (member.hp / member.maxHp) * 100));
    const card = document.createElement("div");
    card.className = "character";
    card.innerHTML = `
      <div>
        <div class="character-name">${escapeHtml(member.name)}</div>
        <div class="character-role">${escapeHtml(member.role)}</div>
        <div class="character-meta">${escapeHtml(member.drive)}</div>
      </div>
      <div class="character-meta">${member.hp}/${member.maxHp} HP</div>
      <div class="hp-bar"><div class="hp-fill" style="width:${hpPct}%"></div></div>`;
    card.addEventListener("click", () => openCharacterSheet(member.id));
    dom.partyList.appendChild(card);
  }

  const panel = document.createElement("div");
  panel.className = "storm-state-panel";
  panel.innerHTML = `
    <div class="section-title">Inner State</div>
    ${stateLine("Force", state.moralState.force, forceLabel)}
    ${stateLine("Restraint", state.moralState.restraint, restraintLabel)}
    ${stateLine("Witness", state.moralState.witness, witnessLabel)}
    ${stateLine("Hollow", state.moralState.hollow, hollowLabel)}
    ${stateLine("Reputation", state.moralState.reputation, reputationLabel)}
    <div class="section-title objective-title">The Field</div>
    ${stateLine("Civilians", state.objectives.civilians, civilianLabel, true)}
    ${stateLine("Raider Threat", state.objectives.raiderThreat, threatLabel, true)}
    ${stateLine("Captain", state.objectives.captainPressure, pressureLabel, true)}
  `;
  dom.partyList.appendChild(panel);
}

function stateLine(label, value = 0, labelFn = genericLabel, objective = false) {
  return `<div class="state-line ${objective ? "objective" : ""}"><span>${label}<em>${labelFn(value)}</em></span><strong>${value}</strong></div>`;
}

function renderJournal() {
  if (!dom.journalList) return;
  dom.journalList.innerHTML = "";
  state.journal.slice(-6).reverse().forEach((entry) => {
    const div = document.createElement("div");
    div.className = "journal-entry";
    div.textContent = entry;
    dom.journalList.appendChild(div);
  });
}

function renderMap(scene) {
  if (!dom.routeLayer || !dom.locationLayer || !dom.tokenLayer) return;
  const activeLocs   = state.activeLocations || campaign.locations;
  const activeRoutes = state.activeRoutes   || campaign.routes;
  dom.routeLayer.innerHTML = "";
  dom.locationLayer.innerHTML = "";
  dom.tokenLayer.innerHTML = "";
  renderBattlefieldTexture();
  (activeRoutes || []).forEach(([fromId, toId]) => {
    const from = activeLocs.find(l => l.id === fromId);
    const to   = activeLocs.find(l => l.id === toId);
    if (!from || !to) return;
    const active = (fromId === state.previousScene && toId === state.currentScene) || (toId === state.previousScene && fromId === state.currentScene);
    dom.routeLayer.appendChild(svg("line", {
      x1: from.x, y1: from.y, x2: to.x, y2: to.y,
      class: active ? "route-active" : "",
      stroke: "rgba(180,170,150,0.32)",
      "stroke-width": 7,
      "stroke-linecap": "round",
      "stroke-dasharray": "16 16"
    }));
  });
  (activeLocs || []).forEach((location) => renderLocation(location, scene.location));
  renderAllTokens(scene, activeLocs);
}

function renderBattlefieldTexture() {
  const add = (el) => dom.routeLayer.appendChild(el);

  // ── Region watermark ────────────────────────────────────────────
  const regionLabel = svg("text", {
    x: 500, y: 560,
    "text-anchor": "middle",
    "font-size": "32",
    fill: "#3a2008",
    "font-style": "italic",
    opacity: "0.12",
    "letter-spacing": "0.06em",
    "pointer-events": "none"
  });
  regionLabel.textContent = "Eastern Marches";
  add(regionLabel);

  // ── Highland zone (upper-left — ridge territory) ─────────────────
  // Hatch fill
  add(svg("path", {
    d: "M0,0 Q240,0 340,110 Q390,165 360,260 Q325,340 230,365 Q145,385 70,345 Q18,312 0,260Z",
    fill: "url(#hatchPat)", opacity: "0.65"
  }));
  // Tint
  add(svg("path", {
    d: "M0,0 Q240,0 340,110 Q390,165 360,260 Q325,340 230,365 Q145,385 70,345 Q18,312 0,260Z",
    fill: "#8a7040", opacity: "0.10"
  }));

  // ── Eastern road dirt path ───────────────────────────────────────
  // Road shadow/base
  add(svg("path", {
    d: "M40,590 Q200,560 420,540 Q580,526 730,528 Q870,530 980,548",
    fill: "none",
    stroke: "#7a5828",
    "stroke-width": "18",
    "stroke-linecap": "round",
    opacity: "0.32"
  }));
  // Road surface
  add(svg("path", {
    d: "M40,590 Q200,560 420,540 Q580,526 730,528 Q870,530 980,548",
    fill: "none",
    stroke: "#a07840",
    "stroke-width": "8",
    "stroke-dasharray": "28 14",
    "stroke-linecap": "round",
    opacity: "0.55"
  }));

  // ── Scrubland / open plain (center-left) ────────────────────────
  add(svg("ellipse", {
    cx: "350", cy: "480", rx: "190", ry: "100",
    fill: "#6a8050", opacity: "0.10"
  }));

  // ── Trees / forest patches ──────────────────────────────────────
  [
    [860,340,16],[878,324,13],[896,345,14],[876,360,12],[855,356,11],
    [908,328,12],[862,308,10]
  ].forEach(([cx,cy,r]) => {
    add(svg("circle", { cx, cy, r, fill: "#6a7a40", stroke: "#4a5828", "stroke-width": "0.8", opacity: "0.68" }));
  });
  [
    [866,340,7],[880,326,6],[897,347,6]
  ].forEach(([cx,cy,r]) => {
    add(svg("circle", { cx, cy, r, fill: "#4a5a28", opacity: "0.65" }));
  });

  // ── Smoke plumes near burning caravan (520, 335) ────────────────
  [
    { cx: 510, cy: 318, rx: 80, ry: 46, o: 0.20 },
    { cx: 540, cy: 298, rx: 100, ry: 52, o: 0.15 },
    { cx: 490, cy: 355, rx: 90, ry: 44, o: 0.12 }
  ].forEach(({ cx, cy, rx, ry, o }) => {
    add(svg("ellipse", { cx, cy, rx, ry, fill: "#b0a898", opacity: o }));
  });

  // ── River (decorative, east side) ───────────────────────────────
  add(svg("path", {
    d: "M920,0 Q940,80 910,160 Q880,240 900,320 Q920,400 905,480 Q890,540 910,620",
    fill: "none",
    stroke: "#4a6070",
    "stroke-width": "9",
    opacity: "0.30"
  }));
  add(svg("path", {
    d: "M920,0 Q940,80 910,160 Q880,240 900,320 Q920,400 905,480 Q890,540 910,620",
    fill: "none",
    stroke: "#6a92b2",
    "stroke-width": "3.5",
    opacity: "0.65"
  }));

  // ── Corner ornaments ─────────────────────────────────────────────
  [
    "M16,16 L46,16 M16,16 L16,46",
    "M984,16 L954,16 M984,16 L984,46",
    "M16,604 L46,604 M16,604 L16,574",
    "M984,604 L954,604 M984,604 L984,574"
  ].forEach((d) => {
    add(svg("path", { d, fill: "none", stroke: "#6a4818", "stroke-width": "1.5", opacity: "0.65" }));
  });

  // ── Compass rose (bottom-left) ───────────────────────────────────
  const compass = svgRaw(`
    <g transform="translate(68,568)">
      <polygon points="0,-28 4,-10 0,-8 -4,-10" fill="#5a3a10"/>
      <polygon points="0,28 4,10 0,8 -4,10" fill="#5a3a10" opacity="0.5"/>
      <polygon points="-28,0 -10,-4 -8,0 -10,4" fill="#5a3a10" opacity="0.55"/>
      <polygon points="28,0 10,-4 8,0 10,4" fill="#5a3a10" opacity="0.55"/>
      <circle cx="0" cy="0" r="7" fill="#8a6028" stroke="#4a3010" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="3" fill="#c8a050"/>
      <text x="0" y="-33" text-anchor="middle" font-size="11" fill="#3a2008" font-weight="bold" font-family="Georgia,serif">N</text>
    </g>`);
  add(compass);

  // ── Scale bar (bottom-right) ─────────────────────────────────────
  const scale = svgRaw(`
    <g transform="translate(840,578)" fill="#5a3810" stroke="#5a3810">
      <line x1="-80" y1="0" x2="80" y2="0" stroke-width="1.5"/>
      <line x1="-80" y1="-5" x2="-80" y2="5" stroke-width="1.5"/>
      <line x1="0"   y1="-4" x2="0"   y2="4" stroke-width="1.2"/>
      <line x1="80"  y1="-5" x2="80"  y2="5" stroke-width="1.5"/>
      <rect x="-80" y="-3" width="80" height="6" fill="#5a3810" opacity="0.55"/>
      <rect x="0"   y="-3" width="80" height="6" fill="#c8a850" opacity="0.4"/>
      <text x="0" y="16" text-anchor="middle" font-size="8" letter-spacing="0.1em" font-family="Georgia,serif">one day's ride</text>
    </g>`);
  add(scale);
}

function svgRaw(str) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.innerHTML = str;
  return g;
}

function renderLocation(location, currentId) {
  const x = location.x;
  const y = location.y;
  const isActive = location.id === currentId;
  const group = svg("g", {
    class: `location-node ${isActive ? "location-current" : ""}`
  });

  // Active glow ring
  if (isActive) {
    group.appendChild(svg("circle", {
      cx: x, cy: y, r: "42",
      fill: "none",
      stroke: "#c8a850",
      "stroke-width": "1.5",
      opacity: "0.35"
    }));
  }

  // Kind-specific cartographic symbol, centered at (x, y)
  // Icon sits from y-30 to y+8 approx — tokens are at y-76 so no overlap
  group.appendChild(svgRaw(locationIcon(location.kind, x, y)));

  // Label — always below anchor point
  const label = svg("text", {
    x, y: y + 28,
    "text-anchor": "middle",
    "font-size": "11",
    "font-style": "italic",
    "font-weight": isActive ? "bold" : "normal",
    fill: isActive ? "#3a2008" : "#4a3010",
    "letter-spacing": "0.02em",
    "pointer-events": "none"
  });
  label.textContent = location.name;
  group.appendChild(label);

  dom.locationLayer.appendChild(group);
}

function locationIcon(kind, x, y) {
  switch (kind) {
    case "kael":
    case "ridge":
      // Cartographic elevation — three overlapping hill triangles
      return `
        <polygon points="${x-20},${y+10} ${x},${y-22} ${x+20},${y+10}" fill="#b09860" stroke="#5a3e18" stroke-width="1.5"/>
        <polygon points="${x-32},${y+10} ${x-14},${y-14} ${x+4},${y+10}" fill="#a08850" stroke="#5a3e18" stroke-width="1.2" opacity="0.7"/>
        <polygon points="${x-4},${y+10} ${x+14},${y-14} ${x+32},${y+10}" fill="#a08850" stroke="#5a3e18" stroke-width="1.2" opacity="0.7"/>
        <polygon points="${x},${y-22} ${x+7},${y-8} ${x-7},${y-8}" fill="#ece4d4" opacity="0.85"/>`;

    case "fire":
      // Burning caravan — cart body, wheels, flames
      return `
        <rect x="${x-16}" y="${y-8}" width="32" height="18" rx="2" fill="#7a3818" stroke="#3a1808" stroke-width="1.5"/>
        <circle cx="${x-8}" cy="${y+12}" r="6" fill="none" stroke="#4a2808" stroke-width="2"/>
        <circle cx="${x+8}" cy="${y+12}" r="6" fill="none" stroke="#4a2808" stroke-width="2"/>
        <line x1="${x-8}" y1="${y+6}" x2="${x-8}" y2="${y+18}" stroke="#4a2808" stroke-width="1"/>
        <line x1="${x-14}" y1="${y+12}" x2="${x-2}" y2="${y+12}" stroke="#4a2808" stroke-width="1"/>
        <line x1="${x+8}" y1="${y+6}" x2="${x+8}" y2="${y+18}" stroke="#4a2808" stroke-width="1"/>
        <line x1="${x+2}" y1="${y+12}" x2="${x+14}" y2="${y+12}" stroke="#4a2808" stroke-width="1"/>
        <path d="M${x-8},${y-8} Q${x-5},${y-24} ${x-2},${y-8}" fill="#c84818" opacity="0.92"/>
        <path d="M${x-2},${y-8} Q${x+2},${y-20} ${x+5},${y-8}" fill="#e06828" opacity="0.85"/>
        <path d="M${x+4},${y-8} Q${x+7},${y-18} ${x+10},${y-8}" fill="#c84818" opacity="0.8"/>
        <path d="M${x-4},${y-8} Q${x},${y-16} ${x+3},${y-8}" fill="#f09040" opacity="0.6"/>`;

    case "objective":
      // Three figure silhouettes — civilians
      return `
        <circle cx="${x-10}" cy="${y-16}" r="4" fill="#7a6840" stroke="#4a3818" stroke-width="1"/>
        <line x1="${x-10}" y1="${y-12}" x2="${x-10}" y2="${y}" stroke="#4a3818" stroke-width="2.5"/>
        <line x1="${x-17}" y1="${y-8}" x2="${x-3}" y2="${y-8}" stroke="#4a3818" stroke-width="1.5"/>
        <circle cx="${x}" cy="${y-16}" r="4" fill="#7a6840" stroke="#4a3818" stroke-width="1"/>
        <line x1="${x}" y1="${y-12}" x2="${x}" y2="${y}" stroke="#4a3818" stroke-width="2.5"/>
        <line x1="${x-7}" y1="${y-8}" x2="${x+7}" y2="${y-8}" stroke="#4a3818" stroke-width="1.5"/>
        <circle cx="${x+10}" cy="${y-16}" r="4" fill="#7a6840" stroke="#4a3818" stroke-width="1"/>
        <line x1="${x+10}" y1="${y-12}" x2="${x+10}" y2="${y}" stroke="#4a3818" stroke-width="2.5"/>
        <line x1="${x+3}" y1="${y-8}" x2="${x+17}" y2="${y-8}" stroke="#4a3818" stroke-width="1.5"/>`;

    case "threat":
      // Enemy banner + crossed swords
      return `
        <line x1="${x-2}" y1="${y-28}" x2="${x-2}" y2="${y+6}" stroke="#5a2010" stroke-width="2.5"/>
        <polygon points="${x-2},${y-28} ${x+18},${y-19} ${x-2},${y-10}" fill="#8a2010" stroke="#4a0808" stroke-width="1.5"/>
        <line x1="${x-14}" y1="${y+6}" x2="${x+14}" y2="${y-8}" stroke="#5a3010" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="${x+14}" y1="${y+6}" x2="${x-14}" y2="${y-8}" stroke="#5a3010" stroke-width="2.2" stroke-linecap="round"/>`;

    case "road":
      // Milestone / marker stone
      return `
        <rect x="${x-8}" y="${y-22}" width="16" height="30" rx="2" fill="#7a6838" stroke="#4a3818" stroke-width="1.5"/>
        <rect x="${x-10}" y="${y-26}" width="20" height="8" rx="1" fill="#6a5828" stroke="#4a3818" stroke-width="1.2"/>
        <line x1="${x-5}" y1="${y-18}" x2="${x+5}" y2="${y-18}" stroke="#4a3010" stroke-width="1" opacity="0.5"/>
        <line x1="${x-5}" y1="${y-12}" x2="${x+5}" y2="${y-12}" stroke="#4a3010" stroke-width="1" opacity="0.5"/>`;

    default:
      // Generic settlement dot
      return `<circle cx="${x}" cy="${y}" r="10" fill="#9a8450" stroke="#5a3e18" stroke-width="1.5"/>`;
  }
}

// ── Token helpers ─────────────────────────────────────────────────

function tokenInitial(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function clusterOffsets(n) {
  return ([
    [[0, 0]],
    [[-26, 8], [26, 8]],
    [[-26, 10], [26, 10], [0, -22]],
    [[-24, -16], [24, -16], [-24, 18], [24, 18]]
  ])[Math.min(n - 1, 3)];
}

function makeToken({ cx, cy, r, body, hi, rim, initial, label, tier, isActive, isDamaged }) {
  const g = svg("g", { class: `vtt-token vtt-token--${tier}`, "aria-label": label, role: "img" });

  // Ground shadow ellipse — creates physical elevation sense
  g.appendChild(svg("ellipse", {
    cx, cy: cy + Math.round(r * 0.3),
    rx: Math.round(r * 1.15), ry: Math.round(r * 0.32),
    fill: "rgba(0,0,0,0.58)"
  }));

  // Active pulse ring — signals player presence
  if (isActive) {
    g.appendChild(svg("circle", {
      cx, cy, r: r + 9,
      fill: "none", stroke: rim,
      "stroke-width": "2", opacity: "0.55",
      class: "token-ring"
    }));
  }

  // Body disc — material identity
  g.appendChild(svg("circle", {
    cx, cy, r,
    fill: body,
    stroke: isDamaged ? "rgba(216,189,132,0.22)" : rim,
    "stroke-width": tier === "hero" ? "5" : "3.5",
    filter: "url(#tokenShadow)"
  }));

  // Catch-light — top-left material highlight gives physical depth
  g.appendChild(svg("circle", {
    cx: cx - Math.round(r * 0.22), cy: cy - Math.round(r * 0.22),
    r: Math.round(r * 0.52),
    fill: hi, opacity: "0.14"
  }));

  // Damage crack — HP below 50%, visible wear on the piece
  if (isDamaged) {
    g.appendChild(svg("line", {
      x1: cx - 3, y1: cy - Math.round(r * 0.6),
      x2: cx + 2, y2: cy + Math.round(r * 0.5),
      stroke: "rgba(255,120,90,0.75)",
      "stroke-width": "1.5", "stroke-linecap": "round"
    }));
  }

  // Initial — identity mark at centre of token
  const t = svg("text", {
    x: cx, y: cy + Math.round(r * 0.36),
    "text-anchor": "middle",
    "font-size": String(Math.round(r * (initial.length > 1 ? 0.62 : 0.78))),
    fill: rim, "font-weight": "700", "font-family": "inherit",
    "letter-spacing": initial.length > 1 ? "-0.5" : "0",
    "pointer-events": "none"
  });
  t.textContent = initial;
  g.appendChild(t);

  return g;
}

function renderAllTokens(scene, activeLocs) {
  const locs   = activeLocs || state.activeLocations || campaign.locations;
  const anchor = locs.find(l => l.id === scene.location) || locs[0];
  const offsets = clusterOffsets(state.party.length);

  // Party — each member gets a token, hero is largest and leads the cluster
  state.party.forEach((member, i) => {
    const [dx, dy] = offsets[i] || [0, 0];
    const isHero = i === 0;
    const palette = ROLE_PALETTE[member.role] || ROLE_PALETTE["Iron Captain"];
    const isDamaged = member.hp < member.maxHp * 0.5;

    const token = makeToken({
      cx: anchor.x + dx,
      cy: anchor.y - 76 + dy,
      r: isHero ? 26 : 20,
      body: palette.body, hi: palette.hi, rim: palette.rim,
      initial: tokenInitial(member.name),
      label: `${member.name} — ${member.role}`,
      tier: isHero ? "hero" : "companion",
      isActive: true,
      isDamaged
    });

    // Tokens open character sheet — presence is interactive
    token.setAttribute("tabindex", "0");
    token.style.cursor = "pointer";
    token.addEventListener("click", () => openCharacterSheet(member.id));
    token.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") openCharacterSheet(member.id);
    });

    dom.tokenLayer.appendChild(token);
  });

  // Named threats — enemy pieces visible on the board
  locs
    .filter(loc => loc.kind === "threat")
    .forEach(loc => {
      const k = KIND_PALETTE.threat;
      dom.tokenLayer.appendChild(makeToken({
        cx: loc.x, cy: loc.y - 66,
        r: k.r, body: k.body, hi: k.hi, rim: k.rim,
        initial: tokenInitial(loc.name),
        label: loc.name,
        tier: "threat",
        isActive: false, isDamaged: false
      }));
    });
}

function renderOutcome() {
  if (!dom.outcomeText) return;
  const outcome = normaliseOutcome(state.latestOutcome);
  dom.outcomeText.innerHTML = `
    <div class="outcome-grid">
      <div><span>Immediate Consequence</span><strong>${escapeHtml(outcome.consequence)}</strong></div>
      <div><span>What Changed</span><strong>${escapeHtml(outcome.stateChange)}</strong></div>
    </div>
    ${buildAftermathReport()}`;
}

function buildAftermathReport() {
  if (state.currentScene !== "aftermath" && !state.sessionComplete) return "";
  const civilians = state.objectives.civilians || 0;
  const captain = state.objectives.captainPressure || 0;
  const threat = state.objectives.raiderThreat || 0;
  const hollow = state.moralState.hollow || 0;
  const reputation = state.moralState.reputation || 0;
  return `
    <section class="aftermath-report">
      <p class="outcome-label">Aftermath Report</p>
      <div class="report-grid">
        <div><span>Civilians</span><strong>${civilianLabel(civilians)}</strong></div>
        <div><span>Captain</span><strong>${pressureLabel(captain)}</strong></div>
        <div><span>Threat</span><strong>${threatLabel(threat)}</strong></div>
        <div><span>Hollow</span><strong>${hollowLabel(hollow)}</strong></div>
        <div><span>Reputation</span><strong>${reputationLabel(reputation)}</strong></div>
        <div><span>Account</span><strong>${hollow >= 5 ? "Victory cannot make this clean." : "The account can still be made accurate."}</strong></div>
      </div>
    </section>`;
}

function renderSessionComplete() {
  if (!dom.sessionComplete) return;
  dom.sessionComplete.hidden = false;
  setText(dom.completeTitle, campaign.title);
  setText(dom.completeEyebrow, `${campaign.region} · ${campaign.series || "Vallum"}`);
  if (dom.completeJournal) {
    dom.completeJournal.innerHTML = "";
    state.journal.forEach((entry) => {
      const div = document.createElement("div");
      div.className = "complete-journal-entry";
      div.textContent = entry;
      dom.completeJournal.appendChild(div);
    });
  }
  if (dom.completePortrait) {
    dom.completePortrait.innerHTML = "";
    buildPortraitLines().forEach(({ label, text }) => {
      const div = document.createElement("div");
      div.className = "complete-portrait-line";
      div.innerHTML = `<em>${escapeHtml(label)}</em>${escapeHtml(text)}`;
      dom.completePortrait.appendChild(div);
    });
  }
  if (dom.completeHook) {
    dom.completeHook.innerHTML = `<p class="outcome-label">What follows</p><p>${escapeHtml(buildForwardHook())}</p>`;
  }
}

function buildPortraitLines() {
  const m = state.moralState;
  const o = state.objectives;
  const lines = [];
  if (m.force >= 7) lines.push({ label: "Force", text: "Force has become his first response. The decision arrives after the blade has already moved." });
  else if (m.force >= 4) lines.push({ label: "Force", text: "Force is available and ready. He reaches for it easily and does not always notice the reaching." });
  else lines.push({ label: "Force", text: "Force is held. He has not yet learned to trust it, or has decided not to." });
  if (m.restraint >= 6) lines.push({ label: "Restraint", text: "He can hold back. That costs him. He is beginning to understand what the cost is." });
  else if (m.restraint >= 3) lines.push({ label: "Restraint", text: "Restraint is possible. It is not yet instinct. He finds it when he looks for it." });
  else lines.push({ label: "Restraint", text: "Restraint has not established itself. Purpose arrives before hesitation." });
  if (m.witness >= 6) lines.push({ label: "Witness", text: "He sees clearly. That now includes himself, which is not comfortable." });
  else if (m.witness >= 3) lines.push({ label: "Witness", text: "He is watching. He is not yet seeing everything he is part of." });
  else lines.push({ label: "Witness", text: "He sees the field. He does not yet see what he is doing to it." });
  if (m.hollow >= 7) lines.push({ label: "Hollow", text: "The hollow has opened. Something moves in the space where a more complete person used to stand." });
  else if (m.hollow >= 4) lines.push({ label: "Hollow", text: "The hollow is present. He knows it is there and has not yet decided what to do with that knowledge." });
  else lines.push({ label: "Hollow", text: "The hollow is contained. The cost has not yet accumulated past the threshold of comfort." });
  if (m.reputation >= 6) lines.push({ label: "Reputation", text: "The Iron Captain has become something the world reaches for. He has not yet decided whether to let go of it." });
  else if (m.reputation >= 3) lines.push({ label: "Reputation", text: "His name is useful. People know it. He has not decided what that means for what he is allowed to become." });
  else lines.push({ label: "Reputation", text: "He is not yet legend. He is a man who did something on a road. There is still time to be something else." });
  const civText = (o.civilians || 0) >= 7 ? "The civilians of the Eastern Road are alive." : (o.civilians || 0) >= 4 ? "Some of the civilians survived. The tally is incomplete." : "The civilian cost was severe.";
  const threatText = (o.raiderThreat || 0) <= 3 ? "The raider threat has scattered." : (o.raiderThreat || 0) <= 6 ? "The raider threat remains unstable." : "The raider threat holds.";
  lines.push({ label: "The Field", text: `${civText} ${threatText}` });
  return lines;
}

function buildForwardHook() {
  const hollow = state.moralState.hollow || 0;
  const reputation = state.moralState.reputation || 0;
  const restraint = state.moralState.restraint || 0;
  const civilians = state.objectives.civilians || 0;
  if (hollow >= 6) {
    return "A rider reaches the garrison before Kael does. The letter bears no lord's seal — only a name, a village north of the march line, and a problem that requires exactly the kind of man the hollow has been making. He has not yet decided if that is a commission or a warning.";
  }
  if (reputation >= 5 && restraint <= 2) {
    return "The Eastern Garrison has written to the Council. The Council has already written back. They want the Iron Captain for a commission in the interior lordships — something administrative, they say, involving a difficult man who does not respond to ordinary pressure. They mean Kael. He has not decided yet if he wants to be the pressure they mean.";
  }
  if (civilians >= 7 && restraint >= 4) {
    return "The woman from under the wheel has sent a name to the garrison. She is asking for the captain who made a different choice. Somewhere in the interior, there is a community with a problem that does not require a blade — or would not, if the right person arrived first.";
  }
  return "The garrison wants a report. The Council of the Eastern Marches will want more than that. What happened on the road has already left the road — it lives now in accounts carried by men who were not there, and the shape of those accounts is not entirely accurate. Kael has not yet decided whether to correct them.";
}

async function generateStory() {
  if (!GM.hasKey()) { showApiModal(); return; }
  if (dom.storyPanel) dom.storyPanel.hidden = false;
  if (dom.storyOutput) dom.storyOutput.textContent = "";
  if (dom.storyControls) dom.storyControls.hidden = true;
  if (dom.storyGenBtn) { dom.storyGenBtn.disabled = true; dom.storyGenBtn.textContent = "Writing…"; }
  let fullText = "";
  await GM.stream({
    userContent: GM.storyPrompt(state.journal, state.moralState, state.objectives),
    systemOverride: GM.STORY_SYSTEM,
    maxTokens: 800,
    onToken(t) {
      fullText += t;
      if (dom.storyOutput) dom.storyOutput.textContent = fullText;
    },
    onDone() {
      if (dom.storyControls) dom.storyControls.hidden = false;
      if (dom.storyGenBtn) { dom.storyGenBtn.disabled = false; dom.storyGenBtn.textContent = "Regenerate"; }
    },
    onError(err) {
      if (dom.storyOutput) dom.storyOutput.textContent = "Could not generate story. " + (err || "");
      if (dom.storyGenBtn) { dom.storyGenBtn.disabled = false; dom.storyGenBtn.textContent = "Generate your story"; }
    }
  });
}

function copyStory() {
  const text = dom.storyOutput?.textContent || "";
  if (!text) return;
  try { navigator.clipboard.writeText(text); } catch {}
}

function downloadStory() {
  const text = dom.storyOutput?.textContent || "";
  if (!text) return;
  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kael-vorn-${date}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

async function choose(choice) {
  try {
    clearDiceResult();
    // Capture scene and snapshot BEFORE state changes — GM narrates from this context
    const sceneAtChoice = getScene();
    const before = snapshotState();
    const startingScene = state.currentScene;

    // Resolve roll and apply all state changes
    const roll = choice.roll ? resolveRoll(choice.roll) : null;
    if (choice.objectives) applyDelta(state.objectives, choice.objectives);
    if (choice.moral) applyDelta(state.moralState, choice.moral);
    if (choice.damage) applyDamage(choice.damage);
    if (choice.heal) applyHeal(choice.heal);
    if (choice.journal) addJournal(choice.journal);
    if (choice.time) advanceTime(choice.time);
    if (choice.nextScene) state.currentScene = choice.nextScene;
    if (choice.result && choice.result.toLowerCase().includes("module ends")) state.sessionComplete = true;

    state.previousScene = startingScene;
    state.latestOutcome = {
      consequence: roll ? roll.text : choice.result || "The choice is recorded.",
      stateChange: describeStateChange(before, snapshotState())
    };
    state.completedChoices.push({ scene: startingScene, label: choice.label, nextScene: state.currentScene, at: new Date().toISOString() });
    saveSilent();
    setStatus("Autosaved.");
    clearGMResponse();
    render();

    if (!state.sessionComplete && dom.outcomeText) {
      dom.outcomeText.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // AI GM narration — streams into centre table after mechanical render
    if (GM.hasKey() && !state.sessionComplete) {
      showGMSpeaking();
      await GM.stream({
        userContent: GM.choicePrompt(choice, roll, state, sceneAtChoice),
        onToken: appendGMToken,
        onDone: doneGMSpeaking,
        onError(err) { showGMError(err); doneGMSpeaking(); }
      });
    }
  } catch (error) {
    showFatalError(error);
  }
}

function snapshotState() {
  return { objectives: { ...state.objectives }, moralState: { ...state.moralState } };
}

function describeStateChange(before, after) {
  const changes = [];
  collectChanges(changes, before.objectives, after.objectives);
  collectChanges(changes, before.moralState, after.moralState);
  return changes.length ? changes.join(" · ") : "No visible state change.";
}

function collectChanges(changes, before, after) {
  Object.keys(after || {}).forEach((key) => {
    const delta = (after[key] || 0) - (before[key] || 0);
    if (delta !== 0) changes.push(`${delta > 0 ? "+" : ""}${delta} ${readableKey(key)}`);
  });
}

function resolveRoll(roll) {
  const raw   = d20();
  const bonus = statBonus(roll.stat);
  const total = raw + bonus;
  const success = total >= roll.target;
  const text = success ? roll.success : roll.failure;
  addJournal(text);
  showDiceResult(roll, raw, bonus, total, success);
  return { success, text };
}

function showDiceResult(roll, raw, bonus, total, success) {
  if (!dom.diceLog) return;
  const sign = bonus >= 0 ? `+${bonus}` : `${bonus}`;

  dom.diceLog.innerHTML = `<div class="dice-result dice-rolling"><span class="dice-label">d20</span><span class="dice-rolled">—</span></div>`;
  dom.diceLog.classList.remove("hidden-rolls");

  const face = dom.diceLog.querySelector('.dice-rolled');
  const box  = dom.diceLog.querySelector('.dice-result');
  const delays = [40, 50, 62, 78, 98, 122, 148, 178, 210];
  let s = 0;

  function tick() {
    if (s < delays.length) {
      face.textContent = Math.floor(Math.random() * 20) + 1;
      setTimeout(tick, delays[s++]);
    } else {
      box.classList.remove('dice-rolling');
      box.classList.add(success ? 'dice-success' : 'dice-failure');
      box.innerHTML = `<span class="dice-label">d20</span><span class="dice-rolled dice-land">${raw}</span><span class="dice-op">+</span><span class="dice-stat-name">${roll.stat}</span><span class="dice-bonus">(${sign})</span><span class="dice-op">=</span><span class="dice-total">${total}</span><span class="dice-vs">vs ${roll.target}</span><span class="dice-verdict">${success ? "✓ Success" : "✗ Failure"}</span>`;
    }
  }
  tick();
}

function clearDiceResult() {
  if (!dom.diceLog) return;
  dom.diceLog.innerHTML = "";
  dom.diceLog.classList.add("hidden-rolls");
}

function applyDelta(target, delta) {
  Object.entries(delta || {}).forEach(([key, value]) => {
    target[key] = Math.max(0, Math.min(10, (target[key] || 0) + value));
  });
}

function applyDamage(effect) {
  if (effect.target === "party") state.party.forEach((member) => { member.hp = Math.max(1, member.hp - effect.amount); });
}

function applyHeal(effect) {
  if (effect.target === "party") state.party.forEach((member) => { member.hp = Math.min(member.maxHp, member.hp + effect.amount); });
}

function advanceTime(phase) {
  state.time.phase = phase;
}

function statBonus(stat) {
  const v = (state?.moralState?.[stat]) || 0;
  // 0–2 → −1 (untrained),  3–6 → +1,  7–9 → +2,  10 → +3
  if (v <= 2) return -1;
  if (v <= 6) return  1;
  if (v <= 9) return  2;
  return 3;
}

function openCharacterSheet(memberId) {
  const member = state.party.find((item) => item.id === memberId);
  if (!member) return;
  setText(dom.drawerName, member.name);
  setText(dom.drawerRole, member.role);
  setText(dom.drawerDrive, member.drive);
  if (!dom.drawerStats) return;
  dom.drawerStats.innerHTML = "";
  [
    ["Hit Points", `${member.hp}/${member.maxHp}`],
    ["Defence", member.defence],
    ["Attack", `+${member.attack}`],
    ["Hollow", hollowLabel(state.moralState.hollow)],
    ["Reputation", reputationLabel(state.moralState.reputation)]
  ].forEach(([label, value]) => {
    const stat = document.createElement("div");
    stat.className = "drawer-stat";
    stat.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    dom.drawerStats.appendChild(stat);
  });
  if (dom.characterDrawer) dom.characterDrawer.hidden = false;
}

function closeCharacterSheet() {
  if (dom.characterDrawer) dom.characterDrawer.hidden = true;
}

// ── AI GM ─────────────────────────────────────────────────────────

function showApiModal() {
  if (dom.apiKeyInput && GM.hasKey()) dom.apiKeyInput.value = '';
  if (dom.apiModal) dom.apiModal.hidden = false;
}

function hideApiModal() {
  if (dom.apiModal) dom.apiModal.hidden = true;
}

function saveApiKey() {
  const k = dom.apiKeyInput?.value?.trim();
  if (k) { GM.setKey(k); renderAIStatus(); }
  hideApiModal();
}

function renderAIStatus() {
  if (!dom.aiStatus) return;
  setText(dom.aiStatus, GM.hasKey() ? "AI ✦ On" : "AI · Off");
  dom.aiStatus.classList.toggle("ai-status-on", GM.hasKey());
}

function clearGMResponse() {
  if (dom.gmResponsePanel) dom.gmResponsePanel.hidden = true;
  if (dom.gmResponse) dom.gmResponse.innerHTML = "";
}

function showGMSpeaking() {
  if (!dom.gmResponse || !dom.gmResponsePanel) return;
  dom.gmResponse.innerHTML = '<span class="gm-cursor" aria-hidden="true">▌</span>';
  dom.gmResponsePanel.hidden = false;
  dom.gmResponsePanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function appendGMToken(token) {
  if (!dom.gmResponse) return;
  const cursor = dom.gmResponse.querySelector('.gm-cursor');
  if (cursor) {
    cursor.insertAdjacentText('beforebegin', token);
  } else {
    dom.gmResponse.insertAdjacentText('beforeend', token);
  }
}

function doneGMSpeaking() {
  const cursor = dom.gmResponse?.querySelector('.gm-cursor');
  if (cursor) cursor.remove();
}

function showGMError(msg) {
  if (!dom.gmResponse) return;
  dom.gmResponse.innerHTML = `<span class="gm-error">GM offline — ${escapeHtml(msg)}</span>`;
}

async function askGM() {
  const query = dom.gmAskInput?.value?.trim();
  if (!query) return;

  if (!GM.hasKey()) { showApiModal(); return; }

  dom.gmAskInput.value = '';
  showGMSpeaking();

  const scene = getScene();
  await GM.stream({
    userContent: GM.askPrompt(query, state, scene),
    onToken: appendGMToken,
    onDone: doneGMSpeaking,
    onError(err) { showGMError(err); doneGMSpeaking(); }
  });
}

function addJournal(entry) {
  if (entry) state.journal.push(entry);
}

async function toggleAmbience() {
  try {
    if (!audio.enabled) {
      await startAudio();
      audio.enabled = true;
      setText(dom.ambienceBtn, "M");
      playAmbience(getScene().ambience);
    } else {
      stopAmbience();
      audio.enabled = false;
      setText(dom.ambienceBtn, "M");
    }
    renderAudioState(getScene());
  } catch {}
}

function renderAudioState() {
  setText(dom.ambienceState, audio.enabled ? "On" : "Off");
}

async function startAudio() {
  if (!audio.ctx) {
    audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
    audio.master = audio.ctx.createGain();
    audio.master.gain.value = 0.06;
    audio.master.connect(audio.ctx.destination);
  }
  if (audio.ctx.state === "suspended") await audio.ctx.resume();
}

function stopAmbience() {
  audio.nodes.forEach((node) => {
    try { node.stop(); } catch {}
    try { node.disconnect(); } catch {}
  });
  audio.nodes = [];
  audio.currentMood = null;
}

function playAmbience(mood) {
  if (!audio.ctx || audio.currentMood === mood) return;
  stopAmbience();
  audio.currentMood = mood;
  noiseLayer(mood === "storm" ? 760 : 900, mood === "storm" ? 0.5 : 0.35, 0.35);
  lowDrone(mood === "storm" ? 44 : 96, 0.06);
}

function noiseLayer(frequency, variance, gain) {
  const bufferSize = audio.ctx.sampleRate * 2;
  const buffer = audio.ctx.createBuffer(1, bufferSize, audio.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) data[i] = (Math.random() * 2 - 1) * variance;
  const source = audio.ctx.createBufferSource();
  const filter = audio.ctx.createBiquadFilter();
  const layerGain = audio.ctx.createGain();
  source.buffer = buffer;
  source.loop = true;
  filter.type = "bandpass";
  filter.frequency.value = frequency;
  layerGain.gain.value = gain;
  source.connect(filter);
  filter.connect(layerGain);
  layerGain.connect(audio.master);
  source.start();
  audio.nodes.push(source, filter, layerGain);
}

function lowDrone(frequency, gain) {
  const oscillator = audio.ctx.createOscillator();
  const layerGain = audio.ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  layerGain.gain.value = gain;
  oscillator.connect(layerGain);
  layerGain.connect(audio.master);
  oscillator.start();
  audio.nodes.push(oscillator, layerGain);
}

function d20() { return Math.floor(Math.random() * 20) + 1; }
function readableKey(key) { return String(key).replace(/([A-Z])/g, " $1").toLowerCase(); }
function genericLabel(value) { return value >= 6 ? "high" : value >= 3 ? "present" : "low"; }
function forceLabel(value) { return value >= 6 ? "dominant" : value >= 4 ? "ready" : "held"; }
function restraintLabel(value) { return value >= 5 ? "active" : value >= 3 ? "possible" : "thin"; }
function witnessLabel(value) { return value >= 5 ? "clear" : value >= 3 ? "working" : "partial"; }
function hollowLabel(value) { return value >= 6 ? "hollow rising" : value >= 3 ? "opening" : "contained"; }
function reputationLabel(value) { return value >= 6 ? "legend feeding" : value >= 3 ? "useful name" : "quiet"; }
function civilianLabel(value) { return value >= 7 ? "protected" : value >= 4 ? "at risk" : "severe cost"; }
function threatLabel(value) { return value <= 3 ? "scattered" : value <= 6 ? "unstable" : "dangerous"; }
function pressureLabel(value) { return value <= 2 ? "broken" : value <= 5 ? "contested" : "commanding"; }

function svg(name, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function setStatus(msg) {
  setText(dom.saveStatus, msg);
}

function on(target, event, handler) {
  if (target) target.addEventListener(event, handler);
}

function setText(target, value) {
  if (target) target.textContent = value;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showFatalError(error) {
  console.error(error);
  if (dom.campaignCover) dom.campaignCover.hidden = true;
  document.body.classList.remove("cover-open");
  setText(dom.sceneTitle, "Table interrupted");
  if (dom.narration) {
    dom.narration.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = "The session could not continue. Start a new session to clear the local table state.";
    dom.narration.appendChild(p);
  }
  if (dom.choiceList) {
    dom.choiceList.innerHTML = "";
    const button = document.createElement("button");
    button.className = "choice storm-choice";
    button.textContent = "Start a clean session";
    button.addEventListener("click", startNewSession);
    dom.choiceList.appendChild(button);
  }
}
