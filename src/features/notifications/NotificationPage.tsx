import React, { useState } from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { INITIAL_NOTIFICATIONS } from '@/shared/data';
import { Bell, CheckCircle2, Flame, AlertCircle, Info, Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { toast } from 'sonner';

export default function NotificationPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('Đã đánh dấu đọc tất cả thông báo');
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'reminder': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const filteredNotifications = notifications.filter(n => filter === 'all' || !n.read);

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black font-suisseintl tracking-tight">Thông báo</h1>
            <p className="text-muted-foreground mt-2">
              Bạn có <strong className="text-foreground">{unreadCount}</strong> thông báo chưa đọc
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead} className="gap-2 rounded-full">
              <Check className="w-4 h-4" /> Đánh dấu đã đọc tất cả
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant={filter === 'all' ? 'default' : 'ghost'} 
            onClick={() => setFilter('all')}
            className="rounded-full"
          >
            Tất cả
          </Button>
          <Button 
            variant={filter === 'unread' ? 'default' : 'ghost'} 
            onClick={() => setFilter('unread')}
            className="rounded-full"
          >
            Chưa đọc
          </Button>
        </div>

        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Không có thông báo nào"
            description="Bạn đã xem hết tất cả thông báo. Chúng tôi sẽ báo cho bạn khi có điều gì mới."
          />
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id)}
                className={`flex gap-4 p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${notif.read ? 'bg-background border-border opacity-75' : 'bg-primary/5 border-primary/20 shadow-sm'}`}
              >
                <div className="shrink-0 mt-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notif.read ? 'bg-muted' : 'bg-background shadow-sm'}`}>
                    {getIcon(notif.type)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className={`font-bold ${notif.read ? 'text-foreground/80' : 'text-foreground'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {notif.date}
                    </span>
                  </div>
                  <p className={`text-sm ${notif.read ? 'text-muted-foreground' : 'text-foreground/90'}`}>
                    {notif.message}
                  </p>
                </div>
                {!notif.read && (
                  <div className="shrink-0 flex items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
