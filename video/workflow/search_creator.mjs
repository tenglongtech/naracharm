import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Use fresh context without any cached cookies
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  const allNoteIds = new Set();
  const foundTitles = [];

  // Listen for API responses
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('api/sns/web/v1/search')) {
      try {
        const json = await resp.json();
        if (json.data?.items) {
          for (const item of json.data.items) {
            if (item.note_card?.note_id) {
              allNoteIds.add(item.note_card.note_id);
              foundTitles.push({
                id: item.note_card.note_id,
                title: item.note_card.title || '',
                likes: item.note_card.liked_count || '?',
              });
            }
          }
        }
      } catch(e) {}
    }
  });

  // Step 1: Go to Xiaohongshu home to establish session
  console.log('Establishing session...');
  await page.goto('https://www.xiaohongshu.com', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Step 2: Search for the creator's notes
  const searchTerms = [
    '格蕾丝Grace Studio',
    '格蕾丝Grace Studio 手串',
    'Grace Studio 珠宝',
  ];

  for (const term of searchTerms) {
    console.log(`\nSearching: "${term}"`);
    await page.goto(`https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(term)}&source=web_search_result_notes`, {
      waitUntil: 'domcontentloaded', timeout: 15000
    });
    await page.waitForTimeout(3000);

    // Get page info
    const pageInfo = await page.evaluate(() => ({
      title: document.title,
      noteCount: document.querySelectorAll('[href*="explore/"]').length,
    }));
    console.log(`  Page: ${pageInfo.title} | ${pageInfo.noteCount} note links`);

    // Scroll to load more
    for (let s = 0; s < 5; s++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1500);

      // Extract note IDs from DOM
      const ids = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('a[href*="explore/"]').forEach(a => {
          const m = a.href.match(/explore\/([a-f0-9]{24})/);
          if (m) items.push(m[1]);
          // Also check parent elements for title
          const titleEl = a.querySelector('[class*="title"], img');
          if (titleEl) {
            const title = titleEl.getAttribute('alt') || titleEl.getAttribute('title') || '';
          }
        });
        return items;
      });
      ids.forEach(id => allNoteIds.add(id));
      console.log(`  Scroll ${s+1}: ${ids.length} in DOM, ${allNoteIds.size} unique`);
    }

    // Also try clicking "user" tab if present to find more
    const userTabClicked = await page.evaluate(() => {
      const tabs = [...document.querySelectorAll('div[class*="tab"], span, a')];
      const userTab = tabs.find(t => t.textContent.includes('用户'));
      if (userTab) { userTab.click(); return true; }
      return false;
    });

    if (userTabClicked) {
      console.log('  Clicked "用户" tab');
      await page.waitForTimeout(3000);
      const userIds = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('a[href*="user/profile"]').forEach(a => {
          const m = a.href.match(/user\/profile\/([a-f0-9]+)/);
          if (m) items.push(m[1]);
        });
        return items;
      });
      console.log(`  Found user IDs: ${userIds.slice(0, 5).join(', ')}`);
    }
  }

  // Output results
  console.log(`\n═══════════════════════════════════════`);
  console.log(`Total unique note IDs: ${allNoteIds.size}`);
  console.log(`═══════════════════════════════════════`);

  const ids = Array.from(allNoteIds);
  ids.forEach((id, i) => {
    const note = foundTitles.find(n => n.id === id);
    const title = note ? note.title : '(unknown)';
    console.log(`${i+1}. ${id} — ${title}`);
  });

  if (ids.length > 0) {
    const urls = ids.map(id => `https://www.xiaohongshu.com/discovery/item/${id}`);
    const { writeFileSync } = await import('fs');
    writeFileSync('/tmp/grace_notes.txt', urls.join('\n'));
    console.log(`\n✅ Saved ${ids.length} URLs to /tmp/grace_notes.txt`);
  }

  await browser.close();
})();
