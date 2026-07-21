/**
 * API Layer cho Module ADM-06: Quản lý danh mục khóa học
 * Hoàn toàn đồng bộ với Unified Mock Database qua mock-repository.js.
 */

import {
  getCategories as getRepoCategories,
  getRawCategories,
  getCategoryById,
  createCategory as createRepoCategory,
  updateCategory as updateRepoCategory,
  deleteCategory as deleteRepoCategory,
  restoreCategory as restoreRepoCategory,
  getCourses
} from "../mocks/mock-repository.js";

// Cấu hình nguồn dữ liệu: true để dùng mock (localStorage), false để gọi API thật
const USE_MOCK = true;
const API_BASE_URL = "/api/admin/categories";

/**
 * Tính số lượng khóa học active thuộc mỗi danh mục
 */
function getCategoryCourseCounts() {
  const courses = getCourses();
  const activeCourses = courses.filter(c => c.deleted_at === null);
  const counts = {};
  
  activeCourses.forEach(course => {
    const catIds = course.category_ids || [];
    catIds.forEach(catId => {
      counts[catId] = (counts[catId] || 0) + 1;
    });
  });
  
  return counts;
}

/**
 * Kiểm tra xem targetParentId có phải là con cháu (descendant) của catId hay không
 */
function isDescendant(catId, targetParentId, allCats) {
  const children = allCats.filter(c => c.parent_id === catId && c.deleted_at === null);
  if (children.some(child => child.id === targetParentId)) {
    return true;
  }
  return children.some(child => isDescendant(child.id, targetParentId, allCats));
}

/**
 * Lấy danh sách danh mục (phân trang, lọc, sắp xếp)
 */
export async function getCategories(params = {}) {
  if (!USE_MOCK) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}?${query}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // --- Xử lý MOCK DATA ---
  await new Promise(resolve => setTimeout(resolve, 350));

  try {
    const rawCategories = getRawCategories();
    const activeRepoCategories = rawCategories.filter(c => c.deleted_at === null);
    const courseCounts = getCategoryCourseCounts();

    // 1. Tính toán các chỉ số thống kê (Summary) trên toàn bộ danh sách chưa bị xóa
    const summary = {
      total_categories: activeRepoCategories.length,
      active_categories: activeRepoCategories.filter(c => c.status === "active").length,
      inactive_categories: activeRepoCategories.filter(c => c.status === "inactive").length,
      root_categories: activeRepoCategories.filter(c => c.parent_id === null).length,
      empty_categories: activeRepoCategories.filter(c => (courseCounts[c.id] || 0) === 0).length
    };

    // 2. Lọc dữ liệu
    let filtered = [];
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

    // Lọc theo trạng thái status (nếu không phải deleted hay all_with_deleted)
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
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      } else if (sortBy === "oldest") {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
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

    // 5. Phân trang
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
  } catch (error) {
    console.error("Lỗi Mock API getCategories:", error);
    return {
      success: false,
      message: "Lỗi hệ thống khi tải danh sách danh mục.",
      error_code: 500
    };
  }
}

/**
 * Lấy chi tiết một danh mục kèm danh mục con (children) và cha (parent)
 */
export async function getCategory(id) {
  const catId = Number(id);
  if (!USE_MOCK) {
    const response = await fetch(`${API_BASE_URL}/${catId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  await new Promise(resolve => setTimeout(resolve, 200));

  const rawCategories = getRepoCategories();
  const category = rawCategories.find(c => c.id === catId);

  if (!category) {
    return {
      success: false,
      message: "Không tìm thấy danh mục.",
      error_code: 404
    };
  }

  const courseCounts = getCategoryCourseCounts();
  const parentObj = category.parent_id ? rawCategories.find(p => p.id === category.parent_id) : null;
  const childrenObj = rawCategories.filter(c => c.parent_id === catId);

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
}

/**
 * Tạo mới danh mục
 */
export async function createCategory(payload) {
  if (!USE_MOCK) {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      if (response.status === 422) {
        const errData = await response.json();
        return { success: false, errors: errData.errors, error_code: 422 };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  await new Promise(resolve => setTimeout(resolve, 300));

  // Validate phía client
  const errors = {};
  if (!payload.name || payload.name.trim() === "") {
    errors.name = ["Tên danh mục là bắt buộc."];
  }
  if (!payload.slug || payload.slug.trim() === "") {
    errors.slug = ["Slug danh mục là bắt buộc."];
  } else if (!/^[a-z0-9-]+$/.test(payload.slug)) {
    errors.slug = ["Slug chỉ được chứa chữ thường, số và ký tự gạch ngang."];
  }

  const rawCategories = getRepoCategories();

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

  const newCategory = createRepoCategory(payload);
  return {
    success: true,
    message: "Tạo danh mục thành công.",
    data: newCategory
  };
}

/**
 * Cập nhật danh mục
 */
export async function updateCategory(id, payload) {
  const catId = Number(id);
  if (!USE_MOCK) {
    const response = await fetch(`${API_BASE_URL}/${catId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      if (response.status === 422) {
        const errData = await response.json();
        return { success: false, errors: errData.errors, error_code: 422 };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  await new Promise(resolve => setTimeout(resolve, 300));

  const rawCategories = getRepoCategories();
  const originalCategory = rawCategories.find(c => c.id === catId);
  if (!originalCategory) {
    return {
      success: false,
      message: "Không tìm thấy danh mục để cập nhật.",
      error_code: 404
    };
  }

  const errors = {};
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

  const updatedCategory = updateRepoCategory(catId, payload);
  return {
    success: true,
    message: "Cập nhật danh mục thành công.",
    data: updatedCategory
  };
}

/**
 * Xóa danh mục (xóa mềm)
 */
export async function deleteCategory(id) {
  const catId = Number(id);
  if (!USE_MOCK) {
    const response = await fetch(`${API_BASE_URL}/${catId}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      if (response.status === 409) {
        const errData = await response.json();
        return { success: false, message: errData.message, error_code: 409 };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  await new Promise(resolve => setTimeout(resolve, 250));

  const rawCategories = getRepoCategories();
  const category = rawCategories.find(c => c.id === catId);
  if (!category) {
    return {
      success: false,
      message: "Không tìm thấy danh mục để xóa.",
      error_code: 404
    };
  }

  // 1. Kiểm tra xem còn danh mục con nào không
  const hasChildren = rawCategories.some(c => c.parent_id === catId);
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

  const success = deleteRepoCategory(catId);
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
}

/**
 * Tách hàm softDeleteCategory để chuẩn bị cho việc kết nối API thật
 */
export const softDeleteCategory = deleteCategory;

/**
 * Khôi phục danh mục đã xóa mềm
 */
export async function restoreCategory(id) {
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

  const success = restoreRepoCategory(catId);
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
