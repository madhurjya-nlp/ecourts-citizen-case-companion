import { test, expect } from "@playwright/test";

const locales = ["en", "as", "hi"];

async function translated(page, locale, path) {
  return page.evaluate(
    ({ locale, path }) => window.ECOURTS_I18N.resolve(locale, path),
    { locale, path },
  );
}

async function start(page, locale = "en") {
  await page.goto("/index.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  if (locale !== "en") {
    await page.locator('[data-action="language"]:visible').click();
    await page.locator(`[data-language="${locale}"]`).click();
  }
}

async function go(page, route) {
  if (route === "hearing") {
    await go(page, "finder");
    await page.locator('[data-action="sample-preview"]').click();
    await page.locator('[data-action="open-sample"]').click();
    return;
  }
  const candidates = page.locator(`[data-go="${route}"]`);
  const count = await candidates.count();
  for (let index = 0; index < count; index += 1) {
    if (await candidates.nth(index).isVisible()) {
      await candidates.nth(index).click();
      return;
    }
  }
  await page.locator('[data-action="menu"]:visible').click();
  await page.locator(`.menu [data-go="${route}"]`).click();
}

test("citizen Home prioritises case search and guided help", async ({ page }) => {
  await start(page);
  await page.locator('[data-action="tour-skip"]').click();
  await expect(page.locator(".guided-card")).toHaveCount(4);
  await expect(page.locator(".guided-card").first()).toHaveAttribute("data-go", "finder");
  await expect(page.locator("#home-search")).toBeVisible();
  await expect(page.locator(".scanner-teaser")).toContainText("Understand a court paper");
  await page.locator('.scanner-teaser [data-go="paper"]').click();
  await expect(page).toHaveURL(/#finder\/paper$/u);
  await expect(page.locator("#finder-panel #paper-upload")).toBeVisible();
  await page.locator('[data-action="home"]:visible').first().click();

  await page.locator("#home-query").fill("DEMO010002026");
  await page.locator("#home-search").evaluate((form) => form.requestSubmit());
  await expect(page).toHaveURL(/#finder\/cnr$/u);
  await page.locator('[data-action="home"]:visible').first().click();
  await page.locator('.home-page .citizen-disclosure > summary').last().click();
  await page.locator('[data-action="assisted-entry"]:visible').first().click();
  await expect(page).toHaveURL(/#finder\/cnr$/u);
});

for (const locale of locales) {
  test(`${locale} Understand court paper is guidance separate from upload`, async ({
    page,
  }) => {
    await start(page, locale);
    await page.locator('[data-action="tour-skip"]').click();
    await page.locator('.guided-card[data-go="understand"]').click();

    await expect(page).toHaveURL(/#understand$/u);
    await expect(page.locator(".understand-page h1")).toHaveCount(1);
    await expect(page.locator(".understand-page section")).toHaveCount(4);
    await expect(page.locator(".understand-page #paper-upload")).toHaveCount(0);
    await expect(page.locator(".dock [data-go='understand']")).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.locator(".understand-page")).toContainText(
      await translated(page, locale, "understand.details.heading"),
    );
    await expect(page.locator(".understand-page")).toContainText(
      await translated(page, locale, "understand.verify.heading"),
    );
    await expect(page.locator(".understand-page")).toContainText(
      await translated(page, locale, "understand.quality.heading"),
    );
    await expect(page.locator(".understand-page")).toContainText(
      await translated(page, locale, "understand.legalHelp.heading"),
    );

    await page.locator('[data-action="menu"]:visible').click();
    const currentUnderstand = page.locator('.menu [data-go="understand"]');
    await expect(currentUnderstand).toContainText(
      await translated(page, locale, "understand.navLabel"),
    );
    await expect(currentUnderstand).toHaveAttribute("aria-current", "page");
    await expect(currentUnderstand).toHaveClass(/active/u);
    await page.locator('.menu [data-go="finder"]').click();
    await page.locator('[data-action="menu"]:visible').click();
    await page.locator('.menu [data-go="understand"]').click();
    await expect(page).toHaveURL(/#understand$/u);
  });
}

test("failed case searches preserve the submitted value for correction", async ({ page }) => {
  await start(page);
  await page.goto("/index.html#finder/number");
  await expect(page.locator("#query")).toHaveValue("");

  await page.locator("#query").fill("WRONG-CASE-123");
  await page.locator("#search").evaluate((form) => form.requestSubmit());
  await expect(page.locator("#result")).toContainText("No case matched");
  await expect(page.locator("#query")).toHaveValue("WRONG-CASE-123");

  await page.locator("#query").fill("DEMO-CIV-114-2026");
  await page.locator("#search").evaluate((form) => form.requestSubmit());
  await expect(page.locator("#result")).toContainText("Demo Petitioner A v. Demo Respondent B");
});

test("first-time journey, preparation roles and WhatsApp preview work", async ({ page }) => {
  await start(page);
  const tour = page.locator(".first-tour");
  await expect(tour).toBeVisible();
  await tour.locator('[data-action="tour-next"]').click();
  await expect(tour.locator(".tour-count")).toHaveText("2 / 3");
  await tour.locator('[data-action="tour-skip"]').click();
  await expect(tour).toHaveCount(0);

  await go(page, "finder");
  await expect(page.locator(".guided-steps li")).toHaveCount(3);
  await expect(page.locator('[data-action="voice-search"]')).toBeVisible();
  await page.locator('[data-action="sample-preview"]').click();
  await page.locator('[data-action="open-sample"]').click();
  await page.locator('.journey-strip [data-stage="prepare"]').click();
  await expect(page.locator(".preparation-block")).toBeVisible();
  await page.locator('[data-role="accused"]').click();
  await expect(page.locator('[data-role="accused"]')).toHaveClass(/active/);
  await page.locator('.journey-strip [data-stage="action"]').click();
  await page.locator('[data-action="whatsapp"]').last().click();
  await expect(page.locator(".phone-preview")).toBeVisible();
  await expect(page.locator(".phone-preview")).toContainText("Simulation - not connected");
});

test("case journey separates understanding, next action, and preparation", async ({ page }) => {
  await start(page);
  await go(page, "hearing");
  await expect(page).toHaveURL(/#case\/understand$/u);
  await expect(page.locator('.next-action-block')).toBeHidden();
  await expect(page.locator('.preparation-block')).toBeHidden();
  await page.locator('.order-modes input').last().check();
  await expect(page.locator('.record-meaning p')).toContainText('interim order');
  await expect(page.locator('.journey-strip [data-stage="understand"]')).toHaveAttribute("aria-current", "step");
  await page.locator('.journey-strip [data-stage="action"]').click();
  await expect(page).toHaveURL(/#case\/action$/u);
  await expect(page.locator(".next-action-block")).toBeVisible();
  await expect(page.locator('.record-block')).toBeHidden();
  await expect(page.locator('.action-checklists')).toBeHidden();
  await page.locator('.next-action-block .citizen-disclosure summary').click();
  await expect(page.locator('.action-checklists')).toBeVisible();
  await expect(page.locator(".priority-card")).toHaveCount(3);
  await expect(page.locator(".action-checklists")).toContainText("Collect and keep ready offline");
  await page.locator('.journey-strip [data-stage="prepare"]').click();
  await expect(page).toHaveURL(/#case\/prepare$/u);
  await expect(page.locator(".preparation-block")).toHaveCSS("opacity", "1");
  await page.locator('.journey-strip [data-stage="action"]').click();
  await page.locator('[data-template-target="evidence"]').click();
  await expect(page).toHaveURL(/#documents$/u);
  await expect(page.locator('[data-template="evidence"]')).toHaveClass(/active/);
});

for (const width of [390, 360]) {
  test(`mobile ${width}px keeps the active journey step visible through official handoff`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await start(page);
    await page.locator('[data-action="tour-skip"]').click();
    await page.locator("#home-query").fill("DEMO010002026");
    await page.locator("#home-search").evaluate((form) => form.requestSubmit());
    await expect(page.locator("#result")).toBeVisible();
    await page.locator('[data-action="open-sample"]').click();
    await page.locator('.journey-strip [data-stage="action"]').click();
    await page.locator('.journey-strip [data-stage="prepare"]').click();

    const activeBox = await page.locator('.journey-strip [aria-current="step"]').boundingBox();
    expect(activeBox).not.toBeNull();
    expect(activeBox.x).toBeGreaterThanOrEqual(0);
    expect(activeBox.x + activeBox.width).toBeLessThanOrEqual(width);
    await expect(page.locator(".official-service-action")).toBeVisible();
    await page.locator(".official-service-action").click();
    await expect(page).toHaveURL(/#courts\/district$/u);
    await page.locator(".official-directory:not([open]) > summary").click();
    await expect(page.locator(".service-row a").first()).toHaveAttribute("href", "https://services.ecourts.gov.in/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

for (const locale of locales) {
  test(`${locale} Help search, FAQ disclosures and suggestions work`, async ({ page }) => {
    await start(page, locale);
    await go(page, "help");
    await expect(page.locator("h1")).toHaveText(
      await translated(page, locale, "help.heading"),
    );
    await expect(page.locator(".help-services .service-link")).toHaveCount(2);
    await expect(page.locator(".faq-item")).toHaveCount(15);

    const question = await translated(page, locale, "help.faqs.portal-cnr.question");
    await page.locator("#help-search").fill(question);
    await expect(page.locator(".faq-item")).toHaveCount(1);
    const faq = page.locator("#faq-portal-cnr");
    await faq.locator("summary").click();
    await expect(faq).toHaveAttribute("open", "");

    await page.locator("#help-search").fill("");
    const suggestion = page.locator("[data-help-suggest]").first();
    const target = await suggestion.getAttribute("data-help-suggest");
    await suggestion.click();
    await expect(page.locator(`#faq-${target}`)).toHaveAttribute("open", "");
    await expect(page.locator(`#faq-${target} summary`)).toBeFocused();

    await page.locator("#help-search").fill("zzzz-no-result-999");
    await expect(page.locator(".help-empty")).toContainText(
      await translated(page, locale, "help.empty.heading"),
    );
    expect(await page.evaluate(() => localStorage.getItem("ecourts-citizen-v3"))).not.toContain("help");
  });
}

async function readDownload(download) {
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

test("Case record layout, document views and synthetic PDF downloads work", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await start(page);
  await go(page, "hearing");
  await expect(page.locator(".record-block")).toContainText("Read the record");
  await expect(page.locator(".history-block")).toContainText("Case history");
  const positions = await page.evaluate(() => {
    const record = document.querySelector(".record-block").getBoundingClientRect();
    const history = document.querySelector(".history-block").getBoundingClientRect();
    return { recordRight: record.right, historyLeft: history.left };
  });
  expect(positions.historyLeft).toBeLessThan(positions.recordRight);

  const expected = [
    {
      file: "interim-order-synthetic.pdf",
      marker: "INTERIM DIRECTION ON PROPERTY PAPERS",
      title: "INTERIM ORDER",
    },
    {
      file: "property-paper-checklist-synthetic.pdf",
      marker: "PROPERTY PAPERS TO BRING",
      title: "PROPERTY PAPER CHECKLIST",
    },
    {
      file: "case-status-note-synthetic.pdf",
      marker: "CURRENT SYNTHETIC CASE STATUS",
      title: "CASE STATUS NOTE",
    },
  ];
  const bodies = [];
  for (let index = 0; index < 3; index += 1) {
    await page.locator(`.documents-block [data-doc="${index}"]`).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator(".paper")).toContainText(expected[index].marker);
    const downloadPromise = page.waitForEvent("download");
    await page.locator('[data-action="download"]').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(expected[index].file);
    const bytes = await readDownload(download);
    const text = bytes.toString("latin1");
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
    expect(text).toContain(expected[index].title);
    expect(text).toContain(expected[index].marker);
    expect(text).not.toContain("????");
    expect(text).toContain("Sample data - hackathon prototype");
    bodies.push(text);
    await page.getByRole("button", { name: "Close" }).click();
  }
  expect(new Set(bodies).size).toBe(3);
  await expect(page.locator(".case-help")).toHaveText("Open Help");
  await page.locator(".case-help").click();
  await expect(page.locator("h1")).toHaveText("Help");
});

test("Documents validate, preserve hostile literals, and download all seven English PDFs", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await start(page);
  await go(page, "documents");
  await expect(page.locator(".template-choice")).toHaveCount(7);

  await page.locator('[data-doc-action="download"]').click();
  await expect(page.locator("#draftForm :invalid").first()).toBeVisible();

  const templateIds = await page.locator(".template-choice").evaluateAll((buttons) =>
    buttons.map((button) => button.dataset.template),
  );
  for (const id of templateIds) {
    await page.locator(`[data-template="${id}"]`).click();
    const required = page.locator("#draftForm [required]");
    for (let index = 0; index < (await required.count()); index += 1) {
      const field = required.nth(index);
      const type = await field.getAttribute("type");
      await field.fill(
        type === "date"
          ? "2026-09-14"
          : index === 0
            ? '<img src=x onerror="window.__hostile=1">'
            : "Sample value",
      );
    }
    await page.locator('#draftForm button[type="submit"]').click();
    await expect(page.locator("#draftBody")).toContainText('<img src=x onerror="window.__hostile=1">');
    await expect(page.locator("#draftBody img, #draftBody script")).toHaveCount(0);
    expect(await page.evaluate(() => window.__hostile)).toBeUndefined();

    const downloadPromise = page.waitForEvent("download");
    await page.locator('[data-doc-action="download"]').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/-draft\.pdf$/);
    const bytes = await readDownload(download);
    const text = bytes.toString("latin1");
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(800);
    expect(text).toContain("<img src=x onerror=\"window.__hostile=1\">");
    expect(text).not.toMatch(/\?[?]{3,}/);
  }
});

test("lawyer demo session is local, disclosed, visible, and removable", async ({ page }) => {
  await start(page);
  await page.locator(".home-page .citizen-disclosure").first().locator("summary").click();
  const advocateEntry = page.locator('[data-action="advocate-entry"]');
  await advocateEntry.focus();
  await advocateEntry.press("Enter");
  await expect(page.locator('[role="dialog"] .close')).toBeFocused();
  await page.locator('[role="dialog"] [data-action="lawyer-signin"]').click();
  await expect(page.locator('[role="dialog"]')).toContainText("Lawyer demo session");
  await expect(page.locator('[role="dialog"]')).toContainText("Build What Moves India prototype session. This does not verify advocate identity or provide production access. No credentials are collected or stored.");
  await expect(page.locator('[role="dialog"] input')).toHaveCount(0);
  await page.locator('[role="dialog"] [data-action="lawyer-enter-session"]').focus();
  await page.locator('[role="dialog"] [data-action="lawyer-enter-session"]').press("Enter");
  await expect(page).toHaveURL(/#documents$/u);
  const badge = page.locator(".lawyer-session-badge");
  await expect(badge).toContainText("Demo lawyer session");
  await expect(badge).toHaveAttribute("data-role", "lawyer");
  await expect(badge).toHaveAttribute("data-label", "Demo lawyer session");
  await expect(badge).toHaveAttribute("data-started-at", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u);
  await expect(page.locator('[data-action="lawyer-signout"]').first()).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("ecourts-citizen-v3"))).not.toContain("lawyerSession");

  await page.locator('[data-action="menu"]:visible').click();
  await page.locator('.menu [data-action="reset"]').click();
  await expect(page.locator(".lawyer-session-badge")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".lawyer-session-badge")).toHaveCount(0);
  await page.locator(".home-page .citizen-disclosure").first().locator("summary").click();
  await expect(page.locator('[data-action="advocate-entry"]').last()).toBeVisible();

  await page.locator('[data-action="advocate-entry"]').last().click();
  await page.locator('[role="dialog"] [data-action="lawyer-signin"]').click();
  await page.locator('[role="dialog"] [data-action="lawyer-enter-session"]').click();
  await page.locator('[data-action="lawyer-signout"]').first().click();
  await expect(page.locator(".lawyer-session-badge")).toHaveCount(0);
});

test("lawyer demo session copy falls back through the Hindi locale", async ({ page }) => {
  await start(page, "hi");
  await go(page, "documents");
  await page.locator('[data-action="advocate-entry"]').last().click();
  await page.locator('[role="dialog"] [data-action="lawyer-signin"]').click();
  await expect(page.locator('[role="dialog"]')).toContainText("वकील डेमो सत्र");
  await expect(page.locator('[role="dialog"]')).toContainText("Build What Moves India प्रोटोटाइप सत्र");
});

test("lawyer session is absent from scanner request data", async ({ page }) => {
  await start(page);
  await go(page, "documents");
  await page.locator('[data-action="advocate-entry"]').last().click();
  await page.locator('[role="dialog"] [data-action="lawyer-signin"]').click();
  await page.locator('[role="dialog"] [data-action="lawyer-enter-session"]').click();
  let requestBody = "";
  await page.route("https://test.invalid/lawyer-session-paper", async (route) => {
    requestBody = route.request().postData() || "";
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ analysis: { document_type: "Order", court: "Sample Court", case_number: "DEMO-123", dates: [], parties: [], plain_language_summary: "Sample", verification_items: [], sources: [] } }) });
  });
  await page.evaluate(() => { window.ECOURTS_CONFIG = Object.freeze({ analysisEndpoint: "https://test.invalid/lawyer-session-paper" }); });
  await page.locator("#paper-upload").setInputFiles({ name: "session-paper.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });
  await page.locator(".paper-analyse").click();
  await expect(page.locator("#paper-analysis-status")).toContainText("Analysis ready");
  expect(requestBody).not.toMatch(/lawyerSession|credentials|password|otp|email|mobile|enrollment/iu);
  expect(requestBody).toMatch(/name="paper"/u);
  expect(requestBody).toMatch(/name="language"/u);
});

test("Documents export Indian-script names without blocking the PDF", async ({ page }) => {
  await start(page);
  await go(page, "documents");
  const required = page.locator("#draftForm [required]");
  for (let index = 0; index < (await required.count()); index += 1) {
    const field = required.nth(index);
    const type = await field.getAttribute("type");
    await field.fill(type === "date" ? "2026-09-14" : index === 0 ? "মাধুৰ্য শৰ্মা" : "Sample value");
  }
  const downloadPromise = page.waitForEvent("download");
  await page.locator('[data-doc-action="download"]').click();
  const download = await downloadPromise;
  const bytes = await readDownload(download);
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect(bytes.length).toBeGreaterThan(20_000);
  await expect(page.locator(".toast")).not.toContainText("English only");
});

test("Court paper intake shows selected and pending states and prevents duplicate analysis", async ({ page }) => {
  await start(page);
  await go(page, "documents");
  await expect(page.locator("#paper-intake-title")).toHaveText("Understand a Court Paper");
  await expect(page.locator("#paper-camera")).toHaveAttribute("capture", "environment");
  await expect(page.locator(".paper-analyse")).toBeDisabled();
  await expect(page.locator("#paper-analysis-status")).toHaveAttribute("role", "status");
  await expect(page.locator("#paper-analysis-status")).toHaveAttribute("aria-live", "polite");

  await page.locator("#paper-upload").setInputFiles({
    name: "sample-order.png",
    mimeType: "image/png",
    buffer: Buffer.from("sample image bytes"),
  });
  await expect(page.locator("#paper-selection")).toContainText("sample-order.png");
  await expect(page.locator("#paper-analysis-status")).toContainText("Paper selected");
  await expect(page.locator("#paper-analysis-status")).toContainText("sample-order.png");
  await expect(page.locator(".paper-analyse")).toBeEnabled();

  let requests = 0;
  await page.route("https://test.invalid/paper", async (route) => {
    requests += 1;
    await new Promise((resolve) => setTimeout(resolve, 150));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ analysis: {
        document_type: "Order",
        court: "Sample Court",
        case_number: "DEMO-123",
        dates: [],
        parties: [],
        plain_language_summary: "A sample explanation.",
        verification_items: [],
        sources: ["Page 1"],
      } }),
    });
  });
  await page.evaluate(() => { window.ECOURTS_CONFIG = Object.freeze({ analysisEndpoint: "https://test.invalid/paper" }); });
  await page.locator(".paper-analyse").click();
  await expect(page.locator("#paper-analysis-status")).toContainText(/Waiting to start|Reading the paper/);
  await expect(page.locator("#paper-upload")).toBeDisabled();
  await expect(page.locator("#paper-camera")).toBeDisabled();
  await expect(page.locator(".paper-analyse")).toBeDisabled();
  await page.locator(".paper-analyse").dispatchEvent("click");
  expect(requests).toBe(1);
  await expect(page.locator("#paper-analysis-status")).toContainText("Analysis ready");
  await expect(page.locator("#paper-analysis-result")).toContainText("A sample explanation.");
  await expect(page.locator("#paper-analysis-status")).toContainText("sample-order.png");
});

test("paper analysis matches a case, then applies derived context only after review", async ({ page }) => {
  await start(page);
  await go(page, "documents");
  await page.evaluate(() => {
    const repository = window.ECOURTS_CASE_REPOSITORY;
    window.__paperMatchArgs = null;
    window.ECOURTS_CASE_REPOSITORY = { ...repository, findMatches(args) {
      window.__paperMatchArgs = args;
      const result = repository.findMatches(args);
      return { ...result, records: result.records.map((record) => ({ ...record, type: "" })) };
    } };
  });
  await page.route("https://test.invalid/exact", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ analysis: {
      document_type: "Order",
      court: "Sample Civil Court",
      case_number: "DEMO-CIV-114-2026",
      dates: [{ label: "Next hearing", value: "2026-09-14", confidence: "high" }],
      parties: [{ role: "Petitioner", name: "Demo Petitioner A", confidence: "high" }],
      plain_language_summary: "Bring the property papers.",
      verification_items: ["Check the official order"],
      sources: ["Page 1"],
      confidence: "high",
    } }),
  }));
  await page.evaluate(() => { window.ECOURTS_CONFIG = Object.freeze({ analysisEndpoint: "https://test.invalid/exact" }); });
  await page.locator("#paper-upload").setInputFiles({ name: "exact.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });
  await page.locator(".paper-analyse").click();
  await expect.poll(() => page.evaluate(() => window.__paperMatchArgs)).toEqual({
    caseNumber: "DEMO-CIV-114-2026",
    court: "Sample Civil Court",
    parties: [{ label: "", value: "", role: "Petitioner", name: "Demo Petitioner A", confidence: "high" }],
  });
  await expect(page.locator('[data-action="open-matched-case"]')).toBeVisible();
  await expect(page.locator('.enrichment-new [data-action="add-enrichment"]')).toBeVisible();
  await page.locator('[data-action="open-matched-case"]').click();
  await expect(page.locator(".record-value")).toContainText("DEMO010002026");
  await expect(page.locator(".case-status")).toHaveText("Documents and objections");
  await expect(page.locator(".record-meaning")).toContainText("final decision");
  await expect(page.locator(".documents-block")).toContainText("Interim order");
  await expect(page.locator(".derived-case-context")).toHaveCount(0);
  await page.locator('[data-action="home"]:visible').first().click();
  await go(page, "documents");
  await page.locator('[data-action="home"]:visible').first().click();
  await go(page, "documents");
  await page.route("https://test.invalid/apply", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ analysis: { document_type: "Order", court: "Sample Civil Court", case_number: "DEMO-CIV-114-2026", dates: [{ label: "Date", value: "2026-09-14" }], parties: [{ role: "Petitioner", name: "Demo Petitioner A" }], plain_language_summary: "Review this paper.", verification_items: ["Verify"], sources: ["Page 1"], confidence: "medium" } }) }));
  await page.evaluate(() => { window.ECOURTS_CONFIG = Object.freeze({ analysisEndpoint: "https://test.invalid/apply" }); });
  await page.locator("#paper-upload").setInputFiles({ name: "apply.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });
  await page.locator(".paper-analyse").click();
  await expect(page.locator(".enrichment-new [data-action='add-enrichment']")).toHaveCount(2);
  await expect(page.locator(".derived-case-context")).toHaveCount(0);
  await page.locator(".enrichment-new [data-action='add-enrichment']").first().click();
  await expect(page.locator(".derived-case-context")).toHaveCount(0);
  await page.locator('[data-action="review-paper-apply"]').click();
  await expect(page.locator(".derived-case-context")).toContainText("From scanned paper");
  await expect(page.locator(".derived-case-context dt").first()).toHaveText("Document type");
  await page.locator('[data-action="access"]:visible').click();
  await page.locator('[data-pref="large"]').selectOption("true");
  await page.getByRole("button", { name: "Close" }).click();
  await page.locator('.case-tabs [data-go="documents"]').click();
  await page.locator('[data-action="advocate-entry"]').last().click();
  await page.locator('[role="dialog"] [data-action="lawyer-signin"]').click();
  await page.locator('[role="dialog"] [data-action="lawyer-enter-session"]').click();
  await page.locator('[data-action="lawyer-signout"]').first().click();
  await go(page, "hearing");
  await expect(page.locator(".record-value")).toContainText("DEMO010002026");
  await expect(page.locator("body")).toHaveClass(/large/);
  await page.locator('[data-action="menu"]:visible').click();
  await page.locator('.menu [data-action="reset"]').click();
  await expect(page.locator(".derived-case-context")).toHaveCount(0);
  await page.evaluate(() => history.replaceState({}, "", location.href));
  await page.reload();
  await expect(page.locator(".derived-case-context")).toHaveCount(0);
});

