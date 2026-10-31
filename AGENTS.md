# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Confirmed art and narrative direction
- Match the user's supplied dark top-down 2.5D dungeon-room screenshot: detailed raster stone environment, small movable character, restrained game HUD.
- The overseas private storage room treats relics as cargo. Show careless packing, resale labels, abrasions and vulnerability rather than luxurious display.
- Complete playable loop: awaken, bronze guide dialogue, collect three records, reorder historical sequence, farewell, window memory transition, ending and replay.
- Keep all user-facing game copy in Chinese. Fictional names and records must be identified as dramatization.

## User revision — 2026-10-31
- Deliver an editable H5 game with Vite hot module replacement, not only a static page.
- Latest visual reference is simplified readable 2.5D low-poly museum game. Treat “LD” as low-poly/readable visual direction pending any later clarification.
- Lion should follow the supplied real seated stone lion with one raised paw; display clearly even on the start screen.
- Files, prompts and controls must be visually prominent.
- Sound must be audible on explicit enable; include a real local soundtrack, volume and preview feedback.

## Confirmed two-stage handoff
The museum stage establishes the relic number, traces purchase records and includes guard avoidance. This project is chapter 2; do not invent a completed museum stage. Three fragments must require actual investigation: surviving desk document, cloth-covered crate, and a harder drawer identified from a previous fragment. Return to the bronze guide, assemble a route map, then open an envelope to play a configurable video. Provide source and assets plus GitHub Pages workflow.

## Latest user interaction requirements
- Walk near the bronze guide to trigger voice and world-space speech bubbles automatically. Keep movement available during dialogue.
- Most interactions belong beside the character/prop, not in centered blackout modals. Ordinary pickups must not force a central memory panel.
- Give a logical chain of contextual directions: guide → burned desk record → cloth-covered crate → drawer location written on fragment → guide → map → envelope/video.
- Use real bundled synthetic speech assets for the fictional characters. Do not imply a human actor or a cloned real voice.
- Keep proximity dwell, distance hysteresis and cooldown to prevent repeated speech. Do not regress to click-only NPC dialogue.

## Cabinet interaction revision
- Show 甲乙丙 cabinet numbers on actual right-hand furniture, not only in a text selector.
- Use direct clickable physical drawers with visible open/empty/paper states; avoid silent two-step selection and check.
- Cancel any pending walking route when investigation opens, so auto proximity and arrival cannot reset an active investigation.
- Guidance button routes to the next required prop with visible floor path.

## Final cabinet placement requirement
- Cabinet is an entity in the room at the right-hand furniture, never a page/modal/side-panel selector.
- Nine clickable drawers form three columns (甲乙丙) and three levels. Wooden fronts slide to reveal recessed empty interiors or the actual fragment image. Repeat click pushes a drawer back. Cabinet stays after collection.

## Window lighting
- Exterior and window light use a cold blue palette, retaining the warm desk lamp inside. Apply localized lighting, not a global room recolor.

## Cabinet material revision
- Replace synthetic button/grid cabinet appearance with 2D painted, worn real wood: irregular grain, chipped edges, oxidized cup handles and torn labels.
- Use cabinet-aged.png as the physical sprite. Nine invisible hit regions align to drawer fronts; moving front textures reveal empty or paper-containing recessed compartments. No gold UI frame.

## Room-integrated cabinet revision (supersedes floating sprite)
- Final cabinet is baked into room-integrated.png at the right-hand wall, with matching overhead perspective and contact shadow. Do not reintroduce a separate front-view cabinet sticker or fixed minimum-width entity.
- SceneCabinet samples the same room art for each moving drawer front. All hit regions share cabinet-geometry.js artwork coordinates.
- Investigation moves the actual room camera closer; no separate drawer modal. Keep full cabinet inside view on narrow screens, hide competing HUD and keep the player scaled in proportion.
- Cabinet collision remains solid, left approach reachable, front/back occlusion follows player feet. One click on a distant drawer queues the action for arrival.
- Do not call this a shipped commercial product: verify specific visual and interaction acceptance criteria and state remaining limits.
