# Initial Nx Monorepo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Learn Wren Nx workspace with two scaffolded apps (`web` Angular SPA, `api` NestJS) and one shared-types library (`shared-data-models`), so all later feature specs have a foundation to build on.

**Architecture:** Single integrated Nx monorepo at the repo root. Two `apps/*` projects (`web`, `api`) plus E2E sibling projects, and one `libs/shared-data-models` package consumed by both apps via a TypeScript path mapping. No Firebase wiring yet — that is a follow-up spec.

**Tech Stack:** Nx (latest), pnpm, Node 22 (LTS), Angular (standalone components, SCSS + Tailwind, esbuild builder), NestJS (Express adapter), TypeScript strict, Vitest for unit tests, Playwright for E2E, ESLint (flat config), Prettier.

**Source spec:** `docs/superpowers/specs/2026-04-29-initial-nx-monorepo-design.md`

---

## File Structure Overview

By the end of this plan the repository will contain (existing files unchanged):

```
learnwren/
├── .github/
│   ├── CODEOWNERS                           (existing)
│   └── workflows/
│       └── ci.yml                           (created in Task 17)
├── .nvmrc                                   (created in Task 1)
├── .editorconfig                            (created by nx init)
├── .gitignore                               (created/augmented by nx init)
├── .prettierrc                              (created by nx init)
├── apps/
│   ├── api/                                 (created in Task 5)
│   ├── api-e2e/                             (created in Task 5)
│   ├── web/                                 (created in Task 3)
│   └── web-e2e/                             (created in Task 3)
├── libs/
│   └── shared-data-models/                  (created in Task 7)
├── docs/
│   ├── development.md                       (created in Task 16)
│   ├── epics/                               (existing)
│   ├── superpowers/                         (existing)
│   └── use-cases/                           (existing)
├── eslint.config.mjs                        (created by nx init)
├── nx.json                                  (created by nx init)
├── package.json                             (created by nx init, augmented in Task 13)
├── pnpm-lock.yaml                           (created by pnpm install)
├── pnpm-workspace.yaml                      (created in Task 1)
├── tailwind.config.js                       (created in Task 4)
├── tsconfig.base.json                       (created by nx init, augmented in Task 1)
├── CLAUDE.md                                (existing — but uncommitted; do not modify)
└── README.md                                (existing)
```

**Files created or substantially modified by Nx generators are not enumerated above** — the plan lists the exact generator commands, so the engineer can audit the diff after each generator runs.

---

## Prerequisites

Before starting, verify the engineer's environment:

- **Node.js 22 (LTS)** installed and active. Check: `node --version` → `v22.x.x`. If not, install via `nvm install 22 && nvm use 22` or Volta.
- **pnpm** installed via Corepack. Check: `pnpm --version`. If missing: `corepack enable && corepack prepare pnpm@latest --activate`.
- **git** configured with name + email so commits succeed without warnings.
- Working directory is the repo root: `/Volumes/Artie-Storage/github-repos/learnwren`. All commands assume `pwd` is the repo root unless otherwise stated.
- The git working tree is clean except for the untracked items listed in the spec (`CLAUDE.md`, `docs/.DS_Store`, `docs/superpowers/.DS_Store`, `docs/use-cases/`, `docs/epics/`, `docs/superpowers/specs/2026-03-27-mvp-use-cases-design.md`, `.DS_Store`, `.nx/`). Don't `git add -A` blindly anywhere in this plan; always add specific files.
- The current branch is `main`. Plan commits are committed directly to `main`; if your team uses feature branches, create one before Task 1.

---

## Tasks

### Task 1: Initialize Nx workspace and pnpm config

**Goal:** Run `nx init` in the existing repo, then add the pnpm workspace declaration and Node version pinning. After this task, `nx --version` resolves locally and `pnpm install` runs cleanly.

**Files:**
- Create: `nx.json`, `tsconfig.base.json`, `package.json`, `eslint.config.mjs`, `.prettierrc`, `.editorconfig`, `.gitignore` (all by `nx init`)
- Create: `.nvmrc`
- Create: `pnpm-workspace.yaml`
- Modify: `package.json` (add `packageManager`, `engines.node`)
- Modify: `tsconfig.base.json` (add `noUncheckedIndexedAccess`)

- [ ] **Step 1: Verify environment**

```bash
node --version    # expect v22.x
pnpm --version    # expect 9.x or 10.x
git status        # confirm clean working tree (modulo expected untracked files)
```

- [ ] **Step 2: Run nx init**

```bash
pnpm dlx nx@latest init --interactive=false
```

Expected output: Nx detects this is an empty project (no `package.json` yet — `nx init` will create one), creates `nx.json`, a starter `package.json`, `.gitignore`, and prompts for nothing because of `--interactive=false`. The generated `package.json` will use npm by default; the next steps switch it to pnpm.

