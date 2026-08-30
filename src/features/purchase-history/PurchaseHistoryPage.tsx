import React, { useState } from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { Receipt, Search, Download, CreditCard, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { Input } from '@/shared/components/ui/input';
import { apiFetch } from '@/shared/lib/api-client';
import { toast } from 'sonner';



export default function PurchaseHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await apiFetch<any>('/payment/orders/my');
        const rawList = Array.isArray(res) ? res : (res?.data || []);
        if (Array.isArray(rawList)) {
          const mapped = rawList.map((o: any) => ({
            id: o.order_code || `ORD-${o.id}`,
            date: o.created_at || o.paid_at || new Date().toISOString(),
            items: [
              { id: String(o.course_id || 'course'), title: o.course?.title || 'Khóa học MindHub', price: Number(o.amount || 0) }
            ],
            total: Number(o.amount || 0),
            status: o.status === 'paid' ? 'success' : o.status === 'cancelled' ? 'failed' : 'pending',
            paymentMethod: o.payment_method || 'Online'
          }));
          setOrders(mapped);
        } else {
          setOrders([]);
        }
      } catch (e) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some((item: any) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDownloadInvoice = (orderId: string) => {
    toast.success(`Đang tải hóa đơn cho mã: ${orderId}`);
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black font-suisseintl tracking-tight">Lịch sử thanh toán</h1>
            <p className="text-muted-foreground mt-2">
              Theo dõi và quản lý các giao dịch mua khóa học của bạn.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm mã đơn hoặc tên khóa..."
              className="pl-9 bg-background rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Chưa có giao dịch nào"
            description="Bạn chưa mua khóa học nào trên hệ thống."
            actionLabel="Khám phá ngay"
            onAction={() => window.location.href = '/courses'}
          />
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Không tìm thấy kết quả nào cho "{searchQuery}"
          </div>
        ) : (
          <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-muted/50 border-b uppercase text-muted-foreground text-xs font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Mã đơn hàng</th>
                    <th className="px-6 py-4">Ngày giao dịch</th>
                    <th className="px-6 py-4">Chi tiết</th>
                    <th className="px-6 py-4">Tổng tiền</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm font-medium">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(order.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 max-w-[200px]">
                          {order.items.map((item, idx) => (
                            <span key={idx} className="truncate font-medium" title={item.title}>
                              {item.title}
                            </span>
                          ))}
                          {order.items.length > 1 && (
                            <span className="text-xs text-muted-foreground">
                              (Và {order.items.length - 1} mục khác)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        {order.status === 'success' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Thành công
                          </span>
                        ) : order.status === 'failed' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                            Thất bại
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                            Đang chờ
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-2 text-primary"
                          disabled={order.status !== 'success'}
                          onClick={() => handleDownloadInvoice(order.id)}
                        >
                          <Download className="w-4 h-4" /> Hoá đơn
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
