# AGENTS.md - Antigravity & OpenAI Codex Instructions

This codebase operates under strict architectural standards defined in `AGENT_INSTRUCTIONS.md`.

## Core Directives for All Agents:
1. **Mandatory Documentation Update**: Update `PROJECT_OVERVIEW.md` whenever modifying pages, components, or API endpoints.
2. **Preserve Business Logic**: Never alter Firestore queries, security rules (`firestore.rules`), auth hooks, or React Query keys.
3. **UI/UX Excellence**: Apply modern visual styling (glassmorphism, subtle micro-interactions, dark/light contrast) as specified in `DESIGN_SYSTEM.md`.
4. **i18n & RTL**: Ensure seamless support for Arabic (RTL) and English (LTR).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
