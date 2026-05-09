/* ============================================================
   APP.JS — المحرك الرئيسي للتطبيق
   مسؤول عن: نظام XP، LocalStorage، التنقل، تهيئة الصفحة
   يعمل مع: questions.js و animations.js
============================================================ */

'use strict';

// ===== USER PROGRESS SYSTEM: نظام تقدم المستخدم =====
const UserProgress = {
  // مفاتيح الـ LocalStorage
  KEYS: {
    xp: 'codeforge_xp',
    level: 'codeforge_level',
    solved: 'codeforge_solved',
    answered: 'codeforge_answered',
    streak: 'codeforge_streak',
    lastVisit: 'codeforge_lastVisit'
  },

  // ===== تحميل البيانات من LocalStorage =====
  load() {
    return {
      xp: parseInt(localStorage.getItem(this.KEYS.xp) || '0'),
      level: parseInt(localStorage.getItem(this.KEYS.level) || '1'),
      solved: JSON.parse(localStorage.getItem(this.KEYS.solved) || '{}'),
      answered: JSON.parse(localStorage.getItem(this.KEYS.answered) || '{}'),
      streak: parseInt(localStorage.getItem(this.KEYS.streak) || '0'),
      lastVisit: localStorage.getItem(this.KEYS.lastVisit) || ''
    };
  },

  // ===== حفظ البيانات =====
  save(data) {
    localStorage.setItem(this.KEYS.xp, data.xp);
    localStorage.setItem(this.KEYS.level, data.level);
    localStorage.setItem(this.KEYS.solved, JSON.stringify(data.solved));
    localStorage.setItem(this.KEYS.answered, JSON.stringify(data.answered));
    localStorage.setItem(this.KEYS.streak, data.streak);
    localStorage.setItem(this.KEYS.lastVisit, data.lastVisit);
  },

  // ===== حساب مستوى المستخدم بناءً على XP =====
  calcLevel(xp) {
    // كل 100 XP = مستوى جديد (يزداد تدريجياً)
    if (xp < 100) return 1;
    if (xp < 250) return 2;
    if (xp < 500) return 3;
    if (xp < 850) return 4;
    if (xp < 1300) return 5;
    return Math.floor(5 + (xp - 1300) / 500);
  },

  // ===== XP المطلوبة للمستوى الحالي =====
  xpForLevel(level) {
    const thresholds = [0, 100, 250, 500, 850, 1300];
    if (level <= thresholds.length) return thresholds[level - 1];
    return 1300 + (level - 5) * 500;
  },

  // ===== إضافة XP =====
  addXP(amount, source) {
    const data = this.load();
    const oldLevel = data.level;

    data.xp += amount;
    data.level = this.calcLevel(data.xp);

    this.save(data);
    this.updateHUD();

    // إخطار برفع المستوى
    if (data.level > oldLevel) {
      setTimeout(() => {
        showToast(`🎉 LEVEL UP! المستوى ${data.level}!`, 'success');
      }, 500);
    }
  },

  // ===== تحديث شريط HUD =====
  updateHUD() {
    const data = this.load();
    const level = data.level;
    const currentXP = data.xp;
    const minXP = this.xpForLevel(level);
    const maxXP = this.xpForLevel(level + 1);
    const progress = ((currentXP - minXP) / (maxXP - minXP)) * 100;

    const levelEl = document.getElementById('userLevel');
    const xpBarEl = document.getElementById('xpBarFill');
    const currentXPEl = document.getElementById('currentXP');
    const maxXPEl = document.getElementById('maxXP');
    const streakEl = document.getElementById('streak');

    if (levelEl) levelEl.textContent = level;
    if (xpBarEl) xpBarEl.style.width = `${Math.min(100, progress)}%`;
    if (currentXPEl) currentXPEl.textContent = currentXP;
    if (maxXPEl) maxXPEl.textContent = maxXP;
    if (streakEl) streakEl.textContent = `${data.streak}🔥`;
  },

  // ===== تسجيل بطاقة كمحلولة =====
  markSolved(type, id) {
    const data = this.load();
    if (!data.solved[type]) data.solved[type] = [];
    if (!data.solved[type].includes(id)) {
      data.solved[type].push(id);
      data.streak += 1;
      data.lastVisit = new Date().toDateString();
    }
    this.save(data);
  },

  // ===== التحقق من حل البطاقة =====
  isSolved(type, id) {
    const data = this.load();
    return !!(data.solved[type] && data.solved[type].includes(id));
  },

  // ===== تسجيل سؤال كمجاب =====
  markAnswered(type, id) {
    const data = this.load();
    if (!data.answered[type]) data.answered[type] = [];
    if (!data.answered[type].includes(id)) {
      data.answered[type].push(id);
    }
    this.save(data);
  },

  // ===== التحقق من الإجابة =====
  isAnswered(type, id) {
    const data = this.load();
    return !!(data.answered[type] && data.answered[type].includes(id));
  },

  // ===== تحديث Streak اليومي =====
  updateStreak() {
    const data = this.load();
    const today = new Date().toDateString();

    if (data.lastVisit === today) return;

    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.lastVisit !== yesterday) {
      // انقطع الـ streak
      if (data.streak > 0) {
        data.streak = 0;
        showToast('💔 Streak منقطع — ابدأ من جديد!', 'error');
      }
    }

    data.lastVisit = today;
    this.save(data);
  }
};

