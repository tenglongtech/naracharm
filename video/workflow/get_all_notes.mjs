import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  // Use mobile viewport — it loaded the profile earlier
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const noteIds = new Set();

  // Intercept the user notes API
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('user/notes') || url.includes('user/feeds') || url.includes('user_posted')) {
      try {
        const json = await resp.json();
        if (json.data?.items) {
          for (const item of json.data.items) {
            if (item.note_card?.note_id) {
              noteIds.add(item.note_card.note_id);
            }
          }
          console.log(`  API → ${noteIds.size} notes`);
        }
      } catch(e) {
        try {
          const text = await resp.text();
          if (text.includes('note_id') || text.includes('note_card')) {
            console.log(`  Raw API: ${text.slice(0, 300)}`);
          }
        } catch(e2) {}
      }
    }
  });

  // Step 1: Load the note page first (gets cookies/tokens)
  console.log('Step 1: Loading note page for cookies...');
  await page.goto('https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b', {
    waitUntil: 'domcontentloaded', timeout: 15000
  });
  await page.waitForTimeout(2000);

  // Step 2: Go to profile
  console.log('Step 2: Navigating to profile...');
  await page.goto('https://www.xiaohongshu.com/user/profile/66ec01d00000000009019c22', {
    waitUntil: 'domcontentloaded', timeout: 15000
  });
  await page.waitForTimeout(3000);

  console.log(`Title: ${await page.title()}`);

  // Step 3: Scroll aggressively to trigger lazy loading
  for (let i = 0; i < 20; i++) {
    const prev = noteIds.size;
    await page.evaluate(async () => {
      // Scroll in smaller increments to trigger each batch
      const y = window.scrollY;
      window.scrollTo(0, y + 400);
      await new Promise(r => setTimeout(r, 1000));
    });

    // After every few scrolls, try to find note links in DOM
    if (i % 3 === 0 || noteIds.size === 0) {
      const domIds = await page.evaluate(() => {
        const items = [];
        // Xiaohongshu mobile uses section elements with note data
        document.querySelectorAll('a[href*="explore/"], section, [class*="note"], [class*="feed"]').forEach(el => {
          const html = el.outerHTML;
          const m = html.match(/explore\/([a-f0-9]{24})/) || html.match(/note_id["': ]+["']([a-f0-9]{24})["']/);
          if (m && !items.includes(m[1])) items.push(m[1]);
        });
        return items;
      });
      domIds.forEach(id => noteIds.add(id));
      console.log(`  Scroll ${i+1}: ${noteIds.size} notes (DOM: ${domIds.length})`);
    }
  }

  // Step 4: Also try reading from page's script data
  const scripts = await page.evaluate(() => {
    return [...document.querySelectorAll('script')]
      .filter(s => s.textContent && s.textContent.includes('note_id'))
      .map(s => {
        const matches = [...s.textContent.matchAll(/note_id["': ]+["']([a-f0-9]{24})["']/g)];
        return matches.map(m => m[1]);
      })
      .flat();
  });
  scripts.forEach(id => noteIds.add(id));
  console.log(`From scripts: ${scripts.length} extra IDs`);

  // Step 5: Get cookies for XHS-Downloader
  const cookies = await context.cookies();
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');

  // Output everything
  const ids = Array.from(noteIds);
  console.log(`\n═══════════════════════════════════════`);
  console.log(`Total notes found: ${ids.length}`);
  console.log(`═══════════════════════════════════════`);
  ids.forEach(id => {
    const url = `https://www.xiaohongshu.com/discovery/item/${id}`;
    console.log(url);
  });

  // Save
  writeFileSync('/tmp/grace_notes.txt', JSON.stringify({ ids, cookies: cookieStr }, null, 2));
  writeFileSync('/tmp/grace_cookies.txt', cookieStr);
  process.stdout.write('\n---COOKIES---\n' + cookieStr + '\n---END-COOKIES---\n');

  await browser.close();
})();
