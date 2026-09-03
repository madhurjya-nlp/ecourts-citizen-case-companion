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
      const expectedSequence = ["number", "paper", "cnr", "paper", "cnr"];
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
