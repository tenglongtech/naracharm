// ================== 格蕾丝Grace Studio 笔记提取脚本 ==================
// 使用方法:
// 1. 在浏览器打开 https://www.xiaohongshu.com/user/profile/66ec01d00000000009019c22
// 2. 滚动页面加载所有视频（多滚几次）
// 3. 按 F12 打开开发者工具 → Console
// 4. 粘贴以下代码，按回车运行
// 5. 复制的笔记链接发给我，我来批量下载
// =================================================================

(function() {
    // 获取页面上所有笔记链接
    const noteLinks = new Set();

    // 方法1: 从 a 标签提取
    document.querySelectorAll('a[href*="explore/"], a[href*="discovery/item"]').forEach(a => {
        const m = a.href.match(/explore\/([a-f0-9]{24})/) || a.href.match(/discovery\/item\/([a-f0-9]{24})/);
        if (m) {
            noteLinks.add(`https://www.xiaohongshu.com/discovery/item/${m[1]}`);
        }
    });

    // 方法2: 从 section 元素提取
    document.querySelectorAll('section, div[class*="note"], div[class*="card"]').forEach(el => {
        const html = el.outerHTML;
        const m = html.match(/explore\/([a-f0-9]{24})/);
        if (m) {
            noteLinks.add(`https://www.xiaohongshu.com/discovery/item/${m[1]}`);
        }
    });

    // 方法3: 从图片 alt 属性提取（小红书经常把标题放img alt里）
    document.querySelectorAll('img[alt*="手串"], img[alt*="水晶"], img[alt*="紫"]').forEach(img => {
        const parentHtml = img.closest('a, section, div')?.outerHTML || '';
        const m = parentHtml.match(/explore\/([a-f0-9]{24})/);
        if (m) {
            noteLinks.add(`https://www.xiaohongshu.com/discovery/item/${m[1]}`);
        }
    });

    const result = Array.from(noteLinks);
    console.log(`找到 ${result.length} 个笔记链接:\n`);
    result.forEach((url, i) => console.log(`${i+1}. ${url}`));
    console.log(`\n--- 复制以下内容发给我 ---`);
    console.log(result.join('\n'));
    return result;
})();
