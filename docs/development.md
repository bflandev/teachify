# Development

This document captures the local development setup for Learn Wren. For product specifications, see `docs/epics/`. For design specs, see `docs/superpowers/specs/`.

## Prerequisites

- Node.js 22 (LTS). Pinned in `.nvmrc`. Install via `nvm install 22 && nvm use 22` or Volta.
- pnpm. Activated via Corepack: `corepack enable && corepack prepare pnpm@latest --activate`.

## Install

```bash
pnpm install
```

## Scripts

All scripts run from the repo root.

| Command | Description |
| :--- | :--- |
| `pnpm start` | Run `web` (port 4200) and `api` (port 3333) in parallel. |
| `pnpm start:web` | Run only the Angular SPA. |
| `pnpm start:api` | Run only the NestJS API. |
| `pnpm build` | Build all buildable projects to `dist/`. |
| `pnpm test` | Run all unit tests (Vitest). |
| `pnpm lint` | Run ESLint across all projects. |
| `pnpm e2e` | Run all Playwright E2E suites. |
| `pnpm typecheck` | Run `tsc --noEmit` for all projects. |
| `pnpm affected` | Run lint + test + build + typecheck only for projects affected by the current branch's changes. |

## Ports

| Service | Port |
| :--- | :--- |
| Angular dev server (`web`) | 4200 |
| NestJS API (`api`) | 3333 |

## What is and is not wired up

The current state is "the monorepo exists and both apps run." Specifically:

- The Angular app renders a single placeholder hero at `/`.
- The NestJS app exposes a single `GET /api/health` endpoint.
- Both apps import types from `@learnwren/shared-data-models`.

**Firebase is intentionally not wired yet.** That is the subject of the next design spec. There is no Firestore connection, no Firebase Authentication, no Cloud Functions deploy target, and no emulator suite.
