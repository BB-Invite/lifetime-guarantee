(function () {
  "use strict";

  const LOCAL_KEY = "bbforever-submissions";
  const SENT_KEY = "bbforever-sent-ids";

  function config() {
    return window.BB_CONFIG || {};
  }

  function loadSubmissions() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    } catch (_) {
      return [];
    }
  }

  function saveLocal(submission) {
    const list = loadSubmissions();
    list.unshift(submission);
    // Keep a reasonable history
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 50)));
    return submission;
  }

  /** Replace the newest entry with the same event (e.g. live NO tally). */
  function upsertLocalByEvent(submission) {
    const list = loadSubmissions().filter((s) => s.event !== submission.event);
    list.unshift(submission);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 50)));
    return submission;
  }

  function alreadySent(id) {
    try {
      const sent = JSON.parse(sessionStorage.getItem(SENT_KEY) || "[]");
      return sent.includes(id);
    } catch (_) {
      return false;
    }
  }

  function markSent(id) {
    try {
      const sent = JSON.parse(sessionStorage.getItem(SENT_KEY) || "[]");
      if (!sent.includes(id)) sent.push(id);
      sessionStorage.setItem(SENT_KEY, JSON.stringify(sent));
    } catch (_) {
      /* ignore */
    }
  }

  function buildQuizPayload(questions, firstAnswers, answers, score, passed, event) {
    const rows = questions.map((q, i) => {
      const first = firstAnswers[q.id] || "";
      const final = answers[q.id] || "";
      const firstLabel =
        (q.options.find((o) => o.value === first) || {}).label || first || "—";
      const finalLabel =
        (q.options.find((o) => o.value === final) || {}).label || final || "—";
      const firstOk = first === q.correct;
      return {
        number: i + 1,
        id: q.id,
        prompt: q.prompt,
        correct: q.correct,
        firstAnswer: first,
        firstLabel,
        firstCorrect: firstOk,
        finalAnswer: final,
        finalLabel,
        finalCorrect: final === q.correct,
      };
    });

    return {
      id: `${event}-${Date.now()}`,
      event,
      registrationId: "#BBforever",
      timestamp: new Date().toISOString(),
      localTime: new Date().toLocaleString(),
      score,
      total: questions.length,
      passed,
      answers: rows,
      userAgent: navigator.userAgent,
    };
  }

  function formatEmailBody(submission) {
    const lines = [
      `Event: ${submission.event}`,
      `Time: ${submission.localTime}`,
      `Registration ID: ${submission.registrationId}`,
    ];

    if (typeof submission.noClickCount === "number") {
      lines.push(`NO button clicks: ${submission.noClickCount}`);
    }

    if (submission.message) {
      lines.push(`Message: ${submission.message}`);
    }

    if (typeof submission.score === "number") {
      lines.push(
        `Score: ${submission.score} / ${submission.total} (${
          submission.passed ? "PASSED" : "not yet"
        })`
      );
    }

    if (submission.answers && submission.answers.length) {
      lines.push("", "—— Responses ——", "");
      submission.answers.forEach((a) => {
        lines.push(
          `${a.number}. ${a.prompt}`,
          `   First pick: ${a.firstAnswer}. ${a.firstLabel} ${
            a.firstCorrect ? "✓" : "✗"
          }`,
          `   Final pick: ${a.finalAnswer}. ${a.finalLabel} ${
            a.finalCorrect ? "✓" : "✗"
          }`,
          `   Correct: ${a.correct}`,
          ""
        );
      });
    }

    return lines.join("\n");
  }

  async function sendEmail(submission) {
    const cfg = config();
    const key = (cfg.web3formsAccessKey || "").trim();

    if (!key || key === "YOUR_WEB3FORMS_ACCESS_KEY") {
      console.warn(
        "[BB] Email not sent — set web3formsAccessKey in js/config.js"
      );
      return { ok: false, skipped: true, reason: "missing_key" };
    }

    if (alreadySent(submission.id)) {
      return { ok: true, skipped: true, reason: "duplicate" };
    }

    const payload = {
      access_key: key,
      subject: `${cfg.emailSubject || "#BBforever"} — ${submission.event}`,
      from_name: "Lifetime Guarantee Registration",
      message: formatEmailBody(submission),
      event: submission.event,
      registration_id: submission.registrationId,
      no_click_count:
        typeof submission.noClickCount === "number"
          ? String(submission.noClickCount)
          : "",
      choice: submission.event === "proposal_yes" ? "YES" : submission.event === "proposal_no_clicks" ? "NO" : "",
      score:
        typeof submission.score === "number"
          ? `${submission.score}/${submission.total}`
          : "",
      passed: String(Boolean(submission.passed)),
      timestamp: submission.timestamp,
      // Structured JSON for your records
      responses_json: JSON.stringify(submission, null, 2),
    };

    if (cfg.notifyEmail) {
      payload.email = cfg.notifyEmail;
    }

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        markSent(submission.id);
        return { ok: true, data };
      }
      console.warn("[BB] Email send failed", data);
      return { ok: false, data };
    } catch (err) {
      console.warn("[BB] Email send error", err);
      return { ok: false, error: String(err) };
    }
  }

  /**
   * Save locally (for host.html) and email the host.
   */
  async function recordSubmission(submission, options) {
    const opts = options || {};
    if (opts.upsert) {
      upsertLocalByEvent(submission);
    } else {
      saveLocal(submission);
    }
    const emailResult = await sendEmail(submission);
    return { submission, emailResult };
  }

  window.BB_RESPONSES = {
    LOCAL_KEY,
    loadSubmissions,
    saveLocal,
    upsertLocalByEvent,
    buildQuizPayload,
    formatEmailBody,
    sendEmail,
    recordSubmission,
    buildSimpleEvent(event, extra) {
      return {
        id: `${event}-${Date.now()}`,
        event,
        registrationId: "#BBforever",
        timestamp: new Date().toISOString(),
        localTime: new Date().toLocaleString(),
        userAgent: navigator.userAgent,
        ...(extra || {}),
      };
    },
  };
})();
