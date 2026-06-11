# The Iron Captain — release 0.4.2 (the Neverending Story pass)

Copy the four files over the repo root and push:

  git add index.html app.js ux.css styles.css
  git commit -m "v0.4.2 — reader becomes the story: page-iv rewrite, ride-east zoom, fresh-ink narration"
  git push origin main

What changed since 0.4.1:
- Page iv is no longer a rules dump. It is the Compiler's final note: the
  remaining pages are unwritten, and the story knows the reader is here.
  One italic line carries the only rule you need before play.
- "Ride East" now pulls the reader THROUGH the page — the book zooms past
  the camera as the table fades in (respects prefers-reduced-motion).
- Each new scene's narration arrives like fresh ink (soft blur-in).
- The full rules whisper appears in Your Hand on the first turn only and
  disappears once the first choice resolves (detail lives in the compendium).
- Choice list keeps a minimum height; narration keeps its guaranteed space.
- Save key bumped to v0.4.2.
