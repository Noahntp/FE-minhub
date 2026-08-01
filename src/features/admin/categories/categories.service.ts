// @ts-ignore
import {
  getRawCategories as mockGetRawCategories,
  createCategory as mockCreateCategory,
  updateCategory as mockUpdateCategory,
  deleteCategory as mockDeleteCategory,
  restoreCategory as mockRestoreCategory,
  getCourses as mockGetCourses,
  getUsers as mockGetUsers,
} from "@/assets/js/mocks/mock-repository.js";
import {
  Category,
  CategoriesResponse,
  CategoryDetailResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategorySummary,
} from "./categories.types";
import { ApiService } from "@/services/api";

const isApiMode = (): boolean => {
  const useMockEnv =
    import.meta.env.VITE_USE_MOCK === true ||
    import.meta.env.VITE_USE_MOCK === "true";
  const apiMode = ApiService.getConfig().mode;
  return !useMockEnv && apiMode === "api";
};

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
function isDescendant(
  catId: number,
  targetParentId: number,
  allCats: Category[],
): boolean {
  const children = allCats.filter(
    (c) => c.parent_id === catId && c.deleted_at === null,
  );
  if (children.some((child) => child.id === targetParentId)) {
    return true;
  }
  return children.some((child) =>
    isDescendant(child.id, targetParentId, allCats),
  );
}