test("matched paper details are grouped and only selected new details are added", async ({ page }) => {
  await start(page);
  await go(page, "documents");
  await page.evaluate(() => {
    const repository = window.ECOURTS_CASE_REPOSITORY;
    window.ECOURTS_CASE_REPOSITORY = { ...repository, findMatches(args) {
      const result = repository.findMatches({ ...args, court: "" });
      return { ...result, records: result.records.map((record) => ({ ...record, type: "" })) };
    } };
  });
  await page.route("https://test.invalid/enrichment", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ analysis: {
    document_type: "Order",
    court: "Other Sample Court",
    case_number: "DEMO-CIV-114-2026",
    dates: [{ label: "Next hearing", value: "2026-09-14", confidence: "high" }],
    parties: [{ role: "Petitioner", name: "Demo Petitioner A", confidence: "high" }],
    plain_language_summary: "Synthetic comparison only.", sources: ["Page 1"], confidence: "high",
  } }) }));
  await page.evaluate(() => { window.ECOURTS_CONFIG = Object.freeze({ analysisEndpoint: "https://test.invalid/enrichment" }); });
  await page.locator("#paper-upload").setInputFiles({ name: "enrichment.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });
  await page.locator(".paper-analyse").click();
  await expect(page.locator(".enrichment-new")).toContainText("Order");
  await expect(page.locator(".enrichment-existing")).toContainText("2026-09-14");
  await expect(page.locator(".enrichment-conflict")).toContainText("Other Sample Court");
  await expect(page.locator(".enrichment-conflict [data-action='add-enrichment']")).toHaveCount(0);
  await expect(page.locator(".derived-case-context")).toHaveCount(0);
  await page.locator(".enrichment-new [data-action='add-enrichment']").click();
  await expect(page.locator(".enrichment-new [data-action='add-enrichment']")).toHaveText("Selected to add");
  await page.locator('[data-action="review-paper-apply"]').click();
  await expect(page.locator(".derived-case-context")).toContainText("Order");
  await expect(page.locator(".case-status")).toHaveText("Documents and objections");
});

