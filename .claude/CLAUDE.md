# CareerOS

Career-navigation web app. Signature feature **Traileers™**: an interactive map of jobs/careers/industries as connected **nodes** with transition edges. Built as a React app (not Figma — ignore any Figma instructions).

## Stack
React 19 · Vite 5 (`@/` → `src/`) · Tailwind 3 (`darkMode:'class'`) · TypeScript strict · react-router-dom · lucide-react icons. Fonts: Inter / Plus Jakarta Sans / JetBrains Mono.
Scripts: `npm run dev` (127.0.0.1:3000), `npm run build` (`tsc --noEmit && vite build`).

## Layout
```
src/
  App.tsx            router; wraps app screens in <AppShell> (Landing is standalone)
  styles.css         tailwind + CSS-var design tokens + .glass/.card/.eyebrow/.focus-ring/.text-gradient
  lib/               cn, theme(ThemeProvider/useTheme), hooks, math, icons(registry+getIcon), mockData
  ui/components/      SHARABLE generic primitives — import via barrel '@/ui/components'
  ui/transitions/     full-screen navigation transitions — import via barrel '@/ui/transitions'
  components/         DOMAIN components: MapGraph (SVG pan/zoom graph), NodeSummary, PageHeader
  layout/            AppShell (desktop rail + mobile bottom tabs), nav.ts
  screens/           Landing(/), TraileersMap(/map), NodeDetail(/node/:id), Assessment(/assessment), Routing(/routing), TransitionLab(/_dev/transition-lab)
```
Convention: generic→`ui/components` (export in index.ts), domain→`components`, logic/hooks→`lib`.

## Theming
CSS variables, not per-color dark variants. `styles.css` sets semantic tokens (`--c-canvas/surface/surface-2/line/ink/ink-soft/ink-mute/brand/accent` as raw `R G B`) under `:root` and overrides under `:root.dark`. Tailwind maps them to `bg-surface`,`text-ink`,`border-line/10`,`text-brand` etc. **Prefer these token classes** so dark mode keeps working. Fixed brand hex: navy `#17324d`, teal `#2f7f8f`, wine `#7e3041`, amber `#f2b95e` (also as local `ACCENT_HEX` in files doing raw SVG/inline styles — keep in sync). `<ThemeToggle/>` + `useTheme()` toggle `.dark` on `<html>`, persisted to localStorage.

## Data (`lib/mockData.ts`, all mock/static)
`NODES` on a **1000×680 virtual canvas** (x,y,kind,accent,salary,demand,growth,match,trend,…); `EDGES` (from,to,feasibility,months,kind); `ROUTES` (one recommended); `EMPLOYERS`, `PATTERNS`, `ASSESSMENT`. `CURRENT_NODE_ID='frontend-dev'`, `TARGET_NODE_ID='product-lead'`. Helpers `getNode`, `edgesOf`, `DEMAND_META`.

## Key behaviors
- **Landing keeps the scroll "lerping"** (required): `useScrollLerp(0.12)` = `current += (target-current)*0.12` in a rAF loop → smoothed 0→1 `progress`. Drives the sticky `StoryStage` (`h-[420vh]`): pans the map current→target, draws the recommended route (`pathLength={1}`+`strokeDashoffset`), cross-fades captions (`bandOpacity`). Plus `Reveal`/`useInView` reveals + `useCountUp` stats.
- **Map** = custom SVG (no graph lib), pan/zoom; props `selectedId,onSelect,highlightPath,filterKinds`. Reused on /map and /routing.
- **Skeletons everywhere**: `useSimulatedLoading(ms)` → bool; render `Skeleton*` mirroring real layout. Mobile node detail = bottom sheet via `useMediaQuery('(min-width:1024px)')`.

## Page transitions (`src/ui/transitions`)
Full-screen transitions live in `src/ui/transitions` and share the same contract:
```ts
type TransitionProps = {
  launching: boolean;
  onDone: () => void;
};
```

Current exported transitions:
- `RocketLaunch` (+ reusable `RocketSVG`)
- `PortalWarp`
- `LiquidWipe`
- `ConstellationConnect`
- `PaperPlane`
- `RippleBloom`
- `CloudBloom`
- `ElevatorRise`
- `CompassSpin`

`src/ui/transitions/types.ts` defines `TransitionId`, `TransitionComponent`, and `TransitionEntry`. If adding/removing a transition, update:
1. the component file in `src/ui/transitions`
2. `src/ui/transitions/index.ts`
3. `TransitionId` in `src/ui/transitions/types.ts`
4. the `TRANSITIONS` list in `src/screens/TransitionLab.tsx`

Transition implementation rules:
- Always honor `prefersReducedMotion()` by calling `onDone()` immediately.
- Use `gsap.timeline({ onComplete: onDone })`; kill it in the effect cleanup.
- Set overlays to `autoAlpha: 1` and `pointerEvents: 'auto'` only once the transition starts.
- Prefer soft, career/navigation-themed effects. Avoid harsh shatter/flip/blind effects unless explicitly requested.
- Keep transition names, file names, exported function names, `TransitionId`, and lab labels in sync. Do not leave compatibility names for deleted concepts.

## Conventions
- Use `@/` alias, not deep relative paths.
- No `import React` (automatic JSX runtime); for types use `import type { ReactNode } from 'react'`.
- `prefers-reduced-motion` honored globally + in lerp/count-up.
- After edits run `npm run build` when possible (`tsc --noEmit && vite build`); at minimum run `tsc --noEmit` for type errors.
