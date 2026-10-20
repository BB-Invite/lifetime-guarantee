(function () {
  "use strict";

  const STAGES = [
    "landing",
    "proposal",
    "success",
    "unlock",
    "moon",
    "complete",
  ];
  const STORAGE_KEY = "bbforever-progress";

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
  const btnStartMoon = document.getElementById("btn-start-moon");

  let currentStage = "landing";
  let toastTimer = null;
  let noEscapeCount = 0;
  let noClickCount = 0;
  let lastNoInteractAt = 0;
  let noReportTimer = null;
  let moonGame = null;

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
      submission.id = `proposal_no_clicks-${noClickCount}`;
      recordEvent(submission, { upsert: true });
    };

    if (immediate) {
      clearTimeout(noReportTimer);
      send();
      return;
    }

    clearTimeout(noReportTimer);
    noReportTimer = setTimeout(send, 2000);
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
    if (stage === "moon") return "moon";
    return "romance";
  }

  function saveProgress() {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          stage: currentStage,
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

    if (stage === "moon") {
      ensureMoonGame().start();
    }

    saveProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function ensureMoonGame() {
    if (!moonGame) {
      moonGame = new window.MoonGame({
        onComplete: function () {
          if (window.BB_RESPONSES) {
            recordEvent(
              window.BB_RESPONSES.buildSimpleEvent("moon_completed", {
                noClickCount,
                message: "Moon game completed — key reveal unlocked",
              })
            );
            recordEvent(
              window.BB_RESPONSES.buildSimpleEvent("key_revealed", {
                noClickCount,
                message: "Key location revealed",
              })
            );
          }
          showStage("complete");
        },
      });
      window.__bbMoon = moonGame;
    }
    return moonGame;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 1600);
  }

  btnRegister.addEventListener("click", () => showStage("proposal"));

  btnYes.addEventListener("click", () => {
    resetNoButton();
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

  btnToUnlock.addEventListener("click", () => showStage("unlock"));
  btnStartMoon.addEventListener("click", () => showStage("moon"));

  function init() {
    const saved = loadProgress();
    if (saved && STAGES.includes(saved.stage) && saved.stage !== "landing") {
      noClickCount = Number(saved.noClickCount) || 0;
      let stage = saved.stage;
      if (stage === "quiz" || stage === "score") stage = "unlock";
      showStage(STAGES.includes(stage) ? stage : "landing");
      return;
    }
    showStage("landing");
  }

  init();
})();
