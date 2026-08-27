const KEY = "ecourts-citizen-v3";
const i18n = window.ECOURTS_I18N;
const languages = i18n.languages;
const text = i18n.packs;
const sample = {
  cnr: "DEMO010002026",
  caseNo: "DEMO-CIV-114-2026",
  party: "Demo Petitioner A",
  title: "Demo Petitioner A v. Demo Respondent B",
  court: "Sample Civil Court",
  next: "14 September 2026",
  status: "Documents and objections",
  lawyers: { petitioner: "Demo Advocate A", respondent: "Demo Advocate B" },
  official:
    "An interim order has been recorded. The court has asked both sides to bring relevant property papers before the next hearing.",
  meaning:
    "The court has not made a final decision. The next date is for papers and objections.",
  uncertain:
    "Confirm attendance, filing format and the authoritative order with the court record or a lawyer.",
  timeline: [
    [
      "Interim order recorded",
      "A document-related next step is now shown.",
    ],
    [
      "Next hearing listed",
      "Prepare property papers and objections before the hearing.",
    ],
    [
      "Compliance review",
      "The court may review whether directions were completed.",
    ],
  ],
  docs: [
    ["Interim order", "Latest order"],
    ["Property paper checklist", "Preparation guide"],
    ["Case status note", "Status summary"],
  ],
};
const caseDocuments = [
  {
    id: "interim",
    englishTitle: "Interim order",
    file: "interim-order-synthetic.pdf",
    englishBody: [
      "SAMPLE INTERIM ORDER",
      "Example document for this case.",
      "",
      "Demo Petitioner A v. Demo Respondent B",
      "Sample Civil Court",
      "CNR: DEMO010002026",
      "",
      "INTERIM DIRECTION ON PROPERTY PAPERS",
      "The court records an interim direction that both parties shall produce the listed property papers before the next hearing on 14 September 2026.",
      "This direction does not decide ownership or finally dispose of the suit.",
    ],
  },
  {
    id: "checklist",
    englishTitle: "Property paper checklist",
    file: "property-paper-checklist-synthetic.pdf",
    englishBody: [
      "SAMPLE PROPERTY PAPER CHECKLIST",
      "Example preparation list for this case.",
      "",
      "Demo Petitioner A v. Demo Respondent B",
      "Sample Civil Court",
      "CNR: DEMO010002026",
      "",
      "PROPERTY PAPERS TO BRING",
      "1. Sale deed or title papers for the disputed property.",
      "2. Tax receipts or municipal records if available.",
      "3. Any earlier notice or order already served.",
      "This checklist is a preparation aid only.",
    ],
  },
  {
    id: "status",
    englishTitle: "Case status note",
    file: "case-status-note-synthetic.pdf",
    englishBody: [
      "SAMPLE CASE STATUS NOTE",
      "Example status summary for this case.",
      "",
      "Demo Petitioner A v. Demo Respondent B",
      "Sample Civil Court",
      "CNR: DEMO010002026",
      "",
      "CURRENT SYNTHETIC CASE STATUS",
      "Stage: Documents and objections.",
      "Next listed date: 14 September 2026.",
      "Confirm attendance and filing format with the official court record.",
    ],
  },
];
const officialDistrict = [
  {
    titleKey: "courts.district.services.title",
    purposeKey: "courts.district.services.purpose",
    url: "https://services.ecourts.gov.in/",
  },
  {
    titleKey: "courts.district.njdg.title",
    purposeKey: "courts.district.njdg.purpose",
    url: "https://njdg.ecourts.gov.in/njdg_v3/",
  },
  {
    titleKey: "courts.district.directory.title",
    purposeKey: "courts.district.directory.purpose",
    url: "https://ecourts.gov.in/ecourts2.0/?p=dist_court",
  },
];
const officialHigh = [
  {
    titleKey: "courts.high.services.title",
    purposeKey: "courts.high.services.purpose",
    url: "https://hcservices.ecourts.gov.in/",
  },
  {
    titleKey: "courts.high.njdg.title",
    purposeKey: "courts.high.njdg.purpose",
    url: "https://njdg.ecourts.gov.in/hcnjdg_v2/",
  },
  {
    titleKey: "courts.high.directory.title",
    purposeKey: "courts.high.directory.purpose",
    url: "https://ecourts.gov.in/ecourts2.0/?p=about_us/highcourts",
  },
];
const officialShared = [
  {
    titleKey: "courts.shared.gateway.title",
    purposeKey: "courts.shared.gateway.purpose",
    url: "https://ecourts.gov.in/",
  },
  {
    titleKey: "courts.shared.njdg.title",
    purposeKey: "courts.shared.njdg.purpose",
    url: "https://njdg.ecourts.gov.in/",
  },
  {
    titleKey: "courts.shared.ecommittee.title",
    purposeKey: "courts.shared.ecommittee.purpose",
    url: "https://ecommitteesci.gov.in/",
  },
  {
    titleKey: "courts.shared.supreme.title",
    purposeKey: "courts.shared.supreme.purpose",
    url: "https://www.sci.gov.in/",
  },
  {
    titleKey: "courts.shared.legalAid.title",
    purposeKey: "courts.shared.legalAid.purpose",
    url: "https://doj.gov.in/national-legal-services-authority/",
  },
  {
    titleKey: "courts.shared.teleLaw.title",
    purposeKey: "courts.shared.teleLaw.purpose",
    url: "https://doj.gov.in/tele-law-mobile-app/",
  },
];
const defaultPrefs = {
  lang: "en",
  contrast: false,
  large: false,
  reduce: false,
};
let state = {
  page: "home",
  tab: "cnr",
  finderResult: null,
  assisted: false,
  courtsTab: "district",
  selected: null,
  modal: null,
  menu: false,
  profile: null,
  prefs: { ...defaultPrefs },
};
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
  const savedPrefs =
    saved && typeof saved === "object" && !Array.isArray(saved)
      ? saved.prefs
      : null;
  if (savedPrefs && typeof savedPrefs === "object" && !Array.isArray(savedPrefs)) {
    state.prefs = {
      lang: Object.hasOwn(languages, savedPrefs.lang) ? savedPrefs.lang : "en",
      contrast: savedPrefs.contrast === true,
      large: savedPrefs.large === true,
      reduce: savedPrefs.reduce === true,
    };
  }
  state.selected = saved?.selected === sample.cnr ? sample.cnr : null;
  localStorage.setItem(
    KEY,
    JSON.stringify({ prefs: state.prefs, selected: state.selected }),
  );
} catch (error) {
  localStorage.removeItem(KEY);
}
const $ = (s) => document.querySelector(s);
const getPath = i18n.getPath;
function tr(path, values = {}) {
  return i18n.resolve(state.prefs.lang, path, values);
}
const iconPaths = {
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  "file-text":
    '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  "circle-help":
    '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  briefcase:
    '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  menu: '<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>',
  languages:
    '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
  accessibility:
    '<circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/>',
  calendar:
    '<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/>',
  scale:
    '<path d="M12 3v18"/><path d="m19 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/><path d="m5 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M7 21h10"/>',
  landmark:
    '<path d="M10 18v-7"/><path d="M11.12 2.12a2 2 0 0 1 1.76 0L21 7H3z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>',
};
function icon(name) {
  return `<svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name]}</svg>`;
}
const legacyPaths = {
  home: "shared.nav.home",
  find: "shared.nav.finder",
  help: "shared.nav.help",
  hero: "home.hero",
  intro: "home.intro",
  begin: "home.actions.find",
  paper: "home.tasks.2.label",
  hearing: "home.tasks.3.label",
  legal: "home.tasks.4.label",
  save: "shared.actions.save",
  workspace: "shared.nav.workspace",
  caseView: "case.identity.kicker",
  official: "case.record.official",
  meaning: "case.record.meaning",
  uncertain: "case.record.verify",
  document: "shared.nav.documents",
  next: "case.agenda.next",
  status: "case.agenda.status",
  reset: "shared.actions.reset",
};
const t = (key) => tr(legacyPaths[key] || key),
  term = (id) => {
    let d =
      (text[state.prefs.lang] || text.en).glossary[id] || text.en.glossary[id];
    return `<button type="button" class="term" data-term="${id}" data-explanation="${d.meaning}" aria-label="${d.accessibleLabel}">${d.label}</button>`;
  };
function persist() {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      prefs: state.prefs,
      selected: state.selected,
    }),
  );
}
function toast(m) {
  let e = $("#toast");
  e.textContent = m;
  e.hidden = false;
  clearTimeout(window.to);
  window.to = setTimeout(() => (e.hidden = true), 2600);
}
function prefs() {
  let code = languages[state.prefs.lang] ? state.prefs.lang : "en";
  document.documentElement.lang = code;
  document.documentElement.dir = "ltr";
  document.body.classList.toggle("high", state.prefs.contrast);
  document.body.classList.toggle("large", state.prefs.large);
  document.body.classList.toggle("reduce", state.prefs.reduce);
}
function task(id, iconName, label, desc) {
  return `<button class="task" data-go="${id}"><i class="task-icon">${icon(iconName)}</i><span><b>${label}</b><span>${desc}</span></span></button>`;
}

