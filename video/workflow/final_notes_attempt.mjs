import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  });
  const page = await context.newPage();
  const noteIds = new Set();

  // Set up route interception to add auth headers to API calls
  await page.route('**/api/sns/web/**', async (route) => {
    const headers = {
      ...route.request().headers(),
      'Origin': 'https://www.xiaohongshu.com',
      'Referer': 'https://www.xiaohongshu.com/',
      'X-Requested-With': 'XMLHttpRequest',
    };
    await route.continue({ headers });
  });

  // First use the note page directly to establish session
  console.log('Establishing session...');
  await page.goto('https://www.xiaohongshu.com/explore/67f6923a000000000901752b', {
    waitUntil: 'domcontentloaded', timeout: 15000
  });
  await page.waitForTimeout(3000);

  // Get page content to find author info
  const pageData = await page.evaluate(() => {
    const text = document.body.innerText;
    // Find any note IDs in the page
    const noteIds = [...document.querySelectorAll('[id*="note"], [class*="note"], [data-id]')]
      .map(el => el.id || el.getAttribute('data-id') || '')
      .filter(id => id.length > 10);
    return {
      textPreview: text.substring(0, 1000),
      noteIds,
      links: [...document.querySelectorAll('a[href*="explore/"]')].map(a => a.href),
    };
  });
  console.log('Page text:', pageData.textPreview);

  // Now try to access the profile page directly
  console.log('\nTrying profile page...');
  const response = await page.goto('https://www.xiaohongshu.com/user/profile/66ec01d00000000009019c22', {
    waitUntil: 'domcontentloaded', timeout: 15000
  }).catch(() => null);

  if (response) {
    console.log('Profile status:', response.status());
    const title = await page.title();
    console.log('Profile title:', title);
    const url = page.url();
    console.log('Profile URL:', url);

    // Try with different path
    if (url.includes('login') || url.includes('error')) {
      console.log('Blocked - trying alternative...');
    }
  }

  // Try the explore API endpoint instead - this fetches similar notes
  console.log('\nTrying explore/feed API...');
  try {
    const feedResult = await page.evaluate(async () => {
      const formData = new URLSearchParams();
      formData.append('source_note_id', '67f6923a000000000901752b');
      formData.append('image_formats', 'jpg,webp,avif');

      const resp = await fetch('https://edith.xiaohongshu.com/api/sns/web/v1/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });
      const text = await resp.text();
      return text;
    });
    console.log(feedResult.slice(0, 1500));

    // Parse for note IDs
    const matches = feedResult.match(/[a-f0-9]{24}/g);
    if (matches) {
      matches.forEach(id => {
        if (id !== '67f6923a000000000901752b') {
          noteIds.add(id);
        }
      });
    }
  } catch(e) {
    console.log('Feed error:', e.message);
  }

  console.log(`\nExtra note IDs found: ${noteIds.size}`);
  noteIds.forEach(id => console.log(id));

  if (noteIds.size > 0) {
    const urls = Array.from(noteIds).map(id => `https://www.xiaohongshu.com/discovery/item/${id}`);
    writeFileSync('/tmp/extra_notes.txt', urls.join('\n'));
  }

  // Save all cookies for later use
  const cookies = await context.cookies();
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  writeFileSync('/tmp/xhs_cookies.txt', cookieStr);
  console.log(`\nCookies saved (${cookies.length} cookies)`);

  await browser.close();
})();
