// Draws the three sample scenes at run time on an offscreen canvas, so the
// editor always has photos to try without shipping any image file. Every
// scene is original flat illustration in the postcard's teal-and-orange
// voice: a skyline, a boulevard and a portrait silhouette. Nothing here is
// a photo of a real person and nothing is game artwork.

export const SAMPLE_SCENES = ['skyline', 'boulevard', 'portrait'];

/** A tiny deterministic random generator, so a scene draws the same twice. */
function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A vertical sky gradient, deep teal at the top warming to orange low down. */
function skyGradient(ctx, w, h, top, mid, low) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(0.55, mid);
  g.addColorStop(1, low);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** A low sun disc, warm cream at its heart fading out to orange. */
function sunDisc(ctx, cx, cy, r) {
  const g = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.08, cx, cy, r);
  g.addColorStop(0, '#ffe9a8');
  g.addColorStop(0.65, '#f7b95c');
  g.addColorStop(1, '#f4822c');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

/** A row of dark buildings with a few lit windows, standing on `baseY`. */
function skylineRow(ctx, w, baseY, topMin, topMax, rand, dark, lit) {
  let x = -w * 0.02;
  while (x < w * 1.02) {
    const bw = w * (0.06 + rand() * 0.09);
    const top = baseY - (topMin + rand() * (topMax - topMin));
    ctx.fillStyle = dark;
    ctx.fillRect(x, top, bw, baseY - top);
    if (rand() < 0.4) {
      // A rooftop aerial, so the roofline stays varied.
      ctx.fillRect(x + bw * 0.45, top - w * 0.03, w * 0.008, w * 0.03);
    }
    ctx.fillStyle = lit;
    const cols = Math.max(1, Math.floor(bw / (w * 0.028)));
    const rows = Math.max(1, Math.floor((baseY - top) / (w * 0.045)));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rand() < 0.28) {
          ctx.fillRect(x + bw * 0.14 + c * w * 0.028, top + w * 0.03 + r * w * 0.045, w * 0.011, w * 0.016);
        }
      }
    }
    x += bw + w * (0.005 + rand() * 0.02);
  }
}

/** Shimmering horizontal streaks for water under a setting sun. */
function waterShimmer(ctx, w, y0, y1, cx, rand) {
  for (let y = y0; y < y1; y += (y1 - y0) / 14) {
    const spread = (y - y0) / (y1 - y0);
    const half = w * (0.05 + spread * 0.22) * (0.7 + rand() * 0.6);
    ctx.fillStyle = `rgba(247, 185, 92, ${0.5 - spread * 0.3})`;
    ctx.fillRect(cx - half, y, half * 2, (y1 - y0) / 28);
  }
}

/** Skyline: a synthwave sun over a waterfront skyline at dusk. */
function drawSkyline(ctx, w, h) {
  const rand = seededRandom(11);
  skyGradient(ctx, w, h, '#0b4a52', '#127a7d', '#f4822c');
  const cx = w * 0.5;
  const cy = h * 0.52;
  sunDisc(ctx, cx, cy, w * 0.2);
  // Thin slits cut across the sun, synthwave style.
  ctx.fillStyle = '#127a7d';
  for (let i = 0; i < 4; i++) {
    const y = cy + w * (0.02 + i * 0.045);
    ctx.fillRect(cx - w * 0.2, y, w * 0.4, w * (0.008 + i * 0.004));
  }
  skylineRow(ctx, w, h * 0.78, h * 0.16, h * 0.34, rand, '#0e2a30', '#eeb24a');
  ctx.fillStyle = '#0b4a52';
  ctx.fillRect(0, h * 0.78, w, h * 0.22);
  waterShimmer(ctx, w, h * 0.8, h * 0.97, cx, rand);
}

/** A palm tree silhouette: a leaning trunk with drooping fronds. */
function palmTree(ctx, x, y, s, lean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.strokeStyle = '#0e2a30';
  ctx.lineWidth = s * 0.07;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(s * 0.08, -s * 0.55, s * 0.02, -s);
  ctx.stroke();
  ctx.translate(s * 0.02, -s);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.08 + (i / 7) * 0.85);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.cos(a) * s * 0.45, Math.sin(a) * s * 0.45 - s * 0.1, Math.cos(a) * s * 0.85, Math.sin(a) * s * 0.85 + s * 0.28);
    ctx.stroke();
  }
  ctx.restore();
}

