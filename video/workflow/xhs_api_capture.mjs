import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const FULL_URL = 'https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b?xsec_token=CBEy6DDECxfS8Rg4PXL2kHHLEH-w3p7xMnx-noiKSqWuI=&xsec_source=app_share';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    locale: 'zh-CN',
  });
  const page = await context.newPage();

  const allResponses = [];

  // Intercept ALL fetch/XHR responses
  page.on('response', async (response) => {
    const url = response.url();
    const type = response.request().resourceType();
    // Only log API/XHR/fetch calls, not static assets
    if (type === 'xhr' || type === 'fetch' || url.includes('api') || url.includes('graphql')) {
      try {
        const body = await response.text();
        allResponses.push({ url: url, type: type, status: response.status(), body: body.slice(0, 10000) });
      } catch(e) {
        allResponses.push({ url: url, type: type, status: response.status(), body: '[BODY ERROR]' });
      }
    }
    // Also catch any response with media/video keywords
    if (url.includes('mp4') || url.includes('m3u8') || url.includes('stream') || url.includes('video')) {
      allResponses.push({ url: url, type: type, status: response.status(), body: 'VIDEO_URL' });
    }
  });

  // Intercept all requests to see what's being fetched
  page.on('request', (request) => {
    const url = request.url();
    const type = request.resourceType();
    if (type === 'xhr' || type === 'fetch' || url.includes('edith') || url.includes('xiaohongshu.com/api') || url.includes('graphql')) {
      // just log
    }
  });

  console.log('🌐 Loading...');
  await page.goto(FULL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Write all responses to file for analysis
  let output = '';
  for (const r of allResponses) {
    output += `\n═══════════════════════════════════════════════════════════\n`;
    output += `URL: ${r.url}\nType: ${r.type}  Status: ${r.status}\n`;
    output += `───────────────────────────────────────────────────────────\n`;
    output += (r.body || '[empty]') + '\n';
  }

  writeFileSync('/tmp/xhs_api_dump.txt', output);
  console.log(`\n✅ Dumped ${allResponses.length} responses to /tmp/xhs_api_dump.txt`);

  // Print summary
  console.log('\n=== Response Summary ===');
  for (const r of allResponses) {
    const shortUrl = r.url.length > 80 ? r.url.slice(0, 80) + '...' : r.url;
    console.log(`[${r.status}] ${r.type} ${shortUrl}`);
    if (r.body && r.body.length > 10 && r.body !== 'VIDEO_URL' && r.body !== '[BODY ERROR]') {
      // Check for keywords
      const keywords = ['masterUrl', 'backupUrl', 'videoUrl', 'media', 'stream', 'playInfo', 'video', 'originVideoKey'];
      for (const kw of keywords) {
        if (r.body.includes(kw)) {
          console.log(`  >>> CONTAINS "${kw}"`);
        }
      }
    }
  }

  await browser.close();
  console.log('\n✅ Done');
})();