If `pnpm install` runs as part of `nx init` and fails, that's fine — Step 4 re-runs it after the pnpm config is in place.

- [ ] **Step 3: Pin pnpm and Node in package.json**

Open `package.json`. After the top-level `"name"` and `"version"` fields, add:

```json
"packageManager": "pnpm@10.0.0",
"engines": {
  "node": ">=22 <23"
}
```

(Use whatever pnpm version `pnpm --version` reported; the literal `pnpm@10.0.0` should be replaced with the real version. The `engines.node` constraint allows any 22.x.)

- [ ] **Step 4: Create `.nvmrc`**

Create `.nvmrc` with content:

```
22
```

- [ ] **Step 5: Create `pnpm-workspace.yaml`**

Create `pnpm-workspace.yaml` with content:

```yaml
packages:
  - apps/*
  - libs/*
```

Also create or update `.npmrc` at the repo root with:

```
node-linker=hoisted
```

This pre-empts the Firebase Functions deploy compatibility concern noted in the spec — Functions tooling expects a flat `node_modules`, not pnpm's symlink layout.

- [ ] **Step 6: Add `noUncheckedIndexedAccess` to `tsconfig.base.json`**

Open `tsconfig.base.json`. Inside `"compilerOptions"`, add (or set if already present):

```json
"strict": true,
"noUncheckedIndexedAccess": true
```

Leave all other options as `nx init` generated them.

- [ ] **Step 7: Install dependencies fresh under pnpm**

```bash
rm -rf node_modules package-lock.json
pnpm install
```

Expected: `pnpm install` succeeds, creates `pnpm-lock.yaml`, `node_modules` is a hoisted layout (not symlinked because of `node-linker=hoisted`).

- [ ] **Step 8: Verify Nx is resolvable**

```bash
pnpm exec nx --version
```

Expected: prints two lines, "Local version" (a version number) and "Global version" (likely "Not found").

- [ ] **Step 9: Commit**

```bash
git add nx.json tsconfig.base.json package.json pnpm-lock.yaml pnpm-workspace.yaml .nvmrc .npmrc eslint.config.mjs .prettierrc .editorconfig .gitignore
git commit -m "chore: initialize Nx workspace with pnpm and Node 22"
```

