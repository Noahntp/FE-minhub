/**
 * Dữ liệu mock 12 hồ sơ mẫu nâng cấp giảng viên (ADM-03)
 * Phân bổ: 5 pending, 4 approved, 3 rejected
 */
export const instructorUpgradesMockData = [
    {
        application_status: "pending",
        submitted_at: "2026-07-13T08:30:00Z",
        reviewed_at: null,
        review_note: null,
        user: {
            id: 201,
            full_name: "Đặng Tuấn Kiệt",
            email: "kiet.dang@gmail.com",
            phone: "0901112222",
            role: "learner",
            status: "active",
            email_verified_at: "2026-07-01T10:00:00Z"
        },
        instructor_profile: {
            bio: "Tôi là kỹ sư Backend hơn 5 năm kinh nghiệm làm việc với Node.js, Go và microservices.\nTôi mong muốn mang đến các khóa học thiết kế hệ thống phân tán chịu tải cao thực tế nhất cho học viên.",
            expertise: "Lập trình Backend (Node.js, Go), Thiết kế hệ thống (Microservices, SQL/NoSQL)",
            experience_years: 5,
            level: "Cao cấp"
        },
        payout_account: {
            id: 601,
            provider: "Vietcombank",
            account_name: "DANG TUAN KIET",
            account_number: "1023334445",
            account_number_masked: "102*****45",
            status: "active",
            connected_at: "2026-07-12T15:30:00Z"
        }
    },
    {
        application_status: "pending",
        submitted_at: "2026-07-12T14:15:00Z",
        reviewed_at: null,
        review_note: null,
        user: {
            id: 202,
            full_name: "Trần Quốc Huy",
            email: "huy.tran@gmail.com",
            phone: "0912223333",
            role: "learner",
            status: "active",
            email_verified_at: "2026-07-02T11:00:00Z"
        },
        instructor_profile: {
            bio: "Senior Frontend Engineer chuyên về ReactJS, Next.js và Tailwind CSS.\nTừng xây dựng nhiều dự án SaaS lớn. Tôi muốn chia sẻ kỹ thuật tối ưu hóa performance và quản lý state phức tạp.",
            expertise: "Lập trình Frontend (ReactJS, NextJS), CSS & UI Architecture",
            experience_years: 4,
            level: "Trung cấp"
        },
        payout_account: null // Trường hợp hồ sơ chờ và chưa có tài khoản nhận tiền
    },
    {
        application_status: "pending",
        submitted_at: "2026-07-11T10:00:00Z",
        reviewed_at: null,
        review_note: null,
        user: {
            id: 203,
            full_name: "Lê Thảo Vy",
            email: "vy.le@gmail.com",
            phone: "0923334444",
            role: "learner",
            status: "active",
            email_verified_at: "2026-07-05T09:00:00Z"
        },
        instructor_profile: {
            bio: "Product Designer tại tập đoàn công nghệ đa quốc gia.\nTôi muốn dạy thiết kế UI/UX từ cơ bản đến nâng cao, hướng dẫn làm Portfolio và xây dựng tư duy thiết kế lấy người dùng làm trung tâm.",
            expertise: "Thiết kế UI/UX, Design System, Figma, User Research",
            experience_years: 6,
            level: "Cao cấp"
        },
        payout_account: {
            id: 603,
            provider: "Techcombank",
            account_name: "LE THAO VY",
            account_number: "1903334445556",
            account_number_masked: "190*********56",
            status: "pending_verification", // Trường hợp payout status pending_verification
            connected_at: "2026-07-11T09:45:00Z"
        }
    },
    {
        application_status: "pending",
        submitted_at: "2026-07-10T16:20:00Z",
        reviewed_at: null,
        review_note: null,
        user: {
            id: 204,
            full_name: "Phạm Hoàng Nam",
            email: "nam.pham@gmail.com",
            phone: "0934445555",
            role: "learner",
            status: "active",
            email_verified_at: null // Người dùng chưa xác minh email
        },
        instructor_profile: {
            bio: "Tôi đã làm việc trong ngành Marketing hơn 8 năm, chạy ngân sách quảng cáo hàng tỷ đồng cho nhiều doanh nghiệp FMCG.\nKhóa học của tôi tập trung vào thực chiến phễu chuyển đổi và đo lường ROI.",
            expertise: "Digital Marketing, Performance Marketing, Facebook/Google Ads",
            experience_years: 8,
            level: "Cao cấp"
        },
        payout_account: {
            id: 604,
            provider: "MB Bank",
            account_name: "PHAM HOANG NAM",
            account_number: "999333444555",
            account_number_masked: "999******555",
            status: "active",
            connected_at: "2026-07-10T15:00:00Z"
        }
    },
    {
        application_status: "pending",
        submitted_at: "2026-07-09T09:00:00Z",
        reviewed_at: null,
        review_note: null,
        user: {
            id: 205,
            full_name: "Võ Gia Hân",
            email: "han.vo@gmail.com",
            phone: "0945556666",
            role: "learner",
            status: "active",
            email_verified_at: "2026-07-06T08:00:00Z"
        },
        instructor_profile: {
            bio: "Data Analyst đam mê phân tích số liệu và kể câu chuyện qua biểu đồ.\nTôi muốn hướng dẫn học viên các kỹ năng SQL, Excel nâng cao, Python Pandas và Tableau để xử lý dữ liệu lớn.",
            expertise: "Phân tích dữ liệu (Python, SQL), Data Visualization (Tableau, PowerBI)",
            experience_years: 3,
            level: "Trung cấp"
        },
        payout_account: {
            id: 605,
            provider: "ACB",
            account_name: "VO GIA HAN",
            account_number: "123444555",
            account_number_masked: "123****55",
            status: "active",
            connected_at: "2026-07-09T08:30:00Z"
        }
    },
    {
        application_status: "approved",
        submitted_at: "2026-07-08T10:00:00Z",
        reviewed_at: "2026-07-09T14:00:00Z",
        review_note: "Hồ sơ chuyên môn tốt. Đã kết nối tài khoản nhận tiền hợp lệ.",
        user: {
            id: 206,
            full_name: "Nguyễn Minh Anh",
            email: "minhanh.nguyen@gmail.com",
            phone: "0956667777",
            role: "instructor", // Đã nâng cấp thành instructor
            status: "active",
            email_verified_at: "2026-06-25T08:00:00Z"
        },
        instructor_profile: {
            bio: "Mobile Developer hơn 7 năm kinh nghiệm. Đã xây dựng và phát hành nhiều ứng dụng iOS/Android phổ biến bằng Flutter và Swift.\nKhóa học hướng dẫn code dự án thực tế và đưa app lên Store.",
            expertise: "Lập trình di động (Flutter, Swift, Kotlin), App Store Optimization",
            experience_years: 7,
            level: "Cao cấp"
        },
        payout_account: {
            id: 606,
            provider: "Vietcombank",
            account_name: "NGUYEN MINH ANH",
            account_number: "1024445556",
            account_number_masked: "102*****56",
            status: "active",
            connected_at: "2026-07-08T09:30:00Z"
        }
    },
    {
        application_status: "approved",
        submitted_at: "2026-07-07T11:15:00Z",
        reviewed_at: "2026-07-08T09:30:00Z",
        review_note: "Hồ sơ đạt tiêu chuẩn hệ thống.",
        user: {
            id: 207,
            full_name: "Bùi Ngọc Mai",
            email: "mai.bui@gmail.com",
            phone: "0967778888",
            role: "instructor",
            status: "active",
            email_verified_at: "2026-06-20T14:00:00Z"
        },
        instructor_profile: {
            bio: "Business Analyst tại ngân hàng lớn với kỹ năng lấy yêu cầu, phân tích quy trình nghiệp vụ BPMN và viết tài liệu SRS chuyên nghiệp.\nDạy học với case study thực tế từ doanh nghiệp.",
            expertise: "Business Analysis, Requirement Gathering, BPMN, Agile/Scrum",
            experience_years: 5,
            level: "Trung cấp"
        },
        payout_account: {
            id: 607,
            provider: "Techcombank",
            account_name: "BUI NGOC MAI",
            account_number: "1904445556667",
            account_number_masked: "190*********67",
            status: "active",
            connected_at: "2026-07-07T10:30:00Z"
        }
    },
    {
        application_status: "approved",
        submitted_at: "2026-07-06T15:30:00Z",
        reviewed_at: "2026-07-07T10:00:00Z",
        review_note: "Chuyên gia bảo mật thông tin có đầy đủ chứng chỉ quốc tế CISSP.",
        user: {
            id: 208,
            full_name: "Hồ Đức Long",
            email: "long.ho@gmail.com",
            phone: "0978889999",
            role: "instructor",
            status: "active",
            email_verified_at: "2026-06-28T09:00:00Z"
        },
        instructor_profile: {
            bio: "Security Consultant chuyên về Penetration Testing và an ninh ứng dụng.\nGiúp lập trình viên viết code bảo mật cao, phát hiện và vá các lỗ hổng OWASP Top 10.",
            expertise: "An toàn thông tin, Cyber Security, Ethical Hacking, AppSec",
            experience_years: 8,
            level: "Cao cấp"
        },
        payout_account: {
            id: 608,
            provider: "MB Bank",
            account_name: "HO DUC LONG",
            account_number: "999444555666",
            account_number_masked: "999******666",
            status: "active",
            connected_at: "2026-07-06T14:45:00Z"
        }
    },
    {
        application_status: "approved",
        submitted_at: "2026-07-05T09:00:00Z",
        reviewed_at: "2026-07-06T11:00:00Z",
        review_note: "Có chứng chỉ PMP và kinh nghiệm dẫn dắt nhiều dự án phần mềm quy mô lớn.",
        user: {
            id: 209,
            full_name: "Nguyễn Thanh Trúc",
            email: "truc.nguyen@gmail.com",
            phone: "0989990000",
            role: "instructor",
            status: "active",
            email_verified_at: "2026-06-18T10:00:00Z"
        },
        instructor_profile: {
            bio: "Senior Product Manager với tư duy định hình sản phẩm từ con số 0.\nTôi sẽ chia sẻ quy trình định vị thị trường, viết User Story, lập lộ trình phát triển (Product Roadmap).",
            expertise: "Product Management, Agile/Scrum, PMP, Product Strategy",
            experience_years: 7,
            level: "Cao cấp"
        },
        payout_account: {
            id: 609,
            provider: "ACB",
            account_name: "NGUYEN THANH TRUC",
            account_number: "123555666",
            account_number_masked: "123****66",
            status: "active",
            connected_at: "2026-07-05T08:30:00Z"
        }
    },
    {
        application_status: "rejected",
        submitted_at: "2026-07-04T13:00:00Z",
        reviewed_at: "2026-07-05T15:30:00Z",
        review_note: "Kinh nghiệm làm việc thực tế chưa đủ yêu cầu (tối thiểu 3 năm).",
        user: {
            id: 210,
            full_name: "Trần Anh Khoa",
            email: "khoa.tran@gmail.com",
            phone: "0902221111",
            role: "learner",
            status: "active",
            email_verified_at: "2026-06-30T09:00:00Z"
        },
        instructor_profile: {
            bio: "Lập trình viên Game tự do mới tốt nghiệp, yêu thích thiết kế các game nhỏ 2D trên nền tảng Unity.",
            expertise: "Lập trình Game (Unity, C#), Game Design 2D",
            experience_years: 1,
            level: "Sơ cấp"
        },
        payout_account: {
            id: 610,
            provider: "Sacombank",
            account_name: "TRAN ANH KHOA",
            account_number: "060222333444",
            account_number_masked: "060*********44",
            status: "active",
            connected_at: "2026-07-04T12:00:00Z"
        }
    },
    {
        application_status: "rejected",
        submitted_at: "2026-07-03T10:45:00Z",
        reviewed_at: "2026-07-04T11:00:00Z",
        review_note: "Tài khoản người dùng chưa hoàn tất xác minh email.",
        user: {
            id: 211,
            full_name: "Lý Minh Châu",
            email: "chau.ly@gmail.com",
            phone: "0913332222",
            role: "learner",
            status: "active",
            email_verified_at: null // Chưa xác minh email
        },
        instructor_profile: {
            bio: "Marketing Specialist chuyên về viết nội dung quảng cáo và quản trị fanpage.\nMuốn giảng dạy copywriting cơ bản.",
            expertise: "Content Marketing, Copywriting, Social Media Management",
            experience_years: 3,
            level: "Trung cấp"
        },
        payout_account: {
            id: 611,
            provider: "Vietinbank",
            account_name: "LY MINH CHAU",
            account_number: "101888999000",
            account_number_masked: "101*********00",
            status: "active",
            connected_at: "2026-07-03T09:30:00Z"
        }
    },
    {
        application_status: "rejected",
        submitted_at: "2026-07-02T16:00:00Z",
        reviewed_at: "2026-07-03T09:00:00Z",
        review_note: "Hồ sơ không có chuyên môn phù hợp với định hướng khóa học lập trình thực chiến của nền tảng.",
        user: {
            id: 212,
            full_name: "Phan Quốc Bảo",
            email: "bao.phan@gmail.com",
            phone: "0924443333",
            role: "learner",
            status: "active",
            email_verified_at: "2026-06-25T11:00:00Z"
        },
        instructor_profile: {
            bio: "Tôi yêu thích quản trị hệ thống, muốn dạy cách quản trị hosting và tên miền cơ bản.",
            expertise: "Web Hosting Administration, Domain Configuration",
            experience_years: 2,
            level: "Sơ cấp"
        },
        payout_account: {
            id: 612,
            provider: "TPBank",
            account_name: "PHAN QUOC BAO",
            account_number: "04022233344",
            account_number_masked: "040*******4",
            status: "active",
            connected_at: "2026-07-02T15:00:00Z"
        }
    }
];
