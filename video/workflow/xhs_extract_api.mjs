import { chromium } from 'playwright';
import { createWriteStream } from 'fs';
import { get } from 'https';

const FULL_URL = 'https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b?app_platform=ios&app_version=9.37&share_from_user_hidden=true&xsec_source=app_share&type=video&xsec_token=CBEy6DDECxfS8Rg4PXL2kHHLEH-w3p7xMnx-noiKSqWuI=&author_share=1&xhsshare=CopyLink&shareRedId=N0lERjVHRkE2NzUyOTgwNjczOTg1RjpP&apptime=1783620013&share_id=857baeb7a84045c98008b19f6f32b708';
const OUTPUT_DIR = '/Users/matt/dev/首饰跨境电商/video/references/source';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    locale: 'zh-CN',
  });
  const page = await context.newPage();

  // Capture ALL API responses
  const apiResponses = [];

  page.on('response', async (response) => {
    const url = response.url();
    // Watch for the note detail / feed APIs
    if (url.includes('api/sns/web/v1/feed') ||
        url.includes('api/sns/web/v2/note') ||
        url.includes('api/sns/web/v1/media') ||
        url.includes('api/sns/web/v2/feed') ||
        url.includes('api/sns/web/v1/note')) {
      try {
        const body = await response.text();
        apiResponses.push({ url: url.slice(-60), body: body.slice(0, 8000) });
      } catch(e) {}
    }
    // Also watch for video CDN URLs
    if (url.includes('.mp4')) {
      apiResponses.push({ url: url.slice(-80), body: 'MP4_URL' });
    }
  });

  console.log('🌐 Loading page...');
  await page.goto(FULL_URL, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('✅ Page loaded, waiting for video data...');
  await page.waitForTimeout(3000);

  // Dump all intercepted API responses
  console.log('\n═══════════════════════════════════════════');
  console.log('ALL INTERCEPTED API RESPONSES:');
  console.log('═══════════════════════════════════════════');
  for (const resp of apiResponses) {
    console.log(`\n--- ${resp.url} ---`);
    console.log(resp.body);
  }

  // Also try to evaluate page state for video URLs
  const pageData = await page.evaluate(() => {
    // Look for video-related data in window
    const results = {};
    if (window.__INITIAL_STATE__) results.initialState = window.__INITIAL_STATE__;
    if (window.__NEXT_DATA__) results.nextData = window.__NEXT_DATA__;
    if (window.__NUXT__) results.nuxt = window.__NUXT__;
    // Check all script contents for masterUrl or video info
    const scripts = [...document.querySelectorAll('script')];
    const videoScripts = scripts
      .filter(s => s.textContent &&
        (s.textContent.includes('masterUrl') ||
         s.textContent.includes('videoUrl') ||
         s.textContent.includes('原始视频') ||
         s.textContent.includes('watermark')))
      .map(s => ({ id: s.id, type: s.type, text: s.textContent.slice(0, 3000) }));
    results.videoScripts = videoScripts;
    return results;
  });

  console.log('\n═══════════════════════════════════════════');
  console.log('PAGE DATA:');
  console.log(JSON.stringify(pageData, null, 2).slice(0, 5000));

  await browser.close();
  console.log('\n✅ Done');
})();
