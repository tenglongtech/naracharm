import { chromium } from 'playwright';
import { writeFile } from 'fs/promises';
import { createWriteStream } from 'fs';
import { get } from 'https';

const FULL_URL = 'https://www.xiaohongshu.com/discovery/item/67f6923a000000000901752b?app_platform=ios&app_version=9.37&share_from_user_hidden=true&xsec_source=app_share&type=video&xsec_token=CBEy6DDECxfS8Rg4PXL2kHHLEH-w3p7xMnx-noiKSqWuI=&author_share=1&xhsshare=CopyLink&shareRedId=N0lERjVHRkE2NzUyOTgwNjczOTg1RjpP&apptime=1783620013&share_id=857baeb7a84045c98008b19f6f32b708';
const OUTPUT_DIR = '/Users/matt/dev/首饰跨境电商/video/references/source';

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(outputPath);
    get(url, { headers: { Referer: 'https://www.xiaohongshu.com/' } }, (response) => {
      if (response.statusCode !== 200) {
        console.error(`  ⚠️  HTTP ${response.statusCode} for download`);
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    locale: 'zh-CN',
  });
  const page = await context.newPage();

  const videoUrls = new Set();

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('video') && url.includes('.mp4')) {
      videoUrls.add(url);
      console.log('🎬 MP4:', url);
    }
    if (url.includes('cdn') && (url.includes('mp4') || url.includes('m3u8'))) {
      videoUrls.add(url);
      console.log('📹 CDN:', url);
    }
    // Catch API responses
    if (url.includes('api/sns/web/v1/feed') || url.includes('api/sns/web/v2/note') || url.includes('api/sns/web/v1/media')) {
      try {
        const body = JSON.parse(await response.text());
        const raw = JSON.stringify(body);
        console.log(`📡 API ${url.slice(-40)}:`, raw.slice(0, 500));
        const mp4s = raw.match(/https?:[^"'\s,]+\.mp4[^"'\s,]*/g);
        if (mp4s) mp4s.forEach(u => videoUrls.add(u));
        const streams = raw.match(/https?:[^"'\s,]+stream[^"'\s,]*/g);
        if (streams) streams.forEach(u => videoUrls.add(u));
      } catch (e) {
        // response body might not be JSON
      }
    }
  });

  // Also intercept XHR requests that look like video media
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('xhscdn.com') || url.includes('sns-video')) {
      console.log('🔍 Request:', url.slice(0, 100));
    }
  });

  console.log('🌐 Loading page...');
  await page.goto(FULL_URL, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('✅ Page loaded (networkidle)');

  // Take a screenshot to see what's rendered
  await page.screenshot({ path: '/Users/matt/dev/首饰跨境电商/video/references/source/page_state.png' });
  console.log('📸 Screenshot saved');

  // Wait more for dynamic content
  await page.waitForTimeout(3000);

  // Try to extract video from page JS
  const extracted = await page.evaluate(() => {
    const results = {};
    // Check all video elements
    const videos = [...document.querySelectorAll('video')];
    results.videoElements = videos.map(v => ({
      src: v.src || v.currentSrc,
      poster: v.poster,
    }));

    // Try to find window state
    if (window.__INITIAL_STATE__) {
      results.initialState = JSON.stringify(window.__INITIAL_STATE__).slice(0, 2000);
    }

    // Check all script contents for video URLs
    const scripts = [...document.scripts];
    results.scriptsWithVideo = scripts
      .filter(s => s.textContent && s.textContent.includes('.mp4'))
      .map(s => s.textContent.slice(0, 500));

    return results;
  });

  console.log('\n=== Extracted from page ===');
  if (extracted.videoElements?.length) {
    console.log('Video elements:', JSON.stringify(extracted.videoElements, null, 2));
  }
  if (extracted.initialState) {
    console.log('Initial state:', extracted.initialState);
  }

  // Try to click a play button or video container
  try {
    const videoEl = await page.$('video');
    if (videoEl) {
      console.log('🎬 Found video element on page!');
      const src = await videoEl.getAttribute('src');
      if (src) videoUrls.add(src);
    }
  } catch(e) {}

  console.log('\n=== All Video URLs Found ===');
  console.log(Array.from(videoUrls));

  // Download first found URL
  if (videoUrls.size > 0) {
    const urls = Array.from(videoUrls);
    const outputPath = `${OUTPUT_DIR}/xhs_67f6923a.mp4`;
    console.log(`\n⬇️  Downloading to ${outputPath}...`);
    await downloadFile(urls[0], outputPath);
    console.log(`✅ Saved: ${outputPath}`);
  } else {
    console.log('\n❌ No video URLs found. The page might require login.');
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());
  }

  await browser.close();
  console.log('\n✅ Done');
})();
