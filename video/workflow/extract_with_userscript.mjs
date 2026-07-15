import { chromium } from 'playwright';
import { writeFileSync, readFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  const allNoteIds = new Map();

  // Hide automation
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    // Override permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (p) => p.name === 'notifications'
      ? Promise.resolve({ state: 'denied' })
      : originalQuery(p);
  });

  // Intercept all XHR responses
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('edith.xiaohongshu.com') || url.includes('api.sns')) {
      try {
        const text = await resp.text();
        if (text.includes('"note_id"') || text.includes('"items"')) {
          // Extract all note IDs
          const matches = text.match(/"note_id"\s*:\s*"([a-f0-9]{24})"/g);
          if (matches) {
            matches.forEach(m => {
              const id = m.match(/"note_id"\s*:\s*"([a-f0-9]{24})"/)[1];
              allNoteIds.set(id, '');
            });
          }
        }
      } catch(e) {}
    }
  });

  // Step 1: Visit note page to get cookies + establish session
  await page.goto('https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b', {
    waitUntil: 'domcontentloaded', timeout: 20000
  });
  await page.waitForTimeout(3000);

  // Step 2: Navigate to profile page
  console.log('Navigating to profile...');
  await page.goto('https://www.xiaohongshu.com/user/profile/66ec01d00000000009019c22', {
    waitUntil: 'domcontentloaded', timeout: 20000
  });
  // Wait longer for JS rendering
  await page.waitForTimeout(10000);

  console.log(`Title: ${await page.title()}`);
  console.log(`URL: ${page.url()}`);

  // Step 3: Extract from Vue reactive state
  console.log('\nAttempting to extract from Vue state...');
  const vueData = await page.evaluate(() => {
    const results = {};

    // Method 1: Check __INITIAL_STATE__
    if (window.__INITIAL_STATE__) {
      results.initialState = JSON.stringify(window.__INITIAL_STATE__).slice(0, 2000);
    }

    // Method 2: Try __NUXT__
    if (window.__NUXT__) {
      results.nuxt = JSON.stringify(window.__NUXT__).slice(0, 2000);
    }

    // Method 3: Look for __vue_app__ on the root element
    const appEl = document.getElementById('app') || document.getElementById('__next');
    if (appEl && appEl.__vue_app__) {
      const vueApp = appEl.__vue_app__;
      // Try to get the store/state from the app
      const appContext = vueApp._context || {};
      results.hasVueApp = true;
      results.appProvides = JSON.stringify(Object.keys(appContext.provides || {})).slice(0, 500);
    }

    // Method 4: Check for window.__STORE__ or similar
    const storeKeys = Object.keys(window).filter(k =>
      k.includes('store') || k.includes('Store') ||
      k.includes('STATE') || k.includes('state') ||
      k.includes('pinia') || k.includes('vuex')
    );
    if (storeKeys.length) {
      results.storeKeys = storeKeys;
      storeKeys.forEach(k => {
        try {
          results[k] = JSON.stringify(window[k]).slice(0, 1000);
        } catch(e) {}
      });
    }

    // Method 5: Check the reactive root
    const rootEl = document.querySelector('#__nuxt, #__next, #app, [data-v-app]');
    if (rootEl) {
      results.rootTag = rootEl.tagName;
      results.rootId = rootEl.id;
      results.rootClasses = rootEl.className;
    }

    // Method 6: Check all script tags data
    const scripts = [...document.querySelectorAll('script')]
      .filter(s => s.textContent && (s.textContent.includes('note') || s.textContent.includes('userProfile')))
      .map(s => ({
        id: s.id,
        text: s.textContent.slice(0, 500)
      }));
    if (scripts.length) {
      results.scripts = scripts;
    }

    // Method 7: Search for any global data
    const possibleDataKeys = ['__INITIAL_STATE__', '__NEXT_DATA__', '__NUXT__', '__STORE__', '__PINIA__'];
    possibleDataKeys.forEach(k => {
      if (window[k]) {
        results[k + '_exists'] = true;
      }
    });

    return results;
  });

  // Print results
  if (vueData.initialState) console.log('\nInitial State:', vueData.initialState);
  if (vueData.nuxt) console.log('\nNuxt:', vueData.nuxt);
  if (vueData.hasVueApp) console.log('\nHas Vue App');
  if (vueData.storeKeys) console.log('\nStore keys:', vueData.storeKeys);

  // Also try the feed/interaction API from page context
  console.log('\nTrying to call API from page context...');
  try {
    const apiResult = await page.evaluate(async () => {
      try {
        const resp = await fetch(
          'https://edith.xiaohongshu.com/api/sns/web/v1/feed',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
              source_note_id: '67f6923a000000000901752b',
              image_formats: ['jpg', 'webp', 'avif'],
            }),
          }
        );
        return await resp.text();
      } catch(e) {
        return 'Error: ' + e.message;
      }
    });
    console.log('Feed API result (first 2000 chars):', apiResult.slice(0, 2000));
    // Extract note IDs
    const noteMatches = apiResult.match(/"note_id"\s*:\s*"([a-f0-9]{24})"/g);
    if (noteMatches) {
      noteMatches.forEach(m => {
        const id = m.match(/"note_id"\s*:\s*"([a-f0-9]{24})"/)[1];
        allNoteIds.set(id, '');
      });
      console.log(`Found ${noteMatches.length} note IDs from feed API`);
    }
  } catch(e) {
    console.log('API call error:', e.message);
  }

  // Output
  console.log(`\n═══════════════════════════════════════`);
  console.log(`Total note IDs: ${allNoteIds.size}`);
  console.log(`═══════════════════════════════════════`);

  if (allNoteIds.size > 0) {
    const urls = Array.from(allNoteIds.keys()).map(id =>
      `https://www.xiaohongshu.com/discovery/item/${id}`
    );
    urls.forEach((u, i) => console.log(`${i+1}. ${u}`));
    writeFileSync('/tmp/grace_all_notes.txt', urls.join('\n'));
    console.log(`\n✅ Saved to /tmp/grace_all_notes.txt`);
  } else {
    console.log('No note IDs found from APIs.');
    console.log('Checking page HTML for any note references...');
    const html = await page.content();
    const htmlIds = [...new Set(
      [...html.matchAll(/[a-f0-9]{24}/g)].map(m => m[0])
        .filter(id => (id.startsWith('6') && !id.startsWith('600')) || id.startsWith('5'))
    )];
    console.log(`Filtered hex IDs: ${htmlIds.length}`);
    if (htmlIds.length > 0) {
      htmlIds.slice(0, 20).forEach(id => console.log(`  ${id}`));
    }
  }

  await browser.close();
})();
