# IsoOffice handoff — Pass 1 functional checkpoint

## Repository and recovery

- Repository: https://github.com/kush-16-web/iso-office.git
- Target branch: `main`.
- Starting commit: `0339b88` (clean checkout, fetched before editing).
- Recoverable local branch: `checkpoint/pre-reference-pass-1` at the starting commit.
- Current checkpoint: this commit (`git rev-parse HEAD`). Push verification is recorded in the following handoff checkpoint after a successful remote check.
- First push attempt was rejected by automatic approval review before commit/push ran, citing an unverified public destination. Subsequent read-only checks confirmed that the authenticated GitHub user and repository owner are both `kush-16-web`, with admin/push permissions, and that the changed payload contains no detected credentials. A normal push is being retried after those checks.
- Do not reset or force-push. Fetch and inspect status/history before continuing.

## Completed implementation

- Removed `TopNav.tsx`; the white sidebar now occupies the full viewport height.
- Rebuilt the sidebar, office menu, channel badges, coworker list/search, and voice rooms.
- Added typed window management with open/close/focus, pointer and keyboard dragging/resizing, constrained geometry, minimize/restore, maximize/restore, multiple conversations, and mobile focus switching.
- Added channel/DM local messages, drafts, search, emoji insertion, reactions, attachments, downloads, image/text previews, and channel Messages/Files/Calls/Members tabs.
- Connected profiles, directory, camera Go to, demo call start/leave/participants/incoming-call preview, reward recipient/amount/balance/history, and actual browser fullscreen.
- Kept all app data in memory with visible demo labels. No backend delivery, authorization, persistence, or real media connection is claimed.
- Preserved and integrated the original Three.js geometry. Fixed recursive character picking, prevented scene reconstruction on profile selection, added bounded orthographic pan/zoom, shared scene/minimap positions, camera footprint, resize handling, and GPU cleanup.
- Saved the original brief and both references in `docs/` for the next session.

## Files and components

`src/App.tsx`, `src/App.css`, `src/index.css`; all existing sidebar/chat/profile/call/reward/control components; new `src/components/{Avatar,IconButton,WindowFrame,UtilityWindow}.tsx`; `src/{store,types,data,world}.ts`; `src/lib/windows.ts`; `public/demo/`; tests and docs; package scripts and dependencies.

## Checks and limits

- Production build and TypeScript check: passed after removing the obsolete navbar.
- Interaction tests: `npm test` passed all 23 state/DOM checks.
- Browser: preview server ran, but browser navigation failed with `net::ERR_BLOCKED_BY_CLIENT`.
- Screenshots: none captured; visual acceptance remains incomplete.
- Vite warns about the lazy Three.js chunk size; no build failure.
- Original capsule-style 3D characters, sparse furniture, and basic room layout remain; these are not the final reference art.
- Avatars are original SVG illustrations, not the reference's photographs.
- Go to centers the camera only; walking/navigation remains future work.
- One sample office only. Real account/office/guest authorization belongs to Pass 3.

## Exact next steps

1. Run `git status`, `git log -5 --oneline`, and `git fetch origin`; preserve any new work.
2. Run `npm ci`, `npm test`, and `npm run build`. Resolve actual failures before adding features.
3. Run `npm run dev` in an environment with an accessible browser. Complete the 1446 × 1024 comparison and mobile checks listed in `docs/validation/pass-1.md`.
4. Correct observed UI mismatches, capture screenshots, and commit/push this visual-validation milestone to `main`.
5. Only after Pass 1 visual acceptance, begin Pass 2: one detailed workstation, one warm meeting area, and two lightweight styled human models, validated against the master before expanding the whole office.
6. Push working checkpoints and update this file before any context limit. Never describe the current scene as visually complete.
