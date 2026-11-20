// Renders the Vice City postcard: photo panels, a colour grade, an
// art-deco sunburst, a caption band, a double-rule frame, a perforated
// stamp and a circular postmark. Everything is drawn on canvas, so the
// preview on screen and the exported PNG are the same drawing.

export const SIZES = {
  square: [1080, 1080],
  portrait: [1080, 1350],
  wide: [1920, 1080],
};

export const LAYOUTS = ['postcard', 'triptych', 'split', 'stack'];
export const GRADES = ['duotone', 'sepia', 'mono', 'original', 'noir'];

const PAPER = '#f4ead3';
const PAPER_EDGE = '#e6d6b4';
const INK = '#17323a';
const TEAL = '#0f6b6b';
const GOLD = '#c9973b';
const GOLD_SOFT = '#e3b96a';

/** Draws a photo (image or canvas) cover-fitting a rect, with pan/zoom. */
function paintPhoto(ctx, source, x, y, pw, ph, zoom, ox, oy) {
  if (!source) {
    ctx.fillStyle = '#274b52';
    ctx.fillRect(x, y, pw, ph);
    return;
  }
  const sw = source.naturalWidth || source.width;
  const sh = source.naturalHeight || source.height;
  const base = Math.max(pw / sw, ph / sh) * zoom;
  const dw = sw * base;
  const dh = sh * base;
  const dx = x + (pw - dw) / 2 + ox * pw;
  const dy = y + (ph - dh) / 2 + oy * ph;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, pw, ph);
  ctx.clip();
  ctx.drawImage(source, dx, dy, dw, dh);
  ctx.restore();
}

/** Applies the grade: sepia/mono/noir go through a filtered offscreen pass. */
function gradedPhoto(source, pw, ph, grade) {
  if (grade === 'original' || grade === 'duotone') return source;
  const off = document.createElement('canvas');
  off.width = Math.max(2, Math.round(pw));
  off.height = Math.max(2, Math.round(ph));
  const octx = off.getContext('2d');
  const sw = source.naturalWidth || source.width;
  const sh = source.naturalHeight || source.height;
  const base = Math.max(pw / sw, ph / sh);
  if (grade === 'sepia') octx.filter = 'sepia(0.85) contrast(1.05)';
  else if (grade === 'mono') octx.filter = 'grayscale(1) contrast(1.12)';
  else octx.filter = 'grayscale(0.85) contrast(1.15) brightness(1.0)';
  octx.drawImage(source, (pw - sw * base) / 2, (ph - sh * base) / 2, sw * base, sh * base);
  octx.filter = 'none';
  return off;
}

function panelRects(layout, area) {
  const { x, y, w, h } = area;
  const gap = Math.round(w * 0.012);
  if (layout === 'triptych') {
    const pw = (w - gap * 2) / 3;
    return [0, 1, 2].map((i) => ({ x: x + i * (pw + gap), y, w: pw, h }));
  }
  if (layout === 'split') {
    const left = w * 0.58 - gap / 2;
    const right = w - left - gap;
    return [
      { x, y, w: left, h },
      { x: x + left + gap, y, w: right, h: (h - gap) / 2 },
      { x: x + left + gap, y: y + (h + gap) / 2, w: right, h: (h - gap) / 2 },
    ];
  }
  if (layout === 'stack') {
    const ph = (h - gap * 2) / 3;
    return [0, 1, 2].map((i) => ({ x, y: y + i * (ph + gap), w, h: ph }));
  }
  return [{ x, y, w, h }];
}

