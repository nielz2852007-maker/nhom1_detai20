/* ==========================================================
   data.js - Tầng dữ liệu: cố vấn, kỹ năng, lịch rảnh, đánh giá
   Module này chỉ chịu trách nhiệm cung cấp dữ liệu "sạch".
   ========================================================== */

(function (global) {
  'use strict';

  var NS = (global.MentorConnect = global.MentorConnect || {});

  /* Thang điểm 4.0 - dùng cho hàm tính GPA ở common.js */
  var GRADE_POINTS = Object.freeze({
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  });

  var SKILLS = Object.freeze([
    'Frontend', 'Backend', 'React', 'Node.js', 'Python',
    'Data Science', 'UI/UX', 'SQL', 'Java', 'Mobile'
  ]);

  /*
    Mỗi mentor gồm:
    - gpaCourses: mảng { credits, grade } để tính GPA bằng logic thực tế.
    - hourlyRate + groupDiscount: dùng để tính học phí.
    - slots: các khung giờ rảnh (ISO local datetime).
    - reviews: đánh giá từ người học.
  */
  var mentors = Object.freeze([
    {
      id: 'm1',
      name: 'Nguyễn Minh Anh',
      initials: 'NA',
      avatar: 'assets/avatars/mentor-m1.jfif',
      title: 'Frontend Engineer · 5 năm kinh nghiệm',
      bio: 'Chuyên React, TypeScript và thiết kế hệ thống component. Yêu thích giúp người mới xây dựng portfolio thực thụ.',
      skills: ['React', 'Frontend', 'UI/UX'],
      rating: 4.9,
      hourlyRate: 250000,
      groupDiscount: 10,
      gpaCourses: [
        { credits: 3, grade: 'A' },
        { credits: 3, grade: 'A' },
        { credits: 2, grade: 'B+' },
        { credits: 3, grade: 'A-' }
      ],
      reviews: [
        { author: 'Bạn Lan', rating: 5, date: '2026-10-12', text: 'Giải thích rất dễ hiểu, sau 3 buổi mình tự làm được dashboard React.' },
        { author: 'Bạn Khôi', rating: 5, date: '2026-09-28', text: 'Review code cực kỳ chi tiết, chỉ ra cả những lỗi nhỏ về accessibility.' },
        { author: 'Bạn My', rating: 4, date: '2026-08-15', text: 'Buổi học nhẹ nhàng, có tài liệu ôn tập gửi sau mỗi buổi.' }
      ],
      slots: [
        { id: 'm1-s1', start: '2026-12-02T19:00', durationHours: 1.5 },
        { id: 'm1-s2', start: '2026-12-05T20:00', durationHours: 1 },
        { id: 'm1-s3', start: '2026-12-09T19:30', durationHours: 2 },
        { id: 'm1-s4', start: '2026-12-14T18:00', durationHours: 1.5 }
      ]
    },
    {
      id: 'm2',
      name: 'Trần Quốc Bảo',
      initials: 'QB',
      avatar: 'assets/avatars/mentor-m2.jfif',
      title: 'Backend Engineer · Node.js & SQL',
      bio: 'Xây dựng API production, tối ưu query và thiết kế cơ sở dữ liệu. Luôn hướng tới code sạch, dễ maintain.',
      skills: ['Node.js', 'Backend', 'SQL', 'Java'],
      rating: 4.8,
      hourlyRate: 280000,
      groupDiscount: 5,
      gpaCourses: [
        { credits: 4, grade: 'A' },
        { credits: 3, grade: 'B+' },
        { credits: 3, grade: 'A-' },
        { credits: 2, grade: 'A' }
      ],
      reviews: [
        { author: 'Bạn Thành', rating: 5, date: '2026-10-02', text: 'Hướng dẫn design REST API rất thực tế, có cả bài tập deploy.' },
        { author: 'Bạn Ngọc', rating: 4, date: '2026-09-10', text: 'Giỏi và tận tâm, chỉ hơi nghiêm về formatting thôi :).' }
      ],
      slots: [
        { id: 'm2-s1', start: '2026-12-03T20:00', durationHours: 1.5 },
        { id: 'm2-s2', start: '2026-12-07T19:00', durationHours: 1 },
        { id: 'm2-s3', start: '2026-12-13T09:00', durationHours: 2 }
      ]
    },
    {
      id: 'm3',
      name: 'Lê Thị Cẩm',
      initials: 'LC',
      avatar: 'assets/avatars/mentor-m3.jfif',
      title: 'Data Scientist · Python & Machine Learning',
      bio: 'Biến dữ liệu thành câu chuyện có ý nghĩa. Hỗ trợ từ pandas cơ bản đến mô hình classification đầu tiên.',
      skills: ['Python', 'Data Science', 'SQL'],
      rating: 4.9,
      hourlyRate: 300000,
      groupDiscount: 15,
      gpaCourses: [
        { credits: 3, grade: 'A' },
        { credits: 3, grade: 'A' },
        { credits: 4, grade: 'A-' },
        { credits: 2, grade: 'B+' }
      ],
      reviews: [
        { author: 'Bạn Hà', rating: 5, date: '2026-10-20', text: 'Có cách giải thích statistics bằng ví dụ đời thường cực dễ nhớ.' },
        { author: 'Bạn Đức', rating: 5, date: '2026-09-05', text: 'Dataset mẫu sạch, notebook được comment kỹ. Rất đáng học.' }
      ],
      slots: [
        { id: 'm3-s1', start: '2026-12-04T19:00', durationHours: 2 },
        { id: 'm3-s2', start: '2026-12-11T20:00', durationHours: 1.5 },
        { id: 'm3-s3', start: '2026-12-18T19:30', durationHours: 1 }
      ]
    },
    {
      id: 'm4',
      name: 'Phạm Đức Duy',
      initials: 'DD',
      avatar: 'assets/avatars/mentor-m4.jfif',
      title: 'Mobile Developer · React Native',
      bio: 'Đã phát triển 4 app lên App Store/Google Play. Thích chia sẻ về runtime, state management và release app.',
      skills: ['Mobile', 'React', 'Frontend'],
      rating: 4.7,
      hourlyRate: 240000,
      groupDiscount: 10,
      gpaCourses: [
        { credits: 3, grade: 'B+' },
        { credits: 3, grade: 'A' },
        { credits: 2, grade: 'A-' },
        { credits: 3, grade: 'B' }
      ],
      reviews: [
        { author: 'Bạn Vũ', rating: 5, date: '2026-09-19', text: 'Chỉ mình cách debug trên thiết bị thật, tiết kiệm được nhiều thời gian.' },
        { author: 'Bạn Trang', rating: 4, date: '2026-08-30', text: 'Nhiều kinh nghiệm thực chiến, rất phù hợp với dự án cá nhân.' }
      ],
      slots: [
        { id: 'm4-s1', start: '2026-12-06T20:00', durationHours: 1.5 },
        { id: 'm4-s2', start: '2026-12-12T19:00', durationHours: 1 },
        { id: 'm4-s3', start: '2026-12-20T10:00', durationHours: 2 }
      ]
    },
    {
      id: 'm5',
      name: 'Võ Thùy Linh',
      initials: 'TL',
      avatar: 'assets/avatars/mentor-m5.jfif',
      title: 'Product Designer · UI/UX',
      bio: 'Design systems, Figma và research người dùng. Tin rằng giao diện tốt là giao diện không cần giải thích.',
      skills: ['UI/UX', 'Frontend'],
      rating: 4.8,
      hourlyRate: 220000,
      groupDiscount: 20,
      gpaCourses: [
        { credits: 3, grade: 'A' },
        { credits: 2, grade: 'A-' },
        { credits: 3, grade: 'A' },
        { credits: 3, grade: 'B+' }
      ],
      reviews: [
        { author: 'Bạn Nhật', rating: 5, date: '2026-10-08', text: 'Critique thiết kế rất góc nhìn người dùng, bài portfolio của mình lên rõ rệt.' }
      ],
      slots: [
        { id: 'm5-s1', start: '2026-12-08T19:30', durationHours: 1 },
        { id: 'm5-s2', start: '2026-12-15T20:00', durationHours: 1.5 },
        { id: 'm5-s3', start: '2026-12-21T19:00', durationHours: 1 }
      ]
    },
    {
      id: 'm6',
      name: 'Đặng Văn Hùng',
      initials: 'VH',
      avatar: 'assets/avatars/mentor-m6.jfif',
      title: 'Fullstack Developer · Java Spring Boot',
      bio: 'Chuyên Java, Spring Boot và microservices. Thích dạy bằng cách cùng viết từng dòng code và giải thích tại sao.',
      skills: ['Java', 'Backend', 'SQL'],
      rating: 4.6,
      hourlyRate: 260000,
      groupDiscount: 5,
      gpaCourses: [
        { credits: 4, grade: 'B+' },
        { credits: 3, grade: 'A' },
        { credits: 3, grade: 'B' },
        { credits: 2, grade: 'A-' }
      ],
      reviews: [
        { author: 'Bạn Hải', rating: 5, date: '2026-09-22', text: 'Auth JWT và deploy Spring Boot được hướng dẫn rất rõ ràng.' },
        { author: 'Bạn Linh', rating: 4, date: '2026-08-11', text: 'Buổi học có slide và source code đầy đủ, dễ ôn lại.' }
      ],
      slots: [
        { id: 'm6-s1', start: '2026-12-10T19:00', durationHours: 2 },
        { id: 'm6-s2', start: '2026-12-17T20:00', durationHours: 1.5 },
        { id: 'm6-s3', start: '2026-12-23T19:30', durationHours: 1 }
      ]
    }
  ]);

  /* Lịch mẫu để trang "Lịch hẹn" không bị trống khi chưa đặt lịch mới. */
  var seedAppointments = Object.freeze([
    {
      id: 'seed-1',
      mentorId: 'm1',
      mentorName: 'Nguyễn Minh Anh',
      slotId: 'm1-s2',
      start: '2026-12-05T20:00',
      durationHours: 1,
      tuition: 225000,
      status: 'confirmed',
      createdAt: '2026-11-20T09:15'
    },
    {
      id: 'seed-2',
      mentorId: 'm3',
      mentorName: 'Lê Thị Cẩm',
      slotId: 'm3-s1',
      start: '2026-12-04T19:00',
      durationHours: 2,
      tuition: 510000,
      status: 'pending',
      createdAt: '2026-11-22T14:40'
    }
  ]);

  NS.data = Object.freeze({
    SKILLS: SKILLS,
    GRADE_POINTS: GRADE_POINTS,
    mentors: mentors,
    seedAppointments: seedAppointments,
    storageKeys: Object.freeze({
      appointments: 'mentorconnect.appointments.v1',
      selectedMentor: 'mentorconnect.selectedMentorId'
    })
  });
})(window);
