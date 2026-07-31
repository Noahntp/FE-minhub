import { Category } from "./categories.types";

interface TreeNode extends Category {
  childrenNodes: TreeNode[];
}

/**
 * Dựng cấu trúc cây đệ quy từ mảng danh mục phẳng
 */
export function buildTree(items: Category[]): TreeNode[] {
  const itemMap: Record<number, TreeNode> = {};
  
  // Khởi tạo TreeNode cho tất cả items
  items.forEach(item => {
    itemMap[item.id] = {
      ...item,
      childrenNodes: []
    };
  });
  
  const rootNodes: TreeNode[] = [];
  
  items.forEach(item => {
    const node = itemMap[item.id];
    if (item.parent_id !== null && itemMap[item.parent_id]) {
      itemMap[item.parent_id].childrenNodes.push(node);
    } else {
      // Nếu parent_id không tồn tại trong map (hoặc null), coi là root
      rootNodes.push(node);
    }
  });

  // Sắp xếp các node theo sort_order và name
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      const sa = a.sort_order || 0;
      const sb = b.sort_order || 0;
      if (sa > 0 && sb > 0) {
        if (sa !== sb) return sa - sb;
        return (a.name || "").localeCompare(b.name || "", "vi");
      }
      if (sa > 0 && sb === 0) return -1;
      if (sa === 0 && sb > 0) return 1;
      return (a.name || "").localeCompare(b.name || "", "vi");
    });
    nodes.forEach(node => {
      if (node.childrenNodes.length > 0) {
        sortNodes(node.childrenNodes);
      }
    });
  };

  sortNodes(rootNodes);
  return rootNodes;
}

/**
 * Thuật toán lọc cây và làm phẳng cây dành cho Tree View:
 * - Khi status lọc khác rỗng (ví dụ: status=active hoặc status=inactive):
 *   + Giữ lại danh mục khớp status (matched) và các tổ tiên của chúng (retained).
 *   + Các tổ tiên không khớp status được đánh dấu là `isContextual = true`.
 *   + Loại bỏ các nhánh con không khớp status.
 * - Tính toán: `depth`, `hasChildren` thực tế hiển thị, `visible` dựa trên `expandedCategoryIds`.
 * - Tách biệt các biến đếm phân trang.
 */