function sunburst(ctx, cx, cy, r0, r1, count, color) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const spread = (Math.PI * 2) / count * 0.32;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r1, a - spread, a + spread);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** Text along a circle, used for the round postmark. */
function circleText(ctx, text, cx, cy, radius, startAngle, color, font) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const step = (Math.PI * 2) / Math.max(1, text.length + 6);
  for (let i = 0; i < text.length; i++) {
    const a = startAngle + i * step;
    ctx.save();
    ctx.translate(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

/** The perforated stamp: a white square with punched holes, a mini photo inside. */
function stamp(ctx, x, y, size, mini, label) {
  ctx.save();
  ctx.fillStyle = '#fdf8ea';
  ctx.shadowColor = 'rgba(20, 20, 30, 0.35)';
  ctx.shadowBlur = size * 0.06;
  ctx.shadowOffsetY = size * 0.02;
  ctx.fillRect(x, y, size, size);
  ctx.restore();
  // perforation holes around the edge
  ctx.fillStyle = PAPER;
  const step = size / 9;
  for (let i = 0; i < 9; i++) {
    for (const [hx, hy] of [[x + step * i + step / 2, y], [x + step * i + step / 2, y + size]]) {
      ctx.beginPath();
      ctx.arc(hx, hy, step * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const [hx, hy] of [[x, y + step * i + step / 2], [x + size, y + step * i + step / 2]]) {
      ctx.beginPath();
      ctx.arc(hx, hy, step * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const pad = size * 0.09;
  if (mini) paintPhoto(ctx, mini, x + pad, y + pad, size - pad * 2, size - pad * 2.2, 1, 0, 0);
  ctx.fillStyle = INK;
  ctx.font = `700 ${Math.round(size * 0.075)}px "Liberation Sans", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(label, x + size / 2, y + size - pad * 0.4);
}

export function renderPostcard(canvas, opts) {
  const { slots, kicker, title, place, layout, grade, sizeKey } = opts;
  const [W, H] = SIZES[sizeKey] ?? SIZES.square;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const u = W / 1080; // unit: fractions of the square width

  // paper
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = PAPER_EDGE;
  ctx.fillRect(0, 0, W, H * 0.012);

  const margin = Math.round(34 * u);
  const photoTop = Math.round(30 * u);
  const bandH = Math.round(H * 0.28);
  const photoArea = { x: margin, y: photoTop, w: W - margin * 2, h: H - photoTop - bandH - margin };
  const rects = panelRects(layout, photoArea);

  // photos, each through its grade
  rects.forEach((r, i) => {
    const slot = slots[i] ?? slots[0];
    const source = slot?.source ? gradedPhoto(slot.source, r.w, r.h, grade) : null;
    paintPhoto(ctx, source, r.x, r.y, r.w, r.h, slot?.zoom ?? 1, slot?.ox ?? 0, slot?.oy ?? 0);
    ctx.strokeStyle = 'rgba(23, 50, 58, 0.9)';
    ctx.lineWidth = Math.max(2, 3 * u);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
  });

  // duotone wash over the photo area
  if (grade === 'duotone') {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    const g = ctx.createLinearGradient(photoArea.x, photoArea.y, photoArea.x + photoArea.w, photoArea.y + photoArea.h);
    g.addColorStop(0, 'rgba(15, 107, 107, 0.35)');
    g.addColorStop(1, 'rgba(255, 120, 60, 0.35)');
    ctx.fillStyle = g;
    ctx.fillRect(photoArea.x, photoArea.y, photoArea.w, photoArea.h);
    ctx.restore();
  }

  // caption band: kicker, big serif title, place line, centred as a
  // block inside the band; the whole block scales down if it would
  // not fit, so the title can never run into the kicker.
  const bandY = H - bandH - margin / 2;
  sunburst(ctx, W / 2, bandY + bandH * 0.55, bandH * 0.1, bandH * 1.5, 18, 'rgba(201, 151, 59, 0.16)');
  const cx = W / 2;
  ctx.textAlign = 'center';
  const kick = (kicker || '').trim().toUpperCase();
  const words = (title || 'VICE CITY').trim().toUpperCase();
  const pl = (place || '').trim().toUpperCase();
  const serif = (s) => `900 ${s}px "Noto Serif", Georgia, "Times New Roman", serif`;
  let kSize = Math.round(26 * u);
  let pSize = Math.round(24 * u);
  let tSize = Math.round(96 * u);
  let kickGap = Math.round(30 * u);
  let placeGap = Math.round(32 * u);
  const measureTitle = () => {
    ctx.font = serif(tSize);
    while (tSize > Math.round(34 * u) && ctx.measureText(words).width > W - margin * 3) {
      tSize -= 2;
      ctx.font = serif(tSize);
    }
    const m = ctx.measureText(words);
    return {
      ascent: m.actualBoundingBoxAscent || tSize * 0.72,
      descent: m.actualBoundingBoxDescent || tSize * 0.2,
    };
  };
  let { ascent, descent } = measureTitle();
  let blockH = (kick ? kSize + kickGap : 0) + ascent + descent + (pl ? placeGap + pSize : 0);
  const avail = bandH * 0.92;
  if (blockH > avail) {
    const s = avail / blockH;
    kSize *= s;
    pSize *= s;
    tSize *= s;
    kickGap *= s;
    placeGap *= s;
    ({ ascent, descent } = measureTitle());
    blockH = (kick ? kSize + kickGap : 0) + ascent + descent + (pl ? placeGap + pSize : 0);
  }
  let y = bandY + (bandH - blockH) / 2;
  if (kick) {
    ctx.fillStyle = TEAL;
    ctx.font = `700 ${kSize}px "Liberation Sans", Arial, sans-serif`;
    ctx.fillText(kick.split('').join('\u2009'), cx, y + kSize * 0.8);
    y += kSize + kickGap;
  }
  ctx.font = serif(tSize);
  ctx.fillStyle = INK;
  ctx.fillText(words, cx, y + ascent);
  y += ascent + descent;
  if (pl) {
    ctx.fillStyle = '#8a6a2f';
    ctx.font = `600 ${pSize}px "Liberation Sans", Arial, sans-serif`;
    ctx.fillText(`— ${pl} —`, cx, y + placeGap + pSize * 0.8);
  }

  // stamp + postmark, top right over the photo area
  const stampSize = Math.round(150 * u);
  const sx = W - margin - stampSize - Math.round(14 * u);
  const sy = photoTop + Math.round(14 * u);
  stamp(ctx, sx, sy, stampSize, slots[0]?.source ?? null, 'VICE CITY');
  const pmR = Math.round(62 * u);
  const pmx = sx - Math.round(42 * u);
  const pmy = sy + stampSize - Math.round(2 * u);
  ctx.save();
  ctx.translate(pmx, pmy);
  ctx.rotate(-0.35);
  ctx.strokeStyle = 'rgba(23, 50, 58, 0.75)';
  ctx.lineWidth = Math.max(2, 3 * u);
  ctx.beginPath();
  ctx.arc(0, 0, pmR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, pmR * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  circleText(ctx, 'VICE CITY • FLORIDA • ', 0, 0, pmR * 0.89, -Math.PI / 2, 'rgba(23, 50, 58, 0.8)', `700 ${Math.round(15 * u)}px "Liberation Sans", Arial, sans-serif`);
  ctx.fillStyle = 'rgba(23, 50, 58, 0.8)';
  ctx.font = `900 ${Math.round(22 * u)}px "Noto Serif", Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText('NOV', 0, -2);
  ctx.font = `700 ${Math.round(15 * u)}px "Liberation Sans", Arial, sans-serif`;
  ctx.fillText('20', 0, Math.round(20 * u));
  ctx.restore();

  // double-rule frame
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = Math.max(3, 6 * u);
  ctx.strokeRect(margin / 2, margin / 2, W - margin, H - margin);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = Math.max(1.5, 2.5 * u);
  ctx.strokeRect(margin / 2 + 10 * u, margin / 2 + 10 * u, W - margin - 20 * u, H - margin - 20 * u);
}
