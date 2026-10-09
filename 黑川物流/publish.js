/* ========================================================================
 * 黑川物流 · Obsidian Publish 自定义脚本
 *
 * 功能目录
 *   01 · 站点语言：声明页面主要使用简体中文。
 *   02 · 浏览器配色：将笔记的 theme-color 属性转换为网页 meta 标签。
 *   03 · 催更按钮：点击统计、共享计数及按钮反馈。
 *   04 · KKN 语法高亮：已停用，历史代码保留备用。
 *
 * 外部服务（仅由 03 使用）
 *   Google Analytics：记录催更点击，通过 googletagmanager.com 加载统计脚本。
 *   Abacus / abacus.jasoncameron.dev：保存、读取累计催更点击次数。
 *   02 使用 Publish 已加载的笔记缓存，本身不发送网络请求。
 *
 * 发布方式：将本文件放在 Obsidian 仓库根目录，在「发布更改」中发布。
 * 自定义 JavaScript 需要绑定自定义域名；修改后刷新网页以加载新脚本。
 * ======================================================================== */


/* ========================================================================
 * 01 · 站点语言
 * ========================================================================
 * Publish 默认输出 <html lang="en">。改为 zh-CN，让翻译提示和
 * 读屏软件识别页面主要语言；这不会翻译页面正文。
 * ======================================================================== */
document.documentElement.lang = 'zh-CN';


/* ========================================================================
 * 02 · 浏览器配色（theme-color）
 * ========================================================================
 * 用法：给笔记添加文本属性 theme-color，例如 "#2563EB"。
 * 流程：读取当前笔记属性 → 写入 <meta name="theme-color">。
 * 时机：首次加载以及 Publish 的 navigated（切换笔记）事件。
 *
 * Android Chrome 等支持的浏览器可据此调整地址栏等界面配色。
 * 桌面 Chrome 的普通标签页不会因此变色，安装的网页应用可以使用；
 * 最终效果取决于浏览器、版本和设置，脚本只提供颜色建议。
 *
 * 笔记缓存和导航事件属于 Publish 内部接口。升级后若接口不可用，
 * 本功能会在有限次数的尝试后停止连接。
 * ======================================================================== */
(function () {
  /* ---------- 配置与状态 ---------- */

  // 默认留空：未填写或填写无效时恢复原配色。可改成 '#2563EB'。
  var DEFAULT_COLOR = '';
  // 只保存本功能创建的 meta，便于恢复时保留网站原有标签。
  var themeMeta = null;
  var attempts = 0;

  /* ---------- 校验属性 ---------- */

  // 本功能只接受文本形式的 #RGB / #RRGGBB；首尾空格会被忽略。
  // 浏览器支持更多 CSS 颜色写法，这里主动限定格式以方便维护。
  function parseColor(value) {
    if (typeof value !== 'string') return '';
    var color = value.trim();
    return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(color) ? color : '';
  }

  /* ---------- 更新网页 meta ---------- */

  function applyColor(color) {
    if (!color) {
      // 当前笔记没有颜色时清除上一笔记的覆盖，恢复原有配色。
      if (themeMeta && themeMeta.parentNode) {
        themeMeta.parentNode.removeChild(themeMeta);
      }
      return;
    }
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
    }
    themeMeta.content = color;
    // 放在 head 最前面，优先于原有 theme-color；原标签仍保留。
    if (!themeMeta.parentNode) {
      document.head.insertBefore(themeMeta, document.head.firstChild);
    }
  }

  /* ---------- 接入 Publish 的笔记缓存与导航 ---------- */

  function connectPublish() {
    var publish = window.publish;
    var cache = publish && publish.site && publish.site.cache;
    if (!publish || !publish.render || !cache ||
        typeof cache.getCache !== 'function' || typeof publish.on !== 'function') {
      // 当前 Publish 会先加载缓存再执行本脚本；这是兼容性兜底。
      // 如果接口尚未准备好，每 200 毫秒重试，最多等待约 10 秒。
      if (++attempts < 50) setTimeout(connectPublish, 200);
      return;
    }

    function updateColor() {
      // 使用实际笔记路径读取属性，因此笔记设置 permalink 也能找到。
      var file = cache.getCache(publish.render.currentFilepath);
      var properties = file && file.frontmatter;
      var color = parseColor(properties && properties['theme-color']);
      applyColor(color || parseColor(DEFAULT_COLOR));
    }

    // 站内切换通常不会整页刷新，必须随导航更新，避免沿用上一页颜色。
    // 普通跳转、前进后退及滑动窗格切换均由 Publish 处理并通知。
    publish.on('navigated', updateColor);
    // 脚本加载时也立即同步一次，覆盖当前已经打开的笔记。
    updateColor();
  }

  connectPublish();
})();


/* ========================================================================
 * 03 · 催更按钮（Google Analytics + Abacus + 点击反馈）
 * ========================================================================
 * 页面元素约定：
 *   [data-cuigeng]       · 可点击的催更按钮。
 *   [data-cuigeng-count] · 显示累计次数的容器。
 *   [data-cuigeng-num]   · 容器内显示数字的元素。
 *
 * 点击后分别执行三件事：
 *   A. 向 Google Analytics 记录 cuigeng_click，含当前页面标题和地址。
 *   B. 请求 Abacus 将本站共享计数加 1，再更新页面上的数字。
 *   C. 按钮显示「已收到催更」，3 秒后恢复。
 *
 * 计数表示点击次数，不代表独立人数；反馈动画期间再次点击也会计数。
 * 两个网络请求分别处理失败，按钮反馈不等待它们返回。
 * ======================================================================== */