test("paper party matches require an explicit candidate choice", async ({ page }) => {
  await start(page);
  await go(page, "documents");
  await page.route("https://test.invalid/ambiguous", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ analysis: { document_type: "Notice", court: "", case_number: "", dates: [], parties: [{ role: "Party", name: "Demo Petitioner A" }], plain_language_summary: "Ambiguous sample.", verification_items: [], sources: [] } }) }));
  await page.evaluate(() => { window.ECOURTS_CONFIG = Object.freeze({ analysisEndpoint: "https://test.invalid/ambiguous" }); });
  await page.locator("#paper-upload").setInputFiles({ name: "ambiguous.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });
  await page.locator(".paper-analyse").click();
  await expect(page.locator(".paper-match-ambiguous")).toBeVisible();
  await expect(page.locator('[data-action="select-matched-case"]')).toHaveCount(2);
  await expect(page.locator('[data-action="open-matched-case"]')).toHaveCount(0);
  await page.locator('[data-action="select-matched-case"]').nth(1).click();
  await page.locator('[data-action="open-matched-case"]').click();
  await expect(page.locator(".case-top h1")).toHaveText("Demo Petitioner A v. Demo Respondent C");
  await expect(page.locator(".case-status")).toHaveText("Notice to respondent");
  await expect(page.locator(".hearing-card small")).toHaveText("2026-10-05");
  await expect(page.locator(".history-block")).toContainText("Sample filing received");
  await expect(page.locator(".history-block")).toContainText("2026-10-05");
  await expect(page.locator(".documents-block")).toContainText("Sample notice");
  await expect(page.locator(".case-meta-grid")).toContainText("Demo Advocate C");
  await expect(page.locator(".case-meta-grid")).toContainText("Demo Advocate D");
  await page.locator('.journey-strip [data-stage="action"]').click();
  await expect(page.locator(".next-action-block")).toContainText("Review the next step for this sample record");
  await expect(page.locator(".next-action-block")).not.toContainText("Documents and objections");
  await expect(page.locator(".next-action-block")).not.toContainText("interim order");
  await expect(page.locator(".record-meaning")).toContainText("This sample repository record is marked Notice to respondent");
  await expect.poll(() => page.evaluate(() => window.ECOURTS_ASSISTANT_CONTEXT.get().case)).toMatchObject({
    cnr: "DEMO-CIV-114-B",
    title: "Demo Petitioner A v. Demo Respondent C",
    status: "Notice to respondent",
    nextHearing: "2026-10-05",
  });
});

