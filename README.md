# Milo

A small interactive robot story that starts in an endless dark space and gradually becomes a cosy home. Findable objects use rounded clay forms, warm pastels, and soft matte surfaces.

Live website: https://kwtdfbiwf.github.io/bot/

The opening leads into cursor play, finding a seed, planting it beside Milo,
growing a plant with your light, and a quiet seated ending. Continue by finding the name stamped on Milo’s
back, choosing his name, helping him water the plant, and meeting a moth drawn to its new flower. After the moth settles, find a blue bottle cap and help Milo keep it in his first box. The next find is a small wooden shelf with one green book already on it: scrub away a pale dust coating where it stands in the room. A cloth cursor and small dust puffs respond to each stroke, exposing the warm wood beneath. The shelf stays in its permanent position through discovery, cleaning and the ending. Hidden finds are revealed by the cursor light. Give the can to Milo’s right hand, then drag that hand toward the plant. His body turns with the guided reach; he pours only over the soil. Cursor gaze is active during object searches, with eye contact during dialogue. His arms can
be lifted by dragging. After the shelf, place the keepsake box, unroll a rug together, repair a lamp, uncover and clean a daybed, arrange a blanket, and connect the string lights. Each discovery reveals another part of the home in its permanent position. Milo walks, reaches, sits and stands throughout the sequence. Pointer, touch, and keyboard interactions are supported.

## Source

For checking updates, click inside the game and press **Shift + P** to open
the hidden chapter preview menu. Choose any checkpoint, including finding,
cleaning, or inspecting the shelf, plus rug, lamp, daybed, blanket, string-light and cosy-evening checkpoints. Choose **Inside the home** to inspect the full furnished interior. The camera stays inside the room and fills the screen; it never pulls out to show a tiny house. This assembled view is only in the preview menu so story searches still reveal only the active find. **Escape** closes the menu; **Restart story**
returns to the black opening. Jumps reset scene state without reloading the
Spline frame. Refreshing the site always starts the ordinary story.

- `dist/`: fullscreen website shell deployed on GitHub Pages.
- `scene/opening.html`: complete Spline HTML overlay, story, and animation loop.
- `scene/chapter-one.js`, `scene/chapter-two.js`, `scene/chapter-three.js`, `scene/chapter-four.js`, and their `.css` files: chapter authoring sources,
  inlined into `opening.html` so the Spline export is self contained.
- `scene/hanging-light.js` and `.css`: discoverable hanging pull cord and native keyboard activation, inlined into the opening.
- `scene/search-light.js`: per-surface cursor beam for hidden collectibles; matte clay stays opaque and dark outside the soft beam.
- `scene/room-models.js`: previous blockout, retained hidden under `Home Room`.
- `scene/interior/`: the detailed furnished attic. Prefix each numbered authoring batch with `helpers.js`, then run 01–10 in order in Spline. Includes real wood planks and rafters, triangular glazing and trim, two beds with upholstery and stitching, writing desk and drawers, books, ceramic lamp, draped bulb cables, framed lantern, arched brass-bound chest, standing mirror with an authored warm reflection for the fixed camera, woven fringed rug, slippers, magnifier, satchel, boots and earthenware. One `Interior Home` root controls assembled-room visibility.
- `scene/room-layout.js`: permanent furniture anchors, room visibility and the fixed interior camera at (200, 420, 1100). Uses the same projection as the cursor beam and hand targets. Active searches illuminate only the current object, without revealing the hidden room structure.
- `scene/home-chapter.js` and `.css`: the playable shelf-to-home sequence, including rug unrolling, lamp repair, uncovering and cleaning the daybed, replacing the cushion, blanket choices, connecting and pulling the string lights, and the quiet home. Earned geometry is revealed in place; unknown furniture stays hidden. Milo walks between tasks and uses separate knee and hip poses to sit.
- `scene/home-models.js`: one-time story props, prefixed with `scene/interior/helpers.js`: rolled rug, thread, cable, cover, folded blanket, connector, plug, pull cord, seat dust and contact shadow.
- `scene/level-camera.js`: camera roll correction for level ground; the overlay uses matching projections.
- `scene/preview-navigation.js` and `.css`: hidden chapter selector and scene reset, inlined into the opening.
- `scene/circular-blue-eyes.js`: eye changes applied in the Spline editor.
- `scene/botanical-models.js`: authored Spline seed and folded-leaf plant meshes.
  The story references these named assets and animates their growth.
- `scene/name-and-moth-models.js`: stamped back label and moth meshes.
- `scene/watering-models.js`: enamel watering can, falling drops, and folded flower petals.
- `scene/collection-models.js`: blue crimped cap, keepsake box, and hinged collection hatch.
- `scene/shelf-models.js`: one-time Spline shelf and single-book builder, including a locally drawn wood-grain texture.
- `scene/shelf-refinement.js`: run after the shelf builder, before the dust builder, to give the existing frame its compact proportions, rounded overhanging top, gently splayed legs, sculpted edges and directional walnut grain with knots.
- `scene/shelf-dust-clarity.js`: one-time upgrade for an existing original dust build; strengthens the coating and adds the front-lip decals. The current full dust builder already includes these changes.
- `scene/shelf-dust-layout.js`: surface patch positions shared by the dust builder and cleaning interaction. Run it before `scene/shelf-dust-models.js` when authoring the feathered dust decals.
- `scene/clay-props.js`: final prop remodeling pass; apply after the base model scripts. Preserves object names and interaction anchors while adding rounded clay forms and muted pastel materials.
- `scene/story-outline.json`: accepted story direction and implemented/planned chapter beats.

A chosen robot name is stored locally in the scene’s browser storage. No
server receives names or progress.

The robot model, camera, and lighting are hosted in Spline. The website embeds
the published scene; the model itself is not stored in this repository.

Editable scene: https://app.spline.design/file/0161b78f-4568-4adf-889d-986b78acb470

Scene export: https://my.spline.design/untitled-RA3tLn0xQdYWDdknvmMRQz6J/

Update the HTML content in the Spline editor and publish its public URL to
release story changes. Keep the authoring sources and inlined HTML in sync.
For website shell changes, commit them on `main`, then publish `dist/` with:

```sh
git push origin main
git subtree push --prefix dist origin gh-pages
```

GitHub Pages serves the root of `gh-pages`.

## Functional check

```sh
node tests/chapter.test.cjs
node tests/chapter.test.cjs nickname
node tests/chapter.test.cjs direct
node tests/search-light.test.cjs
node tests/chapter.test.cjs preview:dust
node tests/chapter.test.cjs home
node tests/chapter.test.cjs home-direct
```

This exercises the story and controls with a mock Spline bridge. Verify model
appearance, hit area placement, and touch layout in the published scene too.
