import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('api/sns/web/v1/feed') || url.includes('api/sns/web/v2/note')) {
      try {
        const body = await resp.json();
        const raw = JSON.stringify(body);
        if (raw.includes('nickname') || raw.includes('user_id')) {
          console.log('=== API:', url.slice(-50));
          console.log(raw.slice(0, 3000));
        }
      } catch(e) {}
    }
  });

  await page.goto('https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b', { 
    waitUntil: 'domcontentloaded', timeout: 20000 
  });
  await page.waitForTimeout(5000);

  const userInfo = await page.evaluate(() => {
    const links = [...document.querySelectorAll('a')];
    const profileLinks = links
      .filter(l => l.href && l.href.includes('user/profile'))
      .map(l => ({ href: l.href, text: l.textContent.trim() }));
    return { profileLinks };
  });
  console.log('=== Profile Links ===');
  console.log(JSON.stringify(userInfo, null, 2));

  await browser.close();
})();
