---
name: art-direction
description: Palette, lighting rig, typography and material rules for SportsbookBar. Load before any change to colour, light, material, font or UI styling anywhere in the codebase.
---

# SportsbookBar art direction

The room is a small Irish pub at night, lit by lamps, with one cold screen in the corner. Everything follows from that sentence.

## Palette

Warm side. This is 90% of what you see.

Token: void, hex #0D0906, use: background, fog, outside the room.
Token: stout, hex #17100B, use: deepest wood, trim, skirting.
Token: oak, hex #2F1C10, use: floor.
Token: mahogany, hex #3B2418, use: counter, tables, doors.
Token: brass, hex #B3803F, use: foot rail, taps, fittings, hardware.
Token: lamp, hex #FFB35C, use: point light colour. Never a surface colour.
Token: cream, hex #F5E9D6, use: body text, pint heads, bartender blob.
Token: shamrock, hex #1D4D33, use: rug, pub sign field. Used sparingly.
Token: gold, hex #E9C46A, use: signage lettering, headings, win states.

Cool side. Screens only.

Token: crt, hex #35E0D6, use: telly glow, neon trim, live indicators, odds.
Token: arcade, hex #D63BFF, use: the casino machine, and nothing else.
Token: alert, hex #E07050, use: errors, insufficient balance.

The rule that holds the whole thing together: cool colours never touch wood. crt appears on screens, screen light spill, and screen-derived UI. If teal is landing on a table, the scene is broken. That single constraint is why the room reads as cohesive rather than as a colour palette applied to objects.

Club colours are the twelve in the league spec. They appear on kit, crests, scarves and scoreboards. They do not appear on architecture.

## Lighting rig

Three warm point lights plus one cold. Values are the baseline, tuned in scene.

Main pendant: colour lamp, position (0, 5.5, 1.5), intensity 1.05, distance 30, casts shadow yes.
Bar lamp: colour #FF9D3D, position (-5.5, 3.9, -1.5), intensity 0.90, distance 12, casts shadow no.
Snug lamp: colour lamp, position (4, 3.9, 1), intensity 0.85, distance 12, casts shadow no.
Screen spill: colour crt, position (1.5, 2.8, -5.3), intensity 0.55, distance 9, casts shadow no.

Ambient sits at #59422B, 0.95. One shadow caster only, for budget.

Goal pulse: warm lights ramp to 1.85x over 120ms, decay over 1.4s. Screen spill ramps to 2.4x. This is the room reacting, and it is the single most important piece of lighting in the product.

Materials are MeshStandardMaterial. Wood sits at roughness 0.85, metalness 0.05. Brass at 0.35 and 0.7. Screens are emissive and unlit. Nothing is glossy except brass and the counter top, because a pub at night is matte.

## Skeuomorphic room, flat screens

The product mixes two treatments, and the boundary between them is the same boundary as the palette rule above. This is not a coincidence, it is the design.

The room is skeuomorphic. Wood has grain. Brass is worn brighter where hands touch it. The counter has ring marks. Light falls off realistically and casts real shadows. Materials behave like materials. Everything physical in the bar is trying to convince you it exists.

Every screen is flat. The telly, the bar screen, the casino machine, and all UI over the top of them. Solid fills, no gradients, no bevels, no drop shadows, no glass, no inner glow. Hard geometric shapes, generous spacing, one weight of line. Broadcast graphics, not skeuomorphic panels.

So: warm, textured, lit, and physical below the screen line. Cool, flat, and graphic above it. A gradient on a bet slip breaks the rule as surely as teal on a table does.

The reason this works rather than reading as inconsistent is that it is true. In a real pub, the room is made of matter and the screen is made of pixels, and your eye already knows the difference. The design is not mixing two styles, it is respecting one boundary that already exists.

One deliberate exception: the pub sign, the framed pictures, and the beer taps are allowed more painterly detail than anything else in the room. Craft concentrates where a real publican's would.

## Typography

Role display, face Bevan: pub signage, headings, the bar's name. Victorian slab, the lettering you'd actually see on a Dublin shopfront. Used at large sizes only, never below 20px.
Role UI, face Karla: body copy, bet slip, buttons, NPC dialogue. Grotesque with enough character to not read as a system font.
Role data, face Barlow Condensed: scoreboards, timers, odds, league table. Broadcast condensed. Tabular figures on.

Three faces, hard limit. The display face is the risk in this palette and it only works if it stays rare.

## Composition

Camera is fixed orthographic isometric. No rotation, no zoom in v1. Everything is designed for one viewing angle, so detail goes on the faces that camera sees and nowhere else.

The telly is the visual anchor of the composition. It should be the brightest thing in frame at all times and the eye should land on it within the first second of the demo.

## Motion

Blobs squash and stretch. Nothing eases linearly. Celebrations are short and loud rather than long and gentle. UI transitions are 120 to 200ms. Respect prefers-reduced-motion by cutting particles and light pulses, not by cutting the game.

## Output

These tokens live in src/art/tokens.ts, generated from this file. Changing a value here means regenerating that file in the same commit. No colour or font enters the codebase without appearing here first.
