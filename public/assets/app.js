// 語言切換。狀態存在 localStorage，跨頁面保持一致。
(function () {
  var KEY = 'notes-lang';

  function apply(lang) {
    var el = document.documentElement;
    el.dataset.lang = lang;
    el.lang = lang === 'zh' ? 'zh-Hant' : 'en';
    try { localStorage.setItem(KEY, lang); } catch (e) {}

    // 標題也跟著換（在 <body> 上放 data-title-zh / data-title-en）
    var t = document.body && document.body.dataset['title' + (lang === 'zh' ? 'Zh' : 'En')];
    if (t) document.title = t;

    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.langBtn === lang));
    });
  }

  // 初始語言：上次選的 > 瀏覽器偏好 > 中文
  function initial() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === 'zh' || saved === 'en') return saved;
    } catch (e) {}
    return (navigator.language || '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lang-btn]');
    if (b) apply(b.dataset.langBtn);
  });

  document.addEventListener('DOMContentLoaded', function () { apply(initial()); });
  window.__setLang = apply;
})();