(If `eslint.config.mjs` or other files weren't generated by `nx init` in your version, omit them from the `git add` — only add what exists.)

---

### Task 2: Add Nx generator plugins

**Goal:** Install the Nx plugins needed to generate Angular, NestJS, JS libraries, Vite/Vitest configs, and Playwright E2E projects.

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`, `nx.json`

- [ ] **Step 1: Add the plugins**

```bash
pnpm exec nx add @nx/angular
pnpm exec nx add @nx/nest
pnpm exec nx add @nx/js
pnpm exec nx add @nx/vite
pnpm exec nx add @nx/playwright
```

Each `nx add` installs the plugin as a devDependency, registers it in `nx.json` under `plugins`, and may auto-detect existing config files (there are none yet, so this is just registration).

Run them sequentially — running them in parallel can cause `pnpm-lock.yaml` write conflicts.

- [ ] **Step 2: Verify the plugins registered**

```bash
pnpm exec nx list
```

Expected: under "Installed plugins" you see `@nx/angular`, `@nx/nest`, `@nx/js`, `@nx/vite`, `@nx/playwright`.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml nx.json
git commit -m "chore: add Nx plugins for angular, nest, js, vite, playwright"
```

---

### Task 3: Generate `apps/web` (Angular SPA)

**Goal:** Generate the Angular application with the exact options from the spec. After this task, `nx serve web` brings up the dev server on `http://localhost:4200`.

**Files:**
- Create: `apps/web/**` (entire app tree, generated)
- Create: `apps/web-e2e/**` (entire E2E tree, generated)

- [ ] **Step 1: Run the generator**

```bash
pnpm exec nx g @nx/angular:application web \
  --directory=apps/web \
  --style=scss \
  --routing=true \
  --standalone=true \
  --ssr=false \
  --bundler=esbuild \
  --unitTestRunner=vitest \
  --e2eTestRunner=playwright \
  --strict=true \
  --skipFormat=false \
  --no-interactive
```

Expected: `apps/web/` and `apps/web-e2e/` are created. Read the command output to confirm no errors.

If the generator complains about any flag (Nx flag names occasionally shift between minor versions), run `pnpm exec nx g @nx/angular:application --help` and adjust. The semantic intent — standalone, scss, routing, no SSR, esbuild, vitest, playwright, strict — must be preserved.

- [ ] **Step 2: Verify the dev server boots**

In one terminal:

```bash
pnpm exec nx serve web
```

Expected: terminal shows "Application bundle generation complete" and "Local: http://localhost:4200/". Open the URL in a browser and confirm the default Nx welcome page renders. Stop the server with `Ctrl-C`.

- [ ] **Step 3: Verify the unit tests pass**

```bash
pnpm exec nx test web
```

Expected: Vitest runs the default generated spec(s) and reports all pass.

- [ ] **Step 4: Verify the lint passes**

```bash
pnpm exec nx lint web
```

Expected: ESLint reports no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web apps/web-e2e package.json pnpm-lock.yaml nx.json tsconfig.base.json
git commit -m "feat(web): scaffold Angular SPA with vitest and playwright"
```

(`nx.json` and `tsconfig.base.json` may have been touched by the generator to register paths. Inspect with `git diff --staged` before committing if uncertain.)

---

### Task 4: Set up Tailwind CSS on `apps/web`

**Goal:** Wire Tailwind into the web app via the official Nx generator and prove a utility class actually applies in the browser.

**Files:**
- Create: `apps/web/tailwind.config.js`, `apps/web/postcss.config.js` (by generator)
- Modify: `apps/web/src/styles.scss` (by generator)
- Modify: `apps/web/src/app/app.component.html` (manually, to add a Tailwind class)
- Modify: `apps/web/src/app/app.component.spec.ts` (to assert the class is on the rendered element)

- [ ] **Step 1: Run the Tailwind generator**

```bash
pnpm exec nx g @nx/angular:setup-tailwind --project=web --no-interactive
```

Expected: creates `apps/web/tailwind.config.js`, adds Tailwind directives to `apps/web/src/styles.scss`, installs `tailwindcss`, `postcss`, and `autoprefixer` as devDependencies.

- [ ] **Step 2: Write a failing test asserting a Tailwind class is on the root element**

Open `apps/web/src/app/app.component.spec.ts`. Replace the file contents with:

```ts
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should render the Learn Wren placeholder hero with Tailwind styling', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const hero: HTMLElement | null = fixture.nativeElement.querySelector('[data-testid="hero"]');
    expect(hero).not.toBeNull();
    expect(hero!.textContent).toContain('Learn Wren');
    expect(hero!.classList.contains('text-3xl')).toBe(true);
  });
});
```

- [ ] **Step 3: Run the test to confirm it fails**

```bash
pnpm exec nx test web
```

Expected: test fails because `app.component.html` does not yet contain a `data-testid="hero"` element.

- [ ] **Step 4: Update the component template**

Open `apps/web/src/app/app.component.html`. Replace the entire contents with:

```html
<main class="min-h-screen flex items-center justify-center bg-slate-50">
  <section data-testid="hero" class="text-3xl font-semibold text-slate-900">
    Learn Wren
  </section>
</main>
```

- [ ] **Step 5: Run the test to confirm it passes**

```bash
pnpm exec nx test web
```

Expected: pass.

- [ ] **Step 6: Manually verify in the browser**

```bash
pnpm exec nx serve web
```

Open `http://localhost:4200`. Expected: the page renders "Learn Wren" centered on a light background with large bold type. If Tailwind classes are not applying, the styles.scss directives or postcss config didn't land — debug by reading the generator output again. Stop the server.

- [ ] **Step 7: Commit**

```bash
git add apps/web tailwind.config.js package.json pnpm-lock.yaml
git commit -m "feat(web): wire Tailwind CSS and render placeholder hero"
```

