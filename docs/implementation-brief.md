# ISOOFFICE — MASTER IMPLEMENTATION DIRECTIVE

## Repository

**GitHub:** https://github.com/kush-16-web/iso-office.git

**Target branch:** main

**Project:** IsoOffice — A private, immersive 3D collaboration and communication platform.

## 1. YOUR MISSION

You are Astra, the lead engineer responsible for transforming the existing IsoOffice prototype into the product defined below.

**DIRECTLY MODIFY THE EXISTING CODEBASE. DO NOT STOP AT PLANNING.**

The previous interface is no longer our visual target. Replace it with the newly approved interface while preserving reusable application logic and the existing React, TypeScript, Three.js, and Zustand foundation.

Do not restart the project from scratch unless a specific component is genuinely beyond repair.

Inspect the repository, identify reusable systems, establish a safe Git checkpoint, and begin implementation.

The project must remain runnable throughout development.

---

## 2. MASTER VISUAL REFERENCES — STRICT PRIORITY

Two reference images are attached.

### IMAGE 1 — MASTER ISOOFFICE DESIGN

This is the authoritative reference for:

- The exact overall interface composition.
- The 3D office environment.
- Architecture, room placement, furniture, characters, and camera.
- The white sidebar and its layout.
- Floating communication windows.
- Video participant tiles.
- Profile card, reward widget, minimap, and bottom controls.
- Colors, lighting, proportions, spacing, and visual hierarchy.

**Reproduce this particular design as faithfully as technically possible.**

Do not create a generic office inspired by the reference.

### IMAGE 2 — UI INTERACTION AND WINDOW STATES

This reference explains:

- Main office view.
- Channel chat view.
- Direct message view.
- Video call view.
- File preview.
- Profile interactions.
- Minimap interaction.
- Multiple floating windows.
- Minimized windows.
- Expanded/fullscreen conversations.

Use this image to understand component behavior and interaction states.

**If the images differ, Image 1 ALWAYS wins for visual appearance and world architecture. Image 2 is primarily an interaction specification.**

The images are design references, not static backgrounds.

If either image is inaccessible, report that before attempting visual reconstruction.

---

## 3. NON-NEGOTIABLE VISUAL REQUIREMENTS

### Absolutely NO top navbar

Remove the existing horizontal navigation bar completely.

The sidebar must touch the top edge of the viewport and extend to the bottom.

The remaining screen area must be occupied by the interactive 3D office.

### Sidebar

Reproduce the sidebar from Image 1:

- White/light surface.
- Compact user profile and online status.
- Settings and sidebar controls.
- Public channels.
- Direct messages.
- Voice rooms.
- Member avatars and presence indicators.
- Notification badges.
- Appropriate scrolling for long member lists.

Do not introduce a Discord-style vertical server icon rail or a dark sidebar unless explicitly approved later.

Preserve the clean white sidebar from our master reference.

### Floating UI

Use white rounded floating panels with subtle shadows.

The 3D office remains visible behind them.

Match the reference's visual hierarchy and approximate proportions.

Avoid excessive glassmorphism, unnecessary gradients, oversized controls, or unrelated redesigns.

---

## 4. 3D OFFICE — EXACT RECONSTRUCTION TARGET

### Art direction

The target is a polished, stylized isometric 3D office diorama with cutaway architecture.

Do not interpret this as permission to choose any random low-poly office asset pack.

**The master screenshot defines the actual world we want.**

### Reconstruct these visual elements

- Blue central office flooring and walkways.
- Dense workstation areas with computers, chairs, desks, and office accessories.
- Glass partitions and modern architectural dividers.
- Warm orange/yellow lounge and meeting rooms.
- Bookshelves, plants, interior decorations, and room details.
- Visible corridors connecting different spaces.
- Small human characters distributed naturally throughout the office.
- Soft shadows and clean architectural lighting.
- The same approximate office footprint, camera direction, and composition shown in Image 1.

### Character requirements

Characters must look like the miniature stylized humans visible in the reference.

They must NOT look like Minecraft characters, capsules, spheres, floating heads, or primitive placeholders in the final design.

Use consistent, lightweight, browser-friendly 3D character models.

Prefer rigged GLB/glTF models with appropriate animations:

- Idle.
- Walking.
- Sitting.
- Talking/gesturing, where available.

Maintain believable proportions relative to desks, chairs, and rooms.

Different coworkers should have distinguishable appearances.

### Asset strategy

Inspect existing assets first.

Find or create models that match the specific reference design.

Only use third-party assets with verified licensing suitable for the project.

Do not assume publicly downloadable models are commercially reusable.

Document asset sources and licenses.

Where the exact original models cannot be identified, reconstruct the visible forms as closely as possible using custom geometry or appropriately styled assets.

### Camera and navigation

Use an orthographic isometric camera matching the reference's framing.

Support controlled zoom and panning without losing the intended composition.

Maintain accurate character picking and interaction.

The environment must be a real Three.js scene, not an image projected behind the interface.

### Performance

Optimize for browser rendering.

Use appropriate geometry reuse, instancing, texture optimization, asset caching, and animation management.

