// Draws the Vice City Postcard cover: a retro travel-poster card with an
// art-deco sunburst header, one to three photo panels in a teal-and-orange
// grade, a perforated postage stamp, a postmark, and bold lettering. The
// lettering uses fonts every desktop already has — a heavy serif for the
// title, a plain sans for the small caps — so the cover draws identically
// offline with no font file to ship. Everything is drawn on the canvas.

const PAPER = '#f8ecd4';
const TEAL = '#0b4a52';
const TEAL_BRIGHT = '#127a7d';
const ORANGE = '#f4822c';
const ORANGE_DEEP = '#d65420';
const GOLD = '#eeb24a';
const CREAM = '#fff6e0';

// System font stacks: the heavy serif carries the title, the sans the rest.
// Noto Serif Display (Black) and Liberation Sans are the local renders;
// Georgia / Arial cover a visitor's own machine.
const SERIF_DISPLAY = '"Noto Serif Display", Georgia, "Times New Roman", serif';
const SANS = '"Liberation Sans", Arial, "Helvetica Neue", sans-serif';

/** Steps `size` down until `text` fits `maxWidth` in the given font. */
function fitFont(ctx, text, weight, family, size, maxWidth) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (s > 10 && ctx.measureText(text).width > maxWidth) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  return s;
}

/** Paints one photo into a panel rect, cover-fit, with zoom, pan and grade. */
function drawPhotoInto(ctx, photo, x, y, w, h, grade) {
  const off = document.createElement('canvas');
  off.width = Math.max(2, Math.round(w));
  off.height = Math.max(2, Math.round(h));
  const o = off.getContext('2d');
  o.fillStyle = TEAL;
  o.fillRect(0, 0, off.width, off.height);
  if (photo && photo.img) {
    const img = photo.img;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const z = photo.zoom || 1;
    const base = Math.max(w / iw, h / ih) * z;
    const dw = iw * base;
    const dh = ih * base;
    const maxOx = Math.max(0, (dw - w) / 2);
    const maxOy = Math.max(0, (dh - h) / 2);
    const dx = (w - dw) / 2 + Math.max(-maxOx, Math.min(maxOx, (photo.ox || 0) * w * 0.3));
    const dy = (h - dh) / 2 + Math.max(-maxOy, Math.min(maxOy, (photo.oy || 0) * h * 0.3));
    if (grade === 'sepia') o.filter = 'sepia(0.75) saturate(1.1) contrast(1.02)';
    else if (grade === 'mono') o.filter = 'grayscale(1) contrast(1.08) brightness(1.04)';
    o.drawImage(img, dx, dy, dw, dh);
    o.filter = 'none';
    if (grade === 'duotone') {
      const g = o.createLinearGradient(0, 0, w * 0.4, h);
      g.addColorStop(0, 'rgba(18, 122, 125, 0.55)');
      g.addColorStop(1, 'rgba(244, 130, 44, 0.5)');
      o.globalCompositeOperation = 'overlay';
      o.fillStyle = g;
      o.fillRect(0, 0, w, h);
      o.globalCompositeOperation = 'multiply';
      o.fillStyle = 'rgba(11, 74, 82, 0.14)';
      o.fillRect(0, 0, w, h);
      o.globalCompositeOperation = 'source-over';
    }
  } else {
    // Empty slot: diagonal stripes and a prompt, so the card never breaks.
    o.save();
    o.strokeStyle = 'rgba(248, 236, 212, 0.35)';
    o.lineWidth = Math.max(6, w * 0.02);
    for (let i = -h; i < w + h; i += Math.max(24, w * 0.06)) {
      o.beginPath();
      o.moveTo(i, 0);
      o.lineTo(i + h, h);
      o.stroke();
    }
    o.restore();
    o.fillStyle = CREAM;
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    fitFont(o, 'ADD A PHOTO', 800, SANS, h * 0.09, w * 0.8);
    o.fillText('ADD A PHOTO', w / 2, h / 2);
  }
  ctx.drawImage(off, x, y, w, h);
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = Math.max(2, w * 0.006);
  ctx.strokeRect(x, y, w, h);
}