(If `tailwind.config.js` was created at the repo root rather than `apps/web/`, that's also fine — adjust the `git add`. Some Nx versions place a root config that the per-app config extends.)

---

### Task 5: Generate `apps/api` (NestJS)

**Goal:** Generate the NestJS application. After this task, `nx serve api` starts a Node server on port 3333.

**Files:**
- Create: `apps/api/**` (entire app tree, generated)
- Create: `apps/api-e2e/**` (entire E2E tree, generated)

- [ ] **Step 1: Run the generator**

```bash
pnpm exec nx g @nx/nest:application api \
  --directory=apps/api \
  --unitTestRunner=vitest \
  --e2eTestRunner=playwright \
  --strict=true \
  --linter=eslint \
  --skipFormat=false \
  --no-interactive
```

Expected: `apps/api/` and `apps/api-e2e/` are created.

- [ ] **Step 2: Configure global API prefix and port**

Open `apps/api/src/main.ts`. The generated file already calls `app.setGlobalPrefix('api')` and listens on `process.env.PORT || 3000`. Change the default port to `3333` so it matches the spec.

If the file already says `process.env.PORT || 3333`, leave it alone. Otherwise change it. The relevant line should read:

```ts
const port = process.env.PORT || 3333;
```

Save the file.

- [ ] **Step 3: Verify the dev server boots**

```bash
pnpm exec nx serve api
```

Expected: terminal shows "Listening at http://localhost:3333/api". In a second terminal:

```bash
curl -s http://localhost:3333/api
```

Expected: returns the default response from the generated controller (likely `{"message":"Hello API"}`). Stop the server.

- [ ] **Step 4: Verify lint and tests pass**

```bash
pnpm exec nx lint api
pnpm exec nx test api
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add apps/api apps/api-e2e package.json pnpm-lock.yaml nx.json tsconfig.base.json
git commit -m "feat(api): scaffold NestJS application on port 3333"
```

---

### Task 6: Replace default endpoint with `/api/health` (TDD)

**Goal:** Replace the generated default controller behavior with a single `GET /api/health` endpoint that returns `{ status: 'ok', version: <package version> }`. Driven by a unit test.

**Files:**
- Modify: `apps/api/src/app/app.controller.ts`
- Modify: `apps/api/src/app/app.controller.spec.ts`
- Possibly delete: `apps/api/src/app/app.service.ts` and its spec, if the generator created a service whose only method we are replacing. Check after running the generator — keep them only if they have residual responsibility, otherwise delete.

- [ ] **Step 1: Write the failing test**

Open `apps/api/src/app/app.controller.spec.ts`. Replace the file contents with:

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = moduleRef.get(AppController);
  });

  describe('getHealth', () => {
    it('returns status ok and a non-empty version string', () => {
      const result = controller.getHealth();
      expect(result.status).toBe('ok');
      expect(typeof result.version).toBe('string');
      expect(result.version.length).toBeGreaterThan(0);
    });
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
pnpm exec nx test api
```

Expected: fails because `AppController.getHealth` does not exist (or because the spec still references the old `AppService` import that was just removed from the test).

- [ ] **Step 3: Implement `getHealth()` in the controller**

Open `apps/api/src/app/app.controller.ts`. Replace the file contents with:

```ts
import { Controller, Get } from '@nestjs/common';

interface HealthResponse {
  status: 'ok';
  version: string;
}

@Controller()
export class AppController {
  @Get('health')
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      version: process.env.npm_package_version ?? '0.0.0',
    };
  }
}
```

If `apps/api/src/app/app.module.ts` still imports `AppService` and registers it in `providers`, open it and remove both the import and the providers entry. The module should now register `AppController` only.

If `apps/api/src/app/app.service.ts` and `apps/api/src/app/app.service.spec.ts` exist, delete them — the service has no remaining responsibility:

```bash
rm -f apps/api/src/app/app.service.ts apps/api/src/app/app.service.spec.ts
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
pnpm exec nx test api
```

Expected: pass.

- [ ] **Step 5: Manually verify the endpoint**

```bash
pnpm exec nx serve api
```

In a second terminal:

```bash
curl -s http://localhost:3333/api/health
```

Expected: `{"status":"ok","version":"0.0.0"}` (or whatever your `package.json` version is — the `npm_package_version` env var is set when running through pnpm scripts and Nx executors).

Stop the server.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src
git commit -m "feat(api): add GET /api/health smoke endpoint"
```

---

### Task 7: Generate `libs/shared-data-models`

**Goal:** Generate the shared TypeScript library that both apps will import. The library is types-only — no bundler, no runtime code beyond what the smoke test references.

**Files:**
- Create: `libs/shared-data-models/**` (generated)
- Modify: `tsconfig.base.json` (path mapping added by generator)

- [ ] **Step 1: Run the generator**

```bash
pnpm exec nx g @nx/js:library shared-data-models \
  --directory=libs/shared-data-models \
  --bundler=none \
  --unitTestRunner=vitest \
  --linter=eslint \
  --importPath=@learnwren/shared-data-models \
  --strict=true \
  --skipFormat=false \
  --no-interactive
```

Expected: `libs/shared-data-models/` is created with `src/index.ts`, `src/lib/shared-data-models.ts`, a Vitest config, an ESLint config, and a `tsconfig.lib.json`.

- [ ] **Step 2: Verify the path mapping**

Open `tsconfig.base.json`. Confirm `compilerOptions.paths` contains:

```json
"@learnwren/shared-data-models": ["libs/shared-data-models/src/index.ts"]
```

If the generator wrote a different path (e.g., to a `dist/` location), correct it to point at the source entry. The path map MUST point at source for type-only consumption to work correctly across both Angular and Nest tsconfig boundaries.

- [ ] **Step 3: Delete the placeholder content**

The generator creates `libs/shared-data-models/src/lib/shared-data-models.ts` and an associated spec with a sample `shared-data-models()` function. Delete both — Tasks 8–10 replace them with the real content:

```bash
rm -f libs/shared-data-models/src/lib/shared-data-models.ts libs/shared-data-models/src/lib/shared-data-models.spec.ts
```

Open `libs/shared-data-models/src/index.ts` and replace its contents with an empty placeholder for now:

```ts
// Entry point for @learnwren/shared-data-models. Populated by subsequent tasks.
export {};
```

- [ ] **Step 4: Verify lint passes**

```bash
pnpm exec nx lint shared-data-models
```

Expected: lint passes. Don't run `nx test` yet — there are no tests in this lib until Task 10 adds the smoke test, and Vitest's no-test exit behavior varies by version.

- [ ] **Step 5: Commit**

```bash
git add libs/shared-data-models tsconfig.base.json package.json pnpm-lock.yaml nx.json
git commit -m "feat(shared-data-models): scaffold types-only library"
```

---

### Task 8: Write `common.ts` type primitives

**Goal:** Add the branded ID and ISO date string primitives that the entity files in Task 9 will use.

**Files:**
- Create: `libs/shared-data-models/src/lib/common.ts`

- [ ] **Step 1: Create `common.ts`**

Create `libs/shared-data-models/src/lib/common.ts` with content:

```ts
/**
 * An ISO 8601 timestamp string (e.g., "2026-04-29T13:00:00.000Z").
 * Branded so plain strings can't be assigned by accident.
 */
export type ISODateString = string & { readonly __brand: 'ISODateString' };

/**
 * A Firestore document ID, branded with the entity name so different entity
 * IDs are not interchangeable at compile time.
 */
export type EntityId<TBrand extends string> = string & { readonly __brand: TBrand };

export type UserId = EntityId<'User'>;
export type CourseId = EntityId<'Course'>;
export type ModuleId = EntityId<'Module'>;
export type LessonId = EntityId<'Lesson'>;
export type EnrollmentId = EntityId<'Enrollment'>;
```

- [ ] **Step 2: Verify it compiles**

```bash
pnpm exec nx typecheck shared-data-models
```

If `typecheck` is not yet defined as a target on this project, run a build instead:

```bash
pnpm exec tsc --noEmit -p libs/shared-data-models/tsconfig.lib.json
```

Expected: no output (success).

- [ ] **Step 3: Commit**

```bash
git add libs/shared-data-models/src/lib/common.ts
git commit -m "feat(shared-data-models): add ISODateString and branded EntityId types"
```

---

### Task 9: Write entity interface files

**Goal:** Add the five entity interfaces (`User`, `Course`, `Module`, `Lesson`, `Enrollment`) per the spec's translation rules.

**Files:**
- Create: `libs/shared-data-models/src/lib/user.ts`
- Create: `libs/shared-data-models/src/lib/course.ts`
- Create: `libs/shared-data-models/src/lib/module.ts`
- Create: `libs/shared-data-models/src/lib/lesson.ts`
- Create: `libs/shared-data-models/src/lib/enrollment.ts`

- [ ] **Step 1: Create `user.ts`**

