import { test, expect } from "@playwright/test";

const locales = ["en", "as", "hi"];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 375, height: 812 },
];

async function translated(page, locale, path) {
  return page.evaluate(
    ({ locale, path }) => window.ECOURTS_I18N.resolve(locale, path),
    { locale, path },
  );
}

async function chooseLocale(page, locale) {
  if (locale === "en") return;
  await page.locator('[data-action="language"]:visible').click();
  await page.locator(`[data-language="${locale}"]`).click();
}

async function openAssistedFinder(page, locale) {
  await page.goto("/index.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await chooseLocale(page, locale);
  const expectedDescriptor = await translated(
    page,
    locale,
    "shared.prototype.descriptor",
  );
  await expect(page.locator(".prototype-badge")).toHaveText(expectedDescriptor);
  await expect(page.locator(".prototype-badge")).toBeVisible();
  await page.locator('.home-page .citizen-disclosure > summary').last().click();
  await page.locator(".assisted-entry").click();
  await expect(page.locator(".assisted-notice")).toContainText(
    await translated(page, locale, "finder.assisted.heading"),
  );
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  expect(
    await page.evaluate(() => localStorage.getItem("ecourts-citizen-v3") || ""),
  ).not.toContain("assisted");
}

async function expectResult(page, locale) {
  const result = page.locator(".finder-result");
  await expect(result).toContainText("Demo Petitioner A v. Demo Respondent B");
  await expect(result).toContainText("DEMO010002026");
  await expect(result).toContainText("Demo Advocate A");
  await expect(result).toContainText("Demo Advocate B");
  await expect(result).toContainText(
    await translated(page, locale, "finder.result.statusSample"),
  );
  await expect(result.locator("dl div")).toHaveCount(4);
  await expect(result.locator(".sample-disclosure")).toBeVisible();
}

test("stored state is validated and transient fields never restore", async ({
  page,
}) => {
  await page.goto("/index.html");
  await page.evaluate(() => {
    localStorage.setItem(
      "ecourts-citizen-v3",
      JSON.stringify({
        assisted: true,
        profile: { name: "Stored Citizen Name" },
        selected: "UNTRUSTED-CASE",
        prefs: { lang: "xx", contrast: "yes", large: 1, reduce: null },
      }),
    );
  });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".assisted-notice")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("Stored Citizen Name");
  await expect(page.locator("body")).not.toHaveClass(/high|large|reduce/);
  const restored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("ecourts-citizen-v3")),
  );
  expect(restored).toEqual({
    prefs: { lang: "en", contrast: false, large: false, reduce: false },
    selected: null,
    tourSeen: false,
  });
});

