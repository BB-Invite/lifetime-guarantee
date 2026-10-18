(function () {
  "use strict";

  const STAGES = [
    "landing",
    "proposal",
    "success",
    "unlock",
    "quiz",
    "score",
    "complete",
  ];

  const STORAGE_KEY = "bbforever-progress";
  const PASS_SCORE = 9;

  const body = document.body;
  const stages = Object.fromEntries(
    STAGES.map((id) => [id, document.getElementById(`stage-${id}`)])
  );

  const btnRegister = document.getElementById("btn-register");
  const btnYes = document.getElementById("btn-yes");
  const btnNo = document.getElementById("btn-no");
  const noCaught = document.getElementById("no-caught");
  const toast = document.getElementById("toast");
  const btnToUnlock = document.getElementById("btn-to-unlock");
  const btnStartQuiz = document.getElementById("btn-start-quiz");

  const quizPrompt = document.getElementById("quiz-prompt");
  const quizOptions = document.getElementById("quiz-options");
  const quizProgress = document.getElementById("quiz-progress");
  const bannerArt = document.getElementById("banner-art");
  const hintBox = document.getElementById("hint-box");
  const optionNudge = document.getElementById("option-nudge");
  const btnHint = document.getElementById("btn-hint");
  const btnPrev = document.getElementById("btn-prev");
  const btnNextNav = document.getElementById("btn-next-nav");
  const btnNext = document.getElementById("btn-next");
  const scoreValue = document.getElementById("score-value");
  const scoreMessage = document.getElementById("score-message");
  const btnRevealKey = document.getElementById("btn-reveal-key");
  const btnRetryQuiz = document.getElementById("btn-retry-quiz");

  const questions = window.QUIZ_DATA.questions;
  const covers = window.QUIZ_COVERS || {};

  let currentStage = "landing";
  let quizIndex = 0;
  /** First attempt per question — used for scoring */
  /** @type {Record<string, string>} */
  let firstAnswers = {};
  /** Latest locked-in answer (must become correct to advance) */
  /** @type {Record<string, string>} */
  let answers = {};
  let toastTimer = null;
  let noEscapeCount = 0;
  /** Actual taps/clicks on NO (not hover dodges) */
  let noClickCount = 0;
  let lastNoInteractAt = 0;
  let noReportTimer = null;
  /** When retrying after a failed scorecard */
  let retryMode = false;
  /** Prevent duplicate score emails for the same attempt fingerprint */
  let lastScoreFingerprint = "";

  function recordEvent(submission, options) {
    if (!window.BB_RESPONSES) return Promise.resolve();
    return window.BB_RESPONSES
      .recordSubmission(submission, options)
      .catch((err) => {
        console.warn("[BB] record failed", err);
      });
  }

  function reportNoClicks(immediate) {
    if (!window.BB_RESPONSES || noClickCount < 1) return;

    const send = () => {
      const submission = window.BB_RESPONSES.buildSimpleEvent(
        "proposal_no_clicks",
        {
          noClickCount,
          message: `She clicked NO ${noClickCount} time${
            noClickCount === 1 ? "" : "s"
          }`,
        }
      );
      // One email per count value (avoids duplicates on Yes flush)
      submission.id = `proposal_no_clicks-${noClickCount}`;
      recordEvent(submission, { upsert: true });
    };

    if (immediate) {
      clearTimeout(noReportTimer);
      send();
      return;
    }

    // Debounce so rapid taps become one email with the total count
    clearTimeout(noReportTimer);
    noReportTimer = setTimeout(send, 2000);
  }

  function submitQuizResults(eventName) {
    if (!window.BB_RESPONSES) return;
    const score = countCorrectFirstAttempts();
    const passed = score >= PASS_SCORE;
    const fingerprint = `${eventName}:${score}:${JSON.stringify(firstAnswers)}:${JSON.stringify(answers)}`;
    if (fingerprint === lastScoreFingerprint) return;
    lastScoreFingerprint = fingerprint;

    const submission = window.BB_RESPONSES.buildQuizPayload(
      questions,
      firstAnswers,
      answers,
      score,
      passed,
      eventName
    );
    recordEvent(submission);
  }

  function isTouchLike() {
    return (
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    );
  }

  function themeForStage(stage) {
    if (stage === "landing" || stage === "proposal") return "warranty";
    if (stage === "quiz") return "quiz";
    return "romance";
  }

  function saveProgress() {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          stage: currentStage,
          quizIndex,
          answers,
          firstAnswers,
          retryMode,
          noClickCount,
        })
      );
    } catch (_) {
      /* ignore */
    }
  }

  function loadProgress() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function showStage(stage) {
    if (!STAGES.includes(stage)) return;
    currentStage = stage;
    body.dataset.stage = stage;
    body.dataset.theme = themeForStage(stage);

    STAGES.forEach((id) => {
      const el = stages[id];
      if (!el) return;
      const active = id === stage;
      el.hidden = !active;
      el.setAttribute("aria-hidden", active ? "false" : "true");
    });

    if (stage === "proposal") {
      resetNoButton();
      noCaught.hidden = true;
    }

    if (stage === "quiz") {
      renderQuestion();
    }

    if (stage === "score") {
      renderScorecard();
    }

    saveProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 1600);
  }

  /* —— Stage 1 —— */
  btnRegister.addEventListener("click", () => showStage("proposal"));

  btnYes.addEventListener("click", () => {
    resetNoButton();
    // Flush any pending NO tally, then email YES + total NO clicks
    if (window.BB_RESPONSES) {
      reportNoClicks(true);
      recordEvent(
        window.BB_RESPONSES.buildSimpleEvent("proposal_yes", {
          noClickCount,
          message:
            noClickCount > 0
              ? `She said YES (after clicking NO ${noClickCount} time${
                  noClickCount === 1 ? "" : "s"
                })`
              : "She said YES (never clicked NO)",
        })
      );
    }
    showStage("success");
  });

  function resetNoButton() {
    btnNo.classList.remove("is-floating");
    btnNo.style.left = "";
    btnNo.style.top = "";
    btnNo.style.position = "";
    noEscapeCount = 0;
  }

  function onNoInteract(clientX, clientY) {
    moveNoAway(
      clientX || window.innerWidth / 2,
      clientY || window.innerHeight / 2
    );
    showToast("Nice try 🙃");

    // Dedupe touchstart + click on the same tap
    const now = Date.now();
    if (now - lastNoInteractAt < 450) return;
    lastNoInteractAt = now;

    noClickCount += 1;
    saveProgress();
    reportNoClicks(false);
  }

  function moveNoAway(clientX, clientY) {
    const pad = 12;
    const btnW = btnNo.offsetWidth || 110;
    const btnH = btnNo.offsetHeight || 48;
    const maxX = window.innerWidth - btnW - pad;
    const maxY = window.innerHeight - btnH - pad;

    let x = Math.random() * maxX + pad;
    let y = Math.random() * maxY + pad;

    const yesRect = btnYes.getBoundingClientRect();
    const avoid = (nx, ny) => {
      const tooCloseCursor =
        Math.hypot(nx + btnW / 2 - clientX, ny + btnH / 2 - clientY) < 120;
      const overlapsYes =
        nx < yesRect.right + 16 &&
        nx + btnW > yesRect.left - 16 &&
        ny < yesRect.bottom + 16 &&
        ny + btnH > yesRect.top - 16;
      return tooCloseCursor || overlapsYes;
    };

    let attempts = 0;
    while (avoid(x, y) && attempts < 20) {
      x = Math.random() * maxX + pad;
      y = Math.random() * maxY + pad;
      attempts += 1;
    }

    btnNo.classList.add("is-floating");
    btnNo.style.left = `${Math.max(pad, Math.min(x, maxX))}px`;
    btnNo.style.top = `${Math.max(pad, Math.min(y, maxY))}px`;
    noEscapeCount += 1;
  }

  function onNoPointerNear(e) {
    if (currentStage !== "proposal" || isTouchLike()) return;
    if (btnNo.classList.contains("is-floating")) {
      const rect = btnNo.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      if (Math.hypot(e.clientX - cx, e.clientY - cy) < 90) {
        moveNoAway(e.clientX, e.clientY);
      }
      return;
    }

    const rect = btnNo.getBoundingClientRect();
    const near =
      e.clientX > rect.left - 40 &&
      e.clientX < rect.right + 40 &&
      e.clientY > rect.top - 40 &&
      e.clientY < rect.bottom + 40;

    if (near) {
      moveNoAway(e.clientX, e.clientY);
    }
  }

  document.addEventListener("pointermove", onNoPointerNear);

  btnNo.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onNoInteract(e.clientX, e.clientY);
    if (!isTouchLike() && noEscapeCount >= 3) {
      noCaught.hidden = false;
    }
  });

  btnNo.addEventListener(
    "touchstart",
    (e) => {
      if (!isTouchLike()) return;
      e.preventDefault();
      const t = e.touches[0];
      onNoInteract(t.clientX, t.clientY);
    },
    { passive: false }
  );

  /* —— Stage 2 / 3 intro —— */
  btnToUnlock.addEventListener("click", () => showStage("unlock"));
  btnStartQuiz.addEventListener("click", () => {
    quizIndex = 0;
    answers = {};
    firstAnswers = {};
    retryMode = false;
    showStage("quiz");
  });

  /* —— Quiz —— */
  function currentQuestion() {
    return questions[quizIndex];
  }

  function isCorrectAnswer(qId, value) {
    const q = questions.find((item) => item.id === qId);
    return Boolean(q && value === q.correct);
  }

  function hasCorrectLock(index) {
    const q = questions[index];
    return q && isCorrectAnswer(q.id, answers[q.id]);
  }

  function countCorrectFirstAttempts() {
    return questions.reduce((sum, q) => {
      return sum + (isCorrectAnswer(q.id, firstAnswers[q.id]) ? 1 : 0);
    }, 0);
  }

  function renderCover(theme) {
    const svg = covers[theme] || covers.home || "";
    bannerArt.dataset.theme = theme || "home";
    bannerArt.innerHTML = svg;
  }

  function renderQuestion() {
    const q = currentQuestion();
    if (!q) return;

    quizProgress.textContent = `${quizIndex + 1} of ${questions.length}`;
    quizPrompt.textContent = q.prompt;
    renderCover(q.bannerTheme || "home");
    hintBox.hidden = true;
    hintBox.textContent = q.hint;

    const selected = answers[q.id] || null;
    const correctLocked = selected === q.correct;
    const hasAttempt = Boolean(selected);

    quizOptions.innerHTML = "";
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.setAttribute("role", "option");
      btn.dataset.value = opt.value;

      // Once correct is locked, freeze. If wrong was chosen, allow picking again.
      if (correctLocked) {
        btn.disabled = true;
      } else if (hasAttempt && opt.value === selected) {
        btn.disabled = true;
      } else {
        btn.disabled = false;
      }

      if (hasAttempt) {
        if (opt.value === q.correct && correctLocked) {
          btn.classList.add("is-correct");
        } else if (opt.value === selected && selected !== q.correct) {
          btn.classList.add("is-incorrect");
        } else if (correctLocked) {
          btn.classList.add("is-revealed");
        }
      }

      const showFeedback =
        correctLocked || (hasAttempt && opt.value === selected);

      btn.innerHTML = `
        <span class="option-letter">${opt.value}</span>
        <span class="option-body">
          <span class="option-label">${opt.label}</span>
          <span class="option-feedback"${showFeedback ? "" : " hidden"}>${opt.feedback}</span>
        </span>
      `;

      btn.addEventListener("click", () => selectAnswer(opt.value));
      quizOptions.appendChild(btn);
    });

    optionNudge.hidden = !(hasAttempt && !correctLocked);

    btnPrev.disabled = quizIndex === 0;
    const canGoNext = correctLocked && quizIndex < questions.length - 1;
    btnNextNav.disabled = !canGoNext;
    btnNext.disabled = !correctLocked;
    btnNext.textContent =
      quizIndex === questions.length - 1 ? "See your score" : "Next";
  }

  function selectAnswer(value) {
    const q = currentQuestion();
    if (!q) return;
    if (answers[q.id] === q.correct) return;

    if (!firstAnswers[q.id]) {
      firstAnswers[q.id] = value;
    }

    answers[q.id] = value;

    // When correcting a previous wrong answer during retry, update firstAnswers
    // once they land on correct so scorecard can pass.
    if (value === q.correct && retryMode) {
      firstAnswers[q.id] = value;
    }

    saveProgress();
    renderQuestion();
  }

  function goNext() {
    if (!hasCorrectLock(quizIndex)) return;
    if (quizIndex >= questions.length - 1) {
      showStage("score");
      return;
    }
    quizIndex += 1;
    saveProgress();
    renderQuestion();
  }

  function goPrev() {
    if (quizIndex <= 0) return;
    quizIndex -= 1;
    saveProgress();
    renderQuestion();
  }

  btnNext.addEventListener("click", goNext);
  btnNextNav.addEventListener("click", goNext);
  btnPrev.addEventListener("click", goPrev);

  btnHint.addEventListener("click", () => {
    const q = currentQuestion();
    if (!q) return;
    hintBox.textContent = q.hint;
    hintBox.hidden = false;
  });

  /* —— Scorecard —— */
  function renderScorecard() {
    const correct = countCorrectFirstAttempts();
    const total = questions.length;
    const passed = correct >= PASS_SCORE;

    scoreValue.textContent = `${correct} / ${total}`;

    if (passed) {
      scoreMessage.textContent =
        correct === total
          ? "Perfect. Your lifetime promise is ready to unlock."
          : "You passed. Your lifetime promise is ready to unlock.";
      btnRevealKey.hidden = false;
      btnRetryQuiz.hidden = true;
    } else {
      scoreMessage.textContent = `You need at least ${PASS_SCORE} out of ${total} correct to unlock the key. Choose the right options on the ones you missed.`;
      btnRevealKey.hidden = true;
      btnRetryQuiz.hidden = false;
    }

    // Save + email host with full answer sheet
    submitQuizResults(retryMode ? "quiz_score_retry" : "quiz_score");
  }

  btnRevealKey.addEventListener("click", () => {
    if (window.BB_RESPONSES) {
      const score = countCorrectFirstAttempts();
      recordEvent(
        window.BB_RESPONSES.buildSimpleEvent("key_revealed", {
          score,
          total: questions.length,
          passed: score >= PASS_SCORE,
          message: "Key location revealed",
        })
      );
    }
    showStage("complete");
  });

  btnRetryQuiz.addEventListener("click", () => {
    retryMode = true;
    // Clear wrong first-attempts so they can be re-scored when corrected
    questions.forEach((q) => {
      if (!isCorrectAnswer(q.id, firstAnswers[q.id])) {
        delete firstAnswers[q.id];
        delete answers[q.id];
      }
    });

    const firstMissed = questions.findIndex(
      (q) => !isCorrectAnswer(q.id, answers[q.id])
    );
    quizIndex = firstMissed === -1 ? 0 : firstMissed;
    showStage("quiz");
  });

  /* —— Restore —— */
  function init() {
    const saved = loadProgress();
    if (saved && STAGES.includes(saved.stage) && saved.stage !== "landing") {
      answers = saved.answers || {};
      firstAnswers = saved.firstAnswers || {};
      retryMode = Boolean(saved.retryMode);
      noClickCount = Number(saved.noClickCount) || 0;
      quizIndex = Math.min(
        saved.quizIndex || 0,
        Math.max(0, questions.length - 1)
      );
      showStage(saved.stage);
      return;
    }
    showStage("landing");
  }

  init();
})();
