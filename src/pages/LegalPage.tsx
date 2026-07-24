import React from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';

export default function LegalPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-black font-suisseintl tracking-tight mb-8">Trung tâm Hỗ trợ & Chính sách</h1>
        
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm prose prose-stone max-w-none">
          <h2>1. Điều khoản sử dụng</h2>
          <p>
            Chào mừng bạn đến với MindHub. Bằng việc sử dụng hệ thống, bạn đồng ý tuân thủ các quy định về bản quyền khóa học, 
            không sao chép và phát tán nội dung dưới mọi hình thức.
          </p>
          
          <h2>2. Chính sách hoàn tiền 100%</h2>
          <p>
            Chúng tôi cam kết hoàn tiền 100% trong vòng 7 ngày kể từ ngày mua khóa học nếu bạn không hài lòng về chất lượng nội dung 
            hoặc không phù hợp với nhu cầu học tập của bạn. Yêu cầu hoàn tiền cần được gửi qua email hỗ trợ với lý do cụ thể.
          </p>

          <h2>3. Câu hỏi thường gặp (FAQ)</h2>
          <h3>Tôi có thể học trên thiết bị di động không?</h3>
          <p>Có, nền tảng MindHub được thiết kế Responsive hoàn toàn và bạn có thể học trên mọi thiết bị có kết nối Internet.</p>
          
          <h3>Chứng chỉ có giá trị không?</h3>
          <p>Chứng chỉ của MindHub chứng nhận bạn đã hoàn thành và vượt qua các bài kiểm tra thực tế, có giá trị đính kèm vào CV khi xin việc.</p>

          <h2>4. Liên hệ hỗ trợ</h2>
          <ul>
            <li><strong>Email:</strong> support@mindhub.edu.vn</li>
            <li><strong>Hotline:</strong> 1900 6868 (Hoạt động 24/7)</li>
            <li><strong>Địa chỉ:</strong> Khu Công Nghệ Cao, Quận 9, TP. Hồ Chí Minh</li>
          </ul>
        </div>
      </div>
    </PageTransition>
  );
}
