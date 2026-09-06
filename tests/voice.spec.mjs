import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';

async function setup(page, language = 'en', available = true) {
  await page.route('**/index.html', route => route.fulfill({ contentType: 'text/html', body: '<main><h1>Case instructions</h1><section><h2>Decision</h2><p>Sample decision. Bring the listed documents.</p><p hidden>Secret hidden record</p><input value="Private form value"><button>Do not narrate controls</button></section></main><div id="overlay"></div>' }));
  await page.goto('/index.html');
  await page.evaluate(({ language, available }) => {
    window.ECOURTS_ASSISTANT_CONTEXT = { get: () => ({ language, route: 'home', case: null, paper: null }) };
    window.voiceMock = { spoken: [], starts: 0, cancels: 0, pauses: 0, resumes: 0, aborts: 0 };
    class Recognition { start() { window.voiceMock.starts++; window.voiceMock.recognition = this; } abort() { window.voiceMock.aborts++; this.onend?.(); } }
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: available ? Recognition : undefined });
    Object.defineProperty(window, 'webkitSpeechRecognition', { configurable: true, value: undefined });
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => [{ lang: 'en-IN' }, { lang: 'hi-IN' }, { lang: 'as-IN' }], speak: u => window.voiceMock.spoken.push({ text: u.text, lang: u.lang }), cancel: () => window.voiceMock.cancels++, pause: () => window.voiceMock.pauses++, resume: () => window.voiceMock.resumes++ } });
  }, { language, available });
  await page.addScriptTag({ path: resolve('assets/ecourts-voice.js') });
  await page.addScriptTag({ path: resolve('assets/nyk-assistant.js') });
}
async function open(page) { await page.evaluate(() => window.dispatchEvent(new Event('ecourts:nayak-open'))); }

test('dictation starts only on request, stays editable and sends reviewed text', async ({ page }) => {
  await setup(page); await open(page);
  expect(await page.evaluate(() => window.voiceMock.starts)).toBe(0);
  await page.getByRole('button', { name: 'Speak your question' }).click();
  await page.evaluate(() => window.voiceMock.recognition.onresult({ results: [[{ transcript: 'What happens next' }]] }));
  await expect(page.locator('.nyk-form textarea')).toHaveValue('What happens next');
  await page.getByRole('button', { name: 'Stop microphone' }).click();
  await page.locator('.nyk-form textarea').fill('Explain the decision');
  let sent;
  await page.route('**/chat', route => { sent = route.request().postDataJSON(); return route.fulfill({ json: { answer: 'This is a sample explanation.' } }); });
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.locator('.nyk-message.assistant')).toContainText('sample explanation');
  expect(sent.message).toBe('Explain the decision');
  expect(await page.evaluate(() => window.voiceMock.spoken.length)).toBe(0);
  await page.locator('.nyk-message.assistant').getByRole('button', { name: 'Read aloud', exact: true }).click();
  expect(await page.evaluate(() => window.voiceMock.spoken[0].text)).toContain('sample explanation');
});

test('reading uses visible content and provides pause, resume and navigation cancellation', async ({ page }) => {
  await setup(page);
  await page.getByRole('button', { name: 'Read this page', exact: true }).click();
  const text = await page.evaluate(() => window.voiceMock.spoken.map(x => x.text).join(' '));
  expect(text).toContain('Sample decision'); expect(text).not.toMatch(/Secret|Private|Do not narrate|Read this/);
  await page.getByRole('button', { name: 'Pause', exact: true }).first().click();
  await page.getByRole('button', { name: 'Resume', exact: true }).first().click();
  expect(await page.evaluate(() => [window.voiceMock.pauses, window.voiceMock.resumes])).toEqual([1, 1]);
  await page.evaluate(() => window.dispatchEvent(new Event('ecourts:route')));
  await expect(page.getByRole('button', { name: 'Stop reading' })).toHaveCount(0);
});

test('microphone denial and unavailable recognition keep typing usable', async ({ page }) => {
  await setup(page); await open(page);
  await page.getByRole('button', { name: 'Speak your question' }).click();
  await page.evaluate(() => { window.voiceMock.recognition.onerror({ error: 'not-allowed' }); window.voiceMock.recognition.onend(); });
  await expect(page.locator('.nyk-voice-status')).toContainText('denied');
  await page.locator('.nyk-form textarea').fill('Typed fallback');
  await expect(page.locator('.nyk-form textarea')).toHaveValue('Typed fallback');
  await page.evaluate(() => { window.SpeechRecognition = undefined; });
  await page.getByRole('button', { name: 'Speak your question' }).click();
  await expect(page.locator('.nyk-voice-status')).toContainText('unavailable');
});

for (const [lang, read] of [['hi', 'यह पृष्ठ सुनें'], ['as', 'এই পৃষ্ঠা শুনক']]) {
  test(`voice uses ${lang} and optional answers stop on close`, async ({ page }) => {
    await setup(page, lang);
    await page.getByRole('button', { name: read, exact: true }).click();
    expect(await page.evaluate(() => window.voiceMock.spoken[0].lang)).toBe(`${lang}-IN`);
    await open(page);
    await page.locator('.nyk-speak-option input').check();
    await page.route('**/chat', route => route.fulfill({ json: { answer: 'Sample answer' } }));
    await page.locator('.nyk-form textarea').fill('Question');
    await page.locator('.nyk-send').click();
    await expect(page.locator('.nyk-message.assistant')).toContainText('Sample answer');
    expect(await page.evaluate(() => window.voiceMock.spoken.at(-1).lang)).toBe(`${lang}-IN`);
    const before = await page.evaluate(() => window.voiceMock.cancels);
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => window.voiceMock.cancels)).toBeGreaterThan(before);
  });
}

test('dialog reading cancels when the dialog is removed', async ({ page }) => {
  await setup(page);
  await page.evaluate(() => { document.querySelector('#overlay').innerHTML = '<section role="dialog"><h2>Instructions</h2><p>Read these steps.</p></section>'; });
  await page.getByRole('dialog').getByRole('button', { name: 'Read this section' }).click();
  const before = await page.evaluate(() => window.voiceMock.cancels);
  await page.evaluate(() => document.querySelector('#overlay').replaceChildren());
  await expect.poll(() => page.evaluate(() => window.voiceMock.cancels)).toBeGreaterThan(before);
});
