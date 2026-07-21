/**
 * Dữ liệu mock ban đầu cho danh sách yêu cầu nâng cấp giảng viên.
 * Sẽ được load và quản lý tập trung bởi instructor-upgrades-api.js.
 */
export const instructorUpgradesData = [
    {
        application_status: "pending",
        submitted_at: "2026-07-10T14:30:00Z",
        reviewed_at: null,
        review_note: null,
        user: {
            id: 101,
            full_name: "Nguyễn Văn A",
            email: "nguyenvana@gmail.com",
            phone: "0987654321",
            role: "learner",
            status: "active",
            email_verified_at: "2026-07-01T08:00:00Z"
        },
        instructor_profile: {
            bio: "Xin chào, tôi là lập trình viên Fullstack với hơn 5 năm kinh nghiệm thực chiến tại các dự án phần mềm lớn.\nTôi rất muốn chia sẻ kiến thức của mình cho cộng đồng học viên MindHub.",
            expertise: "Lập trình Web (Node.js, ReactJS, Tailwind CSS), DevOps cơ bản",
            experience_years: 5,
            level: "Trung cấp"
        },
        payout_account: {
            id: 501,
            provider: "Vietcombank",
            account_name: "NGUYEN VAN A",
            account_number: "1012345678",
            account_number_masked: "101*****78",
            status: "active",
            connected_at: "2026-07-02T10:15:00Z"
        }
    },
    {
        application_status: "pending",
        submitted_at: "2026-07-09T09:15:00Z",
        reviewed_at: null,
        review_note: null,
        user: {
            id: 102,
            full_name: "Trần Thị B",
            email: "tranthib@gmail.com",
            phone: "0912345678",
            role: "learner",
            status: "active",
            email_verified_at: "2026-07-03T11:20:00Z"
        },
        instructor_profile: {
            bio: "Giảng viên tiếng Anh tự do với chứng chỉ IELTS 8.5.\nĐã giảng dạy hơn 3 năm tại các trung tâm tiếng Anh uy tín tại Hà Nội.\nPhương pháp dạy học sinh động, thực tế.",
            expertise: "Tiếng Anh giao tiếp công sở, Luyện thi IELTS Preparation",
            experience_years: 3,
            level: "Trung cấp"
        },
        payout_account: {
            id: 502,
            provider: "Techcombank",
            account_name: "TRAN THI B",
            account_number: "1903456789012",
            account_number_masked: "190*********12",
            status: "active",
            connected_at: "2026-07-04T14:00:00Z"
        }
    },
    {
        application_status: "pending",
        submitted_at: "2026-07-08T16:45:00Z",
        reviewed_at: null,
        review_note: null,
        user: {
            id: 105,
            full_name: "Hoàng Văn Nam",
            email: "nam.hoang@gmail.com",
            phone: "0967890123",
            role: "learner",
            status: "active",
            email_verified_at: "2026-07-05T09:10:00Z"
        },
        instructor_profile: {
            bio: "Chuyên gia Marketing với 6 năm kinh nghiệm chạy chiến dịch cho nhiều nhãn hàng tiêu dùng nhanh.\nTôi muốn mang đến các khóa học chuyên sâu về SEO và Google Ads.",
            expertise: "Digital Marketing, SEO, Google Ads, Facebook Ads",
            experience_years: 6,
            level: "Cao cấp"
        },
        payout_account: null // Thiếu tài khoản nhận tiền hợp lệ
    },
    {
        application_status: "approved",
        submitted_at: "2026-07-05T08:00:00Z",
        reviewed_at: "2026-07-06T10:00:00Z",
        review_note: "Hồ sơ chuyên môn xuất sắc, thông tin tài khoản đầy đủ rõ ràng.",
        user: {
            id: 103,
            full_name: "Lê Hoàng C",
            email: "lehoangc@gmail.com",
            phone: "0909999999",
            role: "instructor",
            status: "active",
            email_verified_at: "2026-06-20T09:00:00Z"
        },
        instructor_profile: {
            bio: "Chuyên gia Thiết kế đồ họa UI/UX với hơn 8 năm kinh nghiệm làm việc tại các tập đoàn lớn.\nĐã hoàn thành nhiều dự án ứng dụng di động đạt giải thưởng.",
            expertise: "UI/UX Design, Figma, Adobe XD, Mobile Application Design",
            experience_years: 8,
            level: "Cao cấp"
        },
        payout_account: {
            id: 503,
            provider: "MB Bank",
            account_name: "LE HOANG C",
            account_number: "999888777666",
            account_number_masked: "999******666",
            status: "active",
            connected_at: "2026-06-25T16:30:00Z"
        }
    },
    {
        application_status: "rejected",
        submitted_at: "2026-07-01T15:45:00Z",
        reviewed_at: "2026-07-02T11:00:00Z",
        review_note: "Kinh nghiệm thực tế chưa đủ yêu cầu giảng dạy chuyên môn (tối thiểu 3 năm).",
        user: {
            id: 104,
            full_name: "Phạm Văn D",
            email: "phamvand@gmail.com",
            phone: "0934567890",
            role: "learner",
            status: "active",
            email_verified_at: "2026-06-20T15:00:00Z"
        },
        instructor_profile: {
            bio: "Mới tốt nghiệp ngành công nghệ thông tin, muốn thử sức dạy các bài học cơ bản.",
            expertise: "HTML/CSS cơ bản",
            experience_years: 1,
            level: "Sơ cấp"
        },
        payout_account: {
            id: 504,
            provider: "ACB",
            account_name: "PHAM VAN D",
            account_number: "123456789",
            account_number_masked: "123****89",
            status: "active",
            connected_at: "2026-07-01T15:00:00Z"
        }
    }
];