for (const locale of ["as", "hi"]) {
  test(`${locale} alternate repository case keeps action and explanation localized`, async ({ page }) => {
    await start(page, locale);
    await go(page, "documents");
    const endpoint = `https://test.invalid/alternate-${locale}`;
    await page.route(endpoint, (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ analysis: { document_type: "Notice", court: "", case_number: "", dates: [], parties: [{ role: "Party", name: "Demo Petitioner A" }], plain_language_summary: "Ambiguous sample.", verification_items: [], sources: [] } }),
    }));
    await page.evaluate((analysisEndpoint) => { window.ECOURTS_CONFIG = Object.freeze({ analysisEndpoint }); }, endpoint);
    await page.locator("#paper-upload").setInputFiles({ name: `alternate-${locale}.pdf`, mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });
    await page.locator(".paper-analyse").click();
    await page.locator('[data-action="select-matched-case"]').nth(1).click();
    await page.locator('[data-action="open-matched-case"]').click();
    await page.locator('.journey-strip [data-stage="action"]').click();
    await expect(page.locator(".next-action-block")).not.toContainText("Documents and objections");
    await expect(page.locator(".next-action-block")).not.toContainText("interim order");
    await expect(page.locator(".record-meaning")).toContainText(locale === "as" ? "এই নমুনা ৰিপ'জিটৰী ৰেকৰ্ডৰ অৱস্থা Notice to respondent" : "इस नमूना रिपॉज़िटरी रिकॉर्ड की स्थिति Notice to respondent");
  });
}

