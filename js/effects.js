/* ==========================================================
   effects.js - Cấu hình AOS (Animate On Scroll) cho toàn trang.
   Thư viện nằm ở vendor/aos, chạy được cả khi không có mạng.
   ========================================================== */

(function (global) {
  'use strict';

  var NS = global.MentorConnect || (global.MentorConnect = {});
  var AOS = global.AOS;
  var initialized = false;

  /** Fallback: nếu thư viện không nạp được thì vẫn hiện đủ nội dung. */
  function revealAll() {
    var nodes = document.querySelectorAll('[data-aos]');
    Array.prototype.forEach.call(nodes, function (node) {
      node.classList.add('aos-animate');
    });
  }

  function init() {
    if (!AOS || typeof AOS.init !== 'function') {
      revealAll();
      return;
    }

    var reduceMotion = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      AOS.init({ disable: true, once: true });
      revealAll();
      return;
    }

    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 70,
      delay: 0
    });
    initialized = true;
  }

  /** Gọi lại sau mỗi lần JS render để thẻ mới cũng có hiệu ứng. */
  function refresh() {
    if (!initialized || !AOS || typeof AOS.refreshHard !== 'function') return;
    AOS.refreshHard();
  }

  NS.effects = {
    init: init,
    refresh: refresh
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window);
