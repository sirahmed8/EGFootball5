## 2026-07-26T09:48:32Z
You are Explorer 1 for Milestone 3 (Backend, Realtime & Firestore Architecture — React Query, Caching & Optimistic UI).
Your working directory is `d:\football\kickoff\.agents\teamwork_preview_explorer_m3_1`.
Please create your directory and write your `progress.md` liveness heartbeat and report `analysis.md` inside your working directory.

Scope of investigation:
1. Inspect all React Query usage in `src/hooks/` (e.g. `useBookings.ts`, `useMatches.ts`, `usePitches.ts`, `useNotifications.ts`, `useSupport.ts`, etc.) and `src/lib/queryClient.ts`.
2. Evaluate cache options (staleTime, gcTime/cacheTime, refetchOnWindowFocus, query key management).
3. Identify missing or incomplete optimistic updates for mutations (joining/leaving matches, creating/canceling bookings, sending messages, updating roles).
4. Propose precise, clean, idiomatic TanStack React Query patterns for query invalidations, optimistic state rollback on error, and consistent cache key structure (`['pitches']`, `['bookings', userId]`, `['matches', matchId]`, etc.).

Write your comprehensive findings and detailed implementation recommendations to `d:\football\kickoff\.agents\teamwork_preview_explorer_m3_1\analysis.md` and complete handoff in `handoff.md`.
Communicate back when done.
