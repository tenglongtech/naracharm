import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });
  const page = await context.newPage();
  const noteIds = new Set();
  const apiCalls = [];

  // Intercept ALL API responses
  page.on('response', async (resp) => {
    const url = resp.url();
    try {
      if (url.includes('api/sns/web/v2/user') || url.includes('api/sns/web/v1/feed') ||
          url.includes('api/sns/web/v1/search') || url.includes('api/sns/web/v1/note') ||
          url.includes('user_posted') || url.includes('user/notes')) {
        const text = await resp.text();
        apiCalls.push({ url: url.slice(-70), status: resp.status(), body: text.slice(0, 5000) });
      }
    } catch(e) {}
  });

  // Load known note to get cookies
  await page.goto('https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b', {
    waitUntil: 'domcontentloaded', timeout: 20000
  });
  await page.waitForTimeout(3000);

  // Clear API calls from first page
  apiCalls.length = 0;

  // Now load profile
  console.log('Loading profile page...');
  await page.goto('https://www.xiaohongshu.com/user/profile/66ec01d00000000009019c22', {
    waitUntil: 'domcontentloaded', timeout: 20000
  });
  await page.waitForTimeout(8000); // Wait for API calls to complete

  console.log(`Title: ${await page.title()}`);
  console.log(`URL: ${page.url()}`);

  // Dump all API calls
  console.log(`\n=== ${apiCalls.length} API calls intercepted ===`);
  for (const api of apiCalls) {
    console.log(`\n--- [${api.status}] ${api.url} ---`);
    console.log(api.body);

    // Extract note IDs
    const matches = api.body.match(/"note_id"\s*:\s*"([a-f0-9]{24})"/g);
    if (matches) {
      matches.forEach(m => {
        const id = m.match(/"note_id"\s*:\s*"([a-f0-9]{24})"/)[1];
        noteIds.add(id);
      });
    }
    // Also try alternate patterns
    const altMatches = api.body.match(/"id"\s*:\s*"([a-f0-9]{24})"/g);
    if (altMatches) {
      altMatches.forEach(m => {
        const id = m.match(/"id"\s*:\s*"([a-f0-9]{24})"/)[1];
        // Filter out non-note IDs (too short/long, or known non-note patterns)
        if (id.length === 24 && !id.startsWith('000') && id !== '66ec01d00000000009019c22') {
          noteIds.add(id);
        }
      });
    }
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`NOTE IDs from API: ${noteIds.size}`);
  console.log(`═══════════════════════════════════════`);

  if (noteIds.size > 0) {
    const urls = Array.from(noteIds).map(id => `https://www.xiaohongshu.com/discovery/item/${id}`);
    urls.forEach((u, i) => console.log(`${i+1}. ${u}`));
    writeFileSync('/tmp/grace_all_notes.txt', urls.join('\n'));
    console.log(`\n✅ Saved to /tmp/grace_all_notes.txt`);
  }

  await browser.close();
})();
