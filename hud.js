/* ════════════════════════════════════════════════════════════
   The Unquiet Marches — HUD engine (keyless)
   Drives play-hud.html off data/campaigns/noise-of-purpose.json.
   Authored prose + hidden d20. No API key, no backend.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var PATH = "data/campaigns/noise-of-purpose.json";
  var SAVE = "um.hud.save.v1";
  var STATS = ["force", "restraint", "witness", "hollow", "reputation"];

  // scene -> left-card portrait (null = hide the card)
  var NPC = {
    eastern_road:"raider-captain", ridge:"raider-captain", civilians:"raider-captain",
    command:"raider-captain", surge:"raider-captain", aftermath:"raider-captain",
    caeden_summons:"caeden", reshen_road:"caeden", garrison_truth:"edric",
    sera_marches:"sera", sera_hollow_night:"sera", sera_departure:"sera",
    ashen_crossing_market:"mael", ashen_alley:"mael", ashen_standing:"mael",
    crossroads_davan:"davan", road_north:null, stone_chamber_found:null,
    calla_petition:null, edric_second:"edric", fen_named:"edric",
    caeden_dead:null, village_smoke:null, bucket_chain:null, chamber_return:null, the_account:null
  };
  var NPCNAME = { "raider-captain":"RAIDER CAPTAIN", caeden:"LORD CAEDEN", edric:"EDRIC VALE",
    sera:"SERA", mael:"MAEL", davan:"DAVAN" };
  var NPCROLE = { "raider-captain":"THREAT · MOUNTED", caeden:"THE COMMISSION", edric:"THE CARTOGRAPHER",
    sera:"THE HOUSEHOLD", mael:"THE INTERMEDIARY", davan:"THE YOUNG SOLDIER" };
  // scene -> [x%, y%] of Kael's token on the real map
  var POS = {
    eastern_road:[56,44], ridge:[57,43], civilians:[55,46], command:[58,42], surge:[59,42], aftermath:[56,45],
    caeden_summons:[38,30], reshen_road:[62,66], garrison_truth:[60,48],
    sera_marches:[48,40], sera_hollow_night:[48,40], sera_departure:[46,42],
    ashen_crossing_market:[50,56], ashen_alley:[51,57], ashen_standing:[50,56],
    crossroads_davan:[58,22], road_north:[66,14], stone_chamber_found:[72,11],
    calla_petition:[72,11], edric_second:[72,11], fen_named:[72,11],
    caeden_dead:[72,11], village_smoke:[69,15], bucket_chain:[68,16], chamber_return:[72,11], the_account:[72,11]
  };
  var ICONSTAT = { force:1, restraint:1, witness:1, reputation:1 };

  var data, state, $ = function (id) { return document.getElementById(id); };
  function clamp(v) { return Math.max(0, Math.min(10, v)); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function fresh() { return { scene: data.startingScene, moral: Object.assign({}, data.moralState),
    obj: Object.assign({}, data.objectives), journal: [] }; }
  function save() { try { localStorage.setItem(SAVE, JSON.stringify(state)); } catch (e) {} }
  function load() { try { var r = localStorage.getItem(SAVE); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function wipe() { try { localStorage.removeItem(SAVE); } catch (e) {} }

  function start(resume) {
    state = (resume && load()) || fresh();
    $("cover").style.display = "none";
    $("hud").style.display = "";
    $("complete").style.display = "none";
    render();
  }

  function render() {
    var sc = data.scenes[state.scene];
    if (!sc) return;
    $("gmTitle").textContent = sc.title;
    $("gmText").innerHTML = sc.narration.map(function (p) { return "<p>" + p + "</p>"; }).join("");
    var ab = $("actions"); ab.innerHTML = "";
    sc.choices.forEach(function (ch) {
      var stat = ch.roll && ch.roll.stat;
      var icon = (stat && ICONSTAT[stat]) ? stat : "purpose";
      var b = document.createElement("button");
      b.className = "abtn";
      b.innerHTML = '<span class="rune"><img src="assets/icons/' + icon + '.png" alt=""></span> <span>' + ch.label + "</span>";
      b.addEventListener("click", function () { choose(ch); });
      ab.appendChild(b);
    });
    renderStats();
    renderNpc();
    var p = POS[state.scene] || [56, 44];
    var tk = $("tokKael"); tk.style.left = p[0] + "%"; tk.style.top = p[1] + "%";
    save();
  }

  function renderStats() {
    $("kaelStats").innerHTML = STATS.map(function (k) {
      return '<div class="stat' + (k === "hollow" ? " hollow" : "") + '"><span>' + cap(k) + "</span><b>" + state.moral[k] + "</b></div>";
    }).join("");
  }

  function renderNpc() {
    var who = NPC[state.scene], card = $("npcCard");
    if (!who) { card.style.visibility = "hidden"; return; }
    card.style.visibility = "visible";
    $("npcImg").src = "assets/cards/" + who + ".png";
    $("npcPlate").textContent = NPCNAME[who] || "";
    $("npcRole").textContent = NPCROLE[who] || "";
  }

  function choose(ch) {
    if (ch.moral) for (var k in ch.moral) state.moral[k] = clamp((state.moral[k] || 0) + ch.moral[k]);
    if (ch.objectives) for (var o in ch.objectives) state.obj[o] = (state.obj[o] || 0) + ch.objectives[o];
    var out;
    if (ch.roll) { var d = 1 + Math.floor(Math.random() * 20); out = d >= ch.roll.target ? ch.roll.success : ch.roll.failure; }
    else out = ch.result || "";
    if (ch.journal) state.journal.push(ch.journal);
    renderStats();
    var done = ch.journal && /^Session complete/i.test(ch.journal);
    $("gmTitle").textContent = done ? "The account" : "What follows";
    $("gmText").innerHTML = "<p>" + out + "</p>";
    var ab = $("actions"); ab.innerHTML = "";
    var b = document.createElement("button");
    b.className = "abtn continue";
    b.innerHTML = '<span class="rune"><img src="assets/icons/' + (done ? "legacy" : "honour") + '.png" alt=""></span> <span>' + (done ? "Close the account" : "Continue") + " &rsaquo;</span>";
    b.addEventListener("click", function () { if (done) complete(); else { state.scene = ch.nextScene; render(); } });
    ab.appendChild(b);
    save();
  }

  function complete() {
    $("hud").style.display = "none";
    $("completeAccount").innerHTML = state.journal.map(function (j) { return "<p>" + j + "</p>"; }).join("");
    $("completePortrait").innerHTML = buildPortrait();
    $("complete").style.display = "";
    wipe();
  }

  function buildPortrait() {
    var s = state.moral, L = [];
    L.push(s.hollow >= 7 ? "The Hollow had become most of him." :
      s.hollow <= 2 ? "He had kept the Hollow at bay." :
      "The Hollow was present, but not yet the whole of him.");
    L.push(s.restraint >= 6 ? "He had learned to hold the blade in its sheath." :
      "Force still came to him easier than restraint.");
    L.push(s.witness >= 6 ? "He had learned to see, and to write down what he saw." :
      "He saw more than he could yet bring himself to name.");
    L.push(s.reputation >= 6 ? "The name still preceded the man — and he had learned to use it sparingly." :
      "He had begun, slowly, to set the name down.");
    return L.map(function (x) { return "<p>" + x + "</p>"; }).join("");
  }

  fetch(PATH, { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) {
    data = j;
    if (load()) { var c = $("continueBtn"); c.style.display = ""; c.addEventListener("click", function () { start(true); }); }
    $("beginBtn").addEventListener("click", function () { wipe(); start(false); });
    $("newBtn").addEventListener("click", function () { wipe(); location.reload(); });
    $("restartBtn").addEventListener("click", function () { wipe(); location.reload(); });
  }).catch(function (e) {
    $("gmText") && ($("gmText").textContent = "Unable to load the module: " + e.message);
  });
})();
