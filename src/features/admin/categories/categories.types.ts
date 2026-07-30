export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  
  // Virtual / Computed fields from API/Mock
  course_count?: number;
  parent?: { id: number; name: string } | null;
  
  // Client-side computed properties
  depth?: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  visible?: boolean;
  isContextual?: boolean;
}

export interface CategorySummary {
  total_categories: number;
  active_categories: number;
  inactive_categories: number;
  root_categories: number;
  empty_categories: number;
}

export interface CategoryFilters {
  search: string;
  status: '' | 'active' | 'inactive' | 'deleted';
  type: '' | 'root' | 'child';
  parent_id: string;
  sort_by: 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'sort_order_asc' | 'sort_order_desc' | 'courses_desc';
  page: number;
  per_page: number;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: {
    summary: CategorySummary;
    items: Category[];
  };
  meta: PaginationMeta;
}

export interface CategoryDetailResponse {
  success: boolean;
  message: string;
  data: Category & {
    parent: { id: number; name: string; slug: string } | null;
    children: Array<{
      id: number;
      name: string;
      slug: string;
      status: 'active' | 'inactive';
      sort_order: number;
    }>;
  };
  error_code?: number;
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  parent_id: number | null;
  description?: string;
  sort_order: number;
  status: 'active' | 'inactive';
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  parent_id?: number | null;
  description?: string;
  sort_order?: number;
  status?: 'active' | 'inactive';
}

export type ViewMode = 'tree' | 'flat';
