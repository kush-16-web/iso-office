# Pass 1 validation

## Build and structure

- Baseline `main` was clean at `0339b88` and successfully built before edits.
- The redesigned application passes the TypeScript/Vite production build.
- Three.js loads in a separate lazy chunk so the UI can load first.
- The 3D chunk still triggers Vite's 500 kB warning (~555 kB uncompressed, ~139 kB gzip). This is a warning, not a failed build.
- No remote avatar/image services are used by the new UI.
- Messages, files, calls, and rewards are explicitly local/demo-only.

## Automated interaction checks

The Node test runner with JSDOM and React Testing Library exercises window boundaries, focus/deduplication, dragging, keyboard movement, maximize/minimize/restore, mobile focus switching, profile windows, draft preservation, sending, local files, search, tabs, reactions, rewards, media preview controls, call continuity, profiles, minimap coordinate mapping, and channels.

`npm test`: **23 passed, 0 failed**. JSDOM does not validate layout, WebGL rendering, or real pointer hit targets in a browser.

## Browser and screenshot limitation

The managed supervisor successfully started the Vite preview at its prescribed URL, `http://terminal.local:4173/`. The available cloud browser refused navigation with **`net::ERR_BLOCKED_BY_CLIENT`**. The Sites browser-control skill was unavailable. No replacement browser was installed and no network policy was changed.

**No implementation screenshots were captured. No visual comparison or browser acceptance is claimed.**

The source references are preserved at:

- `docs/references/master-office.png`
- `docs/references/interaction-guide.png`

## Required next visual check

1. Open the application in a WebGL-capable browser at 1446 × 1024.
2. Capture the initial interface to `docs/validation/pass-1-desktop.png`.
3. Compare sidebar width/top alignment, default panel bounds, typography, controls, and overlap against the master image.
4. Capture channel, DM, file preview, minimized, and maximized states.
5. Also check 390 × 844 and 768 × 1024 for reachable controls, keyboard focus, and one-conversation mobile behavior.
6. Confirm character picking works after repeated profile selection; scene/canvas count must stay at one.
7. Fix observed mismatches, capture again, then sign off Pass 1 before beginning Pass 2.

## Known reference differences

The full-height sidebar, panel arrangement, white rounded surfaces, yellow profile action, mint reward card, dark minimap, and control bar follow the master composition in code. Their rendered fidelity has not been inspected here. Illustrated vector avatars replace photographic portraits; no live video is implied. The existing sparse 3D scene and prototype characters are still visible and require Pass 2 reconstruction.