/** Art-deco rays fanning from the sun disc across the header band. */
function drawSunburst(ctx, cx, cy, sunR, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const rays = 28;
  const reach = Math.hypot(w, h);
  for (let i = 0; i < rays; i++) {
    const a0 = (i / rays) * Math.PI * 2;
    const a1 = ((i + 0.5) / rays) * Math.PI * 2;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(18, 122, 125, 0.20)' : 'rgba(244, 130, 44, 0.16)';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, reach, a0, a1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  // Sun disc with a cream ring.
  const g = ctx.createRadialGradient(cx - sunR * 0.25, cy - sunR * 0.25, sunR * 0.1, cx, cy, sunR);
  g.addColorStop(0, '#ffe9a8');
  g.addColorStop(0.7, '#f7b95c');
  g.addColorStop(1, ORANGE);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = Math.max(2, sunR * 0.06);
  ctx.stroke();
}

/** A perforated postage stamp holding a small photo, tilted like a real one. */
function drawStamp(ctx, photo, x, y, s, grade) {
  ctx.save();
  ctx.translate(x + s / 2, y + s / 2);
  ctx.rotate(-0.1);
  ctx.translate(-s / 2, -s / 2);
  ctx.fillStyle = '#fffdf6';
  ctx.shadowColor = 'rgba(14, 42, 48, 0.35)';
  ctx.shadowBlur = s * 0.08;
  ctx.shadowOffsetY = s * 0.02;
  ctx.fillRect(0, 0, s, s);
  ctx.shadowColor = 'transparent';
  const pad = s * 0.07;
  drawPhotoInto(ctx, photo, pad, pad, s - pad * 2, s * 0.66, grade);
  ctx.setLineDash([s * 0.035, s * 0.035]);
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = Math.max(1, s * 0.008);
  ctx.strokeRect(s * 0.028, s * 0.028, s - s * 0.056, s - s * 0.056);
  ctx.setLineDash([]);
  ctx.fillStyle = TEAL;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  fitFont(ctx, 'VICE CITY', 800, SANS, s * 0.11, s * 0.86);
  ctx.fillText('VICE CITY', s / 2, s * 0.8);
  fitFont(ctx, '25¢  ·  U.S. POSTAGE', 700, SANS, s * 0.085, s * 0.86);
  ctx.fillStyle = ORANGE_DEEP;
  ctx.fillText('25¢  ·  U.S. POSTAGE', s / 2, s * 0.91);
  ctx.restore();
}

/** A circular postmark with ring text and wavy cancel lines. */
function drawPostmark(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.35);
  ctx.strokeStyle = 'rgba(11, 74, 82, 0.72)';
  ctx.fillStyle = 'rgba(11, 74, 82, 0.72)';
  ctx.lineWidth = Math.max(2, r * 0.045);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = Math.max(1, r * 0.02);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();
  const word = 'VICE CITY • FLORIDA • ';
  const step = (Math.PI * 2) / word.length;
  ctx.font = `700 ${r * 0.2}px ${SANS}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < word.length; i++) {
    const a = -Math.PI / 2 + i * step;
    ctx.save();
    ctx.rotate(a);
    ctx.translate(0, -r * 0.91);
    ctx.fillText(word[i], 0, 0);
    ctx.restore();
  }
  // Wavy cancel lines through the middle.
  ctx.lineWidth = Math.max(1.5, r * 0.03);
  for (let k = -1; k <= 1; k++) {
    ctx.beginPath();
    for (let t = -r * 0.7; t <= r * 0.7; t += r * 0.1) {
      const yy = k * r * 0.22 + Math.sin(t / r * 4) * r * 0.06;
      if (t === -r * 0.7) ctx.moveTo(t, yy);
      else ctx.lineTo(t, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** A small line—diamond—line ornament for the caption band. */
function drawOrnament(ctx, cx, y, half, colour) {
  const d = half * 0.07;
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = Math.max(1.5, half * 0.012);
  ctx.beginPath();
  ctx.moveTo(cx - half, y);
  ctx.lineTo(cx - d * 1.6, y);
  ctx.moveTo(cx + d * 1.6, y);
  ctx.lineTo(cx + half, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, y - d);
  ctx.lineTo(cx + d, y);
  ctx.lineTo(cx, y + d);
  ctx.lineTo(cx - d, y);
  ctx.closePath();
  ctx.fill();
}

/** Panel rectangles for a layout inside the given area. */
export function layoutPanels(layout, x, y, w, h) {
  const g = Math.max(8, w * 0.014);
  if (layout === 'triptych') {
    const pw = (w - g * 2) / 3;
    return [
      { x, y, w: pw, h },
      { x: x + pw + g, y, w: pw, h },
      { x: x + (pw + g) * 2, y, w: pw, h },
    ];
  }
  if (layout === 'split') {
    const left = w * 0.58;
    const right = w - left - g;
    const ph = (h - g) / 2;
    return [
      { x, y, w: left, h },
      { x: x + left + g, y, w: right, h: ph },
      { x: x + left + g, y: y + ph + g, w: right, h: ph },
    ];
  }
  return [{ x, y, w, h }];
}

/** Panel rectangles for a layout, in canvas pixels (shared by draw + drag). */
export function panelRects(canvas, layout) {
  const W = canvas.width;
  const H = canvas.height;
  const m = Math.round(Math.min(W, H) * 0.032);
  const iw = W - m * 2;
  const ih = H - m * 2;
  const headerH = ih * 0.24;
  const panelsY = m + headerH + Math.max(8, W * 0.012);
  const captionH = ih * 0.21;
  const panelsH = m + ih - captionH - panelsY;
  return layoutPanels(layout, m, panelsY, iw, panelsH);
}

/**
 * Draws the whole postcard onto `canvas` at its own size.
 * state: { photos: [{img, zoom, ox, oy}...], layout, kicker, title, place, grade }
 */
export function renderCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const { photos, layout, kicker, title, place, grade } = state;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  const m = Math.round(Math.min(W, H) * 0.032);
  const ix = m;
  const iy = m;
  const iw = W - m * 2;
  const ih = H - m * 2;

  // Header band: sunburst + sun disc.
  const headerH = ih * 0.24;
  const sunR = headerH * 0.42;
  const sunCx = W / 2;
  const sunCy = iy + headerH * 0.52;
  drawSunburst(ctx, sunCx, sunCy, sunR, ix, iy, iw, headerH);
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = Math.max(2, W * 0.004);
  ctx.beginPath();
  ctx.moveTo(ix, iy + headerH);
  ctx.lineTo(ix + iw, iy + headerH);
  ctx.stroke();

  // Photo panels.
  const captionH = ih * 0.21;
  const panels = panelRects(canvas, layout);
  const panelsY = panels[0].y;
  panels.forEach((p, i) => drawPhotoInto(ctx, photos[i], p.x, p.y, p.w, p.h, grade));

  // Stamp + postmark overlapping the top-right panel corner. The postmark
  // sits a touch further left so its ring text stays clear of the stamp.
  const stampS = Math.min(W, H) * 0.17;
  const stampPhoto = photos[1] && photos[1].img ? photos[1] : photos[0];
  drawStamp(ctx, stampPhoto, ix + iw - stampS - W * 0.012, panelsY - stampS * 0.28, stampS, grade);
  drawPostmark(ctx, ix + iw - stampS * 1.4, panelsY + stampS * 0.06, stampS * 0.4);

  // Caption band.
  const capY = iy + ih - captionH;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const kick = (kicker || '').trim().toUpperCase();
  if (kick) {
    ctx.fillStyle = ORANGE_DEEP;
    ctx.font = `800 ${Math.round(H * 0.02)}px ${SANS}`;
    try { ctx.letterSpacing = `${Math.round(H * 0.004)}px`; } catch { /* older canvas */ }
    ctx.fillText(kick, W / 2, capY + captionH * 0.22);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  }
  const name = (title || 'VICE CITY').trim().toUpperCase() || 'VICE CITY';
  const titleSize = fitFont(ctx, name, 900, SERIF_DISPLAY, H * 0.082, iw * 0.9);
  ctx.fillStyle = TEAL;
  ctx.fillText(name, W / 2, capY + captionH * 0.22 + titleSize * 1.02);
  drawOrnament(ctx, W / 2, capY + captionH * 0.78, iw * 0.16, GOLD);
  const placeLine = (place || '').trim().toUpperCase();
  if (placeLine) {
    ctx.fillStyle = TEAL_BRIGHT;
    ctx.font = `700 ${Math.round(H * 0.016)}px ${SANS}`;
    try { ctx.letterSpacing = `${Math.round(H * 0.003)}px`; } catch { /* older canvas */ }
    ctx.fillText(placeLine, W / 2, capY + captionH * 0.95);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  }

  // Double-rule postcard frame.
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = Math.max(3, Math.min(W, H) * 0.006);
  ctx.strokeRect(ix, iy, iw, ih);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = Math.max(1, Math.min(W, H) * 0.002);
  ctx.strokeRect(ix + 7, iy + 7, iw - 14, ih - 14);
}
