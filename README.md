# Milo

A small interactive robot story in an endless dark space.

Live website: https://kwtdfbiwf.github.io/bot/

The opening leads into cursor play, finding a seed, planting it beside Milo,
growing a plant with your light, and a quiet seated ending. Continue by finding the name stamped on Milo’s
back, choosing his name, helping him water the plant, and meeting a moth drawn to its new flower. His arms can
be lifted by dragging. Pointer, touch, and keyboard interactions are supported.

## Source

- `dist/`: fullscreen website shell deployed on GitHub Pages.
- `scene/opening.html`: complete Spline HTML overlay, story, and animation loop.
- `scene/chapter-one.js`, `scene/chapter-two.js`, and their `.css` files: chapter authoring sources,
  inlined into `opening.html` so the Spline export is self contained.
- `scene/circular-blue-eyes.js`: eye changes applied in the Spline editor.
- `scene/botanical-models.js`: authored Spline seed and folded-leaf plant meshes.
  The story references these named assets and animates their growth.
- `scene/name-and-moth-models.js`: stamped back label and moth meshes.
- `scene/watering-models.js`: enamel watering can, falling drops, and folded flower petals.

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
node tests/chapter.test.cjs assist
```

This exercises the story and controls with a mock Spline bridge. Verify model
appearance, hit area placement, and touch layout in the published scene too.
