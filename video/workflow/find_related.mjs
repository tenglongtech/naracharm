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
  const allNoteIds = new Set();

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  // Intercept all API calls
  page.on('response', async (resp) => {
    const url = resp.url();
    try {
      if (url.includes('api/sns') || url.includes('edith.')) {
        const text = await resp.text();
        const matches = [...text.matchAll(/"note_id"\s*:\s*"([a-f0-9]{24})"/g)];
        for (const m of matches) {
          if (m[1] !== '67f6923a000000000901752b') {
            allNoteIds.add(m[1]);
          }
        }
      }
    } catch(e) {}
  });

  // Load the note page - it should show related notes from same author
  console.log('Loading note page (desktop)...');
  await page.goto('https://www.xiaohongshu.com/explore/67f6923a000000000901752b?xsec_token=CBEy6DDECxfS8Rg4PXL2kHHLEH-w3p7xMnx-noiKSqWuI=&xsec_source=pc_note', {
    waitUntil: 'domcontentloaded', timeout: 20000
  });
  await page.waitForTimeout(8000);

  console.log(`Title: ${await page.title()}`);
  console.log(`URL: ${page.url()}`);

  // Now try extracting from the page
  const related = await page.evaluate(() => {
    const items = [];

    // Get all note links from related content section
    document.querySelectorAll('[class*="related"], [class*="recommend"], [class*="interact"]').forEach(el => {
      const links = el.querySelectorAll('a[href*="explore/"]');
      links.forEach(a => {
        const m = a.href.match(/explore\/([a-f0-9]{24})/);
        if (m) items.push(m[1]);
      });
    });

    // Check the whole page for any note links
    document.querySelectorAll('a[href*="explore/"]').forEach(a => {
      const m = a.href.match(/explore\/([a-f0-9]{24})/);
      if (m) items.push(m[1]);
    });

    return [...new Set(items)];
  });

  related.forEach(id => allNoteIds.add(id));
  console.log(`Notes from page DOM: ${related.length}`);

  // Also try the feed API which returns related/recommended notes
  console.log('\nTrying feed API from page context...');
  try {
    const feedResult = await page.evaluate(async () => {
      const resp = await fetch('https://edith.xiaohongshu.com/api/sns/web/v1/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({
          source_note_id: '67f6923a000000000901752b',
          image_formats: ['jpg', 'webp', 'avif'],
        }),
      });
      return await resp.text();
    });

    const feedMatches = [...feedResult.matchAll(/"note_id"\s*:\s*"([a-f0-9]{24})"/g)];
    for (const m of feedMatches) {
      if (m[1] !== '67f6923a000000000901752b') {
        allNoteIds.add(m[1]);
      }
    }
    console.log(`Feed API length: ${feedResult.length}`);
    if (feedMatches.length > 0) {
      console.log(`Found ${feedMatches.length} note IDs in feed response`);
    }
  } catch(e) {
    console.log('Feed error:', e.message);
  }

  console.log(`\nTotal unique notes: ${allNoteIds.size}`);
  if (allNoteIds.size > 0) {
    const urls = Array.from(allNoteIds).map(id => `https://www.xiaohongshu.com/discovery/item/${id}`);
    urls.forEach((u, i) => console.log(`${i+1}. ${u}`));
    writeFileSync('/tmp/related_notes.txt', urls.join('\n'));
  } else {
    console.log('No related notes found.');
    console.log('Checking page content for any note references...');
    const allNoteRefsInPage = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    console.log('Page content:\n', allNoteRefsInPage);
  }

  await browser.close();
})();
