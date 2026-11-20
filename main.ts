// Vice City Postcard — the entrypoint for make.fun's gta6-cover-art-01.
// Node 22, standard library only. It takes the static app in this folder's
// app/ directory and the screenshots in screenshots/, copies both into the
// output directory, and writes dossier.json there with the kit's vendored
// buildDossier helper. The app itself is plain offline files: index.html
// plus its ES modules, system fonts only, and sample scenes the app draws
// at run time — no image or font file is shipped at all.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The caps below mirror the gate's own limits, so a build that passes here
// is one the scorer accepts: at most 4 screenshots of 256 KiB each, app/
// within 993 files and 48 MiB, and the dossier text capped at 160 KiB.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
