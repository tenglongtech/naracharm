import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({});
  const page = await context.newPage();
  const allNoteIds = new Set();

  // First load any note page to establish session + cookies
  await page.goto('https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b', {
    waitUntil: 'domcontentloaded', timeout: 15000
  });
  await page.waitForTimeout(3000);

  // Now navigate to user profile directly
  await page.goto('https://www.xiaohongshu.com/user/profile/66ec01d00000000009019c22', {
    waitUntil: 'domcontentloaded', timeout: 15000
  });
  await page.waitForTimeout(3000);

  console.log('Profile title:', await page.title());
  console.log('Profile URL:', page.url());

  // Wait longer for page to fully load
  await page.waitForTimeout(5000);

  // Take a screenshot to debug
  await page.screenshot({ path: '/tmp/profile_state.png' });

  // Check what's on the page - look for any data attributes, JSON in scripts
  const pageAnalysis = await page.evaluate(() => {
    const result = {
      bodyClasses: document.body.className,
      scriptsWithNoteData: [],
      links: [],
      textSnippets: [],
      hasFeed: false,
      hasNoteItems: false,
    };

    // Search ALL text for note IDs
    const bodyText = document.body.innerText;
    result.textSnippets = [
      bodyText.substring(0, 500),
    ];

    // Check if there's a feed container
    const feedEls = document.querySelectorAll('[class*="feed"], [class*="note"], [class*="waterfall"], [class*="masonry"]');
    result.hasFeed = feedEls.length > 0;
    result.feedEls = feedEls.length;

    // Check script tags for JSON data
    document.querySelectorAll('script').forEach(s => {
      const text = s.textContent || '';
      if (text.includes('note_id') || text.includes('noteId') || text.includes('userPosted')) {
        result.scriptsWithNoteData.push({
          id: s.id,
          type: s.type,
          length: text.length,
          excerpt: text.substring(0, 500),
        });
      }
      if (text.includes('window.__INITIAL_STATE__')) {
        const match = text.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/);
        if (match) {
          try {
            const state = JSON.parse(match[1]);
            result.initialState = JSON.stringify(state).substring(0, 1000);
          } catch(e) {
            result.initialState = 'Parse error: ' + e.message;
          }
        }
      }
    });

    return result;
  });

  console.log('\n=== Page Analysis ===');
  console.log('Body classes:', pageAnalysis.bodyClasses);
  console.log('Has feed elements:', pageAnalysis.hasFeed, pageAnalysis.feedEls);
  console.log('Scripts with note data:', pageAnalysis.scriptsWithNoteData.length);
  for (const s of pageAnalysis.scriptsWithNoteData) {
    console.log(`  ${s.id || '(no id)'} type=${s.type} len=${s.length}`);
    console.log(`  ${s.excerpt}`);
  }
  if (pageAnalysis.initialState) {
    console.log('\nInitial state:', pageAnalysis.initialState);
  }
  console.log('\nBody text preview:', pageAnalysis.textSnippets[0]);

  await browser.close();
})();