export function processTreeViewData(
  allCategories: Category[],
  filters: {
    status?: string;
    search?: string;
    type?: string;
    parent_id?: string;
    empty?: string;
  },
  expandedCategoryIds: Set<number>
): {
  processedList: Category[];
  totalRootBranches: number;
  matchedCategoryCount: number;
  contextualRowCount: number;
  qualifyingRootIds: number[];
} {
  const statusFilter = filters.status || "";
  const searchFilter = filters.search ? filters.search.toLowerCase().trim() : "";
  const typeFilter = filters.type || "";
  const parentIdFilter = filters.parent_id || "";
  const emptyFilter = filters.empty || "";

  // 1. Dựng cây đầy đủ từ tất cả các danh mục
  const fullTree = buildTree(allCategories);
  
  // Xác định matched IDs
  const matchedIds = new Set<number>();
  let matchedCount = 0;
  
  allCategories.forEach(c => {
    let match = true;
    
    if (statusFilter && statusFilter !== "all" && statusFilter !== "deleted" && statusFilter !== "all_with_deleted") {
      if (c.status !== statusFilter) match = false;
    }
    if (searchFilter) {
      const nameMatch = c.name && c.name.toLowerCase().includes(searchFilter);
      const slugMatch = c.slug && c.slug.toLowerCase().includes(searchFilter);
      if (!nameMatch && !slugMatch) {
        match = false;
      }
    }
    if (typeFilter) {
      if (typeFilter === "root" && c.parent_id !== null) {
        match = false;
      } else if (typeFilter === "child" && c.parent_id === null) {
        match = false;
      }
    }
    if (parentIdFilter) {
      if (String(c.parent_id) !== String(parentIdFilter)) {
        match = false;
      }
    }
    if (emptyFilter === "true") {
      if ((c.course_count || 0) > 0) {
        match = false;
      }
    }
    
    if (match) {
      matchedIds.add(c.id);
      matchedCount++;
    }
  });

  // Có bộ lọc active nào không
  const hasActiveFilter = !!(statusFilter || searchFilter || typeFilter || parentIdFilter || emptyFilter === "true");

  // retainedIds gồm matched IDs và tổ tiên của chúng
  const retainedIds = new Set<number>();
  const autoExpandIds = new Set<number>(); // Các ID cha tự động expand vì có con cháu khớp

  const markAncestors = (catId: number) => {
    retainedIds.add(catId);
    const cat = allCategories.find(c => c.id === catId);
    if (cat && cat.parent_id !== null) {
      autoExpandIds.add(cat.parent_id); // Tự động mở cha chứa nó
      markAncestors(cat.parent_id);
    }
  };

  if (hasActiveFilter) {
    matchedIds.forEach(id => {
      markAncestors(id);
    });
  } else {
    allCategories.forEach(c => retainedIds.add(c.id));
  }

  // 2. Hàm lọc cây đệ quy để chỉ giữ lại các node thuộc retainedIds
  const filterTree = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .filter(node => retainedIds.has(node.id))
      .map(node => ({
        ...node,
        childrenNodes: filterTree(node.childrenNodes)
      }));
  };

  const filteredTree = filterTree(fullTree);

  // 3. Qualifying Root Branches
  const qualifyingRootIds = filteredTree.map(node => node.id);
  const totalRootBranches = qualifyingRootIds.length;

  const resultList: Category[] = [];
  let contextualCount = 0;

  // 4. Hàm làm phẳng cây và gán các thuộc tính hiển thị
  const traverseAndFlatten = (
    nodes: TreeNode[],
    depth: number,
    parentExpanded: boolean,
    parentVisible: boolean,
    parentDisplayOrder: string = ""
  ) => {
    nodes.forEach((node, idx) => {
      // Tính toán displayOrder của node hiện tại
      let displayOrder = "";
      if (depth === 0) {
        displayOrder = String(idx + 1);
      } else {
        displayOrder = parentDisplayOrder ? `${parentDisplayOrder}.${idx + 1}` : String(idx + 1);
      }

      // Nếu có filter active, tự động expand các node thuộc autoExpandIds để hiện con cháu khớp
      const isExpanded = hasActiveFilter 
        ? (autoExpandIds.has(node.id) || expandedCategoryIds.has(node.id))
        : expandedCategoryIds.has(node.id);
      
      const hasChildren = node.childrenNodes.length > 0;
      const visible = depth === 0 ? true : (parentExpanded && parentVisible);
      
      const isMatched = hasActiveFilter ? matchedIds.has(node.id) : true;
      const isContextual = !isMatched;
      
      if (isContextual) {
        contextualCount++;
      }

      resultList.push({
        id: node.id,
        parent_id: node.parent_id,
        name: node.name,
        slug: node.slug,
        description: node.description,
        sort_order: node.sort_order,
        status: node.status,
        created_at: node.created_at,
        updated_at: node.updated_at,
        deleted_at: node.deleted_at,
        course_count: node.course_count,
        parent: node.parent,
        depth,
        hasChildren,
        isExpanded,
        visible,
        isContextual,
        displayOrder
      });

      if (hasChildren) {
        traverseAndFlatten(node.childrenNodes, depth + 1, isExpanded, visible, displayOrder);
      }
    });
  };

  traverseAndFlatten(filteredTree, 0, true, true, "");

  return {
    processedList: resultList,
    totalRootBranches,
    matchedCategoryCount: matchedCount,
    contextualRowCount: contextualCount,
    qualifyingRootIds
  };
}

/**
 * Phân trang Tree View ở client dựa trên danh mục gốc (Root Branches)
 */
export function paginateTreeView(
  processedList: Category[],
  qualifyingRootIds: number[],
  page: number,
  perPage: number
): Category[] {
  // Lấy danh sách root IDs hiển thị ở trang hiện tại
  const startIndex = (page - 1) * perPage;
  const paginatedRootIds = new Set(qualifyingRootIds.slice(startIndex, startIndex + perPage));

  return processedList.map(item => {
    // Tìm tổ tiên gốc (root) của node hiện tại trong processedList
    let current: Category | undefined = item;
    while (current && current.parent_id !== null) {
      const parentId = current.parent_id;
      current = processedList.find(c => c.id === parentId);
    }
    
    const rootId = current ? current.id : item.id;
    const isRootInCurrentPage = paginatedRootIds.has(rootId);
    
    // Node chỉ visible thực tế nếu: root của nó thuộc trang hiện tại,
    // và các thuộc tính visible phân cấp (cha expand) thỏa mãn.
    return {
      ...item,
      visible: isRootInCurrentPage ? item.visible : false
    };
  });
}
