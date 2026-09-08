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
function createPaperScanState() {
  return {
    status: "ready",
    requestId: 0,
    fileName: "",
    fileSize: 0,
    analysis: null,
    match: null,
    selectedRecordId: null,
    applied: false,
    enrichment: { selected: [], applied: [] },
    error: "",
  };
}
let state = {
  page: "home",
  tab: "number",
  finderQuery: "",
  finderResult: null,
  assisted: false,
  courtsTab: "district",
  selected: null,
  modal: null,
  menu: false,
  profile: null,
  tourStep: 0,
  caseRole: "party",
  caseStage: "understand",
  paperScan: createPaperScanState(),
  dashboardCases: [],
  lawyerSession: null,
  derivedCaseContext: null,
  prefs: { ...defaultPrefs },
};
let selectedPaperFile = null;
let latestPaperAnalysis = null;
function assistantEvent(name, detail = {}) {
  window.dispatchEvent(new CustomEvent(`ecourts:${name}`, { detail }));
}
function selectedCaseRecord() {
  if (!state.selected || state.selected === sample.cnr) return null;
  return window.ECOURTS_CASE_REPOSITORY?.records?.find((record) => record.cnr === state.selected) || null;
}
function selectedCaseExplanations() {
  const record = selectedCaseRecord();
  const localized = (text[state.prefs.lang] || text.en).case.record;
  if (!record) return { meaning: localized.meaningText, official: localized.officialText, verify: localized.verifyText };
  const copy = {
    en: {
      meaning: `This sample repository record is marked ${record.status}. Confirm the status and dates with the official court record.`,
      official: `The sample repository lists this as ${record.status}. This is not a live court record.`,
      verify: "Confirm this sample record, its dates and documents with the official court record.",
    },
    as: {
      meaning: `এই নমুনা ৰিপ'জিটৰী ৰেকৰ্ডৰ অৱস্থা ${record.status}। চৰকাৰী আদালতৰ ৰেকৰ্ডৰ সৈতে অৱস্থা আৰু তাৰিখ নিশ্চিত কৰক।`,
      official: `নমুনা ৰিপ'জিটৰীত এইটো ${record.status} হিচাপে দিয়া আছে। এইটো কোনো জীৱন্ত আদালতৰ ৰেকৰ্ড নহয়।`,
      verify: "এই নমুনা ৰেকৰ্ড, ইয়াৰ তাৰিখ আৰু নথি চৰকাৰী আদালতৰ ৰেকৰ্ডৰ সৈতে নিশ্চিত কৰক।",
    },
    hi: {
      meaning: `इस नमूना रिपॉज़िटरी रिकॉर्ड की स्थिति ${record.status} है। स्थिति और तारीखें आधिकारिक अदालत रिकॉर्ड से पक्की करें।`,
      official: `नमूना रिपॉज़िटरी में इसे ${record.status} बताया गया है। यह कोई लाइव अदालत रिकॉर्ड नहीं है।`,
      verify: "इस नमूना रिकॉर्ड, इसकी तारीखों और दस्तावेज़ों को आधिकारिक अदालत रिकॉर्ड से पक्का करें।",
    },
  };
  return copy[state.prefs.lang] || copy.en;
}
window.ECOURTS_ASSISTANT_CONTEXT = Object.freeze({
  get() {
    const record = selectedCaseRecord();
    const current = record || sample;
    return {
      language: state.prefs.lang,
      route: state.page,
      case: state.selected ? { cnr: current.cnr, title: current.title, court: current.court, status: current.status, nextHearing: record?.dates?.nextHearing || current.next } : null,
      paper: latestPaperAnalysis,
    };
  },
});
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
  state.tourStep = saved?.tourSeen === true ? null : 0;
  localStorage.setItem(
    KEY,
    JSON.stringify({
      prefs: state.prefs,
      selected: state.selected,
      tourSeen: saved?.tourSeen === true,
    }),
  );
} catch (error) {
  localStorage.removeItem(KEY);
}
if (!state.paperScan || typeof state.paperScan !== "object" || Array.isArray(state.paperScan)) {
  state.paperScan = createPaperScanState();
}
const $ = (s) => document.querySelector(s);
const getPath = i18n.getPath;
function tr(path, values = {}) {
  return i18n.resolve(state.prefs.lang, path, values);
}
const iconPaths = {
  "arrow-right": '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  "sparkles": '<path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6z"/><path d="M20 2v4M18 4h4"/>',
  "grid": '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  "book-open": '<path d="M12 5v16M12 5C8 2 4 3 2 4v16c3-2 7-2 10 1 3-3 7-3 10-1V4c-3-1-7-2-10 1z"/>',
  "map-pin": '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  "credit-card": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 9h20M6 15h4"/>',
  "hourglass": '<path d="M5 3h14M5 21h14M6 3c0 7 12 11 12 18M18 3c0 7-12 11-12 18"/>',
  "settings": '<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  "upload": '<path d="M12 16V3m-5 5 5-5 5 5M4 14v7h16v-7"/>',

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
    '<circle cx="12" cy="4" r="2"/><path d="M4 8h16M12 7v7m0 0-4 8m4-8 4 8"/>',
  calendar:
    '<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/>',
  scale:
    '<path d="M12 3v18"/><path d="m19 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/><path d="m5 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M7 21h10"/>',
  landmark:
    '<path d="M10 18v-7"/><path d="M11.12 2.12a2 2 0 0 1 1.76 0L21 7H3z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>',
  "arrow-left":
    '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  microphone:
    '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
  message:
    '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
  monitor:
    '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
  folder:
    '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>',
  route:
    '<circle cx="6" cy="19" r="3"/><path d="M9 19h4.5a3.5 3.5 0 0 0 0-7h-3a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  camera:
    '<path d="M14.5 4h-5L7.7 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.7z"/><circle cx="12" cy="13" r="3"/>',
  lock:
    '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  check: '<path d="m20 6-11 11-5-5"/>',
};
function icon(name) {
  return `<svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name]}</svg>`;
}
const assetVersion = "20260903s";
const taskPhotos = {
  search: "icon-search.jpg",
  "file-text": "icon-file.jpg",
  scale: "icon-scale.jpg",
  calendar: "icon-calendar.jpg",
  "circle-help": "icon-help.jpg",
};
function asset(file) {
  return `assets/${file}?v=${assetVersion}`;
}
function still(file, alt, extraClass = "") {
  return `<figure class="page-still ${extraClass}"><img src="${asset(file)}" alt="${alt}" width="960" height="600" loading="lazy" decoding="async"></figure>`;
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
      tourSeen: state.tourStep === null,
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
  const photo = taskPhotos[iconName];
  const mark = photo
    ? `<i class="task-icon photo"><img src="${asset(photo)}" alt="" width="64" height="64" decoding="async"></i>`
    : `<i class="task-icon">${icon(iconName)}</i>`;
  return `<button class="task" data-go="${id}">${mark}<span><b>${label}</b><span>${desc}</span></span></button>`;
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
          : state.tab === "advocate" ? "Demo Advocate A" : sample.party;
  const assisted = state.assisted
    ? `<aside class="assisted-notice"><div>${icon("users")}<p><b>${tr("finder.assisted.heading")}</b><span>${tr("finder.assisted.body")}</span></p></div><button type="button" class="btn" data-action="exit-assisted">${tr("finder.assisted.exit")}</button></aside>`
    : "";
  const tabs = ["number", "party", "advocate", "cnr", "paper"];
  const stepKind = state.tab === "paper" ? "paperSteps" : "searchSteps";
  return `<section class="page finder-page" data-finder-mode="${state.tab}">${guidedSteps(stepKind)}<div class="head"><p class="kicker">${tr("finder.kicker")}</p><h1>${tr("finder.heading")}</h1><p>${tr("finder.intro")}</p></div>${assisted}${finderQuickSearch()}<div class="finder"><div class="tabs" role="tablist" aria-label="${tr("finder.tabsLabel")}">${tabs.map((id) => `<button id="finder-tab-${id}" type="button" role="tab" aria-selected="${state.tab === id}" aria-controls="finder-panel" tabindex="${state.tab === id ? "0" : "-1"}" class="${state.tab === id ? "active" : ""}" data-tab="${id}">${tr(`finder.tabs.${id}`)}</button>`).join("")}</div><div id="finder-panel" class="panel" role="tabpanel" aria-labelledby="finder-tab-${state.tab}" tabindex="0">${finderPanelContent(field, placeholder)}</div></div></section>`;
}

function finderQuickSearch() {
  return `<form id="finder-quick-search" class="home-search finder-quick-search" novalidate><label class="sr-only" for="finder-quick-query">${tr("finder.heading")}</label><div>${icon("search")}<input id="finder-quick-query" name="query" autocomplete="off" value="${escapeHelpHtml(state.finderQuery)}" placeholder="${escapeHelpHtml(tr("home.searchPlaceholder"))}"><button type="submit" class="btn primary" aria-label="${escapeHelpHtml(tr("finder.actions.search"))}">${icon("arrow-right")}</button></div></form>`;
}

function finderPanelContent(field, placeholder) {
  if (state.tab === "paper") return paperIntakeMarkup();
  return `<h2>${state.tab === "cnr" ? term("cnr") : field}</h2><p id="finder-instruction">${tr(`finder.instructions.${state.tab}`)}</p><form id="search" novalidate><div class="field"><label for="query">${field}</label><input id="query" name="query" class="record-value" autocomplete="off" aria-describedby="finder-instruction" value="${escapeHelpHtml(state.finderQuery)}" placeholder="${placeholder}"></div>${state.tab === "number" ? `<div class="finder-filters"><label>${guidedCopy().courtType}<select name="courtType"><option value="">${guidedCopy().selectCourt}</option><option value="district">${guidedCopy().district}</option><option value="high">${guidedCopy().high}</option></select></label><label>${guidedCopy().year}<select name="year"><option value="">${guidedCopy().selectYear}</option>${Array.from({length: 30},(_,i) => 2026-i).map(y => `<option>${y}</option>`).join("")}</select></label></div>` : ""}<div class="actions"><button type="submit" class="btn primary">${icon("search")}${tr("finder.actions.search")}</button><button type="button" class="btn secondary" data-action="sample-preview">${tr("finder.actions.sample")}</button></div></form><div id="result">${finderResult()}</div><div class="finder-help"><h2>${tr("finder.help.heading")}</h2><p>${tr("finder.help.body")}</p><button type="button" class="btn" data-go="help">${tr("finder.actions.help")}</button></div>`;
}

function activateFinderTab(id, { focus = false } = {}) {
  if (!["cnr", "number", "party", "advocate", "paper"].includes(id)) return;
  if (state.tab === "paper" && id !== "paper") invalidatePaperScanRequest();
  state.tab = id;
  state.finderQuery = "";
  state.finderResult = null;
  const finderPage = document.querySelector(".finder-page");
  if (finderPage) {
    finderPage.dataset.finderMode = id;
    const steps = finderPage.querySelector(".guided-steps");
    if (steps) steps.outerHTML = guidedSteps(id === "paper" ? "paperSteps" : "searchSteps");
  }
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
      id === "cnr" ? sample.cnr : id === "number" ? sample.caseNo : id === "advocate" ? "Demo Advocate A" : sample.party;
    panel.setAttribute("aria-labelledby", `finder-tab-${id}`);
    panel.innerHTML = finderPanelContent(field, placeholder);
  }
  if (focus) document.getElementById(`finder-tab-${id}`)?.focus();
  syncHistory("replace");
}

function activateCourtsTab(id, { focus = false } = {}) {
  if (!["district", "high"].includes(id)) return;
  state.courtsTab = id;
  state.locator = true;
  syncHistory("replace");
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
  return `<section class="page courts-page"><header class="guided-service-head"><h1>${guidedCopy().services}</h1><p>${guidedCopy().servicesIntro}</p></header><div class="guided-services">${guidedCopy().serviceItems.map(([title,description],i) => `<button type="button" class="guided-service-card" data-action="service-guide" data-service="${i}"><span class="guided-icon">${icon(["file-text","credit-card","calendar","file-text","users","hourglass"][i])}</span><span><b>${title}</b><small>${description}</small><i>${icon("arrow-right")}</i></span></button>`).join("")}</div><aside class="guided-help"><span class="guided-icon">${icon("settings")}</span><div><b>${guidedCopy().guideTitle}</b><p>${guidedCopy().guideText}</p><button class="text-link" data-go="help">${guidedCopy().guide} ${icon("arrow-right")}</button></div></aside><details class="official-directory" ${state.locator ? "open" : ""}><summary>${guidedCopy().actions[3][0]} · ${tr("courts.heading")}</summary><div class="courts-stage"><header class="courts-guide"><span class="courts-mark" aria-hidden="true"></span>${still("visual-courts.jpg", tr("courts.stillAlt"))}<p class="kicker">${tr("courts.kicker")}</p><h2>${tr("courts.heading")}</h2><p class="courts-intro">${tr("courts.intro")}</p><div class="courts-tabs" role="tablist" data-tabs="courts" aria-label="${tr("courts.tabsLabel")}">${["district", "high"].map((id) => `<button id="courts-tab-${id}" type="button" role="tab" aria-selected="${tab === id}" aria-controls="courts-panel" tabindex="${tab === id ? "0" : "-1"}" class="${tab === id ? "active" : ""}" data-tab="${id}">${tr(`courts.tabs.${id}`)}</button>`).join("")}</div><aside class="courts-chooser">${tr(`courts.${tab}.chooser`)}</aside></header><div id="courts-panel" class="courts-panel" role="tabpanel" aria-labelledby="courts-tab-${tab}" tabindex="0"><div class="service-rows courts-subjects">${items.map(serviceRow).join("")}</div></div></div><section class="courts-shared" aria-labelledby="courts-shared-title"><div class="courts-shared-head"><span class="courts-mark" aria-hidden="true"></span><h2 id="courts-shared-title">${tr("courts.shared.heading")}</h2></div><div class="service-rows courts-support">${officialShared.map(serviceRow).join("")}</div></section></details><button class="btn secondary" data-go="documents">${tr("shared.nav.documents")}</button></section>`;
}