```ts
import type { ISODateString, UserId } from './common';

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface User {
  id: UserId;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

- [ ] **Step 2: Create `course.ts`**

```ts
import type { CourseId, ISODateString, UserId } from './common';

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Course {
  id: CourseId;
  title: string;
  description: string;
  instructorId: UserId;
  status: CourseStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

- [ ] **Step 3: Create `module.ts`**

```ts
import type { CourseId, ISODateString, ModuleId } from './common';

export interface Module {
  id: ModuleId;
  courseId: CourseId;
  title: string;
  order: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

- [ ] **Step 4: Create `lesson.ts`**

```ts
import type { ISODateString, LessonId, ModuleId } from './common';

export interface Lesson {
  id: LessonId;
  moduleId: ModuleId;
  title: string;
  videoUrl: string;
  order: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

- [ ] **Step 5: Create `enrollment.ts`**

```ts
import type { CourseId, EnrollmentId, ISODateString, LessonId, UserId } from './common';

export interface LessonProgress {
  lessonId: LessonId;
  completedAt: ISODateString | null;
  lastWatchedSeconds: number;
}

export interface Enrollment {
  id: EnrollmentId;
  userId: UserId;
  courseId: CourseId;
  progress: LessonProgress[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

- [ ] **Step 6: Verify all five files compile**

```bash
pnpm exec tsc --noEmit -p libs/shared-data-models/tsconfig.lib.json
```

Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add libs/shared-data-models/src/lib/user.ts libs/shared-data-models/src/lib/course.ts libs/shared-data-models/src/lib/module.ts libs/shared-data-models/src/lib/lesson.ts libs/shared-data-models/src/lib/enrollment.ts
git commit -m "feat(shared-data-models): add User, Course, Module, Lesson, Enrollment types"
```

---

### Task 10: Write barrel export and smoke test

**Goal:** Re-export every type from `index.ts` and add a Vitest smoke test that asserts JSON round-trip works for a sample `User`.

**Files:**
- Modify: `libs/shared-data-models/src/index.ts`
- Create: `libs/shared-data-models/src/lib/shared-data-models.spec.ts`

- [ ] **Step 1: Replace `index.ts` with the full barrel**

Open `libs/shared-data-models/src/index.ts` and replace its contents with:

```ts
export * from './lib/common';
export * from './lib/user';
export * from './lib/course';
export * from './lib/module';
export * from './lib/lesson';
export * from './lib/enrollment';
```

- [ ] **Step 2: Write the failing smoke test**

Create `libs/shared-data-models/src/lib/shared-data-models.spec.ts` with content:

```ts
import { describe, expect, it } from 'vitest';
import type { User, UserId, ISODateString } from '../index';

describe('shared-data-models barrel', () => {
  it('round-trips a User value through JSON serialization', () => {
    const original: User = {
      id: 'u_123' as UserId,
      email: 'instructor@example.com',
      displayName: 'Ada Lovelace',
      role: 'INSTRUCTOR',
      createdAt: '2026-04-29T12:00:00.000Z' as ISODateString,
      updatedAt: '2026-04-29T12:00:00.000Z' as ISODateString,
    };

    const roundTripped = JSON.parse(JSON.stringify(original)) as User;

    expect(roundTripped).toEqual(original);
    expect(roundTripped.role).toBe('INSTRUCTOR');
  });
});
```

- [ ] **Step 3: Run the test to confirm it passes**

```bash
pnpm exec nx test shared-data-models
```

Expected: 1 test passes. (This test exists primarily to assert the imports resolve and the types are reachable from the barrel — the round-trip is a sanity check.)

- [ ] **Step 4: Commit**

```bash
git add libs/shared-data-models/src/index.ts libs/shared-data-models/src/lib/shared-data-models.spec.ts
git commit -m "test(shared-data-models): add barrel exports and JSON round-trip smoke test"
```

---

### Task 11: Wire `shared-data-models` into both apps

**Goal:** Import a real type from `@learnwren/shared-data-models` in both `apps/web` and `apps/api` so the path mapping is exercised by every lint/typecheck/build.

**Files:**
- Modify: `apps/web/src/app/app.component.ts`
- Modify: `apps/api/src/app/app.controller.ts`

- [ ] **Step 1: Import `Course` in `apps/web/src/app/app.component.ts`**

Open `apps/web/src/app/app.component.ts`. Add the import at the top of the file alongside existing imports:

```ts
import type { Course } from '@learnwren/shared-data-models';
```

Inside the `AppComponent` class body, add a typed property that uses it:

```ts
readonly featuredCourses: readonly Course[] = [];
```

(The empty array is intentional — this is structural wiring only; later specs will populate it.)

- [ ] **Step 2: Import `ISODateString` in `apps/api/src/app/app.controller.ts`**

Open `apps/api/src/app/app.controller.ts`. Update it to:

```ts
import { Controller, Get } from '@nestjs/common';
import type { ISODateString } from '@learnwren/shared-data-models';

interface HealthResponse {
  status: 'ok';
  version: string;
  serverTime: ISODateString;
}

@Controller()
export class AppController {
  @Get('health')
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      version: process.env.npm_package_version ?? '0.0.0',
      serverTime: new Date().toISOString() as ISODateString,
    };
  }
}
```

- [ ] **Step 3: Update the api controller spec to assert the new field**

Open `apps/api/src/app/app.controller.spec.ts`. Add a third assertion inside the `getHealth` test, after the existing two:

```ts
      expect(typeof result.serverTime).toBe('string');
      expect(() => new Date(result.serverTime).toISOString()).not.toThrow();
```

The full `it` block becomes:

```ts
    it('returns status ok and a non-empty version string', () => {
      const result = controller.getHealth();
      expect(result.status).toBe('ok');
      expect(typeof result.version).toBe('string');
      expect(result.version.length).toBeGreaterThan(0);
      expect(typeof result.serverTime).toBe('string');
      expect(() => new Date(result.serverTime).toISOString()).not.toThrow();
    });
```

- [ ] **Step 4: Run the full unit-test suite**

```bash
pnpm exec nx run-many -t test
```

Expected: tests pass for `web`, `api`, and `shared-data-models`.

- [ ] **Step 5: Run a full build**

```bash
pnpm exec nx run-many -t build
```

Expected: both `web` and `api` build successfully. `shared-data-models` may have no `build` target (bundler=none) — that's fine; the build target list only contains buildable projects.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/app.component.ts apps/api/src/app/app.controller.ts apps/api/src/app/app.controller.spec.ts
git commit -m "feat: wire @learnwren/shared-data-models into web and api"
```

---

### Task 12: Add root `package.json` scripts

**Goal:** Add the convenience scripts from the spec so contributors can run `pnpm test`, `pnpm start`, etc. without remembering the Nx invocation.

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add scripts**

Open the root `package.json`. Replace the `scripts` block with:

```json
"scripts": {
  "start:web": "nx serve web",
  "start:api": "nx serve api",
  "start": "nx run-many -t serve -p web,api --parallel",
  "build": "nx run-many -t build",
  "test": "nx run-many -t test",
  "lint": "nx run-many -t lint",
  "e2e": "nx run-many -t e2e",
  "typecheck": "nx run-many -t typecheck",
  "affected": "nx affected -t lint test build"
}
```

If `nx init` left other useful scripts in there (e.g., a `prepare` hook), keep them — only replace if the only entries are the Nx defaults.

- [ ] **Step 2: Verify each script resolves**

Run each non-server script — these should all complete:

```bash
pnpm lint
pnpm test
pnpm build
```

Expected: all pass.

(Skip `pnpm start` and `pnpm e2e` here — those are exercised in Task 13 and Task 18 respectively.)

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add root pnpm scripts for nx tasks"
```

---

### Task 13: Write Playwright E2E tests for both apps

**Goal:** Replace the default Nx-generated Playwright specs with assertions matching the spec's Definition of Done — `web-e2e` asserts the placeholder hero text, `api-e2e` asserts the `/api/health` JSON shape.

**Files:**
- Modify: `apps/web-e2e/src/example.spec.ts` (or whatever the default file is named — rename to `home.spec.ts`)
- Modify: `apps/api-e2e/src/<default>.spec.ts` (rename to `health.spec.ts`)
- Possibly modify: Playwright configs if the default `webServerCommand` doesn't match.

- [ ] **Step 1: Inspect the default web E2E spec**

```bash
ls apps/web-e2e/src/
cat apps/web-e2e/playwright.config.ts
```

Note the default spec filename and confirm `playwright.config.ts` has a `webServer` block that runs `nx serve web` (or equivalent) and waits on `http://localhost:4200`. If it doesn't, edit the config so it does:

```ts
webServer: {
  command: 'pnpm exec nx serve web',
  url: 'http://localhost:4200',
  reuseExistingServer: !process.env.CI,
  cwd: '../..',
},
```

- [ ] **Step 2: Replace the web spec**

Delete the default spec file (whatever its name) and create `apps/web-e2e/src/home.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('home page renders the Learn Wren placeholder hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('hero')).toBeVisible();
  await expect(page.getByTestId('hero')).toHaveText('Learn Wren');
});
```

- [ ] **Step 3: Run the web E2E suite**

```bash
pnpm exec nx e2e web-e2e
```

Expected: 1 test passes. Playwright will auto-start the web dev server. First run will take longer because it downloads browsers — let it complete; subsequent runs reuse the cache.

- [ ] **Step 4: Inspect and update the api E2E spec**

```bash
ls apps/api-e2e/src/
cat apps/api-e2e/playwright.config.ts 2>/dev/null || cat apps/api-e2e/jest.config.ts
```

Newer Nx versions use Playwright for API E2E too; older versions use Jest with supertest. The spec calls for Playwright. If the generator created a Jest setup, add Playwright by running:

```bash
pnpm exec nx g @nx/playwright:configuration --project=api-e2e --webServerCommand="pnpm exec nx serve api" --webServerAddress="http://localhost:3333" --no-interactive
```

- [ ] **Step 5: Replace the api spec**

Delete the default spec file and create `apps/api-e2e/src/health.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('GET /api/health returns ok with a version and serverTime', async ({ request }) => {
  const response = await request.get('http://localhost:3333/api/health');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.status).toBe('ok');
  expect(typeof body.version).toBe('string');
  expect(body.version.length).toBeGreaterThan(0);
  expect(typeof body.serverTime).toBe('string');
});
```

- [ ] **Step 6: Run the api E2E suite**

```bash
pnpm exec nx e2e api-e2e
```

Expected: 1 test passes.

- [ ] **Step 7: Commit**

```bash
git add apps/web-e2e apps/api-e2e package.json pnpm-lock.yaml nx.json
git commit -m "test: add Playwright E2E coverage for web hero and api health"
```

---

### Task 14: Write `docs/development.md`

**Goal:** Capture the script table, port assignments, and the "Firebase is not yet wired" forward-pointer in a single contributor-facing doc.

**Files:**
- Create: `docs/development.md`

- [ ] **Step 1: Create the file**

Create `docs/development.md` with content:

```markdown
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
| `pnpm affected` | Run lint + test + build only for projects affected by the current branch's changes. |

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
```

- [ ] **Step 2: Commit**

```bash
git add docs/development.md
git commit -m "docs: add development.md with scripts and port assignments"
```

---

### Task 15: Add CI workflow

**Goal:** Run lint + test + build + typecheck on every pull request, scoped to projects affected by the diff.

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/ci.yml` with content:

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  affected:
    name: Lint, test, build, typecheck (affected)
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up pnpm
        uses: pnpm/action-setup@v4

      - name: Set up Node 22
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Derive Nx affected base
        uses: nrwl/nx-set-shas@v4

      - name: Run affected tasks
        run: pnpm exec nx affected -t lint test build typecheck
```

The `nrwl/nx-set-shas` action sets `NX_BASE` and `NX_HEAD` env vars so `nx affected` knows which commits to diff against. On `main` push events it uses the previous successful run; on PRs it diffs against the merge base.

- [ ] **Step 2: Validate YAML syntax**

```bash
pnpm dlx js-yaml .github/workflows/ci.yml > /dev/null
```

Expected: exits 0 with no output.

If `js-yaml` isn't available, just visually review the file — indentation must use spaces (not tabs), every list item under `steps:` starts with `- name:`.

- [ ] **Step 3: Verify the affected command runs locally**

```bash
pnpm exec nx affected -t lint test build typecheck --base=HEAD~1
```

Expected: runs against the last commit's diff. If the diff was small, expect a short list of affected projects. Should exit 0.

(`typecheck` may not be a defined target on every project. If `nx affected` errors with "target typecheck does not exist", remove it from the script and the workflow command. The Vite/Vitest plugin auto-infers a `typecheck` target for libs but not always for apps; the build target already runs `tsc` for both apps in the Nx Angular and Nest plugins, so dropping `typecheck` from the affected list is acceptable.)

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add affected lint/test/build workflow"
```

---

### Task 16: Run Definition of Done end-to-end

**Goal:** From a clean state, run every command in the spec's Definition of Done table and confirm all pass. This is the final gate.

**No file changes** (unless one of the steps fails and requires a fix — in which case loop: fix, commit, restart this task).

- [ ] **Step 1: Clean install**

```bash
rm -rf node_modules dist .nx/cache
pnpm install --frozen-lockfile
```

Expected: succeeds.

- [ ] **Step 2: Lint**

```bash
pnpm lint
```

Expected: passes for `web`, `web-e2e`, `api`, `api-e2e`, `shared-data-models`.

- [ ] **Step 3: Typecheck (or skip if not a defined target — see Task 15 Step 3)**

```bash
pnpm typecheck
```

Expected: passes everywhere a `typecheck` target exists.

- [ ] **Step 4: Test**

```bash
pnpm test
```

Expected: Vitest passes for all three projects.

- [ ] **Step 5: Build**

```bash
pnpm build
```

Expected: outputs land under `dist/apps/web` and `dist/apps/api`.

- [ ] **Step 6: Start (manual, two terminals)**

Terminal A:

```bash
pnpm start
```

Wait for both servers to log "ready" / "Listening". Terminal B:

```bash
curl -s http://localhost:4200 | head -c 200
curl -s http://localhost:3333/api/health
```

Expected: web returns HTML containing the Learn Wren placeholder; api returns the JSON shape `{"status":"ok","version":"...","serverTime":"..."}`. Stop the parallel servers.

- [ ] **Step 7: E2E**

```bash
pnpm e2e
```

Expected: both Playwright suites pass.

- [ ] **Step 8: Final commit (only if anything was fixed)**

If any of Steps 1–7 required a fix, commit it now with a focused message. If everything passed without changes, skip this step.

- [ ] **Step 9: Push**

```bash
git push origin main
```

(Confirm with the user before pushing if the team uses PR-based merges. The plan default assumes direct pushes for foundational work; adjust if the team uses feature branches.)

---

## Done

After Task 16 passes cleanly, the workspace is ready for the next spec — Firebase wiring.

What landed:
- Nx + pnpm + Node 22 workspace
- Angular SPA with Tailwind, vitest, playwright
- NestJS API with `/api/health`, vitest, playwright
- `@learnwren/shared-data-models` library with five entity types and a smoke test
- Both apps consume the shared lib via TypeScript path mapping
- Root pnpm scripts and `docs/development.md`
- GitHub Actions CI running affected lint/test/build/typecheck

What's deferred to the next spec:
- `firebase.json`, `.firebaserc`, Cloud Functions deploy target
- Firestore security rules and emulator config
- Firebase Authentication and route guards
- Any domain endpoint beyond `/api/health`
