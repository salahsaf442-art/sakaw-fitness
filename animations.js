/* ============================================================
   ANIMATIONS.JS — محرك الأنيميشن والرسوم المتحركة
   مسؤول عن: تصور الخوارزميات، تأثيرات UI
   مستقل تماماً عن ملف الأسئلة
============================================================ */

'use strict';

// حالة الأنيميشن — لمنع تشغيل أكثر من أنيميشن في نفس الوقت
const AnimationState = {
  running: {},
  setRunning(id, val) { this.running[id] = val; },
  isRunning(id) { return !!this.running[id]; }
};

// ===== BUBBLE SORT VISUALIZATION =====
async function animateBubbleSort(algoId) {
  const algoData = [64, 34, 25, 12, 22, 11, 90];
  const arr = [...algoData];
  const n = arr.length;

  AnimationState.setRunning(algoId, true);
  resetBars(algoId, arr);
  await sleep(400);

  const steps = [0, 1, 2, 3];
  let stepIdx = 0;

  for (let i = 0; i < n - 1 && AnimationState.isRunning(algoId); i++) {
    highlightStep(algoId, 0); // خطوة: بدء pass
    await sleep(300);

    for (let j = 0; j < n - i - 1 && AnimationState.isRunning(algoId); j++) {
      // تلوين العنصرين المقارنين
      setBarClass(algoId, j, 'comparing');
      setBarClass(algoId, j + 1, 'comparing');
      highlightStep(algoId, 1); // خطوة: المقارنة
      await sleep(500);

      if (arr[j] > arr[j + 1]) {
        // تبادل
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        updateBars(algoId, arr);
        highlightStep(algoId, 2); // خطوة: التبادل
        await sleep(400);
      }

      setBarClass(algoId, j, '');
      setBarClass(algoId, j + 1, '');
    }

    // العنصر الأخير في مكانه
    setBarClass(algoId, n - 1 - i, 'sorted');
    highlightStep(algoId, 3); // خطوة: العنصر في مكانه
    await sleep(300);
  }

  // العنصر الأول أيضاً في مكانه
  setBarClass(algoId, 0, 'sorted');
  AnimationState.setRunning(algoId, false);
  highlightStep(algoId, -1);
}

// ===== BINARY SEARCH VISUALIZATION =====
async function animateBinarySearch(algoId) {
  const data = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  const target = 38; // نبحث عن 38
  let left = 0, right = data.length - 1;

  AnimationState.setRunning(algoId, true);
  resetBars(algoId, data);
  await sleep(400);

  // نضيف label "Target: 38"
  const viz = document.getElementById(`viz-${algoId}`);
  if (viz) {
    let targetLabel = document.getElementById(`target-label-${algoId}`);
    if (!targetLabel) {
      targetLabel = document.createElement('div');
      targetLabel.id = `target-label-${algoId}`;
      targetLabel.style.cssText = 'position:absolute;top:8px;right:8px;font-family:Fira Code,monospace;font-size:0.7rem;color:var(--neon-yellow);';
      viz.style.position = 'relative';
      viz.appendChild(targetLabel);
    }
    targetLabel.textContent = `🎯 نبحث عن: ${target}`;
  }

  while (left <= right && AnimationState.isRunning(algoId)) {
    // إعادة تعيين الألوان
    for (let i = 0; i < data.length; i++) setBarClass(algoId, i, '');

    // تلوين المنطقة الفعالة
    highlightStep(algoId, 0); // تحديد الوسط

    const mid = Math.floor((left + right) / 2);

    // تمييز الوسط
    setBarClass(algoId, mid, 'comparing');
    await sleep(700);

    if (data[mid] === target) {
      setBarClass(algoId, mid, 'sorted');
      highlightStep(algoId, -1);
      showToast(`🎯 وُجد ${target} في index ${mid}!`, 'success');
      AnimationState.setRunning(algoId, false);
      return;
    }

    if (data[mid] < target) {
      // الهدف في اليمين — خفّت اليسار
      for (let i = left; i <= mid; i++) setBarClass(algoId, i, 'sorted');
      highlightStep(algoId, 2); // التحرك يميناً
      left = mid + 1;
    } else {
      // الهدف في اليسار — خفّت اليمين
      for (let i = mid; i <= right; i++) setBarClass(algoId, i, 'sorted');
      highlightStep(algoId, 2); // التحرك يساراً
      right = mid - 1;
    }

    await sleep(700);
  }

  AnimationState.setRunning(algoId, false);
}

