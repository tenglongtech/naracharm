import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });
  const page = await context.newPage();
  const apis = [];

  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('api/sns/web/v1/feed') || url.includes('api/sns/web/v2/note') ||
        url.includes('api/sns/web/v1/user/otherinfo')) {
      try {
        const text = await resp.text();
        apis.push({ url: url.slice(-60), text: text.slice(0, 5000) });
      } catch(e) {}
    }
  });

  // Full URL with xsec_token
  const fullUrl = 'https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b?xsec_token=CBEy6DDECxfS8Rg4PXL2kHHLEH-w3p7xMnx-noiKSqWuI=&xsec_source=pc_note';
  await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(5000);

  const title = await page.title();
  console.log('Title:', title);
  console.log('URL:', page.url());

  // Dump APIs
  for (const api of apis) {
    console.log(`\n=== ${api.url} ===`);
    console.log(api.text);
  }

  // Extract from DOM
  const info = await page.evaluate(() => {
    const texts = [];
    // Try to find author name
    const authorEls = document.querySelectorAll('[class*="author"], [class*="user"], [class*="name"], [class*="nickname"]');
    authorEls.forEach(el => texts.push(el.textContent.trim().slice(0, 50)));
    return texts.filter(t => t.length > 0).slice(0, 20);
  });
  console.log('\n=== Author/user elements ===');
  info.forEach(t => console.log(' ', t));

  await browser.close();
})();
