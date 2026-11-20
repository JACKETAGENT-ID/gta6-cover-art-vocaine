# Vice City Postcard — GTA-style cover maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/JACKETAGENT-ID/gta6-cover-art-vocaine/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/JACKETAGENT-ID/gta6-cover-art-vocaine/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Turn your photos into a retro travel-poster cover for Vice City: three
photo panels under a double-rule frame, a sunburst behind a big serif
caption, a perforated stamp and a round postmark — then export the PNG
in the post size you need. Everything runs offline from the files in
`app/`: your photos are read on your own machine and never uploaded.

## Use it

```sh
node serve.ts   # then open http://localhost:8080
```

1. Pick a photo slot and upload your own photo — or paint one of the
   three built-in scenes into it (Marina dusk, Neon avenue, Boardwalk).
   The scenes are drawn live on canvas, not image files.
2. Drag the cover to pan the active photo; use its zoom slider to crop.
3. Write the kicker, title, and place line.
4. Pick a panel layout (Postcard, Triptych, Split, Stack), a colour
   grade (Duotone, Sepia, Mono, Original, Noir), and a post size
   (Square 1080 × 1080, Portrait 1080 × 1350, Wide 1920 × 1080).
5. Export PNG — what the preview shows is what the file holds.

## Layout

```
app/
  index.html        editor page
  style.css         postcard theme: cream paper, teal and gold
  src/
    main.js         wires controls, slots, drag-to-pan, export, ?shot=
    cover.js        postcard renderer: panels, grade, sunburst, stamp
    samples.js      three runtime-drawn sample scenes
    shots.js        fixed screenshot scenes (?shot=cover / editor)
main.ts             entry program: copies app/ + screenshots/, writes dossier.json
shots.json          the four screenshot scenes
screenshots/       the screenshots (first by name is the cover)
serve.ts            tiny static server for trying the app locally
```

## Notes

- No Rockstar logo, wordmark, artwork, or font is used anywhere. The
  lettering uses system font stacks only (Noto Serif / Liberation Sans);
  the sample scenes are original procedural drawings.
- No network requests at run time: every script, style, and image the
  app loads is a file under `app/`.
- Screenshots are taken with the app's own `?shot=` scenes via headless
  Chromium; the cover shot shows the exported cover, the editor shot
  shows the app with photos loaded.

## License

MIT — see `LICENSE`.
