// Fixed scenes for screenshots, driven by the `?shot=` query:
//   ?shot=cover — the cover alone, edge to edge (the app's own drawing of the
//     PNG it exports, at the chosen post size)
//   ?shot=editor — the editor with photos loaded
// Extra params: size=1080x1080|1080x1350|1920x1080, layout=postcard|triptych|
// split, grade=duotone|sepia|mono|original, title, kicker, place,
// photo=<scene for slot 1>, photo2=<scene for slot 2>, photo3=<scene for
// slot 3>, where a scene is one of skyline, boulevard, portrait.
export function runShot(shot, query, applyScene) {
  const photos = [];
  const p1 = query.get('photo') ?? 'skyline';
  const p2 = query.get('photo2') ?? 'portrait';
  const p3 = query.get('photo3') ?? 'boulevard';
  const layout = query.get('layout') ?? 'triptych';
  if (shot === 'cover' && layout === 'postcard') photos.push([0, p1]);
  else photos.push([0, p1], [1, p2], [2, p3]);
  applyScene({
    size: query.get('size') ?? '1080x1080',
    layout,
    grade: query.get('grade') ?? 'duotone',
    kicker: query.get('kicker') ?? 'GREETINGS FROM',
    title: query.get('title') ?? 'VICE CITY',
    place: query.get('place') ?? 'VICE CITY · FLORIDA',
    photos,
  });
}