test("paper analysis with no repository match stays an honest no-match", async ({ page }) => {
  await start(page);
  await go(page, "documents");
  await page.route("https://test.invalid/none", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ analysis: { document_type: "Order", court: "Unknown Court", case_number: "NOT-A-DEMO", dates: [], parties: [], plain_language_summary: "No match.", verification_items: [], sources: [] } }) }));
  await page.evaluate(() => { window.ECOURTS_CONFIG = Object.freeze({ analysisEndpoint: "https://test.invalid/none" }); });
  await page.locator("#paper-upload").setInputFiles({ name: "none.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });
  await page.locator(".paper-analyse").click();
  await expect(page.locator(".paper-match-none")).toContainText("No matching sample case");
  await expect(page.locator('[data-action="open-matched-case"]')).toHaveCount(0);
  await expect(page.locator('[data-action="review-paper-apply"]')).toHaveCount(0);
  await expect(page).toHaveURL(/#documents$/u);
});

test("malicious paper analysis stays literal text", async ({ page }) => {
  await start(page);
  await go(page, "documents");
  await page.route("https://test.invalid/malicious", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ analysis: { document_type: "<img src=x onerror=alert(1)>", court: "<b>court</b>", case_number: "<script>alert(1)</script>", dates: [{ label: "<i>date</i>", value: "<em>value</em>" }], parties: [{ role: "<b>role</b>", name: "<u>party</u>" }], plain_language_summary: "<strong>literal summary</strong>", verification_items: ["<script>bad</script>"], sources: ["<img src=x>"], confidence: "<b>low</b>" } }) }));
  await page.evaluate(() => {
    const repository = window.ECOURTS_CASE_REPOSITORY;
    window.ECOURTS_CASE_REPOSITORY = { ...repository, findMatches() { return { kind: "exact", records: [{ id: "<bad-id>", cnr: "<bad-cnr>", title: "<img src=x onerror=alert(2)>", court: "<script>repository court</script>", dataLabel: "Sample data - hackathon prototype." }] }; } };
  });
  await page.evaluate(() => { window.ECOURTS_CONFIG = Object.freeze({ analysisEndpoint: "https://test.invalid/malicious" }); });
  await page.locator("#paper-upload").setInputFiles({ name: "malicious.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });
  await page.locator(".paper-analyse").click();
  await expect(page.locator("#paper-analysis-result")).toContainText("<strong>literal summary</strong>");
  await expect(page.locator("#paper-analysis-result strong")).toHaveCount(0);
  await expect(page.locator("#paper-analysis-result script")).toHaveCount(0);
  await expect(page.locator(".paper-match-candidate")).toContainText("<img src=x onerror=alert(2)>");
  await expect(page.locator(".paper-match-candidate img, .paper-match-candidate script")).toHaveCount(0);
});

