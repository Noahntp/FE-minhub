// @ts-ignore
import {
  getRawCategories as mockGetRawCategories,
  createCategory as mockCreateCategory,
  updateCategory as mockUpdateCategory,
  deleteCategory as mockDeleteCategory,
  restoreCategory as mockRestoreCategory,
  getCourses as mockGetCourses
} from "@/assets/js/mocks/mock-repository.js";
import {
  Category,
  CategoriesResponse,
  CategoryDetailResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategorySummary
} from "./categories.types";

const USE_MOCK = true;
const API_BASE_URL = "/api/admin/categories";

// Hàm tính số lượng khóa học active thuộc mỗi danh mục từ mock data
function getCategoryCourseCounts() {
  try {
    const courses = mockGetCourses() || [];
    const activeCourses = courses.filter((c: any) => c.deleted_at === null);
    const counts: Record<number, number> = {};
    
    activeCourses.forEach((course: any) => {
      const catIds = course.category_ids || [];
      catIds.forEach((catId: any) => {
        const idNum = Number(catId);
        counts[idNum] = (counts[idNum] || 0) + 1;
      });
    });
    return counts;
  } catch (e) {
    console.error("Error calculating mock course counts:", e);
    return {};
  }
}

// Kiểm tra đệ quy mối quan hệ cha con (tránh vòng lặp)
function isDescendant(catId: number, targetParentId: number, allCats: Category[]): boolean {
  const children = allCats.filter(c => c.parent_id === catId && c.deleted_at === null);
  if (children.some(child => child.id === targetParentId)) {
    return true;
  }
  return children.some(child => isDescendant(child.id, targetParentId, allCats));
}