export const CategoriesService = {
  /**
   * Gọi API/Mock tải danh sách phân trang phẳng
   */
  async getCategories(
    params: Record<string, any> = {},
  ): Promise<CategoriesResponse> {
    if (isApiMode()) {
      try {
        const response = await ApiService.getAdminCategories(params);
        const items = response?.items || [];
        const summary = response?.summary || {
          total_categories: items.length,
          active_categories: items.filter((c: any) => c.status === "active")
            .length,
          inactive_categories: items.filter((c: any) => c.status === "inactive")
            .length,
          root_categories: items.filter((c: any) => c.parent_id === null)
            .length,
          empty_categories: items.filter(
            (c: any) => (c.course_count || 0) === 0,
          ).length,
        };
        const meta = response?.meta || {
          current_page: params.page || 1,
          last_page: 1,
          per_page: params.per_page || 20,
          total: items.length,
        };
        return {
          success: true,
          message: "Lấy danh mục thành công.",
          data: {
            summary,
            items,
          },
          meta,
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || "Không thể kết nối đến máy chủ dữ liệu.",
          data: {
            summary: {
              total_categories: 0,
              active_categories: 0,
              inactive_categories: 0,
              root_categories: 0,
              empty_categories: 0,
            },
            items: [],
          },
          meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
        };
      }
    }

    // Giả lập trễ mạng
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      const rawCategories: Category[] = mockGetRawCategories() || [];
      const activeRepoCategories = rawCategories.filter(
        (c) => c.deleted_at === null,
      );
      const courseCounts = getCategoryCourseCounts();

      // 1. Tính toán các chỉ số thống kê (Summary) trên toàn bộ danh sách chưa bị xóa
      const summary: CategorySummary = {
        total_categories: activeRepoCategories.length,
        active_categories: activeRepoCategories.filter(
          (c) => c.status === "active",
        ).length,
        inactive_categories: activeRepoCategories.filter(
          (c) => c.status === "inactive",
        ).length,
        root_categories: activeRepoCategories.filter(
          (c) => c.parent_id === null,
        ).length,
        empty_categories: activeRepoCategories.filter(
          (c) => (courseCounts[c.id] || 0) === 0,
        ).length,
      };

      // 2. Lọc dữ liệu
      let filtered: Category[] = [];
      if (params.status === "deleted") {
        filtered = rawCategories.filter((c) => c.deleted_at !== null);
      } else if (params.status === "all_with_deleted") {
        filtered = [...rawCategories];
      } else {
        filtered = [...activeRepoCategories];
      }

      // Lọc theo search (Tên hoặc slug)
      if (params.search) {
        const searchKeyword = params.search.toLowerCase().trim();
        filtered = filtered.filter(
          (c) =>
            (c.name && c.name.toLowerCase().includes(searchKeyword)) ||
            (c.slug && c.slug.toLowerCase().includes(searchKeyword)),
        );
      }

      // Lọc theo trạng thái status
      if (
        params.status &&
        params.status !== "" &&
        params.status !== "all" &&
        params.status !== "deleted" &&
        params.status !== "all_with_deleted"
      ) {
        filtered = filtered.filter((c) => c.status === params.status);
      }

      // Lọc theo loại danh mục (type: root/child)
      if (params.type === "root") {
        filtered = filtered.filter((c) => c.parent_id === null);
      } else if (params.type === "child") {
        filtered = filtered.filter((c) => c.parent_id !== null);
      }

      // Lọc theo danh mục cha (parent_id)
      if (
        params.parent_id &&
        params.parent_id !== "" &&
        params.parent_id !== "all"
      ) {
        const parentId = Number(params.parent_id);
        filtered = filtered.filter((c) => c.parent_id === parentId);
      }

      // Lọc theo danh mục chưa có khóa học (empty)
      if (params.empty === "true") {
        filtered = filtered.filter((c) => (courseCounts[c.id] || 0) === 0);
      }

      // 3. Sắp xếp dữ liệu
      const sortBy = params.sort_by || "newest";
      filtered.sort((a, b) => {
        if (sortBy === "newest") {
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
        } else if (sortBy === "oldest") {
          return (
            new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime()
          );
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
      const items = filtered.map((c) => {
        let parentObj = null;
        if (c.parent_id !== null && c.parent_id !== undefined) {
          const parent = rawCategories.find(
            (p) => Number(p.id) === Number(c.parent_id),
          );
          if (parent) {
            parentObj = { id: parent.id, name: parent.name };
          }
        }
        return {
          ...c,
          course_count: courseCounts[c.id] || 0,
          parent: parentObj,
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
          items: paginatedItems,
        },
        meta: {
          current_page: currentPage,
          last_page: lastPage,
          per_page: perPage,
          total: total,
        },
      };
    } catch (error: any) {
      console.error("Lỗi Mock API getCategories:", error);
      return {
        success: false,
        message: "Lỗi hệ thống khi tải danh sách danh mục.",
        data: {
          summary: {
            total_categories: 0,
            active_categories: 0,
            inactive_categories: 0,
            root_categories: 0,
            empty_categories: 0,
          },
          items: [],
        },
        meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
      };
    }
  },

  /**
   * Tải toàn bộ danh mục chưa bị xóa (dành cho dựng cây Tree View)
   * Có cơ chế tự động tải tiếp các trang sau nếu API giới hạn bản ghi.
   */
  async getCategoriesAll(
    params: Record<string, any> = {},
  ): Promise<CategoriesResponse> {
    const firstPageResponse = await this.getCategories({
      ...params,
      page: 1,
      per_page: 100,
    });
    if (!firstPageResponse.success) {
      return firstPageResponse;
    }

    const { meta, data } = firstPageResponse;
    let allItems = [...data.items];

    // Nếu còn các trang sau do giới hạn kích thước trang của backend
    if (meta.last_page > 1) {
      const pageRequests = [];
      for (let p = 2; p <= meta.last_page; p++) {
        pageRequests.push(
          this.getCategories({ ...params, page: p, per_page: 100 }),
        );
      }

      const responses = await Promise.all(pageRequests);
      responses.forEach((res) => {
        if (res.success && res.data.items) {
          allItems = allItems.concat(res.data.items);
        }
      });
    }

    return {
      ...firstPageResponse,
      data: {
        ...data,
        items: allItems,
      },
      meta: {
        ...meta,
        current_page: 1,
        last_page: 1,
        total: allItems.length,
      },
    };
  },

  /**
   * Lưu thứ tự hiển thị hàng loạt
   */
  async reorderCategories(
    items: Array<{ id: number; sort_order: number; parent_id: number | null }>,
  ): Promise<{ success: boolean; message: string }> {
    if (isApiMode()) {
      try {
        await ApiService.reorderAdminCategories(items);
        return {
          success: true,
          message: "Cập nhật thứ tự hiển thị danh mục thành công.",
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || "Lỗi khi cập nhật thứ tự danh mục.",
        };
      }
    }

    // Giả lập trễ mạng
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      // Trong mock mode, duyệt qua và gọi mockUpdateCategory để ghi nhận thay đổi vào localStorage
      for (const item of items) {
        mockUpdateCategory(item.id, {
          sort_order: item.sort_order,
          parent_id: item.parent_id,
        });
      }
      return {
        success: true,
        message: "Lưu thứ tự hiển thị danh mục thành công (Mock Mode).",
      };
    } catch (e: any) {
      console.error("Lỗi mock reorder:", e);
      return {
        success: false,
        message: e.message || "Lỗi hệ thống khi cập nhật thứ tự.",
      };
    }
  },

  /**
   * Lấy chi tiết một danh mục
   */
  async getCategory(id: number | string): Promise<CategoryDetailResponse> {
    const catId = Number(id);
    if (isApiMode()) {
      try {
        const response = await ApiService.getAdminCategory(catId);
        return {
          success: true,
          message: "Lấy chi tiết danh mục thành công.",
          data: response,
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || "Lỗi khi tải chi tiết danh mục.",
          data: {} as any,
          error_code: err.status || 500,
        };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 200));

    const rawCategories: Category[] = mockGetRawCategories() || [];
    const category = rawCategories.find((c) => c.id === catId);

    if (!category) {
      return {
        success: false,
        message: "Không tìm thấy danh mục.",
        data: {} as any,
        error_code: 404,
      };
    }

    const courseCounts = getCategoryCourseCounts();
    const parentObj = category.parent_id
      ? rawCategories.find((p) => p.id === category.parent_id)
      : null;
    const childrenObj = rawCategories.filter(
      (c) => c.parent_id === catId && c.deleted_at === null,
    );

    // Thu thập toàn bộ ID danh mục con/cháu bằng đệ quy
    const getDescendantIds = (rootId: number): Set<number> => {
      const ids = new Set<number>([rootId]);
      const findChildren = (pId: number) => {
        rawCategories.forEach((c) => {
          if (c.parent_id === pId && c.deleted_at === null) {
            ids.add(c.id);
            findChildren(c.id);
          }
        });
      };
      findChildren(rootId);
      return ids;
    };

    const targetCatIds = getDescendantIds(catId);

    // Tìm các khóa học thuộc nhánh danh mục này
    const allCourses = mockGetCourses() || [];
    const matchedCourses = allCourses.filter((c: any) => {
      if (c.deleted_at !== null) return false;
      const catIds = c.category_ids || [];
      return catIds.some((cid: any) => targetCatIds.has(Number(cid)));
    });

    // Tính toán thống kê
    const total = matchedCourses.length;
    const published = matchedCourses.filter(
      (c: any) => c.status === "published",
    ).length;
    const pending = matchedCourses.filter(
      (c: any) => c.status === "pending_review",
    ).length;
    const draft = matchedCourses.filter(
      (c: any) => c.status === "draft",
    ).length;
    const enrollments = matchedCourses.reduce(
      (sum: number, c: any) => sum + (c.enrollment_count || 0),
      0,
    );
    const reviews = matchedCourses.reduce(
      (sum: number, c: any) => sum + (c.review_count || 0),
      0,
    );

    const ratedCourses = matchedCourses.filter(
      (c: any) => (c.average_rating || 0) > 0,
    );
    const rating =
      ratedCourses.length > 0
        ? Number(
            (
              ratedCourses.reduce(
                (sum: number, c: any) => sum + (c.average_rating || 0),
                0,
              ) / ratedCourses.length
            ).toFixed(1),
          )
        : "Chưa có dữ liệu";

    // Map chi tiết khóa học
    const usersList = mockGetUsers() || [];
    const getInstructorName = (instId: number) => {
      const user = usersList.find((u: any) => u.id === instId);
      return user ? user.full_name : "Chưa rõ";
    };

    const courseDetails = matchedCourses.map((c: any) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      instructor_name: getInstructorName(c.instructor_id),
      enrollment_count: c.enrollment_count || 0,
      average_rating: c.average_rating || 0,
      review_count: c.review_count || 0,
    }));

    return {
      success: true,
      message: "Lấy chi tiết danh mục thành công.",
      data: {
        ...category,
        course_count: courseCounts[catId] || 0,
        parent: parentObj
          ? { id: parentObj.id, name: parentObj.name, slug: parentObj.slug }
          : null,
        children: childrenObj.map((ch) => ({
          id: ch.id,
          name: ch.name,
          slug: ch.slug,
          status: ch.status as any,
          sort_order: ch.sort_order || 1,
        })),
        statistics: {
          total,
          published,
          pending,
          draft,
          enrollments,
          reviews,
          rating,
        },
        courses: courseDetails,
      },
    };
  },

  /**
   * Tạo mới danh mục
   */
  async createCategory(payload: CreateCategoryPayload): Promise<any> {
    if (isApiMode()) {
      try {
        const response = await ApiService.createAdminCategory(payload);
        return {
          success: true,
          message: "Tạo danh mục thành công.",
          data: response,
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || "Lỗi tạo danh mục.",
          errors: err.errors || {},
          error_code: err.status || 500,
        };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

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
    if (
      payload.slug &&
      rawCategories.some(
        (c) => c.slug.toLowerCase() === payload.slug.toLowerCase(),
      )
    ) {
      return {
        success: false,
        message: "Slug danh mục đã tồn tại trong hệ thống.",
        errors: { slug: ["Slug này đã tồn tại, vui lòng chọn slug khác."] },
        error_code: 409,
      };
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Thông tin nhập vào không hợp lệ.",
        errors: errors,
        error_code: 422,
      };
    }

    const newCategory = mockCreateCategory(payload);
    return {
      success: true,
      message: "Tạo danh mục thành công.",
      data: newCategory,
    };
  },

  /**
   * Cập nhật danh mục (bao gồm cả thứ tự sort_order và status)
   */
  async updateCategory(
    id: number | string,
    payload: UpdateCategoryPayload,
  ): Promise<any> {
    const catId = Number(id);
    if (isApiMode()) {
      try {
        const response = await ApiService.updateAdminCategory(catId, payload);
        return {
          success: true,
          message: "Cập nhật danh mục thành công.",
          data: response,
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || "Lỗi cập nhật danh mục.",
          errors: err.errors || {},
          error_code: err.status || 500,
        };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    const rawCategories: Category[] = mockGetRawCategories() || [];
    const originalCategory = rawCategories.find((c) => c.id === catId);
    if (!originalCategory) {
      return {
        success: false,
        message: "Không tìm thấy danh mục để cập nhật.",
        error_code: 404,
      };
    }

    const errors: Record<string, string[]> = {};
    if (
      payload.name !== undefined &&
      (!payload.name || payload.name.trim() === "")
    ) {
      errors.name = ["Tên danh mục là bắt buộc."];
    }
    if (payload.slug !== undefined) {
      if (!payload.slug || payload.slug.trim() === "") {
        errors.slug = ["Slug danh mục là bắt buộc."];
      } else if (!/^[a-z0-9-]+$/.test(payload.slug)) {
        errors.slug = [
          "Slug chỉ được chứa chữ thường, số và ký tự gạch ngang.",
        ];
      }
    }

    // Kiểm tra trùng slug với các danh mục khác
    if (
      payload.slug &&
      rawCategories.some(
        (c) =>
          c.id !== catId && c.slug.toLowerCase() === payload.slug.toLowerCase(),
      )
    ) {
      return {
        success: false,
        message: "Slug danh mục đã tồn tại trong hệ thống.",
        errors: { slug: ["Slug này đã tồn tại, vui lòng chọn slug khác."] },
        error_code: 409,
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
          error_code: 422,
        };
      }

      if (isDescendant(catId, newParentId, rawCategories)) {
        return {
          success: false,
          message:
            "Không thể tạo vòng lặp cha con. Danh mục cha được chọn đang là con/cháu của danh mục này.",
          errors: {
            parent_id: ["Không thể chọn danh mục con làm danh mục cha."],
          },
          error_code: 422,
        };
      }
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Thông tin nhập vào không hợp lệ.",
        errors: errors,
        error_code: 422,
      };
    }

    const updatedCategory = mockUpdateCategory(catId, payload);
    return {
      success: true,
      message: "Cập nhật danh mục thành công.",
      data: updatedCategory,
    };
  },

  /**
   * Xóa mềm danh mục
   */
  async deleteCategory(id: number | string): Promise<any> {
    const catId = Number(id);
    if (isApiMode()) {
      try {
        const response = await ApiService.deleteAdminCategory(catId);
        return {
          success: true,
          message: "Xóa danh mục thành công.",
          data: response,
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || "Lỗi khi xóa danh mục.",
          error_code: err.status || 500,
        };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 250));

    const rawCategories: Category[] = mockGetRawCategories() || [];
    const category = rawCategories.find((c) => c.id === catId);
    if (!category) {
      return {
        success: false,
        message: "Không tìm thấy danh mục để xóa.",
        error_code: 404,
      };
    }

    // 1. Kiểm tra xem còn danh mục con nào không
    const hasChildren = rawCategories.some(
      (c) => c.parent_id === catId && c.deleted_at === null,
    );
    if (hasChildren) {
      return {
        success: false,
        message:
          "Không thể xóa danh mục này vì vẫn còn danh mục con đang hoạt động bên dưới.",
        error_code: 409,
      };
    }

    // 2. Kiểm tra xem còn khóa học nào liên kết không
    const courseCounts = getCategoryCourseCounts();
    const count = courseCounts[catId] || 0;
    if (count > 0) {
      return {
        success: false,
        message: `Không thể xóa danh mục này vì đang có ${count} khóa học liên kết.`,
        error_code: 409,
      };
    }

    const success = mockDeleteCategory(catId);
    if (success) {
      return {
        success: true,
        message: "Xóa danh mục thành công.",
      };
    }

    return {
      success: false,
      message: "Lỗi hệ thống khi xóa danh mục.",
      error_code: 500,
    };
  },

  /**
   * Khôi phục danh mục đã xóa mềm
   */
  async restoreCategory(id: number | string): Promise<any> {
    const catId = Number(id);
    if (isApiMode()) {
      try {
        const response = await ApiService.restoreAdminCategory(catId);
        return {
          success: true,
          message: "Khôi phục danh mục thành công.",
          data: response,
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || "Lỗi khi khôi phục danh mục.",
          error_code: err.status || 500,
        };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 250));

    const success = mockRestoreCategory(catId);
    if (success) {
      return {
        success: true,
        message: "Khôi phục danh mục thành công.",
      };
    }

    return {
      success: false,
      message: "Không tìm thấy danh mục để khôi phục hoặc lỗi hệ thống.",
      error_code: 404,
    };
  },
};
