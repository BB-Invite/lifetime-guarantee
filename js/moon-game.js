(function () {
  "use strict";

  const PHASES = [
    { id: "waxing", label: "Waxing crescent" },
    { id: "first-quarter", label: "First quarter" },
    { id: "full", label: "Full moon" },
    { id: "waning", label: "Waning crescent" },
  ];

  /** Left → right. Ends are decorative fixed crescents. */
  const SLOT_ACCEPTS = [
    null,
    "waxing",
    "first-quarter",
    "full",
    "waning",
    null,
  ];

  const SECRET = "MOONLIGHT";
  const PERSONAL_MESSAGE =
    "My forever is you. #BBforever — here’s where to find the key.";

  const HINTS = [
    "Even when you cannot see the whole moon, it is still there.",
    "The night keeps one word for you alone.",
  ];

  const BLURBS = [
    "Something is missing from this night. Can you bring its light back? Drag the pieces below to complete the sky.",
    "The sky is almost whole. Enter the word that lights the path to your key.",
  ];

  const TOTAL_STEPS = 2;

  function MoonGame(options) {
    this.onComplete = options && options.onComplete;
    this.tray = document.getElementById("moon-tray");
    this.arc = document.getElementById("moon-arc");
    this.wordPanel = document.getElementById("moon-word");
    this.wordForm = document.getElementById("moon-word-form");
    this.wordInput = document.getElementById("moon-word-input");
    this.wordError = document.getElementById("moon-word-error");
    this.messageEl = document.getElementById("moon-message");
    this.btnNext = document.getElementById("btn-moon-next");
    this.btnToKey = document.getElementById("btn-moon-to-key");
    this.progressText = document.getElementById("moon-progress-text");
    this.progressDots = document.querySelectorAll(".moon-progress-dots span");
    this.hintEl = document.querySelector("#moon-hint p");
    this.blurbEl = document.getElementById("moon-blurb");
    this.trayWrap = document.querySelector(".moon-tray-wrap");
    this.hintBox = document.getElementById("moon-hint");

    this.step = 1;
    this.filledSlots = {};
    this.drag = null;

    this._bind();
  }

  MoonGame.prototype._bind = function () {
    const self = this;
    this.btnNext.addEventListener("click", function () {
      self.goNext();
    });
    this.wordForm.addEventListener("submit", function (e) {
      e.preventDefault();
      self.checkWord();
    });
    this.btnToKey.addEventListener("click", function () {
      if (typeof self.onComplete === "function") self.onComplete();
    });
    document.addEventListener("pointermove", function (e) {
      self.onPointerMove(e);
    });
    document.addEventListener("pointerup", function (e) {
      self.onPointerUp(e);
    });
    document.addEventListener("pointercancel", function (e) {
      self.onPointerUp(e);
    });
  };

  MoonGame.prototype.start = function () {
    this.step = 1;
    this.filledSlots = {};
    this.showStep(1);
  };

  MoonGame.prototype.showStep = function (step) {
    this.step = step;
    this.progressText.textContent = step + " / " + TOTAL_STEPS;
    this.progressDots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === step - 1);
      dot.classList.toggle("is-done", i < step - 1);
    });
    this.hintEl.textContent = HINTS[step - 1];
    this.blurbEl.textContent = BLURBS[step - 1];
    this.btnNext.disabled = true;
    this.btnNext.hidden = step === 2;

    this.arc.hidden = step !== 1;
    this.wordPanel.hidden = step !== 2;
    this.trayWrap.classList.toggle("is-hidden", step === 2);
    this.hintBox.classList.toggle("is-hidden", step === 2);

    if (step === 1) this.setupPhaseOne();
    if (step === 2) this.setupPhaseWord();
  };

  MoonGame.prototype.setupPhaseOne = function () {
    const self = this;
    this.arc.innerHTML = "";
    this.tray.innerHTML = "";

    SLOT_ACCEPTS.forEach(function (accepts, index) {
      const slot = document.createElement("div");
      slot.className = "moon-slot";
      slot.dataset.index = String(index);
      if (accepts) {
        slot.dataset.accepts = accepts;
      } else {
        slot.classList.add("is-fixed", "is-filled");
        const fixed = document.createElement("div");
        fixed.className = "moon-piece is-placed";
        fixed.dataset.phase = index === 0 ? "waxing" : "waning";
        fixed.setAttribute("aria-hidden", "true");
        slot.appendChild(fixed);
      }
      self.arc.appendChild(slot);
    });

    PHASES.slice()
      .sort(function () {
        return Math.random() - 0.5;
      })
      .forEach(function (phase) {
        self.tray.appendChild(self.createPhasePiece(phase.id, phase.label));
      });

    this.updateNextEnabled();
  };

  MoonGame.prototype.createPhasePiece = function (phaseId, label) {
    const el = document.createElement("div");
    el.className = "moon-piece";
    el.dataset.phase = phaseId;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", label || phaseId);
    el.tabIndex = 0;
    this.attachDrag(el);
    return el;
  };

  MoonGame.prototype.setupPhaseWord = function () {
    this.wordError.hidden = true;
    this.messageEl.hidden = true;
    this.wordForm.hidden = false;
    this.wordInput.value = "";
    setTimeout(
      function () {
        this.wordInput.focus();
      }.bind(this),
      100
    );
  };

  MoonGame.prototype.attachDrag = function (el) {
    const self = this;
    el.addEventListener("pointerdown", function (e) {
      if (el.classList.contains("is-placed")) return;
      e.preventDefault();
      self.beginDrag(el, e);
    });
  };

  MoonGame.prototype.beginDrag = function (el, e) {
    const rect = el.getBoundingClientRect();
    this.drag = {
      el: el,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    el.classList.add("is-dragging");
    el.style.position = "fixed";
    el.style.left = rect.left + "px";
    el.style.top = rect.top + "px";
    el.style.width = rect.width + "px";
    el.style.height = rect.height + "px";
    el.style.margin = "0";
    el.style.zIndex = "1000";
    document.body.appendChild(el);
    try {
      el.setPointerCapture(e.pointerId);
    } catch (_) {
      /* ignore */
    }
  };

  MoonGame.prototype.onPointerMove = function (e) {
    if (!this.drag) return;
    const d = this.drag;
    d.el.style.left = e.clientX - d.offsetX + "px";
    d.el.style.top = e.clientY - d.offsetY + "px";
    if (this.step === 1) this.highlightSlot(e.clientX, e.clientY);
  };

  MoonGame.prototype.onPointerUp = function (e) {
    if (!this.drag) return;
    const el = this.drag.el;
    el.classList.remove("is-dragging");

    if (this.step === 1) {
      this.tryPlacePhase(el, e.clientX, e.clientY);
    } else {
      this.shakeAndTray(el);
    }

    this.clearHighlights();
    this.drag = null;
    this.updateNextEnabled();
  };

  MoonGame.prototype.shakeAndTray = function (el) {
    el.classList.add("is-shake");
    setTimeout(function () {
      el.classList.remove("is-shake");
    }, 400);
    el.style.position = "";
    el.style.left = "";
    el.style.top = "";
    el.style.width = "";
    el.style.height = "";
    el.style.margin = "";
    el.style.zIndex = "";
    this.tray.appendChild(el);
  };

  MoonGame.prototype.resetPieceStyles = function (el) {
    el.style.position = "";
    el.style.left = "";
    el.style.top = "";
    el.style.width = "";
    el.style.height = "";
    el.style.margin = "";
    el.style.zIndex = "";
  };

  MoonGame.prototype.highlightSlot = function (x, y) {
    this.clearHighlights();
    const slot = this.slotAt(x, y);
    if (slot && slot.dataset.accepts && !slot.classList.contains("is-filled")) {
      slot.classList.add("is-target");
    }
  };

  MoonGame.prototype.clearHighlights = function () {
    this.arc.querySelectorAll(".is-target").forEach(function (s) {
      s.classList.remove("is-target");
    });
  };

  MoonGame.prototype.slotAt = function (x, y) {
    const slots = this.arc.querySelectorAll(".moon-slot[data-accepts]");
    for (let i = 0; i < slots.length; i++) {
      const r = slots[i].getBoundingClientRect();
      const pad = 8;
      if (
        x >= r.left - pad &&
        x <= r.right + pad &&
        y >= r.top - pad &&
        y <= r.bottom + pad
      ) {
        return slots[i];
      }
    }
    return null;
  };

  MoonGame.prototype.tryPlacePhase = function (el, x, y) {
    const slot = this.slotAt(x, y);
    if (!slot || !slot.dataset.accepts || slot.classList.contains("is-filled")) {
      this.shakeAndTray(el);
      return;
    }
    if (slot.dataset.accepts !== el.dataset.phase) {
      this.shakeAndTray(el);
      return;
    }

    this.resetPieceStyles(el);
    el.classList.add("is-placed");
    slot.appendChild(el);
    slot.classList.add("is-filled");
    this.filledSlots[slot.dataset.index] = el.dataset.phase;
  };

  MoonGame.prototype.phaseOneComplete = function () {
    for (let i = 0; i < SLOT_ACCEPTS.length; i++) {
      const need = SLOT_ACCEPTS[i];
      if (!need) continue;
      if (this.filledSlots[String(i)] !== need) return false;
    }
    return true;
  };

  MoonGame.prototype.updateNextEnabled = function () {
    if (this.step === 1) {
      this.btnNext.disabled = !this.phaseOneComplete();
    } else {
      this.btnNext.disabled = true;
    }
  };

  MoonGame.prototype.goNext = function () {
    if (this.step === 1 && this.phaseOneComplete()) this.showStep(2);
  };

  MoonGame.prototype.checkWord = function () {
    const value = (this.wordInput.value || "").trim().toUpperCase();
    if (value === SECRET) {
      this.wordError.hidden = true;
      this.wordForm.hidden = true;
      this.messageEl.hidden = false;
      const p = this.messageEl.querySelector("p");
      if (p) p.textContent = PERSONAL_MESSAGE;
    } else {
      this.wordError.hidden = false;
    }
  };

  window.MoonGame = MoonGame;
})();
