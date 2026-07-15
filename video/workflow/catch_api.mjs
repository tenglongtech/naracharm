import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  const allCalls = [];

  // Capture ALL network responses - not just those matching specific patterns
  page.on('response', async (resp) => {
    const url = resp.url();
    try {
      // Only log non-static responses
      const contentType = resp.headers()['content-type'] || '';
      if (contentType.includes('json') || url.includes('edith') || url.includes('/api/')) {
        const text = await resp.text();
        if (text && text.length > 10 && text.length < 50000) {
          allCalls.push({ url: url, status: resp.status(), body: text.slice(0, 3000) });
        }
      }
    } catch(e) {}
  });

  // Capture all requests too
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/api/') || url.includes('edith.')) {
      // console.log('REQ:', url.slice(-60));
    }
  });

  // Load note page first to establish session
  await page.goto('https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b', {
    waitUntil: 'domcontentloaded', timeout: 20000
  });
  await page.waitForTimeout(3000);
  allCalls.length = 0; // clear

  // Navigate to profile
  await page.goto('https://www.xiaohongshu.com/user/profile/66ec01d00000000009019c22', {
    waitUntil: 'domcontentloaded', timeout: 20000
  });

  // Wait for the API call that loads notes
  // The profile page loads notes from the feed endpoint
  console.log('Waiting for notes API call...');
  await page.waitForTimeout(10000);

  console.log(`\n=== Captured ${allCalls.length} API calls ===`);
  for (const call of allCalls) {
    console.log(`\n--- [${call.status}] ${call.url.slice(-70)} ---`);
    console.log(call.body.slice(0, 2000));

    // Look for note IDs
    const noteIds = [...call.body.matchAll(/"note_id"\s*:\s*"([a-f0-9]{24})"/g)];
    if (noteIds.length > 0) {
      console.log(`>>> Note IDs found: ${noteIds.map(m => m[1]).join(', ')}`);
    }
    // Look for user note lists
    if (call.body.includes('"items"')) {
      console.log('>>> Contains "items" array');
    }
  }

  await browser.close();
})();
