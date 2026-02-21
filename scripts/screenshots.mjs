import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const SCREENSHOT_DIR = 'public/docs';
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const BASE = 'http://localhost:3456';
const VIEWPORT = { width: 1280, height: 720 };

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });

  const screenshots = [
    {
      name: 'gallery',
      desc: 'Gallery / Home page',
      url: BASE,
      setup: async (page) => {
        await page.evaluate(() => localStorage.clear());
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
      },
    },
    {
      name: 'canvas-dfa',
      desc: 'DFA editor canvas with states and transitions',
      url: BASE,
      setup: async (page) => {
        await page.evaluate(() => localStorage.clear());
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(800);
        // Click "Even 0s" gallery example
        const card = page.locator('text=Even number of 0s');
        if (await card.isVisible()) {
          await card.click();
          await page.waitForTimeout(800);
        }
      },
    },
    {
      name: 'simulation',
      desc: 'DFA simulation running on input string',
      url: BASE,
      setup: async (page) => {
        await page.evaluate(() => localStorage.clear());
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(600);
        // Load "Ends with ab" example
        const card = page.locator('text=Ends with ab');
        if (await card.isVisible()) {
          await card.click();
          await page.waitForTimeout(600);
        }
        // Type and run sim
        const input = page.locator('input[placeholder="Enter string..."]');
        if (await input.isVisible()) {
          await input.fill('abab');
          await page.waitForTimeout(200);
          // Fast run
          const btn = page.locator('button[aria-label="Fast Run"]');
          if (await btn.isVisible()) await btn.click();
          await page.waitForTimeout(500);
        }
      },
    },
    {
      name: 'multi-run',
      desc: 'Multi-run batch testing',
      url: BASE,
      setup: async (page) => {
        await page.evaluate(() => localStorage.clear());
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(600);
        const card = page.locator('text=Even number of 0s');
        if (await card.isVisible()) {
          await card.click();
          await page.waitForTimeout(600);
        }
        // Switch to multi mode
        const multiBtn = page.locator('button:text("Multi")');
        if (await multiBtn.isVisible()) await multiBtn.click();
        await page.waitForTimeout(200);
        // Type test strings
        const textarea = page.locator('textarea[placeholder]');
        if (await textarea.isVisible()) {
          await textarea.fill('00\n010\n0000\n1\n01');
          await page.waitForTimeout(200);
          const runAll = page.locator('button:text("RUN ALL")');
          if (await runAll.isVisible()) await runAll.click();
          await page.waitForTimeout(500);
        }
      },
    },
    {
      name: 'context-menu',
      desc: 'Right-click context menu on a state',
      url: BASE,
      setup: async (page) => {
        await page.evaluate(() => localStorage.clear());
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(600);
        const card = page.locator('text=Even number of 0s');
        if (await card.isVisible()) {
          await card.click();
          await page.waitForTimeout(600);
        }
        // Right-click on canvas area where a state should be
        const canvas = page.locator('svg').first();
        const box = await canvas.boundingBox();
        if (box) {
          // Right-click roughly center of canvas
          await page.mouse.click(box.x + box.width * 0.35, box.y + box.height * 0.4, { button: 'right' });
          await page.waitForTimeout(400);
        }
      },
    },
    {
      name: 'shortcuts',
      desc: 'Keyboard shortcuts modal',
      url: BASE,
      setup: async (page) => {
        await page.evaluate(() => localStorage.clear());
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(600);
        const card = page.locator('text=Even number of 0s');
        if (await card.isVisible()) {
          await card.click();
          await page.waitForTimeout(600);
        }
        await page.keyboard.press('?');
        await page.waitForTimeout(400);
      },
    },
    {
      name: 'conversions',
      desc: 'Conversions panel',
      url: BASE,
      setup: async (page) => {
        await page.evaluate(() => localStorage.clear());
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(600);
        // Load NFA example
        const card = page.locator('text=Contains 01');
        if (await card.isVisible()) {
          await card.click();
          await page.waitForTimeout(600);
        }
        // Open convert panel
        const convertBtn = page.locator('button:text("CONVERT")');
        if (await convertBtn.isVisible()) await convertBtn.click();
        await page.waitForTimeout(400);
      },
    },
  ];

  for (const shot of screenshots) {
    console.log(`📸 ${shot.name}: ${shot.desc}`);
    const page = await context.newPage();
    await page.goto(shot.url, { waitUntil: 'networkidle' });
    await shot.setup(page);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/${shot.name}.png`,
      fullPage: false,
    });
    await page.close();
    console.log(`   ✅ saved`);
  }

  await browser.close();
  console.log('\nDone!');
}

main().catch(e => { console.error(e); process.exit(1); });
