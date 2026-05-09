/* ============================================================
   QUESTIONS.JS — محرك الأسئلة والتحديات
   مسؤول عن: عرض البطاقات، القسم، التحقق من الإجابات
   مستقل تماماً عن ملف الأنيميشن وملف الحالة
============================================================ */

'use strict';

// ===== DATA: الأسئلة والبيانات =====
// في بيئة الإنتاج، هذه تُحمَّل من questions.json عبر fetch()
// لأغراض الـ demo، البيانات مضمنة هنا مباشرة

const QUESTIONS_DATA = {
  errorCards: [
    {
      id: 1, title: "Missing Semicolon", difficulty: "easy", xp: 10,
      code: `#include <iostream>
using namespace std;

int main() {
    int x = 5   // ← هنا المشكلة
    cout << x << endl;
    return 0;
}`,
      hint: "كل جملة في C++ تنتهي بـ ...",
      answer: "فاصلة منقوطة (;) مفقودة في نهاية السطر: int x = 5",
      fixedCode: `#include <iostream>
using namespace std;

int main() {
    int x = 5;
    cout << x << endl;
    return 0;
}`
    },
    {
      id: 2, title: "Undeclared Variable", difficulty: "easy", xp: 10,
      code: `#include <iostream>
using namespace std;

int main() {
    cout << y << endl; // ← هنا المشكلة
    int y = 10;
    return 0;
}`,
      hint: "هل تم تعريف المتغير قبل استخدامه؟",
      answer: "المتغير y تم استخدامه قبل تعريفه. يجب تعريف المتغير أولاً ثم استخدامه.",
      fixedCode: `#include <iostream>
using namespace std;

int main() {
    int y = 10;
    cout << y << endl;
    return 0;
}`
    },
    {
      id: 3, title: "Array Out of Bounds", difficulty: "medium", xp: 20,
      code: `#include <iostream>
using namespace std;

int main() {
    int arr[5] = {1, 2, 3, 4, 5};
    for(int i = 0; i <= 5; i++) { // ← هنا المشكلة
        cout << arr[i] << endl;
    }
    return 0;
}`,
      hint: "مصفوفة بحجم 5 لها عناصر من index 0 إلى ...",
      answer: "الشرط i <= 5 يصل إلى arr[5] وهو خارج الحدود. يجب أن يكون i < 5",
      fixedCode: `#include <iostream>
using namespace std;

int main() {
    int arr[5] = {1, 2, 3, 4, 5};
    for(int i = 0; i < 5; i++) {
        cout << arr[i] << endl;
    }
    return 0;
}`
    },
    {
      id: 4, title: "Infinite Loop", difficulty: "medium", xp: 20,
      code: `#include <iostream>
using namespace std;

int main() {
    int i = 0;
    while(i < 10) {
        cout << i << endl;
        // ← ما الذي ينقص؟
    }
    return 0;
}`,
      hint: "ما الذي يجعل الحلقة تنتهي في النهاية؟",
      answer: "i++ مفقودة داخل الحلقة. بدونها i لا تتغير وتصبح الحلقة لا نهائية.",
      fixedCode: `#include <iostream>
using namespace std;

int main() {
    int i = 0;
    while(i < 10) {
        cout << i << endl;
        i++;
    }
    return 0;
}`
    },
    {
      id: 5, title: "Division by Zero", difficulty: "hard", xp: 30,
      code: `#include <iostream>
using namespace std;

int divide(int a, int b) {
    return a / b; // ← خطر هنا!
}

int main() {
    int x = 10, y = 0;
    cout << divide(x, y) << endl;
    return 0;
}`,
      hint: "ماذا يحدث رياضياً عند القسمة على صفر؟",
      answer: "القسمة على صفر تسبب Undefined Behavior. يجب التحقق من b != 0 قبل القسمة.",
      fixedCode: `#include <iostream>
using namespace std;

int divide(int a, int b) {
    if(b == 0) {
        cout << "Error: Division by zero!" << endl;
        return -1;
    }
    return a / b;
}

int main() {
    int x = 10, y = 0;
    cout << divide(x, y) << endl;
    return 0;
}`
    },
    {
      id: 6, title: "Wrong Return Type", difficulty: "hard", xp: 30,
      code: `#include <iostream>
using namespace std;

int addFloats(float a, float b) { // ← المشكلة في نوع الإرجاع
    return a + b;
}

int main() {
    cout << addFloats(1.5, 2.3) << endl;
    // المتوقع: 3.8 — الناتج الفعلي: 3
    return 0;
}`,
      hint: "نوع القيمة المُرجعة لا يتطابق مع نتيجة العملية",
      answer: "الدالة تُعيد int لكنها تحسب float. سيُبتر الجزء العشري. يجب تغيير نوع الإرجاع إلى float.",
      fixedCode: `#include <iostream>
using namespace std;

float addFloats(float a, float b) {
    return a + b;
}

int main() {
    cout << addFloats(1.5, 2.3) << endl;
    // الناتج الصحيح: 3.8
    return 0;
}`
    }
  ],

  warmupQuiz: [
    {
      id: 1, xp: 15,
      question: "ما هو الناتج الصحيح؟\nint x = 7;\ncout << x % 3;",
      options: ["0", "1", "2", "3"],
      correct: 1,
      explanation: "7 % 3 = 1 لأن 7 = (2 × 3) + 1 والباقي هو 1"
    },
    {
      id: 2, xp: 15,
      question: "أي من هذه ليست نوع بيانات أساسي (primitive) في C++؟",
      options: ["int", "float", "string", "char"],
      correct: 2,
      explanation: "string ليست primitive بل هي class من مكتبة STL، تحتاج #include <string>"
    },
    {
      id: 3, xp: 15,
      question: "ما الفرق بين = و == في C++؟",
      options: ["لا فرق بينهما", "= للمقارنة و == للإسناد", "= للإسناد و == للمقارنة", "كلاهما للمقارنة"],
      correct: 2,
      explanation: "= تُسند قيمة لمتغير (x = 5)، بينما == تُقارن قيمتين وتُعيد true أو false"
    },
    {
      id: 4, xp: 15,
      question: "كم مرة ستُطبع 'Hello'؟\nfor(int i=0; i<5; i+=2) { cout << \"Hello\"; }",
      options: ["5 مرات", "3 مرات", "2 مرات", "4 مرات"],
      correct: 1,
      explanation: "i يأخذ القيم: 0, 2, 4 — ثلاث قيم صحيحة قبل أن يصبح i=6 وتنتهي الحلقة"
    },
    {
      id: 5, xp: 15,
      question: "ما معنى Stack Overflow في البرمجة؟",
      options: ["موقع برمجي مشهور فقط", "تجاوز حجم الـ Stack بسبب recursion لا نهائية", "خطأ في الترجمة Compile Error", "نوع من أنواع المصفوفات"],
      correct: 1,
      explanation: "Stack Overflow يحدث عندما تستدعي دالة نفسها بشكل لا نهائي حتى تمتلئ ذاكرة الـ Stack"
    }
  ],

  heavyChallenge: [
    {
      id: 1, xp: 50,
      title: "Binary Search — أكمل الفراغات",
      desc: "خوارزمية البحث الثنائي تبحث في O(log n) — أكمل الفراغات الأربعة",
      algorithm: "binary-search",
      code: `int binarySearch(int arr[], int n, int target) {
    int left = 0, right = [1];
    
    while(left [2] right) {
        int mid = (left + right) / 2;
        
        if(arr[mid] == target) return mid;
        else if(arr[mid] < target) left = [3];
        else right = [4];
    }
    return -1;  // لم يُوجد
}`,
      blanks: [
        { placeholder: "الفراغ 1", answer: "n-1", hint: "right يبدأ من آخر index" },
        { placeholder: "الفراغ 2", answer: "<=", hint: "الحلقة تستمر ما دام left أصغر أو يساوي right" },
        { placeholder: "الفراغ 3", answer: "mid+1", hint: "الهدف في النصف الأيمن" },
        { placeholder: "الفراغ 4", answer: "mid-1", hint: "الهدف في النصف الأيسر" }
      ]
    },
    {
      id: 2, xp: 60,
      title: "Bubble Sort — اكتشف الخطأ",
      desc: "خوارزمية الترتيب الفقاعي بها خطأ واحد يسبب Array Out of Bounds — اكتشفه!",
      algorithm: "bubble-sort",
      code: `void bubbleSort(int arr[], int n) {
    for(int i = 0; i < n; i++) {
        for(int j = 0; j < n-i; j++) {  // ← هنا الخطأ
            if(arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
}`,
      blanks: [
        { placeholder: "ما الحد الصحيح للحلقة الداخلية؟", answer: "n-i-1", hint: "في كل pass، آخر i عناصر تكون في مكانها الصحيح" }
      ]
    }
  ]
};

