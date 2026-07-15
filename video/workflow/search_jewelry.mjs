import { chromium } from 'playwright';
import { writeFileSync, readFileSync } from 'fs';

const KEYWORDS = [
  '紫水晶 手串',
  '紫兔毛 水晶',
  '乌拉圭紫水 手串',
  '水晶叠戴 手串',
  '紫水晶 叠戴 一串葡萄',
  '水晶手串 搭配',
  '紫发晶 手串',
  '超七 水晶 手串',
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: 'zh-CN',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const allNoteIds = new Map(); // id -> title

  // Step 0: Warm up session on homepage
  await page.goto('https://www.xiaohongshu.com', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);

  for (const kw of KEYWORDS) {
    console.log(`\n═══════════════════════════════════════`);
    console.log(`🔍 Searching: "${kw}"`);
    console.log(`═══════════════════════════════════════`);

    const url = `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(kw)}&source=web_search_result_notes`;

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(e => {
      console.log(`  Navigate error: ${e.message}`);
    });
    await page.waitForTimeout(3000);

    // Check if we captcha-blocked
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('error')) {
      console.log(`  ⚠️ Blocked (${currentUrl.slice(0,50)}), cooling down...`);
      await page.waitForTimeout(5000);
      continue;
    }

    // Extract note IDs from the page
    for (let scroll = 0; scroll < 5; scroll++) {
      const notes = await page.evaluate(() => {
        const results = [];
        // Look for note links
        const links = document.querySelectorAll('a[href*="explore/"], a[href*="discovery/item"]');
        links.forEach(a => {
          const m = a.href.match(/explore\/([a-f0-9]{24})/);
          if (m && !results.find(r => r.id === m[1])) {
            // Try to find title nearby
            const titleEl = a.querySelector('[class*="title"], img') || a.parentElement?.querySelector('[class*="title"]');
            const title = titleEl?.textContent?.trim() || titleEl?.getAttribute('alt') || '';
            // Try to find interaction counts
            const likeEl = a.querySelector('[class*="like"], [class*="count"]');
            const likes = likeEl?.textContent?.trim() || '';
            results.push({ id: m[1], title: title.slice(0, 50), likes });
          }
        });
        return results;
      });

      for (const n of notes) {
        if (!allNoteIds.has(n.id)) {
          allNoteIds.set(n.id, n.title);
        }
      }

      console.log(`  Scroll ${scroll+1}: ${notes.length} IDs, total unique: ${allNoteIds.size}`);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);

      // Stop if no growth
      if (notes.length === 0 && scroll > 2) break;
    }
  }

  // Output
  console.log(`\n═══════════════════════════════════════`);
  console.log(`📊 TOTAL UNIQUE NOTES FOUND: ${allNoteIds.size}`);
  console.log(`═══════════════════════════════════════`);

  let i = 0;
  for (const [id, title] of allNoteIds) {
    i++;
    const url = `https://www.xiaohongshu.com/discovery/item/${id}`;
    console.log(`${i}. ${url}`);
    if (title) console.log(`   📝 ${title}`);
  }

  // Save URLs
  const urls = Array.from(allNoteIds.keys()).map(id => `https://www.xiaohongshu.com/discovery/item/${id}`);
  writeFileSync('/tmp/jewelry_notes.txt', urls.join('\n'));

  // Save with titles
  const detailed = Array.from(allNoteIds.entries()).map(([id, title]) => `${id}\t${title}`).join('\n');
  writeFileSync('/tmp/jewelry_notes_detailed.txt', detailed);

  console.log(`\n✅ URLs saved to /tmp/jewelry_notes.txt (${urls.length} notes)`);

  // Also save cookies for later download
  const cookies = await context.cookies();
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  if (cookieStr) {
    writeFileSync('/tmp/xhs_cookies.txt', cookieStr);
    console.log('✅ Cookies saved to /tmp/xhs_cookies.txt');
  }

  await browser.close();
})();
