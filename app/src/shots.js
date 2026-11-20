// Fixed scenes for screenshots. `?shot=cover` shows the finished cover
// alone; `?shot=editor` shows the editor with photos loaded. Query
// knobs: scene / scene2 / scene3 pick the sample scenes, layout / grade /
// size pick the cover setup, kicker / title / place set the caption.
// main.js paints and raises window.__shotReady once the scene is drawn.
import { paintScene, SCENES } from './samples.js';

function sceneCanvas(name, fallback) {
  const pick = SCENES.includes(name) ? name : fallback;
  return paintScene(pick, 1080, 1080);
}

export function runShot(shot, query, apply) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const first = query.get('scene') ?? 'marina';
  const second = query.get('scene2') ?? 'palmrow';
  const third = query.get('scene3') ?? 'boardwalk';
  const slots = [first, second, third].map((name) => ({
    source: sceneCanvas(name, 'marina'),
    zoom: 1,
    ox: 0,
    oy: 0,
  }));
  apply({
    slots,
    active: 0,
    kicker: query.get('kicker') ?? 'Greetings from',
    title: query.get('title') ?? 'Vice City',
    place: query.get('place') ?? 'Ocean Drive',
    layout: query.get('layout') ?? 'triptych',
    grade: query.get('grade') ?? 'duotone',
    sizeKey: query.get('size') ?? 'square',
  });
}
