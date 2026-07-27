# Claude Code Agent Rules

For complete guidelines, architectural principles, and safety directives, see `AGENT_INSTRUCTIONS.md`.

## Mandatory Directives for Claude Code:
1. **Source of Truth Sync**: Update `PROJECT_OVERVIEW.md` whenever adding or refactoring any page, API route, or component.
2. **Preserve Logic**: Do not break any Firestore query, Firebase Auth workflow, React Query key, or API endpoint logic.
3. **Design System**: Use color tokens, typography scales, glassmorphism presets, and animation utilities documented in `DESIGN_SYSTEM.md`.
4. **Localization**: Maintain full support for `next-intl` (Arabic RTL / English LTR).
