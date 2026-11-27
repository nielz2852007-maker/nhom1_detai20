/* ==========================================================
   common.js - Tiện ích dùng chung: logic GPA/học phí, storage,
               DOM helpers, event delegation, toast, dialog.
   Không render nội dung trang cụ thể (việc của main/profile/appointments).
   ========================================================== */

(function (global) {
  'use strict';

  var NS = (global.MentorConnect = global.MentorConnect || {});
  var data = NS.data || { GRADE_POINTS: {}, storageKeys: {} };

  var HTML_ESCAPE = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  };

  /* ------------------ Logic nghiệp vụ ------------------ */

  /**
   * Chuyển điểm sang thang 4.0.
   * @param {string|number} grade "A", "b+", 3.3 ...
   * @returns {number|null} điểm hợp lệ hoặc null nếu không hợp lệ.
   */
  function toGradePoint(grade) {
    if (typeof grade === 'number') {
      return Number.isFinite(grade) ? Math.min(4, Math.max(0, grade)) : null;
    }
    var key = String(grade === null || grade === undefined ? '' : grade).trim().toUpperCase();
    var point = data.GRADE_POINTS[key];
    return typeof point === 'number' ? point : null;
  }

  /**
   * GPA = (tổng tín chỉ * điểm) / tổng tín chỉ.
   * Bỏ qua môn thiếu tín chỉ / điểm không hợp lệ; làm tròn 2 chữ số.
   */
  function calculateGPA(courses) {
    if (!Array.isArray(courses)) return 0;

    var valid = courses
      .map(function (course) {
        return {
          credits: Number(course && course.credits),
          point: toGradePoint(course && course.grade)
        };
      })
      .filter(function (item) {
        return Number.isFinite(item.credits) && item.credits > 0 && item.point !== null;
      });

    var totals = valid.reduce(function (acc, item) {
      acc.credits += item.credits;
      acc.points += item.credits * item.point;
      return acc;
    }, { credits: 0, points: 0 });

    if (totals.credits === 0) return 0;
    return Math.round((totals.points / totals.credits) * 100) / 100;
  }

  /**
   * Học phí = giờ * đơn giá * (1 - giảm giá%) + phí nền tảng.
   * Giảm giá bị kẹp trong [0, 100]; kết quả làm tròn đến VND.
   */
  function calculateTuition(options) {
    var opts = options || {};
    var hours = Math.max(0, Number(opts.hours) || 0);
    var rate = Math.max(0, Number(opts.hourlyRate) || 0);
    var discount = Math.min(100, Math.max(0, Number(opts.discountPercent) || 0));
    var fee = Math.max(0, Number(opts.platformFee) || 0);
    return Math.round(hours * rate * (1 - discount / 100) + fee);
  }

  /* ------------------ Format & DOM ------------------ */

  function escapeHtml(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/[&<>"']/g, function (ch) { return HTML_ESCAPE[ch]; });
  }

  /** Avatar dùng ảnh khi có, nếu không thì fallback về chữ cái tên. */
  function avatarHTML(person, extraClass) {
    var personData = person || {};
    var className = 'avatar' + (extraClass ? ' ' + extraClass : '');
    if (!personData.avatar) {
      return '<div class="' + className + '">' +
        escapeHtml(personData.initials || 'MC') + '</div>';
    }
    var label = personData.name ? 'Ảnh của ' + personData.name : 'Ảnh đại diện';
    return '<div class="' + className + '">' +
      '<img src="' + escapeHtml(personData.avatar) + '" alt="' + escapeHtml(label) +
      '" loading="lazy" width="56" height="56">' +
      '</div>';
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency', currency: 'VND', maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function formatDateTime(iso) {
    var date = new Date(iso);
    if (isNaN(date.getTime())) return String(iso || '');
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  }

  function formatDate(iso) {
    var date = new Date(iso);
    if (isNaN(date.getTime())) return String(iso || '');
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(date);
  }

  function getQueryParam(name) {
    return new URLSearchParams(global.location.search).get(name);
  }

  function debounce(fn, delay) {
    var timer = null;
    var wait = Number(delay) || 200;
    return function () {
      var context = this;
      var args = arguments;
      global.clearTimeout(timer);
      timer = global.setTimeout(function () { fn.apply(context, args); }, wait);
    };
  }

  /** Event delegation: xử lý sự kiện cho phần tử được thêm sau khi render. */
  function delegate(root, type, selector, handler) {
    if (!root) return;
    root.addEventListener(type, function (event) {
      var target = event.target && event.target.closest
        ? event.target.closest(selector)
        : null;
      if (target && root.contains(target)) handler(event, target);
    });
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  /* ------------------ LocalStorage an toàn ------------------ */

  var storage = {
    read: function (key, fallback) {
      try {
        var raw = global.localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (error) {
        return fallback;
      }
    },
    write: function (key, value) {
      try {
        global.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        return false;
      }
    }
  };

  function getAppointments() {
    var saved = storage.read(data.storageKeys.appointments, null);
    if (Array.isArray(saved)) return saved;
    var seed = (data.seedAppointments || []).slice();
    storage.write(data.storageKeys.appointments, seed);
    return seed;
  }

  function saveAppointments(list) {
    return storage.write(data.storageKeys.appointments, Array.isArray(list) ? list : []);
  }

  function addAppointment(appointment) {
    if (!appointment || !appointment.id) return getAppointments();
    var next = getAppointments()
      .filter(function (item) { return item.id !== appointment.id; })
      .concat(appointment);
    saveAppointments(next);
    return next;
  }

  function removeAppointment(id) {
    var next = getAppointments().filter(function (item) { return item.id !== id; });
    saveAppointments(next);
    return next;
  }

  function isSlotBooked(slotId) {
    return getAppointments().some(function (item) {
      return item.slotId === slotId && item.status !== 'cancelled';
    });
  }

  /* ------------------ Thông báo & hộp thoại ------------------ */

  function toast(message, type) {
    var root = document.getElementById('mc-toast-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'mc-toast-root';
      root.className = 'mc-toast-root';
      document.body.appendChild(root);
    }
    var item = document.createElement('div');
    item.className = 'mc-toast ' + (type === 'error' ? 'mc-toast-error' : 'mc-toast-success');
    item.textContent = message;
    root.appendChild(item);
    global.setTimeout(function () {
      item.classList.add('mc-toast-out');
      global.setTimeout(function () { item.remove(); }, 250);
    }, 3000);
  }

  function confirmDialog(message, options) {
    var opts = options || {};
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'modal mc-confirm';
      overlay.innerHTML =
        '<div class="modal-box card">' +
          '<h2>' + escapeHtml(opts.title || 'Xác nhận') + '</h2>' +
          '<p class="mc-confirm-message"></p>' +
          '<div class="modal-actions">' +
            '<button type="button" class="btn btn-danger" data-action="cancel">' +
              escapeHtml(opts.cancelText || 'Hủy') +
            '</button>' +
            '<button type="button" class="btn btn-primary" data-action="ok">' +
              escapeHtml(opts.okText || 'Xác nhận') +
            '</button>' +
          '</div>' +
        '</div>';
      overlay.querySelector('.mc-confirm-message').textContent = message || '';

      function close(result) {
        document.removeEventListener('keydown', onKey);
        overlay.remove();
        resolve(result);
      }
      function onKey(event) {
        if (event.key === 'Escape') close(false);
      }

      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
          close(false);
          return;
        }
        var button = event.target.closest('[data-action]');
        if (!button) return;
        close(button.getAttribute('data-action') === 'ok');
      });
      document.addEventListener('keydown', onKey);
      document.body.appendChild(overlay);
    });
  }

  /* ------------------ Shell chung cho mọi trang ------------------ */

  function initShell() {
    var toggle = document.getElementById('menu-toggle');
    var nav = document.getElementById('nav');

    if (toggle && nav) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.addEventListener('click', function () {
        var isOpen = nav.classList.toggle('active');
        toggle.setAttribute('aria-expanded', String(isOpen));
      });
      document.addEventListener('click', function (event) {
        if (nav.contains(event.target) || toggle.contains(event.target)) return;
        nav.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    }

    var currentPage = global.location.pathname.split('/').pop() || 'index.html';
    Array.prototype.forEach.call(document.querySelectorAll('.nav a'), function (link) {
      if (link.getAttribute('href') === currentPage) link.classList.add('active');
    });
  }

  ready(initShell);

  NS.utils = Object.freeze({
    toGradePoint: toGradePoint,
    calculateGPA: calculateGPA,
    calculateTuition: calculateTuition,
    escapeHtml: escapeHtml,
    avatarHTML: avatarHTML,
    formatCurrency: formatCurrency,
    formatDateTime: formatDateTime,
    formatDate: formatDate,
    getQueryParam: getQueryParam,
    debounce: debounce,
    delegate: delegate,
    ready: ready,
    storage: storage,
    getAppointments: getAppointments,
    saveAppointments: saveAppointments,
    addAppointment: addAppointment,
    removeAppointment: removeAppointment,
    isSlotBooked: isSlotBooked,
    toast: toast,
    confirmDialog: confirmDialog
  });
})(window);
