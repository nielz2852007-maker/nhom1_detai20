/* ==========================================================
   appointments.js - Trang lịch hẹn: thống kê, lọc, hủy lịch.
   Dùng filter()/map()/reduce(), event delegation và localStorage.
   ========================================================== */

(function (global) {
  'use strict';

  var NS = global.MentorConnect;
  if (!NS || !NS.data || !NS.utils) return;

  var data = NS.data;
  var utils = NS.utils;

  var STATUS_LABELS = Object.freeze({
    confirmed: 'Đã xác nhận',
    pending: 'Chờ xác nhận',
    cancelled: 'Đã hủy'
  });

  function init() {
    var list = document.getElementById('appointment-list');
    var count = document.getElementById('appointment-count');
    if (!list || !count) return;

    var filterMode = 'all';

    /* Thanh lọc được tạo bằng DOM để giữ HTML gốc gọn gàng. */
    var toolbar = document.createElement('div');
    toolbar.className = 'appointment-toolbar';
    toolbar.innerHTML = [
      { key: 'all', label: 'Tất cả' },
      { key: 'upcoming', label: 'Sắp tới' },
      { key: 'cancelled', label: 'Đã hủy' }
    ].map(function (item) {
      return '<button type="button" class="filter-btn' +
        (item.key === filterMode ? ' active' : '') +
        '" data-filter="' + item.key + '">' + item.label + '</button>';
    }).join('');
    list.parentNode.insertBefore(toolbar, list);

    function mentorOf(mentorId) {
      return data.mentors.find(function (item) { return item.id === mentorId; }) ||
        { initials: 'MC' };
    }

    function statusClass(status) {
      if (status === 'cancelled') return 'status cancelled';
      if (status === 'pending') return 'status pending';
      return 'status';
    }

    function cardTemplate(appointment, index) {
      var label = STATUS_LABELS[appointment.status] || appointment.status;
      var cancellable = appointment.status !== 'cancelled';

      return '<article class="appointment-card' +
        (cancellable ? '' : ' is-cancelled') + '" data-aos="fade-up" data-aos-delay="' +
        Math.min(index || 0, 5) * 80 + '">' +
        utils.avatarHTML(mentorOf(appointment.mentorId)) +
        '<div class="appointment-info">' +
          '<h2>' + utils.escapeHtml(appointment.mentorName) + '</h2>' +
          '<div class="appointment-meta">' +
            '<span>🕒 ' + utils.escapeHtml(utils.formatDateTime(appointment.start)) + '</span>' +
            '<span>⏱ ' + Number(appointment.durationHours).toFixed(1) + ' giờ</span>' +
            '<span>💰 ' + utils.escapeHtml(utils.formatCurrency(appointment.tuition)) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="appointment-actions">' +
          '<span class="' + statusClass(appointment.status) + '">' +
            utils.escapeHtml(label) + '</span>' +
          (cancellable
            ? '<button type="button" class="btn btn-danger" data-cancel-id="' +
                utils.escapeHtml(appointment.id) + '">Hủy lịch</button>'
            : '') +
        '</div>' +
      '</article>';
    }

    function render() {
      var all = utils.getAppointments();
      var now = Date.now();
      var upcoming = all.filter(function (item) {
        return item.status !== 'cancelled' && new Date(item.start).getTime() >= now;
      });
      var totalTuition = upcoming.reduce(function (sum, item) {
        return sum + (Number(item.tuition) || 0);
      }, 0);

      count.textContent = 'Tổng ' + all.length + ' lịch hẹn · ' + upcoming.length +
        ' sắp tới · Học phí dự kiến ' + utils.formatCurrency(totalTuition);

      var visible = all.filter(function (item) {
        if (filterMode === 'upcoming') {
          return item.status !== 'cancelled' && new Date(item.start).getTime() >= now;
        }
        if (filterMode === 'cancelled') return item.status === 'cancelled';
        return true;
      }).sort(function (a, b) {
        return new Date(a.start) - new Date(b.start);
      });

      list.innerHTML = visible.map(cardTemplate).join('') ||
        '<div class="empty-state">Không có lịch hẹn nào trong mục này.</div>';

      Array.prototype.forEach.call(toolbar.querySelectorAll('[data-filter]'), function (button) {
        button.classList.toggle('active', button.getAttribute('data-filter') === filterMode);
      });

      if (NS.effects) NS.effects.refresh();
    }

    utils.delegate(toolbar, 'click', '[data-filter]', function (event, button) {
      filterMode = button.getAttribute('data-filter');
      render();
    });

    utils.delegate(list, 'click', '[data-cancel-id]', function (event, button) {
      var id = button.getAttribute('data-cancel-id');
      var appointment = utils.getAppointments().find(function (item) { return item.id === id; });
      if (!appointment) return;

      utils.confirmDialog(
        'Hủy lịch hẹn với ' + appointment.mentorName + ' vào ' +
        utils.formatDateTime(appointment.start) + '?',
        { title: 'Hủy lịch hẹn', okText: 'Hủy lịch', cancelText: 'Giữ lại' }
      ).then(function (confirmed) {
        if (!confirmed) return;
        var next = utils.getAppointments().map(function (item) {
          return item.id === id
            ? Object.assign({}, item, { status: 'cancelled' })
            : item;
        });
        utils.saveAppointments(next);
        utils.toast('Đã hủy lịch hẹn.');
        render();
      });
    });

    render();
  }

  utils.ready(init);
})(window);