function finderResult() {
  if (state.finderResult === "match") {
    let rows = [
      [tr("finder.result.caseType"), tr("finder.result.caseTypeValue")],
      [tr("finder.result.status"), tr("finder.result.statusSample")],
      [tr("finder.result.petitionerLawyer"), sample.lawyers.petitioner],
      [tr("finder.result.respondentLawyer"), sample.lawyers.respondent],
    ];
    return `<article class="finder-result" aria-labelledby="finder-result-title"><h2 id="finder-result-title">${sample.title}</h2><p class="result-context">${sample.court}<br><span class="record-value">CNR ${sample.cnr}</span></p><dl>${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl><button type="button" class="btn primary" data-action="open-sample">${tr("finder.actions.open")}</button><p class="sample-disclosure">${tr("finder.disclosure")}</p></article>`;
  }
  if (state.finderResult === "empty" || state.finderResult === "none") {
    let empty = state.finderResult === "empty";
    return `<div class="finder-empty" role="status"><h2>${tr(`finder.errors.${empty ? "emptyHeading" : "noneHeading"}`)}</h2><p>${tr(`finder.errors.${empty ? "emptyBody" : "noneBody"}`)}</p><button type="button" class="btn" data-action="sample-preview">${tr("finder.actions.sample")}</button></div>`;
  }
  return "";
}
function finder() {
  let field = tr(`finder.fields.${state.tab}`),
    placeholder =
      state.tab === "cnr"
        ? sample.cnr
        : state.tab === "number"
          ? sample.caseNo
          : sample.party;
  const assisted = state.assisted
    ? `<aside class="assisted-notice"><div>${icon("users")}<p><b>${tr("finder.assisted.heading")}</b><span>${tr("finder.assisted.body")}</span></p></div><button type="button" class="btn" data-action="exit-assisted">${tr("finder.assisted.exit")}</button></aside>`
    : "";
  const tabs = ["cnr", "number", "party", "paper"];
  return `<section class="page finder-page"><div class="head"><p class="kicker">${tr("finder.kicker")}</p><h1>${tr("finder.heading")}</h1><p>${tr("finder.intro")}</p></div>${assisted}<div class="finder"><div class="tabs" role="tablist" aria-label="${tr("finder.tabsLabel")}">${tabs.map((id) => `<button id="finder-tab-${id}" type="button" role="tab" aria-selected="${state.tab === id}" aria-controls="finder-panel" tabindex="${state.tab === id ? "0" : "-1"}" class="${state.tab === id ? "active" : ""}" data-tab="${id}">${tr(`finder.tabs.${id}`)}</button>`).join("")}</div><div id="finder-panel" class="panel" role="tabpanel" aria-labelledby="finder-tab-${state.tab}" tabindex="0">${finderPanelContent(field, placeholder)}</div></div></section>`;
}

function finderPanelContent(field, placeholder) {
  return `<h2>${state.tab === "cnr" ? term("cnr") : field}</h2><p id="finder-instruction">${tr(`finder.instructions.${state.tab}`)}</p>${state.tab === "paper" ? `<div class="paper sample-paper"><b>${tr("finder.paper.title")}</b><span>${tr("finder.paper.preview")}</span><span>${tr("finder.paper.uploadNote")}</span><span>${tr("finder.paper.caseLabel")}: ${sample.title}</span><span>${tr("finder.paper.nextDate")}: ${tr("finder.result.sampleDate", { date: sample.next })}</span></div><button type="button" class="btn primary" data-action="paper-match">${tr("finder.actions.paper")}</button>` : `<form id="search" novalidate><div class="field"><label for="query">${field}</label><input id="query" name="query" class="record-value" autocomplete="off" aria-describedby="finder-instruction" placeholder="${placeholder}"></div><div class="actions"><button type="submit" class="btn primary">${tr("finder.actions.search")}</button><button type="button" class="btn secondary" data-action="sample-preview">${tr("finder.actions.sample")}</button></div></form>`}<div id="result">${finderResult()}</div><div class="finder-help"><h2>${tr("finder.help.heading")}</h2><p>${tr("finder.help.body")}</p><button type="button" class="btn" data-go="help">${tr("finder.actions.help")}</button></div>`;
}

function activateFinderTab(id, { focus = false } = {}) {
  if (!["cnr", "number", "party", "paper"].includes(id)) return;
  state.tab = id;
  state.finderResult = null;
  document.querySelectorAll('.tabs [role="tab"]').forEach((tab) => {
    const active = tab.dataset.tab === id;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    tab.classList.toggle("active", active);
  });
  const panel = document.getElementById("finder-panel");
  if (panel) {
    const field = tr(`finder.fields.${id}`);
    const placeholder =
      id === "cnr" ? sample.cnr : id === "number" ? sample.caseNo : sample.party;
    panel.setAttribute("aria-labelledby", `finder-tab-${id}`);
    panel.innerHTML = finderPanelContent(field, placeholder);
  }
  if (focus) document.getElementById(`finder-tab-${id}`)?.focus();
}

function activateCourtsTab(id, { focus = false } = {}) {
  if (!["district", "high"].includes(id)) return;
  state.courtsTab = id;
  render();
  if (focus) document.getElementById(`courts-tab-${id}`)?.focus();
}

function officialLink(url, label) {
  return `<a class="official-link" href="${url}" target="_blank" rel="noopener noreferrer">${label}<span class="external-mark" aria-hidden="true">&#8599;</span><span class="sr-only"> ${tr("shared.externalLink.newTab")}</span></a>`;
}

function serviceRow(item, index) {
  const n = String(index + 1).padStart(2, "0");
  return `<article class="service-row"><span class="service-index" aria-hidden="true">${n}</span><div class="service-copy"><h3>${officialLink(item.url, tr(item.titleKey))}</h3><p>${tr(item.purposeKey)}</p><p class="official-destination">${tr("courts.external")}</p></div></article>`;
}

function courtsPage() {
  const tab = state.courtsTab === "high" ? "high" : "district";
  const items = tab === "high" ? officialHigh : officialDistrict;
  return `<section class="page courts-page"><div class="courts-stage"><header class="courts-guide"><span class="courts-mark" aria-hidden="true"></span><p class="kicker">${tr("courts.kicker")}</p><h1>${tr("courts.heading")}</h1><p class="courts-intro">${tr("courts.intro")}</p><div class="courts-tabs" role="tablist" data-tabs="courts" aria-label="${tr("courts.tabsLabel")}">${["district", "high"].map((id) => `<button id="courts-tab-${id}" type="button" role="tab" aria-selected="${tab === id}" aria-controls="courts-panel" tabindex="${tab === id ? "0" : "-1"}" class="${tab === id ? "active" : ""}" data-tab="${id}">${tr(`courts.tabs.${id}`)}</button>`).join("")}</div><aside class="courts-chooser">${tr(`courts.${tab}.chooser`)}</aside></header><div id="courts-panel" class="courts-panel" role="tabpanel" aria-labelledby="courts-tab-${tab}" tabindex="0"><div class="service-rows courts-subjects">${items.map(serviceRow).join("")}</div></div></div><section class="courts-shared" aria-labelledby="courts-shared-title"><div class="courts-shared-head"><span class="courts-mark" aria-hidden="true"></span><h2 id="courts-shared-title">${tr("courts.shared.heading")}</h2></div><div class="service-rows courts-support">${officialShared.map(serviceRow).join("")}</div></section></section>`;
}

function casePage() {
  if (!state.selected) return home();
  const pack = (text[state.prefs.lang] || text.en).case;
  return `<section class="page case"><div class="case-top"><div><p class="kicker">${pack.identity.kicker}</p><h1>${sample.title}</h1><p>${sample.court} · ${term("cnr")} <span class="record-value">${sample.cnr}</span></p><p class="record-note">${pack.identity.recordValues}</p></div><button class="btn primary" data-action="save">${state.profile ? t("workspace") : t("save")}</button></div><div class="case-grid"><div class="case-reading"><section class="block agenda-block"><h2>${pack.agenda.heading}</h2><div class="status"><div><strong>${pack.agenda.today}</strong><span>${pack.agenda.none}</span></div><div><strong>${sample.next}</strong><span>${pack.agenda.next}</span></div><div><strong>${tr("finder.result.statusSample")}</strong><span>${pack.agenda.status}</span></div></div></section><section class="block record-block"><h2>${pack.record.heading}</h2><div class="record-layers"><article class="record-official"><b>${pack.record.official}</b><p>${pack.record.officialText}</p></article><article class="record-meaning"><b>${pack.record.meaning}</b><p>${pack.record.meaningText}</p></article><article class="record-verify"><b>${pack.record.verify}</b><p>${pack.record.verifyText}</p></article></div></section></div><aside class="case-rail"><section class="block documents-block"><h2>${pack.documents.heading}</h2>${pack.documents.items.map((item, i) => `<div class="doc"><span><b>${item.title}</b><span>${item.detail}</span></span><button type="button" class="btn" data-doc="${i}">${pack.documents.view}</button></div>`).join("")}</section><section class="block history-block"><h2>${pack.history.heading}</h2><div class="timeline">${pack.history.items.map((item) => `<div><i class="dot"></i><span><b>${item.title}</b><span>${item.detail}</span></span></div>`).join("")}</div></section><button type="button" class="btn primary case-help" data-go="help" aria-label="${pack.support.accessible}">${pack.support.action}</button></aside></div></section>`;
}

