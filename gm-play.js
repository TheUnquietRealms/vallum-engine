/* ════════════════════════════════════════════════════════════
   The Unquiet Marches — AI Game Master, open play
   You + a Dungeon Master who knows the world. Free play, not a
   script. Familiar mechanics: HP, Surge (power), Hollow
   (corruption), a visible d20. The Surge is the point.
   Runs in the browser, direct to Anthropic, with your own key.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var KEY_STORE = "vallum.anthropic.key";
  var SAVE = "um.gm.save.v1";
  var MODEL = "claude-opus-4-8";   // change here if you prefer another model

  var SYSTEM = [
"You are the Game Master of a solo tabletop RPG set in THE UNQUIET MARCHES (the Stormwright Cycle world), created by P A Myint. One player. You are their Dungeon Master — like the best human GM they ever played with: reactive, fair, vivid, never railroading.",
"",
"THE PLAYER is Kael Vorn, a contract captain of the Eastern Marches who is beginning to discover the Surge. This is an OPEN WORLD. The player may go anywhere and attempt anything. The ONLY boundary is the world itself — its geography, people, and laws. NEVER force them down the plot of the novels. The books are canon for the WORLD, not a script for the player. If they wander, follow them. Make their choices matter.",
"",
"THE WORLD (use real places):",
"- The Heartlands (cities: Veldra, Caer Ashe, Stoneholt) — stable, agricultural, administrative.",
"- The Eastern Marches — wet, feudal, contested frontier. Ridge Road, Stonebridge, Vale Crossing, Marrow Ford, Ashen Crossing, the town of Marden.",
"- Caeden Keep — seat of Lord Caeden: measured, reasonable, dangerous; offers wine, never threatens.",
"- Reshen Valley (hamlets: Hollowmere, Brackenhurst, Ravenspool; Reshen Mill) — a wound in the land.",
"- The Harren Clans, beyond the passes (Wolf's, Ironveil, Bloodgate, Dreadstone) — ungoverned, fierce.",
"- The north: Grey Pike, the Northward River, Old Greywatch (an abandoned border fortification).",
"Tone: dark feudal fantasy — gritty, heroic, weather always present. Terse, literary, PRESENT TENSE. Short declarative sentences. No purple prose.",
"",
"THE MECHANICS (explain nothing in-fiction; just run them):",
"- HEALTH (HP): physical condition. Violence and hardship cost HP. At 0 Kael falls.",
"- THE SURGE: his power — a heightened state where the world narrows and action becomes effortless, near-supernatural. SPENDING SURGE LETS HIM DO THE IMPOSSIBLE and it should feel GREAT — decisive, electric, powerful. Make the Surge tempting and thrilling. This is the heart of the game.",
"- THE HOLLOW (0–10): corruption — the price of power. Riding the Surge, cruelty, and force-as-certainty raise it. Restraint and witnessing can ease it. At 10 the Hollow takes him (a dark ending).",
"- THE DIE: for any uncertain action, roll a d20 against a target YOU set (easy 6, hard 16). Report the die, the target, and whether it beat it. Surging can add power to a roll.",
"",
"HOW TO RUN EACH TURN:",
"- React to what the player did. Narrate the result in 2–4 short paragraphs.",
"- When an action is uncertain, roll the d20 and let success or failure genuinely change what happens (lost HP, a death, a door closed, the Hollow rising).",
"- Always make a SURGE option available and tempting when it fits — and charge the Hollow for it.",
"- Offer 3–4 concrete next actions, but the player can also type their own; honour anything reasonable.",
"- Track state with deltas. HP/Surge are bounded by their max; Hollow 0–10.",
"",
"OUTPUT FORMAT — return ONLY valid JSON, nothing else, no markdown fences:",
'{ "narration": "2-4 short paragraphs", "dice": { "die":"d20", "target":13, "result":16, "outcome":"success" } (only if a roll happened, else omit), "delta": { "hp":-3, "surge":-1, "hollow":1 } (only changed fields, else omit), "location": "Ridge Road" (current place, when it changes), "actions": ["short action 1","short action 2","short action 3"] }',
"Keep narration terse and in-world. Never use the word \"you\" in narration — write Kael in third person, present tense. Never break character. JSON only."
  ].join("\n");

  var REGIONS = [
    ["greywatch",72,8],["north",55,12],["grey pike",76,26],["harren",92,40],["pass",88,32],
    ["caeden",38,24],["heartland",20,40],["veldra",8,48],["caer ashe",22,55],["stoneholt",14,66],
    ["vale",46,32],["stonebridge",47,42],["marrow",47,52],["ashen",52,60],["marden",68,42],
    ["ridge",57,43],["marches",58,46],["reshen",64,66],["hollowmere",62,70],["brackenhurst",63,69],
    ["ravenspool",60,72],["mill",66,68],["river",50,30]
  ];
  function locToPos(s) {
    s = (s || "").toLowerCase();
    for (var i = 0; i < REGIONS.length; i++) if (s.indexOf(REGIONS[i][0]) > -1) return [REGIONS[i][1], REGIONS[i][2]];
    return [50, 45];
  }

  var state, history, busy = false, $ = function (id) { return document.getElementById(id); };
  function clampN(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function getKey() { try { return localStorage.getItem(KEY_STORE); } catch (e) { return null; } }
  function setKey(k) { try { localStorage.setItem(KEY_STORE, k.trim()); } catch (e) {} }
  function save() { try { localStorage.setItem(SAVE, JSON.stringify({ state: state, history: history })); } catch (e) {} }
  function load() { try { var r = localStorage.getItem(SAVE); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function wipe() { try { localStorage.removeItem(SAVE); } catch (e) {} }

  function freshState() { return { hp: 20, hpMax: 20, surge: 3, surgeMax: 5, hollow: 0, location: "Ridge Road" }; }

  /* ── API ──────────────────────────────────────────────────── */
  async function callGM(messages) {
    if (location.search.indexOf("mock=1") > -1) return mockGM(messages);
    var k = getKey();
    if (!k) throw new Error("No API key set.");
    var res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json", "x-api-key": k,
        "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 900, system: SYSTEM, messages: messages })
    });
    if (!res.ok) { var e = {}; try { e = await res.json(); } catch (x) {} throw new Error((e.error && e.error.message) || ("API error " + res.status)); }
    var data = await res.json();
    return (data.content && data.content[0] && data.content[0].text) || "";
  }

  function mockGM() {
    return Promise.resolve(JSON.stringify({
      narration: "Rain comes off the ridge like a blade. Below, the Eastern Road bends through smoke that should not be there. Kael's hand finds the cold of his hilt. Somewhere down the slope, men are dying badly, and the field has not yet noticed him.\n\nThe Surge stirs at the edge of him — that old, narrowing hunger. He has not called it yet.",
      delta: {}, location: "Ridge Road",
      actions: ["Reach for the Surge and descend", "Read the field before moving", "Skirt the smoke toward the river", "Call out to the men below"]
    }));
  }

  function parseGM(text) {
    try { return JSON.parse(text); } catch (e) {}
    var m = text.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch (e) {} }
    return { narration: text || "The Game Master pauses, the thread lost. Try again.", actions: ["Continue"] };
  }

  /* ── Turn loop ────────────────────────────────────────────── */
  async function takeTurn(playerText) {
    if (busy) return;
    busy = true;
    setActions([]);
    $("gmText").innerHTML = '<p class="thinking">The Game Master considers…</p>';
    var tag = " [State — HP " + state.hp + "/" + state.hpMax + ", Surge " + state.surge + "/" + state.surgeMax + ", Hollow " + state.hollow + "/10, Location: " + state.location + "]";
    history.push({ role: "user", content: playerText + tag });
    if (history.length > 24) history = history.slice(-24);
    var obj;
    try { obj = parseGM(await callGM(history)); }
    catch (err) {
      $("gmText").innerHTML = '<p>The connection to the table is lost: ' + err.message + "</p>";
      if (/key/i.test(err.message)) showKeyModal();
      busy = false; return;
    }
    history.push({ role: "assistant", content: JSON.stringify(obj) });
    applyTurn(obj);
    busy = false;
    save();
  }

  function applyTurn(obj) {
    if (obj.delta) {
      if (typeof obj.delta.hp === "number") state.hp = clampN(state.hp + obj.delta.hp, 0, state.hpMax);
      if (typeof obj.delta.surge === "number") state.surge = clampN(state.surge + obj.delta.surge, 0, state.surgeMax);
      if (typeof obj.delta.hollow === "number") state.hollow = clampN(state.hollow + obj.delta.hollow, 0, 10);
    }
    if (obj.location) state.location = obj.location;
    $("gmTitle").textContent = state.location || "The Marches";
    $("gmText").innerHTML = String(obj.narration || "").split("\n\n").map(function (p) { return "<p>" + p + "</p>"; }).join("");
    renderDice(obj.dice);
    renderMeters();
    var p = locToPos(state.location); var tk = $("tokKael"); tk.style.left = p[0] + "%"; tk.style.top = p[1] + "%";
    // ending checks
    if (state.hollow >= 10) return ending("The Hollow has taken him. The account closes.");
    if (state.hp <= 0) return ending("Kael falls on the road. The Marches keep no record of it.");
    setActions(Array.isArray(obj.actions) && obj.actions.length ? obj.actions : ["Press on"]);
  }

  function renderDice(d) {
    var box = $("diceTray");
    if (!d) { box.style.display = "none"; box.innerHTML = ""; return; }
    var ok = (d.outcome || "").toLowerCase().indexOf("succ") > -1;
    box.style.display = "";
    box.innerHTML = '<span class="die">' + (d.result != null ? d.result : "?") + '</span>' +
      '<span class="die-meta">d20 vs ' + (d.target != null ? d.target : "?") + ' · <b class="' + (ok ? "succ" : "fail") + '">' + (ok ? "success" : "failure") + "</b></span>";
  }

  function renderMeters() {
    function bar(name, v, max, cls) {
      var pct = Math.round((v / max) * 100);
      return '<div class="meter ' + cls + '"><div class="m-top"><span>' + name + "</span><b>" + v + "/" + max + '</b></div><div class="m-track"><div class="m-fill" style="width:' + pct + '%"></div></div></div>';
    }
    var h = state.hollow, pips = "";
    for (var i = 1; i <= 10; i++) pips += '<span class="pip' + (i <= h ? " on" : "") + (i >= 7 ? " warn" : "") + '"></span>';
    var cue = h >= 10 ? "the account closes" : h >= 7 ? "it shows now" : "held";
    $("kaelStats").innerHTML =
      bar("Health", state.hp, state.hpMax, "hp") +
      bar("Surge", state.surge, state.surgeMax, "surge") +
      '<div class="meter hollow"><div class="m-top"><span>The Hollow</span><b>' + h + '/10</b></div><div class="hm-pips">' + pips + '</div><div class="hm-cue">' + cue + "</div></div>";
  }

  function setActions(list) {
    var ab = $("actions"); ab.innerHTML = "";
    (list || []).forEach(function (label) {
      var b = document.createElement("button"); b.className = "abtn";
      b.innerHTML = '<span class="abtn-label">' + label + "</span>";
      b.addEventListener("click", function () { takeTurn(label); });
      ab.appendChild(b);
    });
  }

  function ending(line) {
    $("completeAccount").innerHTML = "<p>" + line + "</p>";
    $("completePortrait").innerHTML =
      "<p>Health " + state.hp + "/" + state.hpMax + " · Surge " + state.surge + "/" + state.surgeMax + " · Hollow " + state.hollow + "/10.</p>" +
      "<p>" + (state.hollow >= 7 ? "He spent his power freely, and it spent him." : "He found the power, and held some part of himself back from it.") + "</p>";
    $("hud").style.display = "none"; $("complete").style.display = ""; wipe();
  }

  /* ── Boot / shell wiring ──────────────────────────────────── */
  function startGame(resume) {
    var sv = resume && load();
    state = (sv && sv.state) || freshState();
    history = (sv && sv.history) || [];
    $("cover").style.display = "none"; $("complete").style.display = "none"; $("hud").style.display = "";
    renderMeters();
    var p = locToPos(state.location); var tk = $("tokKael"); tk.style.left = p[0] + "%"; tk.style.top = p[1] + "%";
    if (history.length) { applyTurn(parseGM(history[history.length - 1].content)); }
    else { takeTurn("Begin. Kael stands on the Ridge Road above the Eastern Marches at dusk, the Surge stirring in him for the first time. Open the world."); }
  }

  function showKeyModal() { $("keyModal").style.display = ""; }
  function hideKeyModal() { $("keyModal").style.display = "none"; }

  function boot() {
    var mock = location.search.indexOf("mock=1") > -1;
    if (load()) { $("continueBtn").style.display = ""; $("continueBtn").addEventListener("click", function () { startGame(true); }); }
    $("beginBtn").addEventListener("click", function () {
      if (!mock && !getKey()) { showKeyModal(); return; }
      wipe(); startGame(false);
    });
    $("keySave").addEventListener("click", function () { var v = $("keyInput").value; if (v) { setKey(v); hideKeyModal(); wipe(); startGame(false); } });
    $("keyMock").addEventListener("click", function () { hideKeyModal(); location.search = "?mock=1"; });
    $("newBtn").addEventListener("click", function () { wipe(); location.search = mock ? "?mock=1" : ""; });
    $("restartBtn").addEventListener("click", function () { wipe(); location.search = mock ? "?mock=1" : ""; });
    $("surgeBtn").addEventListener("click", function () { takeTurn("Kael reaches for the Surge — lets it rise and uses it, now, on whatever is before him."); });
    $("sendBtn").addEventListener("click", sendFree);
    $("freeInput").addEventListener("keydown", function (e) { if (e.key === "Enter") sendFree(); });
    $("keyBtn") && $("keyBtn").addEventListener("click", showKeyModal);
  }
  function sendFree() { var v = $("freeInput").value.trim(); if (v) { $("freeInput").value = ""; takeTurn(v); } }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
