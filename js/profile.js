/* ==========================================================
   profile.js - Trang hồ sơ cố vấn: render thông tin, lịch rảnh,
                 đánh giá; chọn slot và xác nhận đặt lịch.
   ========================================================== */

(function (global) {
  'use strict';

  var NS = global.MentorConnect;
  if (!NS || !NS.data || !NS.utils) return;

  var data = NS.data;
  var utils = NS.utils;
  var mentors = data.mentors;

  function init() {
    var root = document.getElementById('profile-root');
    if (!root) return;

    var requestedId = utils.getQueryParam('id') ||
      utils.storage.read(data.storageKeys.selectedMentor, '');
    var mentor = mentors.find(function (item) { return item.id === requestedId; }) || mentors[0];

    var avatar = document.getElementById('mentor-avatar');
    var name = document.getElementById('mentor-name');
    var rating = document.getElementById('mentor-rating');
    var bio = document.getElementById('mentor-bio');
    var skills = document.getElementById('mentor-skills');
    var slotList = document.getElementById('slot-list');
    var reviewList = document.getElementById('review-list');
    var bookBtn = document.getElementById('book-btn');
    var modal = document.getElementById('confirm-modal');
    var confirmText = document.getElementById('confirm-text');
    var cancelBtn = document.getElementById('cancel-btn');
    var confirmBtn = document.getElementById('confirm-btn');
    if (!avatar || !name || !rating || !bio || !skills || !slotList ||
        !reviewList || !bookBtn || !modal || !confirmText || !cancelBtn || !confirmBtn) return;

    var gpa = utils.calculateGPA(mentor.gpaCourses);
    var selectedSlotId = null;

    /* ---------- Render thông tin tổng quan ---------- */
    if (mentor.avatar) {
      avatar.innerHTML = '<img src="' + utils.escapeHtml(mentor.avatar) +
        '" alt="Ảnh của ' + utils.escapeHtml(mentor.name) + '">';
    } else {
      avatar.textContent = mentor.initials;
    }
    name.textContent = mentor.name;
    rating.textContent = '★ ' + mentor.rating.toFixed(1) + '/5 · GPA ' + gpa.toFixed(2) + '/4.0';
    bio.textContent = mentor.bio;
    skills.innerHTML = mentor.skills.map(function (skill) {
      return '<span class="tag">' + utils.escapeHtml(skill) + '</span>';
    }).join('');

    /* Bổ sung khối thống kê học phí/GPA bằng DOM (không sửa HTML gốc). */
    var head = root.querySelector('.profile-head');
    if (head && !document.getElementById('stat-gpa')) {
      head.insertAdjacentHTML('afterend',
        '<section class="card section profile-stats" data-aos="fade-up" data-aos-delay="100">' +
          '<h2>Học phí &amp; kết quả</h2>' +
          '<div class="stats-grid">' +
            '<div><span class="stats-label">GPA cố vấn</span>' +
              '<strong id="stat-gpa">' + gpa.toFixed(2) + ' / 4.0</strong></div>' +
            '<div><span class="stats-label">Đơn giá</span>' +
              '<strong>' + utils.formatCurrency(mentor.hourlyRate) + '/giờ</strong></div>' +
            '<div><span class="stats-label">Giảm nhóm</span>' +
              '<strong>' + mentor.groupDiscount + '%</strong></div>' +
            '<div><span class="stats-label">Học phí buổi chọn</span>' +
              '<strong id="stat-tuition">Chưa chọn</strong></div>' +
          '</div>' +
        '</section>'
      );
    }
    var tuitionStat = document.getElementById('stat-tuition');

    /* ---------- Render lịch rảnh ---------- */
    var sortedSlots = mentor.slots.slice().sort(function (a, b) {
      return new Date(a.start) - new Date(b.start);
    });
    slotList.innerHTML = sortedSlots.map(function (slot, index) {
      var booked = utils.isSlotBooked(slot.id);
      return '<button type="button" class="slot' + (booked ? ' booked' : '') + '"' +
        ' data-slot-id="' + utils.escapeHtml(slot.id) + '"' +
        ' data-aos="fade-up" data-aos-delay="' + Math.min(index, 5) * 60 + '"' +
        (booked ? ' disabled' : '') + '>' +
        utils.escapeHtml(utils.formatDateTime(slot.start)) +
        ' · ' + slot.durationHours + 'h' + (booked ? ' (Đã đặt)' : '') +
        '</button>';
    }).join('') || '<p class="empty-note">Hiện chưa có khung giờ rảnh.</p>';

    /* ---------- Render đánh giá ---------- */
    reviewList.innerHTML = mentor.reviews.map(function (review, index) {
      var stars = new Array(Math.round(review.rating) + 1).join('★');
      return '<article class="review" data-aos="fade-up" data-aos-delay="' +
        Math.min(index, 5) * 60 + '">' +
        '<div class="review-header">' +
          '<span class="review-author">' + utils.escapeHtml(review.author) + '</span>' +
          '<span class="review-rating">' + stars + ' ' + review.rating.toFixed(1) + '</span>' +
        '</div>' +
        '<p>' + utils.escapeHtml(review.text) + '</p>' +
        '<small>' + utils.escapeHtml(utils.formatDate(review.date)) + '</small>' +
        '</article>';
    }).join('') || '<p class="empty-note">Chưa có đánh giá nào.</p>';

    /* ---------- Chọn khung giờ ---------- */
    function getSelectedSlot() {
      return mentor.slots.find(function (slot) { return slot.id === selectedSlotId; }) || null;
    }

    function tuitionOf(slot) {
      return utils.calculateTuition({
        hours: slot.durationHours,
        hourlyRate: mentor.hourlyRate,
        discountPercent: mentor.groupDiscount,
        platformFee: 0
      });
    }

    function updateSelection() {
      Array.prototype.forEach.call(slotList.querySelectorAll('[data-slot-id]'), function (button) {
        button.classList.toggle('selected', button.getAttribute('data-slot-id') === selectedSlotId);
      });
      var slot = getSelectedSlot();
      if (tuitionStat) {
        tuitionStat.textContent = slot ? utils.formatCurrency(tuitionOf(slot)) : 'Chưa chọn';
      }
      bookBtn.disabled = !slot;
      bookBtn.textContent = slot ? 'Đặt lịch hẹn' : 'Chọn khung giờ';
    }

    utils.delegate(slotList, 'click', '[data-slot-id]', function (event, button) {
      if (button.disabled) {
        utils.toast('Khung giờ này đã được đặt.', 'error');
        return;
      }
      selectedSlotId = button.getAttribute('data-slot-id');
      updateSelection();
    });

    /* ---------- Modal xác nhận ---------- */
    modal.classList.add('hidden');

    function closeModal() {
      modal.classList.add('hidden');
    }

    function openModal() {
      var slot = getSelectedSlot();
      if (!slot) {
        utils.toast('Vui lòng chọn một khung giờ trước.', 'error');
        return;
      }
      confirmText.textContent = 'Cố vấn: ' + mentor.name +
        '. Thời gian: ' + utils.formatDateTime(slot.start) +
        ' (' + slot.durationHours + ' giờ). Học phí dự kiến: ' +
        utils.formatCurrency(tuitionOf(slot)) + '.';
      modal.classList.remove('hidden');
      confirmBtn.focus();
    }

    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (event) {
      if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });

    bookBtn.addEventListener('click', openModal);

    confirmBtn.addEventListener('click', function () {
      var slot = getSelectedSlot();
      if (!slot) {
        closeModal();
        utils.toast('Không tìm thấy khung giờ đã chọn.', 'error');
        return;
      }
      if (utils.isSlotBooked(slot.id)) {
        closeModal();
        utils.toast('Khung giờ vừa bị đặt bởi người khác. Vui lòng chọn khung khác.', 'error');
        utils.storage.write(data.storageKeys.selectedMentor, mentor.id);
        global.location.reload();
        return;
      }

      utils.addAppointment({
        id: 'booking-' + Date.now(),
        mentorId: mentor.id,
        mentorName: mentor.name,
        slotId: slot.id,
        start: slot.start,
        durationHours: slot.durationHours,
        tuition: tuitionOf(slot),
        status: 'confirmed',
        createdAt: new Date().toISOString()
      });

      closeModal();
      utils.toast('Đặt lịch thành công! Đang chuyển đến trang lịch hẹn...');
      global.setTimeout(function () { global.location.href = 'index3.html'; }, 900);
    });

    updateSelection();
    if (NS.effects) NS.effects.refresh();
  }

  utils.ready(init);
})(window);
