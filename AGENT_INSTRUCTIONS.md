# Global AI Agent Instructions & Architectural Source of Truth

This document serves as the **Master Source of Truth** for any AI Agent (Antigravity, Cursor, Claude Code, OpenAI Codex, GitHub Copilot, or VS Code AI extensions) working on this codebase.

---

## 🚨 MANDATORY AGENT RULE (CRITICAL)

> **Whenever ANY AI Agent adds, updates, re-architects, or refactors ANY page, component, API route, state store, or feature in this repository, it MUST IMMEDIATELY update [`PROJECT_OVERVIEW.md`](file:///d:/football/kickoff/PROJECT_OVERVIEW.md).**

Failure to update `PROJECT_OVERVIEW.md` breaks the long-term context chain for other agents and human engineers.

---

## 🎯 Core Mission & Safety Directives

1. **Feature & Logic Preservation (STRICT NO-BREAKAGE POLICY)**
   - DO NOT alter, remove, or modify existing backend business logic, API route signatures, Firestore query rules, Server Actions, TanStack React Query cache invalidation logic, or Zustand stores.
   - Design modifications must ONLY upgrade visual presentation, layout hierarchy, UX flow, animations, dark/light theme consistency, accessibility, and micro-interactions.

2. **Tech Stack Integrity**
   - **Framework**: Next.js 16.2 (App Router with localized `[locale]` routes)
   - **React Version**: React 19 (Server & Client Components)
   - **Styling**: Tailwind CSS v4 (`@import "tailwindcss";`) with custom OKLCH color variables & CSS animations
   - **Animations**: Framer Motion 12+ for component transitions & page motion
   - **Database & Auth**: Firebase Auth, Firestore, Realtime Database (Presence)
   - **State & Data Fetching**: TanStack React Query v5 & Zustand
   - **Localization**: `next-intl` (Arabic `ar` with RTL, English `en` with LTR)

3. **Engineering Standards**
   - Keep client components strictly designated with `'use client';` at top.
   - Use TypeScript strict mode without suppressing type errors with `any` unless absolutely unavoidable.
   - Leverage pre-existing UI primitives in `src/components/ui/` (Button, Dialog, Select, Dropdown, Table, Input, Tabs, Card, Skeleton).
   - Enforce proper RTL layout mirroring using logical Tailwind utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `rtl:` overrides).

4. **Component Hierarchy & Clean Architecture**
   - All shared components reside in `src/components/`.
   - Feature-specific admin components reside in `src/app/[locale]/admin/components/`.
   - Feature-specific owner components reside in `src/app/[locale]/owner/components/`.
   - Helper utilities and Firebase services must remain encapsulated inside `src/lib/`.

---

## 📁 File Structure Reference
```
kickoff/
├── AGENT_INSTRUCTIONS.md                <-- Global AI instructions (This file)
├── .cursorrules                         <-- Cursor mirror rules
├── CLAUDE.md                            <-- Claude Code mirror rules
├── .github/copilot-instructions.md      <-- GitHub Copilot mirror rules
├── AGENTS.md                            <-- OpenAI Codex / AGY mirror rules
├── PROJECT_OVERVIEW.md                  <-- System Architecture & Feature Map
├── DESIGN_SYSTEM.md                     <-- Visual Design System & Design Tokens
├── firestore.rules                      <-- Firestore Security Rules
├── firestore.indexes.json               <-- Composite Database Indexes
├── src/
│   ├── app/
│   │   ├── [locale]/                    <-- Internationalized pages
│   │   │   ├── (home, book, checkout, matches, profile, admin, owner, etc.)
│   │   │   └── layout.tsx
│   │   ├── api/                         <-- Next.js API Routes (admin, ai, etc.)
│   │   └── globals.css                  <-- Design tokens & custom utilities
│   ├── components/                      <-- Reusable UI & Widget components
│   ├── hooks/                           <-- Custom React Hooks (Firebase & DB)
│   ├── lib/                             <-- Firebase, AI, and Query Client
│   ├── store/                           <-- Zustand global state stores
│   └── types/                           <-- Shared TypeScript Interfaces
```
