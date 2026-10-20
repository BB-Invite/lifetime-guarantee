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

  const BB_NODES = [
    { id: "b1-1", x: 22, y: 22 },
    { id: "b1-2", x: 22, y: 38 },
    { id: "b1-3", x: 22, y: 54 },
    { id: "b1-4", x: 22, y: 70 },
    { id: "b1-5", x: 34, y: 30 },
    { id: "b1-6", x: 34, y: 46 },
    { id: "b1-7", x: 34, y: 62 },
    { id: "b2-1", x: 58, y: 22 },
    { id: "b2-2", x: 58, y: 38 },
    { id: "b2-3", x: 58, y: 54 },
    { id: "b2-4", x: 58, y: 70 },
    { id: "b2-5", x: 70, y: 30 },
    { id: "b2-6", x: 70, y: 46 },
    { id: "b2-7", x: 70, y: 62 },
  ];

  const BB_LINES = [
    ["b1-1", "b1-2"],
    ["b1-2", "b1-3"],
    ["b1-3", "b1-4"],
    ["b1-1", "b1-5"],
    ["b1-5", "b1-2"],
    ["b1-2", "b1-6"],
    ["b1-6", "b1-3"],
    ["b1-3", "b1-7"],
    ["b1-7", "b1-4"],
    ["b2-1", "b2-2"],
    ["b2-2", "b2-3"],
    ["b2-3", "b2-4"],
    ["b2-1", "b2-5"],
    ["b2-5", "b2-2"],
    ["b2-2", "b2-6"],
    ["b2-6", "b2-3"],
    ["b2-3", "b2-7"],
    ["b2-7", "b2-4"],
  ];

  const SECRET = "MOONLIGHT";
  const PERSONAL_MESSAGE =
    "My forever is you. #BBforever — here’s where to find the key.";

  const HINTS = [
    "Even when you cannot see the whole moon, it is still there.",
    "Two letters. One promise.",
    "The night keeps one word for you alone.",
  ];

  const BLURBS = [
    "Something is missing from this night. Can you bring its light back? Drag the pieces below to complete the sky.",
    "A hidden constellation waits. Place the stars to spell what we share.",
    "The sky is almost whole. Enter the word that lights the path to your key.",
  ];

  function MoonGame(options) {
    this.onComplete = options && options.onComplete;
    this.tray = document.getElementById("moon-tray");
    this.arc = document.getElementById("moon-arc");
    this.constellation = document.getElementById("moon-constellation");
    this.nodesGroup = document.getElementById("constellation-nodes");
    this.linesGroup = document.getElementById("constellation-lines");
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
    this.litNodes = {};
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
    this.litNodes = {};
    this.showStep(1);
  };

  MoonGame.prototype.showStep = function (step) {
    this.step = step;
    this.progressText.textContent = step + " / 3";
    this.progressDots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === step - 1);
      dot.classList.toggle("is-done", i < step - 1);
    });
    this.hintEl.textContent = HINTS[step - 1];
    this.blurbEl.textContent = BLURBS[step - 1];
    this.btnNext.disabled = true;
    this.btnNext.hidden = step === 3;

    this.arc.hidden = step !== 1;
    this.constellation.hidden = step !== 2;
    this.wordPanel.hidden = step !== 3;
    this.trayWrap.classList.toggle("is-hidden", step === 3);
    this.hintBox.classList.toggle("is-hidden", step === 3);

    if (step === 1) this.setupPhaseOne();
    if (step === 2) this.setupPhaseTwo();
    if (step === 3) this.setupPhaseThree();
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

  MoonGame.prototype.setupPhaseTwo = function () {
    const self = this;
    this.tray.innerHTML = "";
    this.nodesGroup.innerHTML = "";
    this.linesGroup.innerHTML = "";
    this.litNodes = {};

    BB_NODES.forEach(function (node) {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", String(node.x));
      circle.setAttribute("cy", String(node.y));
      circle.setAttribute("r", "2.2");
      circle.setAttribute("class", "constellation-node");
      circle.dataset.nodeId = node.id;
      self.nodesGroup.appendChild(circle);
    });

    for (let i = 0; i < BB_NODES.length; i++) {
      const star = document.createElement("div");
      star.className = "moon-piece is-star";
      star.dataset.star = String(i);
      star.setAttribute("role", "button");
      star.setAttribute("aria-label", "Star " + (i + 1));
      star.tabIndex = 0;
      self.attachDrag(star);
      self.tray.appendChild(star);
    }

    this.updateNextEnabled();
  };

  MoonGame.prototype.setupPhaseThree = function () {
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
    if (this.step === 2) this.highlightNode(e.clientX, e.clientY);
  };

  MoonGame.prototype.onPointerUp = function (e) {
    if (!this.drag) return;
    const el = this.drag.el;
    el.classList.remove("is-dragging");

    if (this.step === 1) {
      this.tryPlacePhase(el, e.clientX, e.clientY);
    } else if (this.step === 2) {
      this.tryPlaceStar(el, e.clientX, e.clientY);
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

  MoonGame.prototype.highlightNode = function (x, y) {
    this.clearHighlights();
    const node = this.nodeAt(x, y);
    if (node && !node.classList.contains("is-lit")) {
      node.classList.add("is-target");
    }
  };

  MoonGame.prototype.clearHighlights = function () {
    this.arc.querySelectorAll(".is-target").forEach(function (s) {
      s.classList.remove("is-target");
    });
    this.nodesGroup.querySelectorAll(".is-target").forEach(function (n) {
      n.classList.remove("is-target");
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

  MoonGame.prototype.nodeAt = function (x, y) {
    const nodes = this.nodesGroup.querySelectorAll(".constellation-node");
    let best = null;
    let bestDist = 40;
    for (let i = 0; i < nodes.length; i++) {
      const r = nodes[i].getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(x - cx, y - cy);
      if (dist < bestDist) {
        bestDist = dist;
        best = nodes[i];
      }
    }
    return best;
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

  MoonGame.prototype.tryPlaceStar = function (el, x, y) {
    const node = this.nodeAt(x, y);
    if (!node || node.classList.contains("is-lit")) {
      this.shakeAndTray(el);
      return;
    }
    node.classList.add("is-lit");
    this.litNodes[node.dataset.nodeId] = true;
    el.remove();
    this.drawConstellationLines();
  };

  MoonGame.prototype.drawConstellationLines = function () {
    const self = this;
    this.linesGroup.innerHTML = "";
    BB_LINES.forEach(function (pair) {
      if (!self.litNodes[pair[0]] || !self.litNodes[pair[1]]) return;
      const a = BB_NODES.find(function (n) {
        return n.id === pair[0];
      });
      const b = BB_NODES.find(function (n) {
        return n.id === pair[1];
      });
      if (!a || !b) return;
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", String(a.x));
      line.setAttribute("y1", String(a.y));
      line.setAttribute("x2", String(b.x));
      line.setAttribute("y2", String(b.y));
      self.linesGroup.appendChild(line);
    });
  };

  MoonGame.prototype.phaseOneComplete = function () {
    for (let i = 0; i < SLOT_ACCEPTS.length; i++) {
      const need = SLOT_ACCEPTS[i];
      if (!need) continue;
      if (this.filledSlots[String(i)] !== need) return false;
    }
    return true;
  };

  MoonGame.prototype.phaseTwoComplete = function () {
    return BB_NODES.every(
      function (n) {
        return this.litNodes[n.id];
      }.bind(this)
    );
  };

  MoonGame.prototype.updateNextEnabled = function () {
    if (this.step === 1) {
      this.btnNext.disabled = !this.phaseOneComplete();
    } else if (this.step === 2) {
      this.btnNext.disabled = !this.phaseTwoComplete();
    } else {
      this.btnNext.disabled = true;
    }
  };

  MoonGame.prototype.goNext = function () {
    if (this.step === 1 && this.phaseOneComplete()) this.showStep(2);
    else if (this.step === 2 && this.phaseTwoComplete()) this.showStep(3);
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