test("Court paper intake keeps unavailable and invalid states honest", async ({ page }) => {
  await start(page);
  await go(page, "documents");
  await page.locator("#paper-upload").setInputFiles({
    name: "sample-order.png",
    mimeType: "image/png",
    buffer: Buffer.from("sample image bytes"),
  });
  await page.evaluate(() => { window.ECOURTS_CONFIG = Object.freeze({ analysisEndpoint: "" }); });
  await page.locator(".paper-analyse").click();
  await expect(page.locator("#paper-analysis-status")).toContainText("Analysis could not be completed");
  await expect(page.locator("#paper-analysis-result")).toContainText("Secure analysis is not connected yet");
  await expect(page.locator("#paper-analysis-result")).toContainText("Try again");

  await page.locator("#paper-upload").setInputFiles({
    name: "unsafe.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg></svg>"),
  });
  await expect(page.locator("#paper-selection")).toHaveClass(/invalid/);
  await expect(page.locator("#paper-analysis-status")).toContainText("unsafe.svg");
  await expect(page.locator(".paper-analyse")).toBeDisabled();
});

test("Court paper intake offers a retry after a routed analysis failure", async ({ page }) => {
  await start(page);
  await go(page, "documents");
  let requests = 0;
  await page.route("https://test.invalid/retry", async (route) => {
    requests += 1;
    if (requests === 1) {
      await route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ error: "temporary" }) });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ analysis: {
        document_type: "Notice",
        court: "Sample Court",
        case_number: "DEMO-456",
        dates: [],
        parties: [],
        plain_language_summary: "Retry succeeded.",
        verification_items: [],
        sources: ["Page 1"],
      } }),
    });
  });
  await page.evaluate(() => { window.ECOURTS_CONFIG = Object.freeze({ analysisEndpoint: "https://test.invalid/retry" }); });
  await page.locator("#paper-upload").setInputFiles({
    name: "retry-paper.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 synthetic test"),
  });
  await page.locator(".paper-analyse").click();
  await expect(page.locator("#paper-analysis-result")).toContainText("The paper could not be analysed");
  await expect(page.locator("#paper-analysis-status")).toContainText("retry-paper.pdf");
  await page.locator("[data-action='retry-paper']").click();
  await expect(page.locator("#paper-analysis-status")).toContainText("Paper selected");
  await expect(page.locator(".paper-analyse")).toBeEnabled();
  await page.locator(".paper-analyse").click();
  await expect(page.locator("#paper-analysis-result")).toContainText("Retry succeeded.");
  expect(requests).toBe(2);
});

