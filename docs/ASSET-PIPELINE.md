# Asset pipeline

Written for a phone-first workflow. Almost everything is code. A short list is not, and that list has ready-to-paste prompts at the bottom.

## Code, not assets

Generate in the build. No files, no image model, no licensing question.

- The whole room. Geometry from primitives, look from materials and lighting.
- Blob avatars, animation, confetti.
- All twelve club crests, as SVG. See the pub-identity skill.
- Kits and scarves, from club colour.
- The telly screen, the bar screen, scoreboards, the league table. Canvas textures driven by the store.
- Every piece of UI: bet slip, HUD, modals, toasts.
- The pub sign lettering. Bevan rendered to a canvas, not a painted image.

If it can be drawn from a colour, a glyph and a shape, it gets drawn from a colour, a glyph and a shape. Twelve consistent crests beat twelve interesting ones.

## Image generation, genuinely needed

Five things. All of them are surfaces, not objects.

1. Wood grain: floor planks and counter, two variants.
2. Wall plaster: aged, warm, slightly uneven.
3. Carpet or rug: worn Victorian pub pattern.
4. Framed wall pictures: four or five, the sort of thing that accumulates on a pub wall.
5. Ad break sponsor artwork: the tomato tin and two others, because the joke needs a real label.

Everything else on that wall you might be tempted to generate, generate later or not at all.

## Rules for every generated texture

These matter more than the prompt wording.

- Seamlessly tileable. Ask for it explicitly. Check by tiling it 2x2 before committing.
- Flat, even lighting. No baked shadows, no highlights, no vignette. Three.js does the lighting. A texture with light already painted into it will fight the lamps and look wrong from the fixed camera angle.
- Square, 1024x1024, then downsize to 512 before it ships. The performance budget is real.
- Colour-neutral or slightly desaturated. Tint in the material, not in the file. That keeps every surface locked to the token palette.
- Save as webp. Compresses far better than PNG for this.

Framed pictures and sponsor labels are the exception: those are flat-on artwork, not tileable, and can carry their own lighting because they read as printed objects.

## Prompts

Paste these as written. Adjust the last clause if a model ignores the tiling instruction.

Wood grain, floor. Prompt: Seamless tileable texture of dark aged oak floorboards, top-down flat orthographic view, completely even lighting with no shadows and no highlights, worn and slightly scuffed, subtle grain, muted desaturated brown, photographic realism, square 1024x1024, tiles seamlessly on all four edges.

Wood grain, counter. Prompt: Seamless tileable texture of polished dark mahogany bar counter surface, top-down flat view, perfectly even lighting, no shadows, faint ring marks and light wear, fine grain, deep muted red-brown, photographic, square 1024x1024, tiles seamlessly.

Wall plaster. Prompt: Seamless tileable texture of old painted plaster wall in a Victorian pub, flat even lighting, no shadows, no vignette, gently uneven surface with age and slight discolouration, warm muted tone, subtle, photographic, square 1024x1024, tiles seamlessly.

Rug. Prompt: Seamless tileable Victorian pub carpet pattern, dark green and deep red, ornate but worn and faded, flat top-down view, completely even lighting, no shadows, photographic, square 1024x1024, tiles seamlessly.

Framed wall pictures, run four times, varying the subject each time. Prompt: A single framed picture as it would hang in an old Irish pub, showing one of the following: a sepia photograph of a hurling team from 1953, a faded horse racing print, a hand-painted advertisement for stout, a small dark oil painting of a harbour. Flat front-on view, straight on, no perspective, dark wooden frame, aged and slightly yellowed, isolated on plain background, square.

Sponsor artwork, the tomato tin, then vary for the other two. Prompt: A vintage tinned tomato can label, front-on flat product view, invented Italian brand called Nonna Rossi, warm red and cream, 1970s printed packaging style, slightly worn, isolated on plain white background, no text other than the brand name, square.

## Licensing note

Worth being aware, not worth stalling on: generated assets carry usage terms that vary by model and change over time, and a pitch demo shown to a studio is a different exposure from a shipped commercial product. Fine for the demo. Check the terms of whichever model you use before anything goes public, and keep a note of which model produced which file.

## What you can do from a phone right now

Everything text-shaped, which is most of the project at this stage: the specs, the copy, NPC line banks, Mossy's dialogue, ad gags, club character text, crest SVG source, the league data table, texture prompts and their outputs.

What waits for the computer: npm, the scaffold, the port, and any UI you want to design properly in Figma.
