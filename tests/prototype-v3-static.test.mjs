import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testsDir, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const html = read("index.html");

for (const asset of [
  "assets/prototype-v3.css",
  "assets/citizen-shell.css",
  "assets/prototype-v3-locales.js",
  "assets/prototype-v3-app.js",
]) {
  const assetPattern = new RegExp(
    asset.replaceAll(".", "\\.").replaceAll("/", "\\/"),
    "u",
  );
  assert.ok(assetPattern.test(html), `index.html must load ${asset}`);
}

const localeSource = read("assets/prototype-v3-locales.js");
const appSource = read("assets/prototype-v3-app.js");
for (const hook of [
  "app-frame",
  "side-navigation",
  "citizen-intents",
  "assisted-entry",
]) {
  assert.match(appSource, new RegExp(hook, "u"), `missing Phase 1 hook: ${hook}`);
}
const cssSource = read("assets/prototype-v3.css");
const heroPath = path.join(root, "assets/citizen-justice-hero.jpg");
const faviconPath = path.join(root, "assets/ecourts-favicon.png");
assert.ok(
  fs.existsSync(heroPath),
  "Home editorial derivative must exist locally",
);
assert.ok(
  fs.statSync(heroPath).size > 0,
  "Home editorial derivative must not be empty",
);
assert.match(
  cssSource,
  /citizen-justice-hero\.jpg/u,
  "Home must use the local editorial derivative",
);
assert.ok(fs.existsSync(faviconPath), "dedicated local favicon must exist");
assert.ok(
  fs.statSync(faviconPath).size < 20_000,
  "favicon must remain under 20 KB",
);
assert.match(
  html,
  /assets\/ecourts-favicon\.png/u,
  "HTML must load the dedicated local favicon",
);
assert.doesNotMatch(html, /class="tri"/u, "tricolour strip must be removed");
assert.doesNotMatch(
  cssSource,
  /\.tri|\.mark|conic-gradient|chakra/iu,
  "wheel and tricolour CSS must be removed",
);
assert.doesNotMatch(
  appSource,
  /class="mark"/u,
  "masthead mark must be removed",
);
assert.doesNotMatch(
  cssSource,
  /\.hero(?:-|\s|\{|\.)/u,
  "legacy Home hero selectors must be removed",
);
assert.match(
  appSource,
  /home\.assisted\.label/u,
  "Home must expose assisted entry",
);
assert.match(
  appSource,
  /finder\.assisted\.body/u,
  "Finder must explain assisted use",
);
assert.doesNotMatch(
  appSource.match(/function persist\(\)[\s\S]*?\}/u)?.[0] || "",
  /assisted/u,
  "assisted state must not persist",
);
assert.match(appSource, /role="tablist"/u, "Finder must expose a tablist");
assert.match(
  appSource,
  /aria-controls="finder-panel"/u,
  "Finder tabs must control one panel",
);
assert.match(appSource, /role="tabpanel"/u, "Finder must expose one tabpanel");
assert.match(
  appSource,
  /tabindex="\$\{state\.tab === id \? "0" : "-1"\}"/u,
  "Finder must use roving tabindex",
);
for (const key of ["ArrowLeft", "ArrowRight", "Home", "End"])
  assert.ok(appSource.includes(`"${key}"`), `Finder tabs must support ${key}`);
for (const token of [
  "--navy",
  "--blue",
  "--saffron",
  "--green",
  "--judicial-green",
])
  assert.doesNotMatch(
    cssSource,
    new RegExp(`${token}(?:\\s*:|\\))`, "u"),
    `legacy color token ${token} must be removed`,
  );
assert.doesNotMatch(
  appSource,
  /Dashboard/u,
  "shared UI must not use Dashboard",
);
const localeScript = new vm.Script(localeSource, {
  filename: "prototype-v3-locales.js",
});
new vm.Script(appSource, { filename: "prototype-v3-app.js" });

const context = vm.createContext({ window: {} });
localeScript.runInContext(context);
const i18n = context.window.ECOURTS_I18N;
assert.ok(i18n, "locale module must expose window.ECOURTS_I18N");

const expectedCodes = ["en", "as", "hi"];
assert.deepEqual(Object.keys(i18n.languages), expectedCodes);
assert.deepEqual(Object.values(i18n.languages), [
  "English",
  "অসমীয়া",
  "हिन्दी",
]);
assert.deepEqual([...i18n.rtlLanguages], []);

function leafPaths(value, prefix = "") {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) =>
      leafPaths(entry, `${prefix}[${index}]`),
    );
  }
  if (value && typeof value === "object") {
    return Object.keys(value).flatMap((key) =>
      leafPaths(value[key], prefix ? `${prefix}.${key}` : key),
    );
  }
  assert.ok(
    typeof value === "string" || typeof value === "boolean",
    `${prefix} must be a string or boolean leaf`,
  );
  if (typeof value === "string")
    assert.ok(value.trim(), `${prefix} must not be blank`);
  return [prefix];
}

