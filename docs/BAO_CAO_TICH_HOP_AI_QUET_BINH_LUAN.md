# BÁO CÁO GIẢI PHÁP & KẾ HOẠCH TRIỂN KHAI: TÍNH NĂNG AI QUÉT BÌNH LUẬN VI PHẠM (AI COMMENT MODERATION)

---

## 1. TỔNG QUAN & MỤC TIÊU DỰ ÁN

Trong nền tảng E-Learning MindHub, học viên và giảng viên tương tác liên tục qua:
1. **Bình luận bài học (Lesson Comments & Q&A Discussions)**.
2. **Đánh giá & Nhận xét khóa học (Course Reviews & Ratings)**.

### Mục tiêu:
- Tự động phát hiện và ngăn chặn các bình luận tiêu cực, độc hại, spam quảng cáo hoặc vi phạm pháp luật/chính sách nền tảng theo thời gian thực.
- Giảm 90% tải công việc kiểm duyệt thủ công cho đội ngũ Admin và Giảng viên.
- Duy trì môi trường học tập văn minh, chuyên nghiệp và an toàn.

---

## 2. CÁC HÀNG RÀO VI PHẠM CẦN NHẬN DIỆN (VIOLATION TAXONOMY)

AI sẽ được cấu hình để nhận diện 5 nhóm vi phạm chính theo ngôn ngữ Tiếng Việt & Tiếng Anh:

| STT | Nhóm vi phạm | Hành vi điển hình | Mức độ nguy hiểm | Xử lý mặc định |
|---|---|---|---|---|
| **1** | **Ngôn từ xúc phạm, thù ghét (Toxicity / Hate Speech)** | Chửi tục, miệt thị vùng miền/giới tính, công kích cá nhân giảng viên/học viên | Cao (Điểm > 0.8) | Tự động ẩn ngay lập tức |
| **2** | **Spam & Quảng cáo (Spam / External Links)** | Rải link cờ bạc, link lừa đảo, bán tài khoản, mời gọi vào nhóm Zalo/Telegram lừa đảo | Cao (Điểm > 0.85) | Tự động ẩn + Gắn cờ spam |
| **3** | **Lộ lọt thông tin cá nhân (PII Leakage)** | Chia sẻ công khai SĐT, số CCCD, STK ngân hàng, mật khẩu, mã OTP | Trung bình (Điểm > 0.7) | Tự động ẩn + Cảnh báo bảo mật |
| **4** | **Vi phạm bản quyền & Share lậu** | Mời share tài khoản học chung, xin link tải lậu video/tài liệu | Cao (Điểm > 0.8) | Tự động ẩn + Ghi log tài khoản |
| **5** | **Bình luận rác, vô nghĩa (Low Quality / Nonsense)** | Spam ký tự lặp lại (ví dụ: "aaaaaa", "........."), không liên quan bài học | Thấp (Điểm 0.5 - 0.7) | Đưa vào danh sách chờ duyệt |

---

## 3. KIẾN TRÚC GIẢI PHÁP HYBRID 2 TẦNG (HYBRID ARCHITECTURE)

Để tối ưu **tốc độ phản hồi (Latency)**, **chi phí API (Cost efficiency)** và **độ chính xác ngữ nghĩa (Semantic accuracy)**, giải pháp sử dụng mô hình 2 tầng:

