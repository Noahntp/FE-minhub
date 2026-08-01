import { apiFetch, devLog, config, ApiError } from '@/shared/lib/api-client';
import { Course, Chapter, Lesson, Resource, User, QAMessage, StudentProgress, PayoutRequest, AuditLog, InstructorRequest, AccountRequest } from '@/shared/types';

export const cartApi = {
async createCheckoutOrder(courseIds: string[]): Promise<any> {
  devLog('Orders', 'Assembling payment carts into transaction invoice', courseIds);
  return apiFetch<any>('/orders', {
          method: 'POST',
          body: JSON.stringify({ course_ids: courseIds }),
        });
  },

async applyCouponCode(couponCode: string, orderId: string): Promise<any> {
  devLog('Orders', `Apply coupon "${couponCode}" discount trigger to Order ID: ${orderId}`);
  return apiFetch<any>('/orders/apply-coupon', {
          method: 'POST',
          body: JSON.stringify({ code: couponCode, order_id: orderId }),
        });
  },

async getMyOrdersHistory(): Promise<any[]> {
  devLog('Orders', 'Fetch past buy transactions listing');
  return apiFetch<any[]>('/orders/my');
  },

async getOrderBillReceipt(orderId: string): Promise<any> {
  devLog('Orders', `Query specific purchase record details: ${orderId}`);
  return apiFetch<any>(`/orders/${orderId}`);
  },

async cancelTicketOrder(orderId: string): Promise<{ success: boolean; message: string }> {
  devLog('Orders', `Cancel transaction ID: ${orderId}`);
  return apiFetch<{ success: boolean; message: string }>(`/orders/${orderId}/cancel`, { method: 'PATCH' });
  },

async retryPaymentGateway(orderId: string): Promise<any> {
  devLog('Orders', `Reprocess credit clearance for Order ID: ${orderId}`);
  return apiFetch<any>(`/orders/${orderId}/retry-payment`, { method: 'POST' });
  },

async submitManualPaymentProof(payload: FormData): Promise<{ success: boolean }> {
  devLog('Orders', 'Submit manual bank transfer photo proof');
  return apiFetch<{ success: boolean }>('/payments', {
          method: 'POST',
          body: payload, // Transmit as raw FormData mapping multipart/form-data
        });
  },

async createVNPayGatewayUrl(orderId: string): Promise<{ paymentUrl: string }> {
  devLog('Orders', `Redirect to VNPay gateway portal checkouts for Order ${orderId}`);
  return apiFetch<{ paymentUrl: string }>('/payments/vnpay/create', {
          method: 'POST',
          body: JSON.stringify({ order_id: orderId }),
        });
  },

async parseVNPayCallback(vnpayParams: string): Promise<any> {
  devLog('Orders', 'Processing VNPay return callback payload token check');
  return apiFetch<any>(`/payments/vnpay-return?${vnpayParams}`);
  },

async hookPaymentStatusBackground(payload: any): Promise<any> {
  devLog('Orders', 'Incoming transaction webhook notifier payload');
  return apiFetch<any>('/payments/webhook', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

async updateOrderStatus(orderId: string, status: 'success' | 'pending' | 'failed'): Promise<{ success: boolean; message: string }> {
      // BACKEND_MISSING
    devLog('Admin', `Update order status to ${status}`, { orderId });
    return apiFetch<{ success: boolean; message: string }>(`/admin/orders/${orderId}/status`, {
              method: 'PATCH',
              body: JSON.stringify({ status })
            });
    // Optional: we can add this to mock DB if needed
  },

async resolvePayoutRequest(requestId: string, action: 'completed' | 'rejected'): Promise<{ success: boolean; message: string }> {
      // BACKEND_MISSING
    devLog('Admin', `Resolve payout request to ${action}`, { requestId });
    return apiFetch<{ success: boolean; message: string }>(`/admin/payout-requests/${requestId}/resolve`, {
              method: 'PATCH',
              body: JSON.stringify({ action })
            });
  }
};
