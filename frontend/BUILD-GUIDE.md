# Note Flow — Build & Design Guide

Note Flow is a minimal, session-based notes app built with TanStack Start, React 19, TypeScript, and Tailwind CSS v4. This guide explains how to run, build, and understand the project — and how the white-and-gray "salt and pepper" design system works.

---

## 1. Prerequisites

- **Node.js 20+** (install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) if needed)
- **npm** (bundled with Node) — or [Bun](https://bun.sh) if you prefer it; the repo ships a `bun.lock`

Check your setup:

```sh
node -v   # should print v20 or newer
npm -v
```

## 2. Run the app locally

```sh
unzip noteflow-source.zip
cd noteflow-source
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:8080` or `http://localhost:5173`).

## 3. Build for production

```sh
npm run build      # production build (output in dist/)
npm run preview    # serve the built app locally
```

Other useful scripts:

| Command         | What it does                     |
| --------------- | -------------------------------- |
| `npm run dev`   | Start the dev server with HMR    |
| `npm run build` | Production build                 |
| `npm run test`  | Run the test suite (Vitest)      |
| `npm run lint`  | Lint with ESLint + Prettier      |
| `npm run format`| Auto-format the codebase         |

## 3a. Connect to the Note Flow API

The frontend defaults to `http://localhost:8000`. For a local setup, copy `.env.example` to `.env` in the frontend directory:

```sh
cp .env.example .env
```

Set `VITE_API_BASE_URL` to the public base URL of the FastAPI service if it runs elsewhere. This variable is exposed to browser code, so it must contain only the API URL, never secrets. The backend must allow the frontend's development origin with CORS; the current backend application does not configure CORS.

## 4. Project structure

```
noteflow-source/
├── src/
│   ├── routes/                 # TanStack Router file-based routes
│   │   ├── __root.tsx          # Root layout + global providers + <Toaster/>
│   │   ├── index.tsx           # Main notes screen ("/")
│   │   ├── login.tsx           # Sign-in page
│   │   └── register.tsx        # Sign-up page
│   ├── features/notes/         # The notes feature module
│   │   ├── api.ts              # FastAPI client
│   │   ├── auth.tsx            # Session token context
│   │   ├── store.tsx           # Notes state provider, shared via root layout
│   │   ├── dashboard.tsx       # Notes list / editor UI
│   │   └── auth-form.tsx       # Shared login/register form
│   ├── components/ui/          # shadcn-style UI primitives (button, dialog, ...)
│   ├── styles.css              # Design tokens & Tailwind theme (see §5)
│   ├── router.tsx              # Router bootstrap
│   └── start.ts                # Client/server start wiring
├── public/                     # Static files (favicon, robots.txt)
├── package.json
├── vite.config.ts              # Vite + Tailwind + router plugin config
└── tsconfig.json
```

Key architectural notes:

- **State lives in the feature module.** API access, authentication, and note state are in `src/features/notes/`, provided by the root layout. The access token is stored for the browser session; notes are loaded from the FastAPI service.
- **Routes are files.** TanStack Router generates `src/routeTree.gen.ts` automatically — never edit that file.
- **Colors are semantic tokens.** Components never hardcode hex values; they use utilities like `bg-background`, `text-foreground`, `border-border` (see §5).

## 5. The design system (white & gray "salt and pepper" palette)

All colors are defined once in `src/styles.css` as CSS custom properties in oklch, then mapped to Tailwind utilities through the `@theme inline` block. To change the whole look, edit only the `:root` (light) and `.dark` values there.

The palette:

| Token               | Hex (approx.) | Usage                              |
| ------------------- | ------------- | ---------------------------------- |
| Background / Card   | `#FFFFFF`     | Page and card surfaces             |
| Muted               | `#F4F4F4`     | Subtle surface fills               |
| Accent              | `#F1F1F1`     | Hover highlights                   |
| Secondary / Border  | `#D4D4D4`     | Secondary buttons, borders         |
| Muted foreground    | `#B3B3B3`     | Placeholder & secondary text       |
| Foreground/Primary  | `#2B2B2B`     | Text, primary buttons, emphasis    |

Rules baked into the design:

1. Every interface color must go through a semantic token (`bg-primary`, `text-muted-foreground`, …) — never a raw `bg-[#...]` or `text-white`.
2. All token values use oklch format (e.g. `--primary: oklch(0.289 0 0)`).
3. To add a new semantic color: add it to `:root` and `.dark`, then register it in `@theme inline` as `--color-<name>: var(--<name>)`.
4. Corner radius is token-driven via `--radius` (`0.5rem`), producing `rounded-sm` through `rounded-4xl`.

## 6. Tests

The project ships with Vitest tests (`src/features/notes/api.test.ts`, `src/test/app-routing.test.tsx`):

```sh
npm run test
```

## 7. Customizing

- **Palette:** edit the oklch values in `src/styles.css` (§5).
- **Notes behavior:** `src/features/notes/api.ts` (API calls) and `store.tsx` (state). If you change the API contract integration, update the tests in `api.test.ts`.
- **Pages:** add files under `src/routes/` — the route tree regenerates automatically.

## 8. Deploying

The app is a standard Vite build. The output in `dist/` is a static bundle plus server-rendered entry, deployable to any Node host that runs `npm run build && npm run preview`, or to a Vite-compatible host. (The original project targets Cloudflare Workers via its Vite config.)
