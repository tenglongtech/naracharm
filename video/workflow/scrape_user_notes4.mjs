import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const noteUrls = new Set();
  const allApis = [];

  // Intercept API responses
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('api/sns/web/v1/user/notes') ||
        url.includes('api/sns/web/v2/user/notes') ||
        url.includes('api/sns/web/v1/note') ||
        url.includes('api/sns/web/v2/note')) {
      try {
        const text = await resp.text();
        allApis.push({ url: url.slice(-70), body: text.slice(0, 5000) });
        if (text.includes('note_card') || text.includes('note_id')) {
          try {
            const json = JSON.parse(text);
            if (json.data?.items) {
              for (const item of json.data.items) {
                if (item.note_card?.note_id) {
                  noteUrls.add(`https://www.xiaohongshu.com/discovery/item/${item.note_card.note_id}`);
                }
              }
            }
          } catch(e) {}
        }
      } catch(e) {}
    }
  });

  // First, load the note page to get cookies/tokens
  console.log('Step 1: Load note page...');
  await page.goto('https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b', {
    waitUntil: 'domcontentloaded', timeout: 15000
  });
  await page.waitForTimeout(2000);

  // Get current cookies
  const cookies = await context.cookies();
  console.log(`Cookies: ${cookies.length}`);

  // Navigate to user profile notes page
  console.log('Step 2: Navigate to user profile...');
  await page.goto('https://www.xiaohongshu.com/user/profile/66ec01d00000000009019c22', {
    waitUntil: 'domcontentloaded', timeout: 15000
  });
  await page.waitForTimeout(5000);

  const title = await page.title();
  console.log(`Title: ${title}`);
  console.log(`Current URL: ${page.url()}`);

  // Scroll to load more
  let prevCount = 0;
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const ids = await page.evaluate(() => {
      const links = [...document.querySelectorAll('a')];
      const ids = [];
      links.forEach(a => {
        const m = a.href.match(/explore\/([a-f0-9]+)/) || a.href.match(/discovery\/item\/([a-f0-9]+)/);
        if (m && !ids.includes(m[1])) ids.push(m[1]);
      });
      return ids;
    });

    ids.forEach(id => noteUrls.add(`https://www.xiaohongshu.com/discovery/item/${id}`));

    if (ids.length > prevCount) {
      console.log(`  Scroll ${i+1}: ${ids.length} note IDs found`);
      prevCount = ids.length;
    } else {
      console.log(`  Scroll ${i+1}: no new notes (${ids.length} total)`);
      break; // Stop if no new content loaded
    }
  }

  // Dump captured API calls
  console.log(`\n=== API calls captured: ${allApis.length} ===`);
  for (const api of allApis) {
    console.log(`\n--- ${api.url} ---`);
    console.log(api.body.slice(0, 1500));
  }

  // Print all found notes
  console.log(`\n=== Total notes: ${noteUrls.size} ===`);
  const urls = Array.from(noteUrls);
  urls.forEach(url => console.log(url));

  writeFileSync('/tmp/grace_studio_notes.txt', urls.join('\n'));
  console.log(`\nSaved to /tmp/grace_studio_notes.txt`);

  await browser.close();
})();
