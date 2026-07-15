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
    if (url.includes('xiaohongshu.com/api') || url.includes('edith.')) {
      try {
        const text = await resp.text();
        apis.push({ url: url.slice(-80), text: text.slice(0, 3000) });
      } catch(e) {}
    }
    if (url.includes('xhscdn.com/stream/') && url.includes('.mp4')) {
      apis.push({ url: url.slice(-80), text: 'MP4_STREAM' });
    }
  });

  await page.goto('https://www.xiaohongshu.com/explore/67f6923a000000000901752b?xsec_token=CBEy6DDECxfS8Rg4PXL2kHHLEH-w3p7xMnx-noiKSqWuI=&xsec_source=pc_note', {
    waitUntil: 'domcontentloaded', timeout: 20000
  });
  await page.waitForTimeout(5000);

  // Print all APIs
  for (const api of apis) {
    if (api.text !== 'MP4_STREAM') {
      console.log(`\n--- ${api.url} ---`);
      console.log(api.text.length > 2000 ? api.text.slice(0, 2000) + '...' : api.text);
    }
  }

  // Click user name to go to profile
  try {
    const userLink = await page.$('a[href*="user/profile"]');
    if (userLink) {
      const href = await userLink.getAttribute('href');
      console.log('\n=== USER PROFILE LINK:', href);
    } else {
      console.log('\n=== No user link found directly');
    }
  } catch(e) {}

  // Get ALL links on page
  const allLinks = await page.evaluate(() =>
    [...document.querySelectorAll('a[href]')]
      .map(a => ({ text: a.textContent.trim().slice(0, 30), href: a.href.slice(0, 120) }))
      .filter(l => l.text)
  );
  const profileLinks = allLinks.filter(l => l.href.includes('user/profile'));
  console.log('\n=== Profile links from page ===');
  profileLinks.forEach(l => console.log(`  ${l.text}: ${l.href}`));

  await browser.close();
})();