let overlayReturnFocus = null;
const backgroundRoots = ["#masthead", "#app", "#footer"];
const focusableSelector =
  'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
function isVisible(element) {
  return Boolean(
    element &&
      element.isConnected &&
      !element.hidden &&
      element.getClientRects().length,
  );
}
function returnSelector(element) {
  for (const name of ["data-action", "data-go", "data-doc", "data-term"]) {
    let value = element?.getAttribute(name);
    if (value) return `[${name}="${value}"]`;
  }
  return element?.id ? `#${element.id}` : null;
}
function rememberOverlayTrigger(trigger) {
  if (overlayReturnFocus || !trigger) return;
  overlayReturnFocus = { element: trigger, selector: returnSelector(trigger) };
}
function setBackgroundInert(active) {
  for (const selector of backgroundRoots) {
    let element = $(selector);
    if (element) element.toggleAttribute("inert", active);
  }
}
function overlayPanel() {
  return $('#overlay [role="dialog"]');
}
function overlayFocusables() {
  let panel = overlayPanel();
  return panel
    ? [...panel.querySelectorAll(focusableSelector)].filter(isVisible)
    : [];
}
function focusOverlay() {
  requestAnimationFrame(() => {
    let panel = overlayPanel();
    if (!panel) return;
    let target =
      panel.querySelector("[autofocus]") || overlayFocusables()[0] || panel;
    if (isVisible(target)) target.focus();
  });
}
function restoreOverlayFocus(saved) {
  requestAnimationFrame(() => {
    let target = isVisible(saved?.element)
      ? saved.element
      : saved?.selector
        ? document.querySelector(saved.selector)
        : null;
    if (isVisible(target)) target.focus();
  });
}
function showMenu(trigger) {
  rememberOverlayTrigger(trigger);
  state.modal = null;
  state.menu = true;
  overlay();
}
function showModal(modal, trigger) {
  rememberOverlayTrigger(trigger);
  state.menu = false;
  state.modal = modal;
  overlay();
}
function closeOverlay() {
  if (!state.modal && !state.menu) return;
  let saved = overlayReturnFocus;
  overlayReturnFocus = null;
  state.modal = null;
  state.menu = false;
  overlay();
  restoreOverlayFocus(saved);
}
function modalMarkup(content) {
  return `<div class="overlay" data-action="close"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1"><button class="btn icon close" data-action="close" aria-label="${tr("shared.actions.close")}" title="${tr("shared.actions.close")}">×</button>${content}</section></div>`;
}
function overlay() {
  let o = $("#overlay");
  if (!state.modal && !state.menu) {
    o.innerHTML = "";
    setBackgroundInert(false);
    return;
  }
  if (state.menu) {
    o.innerHTML = `<div class="overlay" data-action="close-menu"><nav class="menu" role="dialog" aria-modal="true" aria-labelledby="menu-title" tabindex="-1"><h2 class="sr-only" id="menu-title">${tr("shared.mobileMenu.heading")}</h2><button data-go="home">${icon("home")}${tr("shared.nav.home")}</button><button data-go="finder">${icon("search")}${tr("shared.nav.finder")}</button><button data-go="courts">${icon("landmark")}${tr("shared.nav.courts")}</button><button data-go="documents">${icon("file-text")}${tr("shared.nav.documents")}</button><button data-go="help">${icon("circle-help")}${tr("shared.nav.help")}</button>${state.selected && state.profile ? `<button data-go="case">${icon("briefcase")}${tr("shared.nav.workspace")}</button>` : ""}<button data-action="language">${icon("languages")}${languages[state.prefs.lang]}</button><button data-action="access">${icon("accessibility")}${tr("shared.accessibility.heading")}</button><button data-action="reset">${tr("shared.actions.reset")}</button></nav></div>`;
  } else if (state.modal === "language") {
    o.innerHTML = modalMarkup(
      `<p class="kicker">${tr("shared.languageDialog.kicker")}</p><h2 id="dialog-title">${tr("shared.languageDialog.heading")}</h2><p>${tr("shared.languageDialog.note")}</p><div class="language-list">${Object.entries(
        languages,
      )
        .map(
          ([id, label]) =>
            `<button class="${state.prefs.lang === id ? "active" : ""}" data-language="${id}" lang="${id}">${label}</button>`,
        )
        .join("")}</div>`,
    );
  } else if (state.modal === "term") {
    let d =
      (text[state.prefs.lang] || text.en).glossary[state.term] ||
      text.en.glossary[state.term];
    o.innerHTML = modalMarkup(
      `<p class="kicker">${tr("shared.glossary.kicker")}</p><h2 id="dialog-title">${d.label}</h2><p>${d.meaning}</p><div class="band"><h2>${tr("shared.glossary.why")}</h2><p>${d.why}</p></div>`,
    );
  } else if (state.modal === "access") {
    o.innerHTML = modalMarkup(
      `<h2 id="dialog-title">${tr("shared.accessibility.heading")}</h2><p>${tr("shared.accessibility.deviceNote")}</p><div class="settings"><label class="field"><span>${tr("shared.accessibility.contrast")}</span><select data-pref="contrast"><option value="false">${tr("shared.accessibility.standard")}</option><option value="true" ${state.prefs.contrast ? "selected" : ""}>${tr("shared.accessibility.highContrast")}</option></select></label><label class="field"><span>${tr("shared.accessibility.textSize")}</span><select data-pref="large"><option value="false">${tr("shared.accessibility.standard")}</option><option value="true" ${state.prefs.large ? "selected" : ""}>${tr("shared.accessibility.largerText")}</option></select></label><label class="field"><span>${tr("shared.accessibility.motion")}</span><select data-pref="reduce"><option value="false">${tr("shared.accessibility.standard")}</option><option value="true" ${state.prefs.reduce ? "selected" : ""}>${tr("shared.accessibility.reduceMotion")}</option></select></label></div>`,
    );
  } else if (state.modal === "doc") {
    let english = caseDocuments[state.doc] || caseDocuments[0];
    let d =
      (text[state.prefs.lang] || text.en).case.documents.items[state.doc] ||
      text.en.case.documents.items[0];
    o.innerHTML = modalMarkup(
      `<p class="kicker">${tr("shared.documentModal.kicker")}</p><h2 id="dialog-title">${d.title}</h2><div class="paper" lang="en">${english.englishBody.map(escapeHelpHtml).join("<br>")}</div><p class="prototype-boundary">${tr("shared.documentModal.boundary")}</p><h3>${tr("shared.documentModal.plainLanguage")}</h3><p>${d.meaning}</p><button class="btn primary" data-action="download">${tr("shared.documentModal.download")}</button>`,
    );
  } else {
    let s = state.modal,
      c =
        s === 1
          ? `<h2 id="dialog-title">${tr("shared.signup.heading")}</h2><p>${tr("shared.signup.note")}</p><label class="field"><span>${tr("shared.signup.name")}</span><input id="name" placeholder="${tr("shared.signup.namePlaceholder")}"></label><label class="field"><span>${tr("shared.signup.mobile")}</span><input id="mobile" class="record-value" inputmode="numeric" placeholder="${tr("shared.signup.mobilePlaceholder")}"></label><button class="btn primary" data-action="next">${tr("shared.actions.continue")}</button>`
          : s === 2
            ? `<h2 id="dialog-title">${tr("shared.otp.heading")}</h2><p>${tr("shared.otp.note", { otp: "318204" })}</p><label class="field"><span>${tr("shared.otp.label")}</span><input id="otp" class="record-value" inputmode="numeric" maxlength="6" placeholder="318204"></label><button class="btn primary" data-action="verify">${tr("shared.otp.verify")}</button>`
            : `<h2 id="dialog-title">${tr("shared.workspace.heading")}</h2><p>${tr("shared.workspace.note")}</p><div class="settings"><label class="field"><span>${tr("shared.workspace.language")}</span><select id="lang">${Object.entries(
                languages,
              )
                .map(
                  ([id, label]) =>
                    `<option value="${id}" ${state.prefs.lang === id ? "selected" : ""}>${label}</option>`,
                )
                .join(
                  "",
                )}</select></label><label class="field"><span>${tr("shared.workspace.textSize")}</span><select id="large"><option value="false">${tr("shared.accessibility.standard")}</option><option value="true">${tr("shared.accessibility.largerText")}</option></select></label></div><button class="btn primary" data-action="finish">${tr("shared.workspace.save")}</button>`;
    o.innerHTML = modalMarkup(
      `<div class="steps" aria-hidden="true"><i class="${s >= 1 ? "on" : ""}"></i><i class="${s >= 2 ? "on" : ""}"></i><i class="${s >= 3 ? "on" : ""}"></i></div>${c}`,
    );
  }
  setBackgroundInert(true);
  focusOverlay();
}

