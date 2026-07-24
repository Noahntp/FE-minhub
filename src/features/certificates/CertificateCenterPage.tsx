import React, { useState } from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { Award, Download, ExternalLink, Share2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { UserCertificate } from '@/shared/types';
import { toast } from 'sonner';

const MOCK_CERTIFICATES: UserCertificate[] = [
  {
    id: 'cert-1',
    userId: 'u-01',
    userName: 'Student Test',
    courseId: 'course-1',
    courseTitle: 'Chinh Phục React 19 & Next.js 15',
    instructorName: 'Dr. Lê Quốc Khánh',
    issueDate: '2026-06-15',
    verificationCode: 'MH-R19-98A7B2'
  },
  {
    id: 'cert-2',
    userId: 'u-01',
    userName: 'Student Test',
    courseId: 'course-3',
    courseTitle: 'Figma to Code: UI/UX Masterclass',
    instructorName: 'Sarah Nguyễn',
    issueDate: '2026-04-20',
    verificationCode: 'MH-FGC-33X9P1'
  }
];

export default function CertificateCenterPage() {
  const [certificates] = useState<UserCertificate[]>(MOCK_CERTIFICATES);

  const handleDownload = (cert: UserCertificate) => {
    toast.success(`Đang tải xuống chứng chỉ: ${cert.courseTitle}`);
  };

  const handleShare = (cert: UserCertificate) => {
    toast.success(`Đã sao chép liên kết chứng chỉ: ${cert.verificationCode}`);
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-black font-suisseintl tracking-tight">Chứng chỉ của tôi</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý và chia sẻ các thành tựu bạn đã đạt được trên MindHub.
          </p>
        </div>

        {certificates.length === 0 ? (
          <EmptyState
            icon={Award}
            title="Chưa có chứng chỉ nào"
            description="Hoàn thành 100% khóa học để nhận chứng chỉ tốt nghiệp từ MindHub nhé!"
            actionLabel="Khám phá khóa học"
            onAction={() => window.location.href = '/courses'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-card border rounded-3xl overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                <div className="aspect-[4/3] bg-muted relative p-6 flex flex-col items-center justify-center border-b text-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0"></div>
                  <div className="relative z-10 w-full h-full border-8 border-double border-primary/20 bg-background/80 flex flex-col items-center justify-center p-4">
                    <Award className="w-12 h-12 text-primary mb-2" />
                    <h3 className="font-serif font-bold text-xl text-foreground mb-1 uppercase tracking-widest">Certificate</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">of Completion</p>
                    <p className="font-bold text-sm line-clamp-2 text-foreground/90">
                      {cert.courseTitle}
                    </p>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {cert.courseTitle}
                  </h4>
                  <div className="text-sm text-muted-foreground mb-4 space-y-1">
                    <p>Cấp ngày: <strong>{new Date(cert.issueDate).toLocaleDateString('vi-VN')}</strong></p>
                    <p>Giảng viên: {cert.instructorName}</p>
                    <p>Mã xác thực: <span className="font-mono text-xs bg-muted px-1 rounded">{cert.verificationCode}</span></p>
                  </div>
                  
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => handleDownload(cert)}>
                      <Download className="w-4 h-4" /> Tải về
                    </Button>
                    <Button variant="secondary" size="sm" className="w-full gap-2" onClick={() => handleShare(cert)}>
                      <Share2 className="w-4 h-4" /> Chia sẻ
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
