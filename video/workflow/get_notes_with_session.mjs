import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  });
  const page = await context.newPage();
  const sessionInfo = {};

  // Capture session cookie from login/activate
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('login/activate')) {
      try {
        const json = await resp.json();
        if (json.data?.session) {
          sessionInfo.session = json.data.session;
          sessionInfo.secureSession = json.data.secure_session;
          sessionInfo.userId = json.data.user_id;
          console.log('Got session:', json.data.session.slice(0, 20) + '...');
        }
      } catch(e) {}
    }
    // Also look for user notes in any API response
    if (url.includes('user/notes') || url.includes('user_posted') || url.includes('user/feeds')) {
      try {
        const text = await resp.text();
        console.log(`\n=== USER NOTES API RESPONSE ===`);
        console.log(text.slice(0, 5000));
      } catch(e) {}
    }
  });

  // Step 1: Establish session via homepage
  console.log('Step 1: Establishing session...');
  await page.goto('https://www.xiaohongshu.com', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);

  // After page load, check if we have cookies
  let cookies = await context.cookies();
  console.log(`Cookies after homepage: ${cookies.map(c => c.name).join(', ')}`);

  // Step 2: Now navigate to the note page to get better cookies
  console.log('Step 2: Loading note page...');
  await page.goto('https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b', {
    waitUntil: 'domcontentloaded', timeout: 15000
  });
  await page.waitForTimeout(3000);

  cookies = await context.cookies();
  console.log(`Cookies after note: ${cookies.map(c => c.name).join(', ')}`);

  // Step 3: Try to access the user notes API directly via fetch
  console.log('\nStep 3: Calling user notes API...');
  try {
    const result = await page.evaluate(async () => {
      const resp = await fetch(
        'https://edith.xiaohongshu.com/api/sns/web/v2/user/notes?' +
        new URLSearchParams({
          user_id: '66ec01d00000000009019c22',
          num: '30',
          cursor: '',
        }),
        {
          headers: {
            'Referer': 'https://www.xiaohongshu.com/',
            'Origin': 'https://www.xiaohongshu.com',
          },
        }
      );
      return await resp.text();
    });
    console.log(`User notes API: ${result.slice(0, 3000)}`);

    try {
      const json = JSON.parse(result);
      if (json.data?.items) {
        console.log(`\nFound ${json.data.items.length} notes!`);
        json.data.items.forEach((item, i) => {
          if (item.note_card) {
            console.log(`${i+1}. ${item.note_card.note_id} — ${(item.note_card.title || '').slice(0, 40)}`);
          }
        });
      }
    } catch(e) {
      console.log(`Parse error: ${e.message}`);
    }
  } catch(e) {
    console.log(`Fetch error: ${e.message}`);
  }

  // Step 4: Also try using the explore page to get user context
  console.log('\nStep 4: Trying explore page...');
  try {
    const exploreResult = await page.evaluate(async () => {
      const resp = await fetch(
        'https://edith.xiaohongshu.com/api/sns/web/v1/feed?' +
        new URLSearchParams({
          source_note_id: '67f6923a000000000901752b',
          image_formats: 'jpg,webp,avif',
        }),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Referer': 'https://www.xiaohongshu.com/' },
          body: JSON.stringify({ source_note_id: '67f6923a000000000901752b', image_formats: ['jpg', 'webp', 'avif'] }),
        }
      );
      return await resp.text();
    });
    console.log(`Feed API: ${exploreResult.slice(0, 2000)}`);
  } catch(e) {
    console.log(`Feed error: ${e.message}`);
  }

  await browser.close();
})();
