import { Midi } from "https://cdn.jsdelivr.net/npm/@tonejs/midi@2.0.28/+esm";

// ===== 粒子开关 =====
const particleToggle = document.getElementById("particleToggle");
let enableParticles = false;

if (particleToggle) {
  particleToggle.addEventListener("change", () => {
    enableParticles = particleToggle.checked;
  });
}

// ===== DOM =====
const fileInput = document.getElementById("fileInput");
const bpmInput = document.getElementById("bpmInput");
const applyBpmBtn = document.getElementById("applyBpmBtn");
const scaleSlider = document.getElementById("scaleSlider");
const scaleValue = document.getElementById("scaleValue");
const verticalSlider = document.getElementById("verticalSlider");
const verticalValue = document.getElementById("verticalValue");
const highlightInput = document.getElementById("highlightInput");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const replayBtn = document.getElementById("replayBtn");
const containerWrapper = document.getElementById("noteContainerWrapper");
const container = document.getElementById("noteContainer");

// ===== 状态 =====
let midiData = null;
let allNotes = [];
let noteElements = [];
let pixelsPerSecond = parseInt(scaleSlider.value);
let noteSpacing = parseInt(verticalSlider.value);
const noteHeight = 6;
let customBpm = null;

let originalBpm = 120;
let tempoFactor = 1;
let totalDuration = 0;
let animationStartTime = null;
let playbackTime = 0;
let animationFrame = null;
let paused = false;
let playbackEnded = false;
let hasStarted = false;

let lastFrameTime = 0;

// ===== 高亮时间 =====
let minHighlightTime = 0.20;
highlightInput.value = minHighlightTime;

highlightInput.addEventListener("input", () => {
  const val = parseFloat(highlightInput.value);
  if (!isNaN(val) && val > 0) {
    minHighlightTime = val;
  }
});

// ===== 控件 =====
scaleSlider.addEventListener("input", () => {
  pixelsPerSecond = parseInt(scaleSlider.value);
  scaleValue.textContent = pixelsPerSecond;
  if (hasStarted && !paused) {
    animationStartTime = performance.now() - playbackTime / tempoFactor * 1000;
  }
  if (noteElements.length > 0) rescaleNotes();
});

verticalSlider.addEventListener("input", () => {
  noteSpacing = parseInt(verticalSlider.value);
  verticalValue.textContent = noteSpacing;
  if (noteElements.length > 0) rescaleNotes();
});