Avoid unnecessary React rerenders from the Three.js render loop.

Do not sacrifice the approved visual design merely to reduce implementation effort.

---

## 5. FLOATING WINDOW SYSTEM

Build a reusable window-management system rather than implementing every floating panel independently.

Windows must support:

- Open and close.
- Dragging.
- Focus and z-index ordering.
- Minimize and restore.
- Maximize and return to floating mode.
- Controlled resizing where appropriate.
- Multiple simultaneous conversations.
- Viewport-boundary constraints.
- Responsive behavior.

### Default behavior

A channel opens as a larger floating panel, preferably toward the right side.

A direct message opens as a smaller floating panel.

Users can reposition windows.

The 3D office remains visible behind them.

On narrow screens, use a focused full-screen conversation view instead of forcing desktop-sized floating windows.

Avoid overlapping the sidebar or making essential controls inaccessible.

---

## 6. CHANNEL CHAT

Implement the channel window shown in the references.

### Header

- Channel name.
- Member count.
- Search.
- Members.
- Call action.
- Settings where permitted.
- Minimize, maximize, and close.

### Tabs

- Messages.
- Files.
- Calls.
- Members.

### Messaging interface

- Sender avatar.
- Sender name.
- Timestamp.
- Message content.
- Attachment cards.
- Image previews.
- Reactions.
- Typing indicator.
- Message composer.
- File attachment button.
- Send action.

Use realistic demo data while backend services are not implemented.

Frontend interactions must genuinely work locally where possible.

Do not claim that demo messages are persistent or delivered to other users.

---

## 7. DIRECT MESSAGES

Clicking a coworker or selecting Chat from their profile opens a personal DM window.

The DM window must include:

- User avatar and name.
- Presence indicator.
- Conversation history.
- Message composer.
- File attachments.
- Audio-call button.
- Video-call button.
- Window controls.

Design the UI for private one-to-one communication without requiring coworkers to share personal phone numbers.

Prepare the architecture for group DMs in a later stage.

---

## 8. PROFILE CARDS

Clicking a character in the 3D world opens a profile card near that character.

Match the master reference.

Include:

- Profile photo.
- Name.
- Job title.
- Team/department label.
- Presence status.
- Profile.
- Go To.
- Chat.
- Call.
- More actions.

The Go To action should navigate the user's avatar toward the selected coworker once navigation is implemented.

Avoid rebuilding the entire Three.js scene whenever a profile card is opened.

---

## 9. VIDEO CALLS AND MEETINGS

Preserve the floating video participant tiles visible in the reference.

Design the interface for:

- Direct audio calls.
- Direct video calls.
- Channel meetings.
- Voice rooms.
- Screen sharing.
- Microphone and camera controls.
- Participant lists.
- Join and leave.
- Incoming call notifications.

A call should be able to continue while the user opens channels or navigates the office.

Do not represent a camera or microphone toggle as a real media connection until browser media integration exists.

Actual WebRTC/media infrastructure belongs to a later implementation stage.

---

## 10. MINIMAP, REWARDS, AND BOTTOM CONTROLS

### Minimap

- Match the reference's bottom-left placement.
- Display the office layout.
- Show user and coworker positions.
- Support zoom and navigation interactions.
- Keep minimap positions derived from actual 3D world coordinates rather than unrelated hardcoded locations.

### Reward widget

- Match the mint-green floating reward card.
- Show available balance.
- Support selecting a recipient and reward amount.
- Keep reward transactions local/demo-only until a secure backend exists.

### Bottom controls

Reproduce the floating white control bar:

- Current space name.
- Nearby participant count.
- Microphone.
- Camera.
- Screen share.
- Fullscreen.

Controls must have clear active, inactive, and disabled states.

---

## 11. PRODUCT STRUCTURE — PRIVATE OFFICES, NOT PUBLIC SERVERS

IsoOffice combines:

- Slack-style organizational workspaces.
- Discord-style channels, DMs, and voice rooms.
- Google Meet-style calling and screen sharing.
- An interactive 3D office as the primary experience.

Use the term **Office**, not Server, in the product UI.

### Accounts and offices

One account may belong to multiple private offices.

Each office has separate:

- Members.
- Channels.
- Conversations.
- Files.
- Meetings.
- Permissions.
- 3D world state.

Anyone with an account may create an office, subject to future product policies.

### Membership

Support the following joining models:

1. Request approval — default.
2. Invitation only.
3. Verified organization email domain — optional future capability.

Possessing an invitation link must not automatically bypass approval when approval is required.

### Roles

**Owner:** Full office administration and ownership.

**Admin:** Manage members, approvals, channels, and office settings.

**Member:** Participate in authorized conversations, calls, and office activities.

**Guest:** Access only specifically assigned channels, meetings, and resources.

Guests must not gain visibility into unrelated private channels, files, or member information.

Backend authorization will eventually enforce every permission. Hiding frontend controls alone is insufficient.

### Office switching

Prepare a compact office switcher accessible from the sidebar profile/header area.

Do not introduce a top navbar or an additional Discord-style server rail.

---

