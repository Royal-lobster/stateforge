import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const DIR = 'public/docs';
mkdirSync(DIR, { recursive: true });

const BASE = 'http://localhost:3456';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });

  // Helper: load a gallery example
  async function loadExample(page, name) {
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const card = page.locator(`text=${name}`);
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(800);
    }
  }

  // Helper: screenshot an element with padding
  async function cropEl(page, selector, file, { pad = 0 } = {}) {
    const el = page.locator(selector).first();
    if (!(await el.isVisible())) {
      console.log(`   ⚠ selector not visible: ${selector}`);
      return;
    }
    const box = await el.boundingBox();
    if (!box) return;
    await page.screenshot({
      path: `${DIR}/${file}`,
      clip: {
        x: Math.max(0, box.x - pad),
        y: Math.max(0, box.y - pad),
        width: box.width + pad * 2,
        height: box.height + pad * 2,
      },
    });
  }

  const shots = [
    {
      name: 'gallery',
      desc: 'Gallery page',
      fn: async (page) => {
        await page.evaluate(() => localStorage.clear());
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(800);
        // Full page shot — gallery IS the full page
        await page.screenshot({ path: `${DIR}/gallery.png` });
      },
    },
    {
      name: 'canvas-dfa',
      desc: 'Canvas with DFA states and transitions',
      fn: async (page) => {
        await loadExample(page, 'Even number of 0s');
        // Full page but we'll use it — canvas fills most of the viewport
        await page.screenshot({ path: `${DIR}/canvas-dfa.png` });
      },
    },
    {
      name: 'toolbar',
      desc: 'Toolbar close-up',
      fn: async (page) => {
        await loadExample(page, 'Ends with ab');
        // The toolbar is the first child — top bar
        const toolbar = page.locator('div.shrink-0.select-none').first();
        await toolbar.screenshot({ path: `${DIR}/toolbar.png` });
      },
    },
    {
      name: 'sidebar',
      desc: 'Properties sidebar with formal definition',
      fn: async (page) => {
        await loadExample(page, 'Even number of 0s');
        // Sidebar is the rightmost panel
        const sidebar = page.locator('[class*="w-64"]').first();
        if (await sidebar.isVisible()) {
          await sidebar.screenshot({ path: `${DIR}/sidebar.png` });
        } else {
          // Try wider selector
          await cropEl(page, 'div:has(> div:has-text("FORMAL DEFINITION"))', 'sidebar.png', { pad: 4 });
        }
      },
    },
    {
      name: 'sim-idle',
      desc: 'Simulation panel — idle state with hints',
      fn: async (page) => {
        await loadExample(page, 'Even number of 0s');
        // Bottom sim panel
        const sim = page.locator('div.shadow-panel:has(button[aria-label="Start"])').first();
        if (await sim.isVisible()) {
          await sim.screenshot({ path: `${DIR}/sim-idle.png` });
        }
      },
    },
    {
      name: 'sim-accepted',
      desc: 'Simulation — string accepted',
      fn: async (page) => {
        await loadExample(page, 'Even number of 0s');
        const input = page.locator('input[placeholder="Enter string..."]');
        if (await input.isVisible()) {
          await input.fill('0110');
          await page.waitForTimeout(200);
          const btn = page.locator('button[aria-label="Fast Run"]');
          if (await btn.isVisible()) await btn.click();
          await page.waitForTimeout(500);
        }
        const sim = page.locator('div.shadow-panel:has(button[aria-label="Start"])').first();
        if (await sim.isVisible()) {
          await sim.screenshot({ path: `${DIR}/sim-accepted.png` });
        }
      },
    },
    {
      name: 'sim-rejected',
      desc: 'Simulation — string rejected',
      fn: async (page) => {
        await loadExample(page, 'Even number of 0s');
        const input = page.locator('input[placeholder="Enter string..."]');
        if (await input.isVisible()) {
          await input.fill('0');
          await page.waitForTimeout(200);
          const btn = page.locator('button[aria-label="Fast Run"]');
          if (await btn.isVisible()) await btn.click();
          await page.waitForTimeout(500);
        }
        const sim = page.locator('div.shadow-panel:has(button[aria-label="Start"])').first();
        if (await sim.isVisible()) {
          await sim.screenshot({ path: `${DIR}/sim-rejected.png` });
        }
      },
    },
    {
      name: 'multi-run',
      desc: 'Multi-run batch results',
      fn: async (page) => {
        await loadExample(page, 'Even number of 0s');
        const multiBtn = page.locator('button:text("Multi")');
        if (await multiBtn.isVisible()) await multiBtn.click();
        await page.waitForTimeout(200);
        const textarea = page.locator('textarea');
        if (await textarea.isVisible()) {
          await textarea.fill('00\n010\n0000\n1\n01\n1100');
          const runAll = page.locator('button:text("RUN ALL")');
          if (await runAll.isVisible()) await runAll.click();
          await page.waitForTimeout(500);
        }
        const sim = page.locator('div.shadow-panel:has(button[aria-label="Reset"])').first();
        if (await sim.isVisible()) {
          await sim.screenshot({ path: `${DIR}/multi-run.png` });
        }
      },
    },
    {
      name: 'context-menu',
      desc: 'Right-click context menu',
      fn: async (page) => {
        await loadExample(page, 'Even number of 0s');
        // Right-click on canvas where state should be
        const svg = page.locator('svg').first();
        const box = await svg.boundingBox();
        if (box) {
          await page.mouse.click(box.x + box.width * 0.35, box.y + box.height * 0.4, { button: 'right' });
          await page.waitForTimeout(400);
        }
        // Crop around the context menu + nearby canvas
        const menu = page.locator('div.animate-scale-in').first();
        if (await menu.isVisible()) {
          const menuBox = await menu.boundingBox();
          if (menuBox) {
            await page.screenshot({
              path: `${DIR}/context-menu.png`,
              clip: {
                x: Math.max(0, menuBox.x - 80),
                y: Math.max(0, menuBox.y - 80),
                width: menuBox.width + 160,
                height: menuBox.height + 160,
              },
            });
          }
        }
      },
    },
    {
      name: 'shortcuts',
      desc: 'Keyboard shortcuts modal',
      fn: async (page) => {
        await loadExample(page, 'Even number of 0s');
        await page.keyboard.press('?');
        await page.waitForTimeout(400);
        // Crop the modal
        const modal = page.locator('div.animate-scale-in').first();
        if (await modal.isVisible()) {
          await modal.screenshot({ path: `${DIR}/shortcuts.png` });
        }
      },
    },
    {
      name: 'conversions',
      desc: 'Conversions panel',
      fn: async (page) => {
        await loadExample(page, 'Contains 01');
        const convertBtn = page.locator('button:text("CONVERT")');
        if (await convertBtn.isVisible()) await convertBtn.click();
        await page.waitForTimeout(400);
        // Crop the convert panel overlay
        const panel = page.locator('div:has(> button:text("NFA → DFA"))').first();
        if (await panel.isVisible()) {
          await panel.screenshot({ path: `${DIR}/conversions.png` });
        } else {
          // Fallback: full page
          await page.screenshot({ path: `${DIR}/conversions.png` });
        }
      },
    },
  ];

  for (const shot of shots) {
    console.log(`📸 ${shot.name}: ${shot.desc}`);
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    try {
      await shot.fn(page);
      console.log(`   ✅ saved`);
    } catch (e) {
      console.log(`   ❌ ${e.message}`);
    }
    await page.close();
  }

  await browser.close();
  console.log('\nDone!');
}

main().catch(e => { console.error(e); process.exit(1); });
