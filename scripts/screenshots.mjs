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

  async function loadExample(page, name) {
    // Clear state FIRST, then navigate fresh
    await page.evaluate(() => {
      localStorage.clear();
      window.location.hash = '';
    });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    // Try clicking the example
    const card = page.locator(`button:has-text("${name}")`).first();
    try {
      await card.waitFor({ state: 'visible', timeout: 5000 });
      await card.click();
      await page.waitForTimeout(1200);
    } catch {
      console.log(`   ⚠ example "${name}" not found`);
    }
  }

  async function openSimPanel(page) {
    // Toggle sim panel if not visible — press Ctrl+.
    const simPanel = page.locator('div.shadow-panel').first();
    if (!(await simPanel.isVisible().catch(() => false))) {
      await page.keyboard.press('Control+.');
      await page.waitForTimeout(400);
    }
  }

  async function openSidebar(page) {
    await page.keyboard.press('/');
    await page.waitForTimeout(400);
  }

  const shots = [
    // ── Gallery / Homepage ──
    {
      name: 'gallery',
      fn: async (page) => {
        await page.evaluate(() => localStorage.clear());
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(800);
        await page.screenshot({ path: `${DIR}/gallery.png` });
      },
    },

    // ── Canvas + States ──
    {
      name: 'canvas-dfa',
      fn: async (page) => {
        await loadExample(page, 'Even 0s');
        await page.screenshot({ path: `${DIR}/canvas-dfa.png` });
      },
    },

    // ── Toolbar ──
    {
      name: 'toolbar',
      fn: async (page) => {
        await loadExample(page, 'Ends with ab');
        // First child row of the app
        const toolbar = page.locator('div.shrink-0.select-none').first();
        if (await toolbar.isVisible()) {
          await toolbar.screenshot({ path: `${DIR}/toolbar.png` });
        }
      },
    },

    // ── Transitions close-up (curved + self-loop + labels) ──
    {
      name: 'transitions',
      fn: async (page) => {
        await loadExample(page, 'Even 0s');
        // This example has self-loops and bidirectional edges — crop the canvas area
        const canvas = page.locator('[data-canvas]').first();
        if (await canvas.isVisible()) {
          await canvas.screenshot({ path: `${DIR}/transitions.png` });
        }
      },
    },

    // ── Context Menu ──
    {
      name: 'context-menu',
      fn: async (page) => {
        await loadExample(page, 'Even 0s');
        const svg = page.locator('svg').first();
        const box = await svg.boundingBox();
        if (box) {
          // Right-click on roughly where a state should be
          await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.5, { button: 'right' });
          await page.waitForTimeout(400);
        }
        const menu = page.locator('div.animate-scale-in').first();
        if (await menu.isVisible()) {
          const menuBox = await menu.boundingBox();
          if (menuBox) {
            await page.screenshot({
              path: `${DIR}/context-menu.png`,
              clip: {
                x: Math.max(0, menuBox.x - 100),
                y: Math.max(0, menuBox.y - 100),
                width: menuBox.width + 200,
                height: menuBox.height + 200,
              },
            });
          }
        }
      },
    },

    // ── Properties Sidebar ──
    {
      name: 'sidebar',
      fn: async (page) => {
        await loadExample(page, 'Even 0s');
        await openSidebar(page);
        // Sidebar is the w-64 panel on the right
        const sidebar = page.locator('div.overflow-hidden.select-none div.w-64').first();
        if (await sidebar.isVisible().catch(() => false)) {
          await sidebar.screenshot({ path: `${DIR}/sidebar.png` });
        } else {
          // Fallback: crop right portion of screen
          await page.screenshot({
            path: `${DIR}/sidebar.png`,
            clip: { x: 1280 - 256, y: 40, width: 256, height: 680 },
          });
        }
      },
    },

    // ── DFA/NFA Sim: Idle ──
    {
      name: 'sim-idle',
      fn: async (page) => {
        await loadExample(page, 'Even 0s');
        await openSimPanel(page);
        const sim = page.locator('div.shadow-panel').first();
        if (await sim.isVisible()) {
          await sim.screenshot({ path: `${DIR}/sim-idle.png` });
        }
      },
    },

    // ── DFA/NFA Sim: Accepted ──
    {
      name: 'sim-accepted',
      fn: async (page) => {
        await loadExample(page, 'Even 0s');
        await openSimPanel(page);
        const input = page.locator('input[placeholder*="Enter"]').first();
        if (await input.isVisible()) {
          await input.fill('0110');
          await page.waitForTimeout(200);
          // Click fast-forward
          const ffwd = page.locator('button:has(svg)').nth(3); // 4th button in controls
          await page.keyboard.press('Enter');
          await page.waitForTimeout(600);
        }
        const sim = page.locator('div.shadow-panel').first();
        if (await sim.isVisible()) {
          await sim.screenshot({ path: `${DIR}/sim-accepted.png` });
        }
      },
    },

    // ── DFA/NFA Sim: Rejected ──
    {
      name: 'sim-rejected',
      fn: async (page) => {
        await loadExample(page, 'Even 0s');
        await openSimPanel(page);
        const input = page.locator('input[placeholder*="Enter"]').first();
        if (await input.isVisible()) {
          await input.fill('010');
          await page.waitForTimeout(200);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(600);
        }
        const sim = page.locator('div.shadow-panel').first();
        if (await sim.isVisible()) {
          await sim.screenshot({ path: `${DIR}/sim-rejected.png` });
        }
      },
    },

    // ── Multi-run ──
    {
      name: 'multi-run',
      fn: async (page) => {
        await loadExample(page, 'Even 0s');
        await openSimPanel(page);
        const multiBtn = page.locator('button:has-text("Multi")');
        if (await multiBtn.isVisible()) await multiBtn.click();
        await page.waitForTimeout(300);
        const textarea = page.locator('textarea');
        if (await textarea.isVisible()) {
          await textarea.fill('00\n010\n0000\n1\n01\n1100');
          const runAll = page.locator('button:has-text("RUN ALL")');
          if (await runAll.isVisible()) await runAll.click();
          await page.waitForTimeout(500);
        }
        const sim = page.locator('div.shadow-panel').first();
        if (await sim.isVisible()) {
          await sim.screenshot({ path: `${DIR}/multi-run.png` });
        }
      },
    },

    // ── PDA Sim ──
    {
      name: 'pda-sim',
      fn: async (page) => {
        await loadExample(page, 'a^n b^n');
        await openSimPanel(page);
        const input = page.locator('input[placeholder*="Enter"]').first();
        if (await input.isVisible()) {
          await input.fill('aaabbb');
          await page.waitForTimeout(200);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(600);
        }
        const sim = page.locator('div.shadow-panel').first();
        if (await sim.isVisible()) {
          await sim.screenshot({ path: `${DIR}/pda-sim.png` });
        }
      },
    },

    // ── TM Sim ──
    {
      name: 'tm-sim',
      fn: async (page) => {
        await loadExample(page, 'Binary Increment');
        await openSimPanel(page);
        const input = page.locator('input[placeholder*="Enter"]').first();
        if (await input.isVisible()) {
          await input.fill('1011');
          await page.waitForTimeout(200);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(600);
        }
        const sim = page.locator('div.shadow-panel').first();
        if (await sim.isVisible()) {
          await sim.screenshot({ path: `${DIR}/tm-sim.png` });
        }
      },
    },

    // ── Mealy/Moore Sim ──
    {
      name: 'mealy-sim',
      fn: async (page) => {
        await loadExample(page, 'Parity Bit');
        await openSimPanel(page);
        const input = page.locator('input[placeholder*="Enter"]').first();
        if (await input.isVisible()) {
          await input.fill('10110');
          await page.waitForTimeout(200);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(600);
        }
        const sim = page.locator('div.shadow-panel').first();
        if (await sim.isVisible()) {
          await sim.screenshot({ path: `${DIR}/mealy-sim.png` });
        }
      },
    },

    // ── Conversions Panel ──
    {
      name: 'conversions',
      fn: async (page) => {
        await loadExample(page, 'Contains 01');
        // Open convert panel
        const convertBtn = page.locator('button:has-text("CONVERT")');
        if (await convertBtn.isVisible()) {
          await convertBtn.click();
          await page.waitForTimeout(400);
        }
        // Full page with convert panel visible
        await page.screenshot({ path: `${DIR}/conversions.png` });
      },
    },

    // ── Grammar Editor ──
    {
      name: 'grammar-editor',
      fn: async (page) => {
        await loadExample(page, 'Even 0s'); // load anything first
        // Switch to CFG mode — press 7
        await page.keyboard.press('7');
        await page.waitForTimeout(600);
        // Type a grammar
        const textarea = page.locator('textarea').first();
        if (await textarea.isVisible()) {
          await textarea.fill('S → aSb | ε');
          await page.waitForTimeout(300);
        }
        await page.screenshot({ path: `${DIR}/grammar-editor.png` });
      },
    },

    // ── L-System ──
    {
      name: 'l-system',
      fn: async (page) => {
        await loadExample(page, 'Even 0s');
        // Switch to L-SYS mode — press 8
        await page.keyboard.press('8');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${DIR}/l-system.png` });
      },
    },

    // ── Keyboard Shortcuts ──
    {
      name: 'shortcuts',
      fn: async (page) => {
        await loadExample(page, 'Even 0s');
        await page.keyboard.press('?');
        await page.waitForTimeout(400);
        const modal = page.locator('div.animate-scale-in').first();
        if (await modal.isVisible()) {
          await modal.screenshot({ path: `${DIR}/shortcuts.png` });
        }
      },
    },
  ];

  for (const shot of shots) {
    console.log(`📸 ${shot.name}`);
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
