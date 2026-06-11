# CareerOS

> [!CAUTION]
> CareerOS is a prototype in active development. It does not have a backend yet, and everything currently runs on local mock data.

CareerOS is an interactive career-mapping product that turns a profile into a living career graph. It helps a user answer a surprisingly hard question:

> Where can I go next, what would it take, and which path is actually worth the move?

The app combines role discovery, pathway planning, market intelligence, profile tracking, onboarding, resume import, and rich transitions into one polished React experience.

## What It Feels Like

CareerOS is not a job board and not a static resume builder. It is closer to a career cockpit:

- A map shows the roles, pivots, promotions, and horizon moves available from the user's current position.
- Node detail pages explain salary, demand, feasibility, prospects, skills, next actions, and employers.
- Pathways rank realistic routes by feasibility, time, salary uplift, and tradeoffs.
- Market Insights reads like a compact intelligence report instead of a generic KPI dashboard.
- The profile page tracks skills, experience, saved roles, priorities, resume updates, and account preferences.
- Onboarding can be completed manually or skipped with a resume import flow.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- GSAP
- Lucide React icons
- Local storage backed app/profile state

## Quick Start

```bash
npm install
npm run dev
```

The dev server runs at:

```text
http://127.0.0.1:3000/CareerOS/
```

Build the app:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts Vite on `127.0.0.1:3000`. |
| `npm run build` | Runs TypeScript checks with `tsc --noEmit`, then creates the Vite production build. |
| `npm run preview` | Serves the built app locally for production-like testing. |

## App Routes

### Product App

| Route | Screen |
| --- | --- |
| `/map` | Career graph map |
| `/node/:id` | Role / node detail |
| `/routing` | Pathway planner |
| `/insights` | Market Insights dashboard |
| `/profile` | User profile |
| `/assessment` | Skill and fit assessment |

### Entry And Public Pages

| Route | Screen |
| --- | --- |
| `/` | Landing page |
| `/onboarding` | Account onboarding |
| `/login` | Login |
| `/trailers` | Career trailers |
| `/pricing` | Pricing |
| `/about` | About |
| `/careers` | Careers |
| `/blog` | Blog |
| `/contact` | Contact |
| `/help-center` | Help center |
| `/methodology` | Methodology |
| `/changelog` | Changelog |
| `/status` | Status |
| `/privacy` | Privacy |
| `/terms` | Terms |
| `/security` | Security |
| `/cookies` | Cookies |
| `/_dev/transition-lab` | Transition animation lab |

## Core Product Surfaces

### Career Map

The map is the user's starting point: a network of career nodes with saved roles, route overlays, and node summaries. It is powered by the mock role graph in `src/lib/mockData.ts`.

### Node Detail

Each node explains what the role means in practical terms:

- Salary and market stats
- Demand trajectory
- Next-hop moves
- Prospects and key skills
- A focused "What to do next" checklist
- Feasibility for the user
- Employers and open-role context

The page intentionally keeps one primary routing CTA in the header so deeper sections can stay focused.

### Routing

Routing compares possible paths to the selected target. It ranks route options by feasibility, time, salary delta, and hop-by-hop effort.

### Market Insights

The insights page compares roles across salary, demand, ranking, and history. The current design uses a restrained report layout with:

- Market snapshot stats
- Demand momentum
- Market move spotlight
- Top salary roles
- Fastest growth
- Demand split
- Tabs for Rankings, Salary, Demand, and History

### Profile

The profile page is focused on career signal rather than account settings:

- Profile signal strip
- Resume re-import
- About and interests
- Current role
- Skills and expertise
- Experience timeline
- Education and certifications
- Priorities as chips
- Target, languages, saved roles, and recent activity

Account and preferences live in the profile avatar dropdown in the navigation bar.

### Onboarding

Onboarding can run as a guided story or a resume-assisted shortcut. A user can type their name, import a resume, skip background/skills/recent-role steps, and continue with priorities and account creation.

## Hooks

The app uses a small set of shared hooks for responsive behavior, motion preferences, scroll/reveal effects, loading states, and animated stats.

It also uses simple context hooks for theme, profile data, saved roles, and toast messages. These are all local to the frontend prototype and are not connected to a backend.

## State Model

CareerOS currently runs without a backend. State is intentionally local, mock-based, and inspectable:

- `src/lib/mockData.ts` provides career nodes, edges, routes, market data, assessment options, employers, and helper functions.
- `src/lib/appStore.tsx` persists saved roles, recent roles, and routing target.
- `src/lib/profile.tsx` persists editable profile fields and resume-imported static profile overrides.
- Resume import is deterministic and local. It infers skills, years, and profile hints from file text or filename, then updates local profile state.

This makes the app ideal for prototyping product flows before introducing APIs, authentication, databases, real resume parsing, or live market data.

## Design Principles

- Build the real tool, not a marketing placeholder.
- Keep dashboards analytical, not generic.
- Use color as meaning, not decoration.
- Avoid repeating the same CTA in multiple sections.
- Prefer compact controls and clear hierarchy over big explanatory cards.
- Let profile pages show career signal; move account controls into the avatar menu.
- Respect reduced motion.

## Working With Data

Most product logic starts in `src/lib/mockData.ts`. Useful entities include:

- `NODES`
- role edges
- route builders
- assessment backgrounds, skills, and priorities
- demand metadata
- employer examples
- next actions
- skill info

When adding a new role, update the node data, edges, route logic if needed, and any demand/employer examples that should surface in details and insights.

## Resume Import

Resume import appears in two places:

- Onboarding: a light inline link under the name field lets users skip background, skills, and recent-role steps.
- Profile: a `Re-import resume` button updates skills, years of experience, resume metadata, and profile hints.

The current import system is local and heuristic. A production version would likely replace it with a backend resume extraction service.

## Development Notes

- The app uses `import.meta.env.BASE_URL`, so local URLs are served under `/CareerOS/`.
- Vite may warn that the main bundle is larger than 500 kB. This is currently expected for the prototype and can be addressed later with route-level code splitting.
- Many screens intentionally simulate loading to keep skeleton states visible during development.
- The icon system is centralized in `src/lib/icons.ts`; add new Lucide icons there before using them across the app.

## A Good First Tour

1. Start at `/`.
2. Launch onboarding and try the resume import shortcut.
3. Open `/map` and inspect role nodes.
4. Open a node detail page.
5. Set a target and compare routes in `/routing`.
6. Read `/insights` to compare the market.
7. Re-import a resume on `/profile` and watch the tracked profile signals update.

CareerOS is meant to feel like the moment a vague career question becomes a map.