function draftField(name, label, type, placeholder, required = true) {
  return { name, label, type, placeholder, required };
}
const documentTemplates = {
  legalAid: {
    id: "legalAid",
    title: "Legal aid application",
    group: "Public service",
    summary: "Prepare the details requested by a Legal Services Authority.",
    file: "legal-aid-application-draft.pdf",
    fields: [
      draftField("name", "Applicant name", "text", "Full name"),
      draftField(
        "address",
        "Residential address",
        "textarea",
        "Current postal address",
      ),
      draftField("contact", "Mobile or email", "text", "Contact detail"),
      draftField(
        "case",
        "Case or legal issue",
        "textarea",
        "Briefly describe the matter",
      ),
      draftField(
        "reason",
        "Why legal aid is needed",
        "textarea",
        "What help do you need?",
      ),
      draftField(
        "eligibility",
        "Eligibility information",
        "textarea",
        "Income or eligible category, if known",
        false,
      ),
    ],
  },
  demand: {
    id: "demand",
    title: "Payment demand letter",
    group: "Letter",
    summary: "Request payment and record a reasonable response date.",
    file: "payment-demand-letter-draft.pdf",
    fields: [
      draftField(
        "sender",
        "Sender name and address",
        "textarea",
        "Your name and address",
      ),
      draftField(
        "recipient",
        "Recipient name and address",
        "textarea",
        "Recipient details",
      ),
      draftField("amount", "Amount due", "text", "Example: INR 25,000"),
      draftField(
        "reason",
        "Reason for payment",
        "textarea",
        "Invoice, loan, goods or services",
      ),
      draftField("due", "Requested payment date", "date", ""),
      draftField(
        "method",
        "Preferred payment method",
        "text",
        "Bank transfer, cheque or another method",
        false,
      ),
    ],
  },
  settlement: {
    id: "settlement",
    title: "Settlement proposal",
    group: "Letter",
    summary: "Record a without-prejudice proposal for discussion.",
    file: "settlement-proposal-draft.pdf",
    fields: [
      draftField("from", "Your name", "text", "Name"),
      draftField("to", "Other party", "text", "Name"),
      draftField(
        "dispute",
        "Dispute summary",
        "textarea",
        "What is the disagreement?",
      ),
      draftField(
        "offer",
        "Proposed terms",
        "textarea",
        "What would resolve the matter?",
      ),
      draftField("deadline", "Response date", "date", ""),
      draftField(
        "contact",
        "Reply contact",
        "text",
        "Email, mobile or postal address",
      ),
    ],
  },
  chronology: {
    id: "chronology",
    title: "Case chronology",
    group: "Preparation",
    summary:
      "Turn dated events into a clear sequence for a legal consultation.",
    file: "case-chronology-draft.pdf",
    fields: [
      draftField("matter", "Matter title", "text", "Short title"),
      draftField(
        "parties",
        "People or organisations involved",
        "textarea",
        "List the parties",
      ),
      draftField(
        "events",
        "Dated events",
        "textarea",
        "One event per line: DD/MM/YYYY - what happened",
      ),
      draftField(
        "next",
        "Known next date or deadline",
        "text",
        "If known",
        false,
      ),
    ],
  },
  evidence: {
    id: "evidence",
    title: "Evidence index",
    group: "Preparation",
    summary:
      "Make an organised list of documents without changing the originals.",
    file: "evidence-index-draft.pdf",
    fields: [
      draftField("matter", "Matter title", "text", "Short title"),
      draftField("owner", "Prepared by", "text", "Name"),
      draftField(
        "items",
        "Documents or evidence",
        "textarea",
        "One per line: date - document - source",
      ),
      draftField(
        "notes",
        "Missing items or verification notes",
        "textarea",
        "Optional notes",
        false,
      ),
    ],
  },
  service: {
    id: "service",
    title: "Service agreement",
    group: "Agreement",
    summary: "A basic services draft requiring review before signing.",
    file: "service-agreement-draft.pdf",
    fields: [
      draftField("provider", "Service provider", "text", "Full legal name"),
      draftField("client", "Client", "text", "Full legal name"),
      draftField(
        "services",
        "Services",
        "textarea",
        "Describe the work and deliverables",
      ),
      draftField(
        "fee",
        "Fee and payment schedule",
        "textarea",
        "Amount, due dates and taxes",
      ),
      draftField(
        "term",
        "Start, end and timeline",
        "textarea",
        "Dates and milestones",
      ),
      draftField(
        "termination",
        "Ending the agreement",
        "textarea",
        "Notice and unfinished work",
      ),
    ],
  },
  nda: {
    id: "nda",
    title: "Confidentiality agreement",
    group: "Agreement",
    summary: "A narrow NDA draft for a defined purpose.",
    file: "confidentiality-agreement-draft.pdf",
    fields: [
      draftField("discloser", "Disclosing party", "text", "Full legal name"),
      draftField("recipient", "Receiving party", "text", "Full legal name"),
      draftField(
        "purpose",
        "Permitted purpose",
        "textarea",
        "Why information is being shared",
      ),
      draftField(
        "information",
        "Confidential information",
        "textarea",
        "Describe the covered information",
      ),
      draftField(
        "duration",
        "Confidentiality period",
        "text",
        "Example: 2 years",
      ),
      draftField(
        "exclusions",
        "Exclusions",
        "textarea",
        "Public, previously known or independently developed information",
        false,
      ),
    ],
  },
  loan: {
    id: "loan",
    title: "Loan acknowledgement",
    group: "Agreement",
    summary: "Record a simple loan and repayment understanding.",
    file: "loan-acknowledgement-draft.pdf",
    fields: [
      draftField("lender", "Lender", "text", "Full legal name"),
      draftField("borrower", "Borrower", "text", "Full legal name"),
      draftField("amount", "Principal amount", "text", "Example: INR 50,000"),
      draftField("advanced", "Date advanced", "date", ""),
      draftField(
        "repayment",
        "Repayment schedule",
        "textarea",
        "Instalments and due dates",
      ),
      draftField(
        "interest",
        "Interest, if any",
        "text",
        "State none if interest-free",
      ),
      draftField(
        "default",
        "What happens after missed payment",
        "textarea",
        "Notice and opportunity to cure",
        false,
      ),
    ],
  },
};
state.docTemplate = state.docTemplate || "legalAid";
state.helpQuery = "";
state.helpLast = null;
state.helpSuggestions = ["portal-cnr", "portal-status", "court-notice"];
const helpSources = {
  portal: {
    label: "Official eCourts app guide",
    url: "https://services.ecourts.gov.in/App/apphelp.html",
  },
  portalFaq: {
    label: "Official eCourts app FAQ",
    url: "https://services.ecourts.gov.in/App/appfaq.html",
  },
  constitution: {
    label: "Supreme Court: Constitution and courts",
    url: "https://www.sci.gov.in/constitution/",
  },
  jurisdiction: {
    label: "Supreme Court: Jurisdiction",
    url: "https://www.sci.gov.in/jurisdiction/",
  },
  legalAid: {
    label: "Department of Justice: Free legal services",
    url: "https://doj.gov.in/national-legal-services-authority/",
  },
  constitutionText: {
    label: "Legislative Department: Constitution of India",
    url: "https://legislative.gov.in/constitution-of-india/",
  },
};
const helpFaqs = [
  {
    id: "portal-cnr",
    group: "portal",
    question: "What is a CNR and where can I find it?",
    answer:
      "A CNR is the 16-character alphanumeric Case Number Record assigned to a case. Enter it without spaces or hyphens. It is commonly shown on case records and court papers.",
    tags: ["cnr", "case number record", "find case", "search", "court paper"],
    related: ["portal-no-cnr", "portal-status", "portal-orders"],
    source: helpSources.portal,
  },
  {
    id: "portal-no-cnr",
    group: "portal",
    question: "Can I find a case without a CNR?",
    answer:
      "Yes. Official eCourts services also support searches using details such as case number, filing number, party name, advocate details, FIR number, case type or Act. The exact fields depend on the selected court service.",
    tags: [
      "without cnr",
      "case number",
      "party name",
      "filing number",
      "fir",
      "advocate",
      "search",
    ],
    related: ["portal-cnr", "portal-status", "portal-cause-list"],
    source: helpSources.portalFaq,
  },
  {
    id: "portal-status",
    group: "portal",
    question: "What information appears in case status and history?",
    answer:
      "The available record may include current status, hearing dates, case details, parties and advocates, proceedings, and available orders. Treat the official court record and uploaded order as authoritative if a summary differs.",
    tags: [
      "case status",
      "history",
      "hearing date",
      "parties",
      "proceedings",
      "judge",
    ],
    related: ["portal-orders", "portal-cause-list", "court-hearing"],
    source: helpSources.portalFaq,
  },
  {
    id: "portal-cause-list",
    group: "portal",
    question: "What is a cause list?",
    answer:
      "A cause list is a court schedule showing matters listed before a court for a date. Listings can change, so check the latest official list and any directions in your case before travelling or deciding whether attendance is required.",
    tags: [
      "cause list",
      "daily list",
      "hearing",
      "schedule",
      "court date",
      "attendance",
    ],
    related: ["portal-status", "court-hearing", "court-notice"],
    source: helpSources.portalFaq,
  },
  {
    id: "portal-orders",
    group: "portal",
    question: "How do I view or download an order?",
    answer:
      "Open the case history or orders section in the official service and select the available order or judgment PDF. Availability varies by record. Check that the court, case number and date match before relying on a downloaded file.",
    tags: ["order", "judgment", "pdf", "download", "document", "case history"],
    related: ["portal-status", "court-order", "portal-cnr"],
    source: helpSources.portalFaq,
  },
  {
    id: "portal-saved",
    group: "portal",
    question: "Do I need an account, and can I save a case?",
    answer:
      "The official eCourts Services app says registration is not required. Its My Cases feature can save selected cases on the device for quicker access. Saved cases on this site stay on this device and are separate from official eCourts data.",
    tags: [
      "account",
      "registration",
      "login",
      "saved case",
      "my cases",
      "device",
    ],
    related: ["portal-status", "portal-language", "portal-cnr"],
    source: helpSources.portalFaq,
  },
  {
    id: "portal-language",
    group: "portal",
    question:
      "Does eCourts support regional languages and accessibility settings?",
    answer:
      "The official app provides regional-language and display-personalisation options. Availability can vary by platform and content; case records remain in the language in which they were filed or published.",
    tags: [
      "language",
      "regional language",
      "accessibility",
      "contrast",
      "theme",
      "translation",
    ],
    related: ["portal-saved", "portal-status", "legal-aid"],
    source: helpSources.portalFaq,
  },
  {
    id: "court-structure",
    group: "court",
    question: "How are courts organised in India?",
    answer:
      "The Supreme Court is at the apex, followed by High Courts for States or groups of States. District and subordinate courts work under the administration of their High Court. Names and jurisdiction of lower courts can vary by State and subject.",
    tags: [
      "court hierarchy",
      "supreme court",
      "high court",
      "district court",
      "subordinate court",
      "jurisdiction",
    ],
    related: ["court-case-types", "court-order", "constitution-remedies"],
    source: helpSources.constitution,
  },
  {
    id: "court-case-types",
    group: "court",
    question:
      "What is the practical difference between a civil and criminal case?",
    answer:
      "Civil proceedings generally concern rights, obligations or disputes between people or organisations. Criminal proceedings concern alleged offences prosecuted under criminal law. The case type, court and procedure shown in the official record determine the applicable path.",
    tags: [
      "civil case",
      "criminal case",
      "offence",
      "dispute",
      "case type",
      "procedure",
    ],
    related: ["court-notice", "court-hearing", "court-order"],
    source: helpSources.constitution,
  },
  {
    id: "court-notice",
    group: "court",
    question: "What should I do after receiving a court notice or summons?",
    answer:
      "Read the complete document and verify the court, case number, names, date and directions against the official record. Do not assume every paper requires the same response. If a deadline, appearance or right may be affected, promptly seek the issuing court, legal services authority or a qualified lawyer.",
    tags: [
      "notice",
      "summons",
      "court paper",
      "received",
      "deadline",
      "appearance",
      "respond",
    ],
    related: ["court-hearing", "portal-status", "legal-aid"],
    source: helpSources.portal,
  },
  {
    id: "court-hearing",
    group: "court",
    question: "Does a hearing date always mean I must attend in person?",
    answer:
      "Not necessarily. Attendance can depend on the type of proceeding, the court order, representation and applicable procedure. Check the exact order or notice and confirm with the court or your lawyer instead of relying only on a status screen or cause list.",
    tags: [
      "hearing",
      "attendance",
      "appear",
      "in person",
      "court date",
      "lawyer",
      "cause list",
    ],
    related: ["court-notice", "portal-cause-list", "portal-orders"],
    source: helpSources.portalFaq,
  },
  {
    id: "court-order",
    group: "court",
    question: "What is the difference between an order, judgment and appeal?",
    answer:
      "These labels and their legal effect depend on the proceeding. An order may decide a step or issue; a judgment records the court's decision and reasons in the matter. Do not assume a document is final or calculate an appeal deadline from this FAQ. Use the complete official document and obtain case-specific advice.",
    tags: [
      "order",
      "judgment",
      "appeal",
      "final order",
      "deadline",
      "decision",
      "reasons",
    ],
    related: ["portal-orders", "court-hearing", "legal-aid"],
    source: helpSources.jurisdiction,
  },
  {
    id: "legal-aid",
    group: "court",
    question: "Where can I ask for free legal aid?",
    answer:
      "Eligible people may approach Legal Services Authorities or Committees at the State, District, Taluk, High Court or Supreme Court level, depending on the matter. Free legal services can include legal advice, a lawyer, document support, certified copies and certain case-related fees. Confirm eligibility with the relevant authority.",
    tags: [
      "legal aid",
      "free lawyer",
      "nalsa",
      "dlsa",
      "slsa",
      "tele-law",
      "legal services",
    ],
    related: ["court-notice", "constitution-equality", "constitution-remedies"],
    source: helpSources.legalAid,
  },
  {
    id: "constitution-equality",
    group: "court",
    question: "What do Articles 14 and 21 broadly protect?",
    answer:
      "Article 14 provides equality before the law and equal protection of the laws. Article 21 protects life and personal liberty except according to procedure established by law. These broad guarantees do not by themselves determine the result of a particular case.",
    tags: [
      "constitution",
      "article 14",
      "article 21",
      "equality",
      "life",
      "personal liberty",
      "fundamental rights",
    ],
    related: ["constitution-remedies", "legal-aid", "court-structure"],
    source: helpSources.constitutionText,
  },
  {
    id: "constitution-remedies",
    group: "court",
    question: "What do Articles 22, 32 and 39A broadly address?",
    answer:
      "Article 22 contains protections relating to arrest and detention in specified situations. Article 32 concerns remedies in the Supreme Court for enforcement of Fundamental Rights. Article 39A is a Directive Principle concerning equal justice and free legal aid. The correct remedy depends on facts, forum and law, so obtain qualified advice.",
    tags: [
      "constitution",
      "article 22",
      "article 32",
      "article 39a",
      "arrest",
      "detention",
      "remedy",
      "free legal aid",
    ],
    related: ["constitution-equality", "legal-aid", "court-structure"],
    source: helpSources.constitutionText,
  },
];
const helpServices = [
  {
    key: "legalAid",
    url: "https://doj.gov.in/national-legal-services-authority/",
  },
  {
    key: "teleLaw",
    url: "https://doj.gov.in/tele-law-mobile-app/",
  },
];
function localizedHelpFaqs() {
  const localized = (text[state.prefs.lang] || text.en).help.faqs;
  return helpFaqs.map((item) => ({ ...item, ...localized[item.id] }));
}
function escapeHelpHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}
function normalizeHelp(value) {
  return String(value || "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}
function filteredHelpFaqs(query = state.helpQuery) {
  let tokens = normalizeHelp(query);
  const records = localizedHelpFaqs();
  if (!tokens.length) return records;
  return records.filter((item) => {
    let words = normalizeHelp(
      [item.question, item.answer, ...item.tags].join(" "),
    );
    return tokens.every((token) => words.some((word) => word.includes(token)));
  });
}
function suggestedHelpFaqs(lastId = state.helpLast, query = state.helpQuery) {
  const records = localizedHelpFaqs();
  let current = records.find((item) => item.id === lastId),
    tokens = normalizeHelp(query),
    fallback = [
      "portal-cnr",
      "portal-status",
      "court-notice",
      "court-hearing",
      "legal-aid",
    ];
  return records
    .filter((item) => item.id !== lastId)
    .map((item) => {
      let words = normalizeHelp(
          [item.question, item.answer, ...item.tags].join(" "),
        ),
        relatedScore = current?.related.includes(item.id)
          ? tokens.length
            ? 10
            : 100
          : 0,
        tokenScore = tokens.reduce(
          (score, token) =>
            score + (words.some((word) => word.includes(token)) ? 75 : 0),
          0,
        ),
        groupScore = !tokens.length && current?.group === item.group ? 5 : 0,
        fallbackIndex = fallback.indexOf(item.id),
        fallbackScore = fallbackIndex === -1 ? 0 : 5 - fallbackIndex;
      return {
        item,
        score: relatedScore + tokenScore + groupScore + fallbackScore,
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score || a.item.question.localeCompare(b.item.question),
    )
    .slice(0, 3)
    .map((entry) => entry.item);
}
function helpSuggestionMarkup() {
  return suggestedHelpFaqs()
    .map(
      (item) =>
        `<button type="button" class="suggestion" data-help-suggest="${item.id}">${item.question}</button>`,
    )
    .join("");
}
function helpFaq(item) {
  return `<details class="faq-item" id="faq-${item.id}" data-faq="${item.id}"><summary>${item.question}</summary><div class="faq-answer"><p>${item.answer}</p><a class="source-link" href="${item.source.url}" target="_blank" rel="noopener noreferrer">${item.source.label}<span class="external-mark" aria-hidden="true">&#8599;</span><span class="sr-only"> ${tr("shared.externalLink.newTab")}</span></a></div></details>`;
}
function supportPage() {
  const help = (text[state.prefs.lang] || text.en).help;
  let matches = filteredHelpFaqs(),
    portal = matches.filter((item) => item.group === "portal"),
    court = matches.filter((item) => item.group === "court"),
    count = help.search.count.replace("{count}", String(matches.length));
  return `<section class="page help-page"><div class="head help-intro"><div class="help-boundary"><p class="kicker">${help.kicker}</p><h1>${help.heading}</h1><p>${help.intro}</p></div></div><nav class="help-services" aria-label="${help.services.label}">${helpServices.map((item) => `<a class="service-link" href="${item.url}" target="_blank" rel="noopener noreferrer">${help.services[item.key]}<span class="external-mark" aria-hidden="true">&#8599;</span><span class="sr-only"> ${tr("shared.externalLink.newTab")}</span></a>`).join("")}</nav><div class="help-tools"><div class="help-search"><label for="help-search">${help.search.label}</label><input id="help-search" type="search" autocomplete="off" value="${escapeHelpHtml(state.helpQuery)}" placeholder="${help.search.placeholder}"><p class="help-count" id="help-count" aria-live="polite">${count}</p></div><section class="suggested-next" aria-labelledby="suggested-heading"><div class="suggestion-head"><h2 id="suggested-heading">${help.suggestions.heading}</h2><p class="suggestion-privacy">${help.suggestions.privacy}</p></div><div class="suggestion-row" id="help-suggestions">${helpSuggestionMarkup()}</div><span class="sr-only" id="help-suggestion-live" aria-live="polite"></span></section></div>${matches.length ? `<div class="knowledge-grid"><section class="knowledge-base portal" aria-labelledby="portal-help-title"><p class="knowledge-label">${help.portal.label}</p><h2 id="portal-help-title">${help.portal.heading}</h2><p>${help.portal.intro}</p><div class="faq-list">${portal.map(helpFaq).join("")}</div></section><section class="knowledge-base court" aria-labelledby="court-help-title"><p class="knowledge-label">${help.practical.label}</p><h2 id="court-help-title">${help.practical.heading}</h2><p>${help.practical.intro}</p><div class="faq-list">${court.map(helpFaq).join("")}</div></section></div>` : `<section class="help-empty"><h2>${help.empty.heading}</h2><p>${help.empty.body}</p><button type="button" class="btn" data-action="clear-help-search">${help.empty.clear}</button></section>`}<p class="help-disclaimer"><b>${help.disclaimer}</b></p><p class="help-language-note">${help.translationNotice}</p></section>`;
}
function fieldMarkup(field) {
  let required = i18n.isRequiredField(field),
    req = required ? " required" : "";
  let max = field.type === "textarea" ? 2000 : 180;
  return `<label class="field"><span>${field.label}${required ? " *" : ""}</span>${field.type === "textarea" ? `<textarea name="${field.name}" maxlength="${max}" placeholder="${field.placeholder}"${req}></textarea>` : `<input name="${field.name}" type="${field.type}" maxlength="${max}" placeholder="${field.placeholder}"${req}>`}</label>`;
}
function localizedDocumentTemplates() {
  const localized = (text[state.prefs.lang] || text.en).documents.templates;
  return Object.fromEntries(
    Object.entries(localized).map(([id, definition]) => [
      id,
      { ...documentTemplates[id], ...definition, id },
    ]),
  );
}
function documentStudio() {
  const documents = (text[state.prefs.lang] || text.en).documents;
  const templates = localizedDocumentTemplates();
  let def = templates[state.docTemplate] || templates.legalAid;
  if (!templates[state.docTemplate]) state.docTemplate = "legalAid";
  return `<section class="page documents-page"><div class="head"><p class="kicker">${documents.kicker}</p><h1>${documents.heading}</h1><p>${documents.intro}</p></div><div class="privacy-note"><b>${documents.privacy}</b></div><p class="pdf-boundary">${documents.pdfBoundary.notice}</p><div class="doc-studio"><aside class="template-list" aria-label="${documents.templateListLabel}">${Object.values(
    templates,
  )
    .map(
      (x) =>
        `<button type="button" class="template-choice ${x.id === def.id ? "active" : ""}" data-template="${x.id}"><b>${x.title}</b><span>${x.group}</span></button>`,
    )
    .join(
      "",
    )}</aside><form class="draft-form" id="draftForm"><span class="template-tag">${def.group} · ${documents.editable}</span><h2>${def.title}</h2><p>${def.summary}</p>${def.fields.map(fieldMarkup).join("")}<div class="doc-actions"><button class="btn primary" type="submit">${documents.form.review}</button><button class="btn" type="button" data-doc-action="download">${documents.form.download}</button><button class="btn" type="reset">${documents.form.clear}</button></div><div class="official-note"><b>${documents.form.beforeUse}</b></div></form><article class="draft-preview" aria-live="polite" aria-label="${documents.preview.label}"><span class="draft-label">${documents.preview.status}</span><h2 id="draftTitle">${def.title}</h2><div id="draftBody"><p>${documents.preview.empty}</p></div><p class="draft-warning">${documents.preview.warning}</p></article></div></section>`;
}
function valueOrBlank(values, key) {
  return (values[key] || "").trim() || "[not provided]";
}
function composeDraft(def, values) {
  let v = (k) => valueOrBlank(values, k),
    date = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  let lines = [`Date: ${date}`, ""];
  switch (def.id) {
    case "legalAid":
      lines.push(
        `To: The Secretary, Legal Services Authority`,
        "",
        `Applicant: ${v("name")}`,
        `Address: ${v("address")}`,
        `Contact: ${v("contact")}`,
        "",
        `Subject: Request for legal aid`,
        "",
        `Matter: ${v("case")}`,
        "",
        `Assistance requested: ${v("reason")}`,
        "",
        `Eligibility information: ${v("eligibility")}`,
        "",
        `I request guidance on the applicable official form and supporting documents.`,
        `Signature: ____________________`,
      );
      break;
    case "demand":
      lines.push(
        `From: ${v("sender")}`,
        "",
        `To: ${v("recipient")}`,
        "",
        `Subject: Request for payment of ${v("amount")}`,
        "",
        `The amount stated above remains due in relation to: ${v("reason")}.`,
        `Please arrange payment by ${v("due")} using ${v("method")}.`,
        `If you disagree with this request, please respond in writing with the relevant details.`,
        `This letter records a request for resolution and does not waive any rights.`,
        `Signature: ____________________`,
      );
      break;
    case "settlement":
      lines.push(
        `WITHOUT PREJUDICE - SETTLEMENT DISCUSSION`,
        "",
        `From: ${v("from")}`,
        `To: ${v("to")}`,
        "",
        `Dispute: ${v("dispute")}`,
        "",
        `Proposed terms: ${v("offer")}`,
        "",
        `Please respond by ${v("deadline")} to ${v("contact")}.`,
        `This is a proposal for discussion. No settlement is concluded until terms are reviewed, accepted and recorded appropriately.`,
      );
      break;
    case "chronology":
      lines.push(
        `Matter: ${v("matter")}`,
        `Parties: ${v("parties")}`,
        "",
        `CHRONOLOGY`,
        v("events"),
        "",
        `Next known date or deadline: ${v("next")}`,
        "",
        `Prepared as a factual working note. Dates and source documents should be verified.`,
      );
      break;
    case "evidence":
      lines.push(
        `Matter: ${v("matter")}`,
        `Prepared by: ${v("owner")}`,
        "",
        `DOCUMENT AND EVIDENCE INDEX`,
        v("items"),
        "",
        `Missing items or verification notes: ${v("notes")}`,
        "",
        `Keep original files unchanged. This index does not prove authenticity or admissibility.`,
      );
      break;
    case "service":
      lines.push(
        `SERVICE AGREEMENT - DRAFT`,
        "",
        `Service provider: ${v("provider")}`,
        `Client: ${v("client")}`,
        "",
        `1. Services`,
        v("services"),
        "",
        `2. Fees and payment`,
        v("fee"),
        "",
        `3. Term and milestones`,
        v("term"),
        "",
        `4. Termination`,
        v("termination"),
        "",
        `The parties should review applicable tax, intellectual-property, liability, dispute-resolution, stamp-duty and signing requirements before use.`,
        `Provider signature: __________  Client signature: __________`,
      );
      break;
    case "nda":
      lines.push(
        `CONFIDENTIALITY AGREEMENT - DRAFT`,
        "",
        `Disclosing party: ${v("discloser")}`,
        `Receiving party: ${v("recipient")}`,
        "",
        `Purpose: ${v("purpose")}`,
        "",
        `Confidential information: ${v("information")}`,
        "",
        `Duration: ${v("duration")}`,
        "",
        `Exclusions: ${v("exclusions")}`,
        "",
        `The receiving party will use the information only for the stated purpose and take reasonable steps to protect it. Review remedies, governing law and signing requirements before use.`,
        `Disclosing party: __________  Receiving party: __________`,
      );
      break;
    case "loan":
      lines.push(
        `LOAN ACKNOWLEDGEMENT - DRAFT`,
        "",
        `Lender: ${v("lender")}`,
        `Borrower: ${v("borrower")}`,
        `Principal: ${v("amount")}`,
        `Date advanced: ${v("advanced")}`,
        "",
        `Repayment: ${v("repayment")}`,
        `Interest: ${v("interest")}`,
        `Missed payment: ${v("default")}`,
        "",
        `The parties should verify interest, tax, stamp-duty, security and enforcement requirements before signing.`,
        `Lender signature: __________  Borrower signature: __________`,
      );
      break;
  }
  return lines;
}
function readDraftValues() {
  let form = document.getElementById("draftForm"),
    values = {};
  if (!form) return values;
  for (let [key, value] of new FormData(form).entries())
    values[key] = String(value).slice(0, 2000);
  return values;
}
function formHasDraftValues() {
  return Object.values(readDraftValues()).some((value) => String(value).trim());
}
function updateDraftPreview() {
  let def = localizedDocumentTemplates()[state.docTemplate],
    body = document.getElementById("draftBody"),
    title = document.getElementById("draftTitle");
  if (!def || !body || !title) return;
  title.textContent = def.title;
  body.replaceChildren(
    ...composeDraft(def, readDraftValues()).map((line) => {
      let p = document.createElement("p");
      p.textContent = line || " ";
      return p;
    }),
  );
}
function asciiPdfText(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}
function wrapPdfLine(value, width = 82) {
  let clean = String(value).replace(/\s+/g, " ").trim();
  if (!clean) return [""];
  let words = clean.split(" "),
    out = [],
    line = "";
  for (let word of words) {
    while (word.length > width) {
      if (line) {
        out.push(line);
        line = "";
      }
      out.push(word.slice(0, width));
      word = word.slice(width);
    }
    if (!line) line = word;
    else if ((line + " " + word).length <= width) line += " " + word;
    else {
      out.push(line);
      line = word;
    }
  }
  if (line) out.push(line);
  return out;
}
function createPdfBlob(title, sourceLines) {
  let lines = [
      ...sourceLines,
      "",
      "Generated locally in this browser. Review every fact before use.",
    ].flatMap((x) => wrapPdfLine(x)),
    pages = [];
  while (lines.length) pages.push(lines.splice(0, 42));
  let objects = {
      1: "<< /Type /Catalog /Pages 2 0 R >>",
      3: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      4: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    },
    kids = [];
  pages.forEach((pageLines, index) => {
    let pageNo = 5 + index * 2,
      contentNo = pageNo + 1,
      header = asciiPdfText(title.toUpperCase()),
      pageLabel = `Page ${index + 1} of ${pages.length}`,
      stream = `q\n0.063 0.176 0.333 rg\n48 810 499 4 re f\nQ\nBT\n/F2 15 Tf\n50 782 Td\n(${header}) Tj\nET\nBT\n/F2 9 Tf\n50 760 Td\n(DRAFT - REVIEW BEFORE USE) Tj\nET\nBT\n/F1 11 Tf\n50 730 Td\n14 TL\n${pageLines.map((line) => `(${asciiPdfText(line)}) Tj T*`).join("\n")}\nET\nBT\n/F1 8 Tf\n50 32 Td\n(Independent eCourts hackathon prototype - Not legal advice, not filed - ${pageLabel}) Tj\nET`;
    objects[pageNo] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentNo} 0 R >>`;
    objects[contentNo] =
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
    kids.push(`${pageNo} 0 R`);
  });
  objects[2] = `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pages.length} >>`;
  let max = Math.max(...Object.keys(objects).map(Number)),
    pdf = "%PDF-1.4\n% eCourts local draft\n",
    offsets = [0];
  for (let i = 1; i <= max; i++) {
    offsets[i] = new TextEncoder().encode(pdf).length;
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  let xref = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${max + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= max; i++)
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${max + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}
function downloadPdf(blob, filename) {
  let url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.hidden = true;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function home() {
  let pack = text[state.prefs.lang] || text.en,
    tasks = pack.home.tasks;
  return `<section class="page home-page"><header class="service-intro"><p class="eyebrow">${tr("home.kicker")}</p><h1>${tr("home.heading")}</h1><p>${tr("home.copy")}</p><div class="actions"><button class="btn primary" data-go="finder">${icon("search")}${tr("home.actions.find")}</button><button class="btn" data-go="documents">${icon("file-text")}${tr("home.actions.create")}</button></div></header><div class="tasks five" aria-label="${tr("home.taskHeading")}">${task("finder", "search", tasks[0].label, tasks[0].description)}${task("documents", "file-text", tasks[1].label, tasks[1].description)}${task("paper", "scale", tasks[2].label, tasks[2].description)}${task("hearing", "calendar", tasks[3].label, tasks[3].description)}${task("help", "circle-help", tasks[4].label, tasks[4].description)}</div><button type="button" class="assisted-entry" data-action="assisted-entry">${icon("users")}<span><b>${tr("home.assisted.label")}</b><span>${tr("home.assisted.copy")}</span></span></button><figure class="editorial-band"><div role="img" aria-label="${tr("home.editorialAlt")}"></div><figcaption>${tr("home.editorialCue")}</figcaption></figure><div class="bottom">${pack.home.bands.map((x) => `<div class="band"><h2>${x.heading}</h2><p>${x.body}</p></div>`).join("")}</div></section>`;
}
function renderShell() {
  $("#masthead").innerHTML =
    `<div class="masthead-main"><div class="shell top"><a class="brand" href="#home" data-go="home"><span><b>${tr("shared.brand.name")}</b><small>${tr("shared.brand.descriptor")}</small></span></a><nav class="nav" id="nav" aria-label="${tr("shared.mobileMenu.heading")}"></nav><div class="tools"><button class="tool-button language-button" type="button" data-action="language" title="${tr("shared.languageDialog.heading")}">${icon("languages")}<span>${languages[state.prefs.lang]}</span></button><button class="tool-button icon-only" type="button" data-action="access" aria-label="${tr("shared.accessibility.label")}" title="${tr("shared.accessibility.label")}">${icon("accessibility")}</button><button class="tool-button icon-only mobile" type="button" data-action="menu" aria-label="${tr("shared.mobileMenu.open")}" title="${tr("shared.mobileMenu.open")}">${icon("menu")}</button></div></div></div>`;
  $("#footer").innerHTML = `<p class="prototype-badge">${tr("shared.prototype.descriptor")}</p><p>${tr("shared.footer.notice")}</p>`;
}
function nav() {
  let items = [
    ["home", "home", tr("shared.nav.home")],
    ["finder", "search", tr("shared.nav.finder")],
    ["courts", "landmark", tr("shared.nav.courts")],
    ["documents", "file-text", tr("shared.nav.documents")],
    ["help", "circle-help", tr("shared.nav.help")],
  ];
  if (state.selected && state.profile)
    items.push(["case", "briefcase", tr("shared.nav.workspace")]);
  $("#nav").innerHTML = items
    .map(
      (x) =>
        `<button class="${state.page === x[0] ? "active" : ""}" data-go="${x[0]}">${icon(x[1])}<span>${x[2]}</span></button>`,
    )
    .join("");
}
function render() {
  prefs();
  renderShell();
  nav();
  $("#app").innerHTML =
    state.page === "finder"
      ? finder()
      : state.page === "courts"
        ? courtsPage()
        : state.page === "documents"
          ? documentStudio()
          : state.page === "help"
            ? supportPage()
            : state.page === "case"
              ? casePage()
              : home();
  overlay();
  if (state.page === "documents") requestAnimationFrame(updateDraftPreview);
}
function updateHelpSuggestions() {
  let row = document.getElementById("help-suggestions"),
    live = document.getElementById("help-suggestion-live"),
    items = suggestedHelpFaqs();
  state.helpSuggestions = items.map((item) => item.id);
  if (row)
    row.innerHTML = items
      .map(
        (item) =>
          `<button type="button" class="suggestion" data-help-suggest="${item.id}">${item.question}</button>`,
      )
      .join("");
  if (live) live.textContent = tr("shared.toasts.suggestionsUpdated");
}

function routeTo(go) {
  if (go === "paper") {
    state.page = "finder";
    state.tab = "paper";
  } else if (go === "hearing") {
    state.selected = sample.cnr;
    state.page = "case";
  } else state.page = go;
  if (go !== "finder" && go !== "paper") state.assisted = false;
  let closing = Boolean(state.modal || state.menu);
  if (closing) closeOverlay();
  render();
  scrollTo(0, 0);
}
function handleHelpSuggestion(control) {
  let id = control.dataset.helpSuggest,
    detail = document.getElementById(`faq-${id}`);
  if (!detail) {
    state.helpQuery = "";
    render();
    detail = document.getElementById(`faq-${id}`);
  }
  if (!detail) return;
  detail.open = true;
  let summary = detail.querySelector("summary");
  summary?.scrollIntoView({
    behavior: state.prefs.reduce ? "auto" : "smooth",
    block: "center",
  });
  summary?.focus({ preventScroll: true });
}
function handleClick(event) {
  let control = event.target.closest(
    "[data-action],[data-go],[data-tab],[data-doc],[data-term],[data-language],[data-template],[data-doc-action],[data-help-suggest]",
  );
  if (!control) return;
  let action = control.dataset.action;
  if (
    (action === "close" || action === "close-menu") &&
    control.classList.contains("overlay") &&
    event.target !== control
  )
    return;
  if (action === "close" || action === "close-menu") {
    closeOverlay();
    return;
  }
  if (control.dataset.helpSuggest) {
    handleHelpSuggestion(control);
    return;
  }
  if (control.dataset.template) {
    const nextTemplate = control.dataset.template;
    if (nextTemplate === state.docTemplate) return;
    if (
      formHasDraftValues() &&
      !window.confirm(tr("documents.switchConfirm"))
    )
      return;
    state.docTemplate = nextTemplate;
    render();
    scrollTo(0, 0);
    return;
  }
  if (control.dataset.docAction) {
    let form = document.getElementById("draftForm");
    if (!form || !form.reportValidity()) return;
    let english = documentTemplates[state.docTemplate] || documentTemplates.legalAid,
      lines = composeDraft(english, readDraftValues());
    if (lines.some((line) => /[^\x00-\x7F]/.test(line))) {
      toast(tr("shared.toasts.pdfEnglishOnly"));
      return;
    }
    downloadPdf(createPdfBlob(english.title, lines), english.file);
    toast(tr("shared.toasts.pdfDownloaded"));
    return;
  }
  if (control.dataset.go) {
    routeTo(control.dataset.go);
    return;
  }
  if (control.dataset.tab) {
    const tablist = control.closest("[role='tablist']");
    if (tablist?.dataset.tabs === "courts")
      activateCourtsTab(control.dataset.tab);
    else activateFinderTab(control.dataset.tab);
    return;
  }
  if (control.dataset.doc) {
    state.doc = +control.dataset.doc;
    showModal("doc", control);
    return;
  }
  if (control.dataset.term) {
    state.term = control.dataset.term;
    showModal("term", control);
    return;
  }
  if (control.dataset.language) {
    state.prefs.lang = control.dataset.language;
    persist();
    closeOverlay();
    render();
    return;
  }
  if (action === "menu") {
    showMenu(control);
    return;
  }
  if (action === "language") {
    showModal("language", control);
    return;
  }
  if (action === "access") {
    showModal("access", control);
    return;
  }
  if (action === "clear-help-search") {
    state.helpQuery = "";
    render();
    document.getElementById("help-search")?.focus();
    return;
  }
  if (action === "assisted-entry") {
    state.assisted = true;
    state.page = "finder";
    state.tab = "cnr";
    state.finderResult = null;
    render();
    scrollTo(0, 0);
    return;
  }
  if (action === "exit-assisted") {
    state.assisted = false;
    render();
    document.querySelector("#finder-panel")?.focus();
    return;
  }
  if (action === "sample-preview" || action === "paper-match") {
    state.finderResult = "match";
    render();
    document.getElementById("result")?.scrollIntoView({
      behavior: state.prefs.reduce ? "auto" : "smooth",
      block: "nearest",
    });
    return;
  }
  if (action === "open-sample") {
    state.selected = sample.cnr;
    state.page = "case";
    persist();
    render();
    scrollTo(0, 0);
    return;
  }
  if (action === "save") {
    if (state.profile) {
      toast(tr("shared.toasts.alreadySaved"));
      return;
    }
    showModal(1, control);
    return;
  }
  if (action === "next") {
    let n = $("#name").value.trim(),
      m = $("#mobile").value.replace(/\D/g, "");
    if (!n || m.length !== 10) {
      toast(tr("shared.validation.mobile"));
      return;
    }
    state.pending = { n, m };
    state.modal = 2;
    overlay();
    return;
  }
  if (action === "verify") {
    if ($("#otp").value !== "318204") {
      toast(tr("shared.validation.otp"));
      return;
    }
    state.modal = 3;
    overlay();
    return;
  }
  if (action === "finish") {
    state.profile = { name: state.pending.n };
    state.prefs.lang = $("#lang").value;
    state.prefs.large = $("#large").value === "true";
    persist();
    closeOverlay();
    state.page = "case";
    render();
    toast(tr("shared.toasts.workspaceSaved"));
    return;
  }
  if (action === "download" && state.modal === "doc") {
    let english = caseDocuments[state.doc] || caseDocuments[0],
      blob = createPdfBlob(english.englishTitle, [
        ...english.englishBody,
        "",
        "Sample data - hackathon prototype. Not an official court document.",
      ]);
    downloadPdf(blob, english.file);
    toast(tr("shared.toasts.syntheticPdfDownloaded"));
    return;
  }
  if (action === "reset") {
    closeOverlay();
    localStorage.removeItem(KEY);
    state = {
      page: "home",
      tab: "cnr",
      finderResult: null,
      assisted: false,
      courtsTab: "district",
      selected: null,
      modal: null,
      menu: false,
      profile: null,
      prefs: { lang: "en", contrast: false, large: false, reduce: false },
    };
    render();
    toast(tr("shared.toasts.reset"));
  }
}
function handleKeydown(event) {
  const tab = event.target.closest?.('[role="tab"]');
  if (tab && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    const tablist = tab.closest('[role="tablist"]');
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const current = tabs.indexOf(tab);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
            tabs.length;
    const id = tabs[next].dataset.tab;
    if (tablist?.dataset.tabs === "courts")
      activateCourtsTab(id, { focus: true });
    else activateFinderTab(id, { focus: true });
    return;
  }
  if (event.key === "Escape" && (state.modal || state.menu)) {
    event.preventDefault();
    closeOverlay();
    return;
  }
  if (event.key !== "Tab" || (!state.modal && !state.menu)) return;
  let panel = overlayPanel(),
    focusable = overlayFocusables();
  if (!panel) return;
  if (!focusable.length) {
    event.preventDefault();
    panel.focus();
    return;
  }
  let first = focusable[0],
    last = focusable[focusable.length - 1],
    active = document.activeElement;
  if (event.shiftKey && (active === first || !panel.contains(active))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
    event.preventDefault();
    first.focus();
  }
}
const delegatedHandlers = {
  input: [
    (event) => {
      if (event.target.id !== "help-search" || event.isComposing) return;
      state.helpQuery = event.target.value;
      state.helpSuggestions = suggestedHelpFaqs().map((item) => item.id);
      let position = event.target.selectionStart;
      render();
      let input = document.getElementById("help-search");
      if (input) {
        input.focus();
        if (Number.isInteger(position))
          input.setSelectionRange(position, position);
      } else
        document.querySelector('[data-action="clear-help-search"]')?.focus();
    },
    (event) => {
      if (event.target.closest("#draftForm")) updateDraftPreview();
    },
  ],
  submit: [
    (e) => {
      if (e.target.id !== "search") return;
      e.preventDefault();
      let q = e.target.query.value.trim().toLowerCase(),
        ok =
          (state.tab === "cnr" && q === sample.cnr.toLowerCase()) ||
          (state.tab === "number" && q === sample.caseNo.toLowerCase()) ||
          (state.tab === "party" && q === sample.party.toLowerCase());
      state.finderResult = ok ? "match" : q ? "none" : "empty";
      render();
      document.getElementById("result")?.scrollIntoView({
        behavior: state.prefs.reduce ? "auto" : "smooth",
        block: "nearest",
      });
    },
    (event) => {
      if (event.target.id !== "draftForm") return;
      event.preventDefault();
      updateDraftPreview();
      document.querySelector(".draft-preview")?.scrollIntoView({
        behavior: state.prefs.reduce ? "auto" : "smooth",
        block: "start",
      });
    },
  ],
  change: [
    (e) => {
      if (e.target.dataset.pref) {
        state.prefs[e.target.dataset.pref] = e.target.value === "true";
        persist();
        prefs();
      }
    },
  ],
  reset: [
    (event) => {
      if (event.target.id === "draftForm") setTimeout(updateDraftPreview);
    },
  ],
  toggle: [
    (event) => {
      let detail = event.target.closest?.("[data-faq]");
      if (!detail || !detail.open) return;
      state.helpLast = detail.dataset.faq;
      let group = detail.closest(".knowledge-base");
      group?.querySelectorAll("[data-faq][open]").forEach((other) => {
        if (other !== detail) other.open = false;
      });
      updateHelpSuggestions();
    },
  ],
};
document.addEventListener("click", handleClick);
document.addEventListener("keydown", handleKeydown);
for (const [type, handlers] of Object.entries(delegatedHandlers))
  document.addEventListener(
    type,
    (event) => {
      for (const handler of handlers) handler(event);
    },
    type === "toggle",
  );
render();