for (const viewport of viewports) {
  for (const locale of locales) {
    test(`${locale} Finder at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const consoleProblems = [];
      page.on("console", (message) => {
        if (["error", "warning"].includes(message.type()))
          consoleProblems.push(`${message.type()}: ${message.text()}`);
      });
      page.on("pageerror", (error) =>
        consoleProblems.push(`pageerror: ${error.message}`),
      );

      await openAssistedFinder(page, locale);
      const expectedSequence = ["paper", "paper", "number", "paper", "number"];
      for (let run = 0; run < 5; run += 1) {
        await page.locator('[data-tab="cnr"]').focus();
        for (const [key, id] of [
          ["ArrowRight", expectedSequence[0]],
          ["End", expectedSequence[1]],
          ["Home", expectedSequence[2]],
          ["ArrowLeft", expectedSequence[3]],
          ["Home", expectedSequence[4]],
        ]) {
          await page.keyboard.press(key);
          await expect(page.locator(`[data-tab="${id}"]`)).toBeFocused();
          await expect(page.locator(`[data-tab="${id}"]`)).toHaveAttribute(
            "aria-selected",
            "true",
          );
        }
      }

      await page.locator('[data-tab="cnr"]').click();
      await page.locator("#query").fill("DEMO010002026");
      await page.locator("#query").press("Enter");
      await expect(page.locator('[role="dialog"]')).toHaveCount(0);
      await expectResult(page, locale);

      const metrics = await page.evaluate(() => ({
        pageOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
        badgeOverflow: (() => {
          const badge = document.querySelector(".prototype-badge");
          return badge.scrollWidth > badge.clientWidth;
        })(),
      }));
      expect(metrics.pageOverflow).toBe(false);
      expect(metrics.badgeOverflow).toBe(false);
      expect(consoleProblems).toEqual([]);
    });
  }
}

for (const locale of locales) {
  test(`${locale} Finder keeps all five search and upload modes together`, async ({
    page,
  }) => {
    await page.goto("/index.html#finder/paper");
    await chooseLocale(page, locale);

    await expect(page).toHaveURL(/#finder\/paper$/u);
    await expect(page.locator(".finder-page h1")).toHaveCount(1);
    await expect(page.locator(".finder .tabs [role='tab']")).toHaveCount(5);
    await expect(page.locator('[data-tab="paper"]')).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.locator("#finder-panel .paper-intake")).toBeVisible();
    await expect(page.locator("#finder-panel #paper-upload")).toBeVisible();
    await expect(page.locator("#finder-panel h1")).toHaveCount(0);
    await expect(page.locator(".dock [data-go='finder']")).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.locator(".dock [data-go='help']")).not.toHaveAttribute(
      "aria-current",
      "page",
    );

    for (const mode of ["number", "party", "advocate", "cnr", "paper"]) {
      await page.locator(`[data-tab="${mode}"]`).click();
      await expect(page).toHaveURL(new RegExp(`#finder/${mode}$`, "u"));
      await expect(page.locator(`[data-tab="${mode}"]`)).toHaveAttribute(
        "aria-selected",
        "true",
      );
    }
  });
}

test("mobile Finder shows all five modes without horizontal scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html#finder/number");

  const tabs = page.locator(".finder .tabs");
  await expect(tabs.locator("[role='tab']")).toHaveCount(5);
  for (const mode of ["number", "party", "advocate", "cnr", "paper"]) {
    await expect(tabs.locator(`[data-tab="${mode}"]`)).toBeVisible();
  }

  const metrics = await tabs.evaluate((tabList) => ({
    display: getComputedStyle(tabList).display,
    clientWidth: tabList.clientWidth,
    scrollWidth: tabList.scrollWidth,
  }));
  expect(metrics.display).toBe("grid");
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);

  const tabListBox = await tabs.boundingBox();
  const uploadBox = await tabs.locator('[data-tab="paper"]').boundingBox();
  expect(tabListBox).not.toBeNull();
  expect(uploadBox).not.toBeNull();
  expect(uploadBox.width).toBeGreaterThan(tabListBox.width * 0.9);
});

test("Finder upload mode uses the shared scanner selection state", async ({
  page,
}) => {
  await page.goto("/index.html#finder/paper");
  await expect(page.locator("#paper-analysis-status")).toContainText(
    "Ready for a paper",
  );

  await page.locator("#paper-upload").setInputFiles({
    name: "finder-safe-paper.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 synthetic test fixture"),
  });

  await expect(page.locator("#paper-selection")).toContainText(
    "finder-safe-paper.pdf",
  );
  await expect(page.locator("#paper-analysis-status")).toContainText(
    "Paper selected",
  );
  await expect(page.locator(".paper-analyse")).toBeEnabled();
});

