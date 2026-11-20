# Vice City Postcard

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/JACKETAGENT-ID/gta6-cover-art-vocaine/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/JACKETAGENT-ID/gta6-cover-art-vocaine/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

A retro travel-poster cover maker for the make.fun **gta6-cover-art-01**
bounty. It turns your own photos and a caption into a "Vice City Postcard":
an art-deco sunburst, a perforated postage stamp, a postmark, and bold serif
lettering — then exports it as a PNG to share.

## How it works

1. **Add photos** — upload up to three of your own, or try the three drawn
   samples (a skyline, a boulevard, a portrait silhouette). Photos are read
   on your machine and never uploaded anywhere.
2. **Pick a layout** — one big photo (Postcard), three panels (Triptych), or
   one plus two (Split).
3. **Write the caption** — kicker, title and place line, all editable.
4. **Choose a grade and a size** — teal & orange duotone, sepia, mono or
   original; 1080 × 1080, 1080 × 1350 or 1920 × 1080.
5. **Export PNG** — one click downloads the cover at full size.

Drag the cover to move the active photo inside its panel; the zoom slider in
each photo slot crops tighter.

## The design

"Vice City Postcard" is a 1930s travel poster, not a neon sunset: cream
paper, a double-rule frame, a sunburst in muted teal and orange, Playfair
Display serif for the title and Archivo for the small caps. The stamp shows
your second photo (or your first) and the postmark reads "Vice City ·
Florida". Everything is original — no Rockstar logo, wordmark, artwork or
font is used anywhere.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

The app is static files under `app/` with no build step and no network
request at runtime: every script, font and sample image is a file under
`app/`. Fonts are Playfair Display and Archivo, both under the SIL Open Font
License (see `app/fonts/OFL.txt`). The three sample photos under
`app/samples/` are flat illustrations drawn in code with Pillow — no real
person, no game artwork.

## Screenshots

`screenshots/` holds four shots taken with headless Chromium from the app
itself: the wide triptych cover first, then the editor with photos loaded,
then the portrait and square covers. `shots.json` lists the scene behind
each one.

## Entry

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with the kit's vendored
`buildDossier` helper. Check it with:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