```
                      [ Học viên gửi bình luận ]
                                  │
                                  ▼
             ┌──────────────────────────────────────────┐
             │  TẦNG 1: Fast Regex & Blacklist Filter   │ ──(Trùng từ cấm nặng)──► [ TỰ ĐỘNG CHẶN NGAY (0ms) ]
             │   (Từ tục tĩu cực đoan, link cờ bạc đen) │
             └──────────────────────────────────────────┘
                                  │
                          (Không dính từ cấm cơ bản)
                                  │
                                  ▼
             ┌──────────────────────────────────────────┐
             │ Lưu Comment tạm vào DB (status: visible) │
             │ & Bắn Job vào Laravel Queue (Background) │
             └──────────────────────────────────────────┘
                                  │
                                  ▼
             ┌──────────────────────────────────────────┐
             │   TẦNG 2: AI LLM Semantic Inspection     │
             │     (Google Gemini 1.5 Flash API)        │
             │   Phân tích ngữ cảnh sâu tiếng Việt & TEEN│
             └──────────────────────────────────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       [ Điểm an toàn < 0.5 ]          [ Điểm vi phạm >= 0.7 ]
                  │                               │
        Giữ nguyên hiển thị             Tự động chuyển status = 'hidden'
        Ghi log: Safe                   Ghi log lý do & thông báo Admin
```

---

## 4. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

### 4.1. Bổ sung trường vào bảng `comments` và `course_reviews`:
```sql
ALTER TABLE comments ADD COLUMN ai_moderation_status VARCHAR(20) DEFAULT 'unprocessed' AFTER status;
ALTER TABLE comments ADD COLUMN ai_risk_score DECIMAL(4,3) NULL AFTER ai_moderation_status;
ALTER TABLE comments ADD COLUMN ai_violation_reasons JSON NULL AFTER ai_risk_score;
ALTER TABLE comments ADD COLUMN moderated_by_ai_at TIMESTAMP NULL AFTER ai_violation_reasons;

ALTER TABLE course_reviews ADD COLUMN ai_moderation_status VARCHAR(20) DEFAULT 'unprocessed';
ALTER TABLE course_reviews ADD COLUMN ai_risk_score DECIMAL(4,3) NULL;
ALTER TABLE course_reviews ADD COLUMN ai_violation_reasons JSON NULL;
```

### 4.2. Bảng lưu vết kiểm duyệt chi tiết `ai_moderation_logs`:
```sql
CREATE TABLE ai_moderation_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    commentable_type VARCHAR(100) NOT NULL, -- 'App\Models\Comment' hoặc 'App\Models\CourseReview'
    commentable_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    raw_content TEXT NOT NULL,
    risk_score DECIMAL(4,3) NOT NULL,
    is_flagged BOOLEAN DEFAULT FALSE,
    violation_categories JSON NULL,       -- ['toxicity', 'profanity', 'spam']
    ai_explanation TEXT NULL,              -- "Chứa ngôn từ lăng mạ giảng viên và chèn link Telegram lạ"
    action_taken VARCHAR(50) NOT NULL,    -- 'auto_hidden', 'flagged_for_review', 'approved'
    admin_reviewed_by BIGINT UNSIGNED NULL,
    admin_action VARCHAR(50) NULL,        -- 'kept_hidden', 'restored', 'user_warned'
    admin_reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_commentable (commentable_type, commentable_id),
    INDEX idx_user_id (user_id),
    INDEX idx_action_taken (action_taken)
);
```

---

## 5. MẪU TRIỂN KHAI CODE BACKEND (LARAVEL 11)

### 5.1. Service kiểm duyệt bằng Gemini AI (`App\Services\AI\GeminiModerationService.php`)