## 12. DEVELOPMENT ORDER

Implement the project incrementally.

### PASS 1 — UI FOUNDATION

Primary objective: transform the existing interface to match Image 1.

- Remove navbar.
- Rebuild sidebar.
- Establish styling and layout.
- Create reusable floating-window manager.
- Implement channel and DM window layouts.
- Implement profile, video tiles, reward widget, minimap, and bottom controls.
- Connect basic frontend interactions.
- Preserve the existing functioning 3D scene.

Do not wait for backend implementation to complete this pass.

### PASS 2 — 3D WORLD RECONSTRUCTION

Primary objective: reproduce the master screenshot's office.

- Establish matching camera and world layout.
- Build rooms, floors, partitions, and furniture.
- Introduce appropriate character models.
- Add animations and movement foundations.
- Improve lighting, shadows, and scene density.
- Match the screenshot through repeated browser captures.

Before expanding the entire world, validate one detailed workstation, one meeting area, and two characters against the reference.

### PASS 3 — REAL OFFICE MANAGEMENT

- Authentication.
- Office creation.
- Office membership.
- Invitations.
- Approval requests.
- Role management.
- Guest access.
- Persistent office/channel data.

### PASS 4 — REAL COMMUNICATION

- Persistent channel messaging.
- Direct messages.
- File uploads and downloads.
- Realtime presence.
- Notifications.
- Audio/video calls.
- Meeting rooms.
- Screen sharing.

### PASS 5 — MULTIPLAYER OFFICE

- Synchronized character positions.
- Presence and activity states.
- Avatar navigation.
- Shared room occupancy.
- Meeting-room integration.
- Proximity-based interactions, with appropriate privacy controls.

**Do not attempt all five passes in one context window.**

Start with Pass 1 and progress to later passes only after completing and validating the earlier work.

---

## 13. VISUAL VALIDATION — MANDATORY

For each UI or 3D milestone:

1. Run the application.
2. Capture a screenshot at 1446 × 1024.
3. Compare it against the master reference.
4. Identify visible mismatches.
5. Correct those mismatches.
6. Repeat until the implementation is acceptably close.

Pay special attention to:

- Sidebar width and top alignment.
- Camera angle.
- 3D environment colors.
- Furniture and room placement.
- Character size.
- Floating window placement.
- Typography and spacing.
- UI shadows and rounded corners.
- Overlapping elements.

Do not declare visual completion simply because the code builds successfully.

The reference is a concept image, so exact source assets and geometry are not available. Aim for high visual fidelity, and report differences honestly.

---

## 14. CRITICAL — GIT CHECKPOINTS AND CONTEXT SURVIVAL

Repository:
https://github.com/kush-16-web/iso-office.git

Target branch: main.

This requirement is extremely important.

### Before editing

- Check the current branch and working-tree status.
- Fetch the latest remote state.
- Do not discard unrelated local modifications.
- Create a safe recoverable checkpoint before major changes.

### During development

Work in small, testable stages.

After each meaningful completed stage:

- Run appropriate checks.
- Commit the working implementation.
- Push it to the remote repository.
- Verify that the remote contains the pushed commit.

Do not wait until the entire pass is complete before pushing.

### When approaching context or token limits

Immediately stop starting new features.

Prioritize preserving progress.

Create or update `HANDOFF.md` with:

- Current pass and objective.
- Completed work.
- Modified files.
- Implemented components.
- Remaining tasks.
- Known bugs and blockers.
- Tests and validation results.
- Screenshot locations.
- Latest commit hash.
- Push status.
- Exact next steps.

Commit and push the handoff alongside the current code.

If a push fails, report the actual error and retain local commits.

Never force-push, silently reset, or discard existing work.

### Resume behavior

When a new session begins:

1. Read `HANDOFF.md`.
2. Inspect Git status and recent commits.
3. Identify the latest completed checkpoint.
4. Continue from that checkpoint.
5. Do not restart completed work.

---

## 15. FINAL REPORT FORMAT

After each completed stage, provide:

**Completed:** What was implemented.

**Visual fidelity:** What matches the reference and what still differs.

**Functionality:** Which interactions work and which remain demo-only.

**Validation:** Build, typecheck, tests, and screenshot results.

**Git:** Latest commit hash and verified push status.

**Next:** The next exact task to perform.

---

## IMMEDIATE EXECUTION ORDER

1. Inspect the existing repository and attached references.
2. Preserve the existing code in a safe checkpoint.
3. Begin Pass 1 immediately.
4. Remove the top navbar.
5. Make the sidebar touch the top of the viewport.
6. Rebuild the frontend around the approved reference.
7. Implement the floating-window framework.
8. Integrate the channel, DM, profile, and control components.
9. Capture and compare screenshots.
10. Commit and push a working checkpoint.
11. Update HANDOFF.md.
12. Continue Pass 1 until its acceptance criteria are satisfied.

**The approved screenshot is the product's visual identity. Preserve it.**

**IMPLEMENT DIRECTLY. VERIFY VISUALLY. COMMIT REGULARLY. PUSH BEFORE CONTEXT LIMITS.**
