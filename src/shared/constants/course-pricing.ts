/**
 * Centralized configuration for course pricing & promotion limits.
 * Synchronized with Backend config/course.php
 */
export const COURSE_PRICING_CONFIG = {
  MIN_PRICE: 50000,
  MAX_DISCOUNT_PERCENT: 70,
} as const;