test("Court paper intake ignores a response after its result is removed", async ({ page }) => {
  await start(page);
  await go(page, "documents");
  let releaseResponse;
  const responseReady = new Promise((resolve) => { releaseResponse = resolve; });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.route("https://test.invalid/detached", async (route) => {
    await responseReady;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ analysis: {
        document_type: "Order",
        court: "Sample Court",
        case_number: "DEMO-DETACHED",
        dates: [],
        parties: [],
        plain_language_summary: "This response must not render.",
        verification_items: [],
        sources: ["Page 1"],
      } }),
    });
  });
  await page.evaluate(() => { window.ECOURTS_CONFIG = Object.freeze({ analysisEndpoint: "https://test.invalid/detached" }); });
  await page.locator("#paper-upload").setInputFiles({
    name: "detached-result.png",
    mimeType: "image/png",
    buffer: Buffer.from("synthetic image bytes"),
  });
  await page.locator(".paper-analyse").click();
  await expect(page.locator("#paper-analysis-status")).toContainText("Reading the paper");
  await page.locator("#paper-analysis-result").evaluate((element) => element.remove());
  releaseResponse();
  await page.waitForTimeout(100);
  expect(pageErrors).toEqual([]);
  expect(await page.locator("#paper-analysis-result").count()).toBe(0);
  expect(await page.evaluate(() => window.ECOURTS_ASSISTANT_CONTEXT.get().paper)).toBeNull();
});

test("Court paper intake resets an active request when the page rerenders", async ({ page }) => {
  await start(page);
  await go(page, "documents");
  let releaseResponse;
  let responseResolved = false;
  const responseReady = new Promise((resolve) => { releaseResponse = resolve; });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.route("https://test.invalid/rerender", async (route) => {
    await responseReady;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ analysis: {
        document_type: "Order",
        court: "Sample Court",
        case_number: "DEMO-RERENDER",
        dates: [],
        parties: [],
        plain_language_summary: "This late response must not render.",
        verification_items: [],
        sources: ["Page 1"],
      } }),
    });
    responseResolved = true;
  });
  await page.evaluate(() => { window.ECOURTS_CONFIG = Object.freeze({ analysisEndpoint: "https://test.invalid/rerender" }); });
  await page.locator("#paper-upload").setInputFiles({
    name: "rerender-paper.png",
    mimeType: "image/png",
    buffer: Buffer.from("synthetic image bytes"),
  });
  await page.locator(".paper-analyse").click();
  await expect(page.locator("#paper-analysis-status")).toContainText("Reading the paper");
  await page.locator('[data-action="language"]:visible').click();
  await page.locator('[data-language="hi"]').click();
  await expect(page.locator("#paper-analysis-status")).toHaveText(/कागज़ चुना गया.*rerender-paper\.png/);
  await expect(page.locator("#paper-upload")).toBeEnabled();
  await expect(page.locator(".paper-analyse")).toBeEnabled();
  releaseResponse();
  await expect.poll(() => responseResolved).toBe(true);
  await expect(page.locator("#paper-analysis-result")).toBeEmpty();
  expect(pageErrors).toEqual([]);
  expect(await page.evaluate(() => window.ECOURTS_ASSISTANT_CONTEXT.get().paper)).toBeNull();
});

for (const locale of ["as", "hi"]) {
  test(`${locale} derived paper context is localized`, async ({ page }) => {
    await start(page, locale);
    await go(page, "documents");
    await page.evaluate(() => {
      const repository = window.ECOURTS_CASE_REPOSITORY;
      window.ECOURTS_CASE_REPOSITORY = { ...repository, findMatches(args) { const result = repository.findMatches(args); return { ...result, records: result.records.map((record) => ({ ...record, type: "" })) }; } };
    });
    const endpoint = `https://test.invalid/context-${locale}`;
    await page.route(endpoint, (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ analysis: { document_type: "Order", court: "Sample Civil Court", case_number: "DEMO-CIV-114-2026", dates: [], parties: [{ role: "Party", name: "Demo Petitioner A" }], plain_language_summary: "Review", verification_items: [], sources: [] } }),
    }));
    await page.evaluate((analysisEndpoint) => { window.ECOURTS_CONFIG = Object.freeze({ analysisEndpoint }); }, endpoint);
    await page.locator("#paper-upload").setInputFiles({ name: `context-${locale}.pdf`, mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });
    await page.locator(".paper-analyse").click();
    await page.locator('.enrichment-new [data-action="add-enrichment"]').first().click();
    await page.locator('[data-action="review-paper-apply"]').click();
    await expect(page.locator(".derived-case-context .kicker")).toHaveText(locale === "as" ? "স্কেন কৰা কাগজৰ পৰা · প্ৰট'টাইপ বিশ্লেষণ" : "स्कैन किए कागज़ से · प्रोटोटाइप विश्लेषण");
    await expect(page.locator(".derived-case-context h2")).toHaveText(locale === "as" ? "নথি পৰ্যালোচনা" : "दस्तावेज़ समीक्षा");
  });

  test(`${locale} paper analysis localizes missing values`, async ({ page }) => {
    await start(page, locale);
    await go(page, "documents");
    const endpoint = `https://test.invalid/not-found-${locale}`;
    await page.route(endpoint, (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ analysis: {} }),
    }));
    await page.evaluate((analysisEndpoint) => { window.ECOURTS_CONFIG = Object.freeze({ analysisEndpoint }); }, endpoint);
    await page.locator("#paper-upload").setInputFiles({
      name: `missing-${locale}.png`,
      mimeType: "image/png",
      buffer: Buffer.from("synthetic image bytes"),
    });
    await page.locator(".paper-analyse").click();
    await expect(page.locator("#paper-analysis-result")).toContainText(locale === "as" ? "পোৱা নগ'ল" : "नहीं मिला");
    await expect(page.locator("#paper-analysis-result")).toContainText(locale === "as" ? "আদালত" : "अदालत");
  });
}

