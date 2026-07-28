export interface Coupon {
  id: string | number;
  code: string;
  name?: string;
  course_id: string | number;
  course?: {
    id: number | string;
    title: string;
    slug?: string;
    status?: string;
    price?: number;
  };
  discount_type: 'percent' | 'fixed' | 'percentage';
  discount_type_label?: string;
  discount_value: number;
  max_order_amount?: number;
  usage_limit?: number | null;
  used_count: number;
  remaining_usage?: number | null;
  usage_label?: string;
  start_at?: string | null;
  end_at?: string | null;
  status: 'active' | 'inactive' | 'expired' | 'used_up' | 'scheduled' | string;
  status_label?: string;
  effective_status?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CouponSummary {
  active_coupons: number;
  expired_coupons: number;
  used_up_coupons: number;
  total_usage_count: number;
  inactive_coupons?: number;
  total_coupons?: number;
}

export interface CourseOption {
  id: number | string;
  title: string;
  status?: string;
  price?: number;
}