// ===== RENDER: عرض بطاقات الأخطاء =====
function renderErrorCards() {
  const grid = document.getElementById('errorCardsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  QUESTIONS_DATA.errorCards.forEach((card, idx) => {
    const solved = UserProgress.isSolved('error', card.id);
    const el = document.createElement('div');
    el.className = `error-card${solved ? ' solved' : ''}`;
    el.style.animationDelay = `${idx * 0.08}s`;
    el.innerHTML = `
      <div class="card-header">
        <span class="card-title">${card.title}</span>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          <span class="difficulty-badge diff-${card.difficulty}">
            ${card.difficulty === 'easy' ? 'EASY' : card.difficulty === 'medium' ? 'MEDIUM' : 'HARD'}
          </span>
          ${solved ? '<span class="solved-stamp">✓ SOLVED</span>' : ''}
        </div>
      </div>
      <div class="card-body">
        <pre class="card-code">${syntaxHighlight(card.code)}</pre>
      </div>
      <div class="card-footer">
        <span class="xp-badge">+${card.xp} XP</span>
        <div style="display:flex;gap:0.5rem;">
          <button class="btn-hint" onclick="showHint(${card.id})">💡 تلميح</button>
          <button class="btn-reveal" onclick="openCardModal(${card.id})">🔍 الكشف</button>
        </div>
      </div>
    `;
    grid.appendChild(el);
  });

  renderErrorProgress();
}

