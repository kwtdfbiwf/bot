# Milo

A small interactive robot story in an endless dark space.

Live website: https://kwtdfbiwf.github.io/bot/

The opening leads into cursor play, finding a seed, planting it beside Milo,
growing a plant with your light, and a quiet seated ending. Pointer, touch,
and keyboard interactions are supported.

## Source

- `dist/`: fullscreen website shell deployed on GitHub Pages.
- `scene/opening.html`: complete Spline HTML overlay, story, and animation loop.
- `scene/chapter-one.js` and `scene/chapter-one.css`: chapter authoring sources,
  inlined into `opening.html` so the Spline export is self contained.
- `scene/circular-blue-eyes.js`: eye changes applied in the Spline editor.

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
```

This exercises the story and controls with a mock Spline bridge. Verify model
appearance, hit area placement, and touch layout in the published scene too.
