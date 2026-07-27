# AGENTS.md - Antigravity & OpenAI Codex Instructions

This codebase operates under strict architectural standards defined in `AGENT_INSTRUCTIONS.md`.

## Core Directives for All Agents:
1. **Mandatory Documentation Update**: Update `PROJECT_OVERVIEW.md` whenever modifying pages, components, or API endpoints.
2. **Preserve Business Logic**: Never alter Firestore queries, security rules (`firestore.rules`), auth hooks, or React Query keys.
3. **UI/UX Excellence**: Apply modern visual styling (glassmorphism, subtle micro-interactions, dark/light contrast) as specified in `DESIGN_SYSTEM.md`.
4. **i18n & RTL**: Ensure seamless support for Arabic (RTL) and English (LTR).

<!-- BEGIN:nextjs-agent-rules -->
# Next.js App Router Notice
This repository utilizes Next.js 16 App Router with React 19. Ensure client components include `'use client';` directive.
<!-- END:nextjs-agent-rules -->