// ===== NAVIGATION: التنقل بين الأقسام =====
function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.content-section');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.section;

      // تحديث الأزرار
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // تحديث الأقسام
      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${targetId}`)?.classList.add('active');

      // تحديث المحتوى عند التبديل
      switch (targetId) {
        case 'errors':
          renderErrorCards();
          break;
        case 'warmup':
          renderWarmupQuiz();
          break;
        case 'heavy':
          renderHeavyChallenges();
          break;
        case 'visual':
          renderVisualAlgorithms();
          break;
      }
    });
  });
}

// ===== CHALLENGE MANAGER: مدير التحديات =====
const ChallengeManager = {
  // اختيار تحدي اليوم بناءً على التاريخ
  getDailyChallenge() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return QUESTIONS_DATA.errorCards[dayOfYear % QUESTIONS_DATA.errorCards.length];
  },

  // عرض التحدي اليومي في الـ Hero section
  renderDailyBadge() {
    const daily = this.getDailyChallenge();
    const badge = document.querySelector('.hero-badge');
    if (badge && daily) {
      badge.textContent = `🏆 تحدي اليوم: ${daily.title}`;
    }
  }
};

// ===== CODE ENGINE: محرك عرض الكود =====
const CodeEngine = {
  // عرض الكود مع Syntax Highlighting كامل
  highlight(code) {
    return syntaxHighlight(code); // مُعرَّفة في questions.js
  },

  // إنشاء code window
  createWindow(code, filename = 'main.cpp') {
    return `
      <div class="code-window">
        <div class="code-window-bar">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
          <span class="code-window-title">${filename}</span>
        </div>
        <pre class="code-display">${this.highlight(code)}</pre>
      </div>
    `;
  }
};

// ===== INITIALIZATION: تهيئة الموقع =====
function init() {
  // تحديث الـ HUD من LocalStorage
  UserProgress.updateHUD();
  UserProgress.updateStreak();

  // تهيئة التنقل
  initNavigation();

  // عرض القسم الأول
  renderErrorCards();

  // تحديث تحدي اليوم
  ChallengeManager.renderDailyBadge();

  // إضافة تأثير الـ scanning للخلفية
  animateBackground();

  console.log('%c⚡ CodeForge++ | جاهز للتدريب', 'color: #00f5ff; font-size: 16px; font-weight: bold;');
}

// ===== BACKGROUND: تأثير الخلفية =====
function animateBackground() {
  const hero = document.querySelector('.hero-grid-bg');
  if (!hero) return;

  let offset = 0;
  setInterval(() => {
    offset = (offset + 0.2) % 40;
    hero.style.backgroundPosition = `${offset}px ${offset}px`;
  }, 50);
}

// ===== START: تشغيل الموقع =====
document.addEventListener('DOMContentLoaded', init);
