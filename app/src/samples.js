// Runtime-drawn sample scenes for the Vice City Postcard maker.
// Every scene is painted procedurally onto a canvas when the app loads:
// no image files, no network, nothing to download. Each scene is a
// deterministic function of its name, so the same scene always looks
// the same. Scenes: marina (dusk harbour), palmrow (neon avenue at
// night), boardwalk (sunny beach promenade with a ferris wheel).

export const SCENES = ['marina', 'palmrow', 'boardwalk'];

/** Small deterministic generator: the same seed always gives the same stream. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sky(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function stars(ctx, w, h, rand, n) {
  ctx.fillStyle = '#fff8e0';
  for (let i = 0; i < n; i++) {
    const x = rand() * w;
    const y = rand() * h * 0.45;
    const r = 0.8 + rand() * 1.8;
    ctx.globalAlpha = 0.35 + rand() * 0.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function gull(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, s * 0.09);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.quadraticCurveTo(x - s * 0.45, y - s * 0.55, x, y);
  ctx.quadraticCurveTo(x + s * 0.45, y - s * 0.55, x + s, y);
  ctx.stroke();
}

/** A low sun cut by horizontal slits, synthwave style. */
function slitSun(ctx, x, y, r, top, bottom) {
  const g = ctx.createLinearGradient(0, y - r, 0, y + r);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.fillStyle = 'rgba(20, 16, 40, 0.9)';
  let yy = y + r * 0.08;
  let gap = r * 0.07;
  while (yy < y + r) {
    ctx.fillRect(x - r, yy, r * 2, gap);
    yy += gap * 2.4;
    gap *= 1.5;
  }
  ctx.restore();
}

function palm(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, s * 0.05);
  ctx.lineCap = 'round';
  // trunk, leaning slightly
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.06, y - s * 0.55, x + s * 0.16, y - s * 0.95);
  ctx.stroke();
  const topX = x + s * 0.16;
  const topY = y - s * 0.95;
  // fronds fan upward from the crown: each arches up first, then tips
  // gently down, like a real palm silhouette
  ctx.lineWidth = Math.max(1.5, s * 0.035);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.06 + i * 0.146);
    const len = s * (0.34 + 0.14 * Math.sin((i / 6) * Math.PI));
    const tipX = topX + Math.cos(a) * len;
    const tipY = topY + Math.sin(a) * len * 0.72;
    const midX = (topX + tipX) / 2;
    const midY = (topY + tipY) / 2 - len * 0.22;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    ctx.stroke();
  }
  // coconuts at the crown
  ctx.beginPath();
  ctx.arc(topX - s * 0.03, topY + s * 0.02, s * 0.03, 0, Math.PI * 2);
  ctx.arc(topX + s * 0.04, topY + s * 0.03, s * 0.025, 0, Math.PI * 2);
  ctx.fill();
}

/** Marina: a dusk harbour, slit sun low over the water, yachts at anchor. */
function paintMarina(ctx, w, h) {
  const rand = mulberry32(4102);
  sky(ctx, w, h, [[0, '#2b3a67'], [0.45, '#c65f7e'], [0.72, '#ff9a5c'], [1, '#ffc46b']]);
  slitSun(ctx, w * 0.5, h * 0.62, h * 0.26, '#ffe9a8', '#ff5e7a');
  // sea
  ctx.fillStyle = '#1d2f52';
  ctx.fillRect(0, h * 0.68, w, h * 0.32);
  // sun reflection dashes
  ctx.fillStyle = 'rgba(255, 170, 90, 0.75)';
  for (let i = 0; i < 26; i++) {
    const y = h * (0.7 + rand() * 0.28);
    const lw = w * (0.02 + rand() * 0.09) * (1 - (y - h * 0.7) / (h * 0.3));
    ctx.fillRect(w * 0.5 - lw / 2 + (rand() - 0.5) * w * 0.08, y, lw, h * 0.008);
  }
  // pier with string lights
  ctx.fillStyle = '#14101f';
  ctx.fillRect(0, h * 0.66, w, h * 0.02);
  for (let x = w * 0.03; x < w; x += w * 0.045) {
    ctx.fillStyle = ['#ffd166', '#ff6b9d', '#7ef0e0'][Math.floor(rand() * 3)];
    ctx.beginPath();
    ctx.arc(x, h * 0.645 + Math.sin(x * 0.02) * h * 0.004, h * 0.006, 0, Math.PI * 2);
    ctx.fill();
  }
  // yachts
  for (const [fx, fs, sail] of [[0.16, 1, '#f5ead2'], [0.78, 0.8, '#ffd9a0']]) {
    const bx = w * fx;
    const by = h * 0.78;
    const s = h * 0.16 * fs;
    ctx.fillStyle = '#0e0a18';
    ctx.beginPath();
    ctx.moveTo(bx - s * 0.9, by);
    ctx.lineTo(bx + s * 0.9, by);
    ctx.lineTo(bx + s * 0.6, by + s * 0.28);
    ctx.lineTo(bx - s * 0.6, by + s * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0e0a18';
    ctx.lineWidth = s * 0.05;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by - s * 1.5);
    ctx.stroke();
    ctx.fillStyle = sail;
    ctx.beginPath();
    ctx.moveTo(bx + s * 0.06, by - s * 1.45);
    ctx.lineTo(bx + s * 0.06, by - s * 0.1);
    ctx.lineTo(bx + s * 0.75, by - s * 0.1);
    ctx.closePath();
    ctx.fill();
  }
  gull(ctx, w * 0.3, h * 0.2, h * 0.05, '#1c1430');
  gull(ctx, w * 0.68, h * 0.14, h * 0.04, '#1c1430');
}

