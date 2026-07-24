import React, { useState } from 'react';
import { User, Bell, Shield, CreditCard } from 'lucide-react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { toast } from 'sonner';

export default function SettingsPage() {
  const handleSave = () => {
    toast.success('Cập nhật thành công', {
      description: 'Các thay đổi của bạn đã được lưu vào hệ thống.',
    });
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-black font-suisseintl tracking-tight mb-8">Cài đặt hệ thống</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 space-y-2 shrink-0">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold">
              <User className="w-5 h-5" />
              Hồ sơ cá nhân
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg font-semibold text-muted-foreground transition-colors">
              <Bell className="w-5 h-5" />
              Thông báo
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg font-semibold text-muted-foreground transition-colors">
              <Shield className="w-5 h-5" />
              Bảo mật
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg font-semibold text-muted-foreground transition-colors">
              <CreditCard className="w-5 h-5" />
              Thanh toán
            </button>
          </div>
          
          <div className="flex-1 bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Thông tin cá nhân</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-border">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" className="w-20 h-20 rounded-full border-4 border-muted" />
                <div>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm">Đổi ảnh đại diện</button>
                  <p className="text-xs text-muted-foreground mt-2">JPG, GIF hoặc PNG. Tối đa 2MB.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Họ và tên</label>
                  <input type="text" className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" defaultValue="Quang Hưng" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Username</label>
                  <input type="text" className="w-full h-10 px-3 rounded-lg border border-border bg-muted cursor-not-allowed" disabled defaultValue="quanghung2026" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold">Email</label>
                  <input type="email" className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" defaultValue="hung@example.com" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold">Giới thiệu ngắn (Bio)</label>
                  <textarea className="w-full h-24 p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Viết vài dòng giới thiệu về bạn..." />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button onClick={handleSave} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold">Lưu thay đổi</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
