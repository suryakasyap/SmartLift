# SmartLift

A local-first workout tracker that runs entirely in your browser. Plan your
training week, log sets while you're at the gym, and watch your streak and
personal bests grow — no account, no server, no data leaving your device.

SmartLift is built as a mobile-first PWA with a dark UI that's easy on the
eyes in a gym environment.

## What it does

**Planning.** Workouts can be scheduled on fixed week days (e.g. Monday and
Friday) or on a spacing rhythm ("every 2 days"). Optional reminders support
both 12h and 24h time formats, and routines can be set to cycle.

**Logging.** Start the day's session from the home screen and log your sets
as you go. Rep-based exercises track reps and weight; time-based exercises
(planks, holds, cardio) use an h/m/s counter instead. The first set can be
marked as a warm-up, and sets can be added or removed mid-session.

**Progress.** The home screen shows a monthly calendar of planned and
completed sessions plus an animated streak counter that forgives rest days
but breaks on missed training days. The history tab keeps a card per logged
session, and the stats tab charts your best weight or reps per session
against your target.

**Customisation.** Pick an accent colour for the app (and per workout or
exercise), switch between metric and imperial units, choose your week start
day, and tell the app which equipment you own so exercise creation only
offers what's actually available to you.

## Tech stack

- React 19 + TypeScript, built with Vite
- Tailwind CSS for styling, with the user's accent colour exposed as a CSS
  custom property (`--accent`) so theming works through utility classes
- Zustand for app state (persisted to localStorage where it matters)
- Dexie (IndexedDB) for workouts, exercises and session logs
- Framer Motion for sheet and toggle animations
- React Router (hash-based, so static hosting just works)

## Getting started

You'll need Node.js 18 or newer.

```bash
git clone https://github.com/suryakasyap/SmartLift.git
cd SmartLift
npm install
npm run dev
```

Other scripts:

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev:host`| Dev server reachable from your phone  |
| `npm run build`   | Type-check and build for production   |
| `npm run preview` | Serve the production build locally    |
| `npm run lint`    | Run ESLint                            |
| `npm run deploy`  | Build and publish to GitHub Pages     |

## Project structure

```
src/
├── components/
│   ├── layout/      App shell: bottom nav and global sheets
│   ├── ui/          Reusable primitives (Button, Toggle, BottomSheet, ...)
│   ├── workout/     Workout/exercise forms, calendar, planning sheets
│   ├── history/     Session history cards
│   └── stats/       Stat cards and the progress chart
├── pages/           Route-level screens
├── store/           Zustand stores (theme, user, equipment, drafts, ...)
├── db/              Dexie schema and record types
├── lib/             Pure helpers: scheduling, dates, units, persistence
├── hooks/           Shared hooks (press-and-hold, count-up, scroll lock)
└── constants/       Design tokens, week days, muscle groups, equipment
```

A few decisions worth knowing about:

- **Everything is local.** All data lives in IndexedDB and localStorage.
  Clearing site data (or the "Clear all data" button in Settings) wipes it.
- **Logs are snapshots.** A session log stores the workout name, exercise
  names and the unit system at the time of logging, so your history stays
  intact even if you rename or delete the workout later.
- **HashRouter on purpose.** It keeps deep links working on GitHub Pages
  without any server-side rewrite rules.

## Deploying

The project is preconfigured for GitHub Pages under the `/SmartLift/` base
path (see `vite.config.ts`). After pushing the repo to GitHub:

```bash
npm run deploy
```

Then point **Settings → Pages** at the `gh-pages` branch.

## Contributing

Issues and pull requests are welcome. If you're planning a bigger change,
open an issue first so we can talk it through.

## License

MIT
