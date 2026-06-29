// OpenFormosa — detailed GA4 interaction tracking.
// Loaded only in production (see _layouts/default.html), after gtag.js, i18n.js
// and main.js. Every handler is defensive: with no gtag present this file is a
// no-op, so it is safe even if the base tag fails to load.
(function () {
  "use strict";

  if (typeof window.gtag !== "function") return;

  const body = document.body;
  const PAGE_KEY = (body && body.dataset && body.dataset.pageKey) || "unknown";

  function language() {
    try {
      const api = window.OpenFormosaI18n;
      if (api && typeof api.getLanguage === "function") return api.getLanguage();
    } catch (error) {
      // i18n not ready — fall back to the document language below.
    }
    return document.documentElement.lang || "zh-Hant";
  }

  // Every event carries the page identity and the active UI language so reports
  // can segment by section and locale. Register these as custom dimensions in
  // GA4 (Admin > Custom definitions) to surface them in standard reports.
  function track(name, params) {
    const payload = { page_key: PAGE_KEY, content_language: language() };
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] != null) payload[key] = params[key];
      });
    }
    window.gtag("event", name, payload);
  }

  // "/assets/audio/bluemagpie/zhhard_0014.mp3" -> "zhhard_0014"
  function clipId(audio) {
    let src = (audio && (audio.currentSrc || audio.src)) || "";
    try { src = decodeURIComponent(src); } catch (error) { /* keep raw src */ }
    const file = src.split("/").pop() || "";
    return file.replace(/\.[a-z0-9]+$/i, "") || "unknown";
  }

  // ----- Language switch (explicit clicks only) -----
  // The window "openformosa:language" event also fires on initial load, so we
  // bind the buttons directly to count only deliberate switches.
  document.querySelectorAll("[data-lang-option]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const to = btn.dataset.langOption;
      const from = language();
      if (!to || to === from) return;
      window.gtag("set", { language: to }); // re-attribute later events
      track("language_switch", { from_language: from, to_language: to });
    });
  });

  // ----- Theme switch (explicit clicks only) -----
  document.querySelectorAll("[data-theme-option]").forEach((btn) => {
    btn.addEventListener("click", () => {
      track("theme_switch", { theme: btn.dataset.themeOption });
    });
  });

  // ----- Blog search (GA4 recommended "search", debounced) -----
  const searchInput = document.querySelector("[data-blog-search]");
  if (searchInput) {
    let timer = null;
    searchInput.addEventListener("input", () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const term = searchInput.value.trim();
        if (!term) return;
        const results = document.querySelectorAll("[data-post-card]:not([hidden])").length;
        track("search", { search_term: term.slice(0, 100), results_count: results });
      }, 600);
    });
  }

  // ----- Blog tag filter (GA4 recommended "select_content") -----
  const tagSelect = document.querySelector("[data-blog-tag]");
  if (tagSelect) {
    tagSelect.addEventListener("change", () => {
      const results = document.querySelectorAll("[data-post-card]:not([hidden])").length;
      track("select_content", {
        content_type: "blog_tag",
        item_id: tagSelect.value,
        results_count: results
      });
    });
  }

  // ----- CTA buttons (internal .btn links) -----
  document.querySelectorAll("a.btn").forEach((link) => {
    link.addEventListener("click", () => {
      track("cta_click", {
        cta: link.dataset.i18n || (link.textContent || "").trim().slice(0, 100),
        link_url: link.getAttribute("href")
      });
    });
  });

  // ----- Copy-to-clipboard buttons (future-proof; wired even before markup exists) -----
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      track("copy_command", { target: btn.dataset.copy });
    });
  });

  // ----- TTS audio demos -----
  // Media events (play/timeupdate/ended) do not bubble, so listen in the capture
  // phase on document to cover every player, including ones paused programmatically.
  if (document.querySelector("[data-tts-card]")) {
    const isTtsAudio = (el) => el && el.matches && el.matches("[data-tts-audio]");

    function demoTitle(audio) {
      const demo = audio.closest("[data-tts-demo]");
      const heading = demo && demo.querySelector(".tts-demo__title");
      return heading ? (heading.textContent || "").trim().slice(0, 100) : undefined;
    }

    document.addEventListener("play", (event) => {
      const audio = event.target;
      if (!isTtsAudio(audio)) return;
      audio.dataset.gaProgress = ""; // reset milestone tracking for this play session
      track("audio_start", {
        item_id: clipId(audio),
        post_slug: PAGE_KEY,
        demo_title: demoTitle(audio)
      });
    }, true);

    document.addEventListener("timeupdate", (event) => {
      const audio = event.target;
      if (!isTtsAudio(audio) || !audio.duration) return;
      const percent = (audio.currentTime / audio.duration) * 100;
      const sent = audio.dataset.gaProgress ? audio.dataset.gaProgress.split(",") : [];
      [25, 50, 75].forEach((mark) => {
        if (percent >= mark && sent.indexOf(String(mark)) === -1) {
          sent.push(String(mark));
          track("audio_progress", { item_id: clipId(audio), post_slug: PAGE_KEY, percent_played: mark });
        }
      });
      audio.dataset.gaProgress = sent.join(",");
    }, true);

    document.addEventListener("ended", (event) => {
      const audio = event.target;
      if (!isTtsAudio(audio)) return;
      track("audio_complete", {
        item_id: clipId(audio),
        post_slug: PAGE_KEY,
        duration: audio.duration ? Math.round(audio.duration) : undefined
      });
    }, true);

    // ASR transcript reveal — count opens only. main.js (registered earlier on the
    // same button) flips aria-expanded first, so reading it here gives the new state.
    document.querySelectorAll("[data-tts-reveal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.getAttribute("aria-expanded") !== "true") return;
        const card = btn.closest("[data-tts-card]");
        const audio = card && card.querySelector("[data-tts-audio]");
        const badge = card && card.querySelector(".tts-card__badge");
        track("reveal_transcript", {
          item_id: audio ? clipId(audio) : undefined,
          post_slug: PAGE_KEY,
          asr_status: badge ? (badge.classList.contains("is-warn") ? "mismatch" : "match") : undefined
        });
      });
    });
  }
})();