test("Finder paper analysis advances its progress indicator", async ({ page }) => {
  await page.goto("/index.html#finder/paper");
  await page.route("https://test.invalid/finder-progress", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        analysis: {
          document_type: "Notice",
          court: "Sample Court",
          case_number: "DEMO-PROGRESS",
          dates: [],
          parties: [],
          plain_language_summary: "Progress test result.",
          verification_items: [],
          sources: ["Page 1"],
        },
      }),
    }),
  );
  await page.evaluate(() => {
    window.ECOURTS_CONFIG = Object.freeze({
      analysisEndpoint: "https://test.invalid/finder-progress",
    });
  });
  await expect(page.locator(".guided-steps li")).toHaveCount(3);
  await expect(page.locator(".guided-steps li").first()).toContainText("Upload");
  await expect(page.locator(".guided-steps li").first()).toHaveAttribute(
    "aria-current",
    "step",
  );
  await page.locator("#paper-upload").setInputFiles({
    name: "finder-progress.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 synthetic test fixture"),
  });
  await page.locator(".paper-analyse").click();
  await expect(page.locator(".guided-steps li").nth(2)).toHaveAttribute(
    "aria-current",
    "step",
  );
  await expect(page.locator("#paper-analysis-result")).toContainText(
    "Progress test result.",
  );
});

test("Finder paper analysis survives tab reconstruction", async ({ page }) => {
  await page.goto("/index.html#finder/paper");
  await page.route("https://test.invalid/finder-reconstruct", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        analysis: {
          document_type: "Order",
          court: "Sample Court",
          case_number: "DEMO-RECONSTRUCT",
          dates: [],
          parties: [],
          plain_language_summary: "Reconstructed analysis remains visible.",
          verification_items: [],
          sources: ["Page 1"],
        },
      }),
    }),
  );
  await page.evaluate(() => {
    window.ECOURTS_CONFIG = Object.freeze({
      analysisEndpoint: "https://test.invalid/finder-reconstruct",
    });
  });
  await page.locator("#paper-upload").setInputFiles({
    name: "finder-reconstruct.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 synthetic test fixture"),
  });
  await page.locator(".paper-analyse").click();
  await expect(page.locator("#paper-analysis-result")).toContainText(
    "Reconstructed analysis remains visible.",
  );

  await page.locator('[data-tab="number"]').click();
  await page.locator('[data-tab="paper"]').click();
  await expect(page.locator("#paper-analysis-result")).toContainText(
    "Reconstructed analysis remains visible.",
  );
  await expect(page.locator(".guided-steps li").nth(2)).toHaveAttribute(
    "aria-current",
    "step",
  );
});

test("leaving Finder paper during analysis cancels its busy lifecycle", async ({
  page,
}) => {
  let releaseResponse;
  const responseReady = new Promise((resolve) => {
    releaseResponse = resolve;
  });
  await page.goto("/index.html#finder/paper");
  await page.route("https://test.invalid/finder-cancel", async (route) => {
    await responseReady;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        analysis: {
          document_type: "Order",
          court: "Sample Court",
          case_number: "DEMO-CANCELLED",
          dates: [],
          parties: [],
          plain_language_summary: "Cancelled response must not render.",
          verification_items: [],
          sources: ["Page 1"],
        },
      }),
    });
  });
  await page.evaluate(() => {
    window.ECOURTS_CONFIG = Object.freeze({
      analysisEndpoint: "https://test.invalid/finder-cancel",
    });
  });
  await page.locator("#paper-upload").setInputFiles({
    name: "finder-cancel.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 synthetic test fixture"),
  });
  await page.locator(".paper-analyse").click();
  await expect(page.locator("#paper-analysis-status")).toContainText(
    "Reading the paper",
  );

  await page.locator('[data-tab="number"]').click();
  await page.locator('[data-tab="paper"]').click();
  await expect(page.locator("#paper-analysis-status")).toContainText(
    "Paper selected",
  );
  await expect(page.locator("#paper-upload")).toBeEnabled();
  await expect(page.locator(".paper-analyse")).toBeEnabled();

  releaseResponse();
  await page.waitForTimeout(100);
  await expect(page.locator("#paper-analysis-result")).not.toContainText(
    "Cancelled response must not render.",
  );
});