// ===== RENDER: عرض مؤشر التقدم =====
function renderErrorProgress() {
  const container = document.getElementById('errorProgress');
  if (!container) return;

  const total = QUESTIONS_DATA.errorCards.length;
  const solved = QUESTIONS_DATA.errorCards.filter(c => UserProgress.isSolved('error', c.id)).length;

  container.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const pill = document.createElement('span');
    pill.className = `progress-pill ${i < solved ? 'done' : 'pending'}`;
    pill.textContent = i < solved ? `✓ ${i+1}` : `○ ${i+1}`;
    container.appendChild(pill);
  }
}

// ===== RENDER: عرض الكويز =====
function renderWarmupQuiz() {
  const arena = document.getElementById('warmupArena');
  if (!arena) return;

  arena.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];

  QUESTIONS_DATA.warmupQuiz.forEach((q, idx) => {
    const answered = UserProgress.isAnswered('quiz', q.id);
    const el = document.createElement('div');
    el.className = `quiz-card${answered ? ' answered' : ''}`;
    el.style.animationDelay = `${idx * 0.1}s`;

    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-family:'Orbitron',sans-serif;font-size:0.7rem;color:var(--text-muted);letter-spacing:0.1em;">
          سؤال ${idx + 1} / ${QUESTIONS_DATA.warmupQuiz.length}
        </span>
        <span class="xp-badge">+${q.xp} XP</span>
      </div>
      <pre class="quiz-question">${q.question}</pre>
      <div class="quiz-options" id="quiz-opts-${q.id}">
        ${q.options.map((opt, i) => `
          <button class="quiz-option${answered ? (i === q.correct ? ' correct' : '') : ''}"
                  onclick="answerQuiz(${q.id}, ${i})"
                  ${answered ? 'disabled' : ''}>
            <span class="quiz-option-letter">${letters[i]}</span>
            ${opt}
          </button>
        `).join('')}
      </div>
      <div class="quiz-explanation${answered ? ' visible' : ''}" id="quiz-exp-${q.id}">
        💡 ${q.explanation}
      </div>
    `;

    arena.appendChild(el);
  });
}

// ===== RENDER: عرض تحديات Heavy Lifting =====
function renderHeavyChallenges() {
  const container = document.getElementById('heavyContainer');
  const lockNotice = document.getElementById('heavyLockNotice');
  if (!container) return;

  const solvedCount = QUESTIONS_DATA.errorCards.filter(c => UserProgress.isSolved('error', c.id)).length;
  const isUnlocked = solvedCount >= 3;

  if (!isUnlocked) {
    lockNotice && (lockNotice.className = 'lock-notice visible');
    container.innerHTML = '';
    return;
  }

  lockNotice && (lockNotice.className = 'lock-notice');
  container.innerHTML = '';

  QUESTIONS_DATA.heavyChallenge.forEach((ch, idx) => {
    const solved = UserProgress.isSolved('heavy', ch.id);
    const el = document.createElement('div');
    el.className = 'heavy-card';
    el.style.animationDelay = `${idx * 0.15}s`;

    el.innerHTML = `
      <div class="heavy-card-header">
        <div>
          <div class="heavy-title">${ch.title}</div>
          <div class="heavy-desc" style="margin-top:0.25rem;">${ch.desc}</div>
        </div>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          ${solved ? '<span style="color:var(--neon-green);font-family:Orbitron,sans-serif;font-size:0.8rem;font-weight:700;">✓ COMPLETED</span>' : ''}
          <span class="heavy-xp">+${ch.xp} XP</span>
        </div>
      </div>
      <pre class="card-code" style="border-radius:10px;padding:1.25rem;background:var(--bg-code);border:1px solid var(--border-card);">${syntaxHighlight(ch.code)}</pre>
      <div>
        <div style="font-family:'Orbitron',sans-serif;font-size:0.7rem;color:var(--text-muted);letter-spacing:0.1em;margin-bottom:0.75rem;text-transform:uppercase;">أكمل الفراغات:</div>
        <div class="blanks-container" id="blanks-${ch.id}">
          ${ch.blanks.map((b, i) => `
            <div style="display:flex;flex-direction:column;gap:0.25rem;">
              <label style="font-size:0.7rem;color:var(--text-muted);font-family:Fira Code,monospace;">[${i+1}] ${b.hint}</label>
              <input class="blank-input" type="text" placeholder="${b.placeholder}"
                     id="blank-${ch.id}-${i}" ${solved ? 'disabled value="'+b.answer+'"' : ''}>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="display:flex;gap:1rem;align-items:center;">
        <button class="btn-check-answer" onclick="checkHeavy(${ch.id})" ${solved ? 'disabled' : ''}>
          ${solved ? '✓ تم الحل' : '⚡ تحقق من الإجابة'}
        </button>
        ${solved ? `<button class="btn-run-algo" onclick="openVisualSection('${ch.algorithm}')">🎨 شاهد الخوارزمية مرئياً →</button>` : ''}
      </div>
    `;

    container.appendChild(el);
  });
}

// ===== RENDER: عرض الخوارزميات المرئية =====
function renderVisualAlgorithms() {
  const grid = document.getElementById('visualGrid');
  const lockNotice = document.getElementById('visualLockNotice');
  if (!grid) return;

  const heavySolved = QUESTIONS_DATA.heavyChallenge.some(c => UserProgress.isSolved('heavy', c.id));

  if (!heavySolved) {
    lockNotice && (lockNotice.className = 'lock-notice visible');
  } else {
    lockNotice && (lockNotice.className = 'lock-notice');
  }

  grid.innerHTML = '';

  const algorithms = [
    {
      id: 'binary-search',
      name: 'Binary Search',
      complexity: 'O(log n)',
      desc: 'تقسيم المصفوفة المرتبة للنصف في كل خطوة للبحث الأسرع',
      steps: ['تحديد الوسط (mid)', 'مقارنة target مع arr[mid]', 'التحرك لليمين أو اليسار', 'تكرار حتى الإيجاد أو الفشل'],
      data: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
      linkedHeavy: 1
    },
    {
      id: 'bubble-sort',
      name: 'Bubble Sort',
      complexity: 'O(n²)',
      desc: 'مقارنة العناصر المتجاورة وتبادلها حتى يُرتَّب الكل',
      steps: ['قارن كل عنصرين متجاورين', 'إذا كان الأول أكبر، بادل', 'كرر العملية n مرة', 'كل pass يضع أكبر عنصر في نهايته'],
      data: [64, 34, 25, 12, 22, 11, 90],
      linkedHeavy: 2
    }
  ];

  algorithms.forEach(algo => {
    const isUnlocked = heavySolved ||
      UserProgress.isSolved('heavy', algo.linkedHeavy);

    const card = document.createElement('div');
    card.className = `visual-card${isUnlocked ? ' unlocked' : ' locked'}`;
    card.id = `visual-${algo.id}`;

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.75rem;">
        <div>
          <div class="algo-name">${algo.name}</div>
          <div class="algo-desc" style="margin-top:0.25rem;">${algo.desc}</div>
        </div>
        <span class="algo-complexity">${algo.complexity}</span>
      </div>
      <div class="algo-visualizer" id="viz-${algo.id}">
        ${algo.data.map((val, i) => `
          <div class="algo-bar" id="bar-${algo.id}-${i}">
            <div class="algo-bar-rect" style="height:${Math.round((val/100)*80 + 20)}px;"></div>
            <span class="algo-bar-label">${val}</span>
          </div>
        `).join('')}
      </div>
      <div class="algo-steps">
        ${algo.steps.map((step, i) => `
          <div class="algo-step" id="step-${algo.id}-${i}">
            <span class="step-num">${i+1}</span>
            ${step}
          </div>
        `).join('')}
      </div>
      <button class="btn-run-algo" onclick="runVisualization('${algo.id}')">▶ شغّل الأنيميشن</button>
    `;

    grid.appendChild(card);
  });
}

// ===== MODAL: فتح بطاقة الشرح =====
function openCardModal(cardId) {
  const card = QUESTIONS_DATA.errorCards.find(c => c.id === cardId);
  if (!card) return;

  const alreadySolved = UserProgress.isSolved('error', cardId);

  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div class="modal-title">🔍 ${card.title}</div>
    <div class="modal-fixed-label">الكود الخاطئ:</div>
    <pre class="modal-code">${syntaxHighlight(card.code)}</pre>
    <div class="modal-answer">
      <strong>✅ الخطأ:</strong><br>
      ${card.answer}
    </div>
    <div class="modal-fixed-label">الكود المصحح:</div>
    <pre class="modal-code">${syntaxHighlight(card.fixedCode)}</pre>
    ${!alreadySolved ? `
      <button class="btn-primary" onclick="markSolved(${cardId})" style="margin-top:1rem;width:100%;">
        ✓ فهمت! (+${card.xp} XP)
      </button>
    ` : '<div style="text-align:center;color:var(--neon-green);font-family:Orbitron,sans-serif;font-size:0.9rem;margin-top:1rem;">✓ تم الحل سابقاً</div>'}
  `;

  document.getElementById('modalOverlay').classList.add('open');
}

// ===== ACTIONS: تحديد البطاقة كمحلولة =====
function markSolved(cardId) {
  const card = QUESTIONS_DATA.errorCards.find(c => c.id === cardId);
  if (!card || UserProgress.isSolved('error', cardId)) return;

  UserProgress.addXP(card.xp, card.title);
  UserProgress.markSolved('error', cardId);

  closeModal();
  renderErrorCards();
  renderHeavyChallenges();

  showWin(`حللت "${card.title}" بنجاح!`, card.xp);
}

// ===== ACTIONS: التحقق من إجابة الكويز =====
function answerQuiz(quizId, selectedIdx) {
  const q = QUESTIONS_DATA.warmupQuiz.find(q => q.id === quizId);
  if (!q || UserProgress.isAnswered('quiz', quizId)) return;

  const opts = document.querySelectorAll(`#quiz-opts-${quizId} .quiz-option`);
  opts.forEach(opt => opt.disabled = true);

  const isCorrect = selectedIdx === q.correct;

  opts[selectedIdx].classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) opts[q.correct].classList.add('correct');

  const expEl = document.getElementById(`quiz-exp-${quizId}`);
  if (expEl) expEl.classList.add('visible');

  if (isCorrect) {
    UserProgress.addXP(q.xp, 'Warm-Up Quiz');
    UserProgress.markAnswered('quiz', quizId);
    showToast('✓ إجابة صحيحة!', 'success');
    showToast(`+${q.xp} XP`, 'xp');
  } else {
    showToast('✗ إجابة خاطئة — راجع التفسير', 'error');
  }
}

// ===== ACTIONS: التحقق من إجابة Heavy Lifting =====
function checkHeavy(challengeId) {
  const ch = QUESTIONS_DATA.heavyChallenge.find(c => c.id === challengeId);
  if (!ch || UserProgress.isSolved('heavy', challengeId)) return;

  let allCorrect = true;

  ch.blanks.forEach((blank, i) => {
    const input = document.getElementById(`blank-${challengeId}-${i}`);
    if (!input) return;

    const userAnswer = input.value.trim().toLowerCase().replace(/\s+/g, '');
    const correctAnswer = blank.answer.toLowerCase().replace(/\s+/g, '');

    if (userAnswer !== correctAnswer) {
      allCorrect = false;
      input.style.borderColor = 'var(--neon-pink)';
      input.style.boxShadow = '0 0 12px rgba(255,45,135,0.3)';
      setTimeout(() => {
        input.style.borderColor = '';
        input.style.boxShadow = '';
      }, 1500);
    } else {
      input.style.borderColor = 'var(--neon-green)';
      input.style.boxShadow = '0 0 12px rgba(57,255,20,0.3)';
    }
  });

  if (allCorrect) {
    UserProgress.addXP(ch.xp, ch.title);
    UserProgress.markSolved('heavy', challengeId);
    renderHeavyChallenges();
    renderVisualAlgorithms();
    showWin(`أتقنت ${ch.title}!`, ch.xp);
  } else {
    showToast('بعض الإجابات خاطئة — تحقق من التلميحات', 'error');
  }
}

// ===== ACTIONS: التلميح =====
function showHint(cardId) {
  const card = QUESTIONS_DATA.errorCards.find(c => c.id === cardId);
  if (!card) return;
  showToast(`💡 ${card.hint}`, 'xp');
}

// ===== NAVIGATION: فتح قسم الخوارزميات المرئية =====
function openVisualSection(algoId) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelector('[data-section="visual"]').classList.add('active');
  document.getElementById('section-visual').classList.add('active');
  renderVisualAlgorithms();

  setTimeout(() => {
    const el = document.getElementById(`visual-${algoId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
}

// ===== MODAL: إغلاق =====
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

// ===== UTILITY: تلوين الكود =====
function syntaxHighlight(code) {
  // Escape HTML أولاً
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // تطبيق تلوين بسيط
  html = html
    .replace(/(\/\/[^\n]*)/g, '<span class="c-comment">$1</span>')
    .replace(/\b(#include|#define|using|namespace|return|if|else|while|for|int|float|double|char|bool|void|cout|cin|endl|std|new|delete|class|public|private|const|auto)\b/g, '<span class="c-keyword">$1</span>')
    .replace(/("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|&lt;[^&]+&gt;)/g, '<span class="c-string">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="c-num">$1</span>');

  return html;
}

// تهيئة الـ Event Listeners عند التحميل
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
});
