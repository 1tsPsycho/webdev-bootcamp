# FocusFlow

Adaptive study & productivity assistant — frontend-only, local-first. No
server, no database, no accounts: every task, session, and setting lives in
this browser's `localStorage`.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

## Stack

React (Vite) + React Router · Tailwind CSS v4 · GSAP (ScrollTrigger, SplitText)
· Motion · Lenis · a hand-rolled canvas nebula in place of ShaderGradient (see
the comment in `src/components/landing/Nebula.jsx` for why) · vite-plugin-pwa.

## Structure

- `src/lib/` — Focus Score engine, gamification (XP/streaks/achievements),
  storage, CSV/JSON export-import, the daily recap canvas renderer.
- `src/state/AppDataContext.jsx` — the single source of truth (profile,
  tasks, sessions, settings, achievements), persisted per-profile.
- `src/hooks/` — timer engine, session-to-storage wiring, notifications,
  synthesized ambient soundscapes, Lenis/reduced-motion helpers.
- `src/components/` — design-system primitives, the Star Chart, trend
  charts, timer dial, and landing-page visuals.
- `src/pages/` — the seven routes: landing, dashboard, tasks, history,
  analytics, focus, settings.

## Notes / assumptions

- All persistence uses `localStorage` (including session history) rather
  than adding an IndexedDB layer — see `src/lib/storage.js`.
- Ambient soundscapes are synthesized in-browser via Web Audio (filtered
  noise), not shipped audio files — see `src/hooks/useSoundscape.js`.
- The PWA manifest ships one scalable SVG icon rather than a generated PNG
  raster set — see `vite.config.js`.
