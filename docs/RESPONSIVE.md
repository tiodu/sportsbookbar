# Responsive and mobile

Decision: landscape only. On a portrait viewport, show a full-screen rotate prompt and block interaction with the scene until the device is turned to landscape. No portrait layout, no bottom sheets, no dual UI system.

Rationale: the room is a fixed-frustum orthographic view designed for a wide rectangle, and this is a pitch demo where landscape is the natural orientation on a laptop, projector, or phone held sideways. Building a genuine portrait layout means designing camera behaviour and UI patterns against a game that does not exist yet. That work is deliberately deferred to a dedicated mobile phase once there is a real scene and UI to adapt, rather than guessed at now.

## Rotate prompt

Detect orientation via a media query or the Screen Orientation API. Below landscape (viewport height greater than width), render a full-screen overlay: centered icon or illustration suggesting a phone rotation, one short line of copy in the pub-voice register, nothing else interactive behind it. The three.js render loop can keep running behind the overlay or pause, implementation's choice, but no pointer events should reach the canvas or any UI while the prompt is showing.

The moment the viewport becomes landscape, the overlay dismisses immediately and the game is interactive. No confirmation step, no button to press.

## Touch handling, all orientations

touch-action: none on the canvas element, so tap-to-move does not fight pinch-zoom or double-tap-zoom.

Long-press text selection and iOS callout disabled on the canvas and HUD.

All tappable elements at minimum 44 by 44px, since a phone in landscape is still a phone.

Safe-area insets (env(safe-area-inset-left), env(safe-area-inset-right), etc) applied to the HUD and any modal, since landscape on a phone with a notch or dynamic island eats into the sides rather than the bottom.

## Deferred to a later mobile phase

Portrait layout, bottom sheets, a mobile-specific HUD, and any camera behaviour beyond the existing aspect-ratio scaling. These wait until real scene and UI content exists to design against.
