(() => {
  const getContext = () =>
    window.ECOURTS_ASSISTANT_CONTEXT?.get() || {
      language: "en",
      route: "home",
      case: null,
      paper: null,
    };
  const endpoint = () =>
      window.ECOURTS_CONFIG?.chatEndpoint || `${(window.ECOURTS_CONFIG?.analysisEndpoint || "").replace(/\/$/, "")}/chat`,
    limit = Number(window.ECOURTS_CONFIG?.nykQuestionLimit) || 12;
  const allowedHosts = [
    "ecourts.gov.in",
    "dcourts.gov.in",
    "indiacode.nic.in",
    "legislative.gov.in",
    "ghconline.gov.in",
    "assam.gov.in",
    "nalsa.gov.in",
  ];
  const allowedRoutes = new Set([
    "home",
    "finder",
    "case/understand",
    "case/action",
    "case/documents",
    "documents",
    "help",
    "courts",
    "courts/high",
    "courts/district",
    "workspace",
  ]);
  const copy = {
    en: {
      name: "Nayak AI",
      by: "Powered by OpenAI",
      open: "Open Nayak AI assistance",
      close: "Close",
      clear: "Clear conversation",
      heading: "How can I help?",
      intro:
        "Ask about this case, an analysed court paper, court services or official legal references.",
      starters: [
        "What happened in my case?",
        "What happens next?",
        "Explain my analysed court paper",
        "Find the right court or legal-aid service",
      ],
      placeholder: "Ask Nayak AI…",
      send: "Send",
      remaining: "questions left",
      boundary:
        "AI assistance, not a court record or legal advice. Verify important steps with the court or a qualified lawyer.",
      prompt: "Need help with the next step?",
      ask: "Ask Nayak",
      error: "Nayak could not answer just now. Please try again.",
      loading: [
        "Understanding your question",
        "Checking available case context",
        "Reviewing official sources when needed",
      ],
      types: {
        case: "Case explanation",
        paper: "Court paper explanation",
        court_information: "Court information",
        legal_reference: "Legal reference",
        refusal: "Request outside Nayak's scope",
        limitation: "Information to verify",
      },
    },
    as: {
      name: "Nayak AI",
      by: "OpenAI-ৰ দ্বাৰা চালিত",
      open: "Nayak AI সহায় খোলক",
      close: "বন্ধ কৰক",
      clear: "কথোপকথন মচক",
      heading: "মই কেনেকৈ সহায় কৰিব পাৰোঁ?",
      intro:
        "এই মামলা, বিশ্লেষিত আদালতৰ কাগজ, আদালত সেৱা বা চৰকাৰী আইনী উৎসৰ বিষয়ে সোধক।",
      starters: [
        "মোৰ মামলাত কি ঘটিল?",
        "ইয়াৰ পিছত কি হ'ব?",
        "বিশ্লেষিত আদালতৰ কাগজ বুজাওক",
        "সঠিক আদালত বা আইনী সহায় বিচাৰক",
      ],
      placeholder: "Nayak AI-ক সোধক…",
      send: "পঠিয়াওক",
      remaining: "টা প্ৰশ্ন বাকী",
      boundary:
        "এইটো AI সহায়; আদালতৰ ৰেকৰ্ড বা আইনী পৰামৰ্শ নহয়। গুৰুত্বপূৰ্ণ পদক্ষেপ আদালত বা যোগ্য অধিবক্তাৰ সৈতে যাচাই কৰক।",
      prompt: "পৰৱৰ্তী পদক্ষেপত সহায় লাগিব নেকি?",
      ask: "Nayak-ক সোধক",
      error: "Nayak-এ এতিয়া উত্তৰ দিব নোৱাৰিলে। পুনৰ চেষ্টা কৰক।",
      loading: [
        "আপোনাৰ প্ৰশ্ন বুজি লোৱা হৈছে",
        "উপলব্ধ মামলাৰ তথ্য পৰীক্ষা কৰা হৈছে",
        "প্ৰয়োজন হ'লে চৰকাৰী উৎস চোৱা হৈছে",
      ],
      types: {
        case: "মামলাৰ ব্যাখ্যা",
        paper: "আদালতৰ কাগজৰ ব্যাখ্যা",
        court_information: "আদালতৰ তথ্য",
        legal_reference: "আইনী প্ৰসংগ",
        refusal: "Nayak-ৰ সীমাৰ বাহিৰৰ অনুৰোধ",
        limitation: "যাচাই কৰিবলগীয়া তথ্য",
      },
    },
    hi: {
      name: "Nayak AI",
      by: "OpenAI द्वारा संचालित",
      open: "Nayak AI सहायता खोलें",
      close: "बंद करें",
      clear: "बातचीत साफ़ करें",
      heading: "मैं कैसे सहायता करूँ?",
      intro:
        "इस मामले, विश्लेषित अदालती कागज़, अदालत सेवाओं या आधिकारिक कानूनी स्रोतों के बारे में पूछें।",
      starters: [
        "मेरे मामले में क्या हुआ?",
        "आगे क्या होगा?",
        "मेरे विश्लेषित अदालती कागज़ को समझाएँ",
        "सही अदालत या कानूनी सहायता खोजें",
      ],
      placeholder: "Nayak AI से पूछें…",
      send: "भेजें",
      remaining: "प्रश्न बाकी",
      boundary:
        "यह AI सहायता है, अदालत का रिकॉर्ड या कानूनी सलाह नहीं। महत्वपूर्ण कदम अदालत या योग्य वकील से जाँचें।",
      prompt: "अगले कदम में सहायता चाहिए?",
      ask: "Nayak से पूछें",
      error: "Nayak अभी उत्तर नहीं दे सका। दोबारा प्रयास करें।",
      loading: [
        "आपका प्रश्न समझा जा रहा है",
        "उपलब्ध केस जानकारी जाँची जा रही है",
        "ज़रूरत होने पर आधिकारिक स्रोत देखे जा रहे हैं",
      ],
      types: {
        case: "केस की व्याख्या",
        paper: "अदालती कागज़ की व्याख्या",
        court_information: "अदालत की जानकारी",
        legal_reference: "कानूनी संदर्भ",
        refusal: "Nayak के दायरे से बाहर अनुरोध",
        limitation: "जाँचने योग्य जानकारी",
      },
    },
  };
  const state = {
    open: false,
    messages: [],
    questionsUsed: 0,
    pending: false,
    draft: "",
    speakAnswers: false,
    listening: false,
    shownPrompts: new Set(),
    friction: {},
    lastFocus: null,
    idle: null,
  };
  const t = () => copy[getContext().language] || copy.en;
  const sourceLabel = () =>
    ({ en: "Official sources", as: "চৰকাৰী উৎস", hi: "आधिकारिक स्रोत" })[
      getContext().language
    ] || "Official sources";
  const hostAllowed = (url) => {
    try {
      const host = new URL(url).hostname;
      return allowedHosts.some((x) => host === x || host.endsWith(`.${x}`));
    } catch {
      return false;
    }
  };
  function make(tag, attrs = {}, text = "") {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) =>
      k === "class" ? (node.className = v) : node.setAttribute(k, v),
    );
    if (text) node.textContent = text;
    return node;
  }
  function appendInline(node, text) {
    String(text)
      .split(/(\*\*[^*]+\*\*)/g)
      .filter(Boolean)
      .forEach((part) => {
        if (part.startsWith("**") && part.endsWith("**"))
          node.append(make("strong", {}, part.slice(2, -2)));
        else node.append(document.createTextNode(part));
      });
  }
  function answerContent(text) {
    const content = make("div", { class: "nyk-answer-content" });
    const normalized = String(text || "")
      .replace(/:\s*-\s+/g, ":\n- ")
      .replace(/([.!?])\s+(\*\*[^*]{2,70}:\*\*)/g, "$1\n\n$2");
    const lines = normalized.split(/\r?\n/);
    let list = null;
    lines.forEach((raw) => {
      const line = raw.trim();
      if (!line) {
        list = null;
        return;
      }
      if (/^[-•]\s+/.test(line)) {
        if (!list) {
          list = make("ul");
          content.append(list);
        }
        const item = make("li");
        appendInline(item, line.replace(/^[-•]\s+/, ""));
        list.append(item);
        return;
      }
      list = null;
      const paragraph = make("p");
      appendInline(paragraph, line);
      content.append(paragraph);
    });
    return content;
  }
  let activeRequest = null;
  function recoveryCopy() {
    return ({
      en: { title: "Let’s try that again", back: "Back", retry: "Try again", return: "Back to page", network: "Nayak couldn’t connect. Check your connection, then try again. You can keep using the app.", unavailable: "Nayak is temporarily unavailable. Please try again shortly.", rate: "Nayak has reached its request limit. Wait a minute, then try again.", cancelled: "The request was stopped. You can try again when you’re ready.", preview: "Open working preview" },
      hi: { title: "फिर कोशिश करें", back: "वापस", retry: "फिर कोशिश करें", return: "पृष्ठ पर वापस जाएँ", network: "नायक से संपर्क नहीं हुआ। कनेक्शन जाँचें और फिर कोशिश करें। आप ऐप इस्तेमाल कर सकते हैं।", unavailable: "नायक अभी उपलब्ध नहीं है। थोड़ी देर बाद कोशिश करें।", rate: "अनुरोध सीमा पूरी हो गई है। एक मिनट बाद कोशिश करें।", cancelled: "अनुरोध रोक दिया गया। तैयार होने पर फिर कोशिश करें।", preview: "चालू प्रीव्यू खोलें" },
      as: { title: "আকৌ চেষ্টা কৰক", back: "উভতি যাওক", retry: "আকৌ চেষ্টা কৰক", return: "পৃষ্ঠালৈ উভতি যাওক", network: "Nayak-ৰ সৈতে সংযোগ হোৱা নাই। সংযোগ পৰীক্ষা কৰি আকৌ চেষ্টা কৰক। আপুনি এপ ব্যৱহাৰ কৰিব পাৰে।", unavailable: "Nayak এতিয়া উপলব্ধ নহয়। অলপ পিছত চেষ্টা কৰক।", rate: "অনুৰোধৰ সীমা সম্পূৰ্ণ হৈছে। এক মিনিট পিছত চেষ্টা কৰক।", cancelled: "অনুৰোধ বন্ধ কৰা হৈছে। সাজু হ’লে আকৌ চেষ্টা কৰক।", preview: "কাৰ্যকৰী প্ৰিভিউ খোলক" }
    })[getContext().language] || recoveryCopyEnglish;
  }
  const recoveryCopyEnglish = { title: "Let’s try that again", back: "Back", retry: "Try again", return: "Back to page", network: "Nayak couldn’t connect. Please try again.", unavailable: "Nayak is temporarily unavailable.", rate: "Wait a minute, then try again.", cancelled: "Request stopped.", preview: "Open working preview" };
  function loadingNode() {
    const box = make("article", {
      class: "nyk-loading",
      role: "status",
      "aria-label": t().loading[0],
    });
    box.append(
      make("div", { class: "nyk-loading-mark", "aria-hidden": "true" }),
    );
    const steps = make("div", { class: "nyk-loading-steps" });
    t().loading.forEach((label, index) => {
      const step = make("div", { class: "nyk-loading-step" });
      step.append(
        make("span", { "aria-hidden": "true" }, index === 0 ? "●" : "○"),
        make("span", {}, label),
      );
      steps.append(step);
    });
    box.append(steps);
    return box;
  }
  function messageNode(message) {
    const box = make("article", { class: `nyk-message ${message.role}` });
    if (message.failed) {
      box.classList.add("nyk-error");
      box.append(make("h3", {}, recoveryCopy().title));
    }
    if (message.role === "assistant" && message.type)
      box.append(
        make(
          "div",
          { class: "nyk-answer-type" },
          t().types[message.type] || t().types.limitation,
        ),
      );
    box.append(
      message.role === "assistant"
        ? answerContent(message.text)
        : make("p", {}, message.text),
    );
    if (message.failed) {
      const actions = make("div", { class: "nyk-recovery" });
      const retry = make("button", { type: "button", class: "nyk-retry" }, recoveryCopy().retry);
      retry.disabled = state.pending;
      retry.onclick = () => submit(message.retryText);
      const back = make("button", { type: "button", class: "nyk-return" }, recoveryCopy().return);
      back.onclick = close;
      actions.append(retry, back);
      const preview = window.ECOURTS_CONFIG?.previewOrigin;
      if (preview && ["localhost", "127.0.0.1"].includes(location.hostname) && location.origin !== preview && message.failureKind === "network") {
        actions.append(make("a", { href: preview + "/index.html" + location.hash }, recoveryCopy().preview));
      }
      box.append(actions);
    }
    if (message.sources?.length) {
      const links = make("div", { class: "nyk-sources" });
      links.append(
        make("span", { class: "nyk-region-label" }, sourceLabel()),
      );
      message.sources
        .filter((x) => hostAllowed(x.url))
        .forEach((x) =>
          links.append(
            make(
              "a",
              { href: x.url, target: "_blank", rel: "noopener noreferrer" },
              x.title,
            ),
          ),
        );
      box.append(links);
    }
    if (message.actions?.length) {
      const actions = make("div", { class: "nyk-response-actions" });
      message.actions
        .filter((x) => x?.label && allowedRoutes.has(x.route))
        .forEach((x) => {
          const button = make("button", { type: "button" }, x.label);
          button.onclick = () => {
            close();
            location.hash = x.route;
          };
          actions.append(button);
        });
      if (actions.childElementCount) box.append(actions);
    }
    if (message.role === "assistant")
      box.append(
        make("p", { class: "nyk-boundary" }, message.boundary || t().boundary),
      );
    if (message.role === "assistant" && window.ECOURTS_VOICE)
      box.append(window.ECOURTS_VOICE.controls(() => `${message.text} ${message.boundary || t().boundary}`, window.ECOURTS_VOICE.t().read, box));
    return box;
  }
  function render() {
    document.querySelector(".nyk-backdrop")?.remove();
    document.querySelector(".nyk-panel")?.remove();
    if (!state.open) {
      document.body.classList.remove("nyk-open");
      return;
    }
    document.body.classList.add("nyk-open");
    const backdrop = make("div", { class: "nyk-backdrop" });
    backdrop.onclick = close;
    const panel = make("section", {
      class: "nyk-panel",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "nyk-title",
    });
    const head = make("header", { class: "nyk-head" }),
      title = make("div", { class: "nyk-title" }),
      mark = make("span", { class: "nyk-mark", "aria-hidden": "true" }),
      titleText = make("span");
    mark.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6z"/><path d="M20 2v4M18 4h4"/></svg>';
    titleText.append(
      make("b", { id: "nyk-title" }, t().name),
      make("small", {}, t().by),
    );
    const back = make("button", { type: "button", class: "nyk-back-button", "aria-label": recoveryCopy().back }, "←");
    back.onclick = close;
    title.append(back, mark, titleText);
    const actions = make("div", { class: "nyk-head-actions" }),
      clear = make(
        "button",
        {
          class: "nyk-icon-button",
          type: "button",
          "aria-label": t().clear,
          title: t().clear,
        },
        "↺",
      ),
      closer = make(
        "button",
        {
          class: "nyk-icon-button",
          type: "button",
          "aria-label": t().close,
          title: t().close,
        },
        "×",
      );
    clear.disabled = state.pending;
    clear.onclick = () => {
      window.ECOURTS_VOICE?.cancelAll();
      state.draft = "";
      state.messages = [];
      state.questionsUsed = 0;
      render();
    };
    closer.onclick = close;
    actions.append(clear, closer);
    head.append(title, actions);
    const body = make("div", { class: "nyk-body", tabindex: "0" });
    if (!state.messages.length) {
      const intro = make("div", { class: "nyk-intro" });
      intro.append(make("h2", {}, t().heading), make("p", {}, t().intro));
      const starters = make("div", { class: "nyk-starters" });
      t().starters.forEach((text) => {
        const button = make(
          "button",
          { class: "nyk-starter", type: "button" },
          text,
        );
        button.onclick = () => submit(text);
        starters.append(button);
      });
      intro.append(starters);
      body.append(intro);
    } else {
      const messages = make("div", {
        class: "nyk-messages",
        "aria-live": "polite",
      });
      state.messages.forEach((m) => messages.append(messageNode(m)));
      if (state.pending) messages.append(loadingNode());
      body.append(messages);
    }
    const composer = make("footer", { class: "nyk-composer" }),
      form = make("form", { class: "nyk-form" }),
      input = make("textarea", {
        maxlength: "600",
        rows: "1",
        placeholder: t().placeholder,
        "aria-label": t().placeholder,
      }),
      send = make(
        "button",
        { class: "nyk-send", type: "submit", "aria-label": t().send },
        "↑",
      );
    send.disabled = state.pending || state.questionsUsed >= limit;
    form.onsubmit = (e) => {
      e.preventDefault();
      submit(input.value);
    };
    input.value = state.draft;
    input.oninput = () => { state.draft = input.value; };
    const voice = window.ECOURTS_VOICE;
    if (voice) {
      const mic = make("button", { class: "nyk-mic", type: "button", "aria-label": voice.t().mic, title: voice.t().mic, "aria-pressed": "false" });
      mic.append(voice.icon("mic"));
      mic.disabled = state.pending || state.questionsUsed >= limit;
      const status = make("p", { class: "nyk-voice-status", role: "status" });
      const setIdle = () => { state.listening = false; mic.setAttribute("aria-pressed", "false"); mic.setAttribute("aria-label", voice.t().mic); };
      mic.onclick = () => {
        if (state.listening) { voice.stopListening(); setIdle(); status.textContent = voice.t().ready; return; }
        const prefix = input.value.trim();
        state.listening = true; mic.setAttribute("aria-pressed", "true"); mic.setAttribute("aria-label", voice.t().micStop);
        voice.listen({ onText: text => { input.value = (prefix ? prefix + " " : "") + text; input.value = input.value.slice(0, 600); state.draft = input.value; }, onStatus: text => { status.textContent = text; }, onEnd: setIdle });
      };
      form.append(mic);
      const option = make("label", { class: "nyk-speak-option" });
      const checkbox = make("input", { type: "checkbox" }); checkbox.checked = state.speakAnswers;
      checkbox.onchange = () => { state.speakAnswers = checkbox.checked; if (!checkbox.checked) voice.stop(); };
      option.append(checkbox, document.createTextNode(voice.t().speakAnswers));
      composer.append(option, make("p", { class: "nyk-voice-note" }, voice.t().privacy), status);
    }
    form.append(input, send);
    const meta = make("div", { class: "nyk-meta" });
    meta.append(
      make(
        "span",
        { class: "nyk-remaining" },
        `${Math.max(0, limit - state.questionsUsed)} ${t().remaining}`,
      ),
      make("span", { class: "nyk-disclaimer" }, t().boundary),
    );
    composer.append(form, meta);
    panel.append(head, body, composer);
    document.body.append(backdrop, panel);
    setTimeout(() => { if (input.isConnected && !state.pending) input.focus({ preventScroll: true }); });
    body.scrollTop = body.scrollHeight;
  }
  function open(prefill = "") {
    if (state.open) return;
    state.lastFocus = document.activeElement;
    window.ECOURTS_VOICE?.cancelAll();
    state.open = true;
    document.querySelector(".nyk-prompt")?.remove();
    render();
    if (prefill)
      setTimeout(() => {
        const input = document.querySelector(".nyk-form textarea");
        if (input) { input.value = prefill; state.draft = prefill; }
      });
  }
  function close() {
    activeRequest?.abort();
    window.ECOURTS_VOICE?.cancelAll();
    state.listening = false;
    state.open = false;
    render();
    state.lastFocus?.focus?.();
  }
  async function submit(raw) {
    const text = String(raw || "").trim();
    if (!text || state.pending || state.questionsUsed >= limit) return;
    window.ECOURTS_VOICE?.stopListening();
    state.listening = false;
    state.draft = "";
    state.messages.push({ role: "user", text });
    state.questionsUsed++;
    state.pending = true;
    render();
    const controller = new AbortController();
    activeRequest = controller;
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const context = getContext(),
        history = state.messages
          .slice(-5, -1)
          .map((m) => ({ role: m.role, text: m.text.slice(0, 700) }));
      const response = await fetch(endpoint(), {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          language: context.language,
          route: context.route,
          case: context.case,
          paper: context.paper,
          history,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.answer) { const error = new Error("Request failed"); error.status = response.status; throw error; }
      state.messages.push({
        role: "assistant",
        text: data.answer,
        type: data.answer_type,
        sources: data.sources,
        actions: data.actions,
        boundary: data.boundary,
      });
    } catch (error) {
      const kind = error.name === "AbortError" ? "cancelled" : error.status === 429 ? "rate" : error.status ? "unavailable" : "network";
      state.questionsUsed = Math.max(0, state.questionsUsed - 1);
      state.messages.push({ role: "assistant", text: recoveryCopy()[kind], failed: true, retryText: text, failureKind: kind, boundary: t().boundary });
    } finally {
      clearTimeout(timeout);
      if (activeRequest === controller) activeRequest = null;
      state.pending = false;
      render();
      if (state.open && state.speakAnswers) {
        const answer = state.messages.at(-1);
        window.ECOURTS_VOICE?.speak(`${answer.text} ${answer.boundary || t().boundary}`, document.querySelector(".nyk-panel"));
      }
    }
  }
  function showPrompt() {
    const route = getContext().route;
    if (
      state.open ||
      state.shownPrompts.has(route) ||
      document.querySelector(".nyk-prompt")
    )
      return;
    state.shownPrompts.add(route);
    const box = make("aside", { class: "nyk-prompt", role: "status" });
    box.append(make("p", {}, t().prompt));
    const ask = make("button", { type: "button" }, t().ask),
      dismiss = make(
        "button",
        { class: "nyk-dismiss", type: "button", "aria-label": t().close },
        "×",
      );
    ask.onclick = () => open(t().prompt);
    dismiss.onclick = () => box.remove();
    box.append(ask, dismiss);
    document.body.append(box);
  }
  function resetIdle() {
    clearTimeout(state.idle);
    const route = getContext().route;
    if (route && route !== "home") state.idle = setTimeout(showPrompt, 35000);
  }
  window.addEventListener("ecourts:friction", (e) => {
    const key = `${e.detail.route}:${e.detail.type}`;
    state.friction[key] = (state.friction[key] || 0) + 1;
    const threshold = e.detail.type === "invalid-upload" ? 1 : 2;
    if (state.friction[key] >= threshold)
      setTimeout(showPrompt, e.detail.type === "invalid-upload" ? 5000 : 0);
  });
  window.addEventListener("popstate", () => { if (state.open) close(); });
  window.addEventListener("ecourts:nayak-open", () => open());
  window.addEventListener("ecourts:route", () => { if (state.open) close(); resetIdle(); });
  ["pointerdown", "keydown"].forEach((name) =>
    document.addEventListener(name, resetIdle, { passive: true }),
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.open) close();
    if (e.key === "Tab" && state.open) {
      const items = [...document.querySelectorAll('.nyk-panel button:not(:disabled), .nyk-panel a[href], .nyk-panel textarea, .nyk-panel input')].filter(el => !el.hidden && el.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (e.shiftKey && (document.activeElement === first || !document.activeElement.closest('.nyk-panel'))) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !document.activeElement.closest('.nyk-panel'))) { e.preventDefault(); first?.focus(); }
    }
  });
  const launcher = make(
    "button",
    {
      class: "nyk-launcher",
      type: "button",
      "data-nyk-launcher": "",
      "aria-label": t().open,
    },
    "Nayak",
  );
  launcher.onclick = () => open();
  document.body.append(launcher);
  resetIdle();
})();