/** Palmrow: a neon avenue at night, road running to a vanishing point. */
function paintPalmrow(ctx, w, h) {
  const rand = mulberry32(7781);
  sky(ctx, w, h, [[0, '#120e2e'], [0.55, '#3b1d5e'], [1, '#7a2a6e']]);
  stars(ctx, w, h, rand, 60);
  // moon
  ctx.fillStyle = '#ffeec4';
  ctx.beginPath();
  ctx.arc(w * 0.78, h * 0.16, h * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 238, 196, 0.25)';
  ctx.beginPath();
  ctx.arc(w * 0.78, h * 0.16, h * 0.11, 0, Math.PI * 2);
  ctx.fill();
  // road
  const vx = w * 0.5;
  const vy = h * 0.52;
  ctx.fillStyle = '#191233';
  ctx.beginPath();
  ctx.moveTo(w * 0.18, h);
  ctx.lineTo(vx - w * 0.02, vy);
  ctx.lineTo(vx + w * 0.02, vy);
  ctx.lineTo(w * 0.82, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = h * 0.006;
  ctx.setLineDash([h * 0.05, h * 0.04]);
  ctx.beginPath();
  ctx.moveTo(vx, vy);
  ctx.lineTo(vx, h);
  ctx.stroke();
  ctx.setLineDash([]);
  // neon sign blocks on both sides
  const signs = [
    [0.06, 0.3, '#ff2e88'], [0.1, 0.52, '#00e5c7'], [0.82, 0.28, '#00e5c7'],
    [0.86, 0.5, '#ffb020'], [0.2, 0.62, '#ff2e88'], [0.72, 0.64, '#ff5e7a'],
  ];
  for (const [fx, fy, color] of signs) {
    const bw = w * 0.09;
    const bh = h * 0.075;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(w * fx, h * fy, bw, bh);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(w * fx + bw * 0.12, h * fy + bh * 0.35, bw * 0.76, bh * 0.14);
    ctx.fillRect(w * fx + bw * 0.12, h * fy + bh * 0.58, bw * 0.5, bh * 0.14);
  }
  // palms framing the avenue
  palm(ctx, w * 0.05, h * 0.98, h * 0.42, '#0a0616');
  palm(ctx, w * 0.95, h * 0.98, h * 0.38, '#0a0616');
  palm(ctx, w * 0.32, h * 0.62, h * 0.2, '#0a0616');
  palm(ctx, w * 0.68, h * 0.62, h * 0.18, '#0a0616');
  gull(ctx, w * 0.4, h * 0.18, h * 0.045, '#e8ddff');
}

/** Boardwalk: a sunny beach promenade, ferris wheel over the ocean. */
function paintBoardwalk(ctx, w, h) {
  const rand = mulberry32(20240);
  sky(ctx, w, h, [[0, '#7ec8e8'], [0.5, '#ffe3a1'], [1, '#ffb26b']]);
  // sun
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(w * 0.8, h * 0.18, h * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 243, 196, 0.35)';
  ctx.beginPath();
  ctx.arc(w * 0.8, h * 0.18, h * 0.16, 0, Math.PI * 2);
  ctx.fill();
  // ocean
  ctx.fillStyle = '#2a7f9e';
  ctx.fillRect(0, h * 0.58, w, h * 0.16);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = h * 0.006;
  for (let i = 0; i < 8; i++) {
    const y = h * (0.6 + i * 0.018);
    ctx.beginPath();
    ctx.moveTo(w * (0.05 + rand() * 0.1), y);
    ctx.lineTo(w * (0.5 + rand() * 0.4), y);
    ctx.stroke();
  }
  // sand
  ctx.fillStyle = '#f2d8a0';
  ctx.fillRect(0, h * 0.74, w, h * 0.26);
  // boardwalk planks
  ctx.fillStyle = '#a4713f';
  ctx.fillRect(0, h * 0.72, w, h * 0.05);
  ctx.strokeStyle = 'rgba(60, 30, 10, 0.5)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += w * 0.04) {
    ctx.beginPath();
    ctx.moveTo(x, h * 0.72);
    ctx.lineTo(x, h * 0.77);
    ctx.stroke();
  }
  // ferris wheel
  const cx = w * 0.24;
  const cy = h * 0.42;
  const r = h * 0.22;
  ctx.strokeStyle = '#20304a';
  ctx.lineWidth = h * 0.012;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = h * 0.006;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
    ctx.fillStyle = ['#ff5e7a', '#ffd166', '#2ec4b6'][i % 3];
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, h * 0.018, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#20304a';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.12, h * 0.74);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx + r * 0.12, h * 0.74);
  ctx.closePath();
  ctx.fill();
  palm(ctx, w * 0.88, h * 0.98, h * 0.34, '#274d2d');
  gull(ctx, w * 0.55, h * 0.12, h * 0.045, '#20304a');
  gull(ctx, w * 0.68, h * 0.2, h * 0.035, '#20304a');
}

/** Paints the named scene onto a fresh canvas of the given size. */
export function paintScene(name, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(2, Math.round(w));
  canvas.height = Math.max(2, Math.round(h));
  const ctx = canvas.getContext('2d');
  if (name === 'palmrow') paintPalmrow(ctx, canvas.width, canvas.height);
  else if (name === 'boardwalk') paintBoardwalk(ctx, canvas.width, canvas.height);
  else paintMarina(ctx, canvas.width, canvas.height);
  return canvas;
}
