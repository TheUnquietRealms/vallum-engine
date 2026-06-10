# The Iron Captain — release 0.4.0

Deploy to zencloudau/vallum-engine (GitHub Pages serves from main):

1. Copy these four files over the repo root:
   index.html, app.js, ux.css, styles.css
   (gm-engine.js, assets/, and data/ are unchanged — leave them as they are.)

2. Commit and push:
   git add index.html app.js ux.css styles.css
   git commit -m "v0.4.0 — The Iron Captain: book intro, game-room table, map overlay, invites"
   git push origin main

3. Wait ~1 minute for Pages to rebuild, then smoke-test in a private window:
   cover -> open book -> page back -> Ride East -> one choice -> Expand map -> reload -> Resume.

Notes:
- Save key bumped to v0.4.0: existing visitors start fresh at launch.
- The fonts (Marcellus, EB Garamond) load from Google Fonts with Georgia fallback.
- Campaign JSON is fetched from data/campaigns/noise-of-purpose.json as before.
