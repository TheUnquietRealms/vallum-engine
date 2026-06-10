// Vallum GM Engine — Claude AI as live Game Master
// User supplies their own Anthropic key; stored in localStorage, never leaves the browser except to Anthropic's API.

const GM = (() => {
  const KEY_STORE  = 'vallum.anthropic.key';
  const MODEL      = 'claude-opus-4-8';   // upgrade to claude-fable-5 once available via API

  const SYSTEM = `You are the Game Master for Vallum, a solo TTRPG set in the Stormwright Cycle.

The player controls Kael Vorn, Iron Captain of the Eastern Marches. He is extremely capable. He is beginning to understand what capability costs.

World: the Eastern Marches — wet, feudal, contested. Violence is concrete, not glorious. Every victory costs something. The account is never clean. The Surge is real: a heightened operational state where the world narrows and action becomes effortless. The Hollow is what follows: a void that grows wider with each act that feeds the Surge without asking what it is for.

NPC voices — use these when narrating encounters:
- Lord Caeden: measured, deliberate, never raises his voice. Uses words like shelter, sympathy, passage. Never threatens. Offers wine. The danger is that he sounds reasonable.
- Sera: practical, self-possessed, entirely unafraid. Listens without performance. Says hard things clearly, without flinching. She loved the fire. That is the whole of the problem.
- Mael: smooth administrative confidence. Shares culpability through language. "I knew what was necessary. You knew too. You didn't ask."
- Edric the cartographer: small, dry, precise. Discharges obligations he didn't choose. Has run out of methods for living with it quietly.
- Davan: fair-haired, nineteen, honest beyond his years. "Clean. Like a question answered." He is Kael's past, still walking around.
- Calla: from Wrenford. Perhaps forty. Not expecting help — expecting to have tried. Describes situations plainly, without performance.
- Raider Captain: professional, unhurried. Raises his axe in salute. Finds Kael interesting as a problem.
- The Field Itself: the rain doesn't stop. The smoke doesn't clear. Weather is always present.

Core themes: the Surge as seduction, the Hollow as cost, witnessing as a form of moral action, the ledger the world does not balance.

Writing style: terse, literary, present-tense. Short declarative sentences. No purple prose. No words like epic, incredible, legendary, powerful, suddenly. Kael is a man on a road, not a legend narrating himself.

Stay under 140 words total. Narrate only what Kael perceives. Never explain game mechanics. Never use the word "you".`;

  function key()        { try { return localStorage.getItem(KEY_STORE); } catch { return null; } }
  function setKey(k)    { try { localStorage.setItem(KEY_STORE, k.trim()); } catch {} }
  function clearKey()   { try { localStorage.removeItem(KEY_STORE); } catch {} }
  function hasKey()     { return !!key(); }

  async function stream({ userContent, onToken, onDone, onError, systemOverride, maxTokens }) {
    const k = key();
    if (!k) { onError?.('No API key set.'); return; }

    let res;
    try {
      res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': k,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: maxTokens || 350,
          system: systemOverride || SYSTEM,
          stream: true,
          messages: [{ role: 'user', content: userContent }]
        })
      });
    } catch (err) {
      onError?.(err.message);
      return;
    }

    if (!res.ok) {
      try {
        const e = await res.json();
        onError?.(e.error?.message || `API error ${res.status}`);
      } catch {
        onError?.(`API error ${res.status}`);
      }
      return;
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === '[DONE]') continue;
          try {
            const evt = JSON.parse(raw);
            if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
              onToken?.(evt.delta.text);
            }
          } catch { /* malformed event — skip */ }
        }
      }
    } catch (err) {
      onError?.(err.message);
      return;
    }

    onDone?.();
  }

  function choicePrompt(choice, roll, gameState, scene) {
    const { moralState: m, objectives: o } = gameState;
    const rollLine = roll
      ? `Roll result: ${roll.success ? 'SUCCESS' : 'FAILURE'} — "${roll.text}"`
      : `Outcome: "${choice.result || 'The choice is recorded.'}"`;
    const hollowNote = m.hollow >= 7 ? ' [Hollow is dominant — his interior is fraying]'
                     : m.hollow >= 4 ? ' [Hollow is present and growing]' : '';
    const surgeLine = m.force >= 7 ? ' [The Surge is close to the surface]' : '';
    return `Scene: ${scene.title} (${scene.type || ''})
Setting: ${scene.mood || ''}

Kael's inner state — Force ${m.force}, Restraint ${m.restraint}, Witness ${m.witness}, Hollow ${m.hollow}${hollowNote}${surgeLine}, Reputation ${m.reputation}
Account written: ${o.accountLines ?? 0} pages
Field cost — Civilians: ${o.civilians ?? '?'}, Reshen cost: ${o.reshenCost ?? 0}

Choice made: "${choice.label}"
${rollLine}

Narrate the moment this choice resolves. 2–3 short paragraphs. Ground it in the specific detail of the scene. Let the consequences land.`;
  }

  function openScenePrompt(gameState, scene) {
    const { moralState: m } = gameState;
    return `Scene: ${scene.title} (${scene.type})
Setting: ${scene.mood || ''}
Stakes: ${scene.stakes || ''}
Kael's inner state — Force ${m.force}, Restraint ${m.restraint}, Witness ${m.witness}, Hollow ${m.hollow}, Reputation ${m.reputation}

Open this scene as GM. Set the stage. Let the player feel the world before they choose. 2–3 short paragraphs. Do not tell them what to do. Do not name their options. End on the weight of the decision being present.`;
  }

  function askPrompt(query, gameState, scene) {
    const { moralState: m } = gameState;
    return `Scene: ${scene.title}
Setting: ${scene.mood || ''}
Kael's inner state — Force ${m.force}, Restraint ${m.restraint}, Witness ${m.witness}, Hollow ${m.hollow}

Player examines: "${query}"

Respond as GM. 1–2 short paragraphs. Present-tense. This is what Kael perceives.`;
  }

  const STORY_SYSTEM = `You are a literary narrator for The Stormwright Cycle, a dark feudal fantasy series. Write in third person, past tense, in the restrained and morally precise voice of the novels.

The subject is Kael Vorn, Iron Captain of the Eastern Marches — a man of extraordinary capability who is beginning to understand what capability costs.

World: wet, feudal, contested. Violence is concrete, not glorious. Every victory costs something. The Surge is a heightened operational state where the world narrows and action becomes effortless. The Hollow is what follows: a void that grows wider with each act that feeds the Surge without asking what it was for.

You will be given the decisions this Kael made and his final moral state. Write it as a chapter of a novel — not a game summary.

Rules:
- Third person, past tense throughout.
- 450–600 words. Three to four paragraphs. No headers, no lists, no section breaks.
- Do not quote the journal entries directly — weave them into narrative.
- Do not explain numbers. Render moral state as interiority, action, and what he notices.
- Voice: restrained, morally weighted, precise. Short declarative sentences. No purple prose.
- Forbidden words: epic, incredible, legendary, powerful, suddenly, vast, ancient.
- End on the specific weight of where he arrived.`;

  function storyPrompt(journal, moralState, objectives) {
    const m = moralState;
    const o = objectives || {};
    const forceDesc = m.force >= 7 ? "dominant, instinctive" : m.force >= 4 ? "present, reaching" : "held";
    const restraintDesc = m.restraint >= 6 ? "hard-won, costly" : m.restraint >= 3 ? "possible, not instinct" : "thin";
    const witnessDesc = m.witness >= 6 ? "clear, uncomfortable" : m.witness >= 3 ? "partial, growing" : "narrow";
    const hollowDesc = m.hollow >= 7 ? "dominant, fraying" : m.hollow >= 4 ? "present, acknowledged" : "contained";
    const repDesc = m.reputation >= 6 ? "legend, a burden" : m.reputation >= 3 ? "useful, undecided" : "still earning";
    const entries = journal.slice(1).map((e, i) => `${i + 1}. ${e}`).join('\n');
    return `Write the prose account of Kael Vorn's journey.

THE DECISIONS (in order):
${entries}

HIS STATE AT THE END:
Force: ${m.force} — ${forceDesc}
Restraint: ${m.restraint} — ${restraintDesc}
Witness: ${m.witness} — ${witnessDesc}
Hollow: ${m.hollow} — ${hollowDesc}
Reputation: ${m.reputation} — ${repDesc}
Civilians: ${o.civilians ?? '?'}

Write the chapter.`;
  }

  return { key, setKey, clearKey, hasKey, stream, openScenePrompt, choicePrompt, askPrompt, storyPrompt, STORY_SYSTEM };
})();
