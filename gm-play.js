/* ════════════════════════════════════════════════════════════
   The Unquiet Marches — AI Game Master, the Open Table
   The GM's brain is canon/book-one-canon-pack.json (the Canon
   Pack). You play your OWN character; the world is the only edge.
   HP · Surge (power) · Hollow (corruption) · visible d20.
   Browser, direct to Anthropic, the player's own key (demo: ?mock=1).
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var KEY_STORE = "vallum.anthropic.key";
  var SAVE = "um.gm.save.v3";
  var PACK_PATH = "canon/public-runtime-bundle.json";
  var PROMPT_PATH = "canon/ai-gm-system-prompt.md";
  var MODEL = "claude-opus-4-8";   // route cheaper models for routine turns once hosted

  var WRAPPER = [
    "You are the Game Master of a solo tabletop RPG. ONE player, playing their OWN ORIGINAL character — NOT Kael Vorn (Kael and the rest are canon NPCs in the world). You are their Dungeon Master: reactive, fair, vivid, never railroading.",
    "Run OPEN play inside the world in YOUR CANON below. The world is the only boundary — never a fixed plot. Obey the canon's tone, mechanics (HP, Surge, Hollow, d20), gmRules and forbiddenContradictions exactly. Keep the hidden tags hidden (never show them). Make the Surge thrilling; charge the Hollow as its price.",
    "Never answer an unusual action with 'you cannot, it is not in the story' — answer with probability, resistance and consequence. Do not reduce every turn to four menu options.",
    "The first turn: briefly establish the player's original character (let them say who they are and why they have come to the Marches), then open the first situation.",
    "",
    "OUTPUT — return ONLY valid JSON, no markdown fences, no prose outside it:",
    '{ "narration": "2-4 short paragraphs, present tense, third person about the character, never the word \\"you\\"", "dice": {"die":"d20","target":13,"result":16,"outcome":"success"} (ONLY if a roll happened), "delta": {"hp":-3,"surge":-1,"hollow":1} (changed fields only), "location": "place name when it changes", "time": "when it advances", "discovered": ["a fact the world now holds"], "relationship": {"who":"name","change":"+trust / -trust / etc."}, "faction": {"name":"...","change":"..."}, "hooks": ["an unresolved thread"], "actions": ["short action", "short action", "short action"] }',
    "Every field except narration and actions is optional. JSON only."
  ].join("\n");

  var FALLBACK_CANON = '{"meta":{"world":"The Unquiet Marches"},"note":"canon bundle failed to load — run on Book One public tone: dark feudal fantasy, terse present tense, HP/Surge/Hollow/d20, the world remembers."}';
  var SYSTEM = WRAPPER, PACK = null, PROMPT_TEXT = null;
  function buildSystem() { SYSTEM = (PROMPT_TEXT || WRAPPER) + "\n\nCANON BUNDLE — your source of truth; treat C0 as immutable, C3 as rumour, never reveal restricted material:\n" + (PACK ? JSON.stringify(PACK) : FALLBACK_CANON); }

  var REGIONS = [
    ["greywatch",72,8],["north",55,12],["grey pike",76,26],["harren",92,40],["pass",88,32],
    ["caeden",38,24],["heartland",20,40],["veldra",8,48],["caer ashe",22,55],["stoneholt",14,66],
    ["vale",46,32],["stonebridge",47,42],["marrow",47,52],["ashen",52,60],["marden",68,42],
    ["ridge",57,43],["marches",58,46],["reshen",64,66],["hollowmere",62,70],["brackenhurst",63,69],
    ["ravenspool",60,72],["mill",66,68],["river",50,30]
  ];
  function locToPos(s) { s = (s || "").toLowerCase(); for (var i = 0; i < REGIONS.length; i++) if (s.indexOf(REGIONS[i][0]) > -1) return [REGIONS[i][1], REGIONS[i][2]]; return [50, 45]; }

  var state, history, busy = false, $ = function (id) { return document.getElementById(id); };
  function clampN(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function getKey() { try { return localStorage.getItem(KEY_STORE); } catch (e) { return null; } }
  function setKey(k) { try { localStorage.setItem(KEY_STORE, String(k).replace(/\s+/g, "")); return !!getKey(); } catch (e) { return false; } }
  function save() { try { localStorage.setItem(SAVE, JSON.stringify({ state: state, history: history.slice(-16) })); } catch (e) {} }
  function load() { try { var r = localStorage.getItem(SAVE); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function wipe() { try { localStorage.removeItem(SAVE); } catch (e) {} }
  function mechMax(which, dflt) { try { var m = PACK.mechanics; return (which === "hp" ? m.hp.default_max : which === "surge" ? m.surge.maximum : m.hollow.maximum) || dflt; } catch (e) { return dflt; } }
  function freshState() { var hpM = mechMax("hp", 10), suM = mechMax("surge", 6), hoM = mechMax("hollow", 6); return { hp: hpM, hpMax: hpM, surge: Math.min(2, suM), surgeMax: suM, hollow: 0, hollowMax: hoM, location: "The Eastern Marches", world: { time: "dusk", facts: [], hooks: [], rel: {}, fac: {} } }; }

  function isMock() { return location.search.indexOf("mock=1") > -1; }

  async function callGM(messages) {
    if (isMock()) return mockGM();
    var k = getKey(); if (!k) throw new Error("No API key set.");
    var res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": k, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({ model: MODEL, max_tokens: 1000, system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }], messages: messages })
    });
    if (!res.ok) { var e = {}; try { e = await res.json(); } catch (x) {} var er = new Error((e.error && e.error.message) || ("API error " + res.status)); er.status = res.status; throw er; }
    var data = await res.json();
    return (data.content && data.content[0] && data.content[0].text) || "";
  }
  function mockGM() {
    return Promise.resolve(JSON.stringify({
      narration: "Rain comes off the high country in long grey sheets. The road into the Eastern Marches is mud and old stone, and the figure walking it has not yet said who they are or what they want here.\n\nA waystation inn leans against the weather ahead — smoke, a barred door, voices inside that stop when the latch lifts. The Marches do not welcome strangers. They appraise them.",
      location: "The Eastern Marches", time: "dusk",
      hooks: ["Who is the player's character, and why have they come?"],
      actions: ["Give your name and your trade to the room", "Take a corner table and watch", "Ask the keeper for work", "Step back into the rain"]
    }));
  }
  function parseGM(text) {
    try { return JSON.parse(text); } catch (e) {}
    var m = text.match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]); } catch (e) {} }
    return null;
  }

  function worldSummary() {
    var w = state.world, parts = [];
    if (w.facts.length) parts.push("Known: " + w.facts.slice(-6).join("; "));
    if (w.hooks.length) parts.push("Open threads: " + w.hooks.slice(-4).join("; "));
    var rels = Object.keys(w.rel); if (rels.length) parts.push("Relationships: " + rels.slice(-5).map(function (r) { return r + " " + w.rel[r]; }).join(", "));
    return parts.join(" | ");
  }

  function gmError(err) {
    var status = err && err.status, msg = (err && err.message) || "the connection was lost";
    var auth = status === 401 || status === 403 || /\b(api[-_ ]?key|x-api-key|authentication|unauthor)/i.test(msg);
    var billing = status === 402 || /\b(credit|billing|quota|insufficient|balance)/i.test(msg);
    if (auth) {
      showKeyModal("Anthropic rejected this key (" + msg + "). Use an API key from console.anthropic.com → API Keys — not your Claude.ai login — and paste the whole key, starting “sk-ant-”.");
    } else if (billing) {
      showKeyModal("The key works, but the account can't be billed (" + msg + "). Add credit at console.anthropic.com → Billing, then take the table again.");
    } else {
      $("gmText").innerHTML = '<p>The table goes quiet — ' + msg + '.</p>';
      setActions(["Try again"]);
    }
  }

  async function runGM() {
    $("gmText").innerHTML = '<p class="thinking">The Game Master considers…</p>';
    var obj;
    try {
      obj = parseGM(await callGM(history));
      if (!obj || !obj.narration) {  // validator: bad shape → one corrective retry
        history.push({ role: "user", content: "Your last reply was not valid JSON in the required schema. Resend the same turn as a single valid JSON object only." });
        obj = parseGM(await callGM(history));
      }
    } catch (err) { gmError(err); return false; }
    if (!obj || !obj.narration) { $("gmText").innerHTML = "<p>The Game Master lost the thread.</p>"; setActions(["Try again"]); return false; }
    history.push({ role: "assistant", content: JSON.stringify(obj) });
    applyTurn(obj); save(); return true;
  }

  async function takeTurn(playerText) {
    if (busy) return; busy = true; setActions([]);
    var tag = " [State — HP " + state.hp + "/" + state.hpMax + ", Surge " + state.surge + "/" + state.surgeMax + ", Hollow " + state.hollow + "/10, Location " + state.location + ", Time " + state.world.time + ". World memory: " + (worldSummary() || "fresh") + "]";
    history.push({ role: "user", content: playerText + tag });
    if (history.length > 16) history = history.slice(-16);
    await runGM(); busy = false;
  }

  async function retryTurn() {
    if (busy) return; busy = true; setActions([]);
    await runGM(); busy = false;
  }

  function applyTurn(obj) {
    if (obj.delta) {
      if (typeof obj.delta.hp === "number") state.hp = clampN(state.hp + obj.delta.hp, 0, state.hpMax);
      if (typeof obj.delta.surge === "number") state.surge = clampN(state.surge + obj.delta.surge, 0, state.surgeMax);
      if (typeof obj.delta.hollow === "number") state.hollow = clampN(state.hollow + obj.delta.hollow, 0, 10);
    }
    if (obj.location) state.location = obj.location;
    if (obj.time) state.world.time = obj.time;
    if (obj.discovered) [].concat(obj.discovered).forEach(function (f) { if (f && state.world.facts.indexOf(f) < 0) state.world.facts.push(f); });
    if (obj.hooks) [].concat(obj.hooks).forEach(function (h) { if (h && state.world.hooks.indexOf(h) < 0) state.world.hooks.push(h); });
    if (obj.relationship && obj.relationship.who) state.world.rel[obj.relationship.who] = obj.relationship.change || "noted";
    if (obj.faction && obj.faction.name) state.world.fac[obj.faction.name] = obj.faction.change || "noted";
    if (state.world.facts.length > 40) state.world.facts = state.world.facts.slice(-40);
    if (state.world.hooks.length > 20) state.world.hooks = state.world.hooks.slice(-20);

    $("gmTitle").textContent = state.location || "The Marches";
    $("gmText").innerHTML = String(obj.narration || "").split("\n\n").map(function (p) { return "<p>" + p + "</p>"; }).join("");
    renderDice(obj.dice); renderMeters();
    var p = locToPos(state.location); var tk = $("tokKael"); tk.style.left = p[0] + "%"; tk.style.top = p[1] + "%";
    if (state.hollow >= (state.hollowMax || 6)) return ending("The Hollow has taken them. The account closes.");
    if (state.hp <= 0) return ending("They fall on the road. The Marches keep no record of it — but the world remembers what they did to get here.");
    setActions(Array.isArray(obj.actions) && obj.actions.length ? obj.actions : ["Press on"]);
  }

  function renderDice(d) {
    var box = $("diceTray");
    if (!d) { box.style.display = "none"; box.innerHTML = ""; return; }
    var ok = (d.outcome || "").toLowerCase().indexOf("succ") > -1;
    box.style.display = "";
    box.innerHTML = '<span class="die">' + (d.result != null ? d.result : "?") + '</span><span class="die-meta">d20 vs ' + (d.target != null ? d.target : "?") + ' · <b class="' + (ok ? "succ" : "fail") + '">' + (ok ? "success" : "failure") + "</b></span>";
  }
  function renderMeters() {
    function bar(name, v, max, cls) { var pct = Math.round((v / max) * 100); return '<div class="meter ' + cls + '"><div class="m-top"><span>' + name + "</span><b>" + v + "/" + max + '</b></div><div class="m-track"><div class="m-fill" style="width:' + pct + '%"></div></div></div>'; }
    var h = state.hollow, hm = state.hollowMax || 6, warn = hm - 1, pips = "";
    for (var i = 1; i <= hm; i++) pips += '<span class="pip' + (i <= h ? " on" : "") + (i >= warn ? " warn" : "") + '"></span>';
    var cue = h >= hm ? "it breaks him" : h >= warn ? "rest will not ease it" : "held";
    $("kaelStats").innerHTML = bar("Health", state.hp, state.hpMax, "hp") + bar("Surge", state.surge, state.surgeMax, "surge") +
      '<div class="meter hollow"><div class="m-top"><span>The Hollow</span><b>' + h + "/" + hm + '</b></div><div class="hm-pips">' + pips + '</div><div class="hm-cue">' + cue + "</div></div>";
  }
  function setActions(list) {
    var ab = $("actions"); ab.innerHTML = "";
    (list || []).forEach(function (label) { var b = document.createElement("button"); b.className = "abtn"; b.innerHTML = '<span class="abtn-label">' + label + "</span>"; b.addEventListener("click", function () { if (label === "Try again") retryTurn(); else takeTurn(label); }); ab.appendChild(b); });
  }
  function ending(line) {
    $("completeAccount").innerHTML = "<p>" + line + "</p>" + (state.world.hooks.length ? "<p><em>Left unresolved: " + state.world.hooks.slice(-4).join("; ") + ".</em></p>" : "");
    $("completePortrait").innerHTML = "<p>Health " + state.hp + "/" + state.hpMax + " · Surge " + state.surge + "/" + state.surgeMax + " · Hollow " + state.hollow + "/10.</p>" +
      "<p>" + (state.hollow >= 7 ? "They spent their power freely, and it spent them." : "They found the power, and held some part of themselves back from it.") + "</p>";
    $("hud").style.display = "none"; $("complete").style.display = ""; wipe();
  }

  function startGame(resume) {
    var sv = resume && load();
    state = (sv && sv.state) || freshState();
    if (!state.world) state.world = freshState().world;
    if (!state.hollowMax) state.hollowMax = mechMax("hollow", 6);
    history = (sv && sv.history) || [];
    $("cover").style.display = "none"; $("complete").style.display = "none"; $("hud").style.display = "";
    renderMeters(); var p = locToPos(state.location); var tk = $("tokKael"); tk.style.left = p[0] + "%"; tk.style.top = p[1] + "%";
    if (history.length) applyTurn(parseGM(history[history.length - 1].content) || { narration: "The session resumes.", actions: ["Continue"] });
    else takeTurn("Begin. The player is an original newcomer arriving in the Eastern Marches at dusk. Establish who they are (let them declare it), then open the world.");
  }

  function showKeyModal(msg) {
    var inp = $("keyInput"); if (inp && !inp.value) inp.value = getKey() || "";
    var el = $("keyError"); if (el) { if (msg) { el.textContent = msg; el.style.display = ""; } else { el.style.display = "none"; } }
    $("keyModal").style.display = "";
  }
  function hideKeyModal() { $("keyModal").style.display = "none"; }
  function sendFree() { var v = $("freeInput").value.trim(); if (v) { $("freeInput").value = ""; takeTurn(v); } }

  function boot() {
    var mock = isMock();
    Promise.all([
      fetch(PROMPT_PATH, { cache: "no-store" }).then(function (r) { return r.text(); }).catch(function () { return null; }),
      fetch(PACK_PATH, { cache: "no-store" }).then(function (r) { return r.json(); }).catch(function () { return null; })
    ]).then(function (res) { PROMPT_TEXT = res[0]; PACK = res[1]; buildSystem(); });
    if (load()) { $("continueBtn").style.display = ""; $("continueBtn").addEventListener("click", function () { startGame(true); }); }
    $("beginBtn").addEventListener("click", function () { if (!mock && !getKey()) { showKeyModal(); return; } wipe(); startGame(false); });
    $("keySave").addEventListener("click", function () {
      var v = ($("keyInput").value || "").replace(/\s+/g, "");
      if (!v) { showKeyModal("Paste your Anthropic API key to begin."); return; }
      if (v.indexOf("sk-ant-") !== 0) { showKeyModal("That does not look like an Anthropic API key — it should start with “sk-ant-”. Copy the whole key from console.anthropic.com → API Keys."); return; }
      if (!setKey(v)) { showKeyModal("This browser is blocking local storage, so the key can't be saved. Turn off private/incognito mode for this site (or allow storage), then paste again."); return; }
      hideKeyModal(); wipe(); startGame(false);
    });
    $("keyMock").addEventListener("click", function () { hideKeyModal(); location.search = "?mock=1"; });
    $("newBtn").addEventListener("click", function () { wipe(); location.search = mock ? "?mock=1" : ""; });
    $("restartBtn").addEventListener("click", function () { wipe(); location.search = mock ? "?mock=1" : ""; });
    $("surgeBtn").addEventListener("click", function () { takeTurn("The character reaches for the Surge — lets it rise and uses it now, on whatever is before them. Charge the Hollow."); });
    $("sendBtn").addEventListener("click", sendFree);
    $("freeInput").addEventListener("keydown", function (e) { if (e.key === "Enter") sendFree(); });
    if ($("keyBtn")) $("keyBtn").addEventListener("click", showKeyModal);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