function scalarTypes(value, prefix = "") {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) =>
      scalarTypes(entry, `${prefix}[${index}]`),
    );
  }
  if (value && typeof value === "object") {
    return Object.keys(value).flatMap((key) =>
      scalarTypes(value[key], prefix ? `${prefix}.${key}` : key),
    );
  }
  return [`${prefix}:${typeof value}`];
}

const englishPaths = leafPaths(i18n.packs.en).sort();
const englishScalarTypes = scalarTypes(i18n.packs.en).sort();
for (const code of expectedCodes) {
  assert.deepEqual(
    leafPaths(i18n.packs[code]).sort(),
    englishPaths,
    `${code} must match the English locale schema`,
  );
  assert.deepEqual(
    scalarTypes(i18n.packs[code]).sort(),
    englishScalarTypes,
    `${code} must match the English locale scalar types`,
  );
}

for (const route of [
  "shared",
  "home",
  "finder",
  "courts",
  "documents",
  "help",
  "case",
  "glossary",
]) {
  assert.ok(
    englishPaths.some((key) => key.startsWith(`${route}.`)),
    `missing ${route} locale section`,
  );
}

for (const code of expectedCodes) {
  const pack = i18n.packs[code];
  assert.equal(
    Object.keys(pack.help.faqs).length,
    15,
    `${code} must translate 15 FAQs`,
  );
  assert.equal(
    Object.keys(pack.documents.templates).length,
    7,
    `${code} must translate 7 document templates`,
  );
  assert.equal(
    Object.keys(pack.glossary).length,
    5,
    `${code} must translate 5 glossary terms`,
  );

  const expectedFields = {
    legalAid: [
      ["name", "text", true],
      ["address", "textarea", true],
      ["contact", "text", true],
      ["case", "textarea", true],
      ["reason", "textarea", true],
      ["eligibility", "textarea", false],
    ],
    demand: [
      ["sender", "textarea", true],
      ["recipient", "textarea", true],
      ["amount", "text", true],
      ["reason", "textarea", true],
      ["due", "date", true],
      ["method", "text", false],
    ],
    settlement: [
      ["from", "text", true],
      ["to", "text", true],
      ["dispute", "textarea", true],
      ["offer", "textarea", true],
      ["deadline", "date", true],
      ["contact", "text", true],
    ],
    chronology: [
      ["matter", "text", true],
      ["parties", "textarea", true],
      ["events", "textarea", true],
      ["next", "text", false],
    ],
    evidence: [
      ["matter", "text", true],
      ["owner", "text", true],
      ["items", "textarea", true],
      ["notes", "textarea", false],
    ],
    service: [
      ["provider", "text", true],
      ["client", "text", true],
      ["services", "textarea", true],
      ["fee", "textarea", true],
      ["term", "textarea", true],
      ["termination", "textarea", true],
    ],
    nda: [
      ["discloser", "text", true],
      ["recipient", "text", true],
      ["purpose", "textarea", true],
      ["information", "textarea", true],
      ["duration", "text", true],
      ["exclusions", "textarea", false],
    ],
  };
  const templates = Object.entries(pack.documents.templates);
  for (const [id, template] of templates) {
    assert.deepEqual(
      Array.from(template.fields, ({ name, type, required }) => [
        name,
        type,
        required,
      ]),
      expectedFields[id],
      `${code}.${id} fields must match the application contract`,
    );
  }
  assert.equal(
    new Set(templates.map(([, template]) => JSON.stringify(template.fields)))
      .size,
    templates.length,
    `${code} document templates must not reuse one generic field set`,
  );

  const faqTagSets = Object.values(pack.help.faqs).map((faq) =>
    JSON.stringify(faq.tags),
  );
  assert.equal(
    new Set(faqTagSets).size,
    faqTagSets.length,
    `${code} FAQs must have topic-specific tag sets`,
  );
  assert.ok(
    Object.values(pack.help.faqs).every(
      (faq) =>
        !faq.tags.some((tag) => /^(topic|বিষয়|विषय)\s*\d+$/iu.test(tag)),
    ),
    `${code} FAQ tags must not use generic numbered topics`,
  );
}

assert.equal(i18n.isRequiredField({ required: true }), true);
assert.equal(i18n.isRequiredField({ required: false }), false);
assert.equal(i18n.isRequiredField({}), false);
const optionalField = i18n.packs.en.documents.templates.legalAid.fields.at(-1);
assert.equal(
  optionalField.required,
  false,
  "legal-aid eligibility must remain optional",
);
assert.equal(
  i18n.isRequiredField(optionalField),
  false,
  "optional fields must not receive a required marker or HTML required attribute",
);

