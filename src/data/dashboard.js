import {
    getUsers,
    getCourses,
    getOrders,
    getEnrollments,
    getRevenues,
    getWithdrawals,
    getInstructorUpgrades
} from "../assets/js/mocks/mock-repository.js";

/**
 * Dữ liệu giả lập (mock data) cho trang Dashboard Admin MindHub tuân thủ API Contract V2.
 * Hỗ trợ 4 khoảng thời gian mặc định và lọc theo khoảng ngày tùy chọn.
 */

const mockDataPresets = {
    "7days": {
        dashboard: {
            data: {
                summary: {
                    total_users: 1250,
                    total_learners: 1100,
                    total_instructors: 150,
                    total_courses: 84,
                    total_published_courses: 70,
                    total_orders: 320,
                    paid_orders: 280,
                    total_enrollments: 3420,
                    completed_enrollments: 1026,
                    completion_rate: 30.0
                },
                revenue: {
                    gross_amount: "185400000.00",
                    instructor_amount: "129780000.00",
                    platform_fee_amount: "55620000.00"
                },
                course_status: {
                    draft: 4,
                    pending_review: 12,
                    approved: 8,
                    rejected: 2,
                    published: 54,
                    hidden: 4
                },
                user_status: {
                    active: 1120,
                    inactive: 110,
                    locked: 20
                },
                withdrawal_summary: {
                    pending_count: 3,
                    approved_count: 2,
                    pending_amount: "14500000.00",
                    approved_amount: "8000000.00",
                    paid_amount: "75000000.00"
                },
                action_required: {
                    pending_course_reviews: 5,
                    pending_instructor_upgrades: 3,
                    pending_withdrawals: 2,
                    pending_payout_accounts: 4
                },
                recent: {
                    latest_orders: [
                        {
                            id: 1001,
                            order_code: "ORD1001",
                            amount: "400000.00",
                            status: "paid",
                            paid_at: "2026-07-12T20:30:00Z",
                            user: { id: 301, full_name: "Nguyễn Văn A" },
                            course: { id: 101, title: "Lập trình Laravel căn bản", slug: "lap-trinh-laravel-can-ban" }
                        },
                        {
                            id: 1002,
                            order_code: "ORD1002",
                            amount: "300000.00",
                            status: "paid",
                            paid_at: "2026-07-12T19:15:00Z",
                            user: { id: 302, full_name: "Lê Văn B" },
                            course: { id: 102, title: "Làm chủ Vue.js 3 trong 30 ngày", slug: "lam-chu-vuejs-3-trong-30-ngay" }
                        },
                        {
                            id: 1003,
                            order_code: "ORD1003",
                            amount: "500000.00",
                            status: "paid",
                            paid_at: "2026-07-11T14:20:00Z",
                            user: { id: 303, full_name: "Phạm Minh C" },
                            course: { id: 103, title: "Thiết kế hệ thống lớn (System Design)", slug: "thiet-ke-he-thong-lon-system-design" }
                        },
                        {
                            id: 1004,
                            order_code: "ORD1004",
                            amount: "200000.00",
                            status: "paid",
                            paid_at: "2026-07-11T10:05:00Z",
                            user: { id: 304, full_name: "Đỗ Hoàng D" },
                            course: { id: 104, title: "Tailwind CSS từ Zero đến Hero", slug: "tailwind-css-tu-zero-den-hero" }
                        },
                        {
                            id: 1005,
                            order_code: "ORD1005",
                            amount: "150000.00",
                            status: "paid",
                            paid_at: "2026-07-10T16:30:00Z",
                            user: { id: 305, full_name: "Nguyễn Thị E" },
                            course: { id: 105, title: "HTML/CSS & Javascript cho người mới", slug: "html-css-javascript-cho-nguoi-moi" }
                        }
                    ],
                    latest_courses: [
                        { id: 201, title: "Lập trình React Native", instructor_name: "Trần Văn Hoàng", status: "published", published_at: "2026-07-12T18:00:00Z" },
                        { id: 202, title: "Cấu trúc dữ liệu & Giải thuật", instructor_name: "Phạm Minh Đức", status: "pending_review", created_at: "2026-07-12T15:30:00Z" },
                        { id: 203, title: "Làm chủ Docker & Kubernetes", instructor_name: "Nguyễn Anh Hồng", status: "draft", created_at: "2026-07-11T09:15:00Z" },
                        { id: 204, title: "Next.js 14 Advanced Course", instructor_name: "Lê Thị Nga", status: "approved", approved_at: "2026-07-11T08:00:00Z" },
                        { id: 205, title: "Python cho Khoa học dữ liệu", instructor_name: "Nguyễn Anh Hồng", status: "rejected", rejected_at: "2026-07-10T14:00:00Z" }
                    ]
                }
            }
        },
        revenue_report: {
            data: {
                summary: {
                    total_gross_amount: "185400000.00",
                    total_instructor_amount: "129780000.00",
                    total_platform_fee_amount: "55620000.00"
                },
                items: [
                    { date: "2026-07-06", gross_amount: "12000000.00", instructor_amount: "8400000.00", platform_fee_amount: "3600000.00" },
                    { date: "2026-07-07", gross_amount: "18000000.00", instructor_amount: "12600000.00", platform_fee_amount: "5400000.00" },
                    { date: "2026-07-08", gross_amount: "15000000.00", instructor_amount: "10500000.00", platform_fee_amount: "4500000.00" },
                    { date: "2026-07-09", gross_amount: "22000000.00", instructor_amount: "15400000.00", platform_fee_amount: "6600000.00" },
                    { date: "2026-07-10", gross_amount: "30000000.00", instructor_amount: "21000000.00", platform_fee_amount: "9000000.00" },
                    { date: "2026-07-11", gross_amount: "45000000.00", instructor_amount: "31500000.00", platform_fee_amount: "13500000.00" },
                    { date: "2026-07-12", gross_amount: "43400000.00", instructor_amount: "30380000.00", platform_fee_amount: "13020000.00" }
                ]
            }
        },
        top_courses: {
            data: {
                summary: {
                    total_courses: 4
                },
                items: [
                    { course_id: 101, title: "Lập trình Laravel căn bản", instructor_name: "Trần Văn Hoàng", sales_count: 148, enrollment_count: 1250, completed_count: 375, completion_rate: 30.0, gross_revenue: "44400000.00", last_paid_at: "2026-07-12T20:30:00Z" },
                    { course_id: 102, title: "Làm chủ Vue.js 3 trong 30 ngày", instructor_name: "Nguyễn Anh Hồng", sales_count: 120, enrollment_count: 840, completed_count: 210, completion_rate: 25.0, gross_revenue: "36000000.00", last_paid_at: "2026-07-12T19:15:00Z" },
                    { course_id: 103, title: "Thiết kế hệ thống lớn (System Design)", instructor_name: "Phạm Minh Đức", sales_count: 95, enrollment_count: 680, completed_count: 136, completion_rate: 20.0, gross_revenue: "33250000.00", last_paid_at: "2026-07-12T14:20:00Z" },
                    { course_id: 104, title: "Tailwind CSS từ Zero đến Hero", instructor_name: "Lê Thị Nga", sales_count: 88, enrollment_count: 1100, completed_count: 440, completion_rate: 40.0, gross_revenue: "17600000.00", last_paid_at: "2026-07-11T16:45:00Z" }
                ]
            }
        },
        top_instructors: {
            data: {
                items: [
                    { instructor_id: 501, full_name: "Trần Văn Hoàng", email: "hoang.tv@mindhub.edu.vn", total_courses: 3, published_courses: 2, sales_count: 250, enrollment_count: 1950, completed_enrollments: 585, completion_rate: 30.0, gross_revenue: "75000000.00", instructor_amount: "52500000.00", last_active_at: "2026-07-12T20:30:00Z" },
                    { instructor_id: 502, full_name: "Nguyễn Anh Hồng", email: "hong.na@mindhub.edu.vn", total_courses: 2, published_courses: 2, sales_count: 180, enrollment_count: 1200, completed_enrollments: 360, completion_rate: 30.0, gross_revenue: "54000000.00", instructor_amount: "37800000.00", last_active_at: "2026-07-12T19:15:00Z" },
                    { instructor_id: 503, full_name: "Phạm Minh Đức", email: "duc.pm@mindhub.edu.vn", total_courses: 5, published_courses: 4, sales_count: 140, enrollment_count: 1050, completed_enrollments: 262, completion_rate: 25.0, gross_revenue: "49000000.00", instructor_amount: "34300000.00", last_active_at: "2026-07-12T15:30:00Z" },
                    { instructor_id: 504, full_name: "Lê Thị Nga", email: "nga.lt@mindhub.edu.vn", total_courses: 1, published_courses: 1, sales_count: 88, enrollment_count: 1100, completed_enrollments: 440, completion_rate: 40.0, gross_revenue: "17600000.00", instructor_amount: "12320000.00", last_active_at: "2026-07-11T16:45:00Z" }
                ]
            }
        }
    },
    "30days": {
        dashboard: {
            data: {
                summary: {
                    total_users: 1420,
                    total_learners: 1240,
                    total_instructors: 180,
                    total_courses: 92,
                    total_published_courses: 77,
                    total_orders: 540,
                    paid_orders: 490,
                    total_enrollments: 4110,
                    completed_enrollments: 1438,
                    completion_rate: 35.0
                },
                revenue: {
                    gross_amount: "320600000.00",
                    instructor_amount: "224420000.00",
                    platform_fee_amount: "96180000.00"
                },
                course_status: {
                    draft: 5,
                    pending_review: 15,
                    approved: 10,
                    rejected: 3,
                    published: 55,
                    hidden: 4
                },
                user_status: {
                    active: 1290,
                    inactive: 100,
                    locked: 30
                },
                withdrawal_summary: {
                    pending_count: 5,
                    approved_count: 3,
                    pending_amount: "18200000.00",
                    approved_amount: "12000000.00",
                    paid_amount: "120000000.00"
                },
                action_required: {
                    pending_course_reviews: 8,
                    pending_instructor_upgrades: 4,
                    pending_withdrawals: 5,
                    pending_payout_accounts: 6
                },
                recent: {
                    latest_orders: [
                        {
                            id: 1001,
                            order_code: "ORD1001",
                            amount: "400000.00",
                            status: "paid",
                            paid_at: "2026-07-12T20:30:00Z",
                            user: { id: 301, full_name: "Nguyễn Văn A" },
                            course: { id: 101, title: "Lập trình Laravel căn bản", slug: "lap-trinh-laravel-can-ban" }
                        },
                        {
                            id: 1002,
                            order_code: "ORD1002",
                            amount: "300000.00",
                            status: "paid",
                            paid_at: "2026-07-12T19:15:00Z",
                            user: { id: 302, full_name: "Lê Văn B" },
                            course: { id: 102, title: "Làm chủ Vue.js 3 trong 30 ngày", slug: "lam-chu-vuejs-3-trong-30-ngay" }
                        }
                    ],
                    latest_courses: [
                        { id: 201, title: "Lập trình React Native", instructor_name: "Trần Văn Hoàng", status: "published", published_at: "2026-07-12T18:00:00Z" },
                        { id: 202, title: "Cấu trúc dữ liệu & Giải thuật", instructor_name: "Phạm Minh Đức", status: "pending_review", created_at: "2026-07-12T15:30:00Z" }
                    ]
                }
            }
        },
        revenue_report: {
            data: {
                summary: {
                    total_gross_amount: "320600000.00",
                    total_instructor_amount: "224420000.00",
                    total_platform_fee_amount: "96180000.00"
                },
                items: [
                    { date: "Tuần 1", gross_amount: "40000000.00", instructor_amount: "28000000.00", platform_fee_amount: "12000000.00" },
                    { date: "Tuần 2", gross_amount: "55000000.00", instructor_amount: "38500000.00", platform_fee_amount: "16500000.00" },
                    { date: "Tuần 3", gross_amount: "70000000.00", instructor_amount: "49000000.00", platform_fee_amount: "21000000.00" },
                    { date: "Tuần 4", gross_amount: "65000000.00", instructor_amount: "45500000.00", platform_fee_amount: "19500000.00" },
                    { date: "Hôm nay", gross_amount: "90600000.00", instructor_amount: "63420000.00", platform_fee_amount: "27180000.00" }
                ]
            }
        },
        top_courses: {
            data: {
                summary: {
                    total_courses: 4
                },
                items: [
                    { course_id: 101, title: "Lập trình Laravel căn bản", instructor_name: "Trần Văn Hoàng", sales_count: 250, enrollment_count: 1550, completed_count: 465, completion_rate: 30.0, gross_revenue: "75000000.00", last_paid_at: "2026-07-12T20:30:00Z" },
                    { course_id: 103, title: "Thiết kế hệ thống lớn (System Design)", instructor_name: "Phạm Minh Đức", sales_count: 180, enrollment_count: 910, completed_count: 182, completion_rate: 20.0, gross_revenue: "63000000.00", last_paid_at: "2026-07-12T14:20:00Z" },
                    { course_id: 102, title: "Làm chủ Vue.js 3 trong 30 ngày", instructor_name: "Nguyễn Anh Hồng", sales_count: 172, enrollment_count: 980, completed_count: 245, completion_rate: 25.0, gross_revenue: "51600000.00", last_paid_at: "2026-07-12T19:15:00Z" },
                    { course_id: 104, title: "Tailwind CSS từ Zero đến Hero", instructor_name: "Lê Thị Nga", sales_count: 150, enrollment_count: 1240, completed_count: 496, completion_rate: 40.0, gross_revenue: "30000000.00", last_paid_at: "2026-07-11T16:45:00Z" }
                ]
            }
        },
        top_instructors: {
            data: {
                items: [
                    { instructor_id: 502, full_name: "Nguyễn Anh Hồng", email: "hong.na@mindhub.edu.vn", total_courses: 2, published_courses: 2, sales_count: 180, enrollment_count: 1200, completed_enrollments: 360, completion_rate: 30.0, gross_revenue: "54000000.00", instructor_amount: "37800000.00", last_active_at: "2026-07-12T19:15:00Z" },
                    { instructor_id: 501, full_name: "Trần Văn Hoàng", email: "hoang.tv@mindhub.edu.vn", total_courses: 3, published_courses: 2, sales_count: 250, enrollment_count: 1950, completed_enrollments: 585, completion_rate: 30.0, gross_revenue: "75000000.00", instructor_amount: "52500000.00", last_active_at: "2026-07-12T20:30:00Z" },
                    { instructor_id: 503, full_name: "Phạm Minh Đức", email: "duc.pm@mindhub.edu.vn", total_courses: 5, published_courses: 4, sales_count: 140, enrollment_count: 1050, completed_enrollments: 262, completion_rate: 25.0, gross_revenue: "49000000.00", instructor_amount: "34300000.00", last_active_at: "2026-07-12T15:30:00Z" },
                    { instructor_id: 504, full_name: "Lê Thị Nga", email: "nga.lt@mindhub.edu.vn", total_courses: 1, published_courses: 1, sales_count: 88, enrollment_count: 1100, completed_enrollments: 440, completion_rate: 40.0, gross_revenue: "17600000.00", instructor_amount: "12320000.00", last_active_at: "2026-07-11T16:45:00Z" }
                ]
            }
        }
    },
    "thisMonth": {
        dashboard: {
            data: {
                summary: {
                    total_users: 1510,
                    total_learners: 1310,
                    total_instructors: 200,
                    total_courses: 96,
                    total_published_courses: 88,
                    total_orders: 780,
                    paid_orders: 710,
                    total_enrollments: 4550,
                    completed_enrollments: 1729,
                    completion_rate: 38.0
                },
                revenue: {
                    gross_amount: "450200000.00",
                    instructor_amount: "315140000.00",
                    platform_fee_amount: "135060000.00"
                },
                course_status: {
                    draft: 3,
                    pending_review: 8,
                    approved: 12,
                    rejected: 1,
                    published: 68,
                    hidden: 4
                },
                user_status: {
                    active: 1380,
                    inactive: 100,
                    locked: 30
                },
                withdrawal_summary: {
                    pending_count: 2,
                    approved_count: 1,
                    pending_amount: "22000000.00",
                    approved_amount: "5000000.00",
                    paid_amount: "160000000.00"
                },
                action_required: {
                    pending_course_reviews: 4,
                    pending_instructor_upgrades: 2,
                    pending_withdrawals: 1,
                    pending_payout_accounts: 2
                },
                recent: {
                    latest_orders: [
                        {
                            id: 1001,
                            order_code: "ORD1001",
                            amount: "400000.00",
                            status: "paid",
                            paid_at: "2026-07-12T20:30:00Z",
                            user: { id: 301, full_name: "Nguyễn Văn A" },
                            course: { id: 101, title: "Lập trình Laravel căn bản", slug: "lap-trinh-laravel-can-ban" }
                        }
                    ],
                    latest_courses: [
                        { id: 201, title: "Lập trình React Native", instructor_name: "Trần Văn Hoàng", status: "published", published_at: "2026-07-12T18:00:00Z" }
                    ]
                }
            }
        },
        revenue_report: {
            data: {
                summary: {
                    total_gross_amount: "450200000.00",
                    total_instructor_amount: "315140000.00",
                    total_platform_fee_amount: "135060000.00"
                },
                items: [
                    { date: "Tuần 1", gross_amount: "90000000.00", instructor_amount: "63000000.00", platform_fee_amount: "27000000.00" },
                    { date: "Tuần 2", gross_amount: "110000000.00", instructor_amount: "77000000.00", platform_fee_amount: "33000000.00" },
                    { date: "Tuần 3", gross_amount: "120000000.00", instructor_amount: "84000000.00", platform_fee_amount: "36000000.00" },
                    { date: "Tuần 4", gross_amount: "130200000.00", instructor_amount: "91140000.00", platform_fee_amount: "39060000.00" }
                ]
            }
        },
        top_courses: {
            data: {
                summary: {
                    total_courses: 4
                },
                items: [
                    { course_id: 101, title: "Lập trình Laravel căn bản", instructor_name: "Trần Văn Hoàng", sales_count: 310, enrollment_count: 1850, completed_count: 555, completion_rate: 30.0, gross_revenue: "93000000.00", last_paid_at: "2026-07-12T20:30:00Z" },
                    { course_id: 103, title: "Thiết kế hệ thống lớn (System Design)", instructor_name: "Phạm Minh Đức", sales_count: 240, enrollment_count: 990, completed_count: 198, completion_rate: 20.0, gross_revenue: "84000000.00", last_paid_at: "2026-07-12T14:20:00Z" },
                    { course_id: 102, title: "Làm chủ Vue.js 3 trong 30 ngày", instructor_name: "Nguyễn Anh Hồng", sales_count: 220, enrollment_count: 1100, completed_count: 275, completion_rate: 25.0, gross_revenue: "66000000.00", last_paid_at: "2026-07-12T19:15:00Z" },
                    { course_id: 104, title: "Tailwind CSS từ Zero đến Hero", instructor_name: "Lê Thị Nga", sales_count: 180, enrollment_count: 1410, completed_count: 564, completion_rate: 40.0, gross_revenue: "36000000.00", last_paid_at: "2026-07-11T16:45:00Z" }
                ]
            }
        },
        top_instructors: {
            data: {
                items: [
                    { instructor_id: 501, full_name: "Trần Văn Hoàng", email: "hoang.tv@mindhub.edu.vn", total_courses: 3, published_courses: 2, sales_count: 250, enrollment_count: 1950, completed_enrollments: 585, completion_rate: 30.0, gross_revenue: "75000000.00", instructor_amount: "52500000.00", last_active_at: "2026-07-12T20:30:00Z" },
                    { instructor_id: 502, full_name: "Nguyễn Anh Hồng", email: "hong.na@mindhub.edu.vn", total_courses: 2, published_courses: 2, sales_count: 180, enrollment_count: 1200, completed_enrollments: 360, completion_rate: 30.0, gross_revenue: "54000000.00", instructor_amount: "37800000.00", last_active_at: "2026-07-12T19:15:00Z" },
                    { instructor_id: 503, full_name: "Phạm Minh Đức", email: "duc.pm@mindhub.edu.vn", total_courses: 5, published_courses: 4, sales_count: 140, enrollment_count: 1050, completed_enrollments: 262, completion_rate: 25.0, gross_revenue: "49000000.00", instructor_amount: "34300000.00", last_active_at: "2026-07-12T15:30:00Z" },
                    { instructor_id: 504, full_name: "Lê Thị Nga", email: "nga.lt@mindhub.edu.vn", total_courses: 1, published_courses: 1, sales_count: 88, enrollment_count: 1100, completed_enrollments: 440, completion_rate: 40.0, gross_revenue: "17600000.00", instructor_amount: "12320000.00", last_active_at: "2026-07-11T16:45:00Z" }
                ]
            }
        }
    },
    "thisYear": {
        dashboard: {
            data: {
                summary: {
                    total_users: 4200,
                    total_learners: 3850,
                    total_instructors: 350,
                    total_courses: 210,
                    total_published_courses: 188,
                    total_orders: 5400,
                    paid_orders: 5120,
                    total_enrollments: 12400,
                    completed_enrollments: 4960,
                    completion_rate: 40.0
                },
                revenue: {
                    gross_amount: "2450000000.00",
                    instructor_amount: "1715000000.00",
                    platform_fee_amount: "735000000.00"
                },
                course_status: {
                    draft: 12,
                    pending_review: 22,
                    approved: 20,
                    rejected: 5,
                    published: 147,
                    hidden: 4
                },
                user_status: {
                    active: 3800,
                    inactive: 300,
                    locked: 100
                },
                withdrawal_summary: {
                    pending_count: 8,
                    approved_count: 4,
                    pending_amount: "45000000.00",
                    approved_amount: "25000000.00",
                    paid_amount: "1250000000.00"
                },
                action_required: {
                    pending_course_reviews: 22,
                    pending_instructor_upgrades: 8,
                    pending_withdrawals: 8,
                    pending_payout_accounts: 15
                },
                recent: {
                    latest_orders: [
                        {
                            id: 1001,
                            order_code: "ORD1001",
                            amount: "400000.00",
                            status: "paid",
                            paid_at: "2026-07-12T20:30:00Z",
                            user: { id: 301, full_name: "Nguyễn Văn A" },
                            course: { id: 101, title: "Lập trình Laravel căn bản", slug: "lap-trinh-laravel-can-ban" }
                        }
                    ],
                    latest_courses: [
                        { id: 201, title: "Lập trình React Native", instructor_name: "Trần Văn Hoàng", status: "published", published_at: "2026-07-12T18:00:00Z" }
                    ]
                }
            }
        },
        revenue_report: {
            data: {
                summary: {
                    total_gross_amount: "2450000000.00",
                    total_instructor_amount: "1715000000.00",
                    total_platform_fee_amount: "735000000.00"
                },
                items: [
                    { date: "Thg 1", gross_amount: "120000000.00", instructor_amount: "84000000.00", platform_fee_amount: "36000000.00" },
                    { date: "Thg 2", gross_amount: "140000000.00", instructor_amount: "98000000.00", platform_fee_amount: "42000000.00" },
                    { date: "Thg 3", gross_amount: "180000000.00", instructor_amount: "126000000.00", platform_fee_amount: "54000000.00" },
                    { date: "Thg 4", gross_amount: "170000000.00", instructor_amount: "119000000.00", platform_fee_amount: "51000000.00" },
                    { date: "Thg 5", gross_amount: "210000000.00", instructor_amount: "147000000.00", platform_fee_amount: "63000000.00" },
                    { date: "Thg 6", gross_amount: "230000000.00", instructor_amount: "161000000.00", platform_fee_amount: "69000000.00" },
                    { date: "Thg 7", gross_amount: "220000000.00", instructor_amount: "154000000.00", platform_fee_amount: "66000000.00" },
                    { date: "Thg 8", gross_amount: "250000000.00", instructor_amount: "175000000.00", platform_fee_amount: "75000000.00" },
                    { date: "Thg 9", gross_amount: "270000000.00", instructor_amount: "189000000.00", platform_fee_amount: "81000000.00" },
                    { date: "Thg 10", gross_amount: "290000000.00", instructor_amount: "203000000.00", platform_fee_amount: "87000000.00" },
                    { date: "Thg 11", gross_amount: "310000000.00", instructor_amount: "217000000.00", platform_fee_amount: "93000000.00" },
                    { date: "Thg 12", gross_amount: "260000000.00", instructor_amount: "182000000.00", platform_fee_amount: "78000000.00" }
                ]
            }
        },
        top_courses: {
            data: {
                summary: {
                    total_courses: 4
                },
                items: [
                    { course_id: 101, title: "Lập trình Laravel căn bản", instructor_name: "Trần Văn Hoàng", sales_count: 1250, enrollment_count: 5420, completed_count: 2168, completion_rate: 40.0, gross_revenue: "375000000.00", last_paid_at: "2026-07-12T20:30:00Z" },
                    { course_id: 103, title: "Thiết kế hệ thống lớn (System Design)", instructor_name: "Phạm Minh Đức", sales_count: 980, enrollment_count: 4110, completed_count: 1233, completion_rate: 30.0, gross_revenue: "343000000.00", last_paid_at: "2026-07-12T14:20:00Z" },
                    { course_id: 102, title: "Làm chủ Vue.js 3 trong 30 ngày", instructor_name: "Nguyễn Anh Hồng", sales_count: 840, enrollment_count: 3120, completed_count: 936, completion_rate: 30.0, gross_revenue: "252000000.00", last_paid_at: "2026-07-12T19:15:00Z" },
                    { course_id: 104, title: "Tailwind CSS từ Zero đến Hero", instructor_name: "Lê Thị Nga", sales_count: 790, enrollment_count: 2980, completed_count: 1490, completion_rate: 50.0, gross_revenue: "158000000.00", last_paid_at: "2026-07-11T16:45:00Z" }
                ]
            }
        },
        top_instructors: {
            data: {
                items: [
                    { instructor_id: 501, full_name: "Trần Văn Hoàng", email: "hoang.tv@mindhub.edu.vn", total_courses: 5, published_courses: 4, sales_count: 1250, enrollment_count: 5420, completed_enrollments: 2168, completion_rate: 40.0, gross_revenue: "375000000.00", instructor_amount: "262500000.00", last_active_at: "2026-07-12T20:30:00Z" },
                    { instructor_id: 502, full_name: "Nguyễn Anh Hồng", email: "hong.na@mindhub.edu.vn", total_courses: 4, published_courses: 3, sales_count: 980, enrollment_count: 4110, completed_enrollments: 1233, completion_rate: 30.0, gross_revenue: "343000000.00", instructor_amount: "240100000.00", last_active_at: "2026-07-12T19:15:00Z" },
                    { instructor_id: 503, full_name: "Phạm Minh Đức", email: "duc.pm@mindhub.edu.vn", total_courses: 8, published_courses: 6, sales_count: 840, enrollment_count: 3120, completed_enrollments: 936, completion_rate: 30.0, gross_revenue: "252000000.00", instructor_amount: "176400000.00", last_active_at: "2026-07-12T15:30:00Z" },
                    { instructor_id: 504, full_name: "Lê Thị Nga", email: "nga.lt@mindhub.edu.vn", total_courses: 2, published_courses: 2, sales_count: 790, enrollment_count: 2980, completed_enrollments: 1490, completion_rate: 50.0, gross_revenue: "158000000.00", instructor_amount: "110600000.00", last_active_at: "2026-07-11T16:45:00Z" }
                ]
            }
        }
    },
    // Khoảng thời gian tùy chỉnh mặc định làm fallback
    "custom": {
        dashboard: {
            data: {
                summary: {
                    total_users: 1350,
                    total_learners: 1190,
                    total_instructors: 160,
                    total_courses: 88,
                    total_published_courses: 74,
                    total_orders: 410,
                    paid_orders: 370,
                    total_enrollments: 3800,
                    completed_enrollments: 1140,
                    completion_rate: 30.0
                },
                revenue: {
                    gross_amount: "240500000.00",
                    instructor_amount: "168350000.00",
                    platform_fee_amount: "72150000.00"
                },
                course_status: {
                    draft: 4,
                    pending_review: 10,
                    approved: 10,
                    rejected: 2,
                    published: 58,
                    hidden: 4
                },
                user_status: {
                    active: 1210,
                    inactive: 110,
                    locked: 30
                },
                withdrawal_summary: {
                    pending_count: 4,
                    approved_count: 2,
                    pending_amount: "16000000.00",
                    approved_amount: "10000000.00",
                    paid_amount: "95000000.00"
                },
                action_required: {
                    pending_course_reviews: 6,
                    pending_instructor_upgrades: 3,
                    pending_withdrawals: 4,
                    pending_payout_accounts: 5
                },
                recent: {
                    latest_orders: [
                        {
                            id: 1001,
                            order_code: "ORD1001",
                            amount: "400000.00",
                            status: "paid",
                            paid_at: "2026-07-12T20:30:00Z",
                            user: { id: 301, full_name: "Nguyễn Văn A" },
                            course: { id: 101, title: "Lập trình Laravel căn bản", slug: "lap-trinh-laravel-can-ban" }
                        }
                    ],
                    latest_courses: [
                        { id: 201, title: "Lập trình React Native", instructor_name: "Trần Văn Hoàng", status: "published", published_at: "2026-07-12T18:00:00Z" }
                    ]
                }
            }
        },
        revenue_report: {
            data: {
                summary: {
                    total_gross_amount: "240500000.00",
                    total_instructor_amount: "168350000.00",
                    total_platform_fee_amount: "72150000.00"
                },
                items: [
                    { date: "Giai đoạn", gross_amount: "240500000.00", instructor_amount: "168350000.00", platform_fee_amount: "72150000.00" }
                ]
            }
        },
        top_courses: {
            data: {
                summary: {
                    total_courses: 4
                },
                items: [
                    { course_id: 101, title: "Lập trình Laravel căn bản", instructor_name: "Trần Văn Hoàng", sales_count: 190, enrollment_count: 1400, completed_count: 420, completion_rate: 30.0, gross_revenue: "57000000.00", last_paid_at: "2026-07-12T20:30:00Z" },
                    { course_id: 102, title: "Làm chủ Vue.js 3 trong 30 ngày", instructor_name: "Nguyễn Anh Hồng", sales_count: 150, enrollment_count: 900, completed_count: 225, completion_rate: 25.0, gross_revenue: "45000000.00", last_paid_at: "2026-07-12T19:15:00Z" }
                ]
            }
        },
        top_instructors: {
            data: {
                items: [
                    { instructor_id: 501, full_name: "Trần Văn Hoàng", email: "hoang.tv@mindhub.edu.vn", total_courses: 3, published_courses: 2, sales_count: 250, enrollment_count: 1950, completed_enrollments: 585, completion_rate: 30.0, gross_revenue: "75000000.00", instructor_amount: "52500000.00", last_active_at: "2026-07-12T20:30:00Z" }
                ]
            }
        }
    }
};