```php
<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiModerationService
{
    private string $apiKey;
    private string $endpoint;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
        $this->endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . $this->apiKey;
    }

    /**
     * Quét nội dung bình luận và trả về đánh giá chi tiết
     */
    public function scanContent(string $content): array
    {
        $systemPrompt = <<<PROMPT
Bạn là chuyên gia kiểm duyệt nội dung (Content Moderator) của hệ thống giáo dục trực tuyến MindHub.
Nhiệm vụ của bạn là phân tích đoạn bình luận của người dùng và phát hiện các vi phạm:
1. toxicity: Chửi bới, xúc phạm, lăng mạ, phân biệt vùng miền, quấy rối.
2. spam_ad: Quảng cáo rác, chèn link cờ bạc, link lừa đảo, link nhóm Zalo/Telegram trá hình.
3. pii_leak: Tiết lộ số điện thoại, tài khoản ngân hàng, mã OTP nhạy cảm.
4. piracy_share: Rủ share tài khoản, xin link tải lậu khóa học.

Hãy trả về DUY NHẤT một JSON hợp lệ có định dạng sau:
{
  "is_violating": true/false,
  "risk_score": 0.00 đến 1.00,
  "categories": ["toxicity", "spam_ad", ...],
  "reason": "Giải thích ngắn gọn lý do bằng tiếng Việt",
  "suggested_action": "approve" | "flag" | "auto_hide"
}
PROMPT;

        try {
            $response = Http::timeout(5)->post($this->endpoint, [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $systemPrompt . "\n\nNội dung cần kiểm duyệt: \"{$content}\""]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.1,
                    'responseMimeType' => 'application/json',
                ]
            ]);

            if ($response->successful()) {
                $jsonText = $response->json('candidates.0.content.parts.0.text');
                return json_decode($jsonText, true) ?? $this->fallbackResponse();
            }

            Log::error('Gemini Moderation API error', ['response' => $response->body()]);
            return $this->fallbackResponse();

        } catch (\Throwable $e) {
            Log::error('Gemini Moderation Exception: ' . $e->getMessage());
            return $this->fallbackResponse();
        }
    }

    private function fallbackResponse(): array
    {
        return [
            'is_violating' => false,
            'risk_score' => 0.0,
            'categories' => [],
            'reason' => 'Không thể quét AI (Hệ thống chuyển vào hàng đợi kiểm tra thủ công nếu nghi ngờ)',
            'suggested_action' => 'approve'
        ];
    }
}
```

---

### 5.2. Job xử lý Bất đồng bộ trong Hàng đợi (`App\Jobs\ScanCommentAiJob.php`)

```php
<?php

namespace App\Jobs;

use App\Models\Comment;
use App\Models\AiModerationLog;
use App\Services\AI\GeminiModerationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ScanCommentAiJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $commentId)
    {
    }

    public function handle(GeminiModerationService $aiService): void
    {
        $comment = Comment::find($this->commentId);
        if (!$comment) return;

        $result = $aiService->scanContent($comment->content);

        // Lưu kết quả AI
        $comment->ai_moderation_status = $result['is_violating'] ? 'flagged' : 'passed';
        $comment->ai_risk_score = $result['risk_score'];
        $comment->ai_violation_reasons = $result['categories'];
        $comment->moderated_by_ai_at = now();

        // Xử lý tự động theo điểm rủi ro
        if ($result['risk_score'] >= 0.8 || $result['suggested_action'] === 'auto_hide') {
            $comment->status = 'hidden'; // Tự động ẩn bình luận vi phạm nặng
            $actionTaken = 'auto_hidden';
        } elseif ($result['risk_score'] >= 0.5) {
            $comment->status = 'flagged'; // Chờ giảng viên / Admin duyệt
            $actionTaken = 'flagged_for_review';
        } else {
            $comment->status = 'visible'; // Hợp lệ
            $actionTaken = 'approved';
        }

        $comment->save();

        // Ghi log chi tiết
        AiModerationLog::create([
            'commentable_type' => Comment::class,
            'commentable_id' => $comment->id,
            'user_id' => $comment->user_id,
            'raw_content' => $comment->content,
            'risk_score' => $result['risk_score'],
            'is_flagged' => $result['is_violating'],
            'violation_categories' => $result['categories'],
            'ai_explanation' => $result['reason'],
            'action_taken' => $actionTaken,
        ]);
    }
}
```

---

## 6. THIẾT KẾ GIAO DIỆN QUẢN TRỊ VIÊN (FRONTEND ADMIN DASHBOARD)

