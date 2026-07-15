import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  // Use desktop viewport for better API exposure
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const apis = [];

  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('api/sns/web') || url.includes('edith')) {
      try {
        const text = await resp.text();
        apis.push({ url: url.slice(-80), status: resp.status(), text: text.slice(0, 3000) });
      } catch(e) {}
    }
  });

  // Navigate with desktop view
  await page.goto('https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b', {
    waitUntil: 'domcontentloaded', timeout: 20000
  });
  await page.waitForTimeout(5000);

  // Check title
  console.log('Title:', await page.title());

  // Dump APIs that contain user info
  for (const api of apis) {
    if (api.text.includes('nickname') || api.text.includes('nick_name') ||
        api.text.includes('user_id') || api.text.includes('author_id')) {
      console.log(`\n=== ${api.url} ===`);
      console.log(api.text.slice(0, 2000));
    }
  }

  // Also extract from DOM
  const info = await page.evaluate(() => ({
    title: document.title,
    url: location.href,
    scripts: [...document.querySelectorAll('script')]
      .filter(s => s.textContent && s.textContent.includes('nickname'))
      .map(s => s.textContent.slice(0, 1000))
  }));
  if (info.scripts.length) {
    console.log('\n=== Scripts with nickname ===');
    info.scripts.forEach(s => console.log(s));
  }

  // Try to extract any profile/user links from the full page
  const links = await page.evaluate(() =>
    [...document.querySelectorAll('[href*="user"], [href*="profile"], [data-user]')]
      .map(el => ({ tag: el.tagName, href: el.href || el.getAttribute('data-user'), text: el.textContent.trim().slice(0, 50) }))
  );
  console.log('\n=== User-related DOM elements ===');
  console.log(JSON.stringify(links, null, 2));

  await browser.close();
})();