(function () {
  /* ---------- 配置 ---------- */

  // 复用现有 GA ID；备份说明见 __正在编辑/__备份文件/Google Analytics.md。
  var GA_ID = 'G-39LLSCKKW6';
  // Abacus 是独立计数服务，和 02 的 theme-color 功能没有关联。
  // {op} 替换为 get（只读）或 hit（加 1）；后两段标识本站的共享计数。
  var COUNTER_URL =
    'https://abacus.jasoncameron.dev/{op}/kurokawa-logistics/cuigeng-homepage';

  /* ---------- A · Google Analytics 点击统计 ---------- */

  var gtagLoading = false;

  function ensureGtag(callback) {
    // 已存在 gtag 时直接复用；它也可能是等待库加载的数据队列函数。
    if (typeof window.gtag === 'function') {
      callback(true);
      return;
    }
    // 没有 gtag 时，先建立事件队列；仅在第一次点击时加载官方脚本。
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

  /* ---------- B · Abacus 共享点击计数 ---------- */

  // 更新当前页面全部计数容器，包括同一内容的多个显示位置。
  function setCountDisplays(n) {
    var els = document.querySelectorAll('[data-cuigeng-count]');
    for (var i = 0; i < els.length; i++) {
      var num = els[i].querySelector('[data-cuigeng-num]');
      if (num) num.textContent = String(n);
      els[i].hidden = false;
    }
  }

  // increment=false 只读取，true 加 1；失败或无数字时返回 null。
  // 失败时调用方跳过数字更新，不会主动隐藏已经显示的数字。
  function fetchCount(increment, callback) {
    var url = COUNTER_URL.replace('{op}', increment ? 'hit' : 'get');
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        callback(typeof d.value === 'number' ? d.value : null);
      })
      .catch(function () { callback(null); });
  }

  // Publish 稍后才插入正文，每秒检查计数容器是否出现。
  // 本次整页生命周期内只读取一次；站内返回首页不会自动再次读取。
  var countPolled = false;
  setInterval(function () {
    if (countPolled) return;
    if (!document.querySelector('[data-cuigeng-count]')) return;
    countPolled = true;
    fetchCount(false, function (n) {
      if (n !== null) setCountDisplays(n);
    });
  }, 1000);

  /* ---------- C · 点击入口与按钮反馈 ---------- */

  // 在 document 上处理点击，让站内切换后新插入的按钮也能响应。
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest
      ? e.target.closest('[data-cuigeng]')
      : null;
    if (!btn) return;

    // A. 记录点击事件（不等待计数服务）。
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

    // B. 累计次数加 1，成功后显示返回的数字（包括 0）。
    fetchCount(true, function (n) {
      if (n !== null) setCountDisplays(n);
    });

    // C. 立即给出 3 秒反馈；期间不重复启动动画，但仍记录每次点击。
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

/* ========================================================================
 * 04 · KKN（胶兽语伪终端）语法高亮 · 已停用
 * ========================================================================
 * 下方代码全部保持注释，不会执行，也不影响前三项功能。
 *
 * 主题考量：黑川表面机械、内里人情 → 报文保持纯黑白更像人在说话；
 *          龙珀表面人情、内里条框 → 彩色 log 才有异化感（故 log 保留）。
 *
 * 恢复方式：仅去掉下方从 (function () { 到 })(); 代码行的行首 "// "。
 * 保留这一段说明注释；恢复后需要重新发布 publish.js 并验证效果。
 * ======================================================================== */
// 历史 KKN 高亮代码（含非 BMP 图标代理对修复）：
// (function () {
//   var VERB_ICON_ALT = '󰘳|󰲽|||||||||||||||';
//
//   function defineKkn() {
//     if (!window.Prism || !Prism.languages) return false;
//     if (Prism.languages.kkn) return true;
//
//     Prism.languages.kkn = {
//       'frame': {
//         pattern: /[⏇⏈]/,
//         alias: 'important'
//       },
//       'verb': {
//         pattern: new RegExp('(^|[\\n\\r])[ \\t　]*(' + VERB_ICON_ALT + ')(?=　)', 'm'),
//         lookbehind: true,
//         alias: 'keyword'
//       },
//       'separator': {
//         pattern: /%{3,}|-{3,}/m,
//         alias: 'comment'
//       },
//       'job': {
//         pattern: /＃\d{1,3}/,
//         alias: 'number'
//       },
//       'string': [
//         /"[^"\n]*"/,
//         /「[^」\n]*」/
//       ],
//       'property': {
//         pattern: /[^\s　：｜、，。！？%]+(?=：|:)/,
//         alias: 'property'
//       },
//       'arrow': {
//         pattern: /[→←↑↓]+/,
//         alias: 'operator'
//       },
//       'number': /\b\d+(?:\.\d+)?%?\b/
//     };
//     Prism.languages.KKN = Prism.languages.kkn;
//     return true;
//   }
//
//   function rehighlight() {
//     if (!window.Prism || !Prism.languages || !Prism.languages.kkn) return;
//     if (typeof Prism.highlightElement !== 'function') return;
//     var blocks = document.querySelectorAll('code');
//     for (var i = 0; i < blocks.length; i++) {
//       var el = blocks[i];
//       if (!/language-["']?kkn["']?/i.test(el.className)) continue;
//       el.textContent = el.textContent;
//       try { Prism.highlightElement(el); } catch (e) {}
//     }
//   }
//
//   var attempts = [0, 800, 2500, 6000];
//   for (var i = 0; i < attempts.length; i++) {
//     (function (delay) {
//       setTimeout(function () {
//         if (defineKkn()) rehighlight();
//       }, delay);
//     })(attempts[i]);
//   }
// })();