/** Boulevard: a neon street running into the sunset, palms on both sides. */
function drawBoulevard(ctx, w, h) {
  const rand = seededRandom(23);
  skyGradient(ctx, w, h, '#123a44', '#d65420', '#f7b95c');
  const cx = w * 0.5;
  sunDisc(ctx, cx, h * 0.42, w * 0.16);
  // Flanking blocks with neon shop signs.
  const neons = ['#f4822c', '#eeb24a', '#127a7d', '#ff5a7a'];
  for (const side of [-1, 1]) {
    let y = h * 0.3;
    let depth = 0;
    while (y < h * 0.72 && depth < 5) {
      const bh = h * (0.1 + rand() * 0.08);
      const bw = w * (0.1 + rand() * 0.08);
      const bx = side < 0 ? w * (0.02 + depth * 0.015) : w - bw - w * (0.02 + depth * 0.015);
      ctx.fillStyle = depth % 2 ? '#14343c' : '#0e2a30';
      ctx.fillRect(bx, y, bw, bh);
      ctx.fillStyle = neons[Math.floor(rand() * neons.length)];
      ctx.fillRect(bx + bw * 0.12, y + bh * 0.2, bw * 0.76, bh * 0.16);
      ctx.fillStyle = 'rgba(238, 178, 74, 0.85)';
      for (let k = 0; k < 4; k++) {
        if (rand() < 0.5) ctx.fillRect(bx + bw * 0.14 + k * bw * 0.2, y + bh * 0.5, bw * 0.08, bh * 0.3);
      }
      y += bh + h * 0.02;
      depth++;
    }
  }
  // The road, narrowing toward the sun.
  ctx.fillStyle = '#1c2f36';
  ctx.beginPath();
  ctx.moveTo(w * 0.18, h);
  ctx.lineTo(w * 0.44, h * 0.62);
  ctx.lineTo(w * 0.56, h * 0.62);
  ctx.lineTo(w * 0.82, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#eeb24a';
  ctx.lineWidth = w * 0.012;
  ctx.setLineDash([w * 0.05, w * 0.04]);
  ctx.beginPath();
  ctx.moveTo(cx, h);
  ctx.lineTo(cx, h * 0.62);
  ctx.stroke();
  ctx.setLineDash([]);
  palmTree(ctx, w * 0.1, h * 0.86, w * 0.3, 0.12);
  palmTree(ctx, w * 0.9, h * 0.9, w * 0.34, -0.14);
  palmTree(ctx, w * 0.24, h * 0.7, w * 0.2, 0.08);
  palmTree(ctx, w * 0.78, h * 0.72, w * 0.22, -0.1);
}

/** Portrait: a head-and-shoulders silhouette against a big postcard sun. */
function drawPortrait(ctx, w, h) {
  const rand = seededRandom(37);
  skyGradient(ctx, w, h, '#0b4a52', '#2a7a6e', '#f4822c');
  const cx = w * 0.5;
  const cy = h * 0.44;
  sunDisc(ctx, cx, cy, w * 0.3);
  ctx.strokeStyle = 'rgba(248, 236, 212, 0.5)';
  ctx.lineWidth = w * 0.006;
  for (const r of [0.34, 0.4]) {
    ctx.beginPath();
    ctx.arc(cx, cy, w * r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // A few birds crossing the sun.
  ctx.strokeStyle = '#0e2a30';
  ctx.lineWidth = w * 0.008;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const bx = w * (0.2 + i * 0.14);
    const by = h * (0.2 + i * 0.05);
    const s = w * 0.03;
    ctx.beginPath();
    ctx.moveTo(bx - s, by);
    ctx.quadraticCurveTo(bx - s * 0.4, by - s * 0.7, bx, by);
    ctx.quadraticCurveTo(bx + s * 0.4, by - s * 0.7, bx + s, by);
    ctx.stroke();
  }
  // The silhouette: round head, neck and shoulders, rimmed in warm light.
  ctx.fillStyle = '#0e2a30';
  ctx.beginPath();
  ctx.arc(cx, h * 0.5, w * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.05, h * 0.63);
  ctx.lineTo(cx + w * 0.05, h * 0.63);
  ctx.lineTo(cx + w * 0.26, h);
  ctx.lineTo(cx - w * 0.26, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#f7b95c';
  ctx.lineWidth = w * 0.008;
  ctx.beginPath();
  ctx.arc(cx, h * 0.5, w * 0.15, -Math.PI * 0.85, -Math.PI * 0.15);
  ctx.stroke();
  // A sliver of skyline at the very bottom, to ground the figure.
  skylineRow(ctx, w, h * 0.99, h * 0.03, h * 0.07, rand, '#0e2a30', '#eeb24a');
  void rand;
}

const DRAWERS = { skyline: drawSkyline, boulevard: drawBoulevard, portrait: drawPortrait };

/**
 * Draws one sample scene onto a fresh canvas of `w` by `h` and returns it.
 * The canvas drops straight into a photo slot, exactly like an upload.
 */
export function makeSampleScene(name, w = 1080, h = 1080) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(2, Math.round(w));
  canvas.height = Math.max(2, Math.round(h));
  const draw = DRAWERS[name] ?? DRAWERS.skyline;
  draw(canvas.getContext('2d'), canvas.width, canvas.height);
  return canvas;
}