for (const code of expectedCodes) {
  for (const key of [
    "home.heading",
    "home.copy",
    "home.assisted.label",
    "home.assisted.copy",
    "finder.assisted.heading",
    "finder.assisted.body",
    "finder.assisted.exit",
    "finder.result.statusSample",
    "shared.prototype.descriptor",
  ]) {
    assert.equal(
      typeof i18n.getPath(i18n.packs[code], key),
      "string",
      `${code} must define ${key}`,
    );
  }
}
assert.equal(
  i18n.resolve("en", "home.editorialCue"),
  "The work begins with paper and a date.",
);
for (const still of [
  "visual-courts.jpg",
  "visual-documents.jpg",
  "visual-help.jpg",
  "icon-search.jpg",
  "icon-file.jpg",
  "icon-scale.jpg",
  "icon-calendar.jpg",
  "icon-help.jpg",
]) {
  const stillPath = path.join(root, "assets", still);
  assert.ok(fs.existsSync(stillPath), `${still} must exist`);
  assert.ok(
    fs.statSync(stillPath).size < 80_000,
    `${still} must stay small for slow phones`,
  );
}
assert.ok(
  fs.statSync(heroPath).size < 80_000,
  "Home still must stay small for slow phones",
);
assert.match(appSource, /icon-search\.jpg/u, "Home tasks use still-life icons");
assert.match(appSource, /visual-courts\.jpg/u, "Courts page uses an atmosphere still");
const fallbackResolver = i18n.createResolver({
  en: { message: "Hello {name}; keep {missing}." },
  as: {},
});
assert.equal(
  fallbackResolver("as", "message", { name: "Mira" }),
  "Hello Mira; keep {missing}.",
);
assert.equal(
  fallbackResolver("unknown", "message", { name: "Mira" }),
  "Hello Mira; keep {missing}.",
);
assert.throws(
  () => fallbackResolver("as", "absent"),
  /Missing locale key: absent/u,
);

function containerPaths(value, prefix = "") {
  if (!value || typeof value !== "object") return [];
  const own = prefix ? [[prefix, value]] : [];
  const children = Array.isArray(value)
    ? value.flatMap((entry, index) =>
        containerPaths(entry, `${prefix}[${index}]`),
      )
    : Object.keys(value).flatMap((key) =>
        containerPaths(value[key], prefix ? `${prefix}.${key}` : key),
      );
  return [...own, ...children];
}
const englishContainers = new Map(containerPaths(i18n.packs.en));
for (const code of ["as", "hi"]) {
  for (const [containerPath, container] of containerPaths(i18n.packs[code])) {
    assert.notEqual(
      container,
      englishContainers.get(containerPath),
      `${code}.${containerPath} must not share a mutable object or array with English`,
    );
  }
}

const deferredMigrationPhrases = [
  "Help and court information.",
  "Need support?",
  "Open eCourts Services",
];
const deferredMigrationMatches = deferredMigrationPhrases.filter((phrase) =>
  appSource.includes(phrase),
);

for (const key of [
  "shared.prototype.descriptor",
  "shared.mobileMenu.heading",
  "shared.languageDialog.heading",
  "shared.accessibility.heading",
  "shared.signup.heading",
  "shared.otp.heading",
  "shared.workspace.heading",
  "shared.glossary.kicker",
  "shared.documentModal.kicker",
  "shared.footer.notice",
]) {
  assert.ok(
    appSource.includes(`tr('${key}')`) || appSource.includes(`tr("${key}")`),
    `shared renderer must use locale key ${key}`,
  );
}

for (const key of [
  "finder.kicker",
  "finder.heading",
  "finder.intro",
  "finder.disclosure",
  "finder.tabsLabel",
  "finder.actions.search",
  "finder.actions.sample",
  "finder.actions.open",
  "finder.paper.uploadNote",
  "finder.result.caseType",
  "finder.result.status",
  "finder.result.petitionerLawyer",
  "finder.result.respondentLawyer",
  "finder.errors.emptyHeading",
  "finder.errors.noneHeading",
  "finder.help.heading",
]) {
  assert.ok(
    appSource.includes(`tr('${key}')`) ||
      appSource.includes(`tr("${key}")`) ||
      appSource.includes("tr(`finder."),
    `Finder must resolve locale key ${key}`,
  );
  for (const code of expectedCodes) {
    assert.equal(
      typeof i18n.getPath(i18n.packs[code], key),
      "string",
      `${code} must define ${key}`,
    );
  }
}

for (const fixtureValue of [
  "Demo Petitioner A v. Demo Respondent B",
  "Demo Petitioner A",
  "Sample Civil Court",
  "DEMO-CIV-114-2026",
  "DEMO010002026",
  "Demo Advocate A",
  "Demo Advocate B",
])
  assert.ok(
    appSource.includes(fixtureValue),
    `Finder fixture must include ${fixtureValue}`,
  );