// ===== 文件加载 =====
fileInput.addEventListener("change", async (e) => {
  try {
    const file = e.target.files[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    midiData = new Midi(arrayBuffer);

    bpmInput.value = "";
    customBpm = null;

    buildVisualizer();
  } catch (err) {
    console.error(err);
    alert("❌ MIDI 解析失败");
  }
});

applyBpmBtn.addEventListener("click", () => {
  const bpmVal = parseFloat(bpmInput.value);
  if (!isNaN(bpmVal) && bpmVal > 0) {
    customBpm = bpmVal;
    buildVisualizer();
  }
});

// ===== 控制 =====
startBtn.addEventListener("click", () => {
  if (!midiData || hasStarted) return;
  hasStarted = true;
  paused = false;
  playbackTime = 0;
  animationStartTime = performance.now();
  playbackEnded = false;
  requestAnimationFrame(animate);
});

pauseBtn.addEventListener("click", () => {
  if (!hasStarted) return;
  paused = !paused;
  if (!paused) {
    animationStartTime = performance.now() - playbackTime / tempoFactor * 1000;
    requestAnimationFrame(animate);
  }
  pauseBtn.textContent = paused ? "继续" : "暂停";
});

resetBtn.addEventListener("click", () => {
  cancelAnimationFrame(animationFrame);
  midiData = null;
  allNotes = [];
  noteElements = [];
  customBpm = null;
  hasStarted = false;
  paused = false;
  playbackTime = 0;

  fileInput.value = "";
  bpmInput.value = "";

  containerWrapper.scrollLeft = 0;
  container.innerHTML = `<div id="playhead"></div>`;
});

replayBtn.addEventListener("click", () => {
  if (!midiData) return;
  cancelAnimationFrame(animationFrame);
  paused = false;
  playbackTime = 0;
  hasStarted = true;
  animationStartTime = performance.now();
  playbackEnded = false;
  requestAnimationFrame(animate);
});

// ===== 构建 =====
function buildVisualizer() {
  cancelAnimationFrame(animationFrame);
  container.innerHTML = `<div id="playhead"></div>`;
  allNotes = [];
  noteElements = [];
  hasStarted = false;
  paused = false;
  playbackTime = 0;

  originalBpm = midiData.header.tempos?.[0]?.bpm || 120;
  const bpm = customBpm || originalBpm;
  tempoFactor = bpm / originalBpm;

  midiData.tracks.forEach(track => {
    if (track.notes) allNotes = allNotes.concat(track.notes);
  });

  if (allNotes.length === 0) {
    alert("⚠️ 没有音符");
    return;
  }

  allNotes.sort((a, b) => a.time - b.time);

  totalDuration = Math.max(...allNotes.map(n => n.time + n.duration));

  const totalWidth = totalDuration * pixelsPerSecond + 100;
  container.style.width = `${totalWidth}px`;

  allNotes.forEach(note => {
    const div = document.createElement("div");
    div.className = "note";
    container.appendChild(div);
    noteElements.push({ div, note });
  });

  rescaleNotes();
}

// ===== 布局 =====
function rescaleNotes() {
  noteElements.forEach(({ div, note }) => {
    div.style.left = `${note.time * pixelsPerSecond}px`;
    div.style.width = `${Math.max(note.duration * pixelsPerSecond, 2)}px`;
    div.style.top = `${(127 - note.midi) * noteSpacing}px`;
    div.style.height = `${noteHeight}px`;
  });
}

// ===== 粒子系统（优化版） =====
const MAX_PARTICLES = 200;
const particles = [];

function createParticle() {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.display = "none";
  container.appendChild(el);
  return { el, x: 0, y: 0, vx: 0, vy: 0, life: 0, active: false };
}

for (let i = 0; i < MAX_PARTICLES; i++) {
  particles.push(createParticle());
}

function getParticle() {
  return particles.find(p => !p.active);
}

function spawnParticles(x, y) {
  for (let i = 0; i < 3; i++) {
    const p = getParticle();
    if (!p) return;

    p.active = true;
    p.x = x;
    p.y = y;
    p.vx = (Math.random() - 0.5) * 1.5;
    p.vy = (Math.random() - 0.5) * 1.5;
    p.life = 1;

    p.el.style.display = "block";
    p.el.style.opacity = 1;
  }
}

function updateParticles(delta) {
  particles.forEach(p => {
    if (!p.active) return;

    p.life -= delta;
    if (p.life <= 0) {
      p.active = false;
      p.el.style.display = "none";
      return;
    }

    p.x += p.vx * 60 * delta;
    p.y += p.vy * 60 * delta;

    p.el.style.opacity = p.life;
    p.el.style.transform = `translate(${p.x}px, ${p.y}px) scale(${p.life})`;
  });
}

// ===== 动画 =====
function animate(timestamp) {
  if (paused) return;

  if (!animationStartTime) animationStartTime = timestamp;

  const delta = (timestamp - (lastFrameTime || timestamp)) / 1000;
  lastFrameTime = timestamp;

  playbackTime = (timestamp - animationStartTime) / 1000 * tempoFactor;
  const position = playbackTime * pixelsPerSecond;

  const playhead = document.getElementById("playhead");
  playhead.style.left = `${position}px`;

  containerWrapper.scrollLeft = Math.max(
    0,
    position - containerWrapper.clientWidth / 2
  );

  noteElements.forEach(({ div, note }) => {
    const start = note.time;
    const end = start + Math.max(note.duration, minHighlightTime);

    if (playbackTime >= start && playbackTime < end) {
      div.classList.add("active");

      if (enableParticles) {
        div.classList.add("glow");

        if (!div._lastParticle || timestamp - div._lastParticle > 120) {
          const rect = div.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          const x = rect.left - containerRect.left + rect.width / 2;
          const y = rect.top - containerRect.top + rect.height / 2;

          spawnParticles(x, y);
          div._lastParticle = timestamp;
        }

      } else {
        div.classList.remove("glow");
      }

    } else {
      div.classList.remove("active");
      div.classList.remove("glow");
    }
  });

  if (enableParticles) {
    updateParticles(delta);
  }

  if (playbackTime < totalDuration) {
    animationFrame = requestAnimationFrame(animate);
  } else if (!playbackEnded) {
    playbackEnded = true;
    setTimeout(() => alert("🎉 播放完成！"), 1000);
  }
}