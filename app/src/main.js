// Wires the Vice City Postcard editor: photo slots, caption fields,
// layout / grade / size picks, drag-to-pan, zoom and PNG export.
// A `?shot=` query hands control to shots.js for a fixed screenshot
// scene instead. The preview canvas always renders at the export size,
// so what the editor shows is what the PNG holds.
import { renderPostcard, SIZES, LAYOUTS, GRADES } from './cover.js';
import { paintScene, SCENES } from './samples.js';
import { runShot } from './shots.js';

const preview = document.getElementById('preview');
const statusLine = document.getElementById('status');
const exportButton = document.getElementById('export');

const state = {
  slots: [0, 1, 2].map(() => ({ source: null, zoom: 1, ox: 0, oy: 0 })),
  active: 0,
  kicker: 'Greetings from',
  title: 'Vice City',
  place: 'Ocean Drive',
  layout: 'triptych',
  grade: 'duotone',
  sizeKey: 'square',
};

function refresh() {
  renderPostcard(preview, {
    slots: state.slots,
    kicker: state.kicker,
    title: state.title,
    place: state.place,
    layout: state.layout,
    grade: state.grade,
    sizeKey: state.sizeKey,
  });
  const [w, h] = SIZES[state.sizeKey];
  exportButton.textContent = `Export PNG ${w} x ${h}`;
}

function setStatus(text) {
  statusLine.textContent = text;
}

function loadFileImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not read that photo'));
    img.src = URL.createObjectURL(file);
  });
}

function useSample(name) {
  const scene = paintScene(name, 1080, 1080);
  state.slots[state.active] = { source: scene, zoom: 1, ox: 0, oy: 0 };
  document.getElementById(`zoom-${state.active}`).value = 1;
  refresh();
  setStatus(`Photo ${state.active + 1} is the ${name} scene.`);
}

function bindSlot(i) {
  const fileInput = document.getElementById(`file-${i}`);
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const img = await loadFileImage(file);
      state.slots[i] = { source: img, zoom: 1, ox: 0, oy: 0 };
      state.active = i;
      document.getElementById(`zoom-${i}`).value = 1;
      markActive();
      refresh();
      setStatus(`Photo ${i + 1} loaded from your machine.`);
    } catch {
      setStatus('That photo could not be read. Try another file.');
    }
  });
  document.getElementById(`pick-${i}`).addEventListener('click', () => {
    state.active = i;
    markActive();
    refresh();
  });
  document.getElementById(`zoom-${i}`).addEventListener('input', (e) => {
    state.slots[i].zoom = Number(e.target.value);
    if (state.active === i) refresh();
  });
}

function markActive() {
  for (let i = 0; i < 3; i++) {
    document.getElementById(`slot-${i}`).classList.toggle('active', state.active === i);
  }
}

function bindText(id, key) {
  document.getElementById(id).addEventListener('input', (e) => {
    state[key] = e.target.value;
    refresh();
  });
}

function bindGroup(name, key, values) {
  for (const value of values) {
    const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (!input) continue;
    input.addEventListener('change', () => {
      state[key] = value;
      refresh();
    });
  }
}

// Drag on the preview pans the active photo inside its panel.
let dragging = null;
preview.addEventListener('pointerdown', (e) => {
  dragging = { x: e.clientX, y: e.clientY };
  preview.setPointerCapture(e.pointerId);
});
preview.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const rect = preview.getBoundingClientRect();
  const slot = state.slots[state.active];
  slot.ox += (e.clientX - dragging.x) / rect.width;
  slot.oy += (e.clientY - dragging.y) / rect.height;
  slot.ox = Math.max(-0.6, Math.min(0.6, slot.ox));
  slot.oy = Math.max(-0.6, Math.min(0.6, slot.oy));
  dragging = { x: e.clientX, y: e.clientY };
  refresh();
});
preview.addEventListener('pointerup', () => { dragging = null; });

exportButton.addEventListener('click', () => {
  const [w, h] = SIZES[state.sizeKey];
  preview.toBlob((blob) => {
    if (!blob) {
      setStatus('Export failed — try again.');
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-city-postcard-${w}x${h}.png`;
    a.click();
    setStatus(`Saved vice-city-postcard-${w}x${h}.png`);
  }, 'image/png');
});

for (let i = 0; i < 3; i++) bindSlot(i);
for (const name of SCENES) {
  document.getElementById(`sample-${name}`).addEventListener('click', () => useSample(name));
}
bindText('kicker', 'kicker');
bindText('title', 'title');
bindText('place', 'place');
bindGroup('layout', 'layout', LAYOUTS);
bindGroup('grade', 'grade', GRADES);
bindGroup('size', 'sizeKey', Object.keys(SIZES));

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, (patch) => {
    Object.assign(state, patch);
    markActive();
    refresh();
    requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
  });
} else {
  // First run: fill the three slots with the three sample scenes.
  SCENES.forEach((name, i) => { state.slots[i] = { source: paintScene(name, 1080, 1080), zoom: 1, ox: 0, oy: 0 }; });
  markActive();
  refresh();
}