function derivedCaseContextMarkup(derived, context) {
  if (!derived || !state.paperScan?.applied) return "";
  const safe = (value) => escapeHelpHtml(value);
  const analysis = derived.sanitizedAnalysis || {};
  const additions = (derived.additions || []).map((item) => `<div><dt>${safe(item.label)}</dt><dd>${safe(item.value)} <small>${safe(item.source)} · ${safe(item.confidence)}</small></dd></div>`).join("");
  const reviewFacts = [
    [paperIntakeCopy().labels.type, analysis.document_type],
    [paperIntakeCopy().labels.dates, (analysis.dates || []).map((item) => `${item.label}: ${item.value}`).join("; ")],
    [paperIntakeCopy().labels.parties, (analysis.parties || []).map((item) => `${item.role}: ${item.name}`).join("; ")],
    [paperIntakeCopy().labels.explanation, analysis.plain_language_summary],
    [paperIntakeCopy().labels.confidence, analysis.confidence],
    [paperIntakeCopy().labels.actions, (analysis.verification_items || []).join("; ")],
  ].filter(([, value]) => String(value || "").trim()).map(([label, value]) => `<div><dt>${safe(label)}</dt><dd>${safe(value)}</dd></div>`).join("");
  return `<section class="block derived-case-context" aria-labelledby="derived-case-context-title"><p class="kicker">${safe(context.kicker)}</p><h2 id="derived-case-context-title">${safe(context.heading)}</h2><p class="verification-boundary">${safe(context.boundary)}</p><p class="sample-disclosure">${safe(context.provenance)}</p><dl class="derived-facts">${additions}${reviewFacts}</dl></section>`;
}
function casePage() {
  if (!state.selected) return home();
  const pack = (text[state.prefs.lang] || text.en).case;
  const journey = localizedCopy().journey;
  const repositoryRecord = selectedCaseRecord();
  const display = repositoryRecord || sample;
  const displayStatus = repositoryRecord?.status || sample.status;
  const displayNext = repositoryRecord?.dates?.nextHearing || "2026-09-14";
  const displayDocuments = repositoryRecord ? repositoryRecord.documents.map((item) => ({ title: item.title, detail: item.kind })) : sample.docs.map(([title, detail]) => ({ title, detail }));
  const displayHistory = repositoryRecord ? repositoryRecord.timeline.map((item) => ({ title: item.label, detail: item.date })) : pack.history.items;
  const explanations = selectedCaseExplanations();
  const date = new Date(`${displayNext}T00:00:00`);
  const dateParts = Number.isNaN(date.getTime()) ? ["", ""] : [String(date.getDate()).padStart(2, "0"), date.toLocaleDateString(state.prefs.lang === "hi" ? "hi-IN" : state.prefs.lang === "as" ? "as-IN" : "en-IN", { month: "short", year: "numeric" }).toUpperCase()];
  const derived = state.derivedCaseContext;
  const context = paperIntakeCopy().context;
  const derivedMarkup = derivedCaseContextMarkup(derived, context);
  return `<section class="page case case-overview"><div class="case-top"><div><p class="kicker">${pack.identity.kicker}</p><h1>${escapeHelpHtml(display.title)}</h1><p>${icon("landmark")}${escapeHelpHtml(display.court)}</p><p>${term("cnr")}: <span class="record-value">${escapeHelpHtml(display.cnr)}</span></p><span class="case-status">${escapeHelpHtml(displayStatus)}</span><p class="record-note">${pack.identity.recordValues}</p><p class="sample-disclosure">${escapeHelpHtml(display.dataLabel || "Sample data - hackathon prototype. Not an official court record.")}</p></div><aside class="hearing-card"><span>${icon("calendar")} ${pack.agenda.next}</span><strong>${escapeHelpHtml(dateParts[0])}</strong><b>${escapeHelpHtml(dateParts[1])}</b><small>${escapeHelpHtml(displayNext)}</small><button type="button" class="btn" data-action="case-stage" data-stage="prepare">${journey[3]} &#8594;</button></aside></div><nav class="case-tabs" aria-label="${escapeHelpHtml(display.title)}"><button type="button" class="active" data-action="case-stage" data-stage="understand">${journey[1]}</button><button type="button" data-action="case-stage" data-stage="action">${journey[2]}</button><button type="button" data-action="case-stage" data-stage="prepare">${journey[3]}</button><button type="button" data-go="documents">${pack.documents.heading}</button></nav><div class="case-grid"><div class="case-reading">${derivedMarkup}<section class="block record-block"><h2>${pack.record.heading}</h2><div class="order-modes" role="group" aria-label="${pack.record.heading}"><label><input type="radio" name="order-mode" checked> ${pack.record.meaning}</label><label><input type="radio" name="order-mode"> ${pack.record.official}</label></div><article class="record-meaning"><p>${escapeHelpHtml(explanations.meaning)}</p><button type="button" class="text-link" data-doc="0">${pack.documents.view} ${escapeHelpHtml(displayDocuments[0]?.title || pack.documents.items[0].title)} &#8599;</button></article></section><section class="block history-block"><h2>${pack.history.heading}</h2><div class="timeline">${displayHistory.map((item) => `<div><i class="dot"></i><span><b>${escapeHelpHtml(item.title)}</b><span>${escapeHelpHtml(item.detail)}</span></span></div>`).join("")}</div></section></div><aside class="case-rail"><section class="block record-verify"><h2>${pack.record.verify}</h2><p>${escapeHelpHtml(explanations.verify)}</p></section><section class="block documents-block"><h2>${pack.documents.heading}</h2>${displayDocuments.map((item, i) => `<div class="doc"><span><b>${escapeHelpHtml(item.title)}</b><span>${escapeHelpHtml(item.detail)}</span></span><button type="button" class="btn" data-doc="${i}">${pack.documents.view}</button></div>`).join("")}</section><button type="button" class="btn primary case-help" data-go="help" aria-label="${pack.support.accessible}">${pack.support.action}</button></aside></div></section>`;
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
function currentCaseDocuments() {
  const record = selectedCaseRecord();
  if (!record) return caseDocuments;
  return record.documents.map((document) => ({
    englishTitle: document.title,
    file: `${record.id}-${document.id}.pdf`,
    englishBody: [
      "SAMPLE REPOSITORY DOCUMENT",
      document.title,
      `${record.title}`,
      `${record.court}`,
      `CNR: ${record.cnr}`,
      "",
      `${document.kind}`,
      "This prototype document is synthetic and must be checked against the official court record.",
    ],
  }));
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
function mobileMenuItem(route, iconName, label, action = "go") {
  const current = state.page === route;
  return `<button type="button" class="${current ? "active" : ""}" ${current ? 'aria-current="page"' : ""} data-${action}="${route}">${icon(iconName)}${label}</button>`;
}
function overlay() {
  let o = $("#overlay");
  if (!state.modal && !state.menu) {
    o.innerHTML = "";
    setBackgroundInert(false);
    return;
  }
  if (state.menu) {
    o.innerHTML = `<div class="overlay menu-overlay" data-action="close-menu"><nav class="menu" role="dialog" aria-modal="true" aria-labelledby="menu-title" tabindex="-1"><header class="menu-header"><h2 id="menu-title">${tr("shared.mobileMenu.heading")}</h2><button type="button" class="menu-close" data-action="close-menu" aria-label="${tr("shared.actions.close")}">×</button></header>${mobileMenuItem("home", "home", tr("shared.nav.home"), "action")}${mobileMenuItem("finder", "search", tr("shared.nav.finder"))}${mobileMenuItem("courts", "landmark", tr("shared.nav.courts"))}${mobileMenuItem("understand", "file-text", tr("understand.navLabel"))}${mobileMenuItem("documents", "folder", tr("shared.nav.documents"))}${mobileMenuItem("help", "circle-help", tr("shared.nav.help"))}${state.selected && state.profile ? mobileMenuItem("case", "briefcase", tr("shared.nav.workspace")) : ""}<button data-action="language">${icon("languages")}${languages[state.prefs.lang]}</button><button data-action="access">${icon("accessibility")}${tr("shared.accessibility.heading")}</button><button data-action="reset">${tr("shared.actions.reset")}</button></nav></div>`;
  } else if (state.modal === "advocate-entry") {
    const lawyer = lawyerSessionCopy();
    o.innerHTML = modalMarkup(`<h2 id="dialog-title">${guidedCopy().advocate}</h2><p>${guidedCopy().advocateCopy}</p><p>${tr("shared.prototype.descriptor")}</p><p>${guidedCopy().advocateDemo}</p><button class="btn primary" data-action="lawyer-signin">${lawyer.entry}</button><button class="btn" data-go="documents">${tr("shared.nav.documents")}</button>`);
  } else if (state.modal === "lawyer-session") {
    const lawyer = lawyerSessionCopy();
    o.innerHTML = modalMarkup(`<p class="kicker">${lawyer.heading}</p><h2 id="dialog-title">${lawyer.entry}</h2><p>${lawyer.intro}</p><p class="prototype-boundary">${lawyer.boundary}</p><button class="btn primary" data-action="lawyer-enter-session">${lawyer.enter}</button>`);
  } else if (state.modal === "service-guide") {
    const g = guidedCopy(), item = g.serviceItems[state.serviceIndex || 0];
    o.innerHTML = modalMarkup(`<h2 id="dialog-title">${item[0]}</h2><p>${item[1]}</p><p>${g.serviceNotice}</p><a class="btn primary" href="${officialShared[0].url}" target="_blank" rel="noopener noreferrer">${g.gateway} ↗</a>`);
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
    let english = currentCaseDocuments()[state.doc] || currentCaseDocuments()[0];
    let d = selectedCaseRecord()
      ? { title: english.englishTitle, meaning: "This synthetic repository document must be checked against the official court record." }
      : (text[state.prefs.lang] || text.en).case.documents.items[state.doc] || text.en.case.documents.items[0];
    o.innerHTML = modalMarkup(
      `<p class="kicker">${tr("shared.documentModal.kicker")}</p><h2 id="dialog-title">${d.title}</h2><div class="paper" lang="en">${english.englishBody.map(escapeHelpHtml).join("<br>")}</div><p class="prototype-boundary">${tr("shared.documentModal.boundary")}</p><h3>${tr("shared.documentModal.plainLanguage")}</h3><p>${d.meaning}</p><button class="btn primary" data-action="download">${tr("shared.documentModal.download")}</button>`,
    );
  } else if (state.modal === "whatsapp") {
    const w = localizedCopy().whatsapp;
    o.innerHTML = modalMarkup(
      `<div class="whatsapp-preview"><p class="kicker">${w.kicker}</p><h2 id="dialog-title">${w.heading}</h2><p>${w.intro}</p><div class="phone-preview" aria-label="${w.previewLabel}"><div class="phone-head">${icon("message")}<span><b>eCourts companion</b><small>${w.simulation}</small></span></div><div class="chat-message"><b>${w.update}</b><span>${w.message}</span></div><div class="chat-actions"><button type="button" disabled>${w.status}</button><button type="button" disabled>${w.checklist}</button></div></div><ul class="consent-list"><li>${w.consent}</li><li>${w.stop}</li><li>${w.noData}</li></ul><button type="button" class="btn primary" data-action="close">${w.done}</button></div>`,
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
function helpGuideCopy() {
  const copy = {
    en: { heading: "What are you trying to do?", intro: "Choose a task and we will guide you to the right record or service.", items: [["Find my case", "Start with any case detail you know."], ["Understand this status", "See what a court status means in plain language."], ["Understand an order", "Read an order or notice with the original beside it."], ["Organise a case bundle", "A secondary workspace for lawyers and legal clerks."]], professional: "For legal professionals" },
    as: { heading: "আপুনি কি কৰিবলৈ চেষ্টা কৰিছে?", intro: "এটা কাম বাছক আৰু আমি আপোনাক সঠিক ৰেকৰ্ড বা সেৱালৈ লৈ যাম।", items: [["মোৰ মামলা বিচাৰক", "আপুনি জনা যিকোনো মামলাৰ তথ্যৰে আৰম্ভ কৰক।"], ["এই অৱস্থা বুজক", "আদালতৰ অৱস্থা সহজ ভাষাত বুজক।"], ["এটা আদেশ বুজক", "মূল আদেশৰ সৈতে সহজ ব্যাখ্যা পঢ়ক।"], ["মামলাৰ কাগজ সংগঠিত কৰক", "অধিবক্তা আৰু আইনী কৰ্মচাৰীৰ বাবে দ্বিতীয় কৰ্মক্ষেত্ৰ।"]], professional: "আইনী পেছাদাৰসকলৰ বাবে" },
    hi: { heading: "आप क्या करना चाहते हैं?", intro: "एक काम चुनें और हम आपको सही रिकॉर्ड या सेवा तक ले जाएँगे।", items: [["मेरा मामला खोजें", "मामले की जो जानकारी पता है, उससे शुरू करें।"], ["इस स्थिति को समझें", "अदालती स्थिति का सरल अर्थ देखें।"], ["आदेश समझें", "मूल आदेश के साथ सरल व्याख्या पढ़ें।"], ["मामले के कागज़ व्यवस्थित करें", "वकीलों और कानूनी क्लर्कों के लिए द्वितीय कार्यस्थान।"]], professional: "कानूनी पेशेवरों के लिए" },
  };
  return copy[state.prefs.lang] || copy.en;
}
function supportPage() {
  const help = (text[state.prefs.lang] || text.en).help;
  const guide = helpGuideCopy();
  let matches = filteredHelpFaqs(),
    portal = matches.filter((item) => item.group === "portal"),
    court = matches.filter((item) => item.group === "court"),
    count = help.search.count.replace("{count}", String(matches.length));
  return `<section class="page help-page"><div class="head help-intro"><div class="help-boundary"><p class="kicker">${help.kicker}</p><h1>${help.heading}</h1><p>${help.intro}</p></div></div><section class="help-guide"><h2>${guide.heading}</h2><p>${guide.intro}</p><div class="help-guide-grid">${guide.items.map((item,index) => `<button type="button" class="help-guide-action ${index === 3 ? "professional" : ""}" ${index === 0 ? 'data-go="finder"' : index === 1 ? 'data-help-suggest="portal-status"' : index === 2 ? 'data-help-suggest="court-order"' : 'data-go="documents"'}><span>${icon(["search","circle-help","file-text","briefcase"][index])}</span><b>${item[0]}</b><small>${item[1]}</small>${index === 3 ? `<em>${guide.professional}</em>` : ""}</button>`).join("")}</div></section><div class="help-tools"><div class="help-search"><label for="help-search">${help.search.label}</label><input id="help-search" type="search" autocomplete="off" value="${escapeHelpHtml(state.helpQuery)}" placeholder="${help.search.placeholder}"><p class="help-count" id="help-count" aria-live="polite">${count}</p></div><section class="suggested-next" aria-labelledby="suggested-heading"><div class="suggestion-head"><h2 id="suggested-heading">${help.suggestions.heading}</h2><p class="suggestion-privacy">${help.suggestions.privacy}</p></div><div class="suggestion-row" id="help-suggestions">${helpSuggestionMarkup()}</div><span class="sr-only" id="help-suggestion-live" aria-live="polite"></span></section></div><nav class="help-services" aria-label="${help.services.label}">${helpServices.map((item) => `<a class="service-link" href="${item.url}" target="_blank" rel="noopener noreferrer">${help.services[item.key]}<span class="external-mark" aria-hidden="true">&#8599;</span><span class="sr-only"> ${tr("shared.externalLink.newTab")}</span></a>`).join("")}</nav>${matches.length ? `<div class="knowledge-grid"><section class="knowledge-base portal" aria-labelledby="portal-help-title"><p class="knowledge-label">${help.portal.label}</p><h2 id="portal-help-title">${help.portal.heading}</h2><p>${help.portal.intro}</p><div class="faq-list">${portal.map(helpFaq).join("")}</div></section><section class="knowledge-base court" aria-labelledby="court-help-title"><p class="knowledge-label">${help.practical.label}</p><h2 id="court-help-title">${help.practical.heading}</h2><p>${help.practical.intro}</p><div class="faq-list">${court.map(helpFaq).join("")}</div></section></div>` : `<section class="help-empty"><h2>${help.empty.heading}</h2><p>${help.empty.body}</p><button type="button" class="btn" data-action="clear-help-search">${help.empty.clear}</button></section>`}<p class="help-disclaimer"><b>${help.disclaimer}</b></p><p class="help-language-note">${help.translationNotice}</p></section>`;
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
function paperIntakeCopy() {
  const copy = {
    en: { kicker: "AI-assisted reading", heading: "Understand a Court Paper", intro: "Upload your court document and get a simple, plain-language explanation.", upload: "Choose File", camera: "Take a Photo", hint: "PDF, JPG or PNG, up to 10 MB", privacy: "Your paper is not saved in this browser. Connect the secure analysis service before using real case documents.", ready: "Ready for a paper", selected: "Selected paper", analyse: "Analyse paper", analysing: "Reading the paper…", unavailable: "Secure analysis is not connected yet", unavailableBody: "The interface is ready for the Cloudflare Worker. Until it is connected, no file leaves this device and no analysis is invented.", failed: "The paper could not be analysed", retry: "Check the file and try again. No result has been invented.", quality: "Before you analyse", checks: ["Include the full page and all edges", "Use clear light and avoid glare", "Handwriting will be marked for careful verification"], result: "Analysis will appear here", resultBody: "Extracted case details, important dates, a simple explanation and source references will stay together here.", output: ["Document type", "Case number and court", "Important dates and parties", "Plain-language explanation", "Checks and confidence"], labels: { type: "Document type", court: "Court", caseNumber: "Case number", dates: "Important dates", parties: "People and parties", explanation: "What it means", actions: "What to verify", sources: "Source references", confidence: "confidence" } },
    as: { kicker: "AI-সহায়িত পঢ়া", heading: "আদালতৰ কাগজ বুজক", intro: "জাননী, আদেশ বা আন মামলাৰ কাগজ আপলোড কৰক। সুৰক্ষিত বিশ্লেষণে মুখ্য তথ্য উলিয়াই সহজ ভাষাত ব্যাখ্যা আৰু যাচাই কৰিবলগীয়া অংশ দেখুৱাব।", upload: "কাগজ বাছক", camera: "ফটো তুলক", hint: "PDF, JPG বা PNG, ১০ MB লৈকে", privacy: "এই ব্ৰাউজাৰত কাগজ সংৰক্ষণ নহয়। বাস্তৱ নথি ব্যৱহাৰৰ আগতে সুৰক্ষিত বিশ্লেষণ সেৱা সংযোগ কৰক।", ready: "কাগজৰ বাবে সাজু", selected: "বাছনি কৰা কাগজ", analyse: "কাগজ বিশ্লেষণ কৰক", unavailable: "সুৰক্ষিত বিশ্লেষণ এতিয়াও সংযুক্ত নহয়", unavailableBody: "Cloudflare Worker-ৰ বাবে ইণ্টাৰফেচ সাজু। সংযোগ নোহোৱালৈকে ফাইল ডিভাইচৰ বাহিৰলৈ নাযায় আৰু কোনো ভুৱা ফল নেদেখুৱায়।", quality: "বিশ্লেষণৰ আগতে", checks: ["সম্পূৰ্ণ পৃষ্ঠা আৰু সকলো কাষ অন্তৰ্ভুক্ত কৰক", "স্পষ্ট পোহৰ ব্যৱহাৰ কৰক আৰু চকচকনি এৰক", "হাতৰ লেখা সাৱধানে যাচাই কৰিবলৈ চিহ্নিত হ'ব"], result: "বিশ্লেষণ ইয়াত দেখা যাব", resultBody: "মামলাৰ তথ্য, গুৰুত্বপূৰ্ণ তাৰিখ, সহজ ব্যাখ্যা আৰু উৎসৰ উল্লেখ একেলগে থাকিব।", output: ["নথিৰ ধৰণ", "মামলা নম্বৰ আৰু আদালত", "গুৰুত্বপূৰ্ণ তাৰিখ আৰু পক্ষ", "সহজ ভাষাৰ ব্যাখ্যা", "যাচাই আৰু বিশ্বাসযোগ্যতা"] },
    hi: { kicker: "AI-सहायित पढ़ाई", heading: "अदालती कागज़ समझें", intro: "नोटिस, आदेश या अन्य केस पेपर अपलोड करें। सुरक्षित विश्लेषण मुख्य जानकारी निकालेगा, सरल भाषा में समझाएगा और जाँचने योग्य बातें दिखाएगा।", upload: "कागज़ चुनें", camera: "फ़ोटो लें", hint: "PDF, JPG या PNG, अधिकतम 10 MB", privacy: "यह कागज़ इस ब्राउज़र में सहेजा नहीं जाता। असली केस दस्तावेज़ इस्तेमाल करने से पहले सुरक्षित विश्लेषण सेवा जोड़ें।", ready: "कागज़ के लिए तैयार", selected: "चुना हुआ कागज़", analyse: "कागज़ का विश्लेषण करें", unavailable: "सुरक्षित विश्लेषण अभी जुड़ा नहीं है", unavailableBody: "इंटरफ़ेस Cloudflare Worker के लिए तैयार है। उसके जुड़ने तक फ़ाइल इस डिवाइस से बाहर नहीं जाती और कोई बनावटी विश्लेषण नहीं दिखाया जाता।", quality: "विश्लेषण से पहले", checks: ["पूरा पृष्ठ और सभी किनारे शामिल करें", "साफ़ रोशनी रखें और चमक से बचें", "हस्तलिखित जानकारी सावधानी से जाँचने के लिए चिन्हित होगी"], result: "विश्लेषण यहाँ दिखाई देगा", resultBody: "निकली हुई केस जानकारी, जरूरी तारीखें, सरल व्याख्या और स्रोत संदर्भ एक साथ दिखेंगे।", output: ["दस्तावेज़ का प्रकार", "केस नंबर और अदालत", "जरूरी तारीखें और पक्ष", "सरल भाषा में अर्थ", "जाँच और विश्वसनीयता"] },
  };
  copy.en.retryButton = "Try again";
  copy.en.notFound = "Not found";
  copy.en.status = { ready: "Ready for a paper", selected: "Paper selected", queued: "Waiting to start", processing: "Reading the paper", checking: "Checking extracted details", success: "Analysis ready", error: "Analysis could not be completed" };
  copy.en.labels = { ...copy.en.labels };
  copy.en.match = { exact: "Matching sample case", ambiguous: "More than one sample case may fit", none: "No matching sample case", open: "Open matched case", review: "Add selected details to case", choose: "Review this candidate", disclosure: "Sample data - hackathon prototype. This is not live citizen data.", noMatch: "No matching sample case was found. No case has been opened or changed.", enrichmentHeading: "Update missing case details", enrichmentBoundary: "Compare extracted details with this sample record. Add only details you select; conflicts need review and do not change the record.", newDetails: "New details found", alreadyPresent: "Already present", needsVerification: "Needs verification", noMissing: "No missing details were found in this paper.", add: "Add to case", selected: "Selected to add", added: "Added to this session", reviewConflict: "Review before adding", presentValue: "In case", conflictValue: "Existing record", source: "Source" };
  copy.en.context = { kicker: "From scanned paper · prototype analysis", heading: "Document review", boundary: "This is extracted prototype analysis for review. It is separate from the sample case record and must be checked against an official court source.", provenance: "Added from scanned paper · prototype analysis" };
  copy.as.retryButton = "আকৌ চেষ্টা কৰক";
  copy.as.notFound = "পোৱা নগ'ল";
  copy.as.status = { ready: "কাগজৰ বাবে সাজু", selected: "কাগজ বাছনি কৰা হৈছে", queued: "আৰম্ভ কৰিবলৈ অপেক্ষা কৰি আছে", processing: "কাগজ পঢ়ি থকা হৈছে", checking: "উলিওৱা তথ্য পৰীক্ষা কৰি আছে", success: "বিশ্লেষণ সাজু", error: "বিশ্লেষণ সম্পূৰ্ণ নহ'ল" };
  copy.as.analysing = "কাগজ পঢ়ি থকা হৈছে…";
  copy.as.failed = "কাগজখন বিশ্লেষণ কৰিব পৰা নগ'ল";
  copy.as.retry = "ফাইলটো পৰীক্ষা কৰি আকৌ চেষ্টা কৰক। কোনো ফল সাজি দেখুওৱা হোৱা নাই।";
  copy.as.labels = { type: "নথিৰ ধৰণ", court: "আদালত", caseNumber: "মামলাৰ নম্বৰ", dates: "গুৰুত্বপূৰ্ণ তাৰিখ", parties: "ব্যক্তি আৰু পক্ষসমূহ", explanation: "ইয়াৰ অৰ্থ", actions: "কি পৰীক্ষা কৰিব", sources: "উৎসৰ উল্লেখ", confidence: "বিশ্বাসযোগ্যতা" };
  copy.as.match = { enrichmentHeading: "অনুপস্থিত মামলাৰ তথ্য আপডেট কৰক", newDetails: "নতুন তথ্য পোৱা গ'ল", alreadyPresent: "আগতে আছে", needsVerification: "যাচাইৰ প্ৰয়োজন", noMissing: "এই কাগজত কোনো অনুপস্থিত তথ্য পোৱা নগ'ল", add: "মামলাত যোগ কৰক", selected: "যোগ কৰিবলৈ বাছনি কৰা হৈছে", added: "এই অধিৱেশনত যোগ কৰা হৈছে", reviewConflict: "যোগ কৰাৰ আগতে পৰ্যালোচনা কৰক" };
  copy.as.context = { kicker: "স্কেন কৰা কাগজৰ পৰা · প্ৰট'টাইপ বিশ্লেষণ", heading: "নথি পৰ্যালোচনা", boundary: "এইটো পৰ্যালোচনাৰ বাবে উলিওৱা প্ৰট'টাইপ বিশ্লেষণ। ই নমুনা মামলাৰ ৰেকৰ্ডৰ পৰা পৃথক আৰু চৰকাৰী আদালতৰ উৎসৰ সৈতে পৰীক্ষা কৰিব লাগিব।", provenance: "স্কেন কৰা কাগজৰ পৰা · প্ৰট'টাইপ বিশ্লেষণ" };
  copy.hi.retryButton = "फिर कोशिश करें";
  copy.hi.notFound = "नहीं मिला";
  copy.hi.status = { ready: "कागज़ के लिए तैयार", selected: "कागज़ चुना गया", queued: "शुरू होने की प्रतीक्षा", processing: "कागज़ पढ़ा जा रहा है", checking: "निकाली गई जानकारी जाँची जा रही है", success: "विश्लेषण तैयार", error: "विश्लेषण पूरा नहीं हो सका" };
  copy.hi.analysing = "कागज़ पढ़ा जा रहा है…";
  copy.hi.failed = "कागज़ का विश्लेषण पूरा नहीं हो सका";
  copy.hi.retry = "फ़ाइल जाँचकर फिर कोशिश करें। कोई परिणाम गढ़कर नहीं दिखाया गया है।";
  copy.hi.labels = { type: "दस्तावेज़ का प्रकार", court: "अदालत", caseNumber: "केस नंबर", dates: "ज़रूरी तारीखें", parties: "लोग और पक्ष", explanation: "इसका अर्थ", actions: "क्या जाँचें", sources: "स्रोत संदर्भ", confidence: "विश्वसनीयता" };
  copy.hi.match = { enrichmentHeading: "मामले की छूटी जानकारी अपडेट करें", newDetails: "नई जानकारी मिली", alreadyPresent: "पहले से मौजूद", needsVerification: "जाँच ज़रूरी", noMissing: "इस कागज़ में कोई छूटी जानकारी नहीं मिली", add: "मामले में जोड़ें", selected: "जोड़ने के लिए चुना", added: "इस सत्र में जोड़ा गया", reviewConflict: "जोड़ने से पहले जाँचें" };
  copy.hi.context = { kicker: "स्कैन किए कागज़ से · प्रोटोटाइप विश्लेषण", heading: "दस्तावेज़ समीक्षा", boundary: "यह समीक्षा के लिए निकाला गया प्रोटोटाइप विश्लेषण है। यह नमूना मामले के रिकॉर्ड से अलग है और आधिकारिक अदालत स्रोत से जाँचा जाना चाहिए।", provenance: "स्कैन किए कागज़ से · प्रोटोटाइप विश्लेषण" };
  copy.en.scannerTeaser = { kicker: "Prototype feature · sample analysis only", heading: "Understand a court paper", body: "Scan an order, notice, or case document and see important details in plain language.", action: "Try the paper scanner" };
  copy.as.scannerTeaser = { kicker: "প্ৰট'টাইপ সুবিধা · নমুনা বিশ্লেষণ মাত্ৰ", heading: "আদালতৰ কাগজ বুজি লওক", body: "আদেশ, জাননী বা মামলাৰ কাগজ স্কেন কৰি গুৰুত্বপূৰ্ণ তথ্য সহজ ভাষাত চাওক।", action: "কাগজ স্কেনাৰ চেষ্টা কৰক" };
  copy.hi.scannerTeaser = { kicker: "प्रोटोटाइप सुविधा · केवल नमूना विश्लेषण", heading: "अदालती कागज़ समझें", body: "आदेश, नोटिस या मामले का दस्तावेज़ स्कैन करके ज़रूरी जानकारी आसान भाषा में देखें।", action: "पेपर स्कैनर आज़माएँ" };
  const localized = copy[state.prefs.lang] || copy.en;
  return { ...copy.en, ...localized, labels: { ...copy.en.labels, ...(localized.labels || {}) }, match: { ...copy.en.match, ...(localized.match || {}) }, context: { ...copy.en.context, ...(localized.context || {}) }, scannerTeaser: { ...copy.en.scannerTeaser, ...(localized.scannerTeaser || {}) } };
}
function paperScanBusy() {
  return ["queued", "processing", "checking"].includes(state.paperScan?.status);
}
function paperScanStatusLabel() {
  const status = paperIntakeCopy().status;
  return status[state.paperScan?.status] || status.ready;
}
function paperScanFileDetails() {
  if (!state.paperScan?.fileName) return "";
  return `${escapeHelpHtml(state.paperScan.fileName)} · ${(state.paperScan.fileSize / 1024 / 1024).toFixed(1)} MB`;
}
function syncPaperScanUi() {
  const busy = paperScanBusy();
  const hasValidFile = Boolean(selectedPaperFile);
  const status = document.getElementById("paper-analysis-status");
  const selection = document.getElementById("paper-selection");
  const analyse = document.querySelector(".paper-analyse");
  document.querySelectorAll("#paper-upload, #paper-camera").forEach((input) => { input.disabled = busy; });
  if (analyse) {
    analyse.disabled = !hasValidFile || busy;
    analyse.setAttribute("aria-busy", String(busy));
  }
  if (status) {
    status.classList.toggle("is-busy", busy);
    status.classList.toggle("is-success", state.paperScan.status === "success");
    status.classList.toggle("is-error", state.paperScan.status === "error");
    status.setAttribute("aria-busy", String(busy));
    status.innerHTML = `<b>${paperScanStatusLabel()}</b>${paperScanFileDetails() ? `<span>${paperScanFileDetails()}</span>` : ""}`;
  }
  if (selection) selection.classList.toggle("invalid", state.paperScan.error === "invalid" || (state.paperScan.status === "error" && !selectedPaperFile));
}
function setPaperScanStatus(status, error = "") {
  state.paperScan.status = status;
  state.paperScan.error = error;
  syncPaperScanUi();
}
function invalidatePaperScanRequest() {
  if (!paperScanBusy()) return;
  state.paperScan.requestId += 1;
  setPaperScanStatus(selectedPaperFile ? "selected" : "ready");
}
function paperRetryMarkup() {
  return `<button type="button" class="btn secondary paper-retry" data-action="retry-paper">${paperIntakeCopy().retryButton}</button>`;
}
function sanitizePaperAnalysis(data) {
  const textValue = (value) => String(value ?? "");
  const list = (value) => Array.isArray(value) ? value.map(textValue).filter(Boolean) : [];
  const facts = (value) => Array.isArray(value) ? value.map((item) => ({ label: textValue(item?.label), value: textValue(item?.value), role: textValue(item?.role), name: textValue(item?.name), confidence: textValue(item?.confidence) })) : [];
  return { document_type: textValue(data?.document_type), court: textValue(data?.court), case_number: textValue(data?.case_number), dates: facts(data?.dates), parties: facts(data?.parties), plain_language_summary: textValue(data?.plain_language_summary), verification_items: list(data?.verification_items), sources: list(data?.sources), confidence: textValue(data?.confidence) };
}
function normalizedPaperValue(value) {
  return String(value ?? "").normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, "").trim();
}
function paperEnrichmentRows(analysis, record) {
  if (!analysis || !record) return [];
  const rows = [];
  const add = (fieldKey, label, extracted, existing, confidence, source) => {
    const extractedValue = String(extracted ?? "").trim();
    if (!extractedValue) return;
    const existingValue = String(existing ?? "").trim();
    const status = !existingValue ? "new" : normalizedPaperValue(extractedValue) === normalizedPaperValue(existingValue) ? "existing" : "conflict";
    rows.push({ fieldKey, label, extracted: extractedValue, existing: existingValue, status, source: source || "Scanned paper", confidence: confidence || analysis.confidence || "not stated" });
  };
  const caseNumber = String(analysis.case_number || "").trim();
  if (caseNumber) {
    const existing = [record.caseNo, record.cnr].find((value) => normalizedPaperValue(value) === normalizedPaperValue(caseNumber)) || `${record.caseNo} / ${record.cnr}`;
    add("case_number", paperIntakeCopy().labels.caseNumber, caseNumber, existing, analysis.confidence, analysis.sources?.[0]);
  }
  add("document_type", paperIntakeCopy().labels.type, analysis.document_type, record.type, analysis.confidence, analysis.sources?.[0]);
  add("court", paperIntakeCopy().labels.court, analysis.court, record.court, analysis.confidence, analysis.sources?.[0]);
  (analysis.dates || []).forEach((item, index) => {
    const label = item.label || `${paperIntakeCopy().labels.dates} ${index + 1}`;
    const normalizedLabel = normalizedPaperValue(label);
    const existing = Object.entries(record.dates || {}).find(([key]) => normalizedPaperValue(key).includes(normalizedLabel) || normalizedLabel.includes(normalizedPaperValue(key)))?.[1] || "";
    add(`dates.${normalizedLabel || index}`, label, item.value, existing, item.confidence, analysis.sources?.[0]);
  });
  (analysis.parties || []).forEach((item, index) => {
    const label = item.role || `${paperIntakeCopy().labels.parties} ${index + 1}`;
    const existing = (record.parties || []).find((party) => normalizedPaperValue(party) === normalizedPaperValue(item.name)) || "";
    add(`parties.${normalizedPaperValue(label) || index}`, label, item.name, existing, item.confidence, analysis.sources?.[0]);
  });
  return rows;
}
function paperEnrichmentMarkup(analysis, record) {
  const p = paperIntakeCopy();
  const rows = paperEnrichmentRows(analysis, record);
  if (!record) return "";
  const safe = (value) => escapeHelpHtml(value);
  const selected = new Set(state.paperScan.enrichment?.selected || []);
  const applied = new Set(state.paperScan.enrichment?.applied || []);
  const groups = [["new", p.match.newDetails, "new"], ["existing", p.match.alreadyPresent, "existing"], ["conflict", p.match.needsVerification, "conflict"]];
  const groupMarkup = groups.map(([status, heading, className]) => {
    const group = rows.filter((row) => row.status === status);
    if (!group.length) return "";
    return `<section class="enrichment-group enrichment-${className}"><h4>${safe(heading)}</h4><ul>${group.map((row) => `<li data-enrichment-key="${safe(row.fieldKey)}"><div><b>${safe(row.label)}</b><span>${safe(row.extracted)}</span>${row.status === "existing" ? `<small>${safe(p.match.presentValue)}: ${safe(row.existing)}</small>` : row.status === "conflict" ? `<small>${safe(p.match.conflictValue)}: ${safe(row.existing)}</small>` : `<small>${safe(p.match.source)}: ${safe(row.source)} · ${safe(row.confidence)}</small>`}</div>${row.status === "new" ? applied.has(row.fieldKey) ? `<span class="enrichment-added">${safe(p.match.added)}</span>` : `<button type="button" class="btn" aria-pressed="${selected.has(row.fieldKey)}" aria-label="${safe(`${p.match.add} ${row.label}`)}" data-action="add-enrichment" data-field-key="${safe(row.fieldKey)}">${safe(selected.has(row.fieldKey) ? p.match.selected : p.match.add)}</button>` : row.status === "conflict" ? `<span class="enrichment-review">${safe(p.match.reviewConflict)}</span>` : ""}</li>`).join("")}</ul></section>`;
  }).join("");
  const actionable = rows.some((row) => row.status !== "existing");
  return `<section class="paper-enrichment" aria-labelledby="paper-enrichment-title"><h3 id="paper-enrichment-title">${safe(p.match.enrichmentHeading)}</h3><p>${safe(p.match.enrichmentBoundary)}</p>${actionable ? groupMarkup : `<p class="enrichment-empty">${safe(p.match.noMissing)}</p>`}</section>`;
}
function matchedRecordForPaper() {
  const match = state.paperScan?.match;
  if (!match) return null;
  const id = match.kind === "exact" ? match.records?.[0]?.id : state.paperScan.selectedRecordId;
  return match.records?.find((record) => record.id === id) || null;
}
function paperMatchMarkup() {
  const p = paperIntakeCopy();
  const match = state.paperScan?.match;
  if (!match) return "";
  const safe = (value) => escapeHelpHtml(value);
  if (match.kind === "none") return `<section class="paper-match paper-match-none" aria-live="polite"><h3>${safe(p.match.none)}</h3><p>${safe(p.match.noMatch)}</p></section>`;
  const candidates = (match.records || []).map((record) => `<article class="paper-match-candidate"><h4>${safe(record.title)}</h4><p>${safe(record.court)} · ${safe(record.cnr)}</p><p class="sample-disclosure">${safe(p.match.disclosure)}</p><button type="button" class="btn" data-action="select-matched-case" data-record-id="${safe(record.id)}">${safe(p.match.choose)}</button></article>`).join("");
  const selected = matchedRecordForPaper();
  const actions = selected ? `<div class="paper-match-actions"><button type="button" class="btn" data-action="open-matched-case" data-record-id="${safe(selected.id)}">${safe(p.match.open)}</button><button type="button" class="btn primary" data-action="review-paper-apply" data-record-id="${safe(selected.id)}">${safe(p.match.review)}</button><button type="button" class="btn" data-action="add-dashboard-case" data-record-id="${safe(selected.id)}">Add to My case dashboard</button></div>${paperEnrichmentMarkup(state.paperScan.analysis, selected)}` : "";
  return `<section class="paper-match paper-match-${safe(match.kind)}" aria-live="polite"><h3>${safe(match.kind === "exact" ? p.match.exact : p.match.ambiguous)}</h3><p class="sample-disclosure">${safe(p.match.disclosure)}</p><div class="paper-match-candidates">${candidates}</div>${actions}</section>`;
}
function paperAnalysisMarkup(data) {
  const p = paperIntakeCopy();
  const safe = (value) => escapeHelpHtml(String(value || p.notFound));
  const rows = (items, formatter) => (items || []).map(formatter).join("") || `<li>${escapeHelpHtml(p.notFound)}</li>`;
  return `<span>${icon("file-text")}</span><h3>${safe(data.document_type)}</h3><div class="analysis-facts"><p><b>${p.labels.court}</b><span>${safe(data.court)}</span></p><p><b>${p.labels.caseNumber}</b><span>${safe(data.case_number)}</span></p></div><section><h4>${p.labels.dates}</h4><ul>${rows(data.dates, (item) => `<li><b>${safe(item.label)}</b>: ${safe(item.value)} <small>${safe(item.confidence)} ${p.labels.confidence}</small></li>`)}</ul></section><section><h4>${p.labels.parties}</h4><ul>${rows(data.parties, (item) => `<li><b>${safe(item.role)}</b>: ${safe(item.name)} <small>${safe(item.confidence)} ${p.labels.confidence}</small></li>`)}</ul></section><section><h4>${p.labels.explanation}</h4><p>${safe(data.plain_language_summary)}</p></section><section><h4>${p.labels.actions}</h4><ul>${rows(data.verification_items, (item) => `<li>${safe(item)}</li>`)}</ul></section><section><h4>${p.labels.sources}</h4><ul>${rows(data.sources, (item) => `<li>${safe(item)}</li>`)}</ul></section>${paperMatchMarkup()}`;
}
async function analyseSelectedPaper(control) {
  const p = paperIntakeCopy();
  const result = document.getElementById("paper-analysis-result");
  const endpoint = window.ECOURTS_CONFIG?.analysisEndpoint?.trim();
  if (!result || !selectedPaperFile || paperScanBusy()) return;
  const requestId = ++state.paperScan.requestId;
  const file = selectedPaperFile;
  const isCurrentResult = () => state.paperScan.requestId === requestId && result.isConnected && document.getElementById("paper-analysis-result") === result;
  const ensureCurrentResult = () => {
    if (isCurrentResult()) return true;
    if (state.paperScan.requestId === requestId) invalidatePaperScanRequest();
    return false;
  };
  state.paperScan.analysis = null;
  state.paperScan.match = null;
  state.paperScan.selectedRecordId = null;
  state.paperScan.applied = false;
  state.paperScan.enrichment = { selected: [], applied: [] };
  state.derivedCaseContext = null;
  setPaperScanStatus("queued");
  if (!endpoint) {
    setPaperScanStatus("error", "unavailable");
    result.classList.add("service-unavailable");
    result.innerHTML = `<span>${icon("lock")}</span><h3>${p.unavailable}</h3><p>${p.unavailableBody}</p>${paperRetryMarkup()}`;
    return;
  }
  document.querySelectorAll('.finder-page[data-finder-mode="paper"] .guided-steps li').forEach((li,i) => i === 1 ? li.setAttribute("aria-current","step") : li.removeAttribute("aria-current"));
  control.disabled = true;
  control.textContent = p.analysing;
  result.classList.remove("service-unavailable");
  result.setAttribute("aria-busy", "true");
  setPaperScanStatus("processing");
  try {
    const body = new FormData();
    body.append("paper", file);
    body.append("language", state.prefs.lang);
    const response = await fetch(endpoint, { method: "POST", body });
    const payload = await response.json();
    if (!response.ok || !payload.analysis) throw new Error(payload.error || "Analysis failed");
    if (!ensureCurrentResult()) return;
    setPaperScanStatus("checking");
    const data = sanitizePaperAnalysis(payload.analysis);
    latestPaperAnalysis = data;
    state.paperScan.analysis = data;
    state.paperScan.match = window.ECOURTS_CASE_REPOSITORY?.findMatches?.({ caseNumber: data.case_number, court: data.court, parties: data.parties }) || { kind: "none", records: [] };
    state.paperScan.selectedRecordId = null;
    assistantEvent("paper-analysis", { available: true });
    result.innerHTML = paperAnalysisMarkup(data);
    setPaperScanStatus("success");
    document.querySelectorAll('.finder-page[data-finder-mode="paper"] .guided-steps li').forEach((li,i) => i === 2 ? li.setAttribute("aria-current","step") : li.removeAttribute("aria-current"));
  } catch (error) {
    if (!ensureCurrentResult()) return;
    latestPaperAnalysis = null;
    state.paperScan.analysis = null;
    state.paperScan.match = null;
    state.paperScan.selectedRecordId = null;
    state.paperScan.applied = false;
    setPaperScanStatus("error", error?.message || "failed");
    document.querySelectorAll('.finder-page[data-finder-mode="paper"] .guided-steps li').forEach((li,i) => i === 0 ? li.setAttribute("aria-current","step") : li.removeAttribute("aria-current"));
    result.classList.add("service-unavailable");
    result.innerHTML = `<span>${icon("circle-help")}</span><h3>${p.failed}</h3><p>${p.retry}</p>${paperRetryMarkup()}`;
  } finally {
    if (!ensureCurrentResult()) return;
    result.removeAttribute("aria-busy");
    control.disabled = false;
    control.textContent = p.analyse;
    syncPaperScanUi();
    result.scrollIntoView({ behavior: state.prefs.reduce ? "auto" : "smooth", block: "nearest" });
  }
}
function paperIntakeMarkup() {
  const p = paperIntakeCopy();
  const g = guidedCopy();
  const busy = paperScanBusy();
  const selectedDetails = paperScanFileDetails();
  const selectionMarkup = selectedDetails ? `<b>${p.selected}</b><span>${selectedDetails}</span>` : `<b>${p.ready}</b>`;
  const analysisMarkup = state.paperScan.analysis ? paperAnalysisMarkup(state.paperScan.analysis) : "";
  return `<section class="paper-intake" aria-labelledby="paper-intake-title"><div class="paper-intake-copy"><h2 id="paper-intake-title">${p.heading}</h2><p>${p.intro}</p><div class="paper-upload-card"><div class="paper-dropzone"><span class="guided-icon">${icon("upload")}</span><h3>${g.uploadTitle}</h3><p class="paper-hint">${p.hint}</p><div class="paper-pickers"><label class="btn primary paper-picker">${p.upload}<input id="paper-upload" type="file" accept="application/pdf,image/jpeg,image/png"${busy ? " disabled" : ""}></label><span class="paper-or">${g.or}</span><label class="btn paper-picker">${icon("camera")} ${p.camera}<input id="paper-camera" type="file" accept="image/jpeg,image/png" capture="environment"${busy ? " disabled" : ""}></label></div><div class="paper-selection" id="paper-selection" aria-live="polite">${selectionMarkup}</div><div id="paper-analysis-status" class="paper-analysis-status ${busy ? "is-busy" : ""}" role="status" aria-live="polite" aria-atomic="true" aria-busy="${busy}"><b>${paperScanStatusLabel()}</b>${selectedDetails ? `<span>${selectedDetails}</span>` : ""}</div><button type="button" class="btn primary paper-analyse" data-action="analyse-paper" aria-busy="${busy}"${!selectedPaperFile || busy ? " disabled" : ""}>${p.analyse}</button></div></div><aside class="paper-benefits"><span class="guided-icon">${icon("file-text")}</span><div><h3>${g.benefits}</h3><ul>${g.benefitItems.map(item=>`<li>${icon("check")}${item}</li>`).join("")}</ul></div></aside><p class="paper-privacy">${icon("lock")}<span>${p.privacy}</span></p><aside class="guided-help"><div><b>${tr("shared.nav.help")}</b><p>${guidedCopy().guideText}</p><button class="text-link" data-go="help">${guidedCopy().guide} ${icon("arrow-right")}</button></div></aside><details class="paper-readiness"><summary>${p.quality}</summary><ul>${p.checks.map(item=>`<li>${item}</li>`).join("")}</ul></details><div class="paper-result" id="paper-analysis-result" aria-live="polite">${analysisMarkup}</div></div></section>`;
}
function documentStudio() {
  const documents = (text[state.prefs.lang] || text.en).documents;
  const lawyer = lawyerSessionCopy();
  const templates = localizedDocumentTemplates();
  let def = templates[state.docTemplate] || templates.legalAid;
  if (!templates[state.docTemplate]) state.docTemplate = "legalAid";
  const lawyerPanel = `<aside class="lawyer-workspace-panel" aria-labelledby="lawyer-workspace-title"><p class="kicker">${lawyer.workspace}</p><h2 id="lawyer-workspace-title">${state.lawyerSession ? lawyer.badge : lawyer.entry}</h2><p>${state.lawyerSession ? lawyer.workspaceBody : lawyer.intro}</p><p class="prototype-boundary">${lawyer.boundary}</p>${state.lawyerSession ? `<button type="button" class="btn" data-action="lawyer-signout">${lawyer.signout}</button>` : `<button type="button" class="btn" data-action="advocate-entry">${lawyer.entry}</button>`}</aside>`;
  const dashboardPanel = `<section class="citizen-dashboard-panel" aria-labelledby="citizen-dashboard-title"><div><p class="kicker">Sample/demo dashboard</p><h2 id="citizen-dashboard-title">My case dashboard</h2><p>Cases saved here are available only during this browser session. No account is required, and this is not a live court record.</p></div>${state.dashboardCases?.length ? `<div class="dashboard-case-list">${state.dashboardCases.map((id) => { const record = window.ECOURTS_CASE_REPOSITORY?.records?.find((item) => item.id === id); return record ? `<article class="dashboard-case"><div><b>${escapeHelpHtml(record.title)}</b><span>${escapeHelpHtml(record.court)} · ${escapeHelpHtml(record.cnr)}</span><small>Sample data — hackathon prototype.</small></div><button type="button" class="btn" data-action="open-dashboard-case" data-record-id="${escapeHelpHtml(record.id)}">Open case</button></article>` : ""; }).join("")}</div>` : `<div class="dashboard-empty"><b>No saved sample cases yet</b><span>Find a case or scan a paper to add one here for this session.</span></div>`}</section>`;
  return `<section class="page documents-page"><div class="head"><div><p class="kicker">${documents.kicker}</p><h1>${documents.heading}</h1><p>${documents.intro}</p></div>${still("visual-documents.jpg", documents.stillAlt)}</div><div class="workspace-paths">${dashboardPanel}${lawyerPanel}</div>${paperIntakeMarkup()}<div class="privacy-note"><b>${documents.privacy}</b></div><p class="pdf-boundary">${documents.pdfBoundary.notice}</p><div class="doc-studio"><aside class="template-list" aria-label="${documents.templateListLabel}">${Object.values(
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
function wrapCanvasLine(context, value, maxWidth) {
  let clean = String(value).replace(/\s+/g, " ").trim();
  if (!clean) return [""];
  let output = [],
    line = "";
  for (const word of clean.split(" ")) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) output.push(line);
    line = "";
    let segment = "";
    for (const character of [...word]) {
      if (context.measureText(segment + character).width <= maxWidth)
        segment += character;
      else {
        if (segment) output.push(segment);
        segment = character;
      }
    }
    line = segment;
  }
  if (line) output.push(line);
  return output;
}
function joinBytes(parts) {
  const size = parts.reduce((total, part) => total + part.length, 0),
    joined = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    joined.set(part, offset);
    offset += part.length;
  }
  return joined;
}
function createUnicodePdfBlob(title, sourceLines) {
  const encoder = new TextEncoder(),
    canvas = document.createElement("canvas"),
    context = canvas.getContext("2d"),
    width = 1240,
    height = 1754,
    margin = 96;
  canvas.width = width;
  canvas.height = height;
  context.font = '28px "Noto Sans", "Nirmala UI", sans-serif';
  const lines = [
    ...sourceLines,
    "",
    "Generated locally in this browser. Review every fact before use.",
  ].flatMap((line) => wrapCanvasLine(context, line, width - margin * 2));
  const pageLines = [];
  while (lines.length) pageLines.push(lines.splice(0, 29));
  const images = pageLines.map((page, pageIndex) => {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#10392f";
    context.fillRect(margin, 90, width - margin * 2, 8);
    context.font = 'bold 34px "Noto Sans", "Nirmala UI", sans-serif';
    context.fillText(title, margin, 158, width - margin * 2);
    context.font = 'bold 21px "Noto Sans", "Nirmala UI", sans-serif';
    context.fillText("DRAFT - REVIEW BEFORE USE", margin, 205);
    context.fillStyle = "#202622";
    context.font = '28px "Noto Sans", "Nirmala UI", sans-serif';
    page.forEach((line, index) => context.fillText(line, margin, 275 + index * 43));
    context.fillStyle = "#59615c";
    context.font = '19px "Noto Sans", "Nirmala UI", sans-serif';
    context.fillText(
      `Independent eCourts hackathon prototype - Not legal advice, not filed - Page ${pageIndex + 1} of ${pageLines.length}`,
      margin,
      height - 58,
      width - margin * 2,
    );
    const binary = atob(canvas.toDataURL("image/jpeg", 0.9).split(",")[1]),
      bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++)
      bytes[index] = binary.charCodeAt(index);
    return bytes;
  });
  const objects = new Map(),
    kids = [];
  objects.set(1, encoder.encode("<< /Type /Catalog /Pages 2 0 R >>"));
  images.forEach((image, index) => {
    const pageNo = 3 + index * 3,
      contentNo = pageNo + 1,
      imageNo = pageNo + 2,
      content = encoder.encode("q 595 0 0 842 0 0 cm /Im0 Do Q");
    kids.push(`${pageNo} 0 R`);
    objects.set(
      pageNo,
      encoder.encode(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${imageNo} 0 R >> >> /Contents ${contentNo} 0 R >>`,
      ),
    );
    objects.set(
      contentNo,
      joinBytes([
        encoder.encode(`<< /Length ${content.length} >>\nstream\n`),
        content,
        encoder.encode("\nendstream"),
      ]),
    );
    objects.set(
      imageNo,
      joinBytes([
        encoder.encode(
          `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`,
        ),
        image,
        encoder.encode("\nendstream"),
      ]),
    );
  });
  objects.set(
    2,
    encoder.encode(
      `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${images.length} >>`,
    ),
  );
  const parts = [encoder.encode("%PDF-1.4\n% eCourts Unicode local draft\n")],
    offsets = [0],
    max = Math.max(...objects.keys());
  let length = parts[0].length;
  for (let index = 1; index <= max; index++) {
    const object = joinBytes([
      encoder.encode(`${index} 0 obj\n`),
      objects.get(index),
      encoder.encode("\nendobj\n"),
    ]);
    offsets[index] = length;
    parts.push(object);
    length += object.length;
  }
  const xref = length;
  let trailer = `xref\n0 ${max + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= max; index++)
    trailer += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  trailer += `trailer\n<< /Size ${max + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  parts.push(encoder.encode(trailer));
  return new Blob(parts, { type: "application/pdf" });
}
function createPdfBlob(title, sourceLines) {
  if (sourceLines.some((line) => /[^\x00-\x7F]/.test(line)))
    return createUnicodePdfBlob(title, sourceLines);
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
function localizedCopy() {
  const copies = {
    en: {
      journey: ["Find case", "Understand", "Next action", "Prepare", "Official service"],
      tour: [["Begin with one detail", "Use a CNR, case number, party name, or court paper."], ["Read in layers", "Keep the court record, plain-language explanation, and checks separate."], ["Prepare, then verify", "Gather likely papers and continue to the responsible official service."]],
      next: "Next", skip: "Skip tour", finish: "Start finding a case", tourLabel: "First-time guide", voice: "Speak your search", listening: "Listening...", unsupported: "Voice input is not supported in this browser.",
      whatsapp: { button: "WhatsApp updates", buttonCopy: "Preview consent-based case reminders.", kicker: "Feature preview", heading: "Case updates on WhatsApp", intro: "This simulated preview shows how registered users could receive concise updates after giving consent.", previewLabel: "Simulated WhatsApp conversation", simulation: "Simulation - not connected", update: "Sample case update", message: "Next listed date: 14 September 2026. Keep the property papers named in the order ready and verify attendance in the official record.", status: "View status", checklist: "Preparation list", consent: "Updates begin only after clear consent and registration.", stop: "A user can stop messages at any time.", noData: "No real phone number or case data is sent in this prototype.", done: "Close preview" },
      prep: { kicker: "Stage 4 of 5", heading: "Prepare for the next step", intro: "Choose how you are involved to see a common preparation list. The order and official court record remain authoritative.", roles: { party: "Civil party", complainant: "Complainant", accused: "Accused", witness: "Witness" }, common: "For everyone", commonItems: ["Read the complete order or notice", "Match the court, case number and next date", "Keep identity and previously served papers together"], roleItems: { party: ["Organise documents referred to in the order", "Confirm whether originals or copies are expected"], complainant: ["Keep the complaint or FIR reference available", "Organise supporting records without altering originals"], accused: ["Keep bail and representation papers available, if applicable", "Confirm appearance requirements with counsel or the court"], witness: ["Keep the summons and identity document available", "Do not rehearse or alter the account of events"] }, caution: "These are common preparation prompts, not findings that an item is mandatory in your case.", reminder: "Add preparation reminder", documents: "Open document studio", help: "Get legal help", official: "Continue to official services" },
    },
    as: {
      journey: ["মামলা বিচাৰক", "বুজক", "পৰৱৰ্তী কাম", "প্ৰস্তুতি", "চৰকাৰী সেৱা"],
      tour: [["এটা তথ্যৰে আৰম্ভ কৰক", "CNR, মামলা নম্বৰ, পক্ষৰ নাম বা আদালতৰ কাগজ ব্যৱহাৰ কৰক।"], ["স্তৰ অনুসৰি পঢ়ক", "আদালতৰ ৰেকৰ্ড, সহজ ব্যাখ্যা আৰু যাচাই পৃথক ৰাখক।"], ["সাজু হৈ যাচাই কৰক", "সম্ভাৱ্য কাগজ গোটাই দায়বদ্ধ চৰকাৰী সেৱালৈ যাওক।"]],
      next: "পৰৱৰ্তী", skip: "নিৰ্দেশনা এৰক", finish: "মামলা বিচৰা আৰম্ভ কৰক", tourLabel: "প্ৰথম ব্যৱহাৰৰ নিৰ্দেশনা", voice: "কথা কৈ সন্ধান কৰক", listening: "শুনি আছোঁ...", unsupported: "এই ব্ৰাউজাৰত কণ্ঠ ইনপুট সমৰ্থিত নহয়।",
      whatsapp: { button: "WhatsApp আপডেট", buttonCopy: "সন্মতি-ভিত্তিক সোঁৱৰণীৰ পূৰ্বদৰ্শন।", kicker: "সুবিধাৰ পূৰ্বদৰ্শন", heading: "WhatsApp-ত মামলাৰ আপডেট", intro: "এই অনুকৰণে সন্মতিৰ পিছত পঞ্জীয়নভুক্ত ব্যৱহাৰকাৰীয়ে কেনেকৈ চমু আপডেট পাব পাৰে দেখুৱায়।", previewLabel: "অনুকৰণ কৰা WhatsApp কথোপকথন", simulation: "অনুকৰণ - সংযোগ নাই", update: "নমুনা মামলাৰ আপডেট", message: "পৰৱৰ্তী তালিকাভুক্ত তাৰিখ: ১৪ ছেপ্টেম্বৰ ২০২৬। আদেশত উল্লেখ কৰা সম্পত্তিৰ কাগজ সাজু ৰাখক আৰু চৰকাৰী ৰেকৰ্ডত উপস্থিতি যাচাই কৰক।", status: "অৱস্থা চাওক", checklist: "প্ৰস্তুতি তালিকা", consent: "স্পষ্ট সন্মতি আৰু পঞ্জীয়নৰ পিছতহে আপডেট আৰম্ভ হয়।", stop: "ব্যৱহাৰকাৰীয়ে যিকোনো সময়তে বাৰ্তা বন্ধ কৰিব পাৰে।", noData: "এই প্ৰট'টাইপে কোনো বাস্তৱ ফোন নম্বৰ বা মামলাৰ তথ্য নপঠায়।", done: "পূৰ্বদৰ্শন বন্ধ কৰক" },
      prep: { kicker: "৫টা স্তৰৰ ৪ৰ্থ", heading: "পৰৱৰ্তী পদক্ষেপৰ বাবে সাজু হওক", intro: "সাধাৰণ প্ৰস্তুতি তালিকা চাবলৈ আপোনাৰ ভূমিকা বাছক। আদেশ আৰু চৰকাৰী আদালত ৰেকৰ্ডেই প্ৰামাণিক।", roles: { party: "দেৱানী পক্ষ", complainant: "অভিযোগকাৰী", accused: "অভিযুক্ত", witness: "সাক্ষী" }, common: "সকলোৰে বাবে", commonItems: ["সম্পূৰ্ণ আদেশ বা জাননী পঢ়ক", "আদালত, মামলা নম্বৰ আৰু পৰৱৰ্তী তাৰিখ মিলাওক", "পৰিচয় আৰু আগতে দিয়া কাগজ একেলগে ৰাখক"], roleItems: { party: ["আদেশত উল্লেখ কৰা নথি ক্ৰমত ৰাখক", "মূল নে প্ৰতিলিপি লাগিব নিশ্চিত কৰক"], complainant: ["অভিযোগ বা FIR উল্লেখ সাজু ৰাখক", "মূল নথি সলনি নকৰাকৈ সহায়ক ৰেকৰ্ড ৰাখক"], accused: ["প্ৰযোজ্য হ'লে জামিন আৰু প্ৰতিনিধিত্বৰ কাগজ ৰাখক", "উপস্থিতিৰ প্ৰয়োজন আদালত বা অধিবক্তাৰ সৈতে নিশ্চিত কৰক"], witness: ["চমন আৰু পৰিচয় নথি ৰাখক", "ঘটনাৰ বিৱৰণ অভ্যাস বা সলনি নকৰিব"] }, caution: "এইবোৰ সাধাৰণ প্ৰস্তুতিৰ সংকেত; আপোনাৰ মামলাত বাধ্যতামূলক বুলি সিদ্ধান্ত নহয়।", reminder: "প্ৰস্তুতি সোঁৱৰণী যোগ কৰক", documents: "নথি ষ্টুডিঅ' খোলক", help: "আইনী সহায় লওক", official: "চৰকাৰী সেৱালৈ যাওক" },
    },
    hi: {
      journey: ["मामला खोजें", "समझें", "अगला कदम", "तैयारी", "आधिकारिक सेवा"],
      tour: [["एक विवरण से शुरू करें", "CNR, मामला नंबर, पक्षकार का नाम या अदालती कागज़ उपयोग करें।"], ["परतों में पढ़ें", "अदालती रिकॉर्ड, सरल व्याख्या और जाँच को अलग रखें।"], ["तैयार करें, फिर सत्यापित करें", "संभावित कागज़ जुटाएँ और जिम्मेदार आधिकारिक सेवा पर जाएँ।"]],
      next: "आगे", skip: "दौरा छोड़ें", finish: "मामला खोजना शुरू करें", tourLabel: "पहली बार मार्गदर्शन", voice: "बोलकर खोजें", listening: "सुन रहा है...", unsupported: "इस ब्राउज़र में आवाज़ इनपुट उपलब्ध नहीं है।",
      whatsapp: { button: "WhatsApp अपडेट", buttonCopy: "सहमति-आधारित रिमाइंडर का पूर्वावलोकन।", kicker: "सुविधा पूर्वावलोकन", heading: "WhatsApp पर मामला अपडेट", intro: "यह नकली पूर्वावलोकन दिखाता है कि सहमति के बाद पंजीकृत उपयोगकर्ता छोटे अपडेट कैसे पा सकते हैं।", previewLabel: "नकली WhatsApp बातचीत", simulation: "सिमुलेशन - जुड़ा नहीं है", update: "नमूना मामला अपडेट", message: "अगली सूचीबद्ध तारीख: 14 सितंबर 2026। आदेश में बताए संपत्ति कागज़ तैयार रखें और आधिकारिक रिकॉर्ड में उपस्थिति जाँचें।", status: "स्थिति देखें", checklist: "तैयारी सूची", consent: "स्पष्ट सहमति और पंजीकरण के बाद ही अपडेट शुरू होंगे।", stop: "उपयोगकर्ता किसी भी समय संदेश रोक सकता है।", noData: "इस प्रोटोटाइप में कोई वास्तविक फोन नंबर या मामला डेटा नहीं भेजा जाता।", done: "पूर्वावलोकन बंद करें" },
      prep: { kicker: "5 में से चरण 4", heading: "अगले कदम की तैयारी करें", intro: "सामान्य तैयारी सूची देखने के लिए अपनी भूमिका चुनें। आदेश और आधिकारिक अदालत रिकॉर्ड ही प्रामाणिक हैं।", roles: { party: "दीवानी पक्ष", complainant: "शिकायतकर्ता", accused: "आरोपी", witness: "गवाह" }, common: "सभी के लिए", commonItems: ["पूरा आदेश या नोटिस पढ़ें", "अदालत, मामला नंबर और अगली तारीख मिलाएँ", "पहचान और पहले मिले कागज़ साथ रखें"], roleItems: { party: ["आदेश में बताए दस्तावेज़ व्यवस्थित करें", "मूल या प्रतियाँ अपेक्षित हैं, यह जाँचें"], complainant: ["शिकायत या FIR संदर्भ तैयार रखें", "मूल बदले बिना सहायक रिकॉर्ड व्यवस्थित करें"], accused: ["लागू हो तो जमानत और प्रतिनिधित्व के कागज़ रखें", "उपस्थिति की जरूरत वकील या अदालत से पक्की करें"], witness: ["समन और पहचान दस्तावेज़ रखें", "घटनाओं का विवरण रटें या बदलें नहीं"] }, caution: "ये सामान्य तैयारी संकेत हैं; आपके मामले में किसी वस्तु के अनिवार्य होने का निष्कर्ष नहीं।", reminder: "तैयारी रिमाइंडर जोड़ें", documents: "दस्तावेज़ स्टूडियो खोलें", help: "कानूनी सहायता लें", official: "आधिकारिक सेवाओं पर जाएँ" },
    },
  };
  return copies[state.prefs.lang] || copies.en;
}
function journeyMarkup() {
  const labels = localizedCopy().journey;
  const stageIndex = { understand: 1, action: 2, prepare: 3 };
  const active = state.page === "finder" ? 0 : state.page === "case" ? stageIndex[state.caseStage] ?? 1 : state.page === "documents" || state.page === "help" ? 3 : state.page === "courts" ? 4 : -1;
  return `<nav class="journey-strip" aria-label="Citizen case journey">${labels.map((label, index) => { const stage = [null, "understand", "action", "prepare", null][index]; const attrs = stage ? `data-action="case-stage" data-stage="${stage}"` : `data-go="${index === 0 ? "finder" : "courts"}"`; return `<button type="button" ${attrs} class="${active === index ? "active" : active > index ? "complete" : ""}" ${stage && !state.selected ? "disabled" : ""} ${active === index ? 'aria-current="step"' : ""}><span>${active > index ? icon("check") : index + 1}</span><b>${label}</b></button>`; }).join("")}</nav>`;
}
function actionCopy() {
  const copies = {
    en: { kicker: "Stage 3 of 5", heading: "What this case appears to need next", basis: "Based on the displayed interim order and the ‘Documents and objections’ status", priority: "Document maker priority", high: "Prepare first", next: "Prepare next", optional: "Only if required", evidence: ["Evidence index", "List the property papers referred to in the order."], chronology: ["Case chronology", "Arrange important dates before the next hearing."], service: ["Proof of service", "Use only when service has been directed or completed."], online: "Process or verify online", onlineItems: ["Open the latest official case status and order", "Confirm attendance and the accepted filing format", "Check whether any newer direction changes this list"], offline: "Collect and keep ready offline", offlineItems: ["Complete copy of the interim order", "Title or sale deed and relevant property papers", "Tax or municipal receipts and earlier notices", "Photo identity document"], caution: "This priority is generated from the synthetic record shown here. Verify the exact requirement with the court record or a qualified lawyer.", open: "Open template", whatsapp: "Get updates on WhatsApp" },
    as: { kicker: "৫টা স্তৰৰ ৩য়", heading: "এই মামলাত পৰৱৰ্তী সময়ত কি লাগিব পাৰে", basis: "দেখুওৱা অন্তৱৰ্তী আদেশ আৰু ‘নথি আৰু আপত্তি’ অৱস্থাৰ ভিত্তিত", priority: "নথি প্ৰস্তুতৰ অগ্ৰাধিকাৰ", high: "আগতে প্ৰস্তুত কৰক", next: "তাৰ পিছত প্ৰস্তুত কৰক", optional: "প্ৰয়োজন হ'লেহে", evidence: ["প্ৰমাণ সূচী", "আদেশত উল্লেখ কৰা সম্পত্তিৰ কাগজ তালিকাভুক্ত কৰক।"], chronology: ["মামলাৰ কালক্ৰম", "পৰৱৰ্তী শুনানিৰ আগতে গুৰুত্বপূৰ্ণ তাৰিখ সজাওক।"], service: ["সেৱাৰ প্ৰমাণ", "সেৱাৰ নিৰ্দেশ দিয়া বা সম্পূৰ্ণ হ'লেহে ব্যৱহাৰ কৰক।"], online: "অনলাইনত প্ৰক্ৰিয়া বা যাচাই কৰক", onlineItems: ["শেহতীয়া চৰকাৰী মামলাৰ অৱস্থা আৰু আদেশ খোলক", "উপস্থিতি আৰু গ্ৰহণযোগ্য দাখিল পদ্ধতি নিশ্চিত কৰক", "নতুন নিৰ্দেশে এই তালিকা সলনি কৰিছে নেকি চাওক"], offline: "অফলাইনত গোটাই সাজু ৰাখক", offlineItems: ["অন্তৱৰ্তী আদেশৰ সম্পূৰ্ণ প্ৰতিলিপি", "স্বত্ব বা বিক্ৰী দলিল আৰু প্ৰাসংগিক সম্পত্তিৰ কাগজ", "কৰ বা পৌৰ ৰচিদ আৰু আগৰ জাননী", "ফটো পৰিচয় নথি"], caution: "এই অগ্ৰাধিকাৰ ইয়াত দেখুওৱা কৃত্ৰিম ৰেকৰ্ডৰ পৰা তৈয়াৰ কৰা। আদালতৰ ৰেকৰ্ড বা যোগ্য অধিবক্তাৰ সৈতে সঠিক প্ৰয়োজন যাচাই কৰক।", open: "টেমপ্লেট খোলক", whatsapp: "WhatsApp-ত আপডেট লওক" },
    hi: { kicker: "5 में से चरण 3", heading: "इस मामले में आगे क्या चाहिए हो सकता है", basis: "दिखाए गए अंतरिम आदेश और ‘दस्तावेज़ और आपत्तियाँ’ स्थिति के आधार पर", priority: "दस्तावेज़ बनाने की प्राथमिकता", high: "पहले तैयार करें", next: "इसके बाद तैयार करें", optional: "केवल आवश्यकता पर", evidence: ["साक्ष्य सूची", "आदेश में बताए संपत्ति के कागज़ सूचीबद्ध करें।"], chronology: ["मामले का घटनाक्रम", "अगली सुनवाई से पहले महत्वपूर्ण तारीखें क्रम में रखें।"], service: ["तामील का प्रमाण", "तामील का निर्देश या पूर्णता होने पर ही उपयोग करें।"], online: "ऑनलाइन प्रक्रिया या जाँच", onlineItems: ["नवीनतम आधिकारिक केस स्थिति और आदेश खोलें", "उपस्थिति और स्वीकार्य फाइलिंग प्रारूप की पुष्टि करें", "देखें कि किसी नए निर्देश ने यह सूची बदली है या नहीं"], offline: "ऑफलाइन जुटाकर तैयार रखें", offlineItems: ["अंतरिम आदेश की पूरी प्रति", "स्वामित्व या बिक्री विलेख और संबंधित संपत्ति कागज़", "कर या नगर निकाय रसीदें और पुराने नोटिस", "फोटो पहचान दस्तावेज़"], caution: "यह प्राथमिकता यहाँ दिखाए गए कृत्रिम रिकॉर्ड से बनी है। सही आवश्यकता अदालत रिकॉर्ड या योग्य वकील से जाँचें।", open: "टेम्पलेट खोलें", whatsapp: "WhatsApp पर अपडेट पाएँ" },
  };
  return copies[state.prefs.lang] || copies.en;
}
function repositoryActionCopy(record) {
  const language = state.prefs.lang;
  const nextDate = record.dates?.nextHearing || "a date not listed";
  const documentTitle = record.documents?.[0]?.title || "the listed documents";
  const localized = {
    en: {
      kicker: "Stage 3 of 5", heading: "Review the next step for this sample record", basis: `Based on the displayed ${record.type || "case"} status: ${record.status || "not listed"}`, priority: "Check first", high: "Confirm the status", next: "Check the listed date", optional: "Review the documents", evidence: ["Record status", `Confirm the displayed status with the official court record.`], chronology: ["Next listed date", `Check the date shown as ${nextDate} with the official court record.`], service: ["Listed document", `Review ${documentTitle} only as a prototype record reference.`], online: "Check with the official service", onlineItems: ["Open the official case status and order service", "Confirm the case number, court and next date", "Check whether a newer direction changes this information"], offline: "Keep your own papers ready", offlineItems: ["Keep the notice or order referred to in your papers", "Keep the case number and court details together", "Do not treat this sample record as proof of a filing or hearing"], caution: "This generic next-step view is based on a synthetic repository record. Verify the exact requirement with the official court record or a qualified lawyer.", open: "Open template", whatsapp: "Get updates on WhatsApp",
    },
    as: {
      kicker: "৫টা স্তৰৰ ৩য়", heading: "এই নমুনা ৰেকৰ্ডৰ পৰৱৰ্তী পদক্ষেপ পৰ্যালোচনা কৰক", basis: `দেখুওৱা ${record.type || "মামলা"} অৱস্থাৰ ভিত্তিত: ${record.status || "উল্লেখ নাই"}`, priority: "আগতে পৰীক্ষা কৰক", high: "অৱস্থা নিশ্চিত কৰক", next: "তালিকাভুক্ত তাৰিখ পৰীক্ষা কৰক", optional: "নথিসমূহ পৰ্যালোচনা কৰক", evidence: ["ৰেকৰ্ডৰ অৱস্থা", "দেখুওৱা অৱস্থা চৰকাৰী আদালতৰ ৰেকৰ্ডৰ সৈতে নিশ্চিত কৰক।"], chronology: ["পৰৱৰ্তী তালিকাভুক্ত তাৰিখ", `${nextDate} হিচাপে দেখুওৱা তাৰিখটো চৰকাৰী আদালতৰ ৰেকৰ্ডৰ সৈতে পৰীক্ষা কৰক।`], service: ["তালিকাভুক্ত নথি", `${documentTitle} কেৱল প্ৰট'টাইপ ৰেকৰ্ডৰ উল্লেখ হিচাপে পৰ্যালোচনা কৰক।`], online: "চৰকাৰী সেৱাৰ সৈতে পৰীক্ষা কৰক", onlineItems: ["চৰকাৰী মামলাৰ অৱস্থা আৰু আদেশ সেৱা খোলক", "মামলা নম্বৰ, আদালত আৰু পৰৱৰ্তী তাৰিখ নিশ্চিত কৰক", "নতুন নিৰ্দেশে এই তথ্য সলনি কৰিছে নেকি চাওক"], offline: "নিজৰ নথি সাজু ৰাখক", offlineItems: ["আপোনাৰ নথিত উল্লেখ কৰা জাননী বা আদেশ ৰাখক", "মামলা নম্বৰ আৰু আদালতৰ তথ্য একেলগে ৰাখক", "এই নমুনা ৰেকৰ্ডক দাখিল বা শুনানিৰ প্ৰমাণ বুলি নাভাবিব"], caution: "এই সাধাৰণ পৰৱৰ্তী পদক্ষেপটো কৃত্ৰিম ৰিপ'জিটৰী ৰেকৰ্ডৰ ওপৰত ভিত্তি কৰিছে। সঠিক প্ৰয়োজন চৰকাৰী আদালতৰ ৰেকৰ্ড বা যোগ্য অধিবক্তাৰ সৈতে নিশ্চিত কৰক।", open: "টেমপ্লেট খোলক", whatsapp: "WhatsApp-ত আপডেট লওক",
    },
    hi: {
      kicker: "5 में से चरण 3", heading: "इस नमूना रिकॉर्ड के अगले कदम की समीक्षा करें", basis: `दिखाई गई ${record.type || "मामला"} स्थिति के आधार पर: ${record.status || "उल्लेख नहीं है"}`, priority: "पहले जाँचें", high: "स्थिति पक्की करें", next: "सूचीबद्ध तारीख जाँचें", optional: "दस्तावेज़ देखें", evidence: ["रिकॉर्ड की स्थिति", "दिखाई गई स्थिति को आधिकारिक अदालत रिकॉर्ड से पक्का करें।"], chronology: ["अगली सूचीबद्ध तारीख", `${nextDate} दिखाई गई है; इसे आधिकारिक अदालत रिकॉर्ड से जाँचें।`], service: ["सूचीबद्ध दस्तावेज़", `${documentTitle} को केवल प्रोटोटाइप रिकॉर्ड संदर्भ के रूप में देखें।`], online: "आधिकारिक सेवा से जाँचें", onlineItems: ["आधिकारिक केस स्थिति और आदेश सेवा खोलें", "केस नंबर, अदालत और अगली तारीख पक्की करें", "जाँचें कि कोई नया निर्देश इस जानकारी को बदलता है या नहीं"], offline: "अपने कागज़ तैयार रखें", offlineItems: ["अपने कागज़ों में बताए नोटिस या आदेश को रखें", "केस नंबर और अदालत की जानकारी साथ रखें", "इस नमूना रिकॉर्ड को दाखिले या सुनवाई का प्रमाण न मानें"], caution: "यह सामान्य अगला कदम कृत्रिम रिपॉज़िटरी रिकॉर्ड पर आधारित है। सही आवश्यकता आधिकारिक अदालत रिकॉर्ड या योग्य वकील से जाँचें।", open: "टेम्पलेट खोलें", whatsapp: "WhatsApp पर अपडेट पाएँ",
    },
  };
  return localized[language] || localized.en;
}
function nextActionMarkup() {
  const record = selectedCaseRecord();
  const a = record ? repositoryActionCopy(record) : actionCopy();
  const html = (value) => escapeHelpHtml(value);
  const list = (items) => `<ul>${items.map((item) => `<li>${icon("check")}<span>${html(item)}</span></li>`).join("")}</ul>`;
  const priority = (level, item, template, iconName) => `<article class="priority-card"><span class="priority-label">${html(level)}</span><div class="priority-title">${icon(iconName)}<h3>${html(item[0])}</h3></div><p>${html(item[1])}</p><button type="button" class="btn" data-action="priority-template" data-template-target="${html(template)}">${html(a.open)}</button></article>`;
  return `<section class="block next-action-block" data-stage-panel="action" aria-labelledby="next-action-title"><p class="kicker">${html(a.kicker)}</p><h2 id="next-action-title">${html(a.heading)}</h2><p class="action-basis">${html(a.basis)}</p><h3 class="section-label">${html(a.priority)}</h3><div class="priority-grid">${priority(a.high, a.evidence, "evidence", "file-text")}${priority(a.next, a.chronology, "chronology", "calendar")}${priority(a.optional, a.service, "service", "check")}</div><div class="action-checklists"><div class="online-checklist"><h3><span>${icon("monitor")}</span>${html(a.online)}</h3>${list(a.onlineItems)}</div><div class="offline-checklist"><h3><span>${icon("folder")}</span>${html(a.offline)}</h3>${list(a.offlineItems)}</div></div><p class="prep-caution">${html(a.caution)}</p><button type="button" class="btn primary whatsapp-action" data-action="whatsapp">${icon("message")}${html(a.whatsapp)}</button></section>`;
}
function decorateCaseHeading(selector, iconName) {
  const heading = document.querySelector(`${selector} > h2`);
  if (heading && !heading.querySelector(".heading-icon"))
    heading.insertAdjacentHTML("afterbegin", `<span class="heading-icon">${icon(iconName)}</span>`);
}
function tourMarkup() {
  if (state.tourStep === null) return "";
  const copy = localizedCopy();
  const step = Math.max(0, Math.min(2, state.tourStep));
  const item = copy.tour[step];
  return `<aside class="first-tour" aria-label="${copy.tourLabel}"><img src="${asset(["icon-search.jpg", "icon-scale.jpg", "icon-file.jpg"][step])}" alt="" width="84" height="84"><div><p class="tour-count">${step + 1} / 3</p><h2>${item[0]}</h2><p>${item[1]}</p><div class="actions"><button type="button" class="btn primary" data-action="tour-next">${step === 2 ? copy.finish : copy.next}</button><button type="button" class="btn" data-action="tour-skip">${copy.skip}</button></div></div></aside>`;
}
function preparationMarkup() {
  const p = localizedCopy().prep;
  const roleItems = p.roleItems[state.caseRole] || p.roleItems.party;
  const list = (items) => `<ul>${items.map((item) => `<li>${icon("check")}<span>${item}</span></li>`).join("")}</ul>`;
  return `<section class="block preparation-block" aria-labelledby="preparation-title"><p class="kicker">${p.kicker}</p><h2 id="preparation-title">${p.heading}</h2><p>${p.intro}</p><div class="role-selector" role="group" aria-label="${p.heading}">${Object.entries(p.roles).map(([id, label]) => `<button type="button" data-action="case-role" data-role="${id}" class="${state.caseRole === id ? "active" : ""}">${label}</button>`).join("")}</div><div class="prep-columns"><div><h3>${p.common}</h3>${list(p.commonItems)}</div><div><h3>${p.roles[state.caseRole]}</h3>${list(roleItems)}</div></div><p class="prep-caution">${p.caution}</p><div class="actions"><button type="button" class="btn" data-action="prep-reminder">${icon("calendar")}${p.reminder}</button><button type="button" class="btn" data-go="documents">${p.documents}</button><button type="button" class="btn" data-go="help">${p.help}</button><button type="button" class="btn primary official-service-action" data-go="courts">${p.official}${icon("arrow-right")}</button></div></section>`;
}
function addJourneyEnhancements() {
  const page = document.querySelector("#app .page");
  if (!page) return;
  if (state.page === "home") {
    const tour = tourMarkup();
    if (tour) page.insertAdjacentHTML("afterbegin", tour);
    const assisted = page.querySelector(".assisted-entry");
    assisted?.insertAdjacentHTML("afterend", `<button type="button" class="whatsapp-entry" data-action="whatsapp">${icon("message")}<span><b>${localizedCopy().whatsapp.button}</b><span>${localizedCopy().whatsapp.buttonCopy}</span></span></button>`);
    return;
  }
  if (state.page === "case" || state.page === "documents") page.insertAdjacentHTML("beforebegin", journeyMarkup());
  const journey = document.querySelector(".journey-strip");
  const activeStep = journey?.querySelector('[aria-current="step"]');
  if (journey && activeStep && journey.scrollWidth > journey.clientWidth) {
    journey.scrollLeft = Math.max(0, activeStep.offsetLeft - (journey.clientWidth - activeStep.offsetWidth) / 2);
  }
  if (state.page === "case") {
    page.classList.add(`case-stage-${state.caseStage}`);
    document.querySelector(".agenda-block")?.setAttribute("data-stage-panel", "understand");
    document.querySelector(".record-block")?.setAttribute("data-stage-panel", "understand");
    document.querySelector(".case-reading")?.insertAdjacentHTML("beforeend", nextActionMarkup());
    document.querySelector(".case-reading")?.insertAdjacentHTML("beforeend", preparationMarkup());
    document.querySelector(".preparation-block")?.setAttribute("data-stage-panel", "prepare");
    document.querySelector(".documents-block")?.setAttribute("data-context-panel", "true");
    document.querySelector(".history-block")?.setAttribute("data-context-panel", "true");
    const caseHelp = document.querySelector(".case-help");
    if (caseHelp) caseHelp.setAttribute("aria-label", caseHelp.textContent.trim());
    [[".agenda-block", "calendar"], [".record-block", "file-text"], [".next-action-block", "scale"], [".preparation-block", "users"], [".documents-block", "folder"], [".history-block", "briefcase"]].forEach(([selector, iconName]) => decorateCaseHeading(selector, iconName));
    const note = document.querySelector(".record-note");
    const caseRecord = selectedCaseRecord() || sample;
    const caseType = caseRecord.type || tr("finder.result.caseTypeValue");
    const caseStatus = caseRecord.status || tr("finder.result.statusSample");
    const lawyers = caseRecord.lawyers || sample.lawyers;
    note?.insertAdjacentHTML("afterend", `<dl class="case-meta-grid"><div><dt>${tr("finder.result.caseType")}</dt><dd>${escapeHelpHtml(caseType)}</dd></div><div><dt>${tr("finder.result.status")}</dt><dd>${escapeHelpHtml(caseStatus)}</dd></div><div><dt>${tr("finder.result.petitionerLawyer")}</dt><dd>${escapeHelpHtml(lawyers.petitioner)}</dd></div><div><dt>${tr("finder.result.respondentLawyer")}</dt><dd>${escapeHelpHtml(lawyers.respondent)}</dd></div></dl>`);
  }
  if (state.page === "finder") {
    const input = document.getElementById("query");
    if (input && !input.parentElement.classList.contains("voice-field")) {
      const wrapper = document.createElement("div");
      wrapper.className = "voice-field";
      input.before(wrapper);
      wrapper.append(input);
      wrapper.insertAdjacentHTML("beforeend", `<button type="button" class="voice-button" data-action="voice-search" aria-label="${localizedCopy().voice}" title="${localizedCopy().voice}">${icon("microphone")}</button>`);
      wrapper.insertAdjacentHTML("afterend", '<span id="voice-status" class="voice-status" aria-live="polite"></span>');
      input.setAttribute("aria-describedby", "finder-instruction voice-status");
    }
  }
}
function guidedCopy() { return (text[state.prefs.lang] || text.en).guided; }
function lawyerSessionCopy() {
  const copies = {
    en: { heading: "Lawyer demo session", entry: "Enter optional professional workspace", intro: "Use this local prototype session to review sample paper matches and apply a derived case context.", boundary: "Build What Moves India prototype session. This does not verify advocate identity or provide production access. No credentials are collected or stored.", enter: "Enter demo session", badge: "Demo lawyer session", workspace: "Optional professional workspace", workspaceBody: "This workspace is for reviewing synthetic paper results. It does not authorize access to real court records or services.", signout: "Sign out of demo session" },
    as: { heading: "অধিবক্তাৰ ডেমো ছেছন", entry: "ঐচ্ছিক পেছাদাৰী ৱৰ্কস্পেচত প্ৰৱেশ কৰক", intro: "নমুনা কাগজৰ মিল পৰ্যালোচনা আৰু উলিওৱা মামলা-প্ৰসংগ প্ৰয়োগ কৰিবলৈ এই স্থানীয় প্ৰট'টাইপ ছেছন ব্যৱহাৰ কৰক।", boundary: "Build What Moves India-ৰ প্ৰট'টাইপ ছেছন। ই অধিবক্তাৰ পৰিচয় যাচাই নকৰে বা উৎপাদন প্ৰৱেশ নিদিয়ে। কোনো প্ৰমাণপত্ৰ সংগ্ৰহ বা সংৰক্ষণ কৰা নহয়।", enter: "ডেমো ছেছনত প্ৰৱেশ কৰক", badge: "ডেমো অধিবক্তা ছেছন", workspace: "ঐচ্ছিক পেছাদাৰী ৱৰ্কস্পেচ", workspaceBody: "এই ৱৰ্কস্পেচ নমুনা কাগজৰ ফলাফল পৰ্যালোচনাৰ বাবে। ই বাস্তৱ আদালতৰ ৰেকৰ্ড বা সেৱালৈ অনুমতি নিদিয়ে।", signout: "ডেমো ছেছনৰ পৰা ওলাই যাওক" },
    hi: { heading: "वकील डेमो सत्र", entry: "वैकल्पिक पेशेवर कार्यक्षेत्र खोलें", intro: "नमूना कागज़ के मिलान की समीक्षा और निकाले गए मामले के संदर्भ को लागू करने के लिए इस स्थानीय प्रोटोटाइप सत्र का उपयोग करें।", boundary: "Build What Moves India प्रोटोटाइप सत्र। यह अधिवक्ता की पहचान सत्यापित नहीं करता और उत्पादन पहुँच नहीं देता। कोई क्रेडेंशियल एकत्र या संग्रहीत नहीं किया जाता।", enter: "डेमो सत्र में जाएँ", badge: "डेमो वकील सत्र", workspace: "वैकल्पिक पेशेवर कार्यक्षेत्र", workspaceBody: "यह कार्यक्षेत्र नमूना कागज़ के परिणामों की समीक्षा के लिए है। यह वास्तविक अदालती रिकॉर्ड या सेवाओं की अनुमति नहीं देता।", signout: "डेमो सत्र से साइन आउट करें" },
  };
  return copies[state.prefs.lang] || copies.en;
}
function guidedSteps(kind) {
  const active = kind === "paperSteps"
    ? state.paperScan.status === "success" ? 2 : paperScanBusy() ? 1 : 0
    : state.finderResult === "match" ? 1 : 0;
  return `<ol class="guided-steps">${guidedCopy()[kind].map((label,i) => `<li ${i === active ? 'aria-current="step"' : ''}><span>${i+1}</span><small>${label}</small></li>`).join("")}</ol>`;
}
function understandPage() {
  const u = (text[state.prefs.lang] || text.en).understand;
  const sections = [u.details, u.verify, u.quality, u.legalHelp];
  return `<article class="page understand-page"><header><p class="kicker">${u.kicker}</p><h1>${u.heading}</h1><p>${u.intro}</p></header><div class="understand-sections">${sections.map((section) => `<section><h2>${section.heading}</h2><p>${section.body}</p></section>`).join("")}</div><div class="actions"><button type="button" class="btn primary" data-go="paper">${u.scanAction}</button><button type="button" class="btn" data-go="help">${u.helpAction}</button></div></article>`;
}
function home() {
  const g = guidedCopy(), pack = text[state.prefs.lang] || text.en;
  const routes = ["finder", "courts", "understand", "courts"], icons = ["search", "briefcase", "file-text", "map-pin"];
  const scannerCopy = paperIntakeCopy().scannerTeaser;
  const scannerTeaser = `<aside class="scanner-teaser"><div><p class="kicker">${escapeHelpHtml(scannerCopy.kicker)}</p><h2>${escapeHelpHtml(scannerCopy.heading)}</h2><p>${escapeHelpHtml(scannerCopy.body)}</p></div><button type="button" class="btn" data-go="paper">${escapeHelpHtml(scannerCopy.action)}</button></aside>`;
  return `<section class="page home-page"><header class="home-intro"><span class="welcome">${g.welcome}</span><h1>eCourts</h1><p class="home-tagline">${g.tagline}</p><p>${g.statement}</p></header><form id="home-search" class="home-search"><label class="sr-only" for="home-query">${pack.home.searchLabel}</label><div>${icon("search")}<input id="home-query" name="query" autocomplete="off" placeholder="${pack.home.searchPlaceholder}"><button class="btn primary" type="submit" aria-label="${tr("finder.actions.search")}">${icon("arrow-right")}</button></div></form>${scannerTeaser}<div class="guided-actions">${g.actions.map(([label,description],i) => `<button type="button" class="guided-card" data-go="${routes[i]}" ${i===3 ? 'data-locator="true"' : ''}><span class="guided-icon">${icon(icons[i])}</span><b>${label}</b><small>${description}</small></button>`).join("")}</div><aside class="guided-promise">${icon("users")}<div><b>${g.promise}</b><small>${g.promiseDetail}</small></div></aside><details class="citizen-disclosure"><summary>${g.advocate}</summary><p>${g.advocateCopy}</p><button type="button" class="btn" data-action="advocate-entry">${g.signIn} ${icon("arrow-right")}</button><p>${pack.home.boundaryCopy}</p></details><details class="citizen-disclosure"><summary>${tr("home.assisted.label")}</summary><button type="button" class="assisted-entry" data-action="assisted-entry">${tr("home.assisted.label")}</button></details></section>`;
}
function pageNav() {
  if (state.page === "home") return "";
  return `<div class="page-nav"><button type="button" class="btn" data-action="back">${icon("arrow-left")}<span>${tr("shared.actions.back")}</span></button><button type="button" class="btn assisted-shortcut" data-action="assisted-entry">${icon("users")}<span>${tr("home.assisted.label")}</span></button></div>`;
}
function renderShell() {
  document.body.classList.add("citizen-ui");
  const lawyer = lawyerSessionCopy();
  const back =
    state.page === "home"
      ? ""
      : `<button type="button" class="tool-button back-button" data-action="back" aria-label="${tr("shared.actions.back")}" title="${tr("shared.actions.back")}">${icon("arrow-left")}<span>${tr("shared.actions.back")}</span></button>`;
  const homeTop = `<button type="button" class="tool-button home-button" data-action="home" aria-label="${tr("shared.nav.home")}" title="${tr("shared.nav.home")}" ${state.page === "home" ? 'aria-current="page"' : ""}>${icon("home")}<span>${tr("shared.nav.home")}</span></button>`;
  const dockItems = [
    ["home", "home", tr("shared.nav.home"), "action"],
    ["finder", "search", tr("shared.nav.finder"), "go"],
    ["nayak", "sparkles", "Nayak", "action"],
    ["courts", "grid", tr("shared.nav.courts"), "go"],
    ["understand", "book-open", tr("understand.navLabel"), "go"],
  ];
  const dockActive = (id) => id === "finder" ? state.page === "finder" : state.page === id;
  $("#masthead").innerHTML = `<div class="app-frame"><div class="workspace-frame"><div class="masthead-main"><div class="shell top"><a class="brand" href="#home" data-action="home"><span class="brand-mark" aria-hidden="true"><img src="assets/civic-mark.svg" alt="" width="38" height="58"></span><span><b>${tr("shared.brand.name")}</b><small>${tr("shared.brand.descriptor")}</small><small>${state.prefs.lang === "en" ? "Justice for All" : guidedCopy().tagline}</small></span></a><nav class="nav" id="nav" aria-label="${tr("shared.mobileMenu.heading")}"></nav><div class="tools">${state.lawyerSession ? `<span class="lawyer-session-badge" role="status" data-role="${state.lawyerSession.role}" data-label="${state.lawyerSession.label}" data-started-at="${state.lawyerSession.startedAt}">${lawyer.badge}</span><button class="tool-button lawyer-session-signout" type="button" data-action="lawyer-signout">${lawyer.signout}</button>` : ""}<button class="tool-button language-button" type="button" data-action="language" title="${tr("shared.languageDialog.heading")}">${icon("languages")}<span>${languages[state.prefs.lang]}</span></button><button class="tool-button icon-only" type="button" data-action="access" aria-label="${tr("shared.accessibility.label")}" title="${tr("shared.accessibility.label")}">${icon("accessibility")}<span>A11y</span></button><button class="tool-button icon-only mobile" type="button" data-action="menu" aria-label="${tr("shared.mobileMenu.open")}" title="${tr("shared.mobileMenu.open")}">${icon("menu")}<span>${state.prefs.lang === "en" ? "Menu" : tr("shared.mobileMenu.heading")}</span></button></div></div></div></div></div><nav class="dock" aria-label="${tr("shared.mobileMenu.heading")}">${dockItems.map((x) => `<button type="button" class="${x[0] === "nayak" ? "nayak-dock" : ""} ${dockActive(x[0]) ? "active" : ""}" ${dockActive(x[0]) ? 'aria-current="page"' : ""} aria-label="${x[2]}" data-${x[3]}="${x[0]}">${icon(x[1])}<span>${x[2]}</span></button>`).join("")}</nav>`;
  $("#footer").innerHTML = `<p class="prototype-badge">${tr("shared.prototype.descriptor")}</p><p>${tr("shared.footer.notice")}</p>`;
}
function nav() {
  let items = [
    ["finder", "search", tr("shared.nav.finder"), "go"],
    ["courts", "landmark", tr("shared.nav.courts"), "go"],
    ["documents", "file-text", tr("shared.nav.documents"), "go"],
    ["help", "circle-help", tr("shared.nav.help"), "go"],
  ];
  if (state.selected && state.profile)
    items.push(["case", "briefcase", tr("shared.nav.workspace"), "go"]);
  $("#nav").innerHTML = items
    .map(
      (x) =>
        `<button class="${state.page === x[0] ? "active" : ""}" aria-label="${x[2]}" data-${x[3]}="${x[0]}">${icon(x[1])}<span>${x[2]}</span></button>`,
    )
    .join("");
}
function render() {
  invalidatePaperScanRequest();
  window.ECOURTS_VOICE?.cancelAll();
  prefs();
  renderShell();
  nav();
  const view =
    state.page === "finder"
      ? finder()
      : state.page === "courts"
        ? courtsPage()
        : state.page === "documents"
          ? documentStudio()
          : state.page === "understand"
            ? understandPage()
          : state.page === "help"
            ? supportPage()
            : state.page === "case"
              ? casePage()
              : home();
  $("#app").innerHTML = `${pageNav()}${view}`;
  addJourneyEnhancements();
  applyCitizenHierarchy();
  overlay();
  if (state.page === "documents") requestAnimationFrame(updateDraftPreview);
}
function applyCitizenHierarchy() {
  const copy = {
    en: { title: "Find your case", query: "CNR, case number or party name", role: "I'm here", roles: ["For myself", "Helping someone", "As an advocate"], more: "More ways to use eCourts", checklist: "Online checks and papers to collect", ask: "Ask Nayak about your case or court services" },
    as: { title: "আপোনাৰ মামলা বিচাৰক", query: "CNR, মামলা নম্বৰ বা পক্ষৰ নাম", role: "মই আহিছোঁ", roles: ["নিজৰ বাবে", "কাৰোবাক সহায় কৰিবলৈ", "অধিবক্তা হিচাপে"], more: "eCourts ব্যৱহাৰৰ আন উপায়", checklist: "অনলাইন যাচাই আৰু গোটাবলগীয়া কাগজ", ask: "মামলা বা আদালতৰ সেৱাৰ বিষয়ে Nayak-ক সোধক" },
    hi: { title: "अपना मामला खोजें", query: "CNR, मामला नंबर या पक्षकार का नाम", role: "मैं यहाँ हूँ", roles: ["अपने लिए", "किसी की मदद के लिए", "अधिवक्ता के रूप में"], more: "eCourts उपयोग करने के अन्य तरीके", checklist: "ऑनलाइन जाँच और जुटाने वाले कागज़", ask: "मामले या अदालती सेवाओं के बारे में Nayak से पूछें" },
  }[state.prefs.lang] || null;
  if (!copy) return;
  document.querySelector('.page-nav .assisted-shortcut')?.remove();
  const disclose = (element, label) => {
    if (!element) return;
    const detail = document.createElement('details');
    detail.className = 'citizen-disclosure';
    const summary = document.createElement('summary');
    summary.textContent = label;
    element.before(detail);
    detail.append(summary, element);
  };
  if (state.page === 'case') {
    const record = (text[state.prefs.lang] || text.en).case.record;
    document.querySelectorAll('[name="order-mode"]').forEach((radio, index) => {
      radio.addEventListener('change', () => {
        const explanations = selectedCaseExplanations();
        document.querySelector('.record-meaning p').textContent = index === 0 ? explanations.meaning : explanations.official;
      });
    });
    document.querySelectorAll('.case-tabs [data-stage]').forEach(button => {
      const active = button.dataset.stage === state.caseStage;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-stage-panel]').forEach(panel => { panel.hidden = panel.dataset.stagePanel !== state.caseStage; });
    const checks = document.querySelector('.action-checklists');
    disclose(checks, copy.checklist);
    const history = document.querySelector('.history-block');
    disclose(history, history.querySelector('h2').textContent);
    history.querySelector('h2').hidden = true;
    const metadata = document.querySelector('.case-meta-grid');
    disclose(metadata, tr('finder.result.caseType') + ' / ' + tr('finder.result.petitionerLawyer'));
    document.querySelector('.case-help')?.classList.remove('primary');
    document.querySelector('.hearing-card .btn')?.classList.toggle('primary', state.caseStage === 'understand');
  }
  if (state.page === 'help') {
    const ask = document.createElement('button');
    ask.type = 'button'; ask.className = 'btn help-nyk-entry'; ask.textContent = copy.ask;
    ask.onclick = () => window.dispatchEvent(new Event('ecourts:nayak-open'));
    document.querySelector('.help-guide')?.after(ask);
  }
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

let navStack = [];
function routeHash() {
  if (state.page === "finder") return `#finder/${state.tab || "cnr"}`;
  if (state.page === "courts") return `#courts/${state.courtsTab || "district"}`;
  if (state.page === "case") return `#case/${state.caseStage || "understand"}`;
  return `#${state.page || "home"}`;
}
function screenSnapshot() {
  return {
    page: state.page,
    tab: state.tab,
    courtsTab: state.courtsTab,
    selected: state.selected,
    assisted: state.assisted,
    finderResult: state.finderResult,
    caseStage: state.caseStage,
  };
}
function applyScreen(screen) {
  if (!screen) return;
  state.page = screen.page || "home";
  if (screen.tab) state.tab = screen.tab;
  if (screen.courtsTab) state.courtsTab = screen.courtsTab;
  if (["understand", "action", "prepare"].includes(screen.caseStage))
    state.caseStage = screen.caseStage;
  state.selected = screen.selected ?? state.selected;
  state.assisted = Boolean(screen.assisted);
  if (Object.hasOwn(screen, "finderResult"))
    state.finderResult = screen.finderResult;
  if (state.page === "case") state.selected = state.selected || sample.cnr;
  state.modal = null;
  state.menu = false;
}
function historySnapshot() {
  return { app: true, ...screenSnapshot(), stack: navStack.slice() };
}
function applySnapshot(snap) {
  if (!snap || snap.app !== true) return false;
  navStack = Array.isArray(snap.stack) ? snap.stack.slice() : [];
  applyScreen(snap);
  return true;
}
function applyHash(hash) {
  const raw = String(hash || "").replace(/^#\/?/, "").trim();
  const [page, extra] = (raw || "home").split("/");
  const aliases = { paper: "finder", hearing: "case" };
  const resolved = aliases[page] || page;
  const known = ["home", "finder", "courts", "documents", "understand", "help", "case"];
  state.page = known.includes(resolved) ? resolved : "home";
  if (page === "paper" || extra === "paper") state.tab = "paper";
  else if (
    state.page === "finder" &&
    ["cnr", "number", "party", "advocate", "paper"].includes(extra)
  )
    state.tab = extra;
  if (state.page === "courts" && ["district", "high"].includes(extra))
    state.courtsTab = extra;
  if (state.page === "case" && ["understand", "action", "prepare"].includes(extra))
    state.caseStage = extra;
  if (state.page === "case" || page === "hearing")
    state.selected = sample.cnr;
  if (state.page !== "finder") state.assisted = false;
  state.menu = false;
  state.modal = null;
}
function syncHistory(mode) {
  const url = routeHash();
  const data = historySnapshot();
  if (mode === "replace") history.replaceState(data, "", url);
  else history.pushState(data, "", url);
}
function goHome() {
  navStack = [];
  state.assisted = false;
  state.finderResult = null;
  state.modal = null;
  state.menu = false;
  overlay();
  navigate("home", { skipStack: true, replace: true });
}
function goBack() {
  if (state.modal || state.menu) {
    closeOverlay();
    return;
  }
  if (state.page === "home") return;
  const prev = navStack.pop();
  if (!prev) {
    goHome();
    return;
  }
  invalidatePaperScanRequest();
  applyScreen(prev);
  overlay();
  syncHistory("replace");
  render();
  scrollTo(0, 0);
}
function navigate(go, options = {}) {
  const { skipStack = false, replace = false } = options;
  const before = screenSnapshot();
  if (before.page !== go) invalidatePaperScanRequest();
  if (go === "paper") {
    state.page = "finder";
    state.tab = "paper";
  } else if (go === "hearing") {
    state.selected = sample.cnr;
    state.page = "case";
    state.caseStage = "understand";
  } else if (go === "case") {
    state.selected = state.selected || sample.cnr;
    state.page = "case";
  } else state.page = go;
  if (go !== "finder" && go !== "paper") state.assisted = false;
  if (state.page === "home") {
    navStack = [];
  } else if (!skipStack && before.page !== state.page) {
    navStack.push(before);
  }
  state.modal = null;
  state.menu = false;
  overlay();
  syncHistory(replace || before.page === state.page ? "replace" : "push");
  render();
  assistantEvent("route", { route: state.page });
  scrollTo(0, 0);
}
function routeTo(go) {
  navigate(go);
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
function startVoiceSearch(button) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const status = document.getElementById("voice-status");
  if (!Recognition) {
    if (status) status.textContent = localizedCopy().unsupported;
    return;
  }
  const recognition = new Recognition();
  recognition.lang = { en: "en-IN", as: "as-IN", hi: "hi-IN" }[state.prefs.lang] || "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  button.setAttribute("aria-pressed", "true");
  if (status) status.textContent = localizedCopy().listening;
  recognition.onresult = (event) => {
    const input = document.getElementById("query");
    if (input) input.value = event.results[0][0].transcript;
  };
  recognition.onerror = () => {
    if (status) status.textContent = localizedCopy().unsupported;
  };
  recognition.onend = () => {
    button.setAttribute("aria-pressed", "false");
    if (status && status.textContent === localizedCopy().listening) status.textContent = "";
  };
  recognition.start();
}
function handleClick(event) {
  let control = event.target.closest(
    "[data-action],[data-go],[data-tab],[data-doc],[data-term],[data-language],[data-template],[data-doc-action],[data-help-suggest]",
  );
  if (!control) return;
  let action = control.dataset.action;
  if (action === "advocate-entry") { showModal("advocate-entry", control); return; }
  if (action === "lawyer-signin") { showModal("lawyer-session", control); return; }
  if (action === "lawyer-enter-session") {
    state.lawyerSession = { role: "lawyer", label: "Demo lawyer session", startedAt: new Date().toISOString() };
    closeOverlay();
    navigate("documents");
    return;
  }
  if (action === "lawyer-signout") {
    state.lawyerSession = null;
    render();
    return;
  }
  if (action === "nayak") { window.dispatchEvent(new Event("ecourts:nayak-open")); return; }
  if (action === "service-guide") { state.serviceIndex = Number(control.dataset.service); state.modal = "service-guide"; overlay(); focusOverlay(); return; }
  if (control.dataset.go === "courts") state.locator = control.dataset.locator === "true";
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
  if (action === "back") {
    event.preventDefault();
    goBack();
    return;
  }
  if (action === "home") {
    event.preventDefault();
    goHome();
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
    downloadPdf(createPdfBlob(english.title, lines), english.file);
    toast(tr("shared.toasts.pdfDownloaded"));
    return;
  }
  if (control.dataset.go) {
    event.preventDefault();
    if (control.dataset.go === "home") goHome();
    else navigate(control.dataset.go);
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
  if (action === "tour-next") {
    if (state.tourStep >= 2) {
      state.tourStep = null;
      persist();
      navigate("finder");
    } else {
      state.tourStep += 1;
      render();
    }
    return;
  }
  if (action === "tour-skip") {
    state.tourStep = null;
    persist();
    render();
    return;
  }
  if (action === "whatsapp") {
    showModal("whatsapp", control);
    return;
  }
  if (action === "case-stage") {
    assistantEvent("friction", { type: "case-stage-switch", route: state.page });
    state.caseStage = control.dataset.stage || "understand";
    if (state.page === "case") {
      syncHistory("replace");
      render();
      document.querySelector(`[data-stage-panel="${state.caseStage}"]`)?.scrollIntoView({ behavior: state.prefs.reduce ? "auto" : "smooth", block: "start" });
    } else navigate("case");
    return;
  }
  if (action === "priority-template") {
    state.docTemplate = control.dataset.templateTarget || "evidence";
    navigate("documents");
    return;
  }
  if (action === "analyse-paper") {
    analyseSelectedPaper(control);
    return;
  }
  if (action === "select-matched-case") {
    if (state.paperScan.match?.kind !== "ambiguous") return;
    const record = state.paperScan.match.records?.find((item) => item.id === control.dataset.recordId);
    if (!record) return;
    state.paperScan.selectedRecordId = record.id;
    state.paperScan.enrichment = { selected: [], applied: [] };
    const result = document.getElementById("paper-analysis-result");
    if (result && state.paperScan.analysis) result.innerHTML = paperAnalysisMarkup(state.paperScan.analysis);
    return;
  }
  if (action === "add-enrichment") {
    const record = matchedRecordForPaper();
    const analysis = state.paperScan.analysis;
    const row = paperEnrichmentRows(analysis, record).find((item) => item.fieldKey === control.dataset.fieldKey);
    if (!record || !row || row.status !== "new") return;
    const selected = new Set(state.paperScan.enrichment?.selected || []);
    if (selected.has(row.fieldKey)) selected.delete(row.fieldKey); else selected.add(row.fieldKey);
    state.paperScan.enrichment = { selected: [...selected], applied: state.paperScan.enrichment?.applied || [] };
    const result = document.getElementById("paper-analysis-result");
    if (result && analysis) result.innerHTML = paperAnalysisMarkup(analysis);
    return;
  }
  if (action === "open-matched-case") {
    const record = state.paperScan.match?.records?.find((item) => item.id === control.dataset.recordId) || matchedRecordForPaper();
    if (!record) return;
    state.selected = record.cnr;
    state.caseStage = "understand";
    routeTo("case");
    return;
  }
  if (action === "add-dashboard-case") {
    const record = state.paperScan.match?.records?.find((item) => item.id === control.dataset.recordId) || matchedRecordForPaper();
    if (!record) return;
    state.dashboardCases = [...new Set([...(state.dashboardCases || []), record.id])];
    toast("Added to your sample/demo dashboard for this session.");
    return;
  }
  if (action === "open-dashboard-case") {
    const record = window.ECOURTS_CASE_REPOSITORY?.records?.find((item) => item.id === control.dataset.recordId);
    if (!record) return;
    state.selected = record.cnr;
    state.caseStage = "understand";
    routeTo("case");
    return;
  }
  if (action === "review-paper-apply") {
    const record = matchedRecordForPaper();
    const analysis = state.paperScan.analysis;
    if (!record || !analysis) return;
    const selectedKeys = new Set(state.paperScan.enrichment?.selected || []);
    state.selected = record.cnr;
    const additions = paperEnrichmentRows(analysis, record).filter((item) => selectedKeys.has(item.fieldKey)).map((item) => ({ fieldKey: item.fieldKey, label: item.label, value: item.extracted, status: item.status, source: item.source, confidence: item.confidence }));
    state.derivedCaseContext = { source: "uploaded-paper-analysis", recordId: record.id, additions, sanitizedAnalysis: sanitizePaperAnalysis(analysis), appliedAt: new Date().toISOString() };
    state.paperScan.enrichment = { selected: additions.map((item) => item.fieldKey), applied: additions.map((item) => item.fieldKey) };
    state.paperScan.applied = true;
    state.caseStage = "understand";
    routeTo("case");
    return;
  }
  if (action === "retry-paper") {
    state.paperScan.analysis = null;
    state.paperScan.match = null;
    state.paperScan.selectedRecordId = null;
    state.paperScan.applied = false;
    state.paperScan.enrichment = { selected: [], applied: [] };
    state.derivedCaseContext = null;
    latestPaperAnalysis = null;
    setPaperScanStatus(selectedPaperFile ? "selected" : "ready");
    render();
    document.querySelector(".paper-analyse")?.focus();
    return;
  }
  if (action === "case-role") {
    state.caseRole = control.dataset.role || "party";
    render();
    document.querySelector(`[data-role="${state.caseRole}"]`)?.focus();
    return;
  }
  if (action === "prep-reminder") {
    control.setAttribute("aria-pressed", "true");
    toast(localizedCopy().prep.reminder);
    return;
  }
  if (action === "voice-search") {
    startVoiceSearch(control);
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
    state.tab = "cnr";
    state.finderResult = null;
    routeTo("finder");
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
    persist();
    routeTo("case");
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
    routeTo("case");
    toast(tr("shared.toasts.workspaceSaved"));
    return;
  }
  if (action === "download" && state.modal === "doc") {
    let documents = currentCaseDocuments(),
      english = documents[state.doc] || documents[0],
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
      tourStep: 0,
      caseRole: "party",
      caseStage: "understand",
      paperScan: createPaperScanState(),
      lawyerSession: null,
      derivedCaseContext: null,
      prefs: { lang: "en", contrast: false, large: false, reduce: false },
    };
    selectedPaperFile = null;
    latestPaperAnalysis = null;
    navStack = [];
    syncHistory("replace");
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
    (event) => {
      if (event.target.id !== "finder-quick-search") return;
      event.preventDefault();
      const query = event.target.query.value.trim();
      state.finderQuery = query;
      const normalized = query.toLowerCase();
      const match = [["cnr", sample.cnr], ["number", sample.caseNo], ["party", sample.party]].find(([, value]) => value.toLowerCase() === normalized);
      state.tab = match?.[0] || "cnr";
      state.finderResult = match ? "match" : query ? "none" : "empty";
      if (!match) assistantEvent("friction", { type: "failed-search", route: "finder" });
      render();
      document.getElementById("result")?.scrollIntoView({ behavior: state.prefs.reduce ? "auto" : "smooth", block: "nearest" });
    },
    (event) => {
      if (event.target.id !== "home-search") return;
      event.preventDefault();
      const query = event.target.query.value.trim();
      state.finderQuery = query;
      state.tab = "cnr";
      const normalized = query.toLowerCase();
      const match = [["cnr", sample.cnr], ["number", sample.caseNo], ["party", sample.party]].find(([, value]) => value.toLowerCase() === normalized);
      if (match) state.tab = match[0];
      state.finderResult = match ? "match" : query ? "none" : "empty";
      if (state.finderResult !== "match") assistantEvent("friction", { type: "failed-search", route: "finder" });
      navigate("finder");
    },
    (e) => {
      if (e.target.id !== "search") return;
      e.preventDefault();
      state.finderQuery = e.target.query.value.trim();
      let q = state.finderQuery.toLowerCase(),
        ok =
          (state.tab === "cnr" && q === sample.cnr.toLowerCase()) ||
          (state.tab === "number" && q === sample.caseNo.toLowerCase()) ||
          (state.tab === "party" && q === sample.party.toLowerCase()) ||
          (state.tab === "advocate" && q === "demo advocate a");
      if (state.tab === "number" && ((e.target.courtType?.value && e.target.courtType.value !== "district") || (e.target.year?.value && e.target.year.value !== "2026"))) ok = false;
      state.finderResult = ok ? "match" : q ? "none" : "empty";
      if (!ok) assistantEvent("friction", { type: "failed-search", route: "finder" });
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
    (event) => {
      if (!event.target.matches("#paper-upload, #paper-camera")) return;
      if (paperScanBusy()) return;
      const p = paperIntakeCopy();
      const file = event.target.files?.[0];
      const selection = document.getElementById("paper-selection");
      const analyse = document.querySelector(".paper-analyse");
      if (!selection || !analyse || !file) return;
      const allowed = ["application/pdf", "image/jpeg", "image/png"].includes(file.type);
      const valid = allowed && file.size <= 10 * 1024 * 1024;
      selectedPaperFile = valid ? file : null;
      latestPaperAnalysis = null;
      state.paperScan.analysis = null;
      state.paperScan.match = null;
      state.paperScan.selectedRecordId = null;
      state.paperScan.applied = false;
      state.paperScan.enrichment = { selected: [], applied: [] };
      state.derivedCaseContext = null;
      state.paperScan.fileName = file.name;
      state.paperScan.fileSize = file.size;
      setPaperScanStatus("selected", valid ? "" : "invalid");
      if (!valid) assistantEvent("friction", { type: "invalid-upload", route: state.page });
      selection.innerHTML = `<b>${p.selected}</b><span>${escapeHelpHtml(file.name)} · ${(file.size / 1024 / 1024).toFixed(1)} MB</span>${valid ? "" : `<em>${p.hint}</em>`}`;
      selection.classList.toggle("invalid", !valid);
      const result = document.getElementById("paper-analysis-result");
      if (result) {
        result.innerHTML = "";
        result.classList.remove("service-unavailable");
        result.removeAttribute("aria-busy");
      }
      syncPaperScanUi();
    },
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
window.addEventListener("popstate", (event) => {
  invalidatePaperScanRequest();
  if (!applySnapshot(event.state)) applyHash(location.hash);
  render();
});
let swipe = null;
document.addEventListener(
  "touchstart",
  (event) => {
    if (event.touches.length !== 1) return;
    const target = event.target;
    if (target.closest?.("input, textarea, select, .dock")) return;
    const t = event.touches[0];
    swipe = {
      x: t.clientX,
      y: t.clientY,
      time: Date.now(),
      edge: t.clientX <= 28,
      tablist: target.closest?.('[role="tablist"]'),
    };
  },
  { passive: true },
);
document.addEventListener(
  "touchend",
  (event) => {
    if (!swipe) return;
    const start = swipe;
    swipe = null;
    const t = event.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Date.now() - start.time > 700) return;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    if (start.tablist) {
      const tabs = [...start.tablist.querySelectorAll('[role="tab"]')];
      const current = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
      const next = current + (dx < 0 ? 1 : -1);
      if (next >= 0 && next < tabs.length) {
        const id = tabs[next].dataset.tab;
        if (start.tablist.dataset.tabs === "courts")
          activateCourtsTab(id, { focus: true });
        else activateFinderTab(id, { focus: true });
        return;
      }
    }
    if (dx > 0 && (start.edge || dx >= 72)) goBack();
  },
  { passive: true },
);
applyHash(location.hash);
syncHistory("replace");
render();
