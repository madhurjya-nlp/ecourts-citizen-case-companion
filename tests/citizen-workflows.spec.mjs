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
  await expect(page.locator(".home-path")).toHaveCount(2);
  await expect(page.locator(".home-path").first()).toContainText("I already have a case");
  await expect(page.locator("#home-search")).toBeVisible();
  await expect(page.locator(".home-common .common-action")).toHaveCount(4);
  await page.locator("#home-query").fill("DEMO010002026");
  await page.locator("#home-search").evaluate((form) => form.requestSubmit());
  await expect(page).toHaveURL(/#finder\/cnr$/u);
  await page.locator('[data-action="home"]:visible').first().click();
  await page.locator('[data-action="assisted-entry"]:visible').first().click();
  await expect(page).toHaveURL(/#finder\/cnr$/u);
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
  await expect(page.locator(".journey-strip button")).toHaveCount(5);
  await expect(page.locator('[data-action="voice-search"]')).toBeVisible();
  await page.locator('[data-action="sample-preview"]').click();
  await page.locator('[data-action="open-sample"]').click();
  await expect(page.locator(".preparation-block")).toBeVisible();
  await page.locator('[data-role="accused"]').click();
  await expect(page.locator('[data-role="accused"]')).toHaveClass(/active/);
  await page.locator('[data-action="whatsapp"]').last().click();
  await expect(page.locator(".phone-preview")).toBeVisible();
  await expect(page.locator(".phone-preview")).toContainText("Simulation - not connected");
});

test("case journey separates understanding, next action, and preparation", async ({ page }) => {
  await start(page);
  await go(page, "hearing");
  await expect(page).toHaveURL(/#case\/understand$/u);
  await expect(page.locator('.journey-strip [data-stage="understand"]')).toHaveAttribute("aria-current", "step");
  await page.locator('.journey-strip [data-stage="action"]').click();
  await expect(page).toHaveURL(/#case\/action$/u);
  await expect(page.locator(".next-action-block")).toBeVisible();
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

for (const locale of ["as", "hi"]) {
  test(`${locale} Documents localize interface and keep the English draft boundary`, async ({ page }) => {
    await start(page, locale);
    await go(page, "documents");
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
      await expect(page.locator("h1")).toHaveText(
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
    await translated(page, "en", "home.heading"),
  );
});

test("Mobile dock and Back keep navigation inside the site without duplicate Home controls", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await start(page);
  await expect(page.locator(".dock")).toBeVisible();
  await expect(page.locator('.dock [data-action="home"]')).toBeVisible();
  await expect(page.locator(".page-nav")).toHaveCount(0);
  await page.locator('.dock [data-go="help"]').click();
  await expect(page.locator("h1")).toHaveText("Help");
  await expect(page.locator(".page-nav [data-action='back']")).toBeVisible();
  await page.locator(".page-nav [data-action='back']").click();
  await expect(page.locator("h1")).toHaveText(
    await translated(page, "en", "home.heading"),
  );
  await page.locator('.dock [data-go="documents"]').click();
  await expect(page.locator("h1")).toHaveText(
    await translated(page, "en", "documents.heading"),
  );
  await page.locator('.dock [data-action="home"]').click();
  await expect(page.locator("h1")).toHaveText(
    await translated(page, "en", "home.heading"),
  );
});