export const CategoriesService = {
  /**
   * Gọi API/Mock tải danh sách phân trang phẳng
   */
  async getCategories(params: Record<string, any> = {}): Promise<CategoriesResponse> {
    if (!USE_MOCK) {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}?${query}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    }

    // Giả lập trễ mạng
    await new Promise(resolve => setTimeout(resolve, 350));

    try {
      const rawCategories: Category[] = mockGetRawCategories() || [];
      const activeRepoCategories = rawCategories.filter(c => c.deleted_at === null);
      const courseCounts = getCategoryCourseCounts();

      // 1. Tính toán các chỉ số thống kê (Summary) trên toàn bộ danh sách chưa bị xóa
      const summary: CategorySummary = {
        total_categories: activeRepoCategories.length,
        active_categories: activeRepoCategories.filter(c => c.status === "active").length,
        inactive_categories: activeRepoCategories.filter(c => c.status === "inactive").length,
        root_categories: activeRepoCategories.filter(c => c.parent_id === null).length,
        empty_categories: activeRepoCategories.filter(c => (courseCounts[c.id] || 0) === 0).length
      };

      // 2. Lọc dữ liệu
      let filtered: Category[] = [];
      if (params.status === "deleted") {
        filtered = rawCategories.filter(c => c.deleted_at !== null);
      } else if (params.status === "all_with_deleted") {
        filtered = [...rawCategories];
      } else {
        filtered = [...activeRepoCategories];
      }

      // Lọc theo search (Tên hoặc slug)
      if (params.search) {
        const searchKeyword = params.search.toLowerCase().trim();
        filtered = filtered.filter(c => 
          (c.name && c.name.toLowerCase().includes(searchKeyword)) ||
          (c.slug && c.slug.toLowerCase().includes(searchKeyword))
        );
      }

      // Lọc theo trạng thái status
      if (params.status && params.status !== "" && params.status !== "all" && params.status !== "deleted" && params.status !== "all_with_deleted") {
        filtered = filtered.filter(c => c.status === params.status);
      }

      // Lọc theo loại danh mục (type: root/child)
      if (params.type === "root") {
        filtered = filtered.filter(c => c.parent_id === null);
      } else if (params.type === "child") {
        filtered = filtered.filter(c => c.parent_id !== null);
      }

      // Lọc theo danh mục cha (parent_id)
      if (params.parent_id && params.parent_id !== "" && params.parent_id !== "all") {
        const parentId = Number(params.parent_id);
        filtered = filtered.filter(c => c.parent_id === parentId);
      }

      // 3. Sắp xếp dữ liệu
      const sortBy = params.sort_by || "newest";
      filtered.sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        } else if (sortBy === "oldest") {
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        } else if (sortBy === "name_asc") {
          return (a.name || "").localeCompare(b.name || "", "vi");
        } else if (sortBy === "name_desc") {
          return (b.name || "").localeCompare(a.name || "", "vi");
        } else if (sortBy === "sort_order_asc") {
          const sa = a.sort_order || 0;
          const sb = b.sort_order || 0;
          if (sa > 0 && sb > 0) {
            if (sa !== sb) return sa - sb;
            return (a.name || "").localeCompare(b.name || "", "vi");
          }
          if (sa > 0 && sb === 0) return -1;
          if (sa === 0 && sb > 0) return 1;
          return (a.name || "").localeCompare(b.name || "", "vi");
        } else if (sortBy === "sort_order_desc") {
          const sa = a.sort_order || 0;
          const sb = b.sort_order || 0;
          if (sa > 0 && sb > 0) {
            if (sa !== sb) return sb - sa;
            return (a.name || "").localeCompare(b.name || "", "vi");
          }
          if (sa > 0 && sb === 0) return -1;
          if (sa === 0 && sb > 0) return 1;
          return (a.name || "").localeCompare(b.name || "", "vi");
        } else if (sortBy === "courses_desc") {
          const countA = courseCounts[a.id] || 0;
          const countB = courseCounts[b.id] || 0;
          return countB - countA;
        }
        return 0;
      });

      // 4. Nhúng thông tin quan hệ (parent, course_count)
      const items = filtered.map(c => {
        let parentObj = null;
        if (c.parent_id !== null && c.parent_id !== undefined) {
          const parent = rawCategories.find(p => Number(p.id) === Number(c.parent_id));
          if (parent) {
            parentObj = { id: parent.id, name: parent.name };
          }
        }
        return {
          ...c,
          course_count: courseCounts[c.id] || 0,
          parent: parentObj
        };
      });

      // 5. Phân trang phẳng
      const total = items.length;
      const perPage = parseInt(params.per_page) || 20;
      const currentPage = parseInt(params.page) || 1;
      const lastPage = Math.max(1, Math.ceil(total / perPage));

      const startIndex = (currentPage - 1) * perPage;
      const paginatedItems = items.slice(startIndex, startIndex + perPage);

      return {
        success: true,
        message: "Lấy danh mục thành công.",
        data: {
          summary: summary,
          items: paginatedItems
        },
        meta: {
          current_page: currentPage,
          last_page: lastPage,
          per_page: perPage,
          total: total
        }
      };
    } catch (error: any) {
      console.error("Lỗi Mock API getCategories:", error);
      return {
        success: false,
        message: "Lỗi hệ thống khi tải danh sách danh mục.",
        data: {
          summary: { total_categories: 0, active_categories: 0, inactive_categories: 0, root_categories: 0, empty_categories: 0 },
          items: []
        },
        meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 }
      };
    }
  },

  /**
   * Tải toàn bộ danh mục chưa bị xóa (dành cho dựng cây Tree View)
   * Có cơ chế tự động tải tiếp các trang sau nếu API giới hạn bản ghi.
   */
  async getCategoriesAll(status: string = ""): Promise<CategoriesResponse> {
    const firstPageResponse = await this.getCategories({ page: 1, per_page: 200, status });
    if (!firstPageResponse.success) {
      return firstPageResponse;
    }

    const { meta, data } = firstPageResponse;
    let allItems = [...data.items];

    // Nếu còn các trang sau do giới hạn kích thước trang của backend
    if (meta.last_page > 1) {
      const pageRequests = [];
      for (let p = 2; p <= meta.last_page; p++) {
        pageRequests.push(this.getCategories({ page: p, per_page: 200, status }));
      }
      
      const responses = await Promise.all(pageRequests);
      responses.forEach(res => {
        if (res.success && res.data.items) {
          allItems = allItems.concat(res.data.items);
        }
      });
    }

    return {
      ...firstPageResponse,
      data: {
        ...data,
        items: allItems
      },
      meta: {
        ...meta,
        current_page: 1,
        last_page: 1,
        total: allItems.length
      }
    };
  },

  /**
   * Lấy chi tiết một danh mục
   */
  async getCategory(id: number | string): Promise<CategoryDetailResponse> {
    const catId = Number(id);
    if (!USE_MOCK) {
      const response = await fetch(`${API_BASE_URL}/${catId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    const rawCategories: Category[] = mockGetRawCategories() || [];
    const category = rawCategories.find(c => c.id === catId);

    if (!category) {
      return {
        success: false,
        message: "Không tìm thấy danh mục.",
        data: {} as any,
        error_code: 404
      };
    }

    const courseCounts = getCategoryCourseCounts();
    const parentObj = category.parent_id ? rawCategories.find(p => p.id === category.parent_id) : null;
    const childrenObj = rawCategories.filter(c => c.parent_id === catId && c.deleted_at === null);

    return {
      success: true,
      message: "Lấy chi tiết danh mục thành công.",
      data: {
        ...category,
        course_count: courseCounts[catId] || 0,
        parent: parentObj ? { id: parentObj.id, name: parentObj.name, slug: parentObj.slug } : null,
        children: childrenObj.map(ch => ({
          id: ch.id,
          name: ch.name,
          slug: ch.slug,
          status: ch.status,
          sort_order: ch.sort_order
        }))
      }
    };
  },

  /**
   * Tạo mới danh mục
   */
  async createCategory(payload: CreateCategoryPayload): Promise<any> {
    if (!USE_MOCK) {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        if (response.status === 422) {
          return await response.json();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    // Validate phía client
    const errors: Record<string, string[]> = {};
    if (!payload.name || payload.name.trim() === "") {
      errors.name = ["Tên danh mục là bắt buộc."];
    }
    if (!payload.slug || payload.slug.trim() === "") {
      errors.slug = ["Slug danh mục là bắt buộc."];
    } else if (!/^[a-z0-9-]+$/.test(payload.slug)) {
      errors.slug = ["Slug chỉ được chứa chữ thường, số và ký tự gạch ngang."];
    }

    const rawCategories: Category[] = mockGetRawCategories() || [];

    // Kiểm tra trùng slug
    if (payload.slug && rawCategories.some(c => c.slug.toLowerCase() === payload.slug.toLowerCase())) {
      return {
        success: false,
        message: "Slug danh mục đã tồn tại trong hệ thống.",
        errors: { slug: ["Slug này đã tồn tại, vui lòng chọn slug khác."] },
        error_code: 409
      };
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Thông tin nhập vào không hợp lệ.",
        errors: errors,
        error_code: 422
      };
    }

    const newCategory = mockCreateCategory(payload);
    return {
      success: true,
      message: "Tạo danh mục thành công.",
      data: newCategory
    };
  },

  /**
   * Cập nhật danh mục (bao gồm cả thứ tự sort_order và status)
   */
  async updateCategory(id: number | string, payload: UpdateCategoryPayload): Promise<any> {
    const catId = Number(id);
    if (!USE_MOCK) {
      const response = await fetch(`${API_BASE_URL}/${catId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        if (response.status === 422) {
          return await response.json();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    const rawCategories: Category[] = mockGetRawCategories() || [];
    const originalCategory = rawCategories.find(c => c.id === catId);
    if (!originalCategory) {
      return {
        success: false,
        message: "Không tìm thấy danh mục để cập nhật.",
        error_code: 404
      };
    }

    const errors: Record<string, string[]> = {};
    if (payload.name !== undefined && (!payload.name || payload.name.trim() === "")) {
      errors.name = ["Tên danh mục là bắt buộc."];
    }
    if (payload.slug !== undefined) {
      if (!payload.slug || payload.slug.trim() === "") {
        errors.slug = ["Slug danh mục là bắt buộc."];
      } else if (!/^[a-z0-9-]+$/.test(payload.slug)) {
        errors.slug = ["Slug chỉ được chứa chữ thường, số và ký tự gạch ngang."];
      }
    }

    // Kiểm tra trùng slug với các danh mục khác
    if (payload.slug && rawCategories.some(c => c.id !== catId && c.slug.toLowerCase() === payload.slug.toLowerCase())) {
      return {
        success: false,
        message: "Slug danh mục đã tồn tại trong hệ thống.",
        errors: { slug: ["Slug này đã tồn tại, vui lòng chọn slug khác."] },
        error_code: 409
      };
    }

    // Kiểm tra lỗi vòng lặp cha-con
    if (payload.parent_id !== undefined && payload.parent_id !== null) {
      const newParentId = Number(payload.parent_id);
      if (newParentId === catId) {
        return {
          success: false,
          message: "Không thể chọn chính danh mục hiện tại làm danh mục cha.",
          errors: { parent_id: ["Không thể tự làm cha của chính mình."] },
          error_code: 422
        };
      }
      
      if (isDescendant(catId, newParentId, rawCategories)) {
        return {
          success: false,
          message: "Không thể tạo vòng lặp cha con. Danh mục cha được chọn đang là con/cháu của danh mục này.",
          errors: { parent_id: ["Không thể chọn danh mục con làm danh mục cha."] },
          error_code: 422
        };
      }
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Thông tin nhập vào không hợp lệ.",
        errors: errors,
        error_code: 422
      };
    }

    const updatedCategory = mockUpdateCategory(catId, payload);
    return {
      success: true,
      message: "Cập nhật danh mục thành công.",
      data: updatedCategory
    };
  },

  /**
   * Xóa mềm danh mục
   */
  async deleteCategory(id: number | string): Promise<any> {
    const catId = Number(id);
    if (!USE_MOCK) {
      const response = await fetch(`${API_BASE_URL}/${catId}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        if (response.status === 409) {
          return await response.json();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    }

    await new Promise(resolve => setTimeout(resolve, 250));

    const rawCategories: Category[] = mockGetRawCategories() || [];
    const category = rawCategories.find(c => c.id === catId);
    if (!category) {
      return {
        success: false,
        message: "Không tìm thấy danh mục để xóa.",
        error_code: 404
      };
    }

    // 1. Kiểm tra xem còn danh mục con nào không
    const hasChildren = rawCategories.some(c => c.parent_id === catId && c.deleted_at === null);
    if (hasChildren) {
      return {
        success: false,
        message: "Không thể xóa danh mục này vì vẫn còn danh mục con đang hoạt động bên dưới.",
        error_code: 409
      };
    }

    // 2. Kiểm tra xem còn khóa học nào liên kết không
    const courseCounts = getCategoryCourseCounts();
    const count = courseCounts[catId] || 0;
    if (count > 0) {
      return {
        success: false,
        message: `Không thể xóa danh mục này vì đang có ${count} khóa học liên kết.`,
        error_code: 409
      };
    }

    const success = mockDeleteCategory(catId);
    if (success) {
      return {
        success: true,
        message: "Xóa danh mục thành công."
      };
    }

    return {
      success: false,
      message: "Lỗi hệ thống khi xóa danh mục.",
      error_code: 500
    };
  },

  /**
   * Khôi phục danh mục đã xóa mềm
   */
  async restoreCategory(id: number | string): Promise<any> {
    const catId = Number(id);
    if (!USE_MOCK) {
      const response = await fetch(`${API_BASE_URL}/${catId}/restore`, {
        method: "POST"
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return { success: false, message: errData.message || "Không thể khôi phục danh mục.", error_code: response.status };
      }
      return await response.json();
    }

    await new Promise(resolve => setTimeout(resolve, 250));

    const success = mockRestoreCategory(catId);
    if (success) {
      return {
        success: true,
        message: "Khôi phục danh mục thành công."
      };
    }

    return {
      success: false,
      message: "Không tìm thấy danh mục để khôi phục hoặc lỗi hệ thống.",
      error_code: 404
    };
  }
};
