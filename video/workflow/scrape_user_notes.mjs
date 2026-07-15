import { chromium } from 'playwright';

const USER_ID = '66ec01d00000000009019c22';
const PROFILE_URL = `https://www.xiaohongshu.com/user/profile/${USER_ID}`;
const OUTPUT_FILE = '/tmp/grace_studio_notes.txt';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  const noteUrls = new Set();

  // Intercept responses for note data
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('api/sns/web/v1/user/notes')) {
      try {
        const body = await resp.json();
        if (body.data && body.data.items) {
          for (const item of body.data.items) {
            if (item.note_card && item.note_card.note_id) {
              noteUrls.add(`https://www.xiaohongshu.com/discovery/item/${item.note_card.note_id}`);
            }
          }
          console.log(`  Found ${noteUrls.size} notes so far...`);
        }
        // Check for pagination
        if (body.data && body.data.has_more) {
          console.log('  More pages available');
        }
      } catch(e) {}
    }
  });

  console.log(`Navigating to ${PROFILE_URL}...`);
  await page.goto(PROFILE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(5000);

  // Try scrolling to load more notes
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    console.log(`Scrolled ${i+1}/5`);
  }

  // Also extract from DOM as fallback
  const domUrls = await page.evaluate(() => {
    const links = [...document.querySelectorAll('a[href*="discovery/item"], a[href*="explore/"]')];
    return links.map(l => l.href).filter(h => h);
  });
  for (const url of domUrls) {
    noteUrls.add(url);
  }

  console.log(`\nTotal notes found: ${noteUrls.size}`);

  // Write to file
  const fs = await import('fs');
  const urls = Array.from(noteUrls);
  fs.writeFileSync(OUTPUT_FILE, urls.join('\n') + '\n');
  console.log(`URLs written to ${OUTPUT_FILE}`);

  // Print URLs
  for (const url of urls) {
    console.log(url);
  }

  await browser.close();
})();
