// Wires the Vice City Postcard editor: photo slots, layout / grade / size
// choices, caption fields, drag-to-pan cropping, live preview and PNG export.
// A `?shot=` query sets up a fixed scene for a screenshot instead (shots.js).
import { renderCover, panelRects } from './cover.js';
import { runShot } from './shots.js';

const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};
const SAMPLE_NAMES = ['skyline.jpg', 'boulevard.jpg', 'portrait.jpg'];

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const kickerInput = document.getElementById('kicker');
const titleInput = document.getElementById('title');
const placeInput = document.getElementById('place');

const state = {
  photos: [null, null, null],
  activeSlot: 0,
  layout: 'postcard',
  grade: 'duotone',
  size: '1080x1080',
};

const fontsReady = Promise.all([
  document.fonts.load('900 100px "Playfair Display"'),
  document.fonts.load('800 20px "Archivo"'),
  document.fonts.load('700 20px "Archivo"'),
]).catch(() => { /* fall back to system fonts */ });

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function stateForRender() {
  return {
    photos: state.photos,
    layout: state.layout,
    kicker: kickerInput.value,
    title: titleInput.value,
    place: placeInput.value,
    grade: state.grade,
  };
}

function redraw() {
  renderCover(canvas, stateForRender());
}

function redrawSoon() {
  requestAnimationFrame(redraw);
}

/** Builds the three photo slots (file input + zoom slider each). */
function buildSlots() {
  const host = document.getElementById('slots');
  state.photos.forEach((_, i) => {
    const slot = document.createElement('div');
    slot.className = 'slot' + (i === state.activeSlot ? ' active' : '');
    slot.dataset.slot = String(i);
    slot.innerHTML =
      `<img class="slot-thumb" alt="" src="samples/${SAMPLE_NAMES[i]}">` +
      `<div class="slot-body">` +
      `<div class="slot-name">Photo ${i + 1}</div>` +
      `<input type="file" accept="image/*" aria-label="Photo ${i + 1} file">` +
      `<label class="slot-zoom">Zoom <input type="range" min="1" max="3" step="0.05" value="1" aria-label="Photo ${i + 1} zoom"></label>` +
      `</div>`;
    slot.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      setActiveSlot(i);
    });
    slot.querySelector('input[type="file"]').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      state.photos[i] = { img: await loadImage(URL.createObjectURL(file)), zoom: 1, ox: 0, oy: 0 };
      slot.querySelector('.slot-thumb').src = URL.createObjectURL(file);
      setActiveSlot(i);
      redraw();
    });
    slot.querySelector('input[type="range"]').addEventListener('input', (e) => {
      if (!state.photos[i]) state.photos[i] = { img: null, zoom: 1, ox: 0, oy: 0 };
      state.photos[i].zoom = Number(e.target.value);
      redrawSoon();
    });
    host.appendChild(slot);
  });
}

function setActiveSlot(i) {
  state.activeSlot = i;
  document.querySelectorAll('.slot').forEach((el) => {
    el.classList.toggle('active', Number(el.dataset.slot) === i);
  });
}

/** Dragging the canvas pans the photo in the panel under the pointer. */
function wireDrag() {
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const panels = panelRects(canvas, state.layout);
    const hit = panels.findIndex((p) => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h);
    if (hit === -1) return;
    setActiveSlot(hit);
    drag = { slot: hit, lastX: e.clientX, lastY: e.clientY, panel: panels[hit], rect };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const photo = state.photos[drag.slot];
    if (!photo || !photo.img) return;
    const scale = canvas.width / drag.rect.width;
    photo.ox += ((e.clientX - drag.lastX) * scale) / (drag.panel.w * 0.3);
    photo.oy += ((e.clientY - drag.lastY) * scale) / (drag.panel.h * 0.3);
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    redrawSoon();
  });
  const endDrag = () => { drag = null; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
}

function wireChoices() {
  document.getElementById('layout-choices').addEventListener('change', (e) => {
    state.layout = e.target.value;
    redraw();
  });
  document.getElementById('grade-choices').addEventListener('change', (e) => {
    state.grade = e.target.value;
    redraw();
  });
  document.getElementById('size-choices').addEventListener('change', (e) => {
    state.size = e.target.value;
    const [w, h] = SIZES[state.size];
    canvas.width = w;
    canvas.height = h;
    redraw();
  });
  [kickerInput, titleInput, placeInput].forEach((input) => {
    input.addEventListener('input', redrawSoon);
  });
  document.querySelectorAll('.sample-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const img = await loadImage(`samples/${btn.dataset.sample}`);
      const slot = state.activeSlot;
      state.photos[slot] = { img, zoom: 1, ox: 0, oy: 0 };
      document.querySelector(`.slot[data-slot="${slot}"] .slot-thumb`).src = `samples/${btn.dataset.sample}`;
      redraw();
    });
  });
  document.getElementById('export').addEventListener('click', () => {
    canvas.toBlob((blob) => {
      if (!blob) {
        status.textContent = 'Export failed — try again.';
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-city-postcard-${canvas.width}x${canvas.height}.png`;
      a.click();
      status.textContent = `Saved vice-city-postcard-${canvas.width}x${canvas.height}.png`;
    }, 'image/png');
  });
}

/** Applies one fixed screenshot scene (used by ?shot= only). */
async function applyShotScene(scene) {
  if (scene.size && SIZES[scene.size]) {
    state.size = scene.size;
    const [w, h] = SIZES[scene.size];
    canvas.width = w;
    canvas.height = h;
    const sizeRadio = document.querySelector(`input[name="size"][value="${scene.size}"]`);
    if (sizeRadio) sizeRadio.checked = true;
  }
  if (scene.layout) {
    state.layout = scene.layout;
    const layoutRadio = document.querySelector(`input[name="layout"][value="${scene.layout}"]`);
    if (layoutRadio) layoutRadio.checked = true;
  }
  if (scene.grade) {
    state.grade = scene.grade;
    const gradeRadio = document.querySelector(`input[name="grade"][value="${scene.grade}"]`);
    if (gradeRadio) gradeRadio.checked = true;
  }
  if (scene.kicker !== undefined) kickerInput.value = scene.kicker;
  if (scene.title !== undefined) titleInput.value = scene.title;
  if (scene.place !== undefined) placeInput.value = scene.place;
  for (const [slot, sample] of scene.photos || []) {
    state.photos[slot] = { img: await loadImage(`samples/${sample}`), zoom: 1, ox: 0, oy: 0 };
    const thumb = document.querySelector(`.slot[data-slot="${slot}"] .slot-thumb`);
    if (thumb) thumb.src = `samples/${sample}`;
  }
  await fontsReady;
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

buildSlots();
wireDrag();
wireChoices();

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  runShot(shot, query, applyShotScene);
} else {
  // Start with the samples loaded so the first paint already shows a cover.
  (async () => {
    for (let i = 0; i < 3; i++) {
      state.photos[i] = { img: await loadImage(`samples/${SAMPLE_NAMES[i]}`), zoom: 1, ox: 0, oy: 0 };
    }
    await fontsReady;
    redraw();
  })();
}