// ===== HELPER: تشغيل الأنيميشن المناسب =====
function runVisualization(algoId) {
  if (AnimationState.isRunning(algoId)) {
    AnimationState.setRunning(algoId, false);
    setTimeout(() => runVisualization(algoId), 200);
    return;
  }

  if (algoId === 'bubble-sort') {
    animateBubbleSort(algoId);
  } else if (algoId === 'binary-search') {
    animateBinarySearch(algoId);
  }
}

// ===== HELPER: إعادة تعيين الـ Bars =====
function resetBars(algoId, data) {
  data.forEach((val, i) => {
    const rect = document.querySelector(`#bar-${algoId}-${i} .algo-bar-rect`);
    const label = document.querySelector(`#bar-${algoId}-${i} .algo-bar-label`);
    if (rect) {
      rect.className = 'algo-bar-rect';
      rect.style.height = `${Math.round((val / 100) * 80 + 20)}px`;
    }
    if (label) label.textContent = val;
  });
}

// ===== HELPER: تحديث الـ Bars بعد التبادل =====
function updateBars(algoId, data) {
  data.forEach((val, i) => {
    const rect = document.querySelector(`#bar-${algoId}-${i} .algo-bar-rect`);
    const label = document.querySelector(`#bar-${algoId}-${i} .algo-bar-label`);
    if (rect) rect.style.height = `${Math.round((val / 100) * 80 + 20)}px`;
    if (label) label.textContent = val;
  });
}

// ===== HELPER: تعيين كلاس Bar =====
function setBarClass(algoId, idx, cls) {
  const rect = document.querySelector(`#bar-${algoId}-${idx} .algo-bar-rect`);
  if (rect) rect.className = `algo-bar-rect${cls ? ' ' + cls : ''}`;
}

// ===== HELPER: تمييز خطوة الخوارزمية =====
function highlightStep(algoId, stepIdx) {
  const steps = document.querySelectorAll(`#visual-${algoId} .algo-step`);
  steps.forEach((step, i) => {
    step.classList.toggle('active', i === stepIdx);
  });
}

// ===== HELPER: وقت الانتظار =====
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== WIN OVERLAY: رسالة الفوز =====
function showWin(message, xp) {
  const overlay = document.getElementById('winOverlay');
  const msgEl = document.getElementById('winMsg');
  const xpEl = document.getElementById('winXP');

  if (msgEl) msgEl.textContent = message;
  if (xpEl) xpEl.textContent = `+${xp} XP مكتسب!`;

  overlay.classList.add('open');

  // إنشاء تأثير الجزيئات
  createParticles();

  document.getElementById('winClose').onclick = () => {
    overlay.classList.remove('open');
  };
}

// ===== TOAST: رسالة سريعة =====
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✗' : '⚡'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ===== PARTICLES: تأثير الجزيئات عند الفوز =====
function createParticles() {
  const colors = ['#00f5ff', '#39ff14', '#ff2d87', '#b721ff', '#fff200'];

  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.style.cssText = `
        position: fixed;
        width: ${Math.random() * 8 + 4}px;
        height: ${Math.random() * 8 + 4}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        z-index: 9999;
        pointer-events: none;
        box-shadow: 0 0 8px currentColor;
        animation: particleFly 1.5s ease-out forwards;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1600);
    }, i * 60);
  }
}

// إضافة CSS للـ particles
const particleCSS = document.createElement('style');
particleCSS.textContent = `
@keyframes particleFly {
  0% { transform: translate(0,0) scale(1); opacity: 1; }
  100% { transform: translate(${Math.random() * 200 - 100}px, -150px) scale(0); opacity: 0; }
}
`;
document.head.appendChild(particleCSS);
