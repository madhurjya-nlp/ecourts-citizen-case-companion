(() => {
  'use strict';
  const strings = {
    en: { read: 'Read aloud', page: 'Read this page', section: 'Read this section', pause: 'Pause', resume: 'Resume', stop: 'Stop reading', mic: 'Speak your question', micStop: 'Stop microphone', listening: 'Listening… Your words will appear below. Review and send.', ready: 'Review your words, then press Send.', denied: 'Microphone access was denied. Allow it in browser settings or type your question.', failed: 'Speech could not be captured. Try again or type your question.', noSpeech: 'No speech detected. Try again or type your question.', unavailable: 'Voice input is unavailable in this browser. Type your question below.', audioUnavailable: 'Read aloud is unavailable in this browser.', voiceMissing: 'No voice for this language is installed. Your device may use a different voice.', speakAnswers: 'Read Nayak answers aloud', privacy: 'Your browser may process speech online. Review the transcript before sending.', empty: 'There is no visible text to read.' },
    hi: { read: 'सुनें', page: 'यह पृष्ठ सुनें', section: 'यह भाग सुनें', pause: 'रोकें', resume: 'जारी रखें', stop: 'पढ़ना बंद करें', mic: 'अपना प्रश्न बोलें', micStop: 'माइक्रोफ़ोन बंद करें', listening: 'सुन रहे हैं… अपने शब्द नीचे जाँचें और भेजें।', ready: 'अपने शब्द जाँचें, फिर भेजें दबाएँ।', denied: 'माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र सेटिंग में अनुमति दें या प्रश्न लिखें।', failed: 'आवाज़ नहीं ली जा सकी। फिर कोशिश करें या प्रश्न लिखें।', noSpeech: 'आवाज़ नहीं मिली। फिर कोशिश करें या प्रश्न लिखें।', unavailable: 'इस ब्राउज़र में आवाज़ से प्रश्न उपलब्ध नहीं है। नीचे प्रश्न लिखें।', audioUnavailable: 'इस ब्राउज़र में सुनने की सुविधा उपलब्ध नहीं है।', voiceMissing: 'इस भाषा की आवाज़ स्थापित नहीं है। डिवाइस दूसरी आवाज़ इस्तेमाल कर सकता है।', speakAnswers: 'नायक के उत्तर सुनें', privacy: 'ब्राउज़र आवाज़ को ऑनलाइन संसाधित कर सकता है। भेजने से पहले शब्द जाँचें।', empty: 'पढ़ने के लिए कोई दिखाई देने वाला पाठ नहीं है।' },
    as: { read: 'পঢ়ি শুনাওক', page: 'এই পৃষ্ঠা শুনক', section: 'এই অংশ শুনক', pause: 'বিৰতি', resume: 'পুনৰ আৰম্ভ কৰক', stop: 'পঢ়া বন্ধ কৰক', mic: 'আপোনাৰ প্ৰশ্ন কওক', micStop: 'মাইক বন্ধ কৰক', listening: 'শুনি আছোঁ… তলত আপোনাৰ কথা পৰীক্ষা কৰি পঠিয়াওক।', ready: 'আপোনাৰ কথা পৰীক্ষা কৰি পঠিয়াওক টিপক।', denied: 'মাইক ব্যৱহাৰৰ অনুমতি নাই। ব্ৰাউজাৰ ছেটিংছত অনুমতি দিয়ক বা প্ৰশ্ন লিখক।', failed: 'কথা ধৰিব পৰা নগ’ল। পুনৰ চেষ্টা কৰক বা প্ৰশ্ন লিখক।', noSpeech: 'কোনো কথা শুনা নগ’ল। পুনৰ চেষ্টা কৰক বা প্ৰশ্ন লিখক।', unavailable: 'এই ব্ৰাউজাৰত কথাৰে প্ৰশ্ন সোধাৰ সুবিধা নাই। তলত প্ৰশ্ন লিখক।', audioUnavailable: 'এই ব্ৰাউজাৰত পঢ়ি শুনোৱাৰ সুবিধা নাই।', voiceMissing: 'এই ভাষাৰ কণ্ঠ ইনষ্টল কৰা নাই। ডিভাইচে আন কণ্ঠ ব্যৱহাৰ কৰিব পাৰে।', speakAnswers: 'নায়কৰ উত্তৰ পঢ়ি শুনাওক', privacy: 'ব্ৰাউজাৰে কথা অনলাইনত প্ৰক্ৰিয়া কৰিব পাৰে। পঠিওৱাৰ আগতে শব্দবোৰ পৰীক্ষা কৰক।', empty: 'পঢ়িবলৈ কোনো দৃশ্যমান লিখনি নাই।' }
  };
  const language = () => window.ECOURTS_ASSISTANT_CONTEXT?.get()?.language || document.documentElement.lang || 'en';
  const t = () => strings[language().split('-')[0]] || strings.en;
  const locale = () => ({ en: 'en-IN', hi: 'hi-IN', as: 'as-IN' }[language()] || language());
  const icons = { mic: '<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>', audio: '<path d="M11 4 5 9H2v6h3l6 5zM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>' };
  function icon(name) { const span = document.createElement('span'); span.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.audio}</svg>`; return span.firstChild; }
  function button(label, action, image) { const b = document.createElement('button'); b.type = 'button'; b.className = 'ec-voice-button'; if (image) b.append(icon(image)); b.append(document.createTextNode(label)); b.onclick = action; return b; }
  let recognition = null, generation = 0, activeRoot = null, playing = false, paused = false;
  let statusText = '';
  function visible(el) { return !el.closest('[hidden],[aria-hidden="true"],script,style,noscript,template,input,textarea,select,svg,button,[data-voice-controls],.sr-only,.visually-hidden,[inert],.nyk-panel,.nyk-prompt,nav') && !!el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden'; }
  function cleanText(root) {
    if (!root) return '';
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), parts = [];
    while (walker.nextNode()) { const el = walker.currentNode.parentElement; if (el && visible(el)) parts.push(walker.currentNode.textContent.trim()); }
    return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  }
  function update() {
    document.querySelectorAll('[data-voice-controls] .ec-voice-status').forEach(n => { n.textContent = statusText; });
    document.querySelectorAll('[data-voice-pause]').forEach(b => { b.hidden = !playing; b.textContent = paused ? t().resume : t().pause; });
    document.querySelectorAll('[data-voice-stop]').forEach(b => { b.hidden = !playing; b.textContent = t().stop; });
  }
  function stop() { generation++; window.speechSynthesis?.cancel(); activeRoot = null; playing = paused = false; statusText = ''; update(); }
  function stopListening() { if (recognition) { const previous = recognition; recognition = null; const end = previous.onend; previous.onend = null; previous.abort(); end?.(); } }
  function speak(text, root = null) {
    stop(); stopListening();
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { statusText = t().audioUnavailable; update(); return; }
    text = String(text || '').replace(/[*#`]/g, '').trim();
    if (!text) { statusText = t().empty; update(); return; }
    activeRoot = root;
    const synth = window.speechSynthesis, voices = synth.getVoices(), lang = locale();
    const voice = voices.find(v => v.lang.toLowerCase() === lang.toLowerCase()) || voices.find(v => v.lang.split('-')[0] === lang.split('-')[0]);
    if (voices.length && !voice) statusText = t().voiceMissing;
    // Short chunks avoid long-utterance cutoffs; advance only when the current one ends.
    const chunks = text.match(/.{1,220}(?:\s|$)|\S{1,220}/gu) || [text];
    const token = generation;
    playing = true; update();
    function next() {
      if (token !== generation) return;
      const chunk = chunks.shift();
      if (!chunk) { playing = paused = false; activeRoot = null; update(); return; }
      const utterance = new SpeechSynthesisUtterance(chunk); utterance.lang = lang; if (voice) utterance.voice = voice;
      utterance.onend = next;
      utterance.onerror = () => { if (token !== generation) return; stop(); statusText = t().audioUnavailable; update(); };
      synth.speak(utterance);
    }
    next();
  }
  function controls(getText, label, root) {
    const box = document.createElement('div'); box.className = 'ec-voice-controls'; box.dataset.voiceControls = '';
    box.append(button(label || t().read, () => speak(getText(), root), 'audio'));
    const pause = button(t().pause, () => { if (paused) speechSynthesis.resume(); else speechSynthesis.pause(); paused = !paused; update(); }); pause.dataset.voicePause = ''; pause.hidden = !playing;
    const cancel = button(t().stop, stop); cancel.dataset.voiceStop = ''; cancel.hidden = !playing;
    const status = document.createElement('span'); status.className = 'ec-voice-status'; status.setAttribute('role', 'status');
    box.append(pause, cancel, status); return box;
  }
  function listen({ onText, onStatus, onEnd }) {
    stop(); stopListening();
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { onStatus(t().unavailable); onEnd?.(); return; }
    const session = new Recognition(); recognition = session; session.lang = locale(); session.interimResults = true; session.continuous = false;
    let failed = false;
    session.onresult = e => { if (recognition !== session) return; let transcript = ''; for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript + ' '; onText(transcript.trim()); };
    session.onerror = e => { if (recognition !== session) return; failed = true; onStatus(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? t().denied : e.error === 'no-speech' ? t().noSpeech : t().failed); };
    session.onend = () => { if (recognition === session) { recognition = null; if (!failed) onStatus(t().ready); } onEnd?.(); };
    try { session.start(); onStatus(t().listening); } catch { recognition = null; onStatus(t().failed); onEnd?.(); }
  }
  function mount() {
    const main = document.querySelector('main');
    if (main && !main.querySelector(':scope > [data-voice-controls]')) main.prepend(controls(() => cleanText(main), t().page, main));
    document.querySelectorAll('main section, main article, #overlay [role="dialog"]').forEach(section => {
      if (section.matches('.page,.paper-intake,.menu') || !section.querySelector('h1,h2,h3,h4') || section.querySelector(':scope > [data-voice-controls]')) return;
      section.append(controls(() => cleanText(section), t().section, section));
    });
    if (activeRoot && (!activeRoot.isConnected || activeRoot.hidden)) stop();
  }
  let scheduled = false;
  new MutationObserver(() => { if (scheduled) return; scheduled = true; requestAnimationFrame(() => { scheduled = false; mount(); }); }).observe(document.body, { childList: true, subtree: true });
  const cancelAll = () => { stop(); stopListening(); };
  window.addEventListener('hashchange', cancelAll); window.addEventListener('ecourts:route', cancelAll); window.addEventListener('pagehide', cancelAll);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAll(); });
  window.ECOURTS_VOICE = { speak, stop, stopListening, listen, controls, cleanText, icon, t, cancelAll };
  mount();
})();
