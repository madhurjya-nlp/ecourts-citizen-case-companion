import { test, expect } from "@playwright/test";

async function start(page, locale = "en") {
  await page.goto("/index.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator('[data-action="tour-skip"]').click();
  if (locale !== "en") {
    await page.locator('[data-action="language"]:visible').click();
    await page.locator(`[data-language="${locale}"]`).click();
  }
}

test("NYK opens an accessible session-only drawer and restores focus", async ({
  page,
}) => {
  await start(page);
  const launcher = page.locator("[data-nyk-launcher]");
  await expect(launcher).toHaveAccessibleName("Open NYK AI assistance");
  await launcher.focus();
  await launcher.click();
  await expect(page.getByRole("dialog", { name: "NYK AI" })).toBeVisible();
  await expect(page.locator(".nyk-starter")).toHaveCount(4);
  await expect(page.locator(".nyk-form textarea")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".nyk-panel")).toHaveCount(0);
  await expect(launcher).toBeFocused();
});

for (const [locale, heading] of [
  ["as", "মই কেনেকৈ সহায় কৰিব পাৰোঁ?"],
  ["hi", "मैं कैसे सहायता करूँ?"],
]) {
  test(`NYK localises its ${locale} interface`, async ({ page }) => {
    await start(page, locale);
    await page.locator("[data-nyk-launcher]").click();
    await expect(page.locator(".nyk-intro h2")).toHaveText(heading);
    await expect(page.locator(".nyk-starter")).toHaveCount(4);
  });
}

test("NYK sends compact case context and renders only official source links", async ({
  page,
}) => {
  let requestBody;
  await page.route("**/chat", async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        answer: "The record shows a document-related next step.",
        answer_type: "case",
        sources: [
          { title: "eCourts", url: "https://ecourts.gov.in/" },
          { title: "Unsafe", url: "https://example.com/" },
        ],
        actions: [
          { label: "See next action", route: "case/action" },
          { label: "Unsafe route", route: "javascript:alert(1)" },
        ],
        boundary: "Verify this against the official order.",
        web_search_used: false,
      }),
    });
  });
  await start(page);
  await page.locator('[data-go="finder"]:visible').first().click();
  await page.locator('[data-action="sample-preview"]').click();
  await page.locator('[data-action="open-sample"]').click();
  await page.locator("[data-nyk-launcher]").click();
  await page.locator(".nyk-starter").first().click();
  await expect(page.locator(".nyk-message.assistant")).toContainText(
    "document-related next step",
  );
  await expect(page.locator(".nyk-sources a")).toHaveCount(1);
  await expect(page.locator(".nyk-response-actions button")).toHaveCount(1);
  expect(requestBody.case.cnr).toBe("DEMO010002026");
  expect(requestBody).not.toHaveProperty("profile");
  expect(requestBody).not.toHaveProperty("file");
  expect(JSON.stringify(requestBody)).not.toContain("318204");
});

test("NYK formats answers and shows a meaningful loading state", async ({
  page,
}) => {
  await page.route("**/chat", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        answer:
          "**What it means:** The court has not decided the case.\n\n**Key points:**\n- Read the latest order\n- Check the hearing date",
        answer_type: "legal_reference",
        sources: [],
        actions: [],
        boundary: "Verify this against the official record.",
        web_search_used: false,
      }),
    });
  });
  await start(page);
  await page.locator("[data-nyk-launcher]").click();
  await page.locator(".nyk-starter").first().click();
  await expect(page.locator(".nyk-loading")).toBeVisible();
  await expect(page.locator(".nyk-loading-step")).toHaveCount(3);
  const answer = page.locator(".nyk-message.assistant").last();
  await expect(answer.locator(".nyk-answer-type")).toHaveText(
    "Legal reference",
  );
  await expect(answer.locator("strong")).toContainText([
    "What it means:",
    "Key points:",
  ]);
  await expect(answer.locator("li")).toHaveCount(2);
  await expect(answer).not.toContainText("**");
});

test("two failed searches offer contextual help without an API request", async ({
  page,
}) => {
  let chatCalls = 0;
  await page.route("**/chat", async (route) => {
    chatCalls += 1;
    await route.abort();
  });
  await start(page);
  const form = page.locator("#home-search");
  await form.locator("input").fill("unknown one");
  await form.locator('button[type="submit"]').click();
  const search = page.locator("#search");
  await search.locator("input").fill("unknown two");
  await search.locator('button[type="submit"]').click();
  await expect(page.locator(".nyk-prompt")).toBeVisible();
  expect(chatCalls).toBe(0);
  await page.locator(".nyk-dismiss").click();
  await expect(page.locator(".nyk-prompt")).toHaveCount(0);
});

test("NYK becomes a full-width mobile sheet without covering the bottom inset", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  await page.locator("[data-nyk-launcher]").click();
  const box = await page.locator(".nyk-panel").boundingBox();
  expect(box.width).toBe(390);
  expect(box.height).toBeGreaterThan(800);
  await expect(page.locator(".nyk-form textarea")).toBeVisible();
});

test("NYK wraps long legal references in a mobile chat layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/chat", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        answer: "**Official reference:** https://www.indiacode.nic.in/bitstream/123456789/15240/1/constitution_of_india.pdf?very-long-reference-value=1234567890. This must remain readable on a phone.",
        answer_type: "legal_reference",
        sources: [],
        actions: [],
        boundary: "Verify this against the official text.",
        web_search_used: false,
      }),
    }),
  );
  await start(page);
  await page.locator("[data-nyk-launcher]").click();
  await page.locator(".nyk-starter").first().click();
  await expect(page.locator(".nyk-message.assistant")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const answer = await page.locator(".nyk-message.assistant").boundingBox();
  expect(answer.x).toBeGreaterThanOrEqual(8);
  expect(answer.x + answer.width).toBeLessThanOrEqual(382);
  await expect(page.locator(".nyk-form textarea")).toBeVisible();
});
