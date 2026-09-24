/* ============================================================
 * 黑川物流 · Obsidian Publish 自定义脚本
 *
 * 「催更」按钮：
 *   1. 点击时向 Google Analytics 发送自定义事件 cuigeng_click
 *      （优先复用 Obsidian Publish 系统级 GA；没有则按需懒加载
 *       gtag.js，ID 见 __正在编辑/__备份文件/Google Analytics.md）
 *   2. 累计点击次数由 Abacus 计数服务保存
 *      （无需登录，管理密钥见 __正在编辑/__备份文件/催更计数器.md）
 *      - 页面出现按钮时读取当前次数并显示「已有 N 人催更」
 *      - 点击时 +1 并立即刷新显示
 *      - 计数服务挂掉时静默隐藏数字，不影响 GA 上报
 * ============================================================ */

/* ---------- 站点语言声明 ----------
 * Obsidian Publish 固定输出 <html lang="en">，且没有官方设置项。
 * 这里在 publish.js 加载时改为中文，让浏览器翻译提示、
 * 读屏软件和搜索引擎正确识别站点语言。 */
document.documentElement.lang = 'zh-CN';

(function () {
  var GA_ID = 'G-39LLSCKKW6';
  var COUNTER_URL =
    'https://abacus.jasoncameron.dev/{op}/kurokawa-logistics/cuigeng-homepage';

  /* ---------- Google Analytics ---------- */

  var gtagLoading = false;

  function ensureGtag(callback) {
    // 情况 1：Obsidian Publish 内置 GA 已经就位
    if (typeof window.gtag === 'function') {
      callback(true);
      return;
    }
    // 情况 2：页面上没有 gtag，懒加载官方脚本
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    if (gtagLoading) {
      var timer = setInterval(function () {
        if (window.__cuigengGtagReady) {
          clearInterval(timer);
          callback(true);
        }
      }, 100);
      setTimeout(function () { clearInterval(timer); }, 5000);
      return;
    }
    gtagLoading = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    s.onload = function () {
      window.gtag('js', new Date());
      window.gtag('config', GA_ID);
      window.__cuigengGtagReady = true;
      callback(true);
    };
    s.onerror = function () { callback(false); };
    document.head.appendChild(s);
  }

  /* ---------- 计数显示 ---------- */

  function setCountDisplays(n) {
    var els = document.querySelectorAll('[data-cuigeng-count]');
    for (var i = 0; i < els.length; i++) {
      var num = els[i].querySelector('[data-cuigeng-num]');
      if (num) num.textContent = String(n);
      els[i].hidden = false;
    }
  }

  function fetchCount(increment, callback) {
    var url = COUNTER_URL.replace('{op}', increment ? 'hit' : 'get');
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        callback(typeof d.value === 'number' ? d.value : null);
      })
      .catch(function () { callback(null); });
  }

  /* Obsidian Publish 是前端渲染，首页内容可能稍后插入 DOM，
   * 轮询等待计数元素出现后读取一次当前值。 */
  var countPolled = false;
  setInterval(function () {
    if (countPolled) return;
    if (!document.querySelector('[data-cuigeng-count]')) return;
    countPolled = true;
    fetchCount(false, function (n) {
      if (n !== null) setCountDisplays(n);
    });
  }, 1000);

  /* ---------- 点击处理 ---------- */

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest
      ? e.target.closest('[data-cuigeng]')
      : null;
    if (!btn) return;

    // 1) GA 事件
    ensureGtag(function (ok) {
      if (ok && typeof window.gtag === 'function') {
        window.gtag('event', 'cuigeng_click', {
          event_category: 'engagement',
          event_label: 'homepage_welcome',
          page_title: document.title,
          page_location: window.location.href
        });
      }
    });

    // 2) 计数 +1 并刷新显示
    fetchCount(true, function (n) {
      if (n !== null) setCountDisplays(n);
    });

    // 3) 按钮反馈动画（3 秒后恢复）
    if (!btn.dataset.cuigengDone) {
      btn.dataset.cuigengDone = '1';
      var original = btn.innerHTML;
      btn.classList.add('cuigeng-btn--done');
      btn.innerHTML = '✅ 已收到催更！';
      setTimeout(function () {
        btn.innerHTML = original;
        btn.classList.remove('cuigeng-btn--done');
        delete btn.dataset.cuigengDone;
      }, 3000);
    }
  });
})();
