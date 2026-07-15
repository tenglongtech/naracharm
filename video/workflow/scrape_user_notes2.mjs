import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  const noteUrls = new Set();
  const apiCalls = [];

  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('/api/sns/web/v1/user/notes') ||
        url.includes('/api/sns/web/v2/user/notes') ||
        url.includes('/api/sns/web/v1/user/feeds')) {
      try {
        const body = await resp.json();
        apiCalls.push({ url: url.slice(-60), body: JSON.stringify(body).slice(0, 3000) });
        if (body.data && body.data.items) {
          for (const item of body.data.items) {
            if (item.note_card && item.note_card.note_id) {
              noteUrls.add(`https://www.xiaohongshu.com/discovery/item/${item.note_card.note_id}`);
            }
          }
        }
      } catch(e) {}
    }
  });

  const profileUrl = 'https://www.xiaohongshu.com/user/profile/66ec01d00000000009019c22';
  console.log(`Loading ${profileUrl}...`);
  await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(5000);

  console.log(`Page title: ${await page.title()}`);
  console.log(`Page URL: ${page.url()}`);

  // Dump API calls
  for (const api of apiCalls) {
    console.log(`\nAPI: ${api.url}`);
    console.log(api.body.slice(0, 1000));
  }

  // Extract from DOM - look for note cards
  const noteData = await page.evaluate(() => {
    // Look for section/note card items
    const items = [];
    const links = document.querySelectorAll('a[href*="explore/"], a[href*="discovery/item"]');
    links.forEach(a => {
      const href = a.href;
      const title = a.getAttribute('title') || '';
      const img = a.querySelector('img');
      const imgAlt = img ? img.alt : '';
      items.push({ href: href.split('?')[0], title: title || imgAlt });
    });
    return items;
  });

  console.log(`\nDOM note links: ${noteData.length}`);
  for (const item of noteData) {
    noteUrls.add(item.href);
    console.log(`  ${item.title.slice(0, 40)}: ${item.href}`);
  }

  console.log(`\nTotal unique notes: ${noteUrls.size}`);

  // Save URLs
  const urls = Array.from(noteUrls);
  writeFileSync('/tmp/grace_studio_notes.txt', urls.join('\n'));
  console.log('Saved to /tmp/grace_studio_notes.txt');

  await browser.close();
})();
