import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const allNotes = {};

  // Load the note page first (mobile - this worked before)
  console.log('Step 1: Loading note page (mobile)...');
  await page.goto('https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b', {
    waitUntil: 'domcontentloaded', timeout: 20000
  });
  await page.waitForTimeout(3000);
  console.log(`Title: ${await page.title()}`);

  // Check if blocked
  if (page.url().includes('login')) {
    console.log('❌ Redirected to login from note page too');
    // Try the explore URL with token
    console.log('Trying explore URL with token...');
    await page.goto('https://www.xiaohongshu.com/explore/67f6923a000000000901752b?xsec_token=CBEy6DDECxfS8Rg4PXL2kHHLEH-w3p7xMnx-noiKSqWuI=&xsec_source=pc_note', {
      waitUntil: 'domcontentloaded', timeout: 20000
    });
    await page.waitForTimeout(3000);
    console.log(`URL: ${page.url()}`);
  }

  // If note page loaded, get cookies and try to navigate to profile
  if (!page.url().includes('login')) {
    console.log('✅ Note page loaded!');

    // Get cookies for API
    const cookies = await context.cookies();
    const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    console.log(`Cookies: ${cookieStr.length} chars`);

    // Navigate to profile
    console.log('\nStep 2: Loading profile page...');
    await page.goto('https://www.xiaohongshu.com/user/profile/66ec01d00000000009019c22', {
      waitUntil: 'domcontentloaded', timeout: 20000
    });
    await page.waitForTimeout(5000);
    console.log(`Title: ${await page.title()}`);
    console.log(`URL: ${page.url()}`);

    if (!page.url().includes('login') && !page.url().includes('error')) {
      console.log('✅ Profile page loaded!');

      // Try to call the notes API directly from the page context
      // This uses the page's own cookies and XSRF tokens
      console.log('\nStep 3: Calling user notes API from page context...');

      // First, try to get the xsec token from the page
      const pageVars = await page.evaluate(() => {
        const result = {};
        // Search all scripts for xsec_token
        document.querySelectorAll('script').forEach(s => {
          if (s.textContent) {
            const match = s.textContent.match(/xsec_token["']?:\s*["']([^"']+)/);
            if (match) result.xsecToken = match[1];
          }
        });
        return result;
      });
      console.log('Page variables:', JSON.stringify(pageVars));

      // Try the API with various approaches
      const apiResult = await page.evaluate(async () => {
        const results = {};

        // Approach 1: fetch with credentials
        try {
          const url = `https://edith.xiaohongshu.com/api/sns/web/v2/user/notes?` +
            new URLSearchParams({ user_id: '66ec01d00000000009019c22', num: '30', cursor: '' });
          const resp = await fetch(url, { credentials: 'include' });
          results.approach1 = { status: resp.status, text: await resp.text() };
        } catch(e) {
          results.approach1 = e.message;
        }

        // Approach 2: fetch with proper headers
        try {
          const resp = await fetch(
            'https://edith.xiaohongshu.com/api/sns/web/v1/feed',
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json;charset=UTF-8',
              },
              body: JSON.stringify({
                source_note_id: '67f6923a000000000901752b',
                image_formats: ['jpg', 'webp', 'avif'],
              }),
            }
          );
          results.approach2 = { status: resp.status, text: await resp.text() };
        } catch(e) {
          results.approach2 = e.message;
        }

        // Approach 3: XMLHttpRequest
        try {
          const xhrResult = await new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://edith.xiaohongshu.com/api/sns/web/v2/user/notes?' +
              new URLSearchParams({ user_id: '66ec01d00000000009019c22', num: '30', cursor: '' }));
            xhr.withCredentials = true;
            xhr.onload = () => resolve({ status: xhr.status, text: xhr.responseText.slice(0, 2000) });
            xhr.onerror = () => resolve('XHR error');
            xhr.send();
          });
          results.approach3 = xhrResult;
        } catch(e) {
          results.approach3 = e.message;
        }

        return results;
      });

      console.log('\n=== API Results ===');
      for (const [key, val] of Object.entries(apiResult)) {
        console.log(`\n--- ${key} ---`);
        if (typeof val === 'string') {
          console.log(val);
        } else {
          console.log(`Status: ${val.status}`);
          console.log(val.text.slice(0, 1500));
          // Extract note IDs
          if (val.text) {
            const matches = [...val.text.matchAll(/"note_id"\s*:\s*"([a-f0-9]{24})"/g)];
            if (matches.length > 0) {
              matches.forEach(m => {
                if (m[1] !== '67f6923a000000000901752b') {
                  allNotes[m[1]] = true;
                }
              });
            }
          }
        }
      }

      // Also try to extract from the page by scrolling
      console.log('\nStep 4: Trying to scroll and load notes...');
      for (let i = 0; i < 15; i++) {
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(1000);

        const ids = await page.evaluate(() => {
          return [...new Set(
            [...document.querySelectorAll('a[href*="explore/"], a[href*="discovery/item"]')]
              .map(a => {
                const m = a.href.match(/explore\/([a-f0-9]{24})/) || a.href.match(/discovery\/item\/([a-f0-9]{24})/);
                return m ? m[1] : null;
              })
              .filter(Boolean)
          )];
        });
        ids.forEach(id => { allNotes[id] = true; });
        if (ids.length > 0) {
          console.log(`  Scroll ${i+1}: ${ids.length} found, ${Object.keys(allNotes).length} total`);
        }
      }
    }
  } else {
    console.log('❌ Redirected to login. Trying alternative...');
  }

  // Final output
  console.log(`\n═══════════════════════════════════════`);
  console.log(`Total unique note IDs: ${Object.keys(allNotes).length}`);
  console.log(`═══════════════════════════════════════`);

  if (Object.keys(allNotes).length > 0) {
    const urls = Object.keys(allNotes).map(id => `https://www.xiaohongshu.com/discovery/item/${id}`);
    urls.forEach((u, i) => console.log(`${i+1}. ${u}`));
    writeFileSync('/tmp/grace_all_notes.txt', urls.join('\n'));
    console.log(`\n✅ Saved to /tmp/grace_all_notes.txt`);
  } else {
    console.log('No note IDs found via any method.');
    console.log('I need the note URLs from Grace Studio to download them.');
    console.log('You can find them by opening Grace\'s profile page and copying the URLs.');
  }

  await browser.close();
})();
