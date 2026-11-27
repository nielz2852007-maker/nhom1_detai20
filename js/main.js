/* ==========================================================
   main.js - Trang chủ: lọc kỹ năng, tìm kiếm, render danh sách cố vấn.
   Dùng map() để render, filter() để lọc, delegate() cho sự kiện.
   ========================================================== */

(function (global) {
  'use strict';

  var NS = global.MentorConnect;
  if (!NS || !NS.data || !NS.utils) return;

  var data = NS.data;
  var utils = NS.utils;
  var mentors = data.mentors;

  function init() {
    var list = document.getElementById('mentor-list');
    var searchInput = document.getElementById('search-input');
    var skillFilter = document.getElementById('skill-filter');
    if (!list || !searchInput || !skillFilter) return;

    /* Tạo option từ mảng kỹ năng bằng map() */
    var options = data.SKILLS.map(function (skill) {
      return '<option value="' + utils.escapeHtml(skill) + '">' +
        utils.escapeHtml(skill) + '</option>';
    });
    skillFilter.innerHTML = '<option value="">Tất cả kỹ năng</option>' + options.join('');

    function cardTemplate(mentor) {
      var gpa = utils.calculateGPA(mentor.gpaCourses);
      var stars = new Array(Math.round(mentor.rating) + 1).join('★');
      var tags = mentor.skills.map(function (skill) {
        return '<span class="tag">' + utils.escapeHtml(skill) + '</span>';
      }).join('');

      return [
        '<article class="mentor-card">',
          '<div class="mentor-card-top">',
            '<div class="avatar">' + utils.escapeHtml(mentor.initials) + '</div>',
            '<div>',
              '<h2>' + utils.escapeHtml(mentor.name) + '</h2>',
              '<p class="rating">' + stars + ' ' + mentor.rating.toFixed(1) + '/5</p>',
            '</div>',
          '</div>',
          '<p class="mentor-title">' + utils.escapeHtml(mentor.title) + '</p>',
          '<p>' + utils.escapeHtml(mentor.bio) + '</p>',
          '<div class="tags">' + tags + '</div>',
          '<p class="mentor-gpa">GPA ' + gpa.toFixed(2) + '/4.0 · Từ ' +
            utils.formatCurrency(mentor.hourlyRate) + '/giờ</p>',
          '<button type="button" class="btn btn-primary" data-mentor-id="' +
            utils.escapeHtml(mentor.id) + '">Xem hồ sơ →</button>',
        '</article>'
      ].join('');
    }

    function render() {
      var keyword = (searchInput.value || '').trim().toLowerCase();
      var skill = skillFilter.value || '';

      var filtered = mentors.filter(function (mentor) {
        var haystack = [mentor.name, mentor.title, mentor.bio]
          .concat(mentor.skills)
          .join(' ')
          .toLowerCase();
        var matchSkill = !skill || mentor.skills.indexOf(skill) !== -1;
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        return matchSkill && matchKeyword;
      });

      list.innerHTML = filtered.length
        ? filtered.map(cardTemplate).join('')
        : '<div class="empty-state">Không tìm thấy cố vấn phù hợp. ' +
          'Thử đổi từ khóa hoặc kỹ năng nhé.</div>';

      list.setAttribute('aria-label', 'Danh sách ' + filtered.length + ' cố vấn');
    }

    /* Event delegation: nút được tạo lại sau mỗi lần render vẫn hoạt động. */
    utils.delegate(list, 'click', '[data-mentor-id]', function (event, button) {
      var id = button.getAttribute('data-mentor-id');
      utils.storage.write(data.storageKeys.selectedMentor, id);
      global.location.href = 'index2.html?id=' + encodeURIComponent(id);
    });

    searchInput.addEventListener('input', utils.debounce(render, 200));
    skillFilter.addEventListener('change', render);
    render();
  }

  utils.ready(init);
})(window);
