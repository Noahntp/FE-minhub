import React from 'react';
import { User as UserType } from '@/shared/types';
import { User, Award, Flame, Calendar, BookOpen } from 'lucide-react';
import { PageTransition } from '@/shared/components/ui/PageTransition';

export function PublicProfile({ user }: { user: UserType }) {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-card border rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left shadow-sm">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-xl">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            {user.role === 'instructor' && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                Giảng viên
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-black text-foreground font-suisseintl">{user.name}</h1>
              {user.title && <p className="text-lg text-primary font-medium">{user.title}</p>}
            </div>
            
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              {user.bio || 'Người dùng này chưa cập nhật tiểu sử.'}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
              <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-xl">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-bold">{user.streak || 0} ngày Streak</span>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-xl">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-muted-foreground">Hoạt động: {user.lastActiveDate || 'Gần đây'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Sở thích học tập
            </h2>
            {user.interestedTopics && user.interestedTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.interestedTopics.map((topic, idx) => (
                  <span key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Chưa có thông tin</p>
            )}
          </div>
          
          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Thành tựu
            </h2>
            <p className="text-muted-foreground">Tính năng này đang được phát triển.</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
