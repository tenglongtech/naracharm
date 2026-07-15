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
  const noteIds = new Set();

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  // Step 1: Load known note
  console.log('Step 1: Loading note for session...');
  await page.goto('https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b', {
    waitUntil: 'domcontentloaded', timeout: 20000
  });
  await page.waitForTimeout(3000);

  // Step 2: Navigate to profile
  console.log('Step 2: Profile...');
  await page.goto('https://www.xiaohongshu.com/user/profile/66ec01d00000000009019c22', {
    waitUntil: 'domcontentloaded', timeout: 20000
  }).catch(() => {});
  await page.waitForTimeout(5000);

  console.log(`Title: ${await page.title()}`);
  console.log(`URL: ${page.url()}`);

  const currentUrl = page.url();
  if (currentUrl.includes('user/profile/66ec01d00000000009019c22')) {
    console.log('✅ Profile loaded!');
    for (let i = 0; i < 15; i++) {
      const ids = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('[href*="explore/"], [href*="discovery/item"]').forEach(a => {
          const m = a.href.match(/explore\/([a-f0-9]{24})/) || a.href.match(/discovery\/item\/([a-f0-9]{24})/);
          if (m) items.push(m[1]);
        });
        return [...new Set(items)];
      });
      ids.forEach(id => noteIds.add(id));
      console.log(`  Scroll ${i+1}: ${noteIds.size} unique`);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1500);
    }
  } else {
    console.log('❌ Blocked from profile.');
    // Try search
    console.log('Step 3: Search...');
    await page.goto('https://www.xiaohongshu.com/search_result?keyword=格蕾丝Grace+Studio', {
      waitUntil: 'domcontentloaded', timeout: 20000
    }).catch(() => {});
    await page.waitForTimeout(5000);
    console.log(`Search: ${await page.title()}`);

    for (let i = 0; i < 8; i++) {
      const ids = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('[href*="explore/"]').forEach(a => {
          const m = a.href.match(/explore\/([a-f0-9]{24})/);
          if (m) items.push(m[1]);
        });
        return [...new Set(items)];
      });
      ids.forEach(id => noteIds.add(id));
      console.log(`  Scroll ${i+1}: ${noteIds.size} unique`);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1500);
    }
  }

  console.log(`\nTotal notes: ${noteIds.size}`);
  if (noteIds.size > 0) {
    const urls = Array.from(noteIds).map(id => `https://www.xiaohongshu.com/discovery/item/${id}`);
    urls.forEach((u, i) => console.log(`${i+1}. ${u}`));
    writeFileSync('/tmp/grace_all_notes.txt', urls.join('\n'));
    console.log('Saved!');
  } else {
    console.log('No notes found. Trying to find any note IDs from page...');
    const pageContent = await page.content();
    const matches = pageContent.match(/[a-f0-9]{24}/g);
    if (matches) {
      const unique = [...new Set(matches.filter(m =>
        (m.startsWith('6') || m.startsWith('5')) && !m.startsWith('600') && !m.startsWith('500')
      ))];
      console.log(`Found ${unique.length} possible note IDs`);
      unique.slice(0, 20).forEach(id => console.log(`  ${id}`));
    }
  }

  await browser.close();
})();