for (const removedIdentity of [
  "Meera Iyer",
  "R. K. Builders",
  "Bengaluru City Civil Court",
  "Adv. Asha Rao",
  "Adv. Imran Khan",
  "CIV/114/2026",
])
  assert.doesNotMatch(
    appSource,
    new RegExp(removedIdentity.replaceAll(".", "\\.")),
    `old realistic fixture must remove ${removedIdentity}`,
  );

assert.equal(
  i18n.packs.en.finder.disclosure,
  "Try this search with CNR DEMO010002026.",
);
assert.match(
  appSource,
  /<button type="button" class="term"/u,
  "Finder glossary term controls must be explicit buttons",
);
assert.match(
  appSource,
  /<button type="submit" class="btn primary">\$\{tr\(["']finder\.actions\.search["']\)\}/u,
  "Finder search must have an explicit submit button",
);
assert.doesNotMatch(
  appSource,
  /data-action="sample"/u,
  "sample preview and open actions must remain distinct",
);

assert.match(appSource, /data-go="courts"/u, "Courts route must be in navigation");
assert.match(appSource, /data-tabs="courts"/u, "Courts must expose a tablist");
for (const url of [
  "https://services.ecourts.gov.in/",
  "https://njdg.ecourts.gov.in/njdg_v3/",
  "https://ecourts.gov.in/ecourts2.0/?p=dist_court",
  "https://hcservices.ecourts.gov.in/",
  "https://njdg.ecourts.gov.in/hcnjdg_v2/",
  "https://ecourts.gov.in/ecourts2.0/?p=about_us/highcourts",
  "https://ecourts.gov.in/",
  "https://njdg.ecourts.gov.in/",
  "https://ecommitteesci.gov.in/",
  "https://www.sci.gov.in/",
  "https://doj.gov.in/national-legal-services-authority/",
  "https://doj.gov.in/tele-law-mobile-app/",
])
  assert.ok(appSource.includes(url), `official directory must include ${url}`);

assert.match(
  appSource,
  /createPdfBlob\(english\.title, lines\)/u,
  "document PDFs must use the English template title",
);
assert.match(
  appSource,
  /createPdfBlob\(english\.englishTitle/u,
  "case PDFs must use the English document title",
);
assert.ok(
  appSource.includes("INTERIM DIRECTION ON PROPERTY PAPERS"),
  "interim order PDF body must be distinct",
);
assert.ok(
  appSource.includes("PROPERTY PAPERS TO BRING"),
  "checklist PDF body must be distinct",
);
assert.ok(
  appSource.includes("CURRENT SYNTHETIC CASE STATUS"),
  "status note PDF body must be distinct",
);
assert.doesNotMatch(
  appSource,
  /Suggested questions updated\./u,
  "Help live region must not hardcode English",
);
assert.doesNotMatch(
  appSource,
  /PDF export currently supports English text/u,
  "PDF language notice must not hardcode English",
);
assert.match(
  appSource,
  /documents\.switchConfirm/u,
  "template switching must use a localized confirmation",
);
for (const key of [
  "courts.kicker",
  "courts.heading",
  "courts.intro",
  "courts.tabs.district",
  "courts.tabs.high",
  "documents.switchConfirm",
  "shared.toasts.suggestionsUpdated",
]) {
  assert.ok(
    appSource.includes(`tr('${key}')`) ||
      appSource.includes(`tr("${key}")`) ||
      appSource.includes("tr(`courts."),
    `renderer must resolve locale key ${key}`,
  );
  for (const code of expectedCodes) {
    assert.equal(
      typeof i18n.getPath(i18n.packs[code], key),
      "string",
      `${code} must define ${key}`,
    );
  }
}

const readme = read("README.md");
const playwrightConfig = read("playwright.config.mjs");
assert.match(
  playwrightConfig,
  /ECOURTS_TEST_PORT/u,
  "Playwright must read ECOURTS_TEST_PORT",
);
assert.match(
  readme,
  /ECOURTS_TEST_PORT/u,
  "README must document the test port override",
);
assert.doesNotMatch(
  `${html}\n${readme}\n${playwrightConfig}`,
  /prototype-v3\.html|prototype-v2\.html|v1\.9\.2\.html|prototype\.html/u,
  "active instructions must not point at obsolete HTML entries",
);

console.log(
  `static pass: ${expectedCodes.length} complete locale packs, ${englishPaths.length} translated leaves`,
);
console.log("deferred Finder/Help/Case migration diagnostics:");
console.log(
  deferredMigrationMatches.length
    ? deferredMigrationMatches.map((phrase) => `- ${phrase}`).join("\n")
    : "- none",
);
