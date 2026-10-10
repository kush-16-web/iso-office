# IsoOffice

A private, immersive collaboration workspace built on React, TypeScript, Three.js, and Zustand.

## Run locally

Use Node.js 22.12+ (validated with Node 24).

```sh
npm ci
npm run dev
```

Open the Vite URL printed in your terminal. No credentials or external services are needed.

```sh
npm run typecheck
npm test
npm run build
```

## Current checkpoint: Pass 1

The UI has been rebuilt around the approved reference: a full-height white sidebar, floating channel and direct-message windows, profiles, demo call tiles, rewards, a world-linked minimap, and bottom controls. There is no top navigation bar.

Conversations support dragging, resizing, focus, minimize/restore, maximize/restore, local drafts, messages, attachments, image/text previews, downloads, reactions, and search. On a narrow screen, one focused conversation is shown at a time; the bottom tray switches conversations.

All messages, attachments, rewards, membership data, and call state are **in-memory demonstrations**. Reloading resets the demo. No messages are sent to other people. Call controls do not access a microphone, camera, or screen. There is no authentication, backend authorization, persistent storage, WebRTC, or multiplayer yet.

The original prototype's 3D geometry is retained. Picking, camera pan/zoom, lifecycle cleanup, and shared minimap coordinates have been repaired. Detailed architecture and rigged human characters are the next visual pass; the current world is not a reconstruction of the finished reference.

## Controls

- Drag a window header; drag the bottom-right handle to resize.
- Double-click a header to maximize/restore; use the header buttons to minimize or close.
- Focus a window heading or resize handle and use arrow keys for keyboard movement/resizing.
- Pan the office with a pointer drag; scroll or use the minimap controls to zoom.
- Select a character or open the People directory for their profile.
- Go to centers the camera; avatar walking is not implemented yet.
- Fullscreen uses the browser's actual Fullscreen API.

## Project map

- `src/store.ts`, `src/types.ts`, `src/data.ts`: demo state, contracts, and fixtures.
- `src/components/WindowFrame.tsx`, `src/lib/windows.ts`: reusable window manager.
- `src/ChatPanel.tsx`: channels, direct messages, tabs, files, composer, and reactions.
- `src/components/UtilityWindow.tsx`: file previews, directory, settings, and profiles.
- `src/IsoCanvas.tsx`, `src/world.ts`, `src/Minimap.tsx`: retained 3D scene and shared coordinates.
- `docs/references/`: the user's master reference and interaction guide.
- `docs/implementation-brief.md`: the original implementation directive.
- `docs/validation/pass-1.md`: completed checks and the visual-validation limitation.
- `ASSETS.md`: provenance of graphics and sample files.
- `HANDOFF.md`: checkpoint status and exact next steps.

Pass 1 visual acceptance is pending a real browser comparison at **1446 × 1024**. The managed browser in the implementation environment could not reach its preview URL; no screenshot comparison is claimed.