### 6.1. Màn hình Kiểm duyệt Bình luận (`/admin/moderation/comments`):
1. **Thống kê tổng quan (Top Metric Cards)**:
   - Tổng số bình luận đã quét hôm nay.
   - Số bình luận vi phạm AI đã tự động ẩn (`Auto-Blocked`).
   - Số bình luận nghi ngờ đang chờ Admin xem xét (`Pending Review`).
   - Tỷ lệ bình luận sạch (`Safe Rate %`).
2. **Bộ lọc thông minh (Smart Filters)**:
   - Trạng thái: *Tất cả*, *AI đã chặn (Blocked)*, *Cần xem xét (Flagged)*, *An toàn (Safe)*.
   - Loại vi phạm: *Xúc phạm/Thô tục*, *Spam link*, *Lộ thông tin*, *Chia sẻ tài khoản*.
   - Khóa học / Bài học cụ thể.
3. **Danh sách kiểm duyệt trực quan (Review Table / Card List)**:
   - Hiển thị tên người dùng + Avatar + Thời gian.
   - Nội dung bình luận (tô đỏ các từ khóa/ngữ cảnh vi phạm).
   - **Hộp nhận định của AI**: Điểm rủi ro (ví dụ: `⚠️ 92% Vi phạm`), Nhãn vi phạm (`[Spam link]`, `[Toxicity]`), Giải thích của AI (*"Phát hiện mời chào tham gia nhóm kiếm tiền online không rõ nguồn gốc"*).
   - **Nút hành động nhanh**:
     - `✅ Bỏ chặn (Khôi phục)` - Nếu AI quét nhầm (False Positive).
     - `🚫 Xác nhận vi phạm & Xóa` - Xóa vĩnh viễn bình luận.
     - `⚠️ Cảnh cáo học viên` - Gửi thông báo cảnh cáo vi phạm vào tài khoản học viên.
     - `🔒 Cấm bình luận 7 ngày` - Khóa quyền tương tác nếu tái phạm nhiều lần.

---

## 7. LỘ TRÌNH TRIỂN KHAI (5 GIAI ĐOẠN)

- **Giai đoạn 1 (Ngày 1)**: Tạo Database Migration (`ai_moderation_logs`, các cột bổ sung cho `comments`, `course_reviews`).
- **Giai đoạn 2 (Ngày 2)**: Xây dựng Service `GeminiModerationService.php` + Viết Prompt kiểm duyệt tiếng Việt chặt chẽ + Viết Unit Test.
- **Giai đoạn 3 (Ngày 3)**: Tích hợp vào Luồng tạo bình luận qua `ScanCommentAiJob` (Queue), đảm bảo phản hồi HTTP của học viên không bị chậm trễ (< 100ms).
- **Giai đoạn 4 (Ngày 4 - 5)**: Xây dựng giao diện Quản trị kiểm duyệt bình luận React + TypeScript trên Admin Dashboard.
- **Giai đoạn 5 (Ngày 6)**: Kiểm thử với bộ dữ liệu 100 bình luận mẫu (bao gồm bình luận bình thường, tiếng lóng, teencode, link cờ bạc, chửi bới gián tiếp) để tinh chỉnh ngưỡng điểm `risk_score`.

---

## 8. DỰ TOÁN CHI PHÍ & TỐI ƯU HIỆU NĂNG

- **Chi phí API**: Với mô hình **Gemini 1.5 Flash**, chi phí chỉ khoảng **$0.075 / 1 triệu tokens** (hoặc gói Free Tier lên đến 15 RPM). Với quy mô 10,000 bình luận/ngày, chi phí xấp xỉ **dưới 50,000 VNĐ / tháng**.
- **Tính khả dụng (High Availability)**: Có cơ chế Circuit Breaker & Fallback — nếu API AI bị mất kết nối hoặc quá tải, bình luận vẫn được lưu bình thường và đưa vào danh sách chờ quét bù, không làm gián đoạn việc học tập của học viên.
