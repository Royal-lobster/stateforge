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
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const card = page.locator(`text=${name}`);
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(800);
    }
  }

  // 1. PDA mode — Palindromes example with simulation
  {
    console.log('📸 pda-sim: PDA simulation with stack');
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const card = page.locator('text=PDA: Palindromes').first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(800);
    }
    // Type input and step through
    const input = page.locator('input[placeholder="Input string..."]');
    if (await input.isVisible()) {
      await input.fill('abba');
      await page.waitForTimeout(200);
      // Click start then step a few times
      const startBtn = page.locator('button[aria-label="Start"]');
      if (await startBtn.isVisible()) await startBtn.click();
      await page.waitForTimeout(300);
      const stepBtn = page.locator('button[aria-label="Step"]');
      for (let i = 0; i < 3; i++) {
        if (await stepBtn.isVisible()) await stepBtn.click();
        await page.waitForTimeout(300);
      }
    }
    await page.screenshot({ path: `${DIR}/pda-sim.png` });
    await page.close();
    console.log('   ✅ saved');
  }

  // 2. Grammar editor — switch to CFG mode
  {
    console.log('📸 grammar-editor: CFG grammar editor');
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    // Click any example first to dismiss gallery
    const card = page.locator('text=Even number of 0s');
    if (await card.isVisible()) await card.click();
    await page.waitForTimeout(400);
    // Switch to CFG mode using keyboard
    await page.keyboard.press('7');
    await page.waitForTimeout(800);
    // The grammar editor should now be visible
    await page.screenshot({ path: `${DIR}/grammar-editor.png` });
    await page.close();
    console.log('   ✅ saved');
  }

  // 3. L-System view
  {
    console.log('📸 l-system: L-System rendering');
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const card = page.locator('text=Even number of 0s');
    if (await card.isVisible()) await card.click();
    await page.waitForTimeout(400);
    // Switch to L-System mode
    await page.keyboard.press('8');
    await page.waitForTimeout(1200); // Give time for L-system to render
    await page.screenshot({ path: `${DIR}/l-system.png` });
    await page.close();
    console.log('   ✅ saved');
  }

  await browser.close();
  console.log('\nDone!');
}

main().catch(e => { console.error(e); process.exit(1); });
