# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status: Specification Phase

There is no application code in this repository yet. It contains product and technical specifications for **Learn Wren**, a self-hosted, open-source educational video platform with DRM-protected playback. There is no build, lint, or test tooling — work here is authoring and editing Markdown specs.

When adding implementation, follow the planned stack below; do not introduce a different framework without a specification update first.

## Planned Technology Stack

The architecture is fixed in `docs/epics/TECHNICAL_ARCHITECTURE.md` and changes there should be deliberate:

- **Monorepo**: Nx workspace containing both Angular and NestJS apps
- **Frontend**: Angular, deployed to Firebase Hosting
- **Backend**: NestJS, deployed as Firebase Cloud Functions
- **Data**: Firestore (NoSQL), Cloud Storage for Firebase, Firebase Authentication
- **Video**: Third-party transcoding/DRM service (e.g., Coconut, Mux); playback via Shaka Player or Video.js with DRM plugins

The data models in `docs/epics/TECHNICAL_ARCHITECTURE.md` are written with relational field types (UUID, Foreign Key, JSONB) but the chosen store is Firestore — treat those tables as logical entity definitions and translate to Firestore document/collection structure when implementing. The translation rules (branded ID strings, ISO date strings on the wire, string-literal unions instead of enums) are codified in `docs/superpowers/specs/2026-04-29-initial-nx-monorepo-design.md` §4.

## Repository Layout

- `docs/epics/` — Product specifications. One Markdown file per epic (`01-` through `09-`), each containing user stories with Acceptance Criteria. `00-vision-and-epics.md` lists actors and the epic index. `TECHNICAL_ARCHITECTURE.md` holds the system diagram, stack table, and data models.
- `docs/use-cases/` — Fully-dressed **Cockburn-style** use cases (UC-XX-YY) corresponding to epics 01–06 (the MVP scope). These are the detailed flow-of-events expansion of the user stories in `docs/epics/`.
- `docs/superpowers/specs/` — Higher-level design specs (e.g., `2026-03-27-mvp-use-cases-design.md` defines the MVP use case inventory; `2026-04-29-initial-nx-monorepo-design.md` defines the workspace setup).
- `docs/epics/` and `docs/use-cases/` IDs are linked: epic `EP-01` ↔ use case file `01-user-identity-and-access.md` ↔ use cases `UC-01-01..UC-01-NN`. Maintain this numbering when adding content.

## Spec Authoring Conventions

- **Draft status banner**: Most spec files begin with a `> [!NOTE] DOCUMENT STATUS: DRAFT` callout. Preserve it on edits unless the user is explicitly approving the document.
- **Epics** use either bulleted Acceptance Criteria or Given/When/Then format. User stories follow `US-EE-NN` and the standard "As a … I want to … so that …" template.
- **Use cases** in `docs/use-cases/` follow Cockburn's fully-dressed template (Goal in Context, Scope, Level, Primary Actor, Preconditions, Success End, Failed End, Main Success Scenario, Extensions). The body is wrapped in a fenced code block with no language tag — match that style.
- **MVP scope** is EP-01 through EP-06. EP-07 (Instructor Dashboard), EP-08 (Platform Administration), and EP-09 (Non-Functional Requirements) are explicitly post-MVP per `docs/superpowers/specs/2026-03-27-mvp-use-cases-design.md`.
- The Mermaid diagram in `TECHNICAL_ARCHITECTURE.md` previously had a parse error (see commit `d6600fb`); validate Mermaid syntax when editing it.

## Naming

The project was renamed from "Teachify" to "Learn Wren" (commit `707fca7`) and all third-party brand/platform references were intentionally removed (commit `97d36b9`). Do not reintroduce vendor brand names in specs except where the architecture explicitly names a third-party category (e.g., "Coconut, Mux" as transcoding examples).


<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax


<!-- nx configuration end-->