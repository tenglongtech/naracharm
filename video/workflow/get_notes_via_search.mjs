import { chromium } from 'playwright';
import { writeFileSync, readFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  const allNoteIds = new Set();

  // Step 1: Get cookies from note page
  await page.goto('https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b', {
    waitUntil: 'domcontentloaded', timeout: 15000
  });
  await page.waitForTimeout(2000);
  const cookies = await context.cookies();
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');

  // Step 2: Use search to find this user's notes
  // Try searching for their name
  const SEARCH_URL = 'https://www.xiaohongshu.com/search_result?keyword=格蕾丝Grace+Studio&type=1';
  console.log('Step 2: Searching for user notes...');
  await page.goto(SEARCH_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(3000);
  console.log(`Search page title: ${await page.title()}`);

  // Extract note IDs from search results
  for (let scroll = 0; scroll < 10; scroll++) {
    const ids = await page.evaluate(() => {
      const items = [];
      const links = [...document.querySelectorAll('a[href*="explore/"]')];
      links.forEach(a => {
        const m = a.href.match(/explore\/([a-f0-9]{24})/);
        if (m && !items.includes(m[1])) items.push(m[1]);
      });
      // Also check section elements and images
      document.querySelectorAll('section, [class*="note"], [class*="card"]').forEach(el => {
        const html = el.outerHTML;
        const m = html.match(/explore\/([a-f0-9]{24})/);
        if (m && !items.includes(m[1])) items.push(m[1]);
      });
      return items;
    });
    ids.forEach(id => allNoteIds.add(id));

    // Click "search/user" tab if available to filter by user
    if (scroll === 0) {
      await page.evaluate(() => {
        // Try clicking user/people tab
        const tabs = [...document.querySelectorAll('div[class*="tab"], li, [class*="Tab"]')];
        tabs.forEach(t => {
          if (t.textContent.includes('用户') || t.textContent.includes('人物')) {
            t.click();
          }
        });
      });
      await page.waitForTimeout(2000);
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    console.log(`  Scroll ${scroll+1}: ${allNoteIds.size} unique note IDs`);
  }

  // Step 3: Try going directly to user profile with auth headers
  console.log('\nStep 3: Attempting API call for user notes...');
  try {
    const notesUrl = `https://edith.xiaohongshu.com/api/sns/web/v2/user/notes?user_id=66ec01d00000000009019c22&cursor=0&num=30`;
    const resp = await page.evaluate(async (url) => {
      const r = await fetch(url, {
        credentials: 'include',
        headers: { 'Referer': 'https://www.xiaohongshu.com/' }
      });
      return await r.text();
    }, notesUrl);
    const data = JSON.parse(resp);
    if (data.data?.items) {
      for (const item of data.data.items) {
        if (item.note_card?.note_id) {
          allNoteIds.add(item.note_card.note_id);
        }
      }
      console.log(`  API returned ${data.data.items.length} items`);
    } else {
      console.log(`  API response:`, resp.slice(0, 300));
    }
  } catch(e) {
    console.log(`  API error: ${e.message}`);
  }

  // Output
  console.log(`\n═══════════════════════════════════════`);
  console.log(`Total unique notes found: ${allNoteIds.size}`);
  console.log(`═══════════════════════════════════════`);

  const ids = Array.from(allNoteIds);
  if (ids.length > 0) {
    const urls = ids.map(id => `https://www.xiaohongshu.com/discovery/item/${id}`);
    urls.forEach((u, i) => console.log(`${i+1}. ${u}`));
    writeFileSync('/tmp/grace_notes.txt', urls.join('\n'));
    writeFileSync('/tmp/grace_cookies.txt', cookieStr);
    console.log(`\n✅ URLs saved to /tmp/grace_notes.txt`);
    console.log(`✅ Cookies saved to /tmp/grace_cookies.txt`);
    process.stdout.write(`---COOKIES_START---\n${cookieStr}\n---COOKIES_END---\n`);
  } else {
    console.log('❌ No notes found. Trying alternative method...');
  }

  await browser.close();
})();
