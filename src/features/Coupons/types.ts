export interface Coupon {
  id: string;
  code: string;
  name: string;
  course_id: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  max_order_amount?: number;
  usage_limit?: number;
  used_count: number;
  start_at: string;
  end_at: string;
  status: 'active' | 'inactive' | 'expired' | 'used_up';
}
