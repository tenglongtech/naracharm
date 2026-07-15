import { chromium } from 'playwright';
import { writeFileSync, readFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  // Inject the XHS-Downloader userscript
  const userscript = readFileSync('/Users/matt/dev/首饰跨境电商/video/XHS-Downloader/static/XHS-Downloader.js', 'utf-8');
  await page.addInitScript(userscript);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  // Patch GM API for userscript
  await page.addInitScript(() => {
    window.GM_getValue = (k, d) => d;
    window.GM_setValue = () => {};
    window.unsafeWindow = window;
    window.GM_setClipboard = (t) => {
      window.__xhsClipboard = t;
    };
    window.GM_registerMenuCommand = () => {};
    window.GM_unregisterMenuCommand = () => {};
  });

  const allNotes = new Set();

  // Intercept clipboard writes from the userscript
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('explore') || text.includes('discovery/item')) {
      const urls = text.match(/https:\/\/www\.xiaohongshu\.com\S+/g);
      if (urls) urls.forEach(u => allNotes.add(u));
    }
    if (text.includes('笔记') || text.includes('链接')) {
      console.log('[页]', text);
    }
  });

  // Capture the GM_setClipboard output
  await page.exposeFunction('__captureClipboard', (text) => {
    if (text && text.includes('xiaohongshu.com')) {
      const urls = text.match(/https:\/\/www\.xiaohongshu\.com\S+/g);
      if (urls) urls.forEach(u => allNotes.add(u));
    }
  });
  await page.addInitScript(() => {
    window.GM_setClipboard = (t) => {
      window.__captureClipboard(t);
    };
  });

  // Navigate to profile
  console.log('Loading profile page with userscript injected...');
  await page.goto('https://www.xiaohongshu.com/user/profile/66ec01d00000000009019c22', {
    waitUntil: 'domcontentloaded', timeout: 20000
  });
  await page.waitForTimeout(8000);

  console.log(`Title: ${await page.title()}`);
  console.log(`URL: ${page.url()}`);

  if (!page.url().includes('login')) {
    console.log('✅ Profile loaded!');

    // Check what the userscript added
    const uiInfo = await page.evaluate(() => {
      // Look for XHS-Downloader UI elements
      const xhsElements = [];
      document.querySelectorAll('*').forEach(el => {
        if (el.className && typeof el.className === 'string' && el.className.includes('XHS')) {
          xhsElements.push(el.className);
        }
        if (el.id && el.id.includes('XHS')) {
          xhsElements.push(el.id);
        }
        if (el.textContent && el.textContent.includes('XHS-Downloader')) {
          xhsElements.push(el.textContent.trim().slice(0, 60));
        }
      });
      return xhsElements;
    });

    if (uiInfo.length > 0) {
      console.log('Userscript UI elements found:', uiInfo);
    } else {
      console.log('No userscript UI found - trying manual extraction');
    }

    // Try clicking the userscript's "提取链接" button if it exists
    const btnClicked = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button, a, div[role="button"]')];
      const extractBtn = btns.find(b =>
        b.textContent.includes('提取') || b.textContent.includes('链接')
      );
      if (extractBtn) {
        extractBtn.click();
        return extractBtn.textContent;
      }
      return null;
    });
    if (btnClicked) console.log(`Clicked: ${btnClicked}`);

    // Wait for the userscript to process
    await page.waitForTimeout(3000);

    // Collect ALL note URLs from the page
    const noteData = await page.evaluate(() => {
      const items = [];

      // Get all note links from the entire document
      document.querySelectorAll('a[href*="explore/"]').forEach(a => {
        const m = a.href.match(/explore\/([a-f0-9]{24})/);
        if (m) {
          // Try to get the note title
          const img = a.querySelector('img');
          const title = img?.alt || a.querySelector('[class*="title"]')?.textContent || '';
          items.push({ id: m[1], title: title, url: `https://www.xiaohongshu.com/discovery/item/${m[1]}` });
        }
      });

      return items;
    });

    noteData.forEach(n => allNotes.add(n.url));

    if (noteData.length === 0) {
      // Try scrolling to load notes
      console.log('Scrolling to load notes...');
      for (let i = 0; i < 20; i++) {
        const prevCount = allNotes.size;
        await page.evaluate(() => window.scrollBy(0, 600));
        await page.waitForTimeout(1000);

        const newNotes = await page.evaluate(() => {
          const items = [];
          document.querySelectorAll('a[href*="explore/"]').forEach(a => {
            const m = a.href.match(/explore\/([a-f0-9]{24})/);
            if (m) {
              const noteUrl = `https://www.xiaohongshu.com/discovery/item/${m[1]}`;
              if (!items.includes(noteUrl)) items.push(noteUrl);
            }
          });
          return items;
        });
        newNotes.forEach(u => allNotes.add(u));

        if (allNotes.size > prevCount) {
          console.log(`  Scroll ${i+1}: ${allNotes.size} total`);
        } else if (i > 5) {
          console.log(`  Scroll ${i+1}: no new notes, stopping`);
          break;
        }
      }
    }

    // Also try to extract from the XHS userscript clipboard output
    const clipOutput = await page.evaluate(() => window.__xhsClipboard || '');
    if (clipOutput) {
      const urls = clipOutput.match(/https:\/\/www\.xiaohongshu\.com\S+/g);
      if (urls) urls.forEach(u => allNotes.add(u));
      console.log(`Userscript output: ${urls?.length || 0} URLs`);
    }

  } else {
    console.log('❌ Redirected to login');
  }

  // Check the GM_setClipboard
  const clipboardData = await page.evaluate(() => window.__xhsClipboard || '');
  if (clipboardData) console.log('\nClipboard data:', clipboardData.slice(0, 1000));

  // Output
  console.log(`\n═══════════════════════════════════════`);
  console.log(`TOTAL GRACE STUDIO NOTES: ${allNotes.size}`);
  console.log(`═══════════════════════════════════════`);

  if (allNotes.size > 0) {
    const urls = Array.from(allNotes);
    urls.forEach((u, i) => console.log(`${i+1}. ${u}`));
    writeFileSync('/tmp/grace_all_notes.txt', urls.join('\n'));
    console.log(`\n✅ Saved to /tmp/grace_all_notes.txt`);
  } else {
    console.log('Still no notes found. The page loads notes via JS API.');
    console.log('\nTrying final approach: call the API directly with proper cookies...');
  }

  // Save cookies for XHS-Downloader
  const cookies = await context.cookies();
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  writeFileSync('/tmp/xhs_cookies_final.txt', cookieStr);

  await browser.close();
})();
