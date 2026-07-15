import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Create a brand-new context with NO cached data
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  });
  const page = await context.newPage();
  const foundNotes = new Set();
  const allApiBody = [];

  // Capture ALL API responses
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('edith.xiaohongshu.com/api') || url.includes('xiaohongshu.com/api')) {
      try {
        const text = await resp.text();
        if (text.length > 20 && text.length < 50000) {
          allApiBody.push({ url: url.slice(-70), body: text });
        }
      } catch(e) {}
    }
  });

  // Start from the known note page
  console.log('Loading note page...');
  await page.goto('https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b', {
    waitUntil: 'domcontentloaded', timeout: 15000
  });
  await page.waitForTimeout(3000);

  // Try to extract "more from this author" or related notes
  const related = await page.evaluate(() => {
    const links = [...document.querySelectorAll('a[href*="explore/"], a[href*="discovery/item"]')];
    const result = [];
    links.forEach(a => {
      const href = a.href;
      const text = a.textContent.trim().slice(0, 50);
      const m = href.match(/explore\/([a-f0-9]{24})/) || href.match(/discovery\/item\/([a-f0-9]{24})/);
      if (m) result.push({ id: m[1], text, href });
    });
    return result;
  });

  console.log(`Related notes on page: ${related.length}`);
  related.forEach(r => {
    foundNotes.add(`https://www.xiaohongshu.com/discovery/item/${r.id}`);
  });

  // Check if we can navigate to author profile
  const authorHref = await page.evaluate(() => {
    const links = [...document.querySelectorAll('a[href*="user/profile"]')];
    return links.length > 0 ? links[0].href : null;
  });
  console.log(`Author profile link: ${authorHref || 'not found'}`);

  // Try to get the author name/ID from the page data
  const authorData = await page.evaluate(() => {
    const scripts = [...document.scripts];
    for (const s of scripts) {
      if (s.textContent && s.textContent.includes('author')) {
        const match = s.textContent.match(/"author"[^}]+"userId"\s*:\s*"([^"]+)"/);
        if (match) return { userId: match[1] };
      }
    }
    return null;
  });
  console.log(`Author data: ${JSON.stringify(authorData)}`);

  // Try the search API with user ID via page fetch
  if (authorData?.userId) {
    console.log(`\nTrying to fetch notes for user: ${authorData.userId}...`);
    try {
      const result = await page.evaluate(async (uid) => {
        const url = `https://edith.xiaohongshu.com/api/sns/web/v1/user/notes?user_id=${uid}&num=30&cursor=`;
        const r = await fetch(url, { credentials: 'include', headers: { 'Referer': 'https://www.xiaohongshu.com/' } });
        return await r.text();
      }, authorData.userId);
      console.log(`API response: ${result.slice(0, 2000)}`);
      try {
        const json = JSON.parse(result);
        if (json.data?.items) {
          for (const item of json.data.items) {
            if (item.note_card?.note_id) {
              foundNotes.add(`https://www.xiaohongshu.com/discovery/item/${item.note_card.note_id}`);
            }
          }
          console.log(`Found ${json.data.items.length} notes from API`);
        }
      } catch(e) {}
    } catch(e) {
      console.log(`API error: ${e.message}`);
    }
  }

  // Dump all API responses for debugging
  console.log(`\n=== Dumping ${allApiBody.length} API responses ===`);
  for (const api of allApiBody) {
    console.log(`\n--- ${api.url} ---`);
    console.log(api.body.slice(0, 1000));
  }

  // Output
  console.log(`\n═══════════════════════════════════════`);
  console.log(`Total notes found: ${foundNotes.size}`);
  console.log(`═══════════════════════════════════════`);
  Array.from(foundNotes).forEach((u, i) => console.log(`${i+1}. ${u}`));

  if (foundNotes.size > 0) {
    writeFileSync('/tmp/grace_notes_urls.txt', Array.from(foundNotes).join('\n'));
    console.log(`✅ Saved to /tmp/grace_notes_urls.txt`);
  }

  await browser.close();
})();
