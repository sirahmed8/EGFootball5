## 2026-07-26T13:33:05Z
You are Worker M4 (Pass 3 — Build Fix) for EGFootball5 (`d:\football\kickoff`).
Your working directory is `d:\football\kickoff\.agents\teamwork_preview_worker_m4_pass3`. Create your directory and write `handoff.md`.

PROJECT ROOT: `d:\football\kickoff`

OBJECTIVE:
Fix TypeScript errors in `src/components/FloatingChatWidget.tsx` to restore clean build compilation.

TASKS:
1. `src/components/FloatingChatWidget.tsx`:
   - Add missing `useCallback` import to the React import line (`import { useState, useRef, useEffect, useCallback, ... } from 'react';`).
   - Fix Web Speech API type annotations (lines 280, 281, 294, 296) so TypeScript compiler accepts them without error (e.g. use `any` type for SpeechRecognition instance and event parameter: `recognitionRef.current: any`, `event: any`, or cast window object properly `(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition`).
2. MANDATORY VERIFICATION:
   - Execute `npx tsc --noEmit` and confirm 0 errors.
   - Execute `npm run build` and confirm clean compilation with 0 errors (all static pages prerendered).

3. HANDOFF REPORT:
   - Write `handoff.md` in `d:\football\kickoff\.agents\teamwork_preview_worker_m4_pass3\handoff.md` with verbatim outputs of `npx tsc --noEmit` and `npm run build`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
