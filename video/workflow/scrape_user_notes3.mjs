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

  // Step 1: Go to note page with xsec_token
  const noteUrl = 'https://www.xiaohongshu.com/explore/67f6923a000000000901752b?xsec_token=CBEy6DDECxfS8Rg4PXL2kHHLEH-w3p7xMnx-noiKSqWuI=&xsec_source=pc_note';
  console.log('Step 1: Loading note page with xsec_token...');
  await page.goto(noteUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);

  // Step 2: Click the author name to go to profile
  console.log('Step 2: Clicking author link to go to profile...');
  const authorClicked = await page.evaluate(() => {
    const authorLinks = [...document.querySelectorAll('a')]
      .filter(a => a.href && a.href.includes('user/profile'));
    if (authorLinks.length > 0) {
      authorLinks[0].click();
      return authorLinks[0].href;
    }
    return null;
  });
  console.log(`Author link: ${authorClicked}`);

  await page.waitForTimeout(5000);

  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}`);
  const title = await page.title();
  console.log(`Title: ${title}`);

  // Step 3: Extract note links from profile page
  // The profile page should show the user's notes
  // Try clicking on the "笔记" tab if visible
  await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('[class*="tab"], li, button, a')];
    const notesTab = tabs.find(el =>
      el.textContent.includes('笔记') || el.textContent.includes('作品')
    );
    if (notesTab) {
      notesTab.click();
      console.log('Clicked "笔记" tab');
    }
  });
  await page.waitForTimeout(3000);

  // Scroll to load all notes
  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    const count = await page.evaluate(() =>
      document.querySelectorAll('[href*="explore/"], [href*="discovery/item"]').length
    );
    console.log(`Scroll ${i+1}/8 - ${count} links found`);
  }

  // Extract note IDs from DOM
  const notes = await page.evaluate(() => {
    const links = [...document.querySelectorAll('a[href*="explore/"], a[href*="discovery/item"]')];
    const result = [];
    for (const a of links) {
      const href = a.href;
      // Extract note ID
      const match = href.match(/explore\/([a-f0-9]+)/) || href.match(/discovery\/item\/([a-f0-9]+)/);
      if (match) {
        result.push({
          id: match[1],
          url: `https://www.xiaohongshu.com/discovery/item/${match[1]}`,
          text: a.textContent.trim().slice(0, 80),
        });
      }
    }
    return result;
  });

  console.log(`\n=== Found ${notes.length} notes ===`);
  for (const note of notes) {
    noteUrls.add(note.url);
    console.log(`  ${note.id} ${note.text ? note.text.slice(0, 50) : ''}`);
  }

  const urls = Array.from(noteUrls);
  writeFileSync('/tmp/grace_studio_notes.txt', urls.join('\n'));
  console.log(`\nSaved ${urls.length} URLs to /tmp/grace_studio_notes.txt`);

  await browser.close();
})();