/**
 * Giả lập API lấy dữ liệu dashboard dựa theo query params được truyền lên.
 * @param {Object} query Các tham số lọc: date_from, date_to, month, year
 * @returns {Object} Dữ liệu mock tương ứng
 */
export function getDashboardMockData({ date_from, date_to, month, year } = {}) {
    let result;
    // 1. Phân loại theo tham số để chọn preset
    if (date_from && date_to) {
        if (date_from === "2026-07-06" && date_to === "2026-07-12") {
            result = JSON.parse(JSON.stringify(mockDataPresets["7days"]));
        } else if (date_from === "2026-06-13" && date_to === "2026-07-12") {
            result = JSON.parse(JSON.stringify(mockDataPresets["30days"]));
        } else {
            // Tùy chọn khoảng ngày tùy chỉnh
            const customData = JSON.parse(JSON.stringify(mockDataPresets["custom"]));
            const start = new Date(date_from);
            const end = new Date(date_to);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const labels = [];
            const gross = [];
            const instructor = [];
            const platform = [];
            const steps = Math.min(diffDays, 10);
            const interval = Math.max(1, Math.floor(diffDays / steps));

            for (let i = 0; i < steps; i++) {
                const currentDate = new Date(start);
                currentDate.setDate(start.getDate() + i * interval);
                const dateStr = currentDate.toISOString().split("T")[0];
                labels.push(dateStr);
                const stepGross = Math.floor(10 + Math.random() * 20) * 1000000;
                const stepInst = Math.floor(stepGross * 0.7);
                const stepPlatform = stepGross - stepInst;
                gross.push(stepGross);
                instructor.push(stepInst);
                platform.push(stepPlatform);
            }

            customData.revenue_report.data.items = labels.map((date, idx) => ({
                date,
                gross_amount: gross[idx].toFixed(2),
                instructor_amount: instructor[idx].toFixed(2),
                platform_fee_amount: platform[idx].toFixed(2)
            }));

            const totalGross = gross.reduce((a, b) => a + b, 0);
            const totalInst = instructor.reduce((a, b) => a + b, 0);
            const totalPlatform = platform.reduce((a, b) => a + b, 0);

            customData.revenue_report.data.summary = {
                total_gross_amount: totalGross.toFixed(2),
                total_instructor_amount: totalInst.toFixed(2),
                total_platform_fee_amount: totalPlatform.toFixed(2)
            };

            result = customData;
        }
    } else if (month && year) {
        if (parseInt(month) === 7 && parseInt(year) === 2026) {
            result = JSON.parse(JSON.stringify(mockDataPresets["thisMonth"]));
        } else {
            const monthData = JSON.parse(JSON.stringify(mockDataPresets["thisMonth"]));
            monthData.revenue_report.data.items.forEach((item, idx) => {
                item.date = `Tuần ${idx + 1} (${month}/${year})`;
            });
            result = monthData;
        }
    } else if (year) {
        if (parseInt(year) === 2026) {
            result = JSON.parse(JSON.stringify(mockDataPresets["thisYear"]));
        } else {
            const yearData = JSON.parse(JSON.stringify(mockDataPresets["thisYear"]));
            yearData.revenue_report.data.items.forEach(item => {
                const parts = item.date.split(" ");
                if (parts.length === 2) {
                    item.date = `${parts[0]} ${parts[1]}/${year}`;
                }
            });
            result = yearData;
        }
    } else {
        result = JSON.parse(JSON.stringify(mockDataPresets["7days"]));
    }

    // 2. Tính toán và ghi đè thống kê động từ repository
    const activeUsersList = getUsers().filter(u => u.deleted_at === null);
    const activeCoursesList = getCourses();
    const activeOrdersList = getOrders();
    const activeRevenuesList = getRevenues();
    const activeWithdrawalsList = getWithdrawals();
    const activeUpgradesList = getInstructorUpgrades();
    const activeEnrollmentsList = getEnrollments();

    const summary = {
        total_users: activeUsersList.length,
        total_learners: activeUsersList.filter(u => u.role === "learner").length,
        total_instructors: activeUsersList.filter(u => u.role === "instructor").length,
        total_courses: activeCoursesList.length,
        total_published_courses: activeCoursesList.filter(c => c.status === "published").length,
        total_orders: activeOrdersList.length,
        paid_orders: activeOrdersList.filter(o => o.payment_status === "paid").length,
        total_enrollments: activeEnrollmentsList.length,
        completed_enrollments: activeEnrollmentsList.filter(e => e.status === "completed").length,
        completion_rate: activeEnrollmentsList.length > 0 
            ? parseFloat(((activeEnrollmentsList.filter(e => e.status === "completed").length / activeEnrollmentsList.length) * 100).toFixed(1))
            : 0
    };

    const revenue = {
        gross_amount: activeRevenuesList.reduce((sum, r) => sum + r.gross_amount, 0).toFixed(2),
        instructor_amount: activeRevenuesList.reduce((sum, r) => sum + r.instructor_amount, 0).toFixed(2),
        platform_fee_amount: activeRevenuesList.reduce((sum, r) => sum + r.platform_fee_amount, 0).toFixed(2)
    };

    const course_status = {
        draft: activeCoursesList.filter(c => c.status === "draft").length,
        pending_review: activeCoursesList.filter(c => c.status === "pending_review").length,
        approved: activeCoursesList.filter(c => c.status === "approved").length,
        rejected: activeCoursesList.filter(c => c.status === "rejected").length,
        published: activeCoursesList.filter(c => c.status === "published").length,
        hidden: activeCoursesList.filter(c => c.status === "hidden").length
    };

    const user_status = {
        active: activeUsersList.filter(u => u.status === "active" && !u.locked).length,
        inactive: activeUsersList.filter(u => u.status === "inactive" && !u.locked).length,
        locked: activeUsersList.filter(u => u.locked || u.status === "locked").length
    };

    const withdrawal_summary = {
        pending_count: activeWithdrawalsList.filter(w => w.status === "pending").length,
        approved_count: activeWithdrawalsList.filter(w => w.status === "approved").length,
        pending_amount: activeWithdrawalsList.filter(w => w.status === "pending").reduce((sum, w) => sum + w.amount, 0).toFixed(2),
        approved_amount: activeWithdrawalsList.filter(w => w.status === "approved").reduce((sum, w) => sum + w.amount, 0).toFixed(2),
        paid_amount: activeWithdrawalsList.filter(w => w.status === "paid").reduce((sum, w) => sum + w.amount, 0).toFixed(2)
    };

    const action_required = {
        pending_course_reviews: course_status.pending_review,
        pending_instructor_upgrades: activeUpgradesList.filter(a => a.application_status === "pending").length,
        pending_withdrawals: withdrawal_summary.pending_count,
        system_alerts: 0
    };

    // Override statistics
    result.dashboard.data.summary = summary;
    result.dashboard.data.revenue = revenue;
    result.dashboard.data.course_status = course_status;
    result.dashboard.data.user_status = user_status;
    result.dashboard.data.withdrawal_summary = withdrawal_summary;
    result.dashboard.data.action_required = action_required;

    return result;
}