for (const locale of ["as", "hi"]) {
  test(`${locale} Documents localize interface and keep the English draft boundary`, async ({ page }) => {
    await start(page, locale);
    await go(page, "documents");
    await expect(page.locator("#paper-analysis-status")).toHaveText(
      locale === "as" ? "কাগজৰ বাবে সাজু" : "कागज़ के लिए तैयार",
    );
    await expect(page.locator("h1")).toHaveText(
      await translated(page, locale, "documents.heading"),
    );
    await expect(page.locator(".pdf-boundary")).toHaveText(
      await translated(page, locale, "documents.pdfBoundary.notice"),
    );
    await expect(page.locator(".template-choice")).toHaveCount(7);
    await expect(page.locator(".draft-label")).toHaveText(
      await translated(page, locale, "documents.preview.status"),
    );
    const required = page.locator("#draftForm [required]");
    for (let index = 0; index < (await required.count()); index += 1) {
      const field = required.nth(index);
      const type = await field.getAttribute("type");
      await field.fill(type === "date" ? "2026-09-14" : "Sample English value");
    }
    const downloadPromise = page.waitForEvent("download");
    await page.locator('[data-doc-action="download"]').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("legal-aid-application-draft.pdf");
    const text = (await readDownload(download)).toString("latin1");
    expect(text.startsWith("%PDF-")).toBe(true);
    expect(text).toContain("LEGAL AID APPLICATION");
    expect(text).toContain("Sample English value");
    expect(text).not.toContain("????");
  });
}

test("Switching templates asks before discarding a non-empty draft", async ({ page }) => {
  await start(page);
  await go(page, "documents");
  await page.locator('#draftForm [name="name"]').fill("Kept Applicant");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.locator('[data-template="demand"]').click();
  await expect(page.locator(".template-choice.active")).toHaveAttribute(
    "data-template",
    "legalAid",
  );
  await expect(page.locator('#draftForm [name="name"]')).toHaveValue(
    "Kept Applicant",
  );
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator('[data-template="demand"]').click();
  await expect(page.locator(".template-choice.active")).toHaveAttribute(
    "data-template",
    "demand",
  );
  await expect(page.locator('#draftForm [name="sender"]')).toHaveValue("");
});

const officialUrls = [
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
];

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 375, height: 812 },
]) {
  for (const locale of locales) {
    test(`${locale} Courts & Services at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await start(page, locale);
      await go(page, "courts");
      await page.locator(".official-directory > summary").click();
      await expect(page.locator(".courts-guide")).toContainText(
        await translated(page, locale, "courts.heading"),
      );
      const districtTab = page.locator('[data-tab="district"]');
      const highTab = page.locator('[data-tab="high"]');
      await expect(districtTab).toHaveAttribute("aria-selected", "true");
      await districtTab.focus();
      await page.keyboard.press("ArrowRight");
      await expect(highTab).toHaveAttribute("aria-selected", "true");
      await expect(highTab).toBeFocused();
      await page.keyboard.press("Home");
      await expect(districtTab).toHaveAttribute("aria-selected", "true");
      await expect(page.locator(".service-row a.official-link")).toHaveCount(9);
      for (const url of officialUrls.slice(0, 3).concat(officialUrls.slice(6))) {
        await expect(page.locator(`a.official-link[href="${url}"]`)).toHaveCount(1);
      }
      await page.keyboard.press("End");
      await expect(highTab).toHaveAttribute("aria-selected", "true");
      await expect(page.locator(".service-row a.official-link")).toHaveCount(9);
      for (const url of officialUrls.slice(3)) {
        await expect(page.locator(`a.official-link[href="${url}"]`)).toHaveCount(1);
      }
      const first = page.locator("a.official-link").first();
      await expect(first).toHaveAttribute("target", "_blank");
      await expect(first).toHaveAttribute("rel", "noopener noreferrer");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
      const tabHeight = await highTab.evaluate((node) => node.getBoundingClientRect().height);
      expect(tabHeight).toBeGreaterThanOrEqual(44);
    });
  }
}

test("Open Help from a case returns with Back, and Home is always available", async ({ page }) => {
  await start(page);
  await expect(page.locator('.brand[data-action="home"]')).toBeVisible();
  await go(page, "hearing");
  await expect(page.locator("h1")).toContainText("Demo Petitioner A");
  await expect(page.locator(".page-nav [data-action='back']")).toBeVisible();
  await page.locator(".case-help").click();
  await expect(page.locator("h1")).toHaveText("Help");
  expect(page.url()).toMatch(/#help/u);
  await page.locator(".page-nav [data-action='back']").click();
  await expect(page.locator("h1")).toContainText("Demo Petitioner A");
  await page.locator('.brand[data-action="home"]').click();
  await expect(page.locator("h1")).toHaveText(
    "eCourts",
  );
});

test("Mobile dock and Back keep navigation inside the site without duplicate Home controls", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await start(page);
  await expect(page.locator(".dock")).toBeVisible();
  await expect(page.locator('.dock [data-action="home"]')).toBeVisible();
  await expect(page.locator(".page-nav")).toHaveCount(0);
  await go(page, 'help');
  await expect(page.locator("h1")).toHaveText("Help");
  await expect(page.locator(".page-nav [data-action='back']")).toBeVisible();
  await page.locator(".page-nav [data-action='back']").click();
  await expect(page.locator("h1")).toHaveText(
    "eCourts",
  );
  await go(page, 'documents');
  await expect(page.locator("h1")).toHaveText(
    await translated(page, "en", "documents.heading"),
  );
  await page.locator('.dock [data-action="home"]').click();
  await expect(page.locator("h1")).toHaveText(
    "eCourts",
  );
});
