# Generated assets and audio

Raster art was created with the built-in ImageGen tool and copied into this project. The supplied screenshots/photo were style and identity references. They are not the in-game floor or hero image.

Final art specs:
- room.png: clean low-poly 2.5D top-down neglected private relic storage room; teal tile floor, cargo stacks, left bronze seated human guide, upper-center packing desk, upper-right window, right debris, left lower shipping crate. No UI or text.
- lion.png: isolated transparent low-poly stone guardian lion based on the supplied seated real artifact, broad carved face, one raised forepaw, chipped edges; readable pale sandstone silhouette. No pedestal or environment.
- record.png: isolated low-poly stack of worn cream freight papers, folded corners, abstract lines and a dull red seal, transparent background.
- map.png: antique route map with workshop, river and port, continuous red route across three vertical sections, scorched edges, no readable labels. Used as three actual image slices.
- envelope.png: old cream envelope containing part of the route map, rusty red seal, slight singe marks, low-poly paper planes.
- guide-portrait.png, crate-detail.png, cabinet-detail.png: exact prop crops from the room raster for optional close views.
- room-legacy.png / lion-legacy.png: prior version fallbacks.
- transport.png / home.png: painterly narrative stills for the built-in cinematic preview. These are still-image camera sequences, not a completed character video.

Audio:
- ambient.wav: original locally synthesized pentatonic plucked ambience, 48 seconds stereo.
- voice-01.wav … voice-24.wav: local Chinese synthetic voices. Generated from the exact `src/voice-script.json` text using an installed system voice, with pitch/timing/EQ/echo processing for the fictional bronze guide. No human actor or real-person cloning.
- Short movement, pickup, puzzle and impact cues use Web Audio.

No external stock soundtrack, online TTS endpoint, or copied game artwork is needed to run the delivered game.

## Aged cabinet sprite — built-in ImageGen
Asset: public/assets/cabinet-aged.png (1344×1170 RGBA). Generated with the built-in image tool, not the CLI.
Prompt: Single old wooden apothecary storage cabinet, exactly nine closed drawers arranged three columns and three rows, transparent background. Nearly straight-on orthographic with a narrow visible top. Aged dark walnut and grey-brown timber, matte grain, dust, scratches, chipped corners, water stains, oxidized brass cup handles, tiny torn blank labels. Realistic hand-painted 2D adventure environment art, desaturated, tactile materials. No room, no interface, no gold buttons, no text or extra drawers.
The original sprite is rendered as the frame; each drawer front samples the same texture so pull-out animation retains its actual grain and handle.

## Room-integrated cabinet background — built-in ImageGen
Final asset: public/assets/room-integrated.png. Edit target: original room.png; cabinet-aged.png used only for nine-drawer design. Prompt: preserve the room camera, geometry, floor, antiques and desk; replace only lower-right packing furniture with a squat aged nine-drawer cabinet entirely inside the room against the right wall, matching overhead perspective, muted wood, room lighting and contact shadows. Keep the left approach clear and all feet off the front wall. Preserve broken-crate hazard. Make window and entering light cool blue, retaining amber desk lamp. No UI, text, extra cabinets or camera changes.
This integrated background supersedes the separate cabinet-aged.png sprite. SceneCabinet overlays only real drawer hit regions and animated samples of the same room texture.
