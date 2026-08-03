import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import * as usersApi from "@/assets/js/api/users-api.js";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import FilterSelect, { SelectOption } from "./FilterSelect";

const CURRENT_ADMIN_ID = 1;

// Colors definitions matching business logic
const roleOptions: SelectOption[] = [
  {
    value: "",
    label: "Tất cả vai trò",
    colorClass: "text-neutral-700",
    hoverBgClass: "hover:bg-neutral-50",
  },
  {
    value: "learner",
    label: "Học viên",
    colorClass: "text-blue-600",
    hoverBgClass: "hover:bg-blue-50",
  },
  {
    value: "instructor",
    label: "Giảng viên",
    colorClass: "text-emerald-600",
    hoverBgClass: "hover:bg-emerald-50",
  },
  {
    value: "admin",
    label: "Quản trị viên",
    colorClass: "text-purple-600",
    hoverBgClass: "hover:bg-purple-50",
  },
];

const statusOptions: SelectOption[] = [
  {
    value: "",
    label: "Tất cả trạng thái",
    colorClass: "text-neutral-700",
    hoverBgClass: "hover:bg-neutral-50",
  },
  {
    value: "active",
    label: "Đang hoạt động",
    colorClass: "text-emerald-600",
    hoverBgClass: "hover:bg-emerald-50",
  },
  {
    value: "inactive",
    label: "Không hoạt động",
    colorClass: "text-neutral-500",
    hoverBgClass: "hover:bg-neutral-50",
  },
  {
    value: "locked",
    label: "Đã khóa",
    colorClass: "text-red-600",
    hoverBgClass: "hover:bg-red-50",
  },
];

const verifiedOptions: SelectOption[] = [
  {
    value: "",
    label: "Tất cả xác minh",
    colorClass: "text-neutral-700",
    hoverBgClass: "hover:bg-neutral-50",
  },
  {
    value: "verified",
    label: "Đã xác minh",
    colorClass: "text-emerald-600",
    hoverBgClass: "hover:bg-emerald-50",
  },
  {
    value: "unverified",
    label: "Chưa xác minh",
    colorClass: "text-orange-600",
    hoverBgClass: "hover:bg-orange-50",
  },
];

const sortOptions: SelectOption[] = [
  {
    value: "newest",
    label: "Mới nhất",
    colorClass: "text-blue-600",
    hoverBgClass: "hover:bg-blue-50",
  },
  {
    value: "oldest",
    label: "Cũ nhất",
    colorClass: "text-neutral-500",
    hoverBgClass: "hover:bg-neutral-50",
  },
  {
    value: "name_asc",
    label: "Tên A–Z",
    colorClass: "text-purple-600",
    hoverBgClass: "hover:bg-purple-50",
  },
  {
    value: "name_desc",
    label: "Tên Z–A",
    colorClass: "text-purple-600",
    hoverBgClass: "hover:bg-purple-50",
  },
  {
    value: "last_login",
    label: "Lần đăng nhập gần nhất",
    colorClass: "text-teal-600",
    hoverBgClass: "hover:bg-teal-50",
  },
];

const timeOptions: SelectOption[] = [
  {
    value: "all",
    label: "Tất cả thời gian",
    colorClass: "text-neutral-700",
    hoverBgClass: "hover:bg-neutral-50",
  },
  {
    value: "today",
    label: "Hôm nay",
    colorClass: "text-emerald-600",
    hoverBgClass: "hover:bg-emerald-50",
  },
  {
    value: "7_days",
    label: "7 ngày qua",
    colorClass: "text-blue-600",
    hoverBgClass: "hover:bg-blue-50",
  },
  {
    value: "30days",
    label: "30 ngày qua",
    colorClass: "text-purple-600",
    hoverBgClass: "hover:bg-purple-50",
  },
  {
    value: "thisMonth",
    label: "Tháng này",
    colorClass: "text-orange-600",
    hoverBgClass: "hover:bg-orange-50",
  },
  {
    value: "custom",
    label: "Tùy chọn",
    colorClass: "text-rose-700",
    hoverBgClass: "hover:bg-rose-50",
  },
];

// User Status Dot Marker
function UserStatusMarker({
  locked,
  status,
  effectiveStatus,
}: {
  locked: boolean;
  status: string;
  effectiveStatus: string;
}) {
  const isLocked =
    locked || status === "locked" || effectiveStatus === "locked";

  if (isLocked) {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-red-600 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
        Đã khóa
      </span>
    );
  }

  if (status === "inactive" || effectiveStatus === "inactive") {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-neutral-500 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
        Không hoạt động
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
      Đang hoạt động
    </span>
  );
}

export default function UsersManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State from URL search params
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "";
  const email_verified = searchParams.get("email_verified") || "";
  const sort_by = searchParams.get("sort_by") || "newest";
  const time_preset = searchParams.get("time_preset") || "all";
  const date_from = searchParams.get("date_from") || "";
  const date_to = searchParams.get("date_to") || "";
  const no_login = searchParams.get("no_login") || "";
  const page = Number(searchParams.get("page")) || 1;
  const per_page = Number(searchParams.get("per_page")) || 20;

  // Local Form date states
  const [formDateFrom, setFormDateFrom] = useState(date_from);
  const [formDateTo, setFormDateTo] = useState(date_to);

  // Sync date form states when URL params change
  useEffect(() => {
    setFormDateFrom(date_from);
    setFormDateTo(date_to);
  }, [date_from, date_to]);

  // Data State
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("---");

  // Interactive UI State
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
    new Set(),
  );
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<
    string | null
  >(null);
  const [activeColumnMenu, setActiveColumnMenu] = useState<string | null>(null);
  const [activeActionMenu, setActiveActionMenu] = useState<number | null>(null);

  // Drawer / Modals State
  const [activeDetailUser, setActiveDetailUser] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role: "learner",
    status: "active",
    locked_reason: "",
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string[]>>(
    {},
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: 0,
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role: "learner",
    status: "active",
    locked_reason: "",
  });
  const [editErrors, setEditErrors] = useState<Record<string, string[]>>({});

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: "lock" | "unlock" | "activate" | "deactivate" | "";
    user: any | null;
    reason?: string;
    error?: string;
  }>({
    open: false,
    type: "",
    user: null,
    reason: "",
    error: "",
  });

  // Sync window clicks to auto-close dropdown menus
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-column-menu]")) {
        setActiveColumnMenu(null);
      }
      if (!target.closest("[data-action-td]")) {
        setActiveActionMenu(null);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Update query params helper
  const updateFilters = (newFilters: Record<string, any>) => {
    const nextParams = new URLSearchParams(searchParams);

    // Automatically reset page when filter changes (excluding manual page change)
    let resetPage = true;
    if (newFilters.page !== undefined) {
      resetPage = false;
    }

    Object.keys(newFilters).forEach((key) => {
      const val = newFilters[key];
      if (val === undefined || val === null || val === "") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(val));
      }
    });

    if (resetPage) {
      nextParams.delete("page");
    }

    setSearchParams(nextParams);
  };

  const handleQuickFilter = (
    newFilters: Record<string, any>,
    toastMsg?: string,
  ) => {
    updateFilters(newFilters);
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    if (toastMsg) toast.success(toastMsg);
  };

  const handleResetFilters = () => {
    setFormDateFrom("");
    setFormDateTo("");
    setSearchParams(new URLSearchParams());
    setSelectedUserIds(new Set());
    setActiveFilterDropdown(null);
  };

  // Date conversion helpers
  const getDatesFromPreset = (preset: string) => {
    const now = new Date("2026-06-30");
    let computedFrom = "";
    let computedTo = now.toISOString().split("T")[0];

    if (preset === "today") {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      computedFrom = d.toISOString().split("T")[0];
    } else if (preset === "7_days") {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      computedFrom = d.toISOString().split("T")[0];
    } else if (preset === "30days") {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      computedFrom = d.toISOString().split("T")[0];
    } else if (preset === "thisMonth") {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      computedFrom = d.toISOString().split("T")[0];
    }
    return { computedFrom, computedTo };
  };

  const tableRef = React.useRef<HTMLDivElement>(null);

  // Fetch Users Function
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        search,
        role,
        status,
        email_verified,
        sort_by,
        no_login,
        page,
        per_page,
      };

      if (time_preset === "custom") {
        params.date_from = date_from;
        params.date_to = date_to;
      } else if (time_preset !== "all") {
        const { computedFrom, computedTo } = getDatesFromPreset(time_preset);
        params.date_from = computedFrom;
        params.date_to = computedTo;
      }

      const res = await usersApi.getUsers(params);
      if (res && res.success) {
        setData(res.data);

        // Auto reset checkbox selection on refetch
        setSelectedUserIds(new Set());

        // Validate current page range
        if (res.meta && page > res.meta.last_page) {
          updateFilters({ page: 1 });
        }

        // Auto scroll to table if filtering from dashboard
        if (status) {
          setTimeout(() => {
            tableRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 100);
        }
      } else {
        setError(res ? res.message : "Đã có lỗi xảy ra.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
      const now = new Date();
      setLastUpdated(
        `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`,
      );
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [
    search,
    role,
    status,
    email_verified,
    sort_by,
    time_preset,
    date_from,
    date_to,
    no_login,
    page,
    per_page,
  ]);

  // Handle open drawer from query parameters (dashboard deep linking)
  useEffect(() => {
    const openId = Number(searchParams.get("open_user_id"));
    if (openId && openId > 0 && data?.items) {
      const target = data.items.find((u: any) => u.id === openId);
      if (target) {
        setActiveDetailUser(target);
        setIsDrawerOpen(true);
        // clean parameter to avoid repeatedly opening
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("open_user_id");
        setSearchParams(nextParams, { replace: true });
      }
    }
  }, [searchParams, data]);

  // Date Formatter helper
  const formatDateTime = (isoString: string) => {
    if (!isoString) return "---";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "---";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Checkbox handlers
  const handleCheckAll = (checked: boolean) => {
    if (!data?.items) return;
    const items = data.items.filter((u: any) => u.id !== CURRENT_ADMIN_ID);
    if (checked) {
      setSelectedUserIds(new Set(items.map((u: any) => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleCheckUser = (userId: number, checked: boolean) => {
    const nextSet = new Set(selectedUserIds);
    if (checked) {
      nextSet.add(userId);
    } else {
      nextSet.delete(userId);
    }
    setSelectedUserIds(nextSet);
  };

  // Action drawer triggers
  const openDetailDrawer = async (userId: number) => {
    try {
      const res = await usersApi.getUser(userId);
      if (res && res.success) {
        setActiveDetailUser(res.data);
        setIsDrawerOpen(true);
      } else {
        toast.error(res ? res.message : "Không thể lấy thông tin người dùng.");
      }
    } catch (e) {
      toast.error("Lỗi khi tải chi tiết người dùng.");
    }
  };

  const handleOpenEditModal = (user: any) => {
    setEditFormData({
      id: user.id,
      full_name: user.full_name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      role: user.role || "learner",
      status: user.status || "active",
      locked_reason: user.locked_reason || "",
    });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  // API submit triggers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateErrors({});

    // Basic validation
    const errors: Record<string, string[]> = {};
    if (!createFormData.full_name.trim())
      errors.full_name = ["Họ và tên không được để trống"];
    if (!createFormData.email.trim()) {
      errors.email = ["Email không được để trống"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createFormData.email)) {
      errors.email = ["Email không hợp lệ"];
    }
    if (!createFormData.password) {
      errors.password = ["Mật khẩu không được để trống"];
    } else if (createFormData.password.length < 6) {
      errors.password = ["Mật khẩu phải có ít nhất 6 ký tự"];
    }
    if (
      createFormData.phone &&
      !/^[0-9]{10,11}$/.test(createFormData.phone.replace(/[\s-]/g, ""))
    ) {
      errors.phone = ["Số điện thoại không hợp lệ"];
    }
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    try {
      const res = await usersApi.createUser(createFormData);
      if (res.success) {
        toast.success("Thêm người dùng thành công.");
        setIsCreateModalOpen(false);
        setCreateFormData({
          full_name: "",
          email: "",
          password: "",
          phone: "",
          role: "learner",
          status: "active",
          locked_reason: "",
        });
        fetchUsers();
      } else if (res.errors) {
        setCreateErrors(res.errors);
      } else {
        toast.error(res.message || "Lỗi khi tạo người dùng.");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi hệ thống.");
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrors({});

    // Safety check: Admin cannot lock himself
    if (editFormData.id === CURRENT_ADMIN_ID) {
      if (editFormData.status === "locked") {
        toast.error("Bạn không thể tự khóa tài khoản của chính mình.");
        return;
      }
    }

    try {
      const res = await usersApi.updateUser(editFormData.id, editFormData);
      if (res.success) {
        toast.success("Cập nhật người dùng thành công.");
        setIsEditModalOpen(false);
        fetchUsers();
        if (isDrawerOpen && activeDetailUser?.id === editFormData.id) {
          openDetailDrawer(editFormData.id);
        }
      } else if (res.errors) {
        setEditErrors(res.errors);
      } else {
        toast.error(res.message || "Lỗi khi cập nhật người dùng.");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi hệ thống.");
    }
  };

  const handleConfirmSubmit = async () => {
    const { type, user, reason } = confirmModal;
    if (!user) return;

    // Safety checks
    if (
      user.id === CURRENT_ADMIN_ID &&
      (type === "lock" || type === "deactivate")
    ) {
      toast.error("Bạn không thể tự khóa tài khoản của chính mình.");
      return;
    }

    try {
      let res: any;
      if (type === "lock") {
        if (!reason || reason.trim() === "") {
          setConfirmModal((prev) => ({
            ...prev,
            error: "Lý do khóa là bắt buộc.",
          }));
          return;
        }
        res = await usersApi.updateUser(user.id, {
          status: "locked",
          locked: true,
          locked_reason: reason,
        });
      } else if (type === "unlock") {
        res = await usersApi.updateUser(user.id, {
          locked: false,
          status: "active",
        });
      } else if (type === "activate") {
        res = await usersApi.updateUser(user.id, {
          status: "active",
        });
      } else if (type === "deactivate") {
        res = await usersApi.updateUser(user.id, {
          status: "inactive",
        });
      }

      if (res && res.success) {
        toast.success(res.message || "Thao tác thành công.");
        setConfirmModal({
          open: false,
          type: "",
          user: null,
          reason: "",
          error: "",
        });
        fetchUsers();
        if (isDrawerOpen && activeDetailUser?.id === user.id) {
          openDetailDrawer(user.id);
        }
      } else {
        toast.error(res ? res.message : "Thao tác thất bại.");
        setConfirmModal((prev) => ({
          ...prev,
          error: res ? res.message : "Lỗi hệ thống.",
        }));
      }
    } catch (e) {
      toast.error("Đã xảy ra lỗi khi thực thi thao tác.");
    }
  };

  // Quick Action triggers
  const handleQuickAction = (action: string, user: any) => {
    if (action === "view") {
      openDetailDrawer(user.id);
    } else if (action === "edit") {
      handleOpenEditModal(user);
    } else if (action === "lock") {
      if (user.id === CURRENT_ADMIN_ID) {
        toast.error("Bạn không thể tự khóa tài khoản của chính mình.");
        return;
      }
      setConfirmModal({
        open: true,
        type: "lock",
        user,
        reason: "",
        error: "",
      });
    } else if (action === "unlock") {
      setConfirmModal({
        open: true,
        type: "unlock",
        user,
        reason: "",
        error: "",
      });
    } else if (action === "activate") {
      setConfirmModal({
        open: true,
        type: "activate",
        user,
        reason: "",
        error: "",
      });
    } else if (action === "deactivate") {
      if (user.id === CURRENT_ADMIN_ID) {
        toast.error("Bạn không thể tự vô hiệu hóa tài khoản của chính mình.");
        return;
      }
      setConfirmModal({
        open: true,
        type: "deactivate",
        user,
        reason: "",
        error: "",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Title Header & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-tight flex items-center gap-2">
            Quản lý người dùng
          </h1>
          <p className="text-xs text-mid-gray mt-0.5" id="page-description">
            Quản lý tài khoản học viên, giảng viên và quản trị viên trong hệ
            thống. Tổng số:{" "}
            <span className="font-bold text-ink">
              {data?.summary?.total_users || 0}
            </span>{" "}
            tài khoản.
          </p>
          <p className="text-[10px] text-mid-gray/80 mt-1">
            Cập nhật lần cuối:{" "}
            <span className="font-medium text-mid-gray">{lastUpdated}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="h-9 w-9 flex items-center justify-center rounded-full border border-hairline hover:bg-canvas text-ink shrink-0 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            aria-label="Làm mới dữ liệu"
          >
            <svg
              className={cn("w-4 h-4 text-ink", loading && "animate-spin")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              setCreateFormData({
                full_name: "",
                email: "",
                password: "",
                phone: "",
                role: "learner",
                status: "active",
                locked_reason: "",
              });
              setCreateErrors({});
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer border-none"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {loading && !data ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[92px]"
            >
              <div className="h-3 w-16 bg-canvas rounded-full skeleton"></div>
              <div className="h-6 w-10 bg-canvas rounded-full skeleton"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            type="button"
            onClick={() =>
              handleQuickFilter(
                { role: "", status: "", email_verified: "", no_login: "" },
                "Đang lọc: Tất cả người dùng",
              )
            }
            className="w-full text-left rounded-[6px] border border-mid-gray/45 bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px] hover:border-mid-gray/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-mid-gray">
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Tổng người dùng
              </span>
              <svg
                className="w-4 h-4 text-mid-gray/80 group-hover:text-ink transition-colors"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="mt-2">
              <span className="text-xl lg:text-2xl font-bold text-ink leading-none font-sans">
                {data?.summary?.total_users || 0}
              </span>
              <p className="text-[9px] text-mid-gray mt-1 flex items-center gap-1">
                Hệ thống (
                <span className="text-success font-semibold">
                  +{data?.summary?.new_users_in_period || 0} mới
                </span>
                )
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickFilter(
                {
                  role: "learner",
                  status: "",
                  email_verified: "",
                  no_login: "",
                },
                "Đang lọc: Học viên",
              )
            }
            className="w-full text-left rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px] hover:border-mid-gray/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-mid-gray">
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Học viên
              </span>
              <svg
                className="w-4 h-4 text-mid-gray/80 group-hover:text-ink transition-colors"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14v7M4.67 10v6c0 1 3 3 7.33 3s7.33-2 7.33-3v-6" />
              </svg>
            </div>
            <div className="mt-2">
              <span className="text-xl lg:text-2xl font-bold text-ink leading-none font-sans">
                {data?.summary?.total_learners || 0}
              </span>
              <p className="text-[9px] text-mid-gray mt-1">
                Đang hoạt động học tập
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickFilter(
                {
                  role: "instructor",
                  status: "",
                  email_verified: "",
                  no_login: "",
                },
                "Đang lọc: Giảng viên",
              )
            }
            className="w-full text-left rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px] hover:border-mid-gray/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-mid-gray">
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Giảng viên
              </span>
              <svg
                className="w-4 h-4 text-mid-gray/80 group-hover:text-ink transition-colors"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 9h-6M19 6v6" />
              </svg>
            </div>
            <div className="mt-2">
              <span className="text-xl lg:text-2xl font-bold text-ink leading-none font-sans">
                {data?.summary?.total_instructors || 0}
              </span>
              <p className="text-[9px] text-mid-gray mt-1">
                Giảng dạy chuyên môn
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickFilter(
                {
                  status: "active",
                  role: "",
                  email_verified: "",
                  no_login: "",
                },
                "Đang lọc: Trạng thái đang hoạt động",
              )
            }
            className="w-full text-left rounded-[6px] border border-hairline border-t-2 border-t-success bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px] hover:border-mid-gray/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-mid-gray">
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Đang hoạt động
              </span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-success"></span>
            </div>
            <div className="mt-2">
              <span className="text-xl lg:text-2xl font-bold text-success leading-none font-sans">
                {data?.summary?.active_users || 0}
              </span>
              <p className="text-[9px] text-mid-gray mt-1">
                Khả dụng đăng nhập
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickFilter(
                {
                  status: "locked",
                  role: "",
                  email_verified: "",
                  no_login: "",
                },
                "Đang lọc: Trạng thái đã khóa",
              )
            }
            className="w-full text-left rounded-[6px] border border-hairline border-t-2 border-t-danger-brick bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px] hover:border-mid-gray/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-mid-gray">
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Đã khóa
              </span>
              <svg
                className="w-4 h-4 text-danger-brick/80"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="mt-2">
              <span className="text-xl lg:text-2xl font-bold text-danger-brick leading-none font-sans">
                {data?.summary?.locked_users || 0}
              </span>
              <p className="text-[9px] text-mid-gray mt-1">
                Đình chỉ hoạt động
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickFilter(
                {
                  email_verified: "unverified",
                  role: "",
                  status: "",
                  no_login: "",
                },
                "Đang lọc: Chưa xác minh email",
              )
            }
            className="w-full text-left rounded-[6px] border border-hairline border-t-2 border-t-warning bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px] hover:border-mid-gray/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-mid-gray">
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Chưa xác minh
              </span>
              <svg
                className="w-4 h-4 text-warning/80"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <div className="mt-2">
              <span className="text-xl lg:text-2xl font-bold text-warning leading-none font-sans">
                {data?.summary?.unverified_users || 0}
              </span>
              <p className="text-[9px] text-mid-gray mt-1">
                Chưa xác thực email
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Attention banner */}
      <div className="rounded-[6px] border border-hairline bg-surface-alt p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-mid-gray">
          <svg
            className="w-4 h-4 text-warning"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <span className="font-bold text-ink uppercase tracking-wider text-[10px]">
            Tài khoản cần chú ý:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 flex-grow md:justify-start md:pl-6 text-mid-gray">
          <div className="flex items-center">
            <span>
              •{" "}
              <span className="font-bold text-ink">
                {data?.summary?.locked_users || 0}
              </span>{" "}
              tài khoản bị khóa
            </span>
            <button
              type="button"
              onClick={() =>
                handleQuickFilter(
                  {
                    status: "locked",
                    role: "",
                    email_verified: "",
                    no_login: "",
                  },
                  "Đang lọc: Trạng thái đã khóa",
                )
              }
              className="text-[10px] text-mid-gray underline hover:text-ink font-semibold ml-1.5 transition-colors cursor-pointer bg-transparent border-none font-sans"
            >
              Xem danh sách
            </button>
          </div>
          <div className="flex items-center">
            <span>
              •{" "}
              <span className="font-bold text-ink">
                {data?.summary?.unverified_users || 0}
              </span>{" "}
              chưa xác minh email
            </span>
            <button
              type="button"
              onClick={() =>
                handleQuickFilter(
                  {
                    email_verified: "unverified",
                    role: "",
                    status: "",
                    no_login: "",
                  },
                  "Đang lọc: Chưa xác minh email",
                )
              }
              className="text-[10px] text-mid-gray underline hover:text-ink font-semibold ml-1.5 transition-colors cursor-pointer bg-transparent border-none font-sans"
            >
              Xem danh sách
            </button>
          </div>
          <div className="flex items-center">
            <span>
              •{" "}
              <span className="font-bold text-ink">
                {data?.summary?.no_login_users || 0}
              </span>{" "}
              chưa đăng nhập lần nào
            </span>
            <button
              type="button"
              onClick={() =>
                handleQuickFilter(
                  {
                    no_login: "true",
                    role: "",
                    status: "",
                    email_verified: "",
                  },
                  "Đang lọc: Chưa đăng nhập lần nào",
                )
              }
              className="text-[10px] text-mid-gray underline hover:text-ink font-semibold ml-1.5 transition-colors cursor-pointer bg-transparent border-none font-sans"
            >
              Xem danh sách
            </button>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <section className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-3 p-0">
          <div className="flex flex-wrap lg:flex-nowrap items-end gap-2 w-full">
            {/* Search filter */}
            <div className="flex-1 lg:flex-[1.5] min-w-[120px] lg:min-w-0 flex flex-col gap-1.5">
              <label
                htmlFor="filter-search"
                className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5 select-none"
              >
                Tìm kiếm
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="filter-search"
                  value={search}
                  onChange={(e) =>
                    updateFilters({ search: e.target.value, page: 1 })
                  }
                  placeholder="Tìm theo tên, email, SĐT..."
                  className="w-full h-10 pl-8 pr-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] outline-none text-ink placeholder-mid-gray/70 transition-all font-medium"
                />
                <svg
                  className="w-3.5 h-3.5 text-mid-gray/80 absolute left-3 top-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
            </div>

            {/* Custom Dropdown: Role */}
            <FilterSelect
              label="Vai trò"
              value={role}
              options={roleOptions}
              onChange={(val) => updateFilters({ role: val, page: 1 })}
              placeholder="Tất cả vai trò"
              id="role"
              activeId={activeFilterDropdown}
              setActiveId={setActiveFilterDropdown}
              className="w-[calc(50%-4px)] sm:w-[130px] lg:w-auto lg:flex-1 lg:min-w-0"
            />

            {/* Custom Dropdown: Status */}
            <FilterSelect
              label="Trạng thái"
              value={status}
              options={statusOptions}
              onChange={(val) => updateFilters({ status: val, page: 1 })}
              placeholder="Tất cả trạng thái"
              id="status"
              activeId={activeFilterDropdown}
              setActiveId={setActiveFilterDropdown}
              className="w-[calc(50%-4px)] sm:w-[130px] lg:w-auto lg:flex-1 lg:min-w-0"
            />

            {/* Custom Dropdown: Email Verified */}
            <FilterSelect
              label="Xác minh email"
              value={email_verified}
              options={verifiedOptions}
              onChange={(val) =>
                updateFilters({ email_verified: val, page: 1 })
              }
              placeholder="Tất cả"
              id="verified"
              activeId={activeFilterDropdown}
              setActiveId={setActiveFilterDropdown}
              className="w-[calc(50%-4px)] sm:w-[130px] lg:w-auto lg:flex-1 lg:min-w-0"
            />

            {/* Custom Dropdown: Sort */}
            <FilterSelect
              label="Sắp xếp"
              value={sort_by}
              options={sortOptions}
              onChange={(val) => updateFilters({ sort_by: val, page: 1 })}
              placeholder="Mới nhất"
              id="sort"
              activeId={activeFilterDropdown}
              setActiveId={setActiveFilterDropdown}
              className="w-[calc(50%-4px)] sm:w-[130px] lg:w-auto lg:flex-1 lg:min-w-0"
            />

            {/* Custom Dropdown: Time Preset */}
            <FilterSelect
              label="Thời gian"
              value={time_preset}
              options={timeOptions}
              onChange={(val) => {
                const updates: Record<string, any> = {
                  time_preset: val,
                  page: 1,
                };
                if (val !== "custom") {
                  updates.date_from = "";
                  updates.date_to = "";
                }
                updateFilters(updates);
              }}
              placeholder="Tất cả thời gian"
              id="time"
              activeId={activeFilterDropdown}
              setActiveId={setActiveFilterDropdown}
              className="w-full sm:w-[140px] lg:w-auto lg:flex-1 lg:min-w-0"
            />

            {/* Red reset X button - Locked in row, aligned vertically */}
            <div className="flex flex-col gap-1.5 w-8 shrink-0">
              <span className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5 invisible select-none">
                Reset
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                title="Đặt lại bộ lọc"
                className="h-10 w-8 flex items-center justify-center text-danger-brick hover:bg-red-50/50 border border-hairline rounded-[6px] transition-colors cursor-pointer bg-paper shrink-0"
                aria-label="Đặt lại bộ lọc"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Date Picker Row (only when time_preset === 'custom') */}
          {time_preset === "custom" && (
            <div
              id="custom-date-group"
              className="flex flex-wrap items-center gap-3 pt-3 border-t border-hairline/60"
            >
              <div className="flex items-center gap-2">
                <label
                  htmlFor="filter-date-from"
                  className="text-xs text-mid-gray font-medium"
                >
                  Từ ngày:
                </label>
                <input
                  type="date"
                  id="filter-date-from"
                  value={formDateFrom}
                  onChange={(e) => setFormDateFrom(e.target.value)}
                  aria-label="Từ ngày"
                  className="h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] outline-none text-ink font-semibold"
                />
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="filter-date-to"
                  className="text-xs text-mid-gray font-medium"
                >
                  Đến ngày:
                </label>
                <input
                  type="date"
                  id="filter-date-to"
                  value={formDateTo}
                  onChange={(e) => setFormDateTo(e.target.value)}
                  aria-label="Đến ngày"
                  className="h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] outline-none text-ink font-semibold"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (
                    formDateFrom &&
                    formDateTo &&
                    new Date(formDateTo) < new Date(formDateFrom)
                  ) {
                    toast.error("Đến ngày không được nhỏ hơn Từ ngày.");
                    return;
                  }
                  updateFilters({
                    date_from: formDateFrom,
                    date_to: formDateTo,
                    page: 1,
                  });
                }}
                className="h-10 px-4 text-xs font-semibold rounded-[6px] bg-ink hover:opacity-90 text-white transition-opacity cursor-pointer border-none"
              >
                Áp dụng
              </button>
            </div>
          )}
        </form>
      </section>

      {/* Main Results Table Section */}
      <section
        ref={tableRef}
        id="users-results-section"
        style={{ scrollMarginTop: "80px" }}
        className="rounded-[6px] border border-hairline bg-paper shadow-subtle overflow-hidden flex flex-col min-h-[400px]"
      >
        {/* Quick Tabs */}
        <div className="flex items-center justify-between border-b border-hairline/60 bg-paper shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex" id="quick-tabs-container">
            <button
              type="button"
              onClick={() =>
                handleQuickFilter(
                  { role: "", status: "", email_verified: "", no_login: "" },
                  "Đang xem: Tất cả người dùng",
                )
              }
              className={cn(
                "px-5 py-3 text-xs select-none whitespace-nowrap cursor-pointer transition-all border-b-2 border-none bg-transparent",
                !role && !status && !email_verified && !no_login
                  ? "font-semibold border-ink text-ink border-b-2"
                  : "font-medium border-transparent text-mid-gray hover:text-ink",
              )}
            >
              Tất cả (
              <span className="tab-count">
                {data?.summary?.total_users || 0}
              </span>
              )
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickFilter(
                  {
                    role: "learner",
                    status: "",
                    email_verified: "",
                    no_login: "",
                  },
                  "Đang lọc: Học viên",
                )
              }
              className={cn(
                "px-5 py-3 text-xs select-none whitespace-nowrap cursor-pointer transition-all border-b-2 border-none bg-transparent",
                role === "learner" && !status && !email_verified && !no_login
                  ? "font-semibold border-ink text-ink border-b-2"
                  : "font-medium border-transparent text-mid-gray hover:text-ink",
              )}
            >
              Học viên (
              <span className="tab-count">
                {data?.summary?.total_learners || 0}
              </span>
              )
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickFilter(
                  {
                    role: "instructor",
                    status: "",
                    email_verified: "",
                    no_login: "",
                  },
                  "Đang lọc: Giảng viên",
                )
              }
              className={cn(
                "px-5 py-3 text-xs select-none whitespace-nowrap cursor-pointer transition-all border-b-2 border-none bg-transparent",
                role === "instructor" && !status && !email_verified && !no_login
                  ? "font-semibold border-ink text-ink border-b-2"
                  : "font-medium border-transparent text-mid-gray hover:text-ink",
              )}
            >
              Giảng viên (
              <span className="tab-count">
                {data?.summary?.total_instructors || 0}
              </span>
              )
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickFilter(
                  {
                    status: "locked",
                    role: "",
                    email_verified: "",
                    no_login: "",
                  },
                  "Đang lọc: Đã khóa",
                )
              }
              className={cn(
                "px-5 py-3 text-xs select-none whitespace-nowrap cursor-pointer transition-all border-b-2 border-none bg-transparent",
                status === "locked" && !role && !email_verified && !no_login
                  ? "font-semibold border-ink text-ink border-b-2"
                  : "font-medium border-transparent text-mid-gray hover:text-ink",
              )}
            >
              Đã khóa (
              <span className="tab-count">
                {data?.summary?.locked_users || 0}
              </span>
              )
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickFilter(
                  {
                    email_verified: "unverified",
                    role: "",
                    status: "",
                    no_login: "",
                  },
                  "Đang lọc: Chưa xác minh email",
                )
              }
              className={cn(
                "px-5 py-3 text-xs select-none whitespace-nowrap cursor-pointer transition-all border-b-2 border-none bg-transparent",
                email_verified === "unverified" && !role && !status && !no_login
                  ? "font-semibold border-ink text-ink border-b-2"
                  : "font-medium border-transparent text-mid-gray hover:text-ink",
              )}
            >
              Chưa xác minh (
              <span className="tab-count">
                {data?.summary?.unverified_users || 0}
              </span>
              )
            </button>
          </div>
        </div>

        {/* Filter chips (active filters visualization) */}
        {(search ||
          role ||
          status ||
          email_verified ||
          no_login ||
          time_preset !== "all") && (
          <div
            id="filter-chips-container"
            className="flex flex-wrap items-center gap-2 p-3 bg-canvas/35 border-b border-hairline text-xs select-none"
          >
            <span className="text-mid-gray text-[10px] font-semibold uppercase tracking-wider mr-1">
              Bộ lọc đang dùng:
            </span>
            <div id="filter-chips-list" className="flex flex-wrap gap-1.5">
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-canvas border border-hairline text-ink">
                  Từ khóa: "{search}"
                  <button
                    type="button"
                    onClick={() => updateFilters({ search: "" })}
                    className="text-mid-gray hover:text-ink ml-1 font-bold bg-transparent border-none cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              {role && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-canvas border border-hairline text-ink">
                  Vai trò:{" "}
                  {role === "learner"
                    ? "Học viên"
                    : role === "instructor"
                      ? "Giảng viên"
                      : "Quản trị viên"}
                  <button
                    type="button"
                    onClick={() => updateFilters({ role: "" })}
                    className="text-mid-gray hover:text-ink ml-1 font-bold bg-transparent border-none cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              {status && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-canvas border border-hairline text-ink">
                  Trạng thái:{" "}
                  {status === "active"
                    ? "Đang hoạt động"
                    : status === "inactive"
                      ? "Không hoạt động"
                      : "Đã khóa"}
                  <button
                    type="button"
                    onClick={() => updateFilters({ status: "" })}
                    className="text-mid-gray hover:text-ink ml-1 font-bold bg-transparent border-none cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              {email_verified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-canvas border border-hairline text-ink">
                  Xác minh:{" "}
                  {email_verified === "verified"
                    ? "Đã xác minh"
                    : "Chưa xác minh"}
                  <button
                    type="button"
                    onClick={() => updateFilters({ email_verified: "" })}
                    className="text-mid-gray hover:text-ink ml-1 font-bold bg-transparent border-none cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              {no_login === "true" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-canvas border border-hairline text-ink">
                  Chưa đăng nhập
                  <button
                    type="button"
                    onClick={() => updateFilters({ no_login: "" })}
                    className="text-mid-gray hover:text-ink ml-1 font-bold bg-transparent border-none cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              {time_preset !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-canvas border border-hairline text-ink">
                  Thời gian:{" "}
                  {time_preset === "today"
                    ? "Hôm nay"
                    : time_preset === "7_days"
                      ? "7 ngày qua"
                      : time_preset === "30days"
                        ? "30 ngày qua"
                        : time_preset === "thisMonth"
                          ? "Tháng này"
                          : "Tùy chọn"}
                  <button
                    type="button"
                    onClick={() =>
                      updateFilters({
                        time_preset: "all",
                        date_from: "",
                        date_to: "",
                      })
                    }
                    className="text-mid-gray hover:text-ink ml-1 font-bold bg-transparent border-none cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              id="btn-clear-all-chips"
              className="text-[10px] font-semibold ml-2 transition-all cursor-pointer bg-transparent border-none text-danger-brick hover:text-danger-brick/80 font-sans"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        {/* Table wrapper */}
        <div className="flex-grow overflow-y-auto overflow-x-auto custom-scrollbar relative max-h-[500px]">
          <table className="w-full text-left border-collapse table-auto min-w-[800px]">
            <thead className="sticky top-0 bg-surface-alt border-b border-hairline z-10">
              <tr className="text-[10px] font-bold text-mid-gray uppercase tracking-wider select-none h-10">
                <th className="p-3 pl-4 w-10 text-center">
                  <input
                    type="checkbox"
                    id="check-all-users"
                    onChange={(e) => handleCheckAll(e.target.checked)}
                    checked={
                      data?.items?.length > 0 &&
                      selectedUserIds.size ===
                        data.items.filter((u: any) => u.id !== CURRENT_ADMIN_ID)
                          .length
                    }
                    disabled={!data?.items || data.items.length === 0}
                    className="h-3.5 w-3.5 rounded border-hairline text-ink focus:ring-ink focus:ring-offset-0 cursor-pointer accent-ink"
                  />
                </th>

                {/* Column header: Người dùng */}
                <th className="p-3 relative whitespace-nowrap" data-column-menu>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveColumnMenu(
                        activeColumnMenu === "user" ? null : "user",
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none",
                      sort_by === "name_asc" || sort_by === "name_desc"
                        ? "text-blue-600"
                        : "text-mid-gray",
                    )}
                  >
                    Người dùng
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {activeColumnMenu === "user" && (
                    <div className="absolute left-3 top-9 z-30 w-40 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left font-normal normal-case">
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "name_asc" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-purple-600",
                          sort_by === "name_asc" && "bg-neutral-50 font-bold",
                        )}
                      >
                        Tên A–Z
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "name_desc" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-purple-600",
                          sort_by === "name_desc" && "bg-neutral-50 font-bold",
                        )}
                      >
                        Tên Z–A
                      </button>
                      <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "" });
                          setActiveColumnMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-600 rounded-[4px] transition-colors font-semibold cursor-pointer border-none bg-transparent"
                      >
                        Bỏ sắp xếp
                      </button>
                    </div>
                  )}
                </th>

                {/* Column header: Vai trò */}
                <th className="p-3 relative whitespace-nowrap" data-column-menu>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveColumnMenu(
                        activeColumnMenu === "role" ? null : "role",
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none",
                      role ? "text-blue-600" : "text-mid-gray",
                    )}
                  >
                    Vai trò
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {activeColumnMenu === "role" && (
                    <div className="absolute left-3 top-9 z-30 w-44 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left font-normal normal-case">
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ role: "" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          role === "" && "bg-neutral-50 font-bold",
                        )}
                      >
                        Tất cả vai trò
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ role: "learner" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50/50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-blue-600",
                          role === "learner" && "bg-neutral-50 font-bold",
                        )}
                      >
                        Học viên
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ role: "instructor" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50/50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-emerald-600",
                          role === "instructor" && "bg-neutral-50 font-bold",
                        )}
                      >
                        Giảng viên
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ role: "admin" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-purple-50/50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-purple-600",
                          role === "admin" && "bg-neutral-50 font-bold",
                        )}
                      >
                        Quản trị viên
                      </button>
                      <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ role: "" });
                          setActiveColumnMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-600 rounded-[4px] transition-colors font-semibold cursor-pointer border-none bg-transparent"
                      >
                        Bỏ lọc
                      </button>
                    </div>
                  )}
                </th>

                <th className="p-3 font-bold text-mid-gray select-none whitespace-nowrap">
                  Số điện thoại
                </th>

                {/* Column header: Trạng thái */}
                <th className="p-3 relative whitespace-nowrap" data-column-menu>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveColumnMenu(
                        activeColumnMenu === "status" ? null : "status",
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none",
                      status ? "text-blue-600" : "text-mid-gray",
                    )}
                  >
                    Trạng thái
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {activeColumnMenu === "status" && (
                    <div className="absolute left-3 top-9 z-30 w-44 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left font-normal normal-case">
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ status: "" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          status === "" && "bg-neutral-50 font-bold",
                        )}
                      >
                        Tất cả trạng thái
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ status: "active" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50/50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-emerald-600",
                          status === "active" && "bg-neutral-50 font-bold",
                        )}
                      >
                        Đang hoạt động
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ status: "inactive" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-500",
                          status === "inactive" && "bg-neutral-50 font-bold",
                        )}
                      >
                        Không hoạt động
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ status: "locked" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-red-50/50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-red-600",
                          status === "locked" && "bg-neutral-50 font-bold",
                        )}
                      >
                        Đã khóa
                      </button>
                      <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ status: "" });
                          setActiveColumnMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-600 rounded-[4px] transition-colors font-semibold cursor-pointer border-none bg-transparent"
                      >
                        Bỏ lọc
                      </button>
                    </div>
                  )}
                </th>

                {/* Column header: Xác minh email */}
                <th className="p-3 relative whitespace-nowrap" data-column-menu>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveColumnMenu(
                        activeColumnMenu === "verified" ? null : "verified",
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none",
                      email_verified ? "text-blue-600" : "text-mid-gray",
                    )}
                  >
                    Xác minh email
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {activeColumnMenu === "verified" && (
                    <div className="absolute left-3 top-9 z-30 w-40 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left font-normal normal-case">
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ email_verified: "" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          email_verified === "" && "bg-neutral-50 font-bold",
                        )}
                      >
                        Tất cả
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ email_verified: "verified" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50/50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-emerald-600",
                          email_verified === "verified" &&
                            "bg-neutral-50 font-bold",
                        )}
                      >
                        Đã xác minh
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ email_verified: "unverified" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-orange-50/50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-orange-600",
                          email_verified === "unverified" &&
                            "bg-neutral-50 font-bold",
                        )}
                      >
                        Chưa xác minh
                      </button>
                      <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ email_verified: "" });
                          setActiveColumnMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-600 rounded-[4px] transition-colors font-semibold cursor-pointer border-none bg-transparent"
                      >
                        Bỏ lọc
                      </button>
                    </div>
                  )}
                </th>

                {/* Column header: Đăng nhập gần nhất */}
                <th className="p-3 relative" data-column-menu>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveColumnMenu(
                        activeColumnMenu === "last_login" ? null : "last_login",
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none",
                      sort_by === "last_login" || no_login === "true"
                        ? "text-blue-600"
                        : "text-mid-gray",
                    )}
                  >
                    Đăng nhập gần nhất
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {activeColumnMenu === "last_login" && (
                    <div className="absolute left-3 top-9 z-30 w-44 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left font-normal normal-case">
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({
                            sort_by: "last_login",
                            no_login: "",
                          });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-teal-50/50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-teal-600",
                          sort_by === "last_login" && "bg-neutral-50 font-bold",
                        )}
                      >
                        Gần nhất trước
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          no_login === "true"
                            ? updateFilters({ no_login: "" })
                            : updateFilters({ no_login: "true", sort_by: "" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          no_login === "true" && "bg-neutral-50 font-bold",
                        )}
                      >
                        Chưa từng đăng nhập
                      </button>
                      <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "", no_login: "" });
                          setActiveColumnMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-600 rounded-[4px] transition-colors font-semibold cursor-pointer border-none bg-transparent"
                      >
                        Bỏ lọc/sắp xếp
                      </button>
                    </div>
                  )}
                </th>

                {/* Column header: Ngày tạo */}
                <th className="p-3 relative" data-column-menu>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveColumnMenu(
                        activeColumnMenu === "created" ? null : "created",
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none",
                      sort_by === "newest" || sort_by === "oldest"
                        ? "text-blue-600"
                        : "text-mid-gray",
                    )}
                  >
                    Ngày tạo
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {activeColumnMenu === "created" && (
                    <div className="absolute left-3 top-9 z-30 w-36 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left font-normal normal-case">
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "newest" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-blue-600",
                          sort_by === "newest" && "bg-neutral-50 font-bold",
                        )}
                      >
                        Mới nhất
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "oldest" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-500",
                          sort_by === "oldest" && "bg-neutral-50 font-bold",
                        )}
                      >
                        Cũ nhất
                      </button>
                      <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "" });
                          setActiveColumnMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-600 rounded-[4px] transition-colors font-semibold cursor-pointer border-none bg-transparent"
                      >
                        Bỏ sắp xếp
                      </button>
                    </div>
                  )}
                </th>

                <th className="p-3 pr-4 text-right select-none">Thao tác</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody
              id="users-table-body"
              className="divide-y divide-hairline text-xs"
            >
              {loading ? (
                // Skeletons
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4">
                      <div className="h-4 w-4 bg-canvas rounded skeleton"></div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-canvas skeleton"></div>
                        <div className="space-y-1.5 flex-grow">
                          <div className="h-3 w-24 bg-canvas rounded skeleton"></div>
                          <div className="h-2.5 w-32 bg-canvas rounded skeleton"></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-16 bg-canvas rounded skeleton"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-20 bg-canvas rounded skeleton"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-16 bg-canvas rounded skeleton"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-16 bg-canvas rounded skeleton"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-24 bg-canvas rounded skeleton"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-24 bg-canvas rounded skeleton"></div>
                    </td>
                    <td className="p-4"></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td
                    colSpan={9}
                    className="p-8 text-center text-danger-brick font-semibold"
                  >
                    {error}
                  </td>
                </tr>
              ) : !data?.items || data.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-mid-gray">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-ink">
                          Không tìm thấy người dùng
                        </h3>
                        <p className="text-xs text-mid-gray mt-1">
                          Không tìm thấy người dùng phù hợp với bộ lọc hiện tại.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-4 py-2 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
                      >
                        Đặt lại bộ lọc
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                data.items.map((user: any) => {
                  const firstLetter = user.full_name
                    ? user.full_name.charAt(0).toUpperCase()
                    : "U";
                  const isSelf = user.id === CURRENT_ADMIN_ID;
                  const isLocked =
                    user.locked ||
                    user.status === "locked" ||
                    user.effective_status === "locked";

                  return (
                    <tr
                      key={user.id}
                      onClick={() => openDetailDrawer(user.id)}
                      className="hover:bg-canvas/50 transition-colors group cursor-pointer border-b border-hairline/60"
                    >
                      {/* Checkbox */}
                      <td
                        className="p-3.5 pl-4 w-10 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          disabled={isSelf}
                          onChange={(e) =>
                            handleCheckUser(user.id, e.target.checked)
                          }
                          checked={selectedUserIds.has(user.id)}
                          className={cn(
                            "h-3.5 w-3.5 rounded border-hairline focus:ring-ink focus:ring-offset-0 cursor-pointer accent-ink",
                            isSelf && "opacity-30 cursor-not-allowed",
                          )}
                        />
                      </td>

                      {/* Name Card */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-mid-gray font-bold text-xs select-none">
                            {firstLetter}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-ink text-sm sm:text-xs leading-tight flex items-center">
                              {user.full_name}
                              {isSelf && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-canvas text-mid-gray border border-hairline ml-1 select-none">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-mid-gray mt-0.5 truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-3.5">
                        {user.role === "admin" ? (
                          <span className="font-bold text-purple-600 whitespace-nowrap">
                            Quản trị viên
                          </span>
                        ) : user.role === "instructor" ? (
                          <span className="font-semibold text-emerald-600 whitespace-nowrap">
                            Giảng viên
                          </span>
                        ) : (
                          <span className="font-medium text-mid-gray whitespace-nowrap">
                            Học viên
                          </span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="p-3.5 text-mid-gray font-mono text-[11px]">
                        {user.phone || "---"}
                      </td>

                      {/* Minimalist Status Markers (no background/border) */}
                      <td className="p-3.5">
                        <UserStatusMarker
                          locked={user.locked}
                          status={user.status}
                          effectiveStatus={user.effective_status}
                        />
                      </td>

                      {/* Verify */}
                      <td className="p-3.5 text-[11px]">
                        {user.email_verified_at ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5 text-emerald-600"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m4.5 12.75 6 6 9-13.5"
                              />
                            </svg>
                            Đã xác minh
                          </span>
                        ) : (
                          <span className="text-orange-600 font-semibold">
                            Chưa xác minh
                          </span>
                        )}
                      </td>

                      {/* Last login */}
                      <td className="p-3.5 text-mid-gray text-[11px]">
                        {user.last_login_at ? (
                          formatDateTime(user.last_login_at)
                        ) : (
                          <span className="text-mid-gray/60 italic">
                            Chưa đăng nhập
                          </span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="p-3.5 text-mid-gray text-[11px]">
                        {formatDateTime(user.created_at)}
                      </td>

                      {/* Actions Menu (Business Rule: no delete/deactivate, lock/unlock only) */}
                      <td
                        className="p-3.5 pr-4 text-right relative"
                        data-action-td
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setActiveActionMenu(
                              activeActionMenu === user.id ? null : user.id,
                            )
                          }
                          className="btn-action-menu p-1.5 rounded-full hover:bg-canvas text-mid-gray hover:text-ink transition-colors inline-block select-none cursor-pointer bg-transparent border-none"
                          aria-label="Xem menu thao tác"
                        >
                          <svg
                            className="w-4.5 h-4.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="12" cy="5" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>
                        {activeActionMenu === user.id && (
                          <div className="action-dropdown absolute right-4 top-10 z-20 w-44 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left normal-case font-normal animate-in fade-in duration-100">
                            <button
                              type="button"
                              onClick={() => {
                                openDetailDrawer(user.id);
                                setActiveActionMenu(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent"
                            >
                              Xem chi tiết
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenEditModal(user);
                                setActiveActionMenu(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent"
                            >
                              Chỉnh sửa
                            </button>

                            {/* Actions restricted to Lock / Unlock only */}
                            {!isSelf && (
                              <>
                                <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                                {isLocked ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleQuickAction("unlock", user);
                                      setActiveActionMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-[4px] transition-colors font-medium text-emerald-600 cursor-pointer border-none bg-transparent"
                                  >
                                    Mở khóa tài khoản
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleQuickAction("lock", user);
                                      setActiveActionMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-[4px] transition-colors font-medium text-red-600 cursor-pointer border-none bg-transparent"
                                  >
                                    Khóa tài khoản
                                  </button>
                                )}
                              </>
                            )}
                            {isSelf && (
                              <>
                                <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                                <button
                                  type="button"
                                  disabled
                                  title="Bạn không thể tự khóa tài khoản của chính mình."
                                  className="w-full text-left px-3 py-1.5 text-xs text-mid-gray/55 cursor-not-allowed border-none bg-transparent font-medium"
                                >
                                  Khóa tài khoản
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        {!loading &&
          !error &&
          data?.meta &&
          data.data &&
          data.data.length > 0 && (
            <div className="p-3.5 bg-surface-alt border-t border-hairline select-none shrink-0">
              <div
                id="pagination-wrapper"
                className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2"
              >
                <div className="text-xs text-mid-gray flex items-center gap-4 flex-wrap">
                  <div>
                    Đang hiển thị{" "}
                    <span className="font-semibold text-ink">
                      {data.meta.total === 0
                        ? 0
                        : (data.meta.current_page - 1) * data.meta.per_page + 1}
                    </span>
                    -
                    <span className="font-semibold text-ink">
                      {Math.min(
                        data.meta.current_page * data.meta.per_page,
                        data.meta.total,
                      )}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-semibold text-ink">
                      {data.meta.total}
                    </span>{" "}
                    người dùng
                  </div>
                  {/* Dropdown mỗi trang */}
                  <div className="flex items-center gap-1.5">
                    <span>Mỗi trang:</span>
                    <select
                      id="users-pagination-per-page"
                      value={per_page}
                      onChange={(e) =>
                        updateFilters({ per_page: e.target.value, page: 1 })
                      }
                      className="bg-paper border border-hairline rounded-[6px] px-2 py-0.5 text-xs text-ink outline-none cursor-pointer font-sans"
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-sans">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      updateFilters({ page: Math.max(1, page - 1) })
                    }
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-hairline bg-paper px-3 text-xs font-medium text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                      />
                    </svg>
                    <span>Trước</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: data.meta.last_page }).map(
                      (_, idx) => {
                        const i = idx + 1;
                        if (
                          i === 1 ||
                          i === data.meta.last_page ||
                          (i >= page - 1 && i <= page + 1)
                        ) {
                          return (
                            <button
                              key={i}
                              onClick={() => updateFilters({ page: i })}
                              className={cn(
                                "h-7.5 w-7.5 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer border-none",
                                i === page
                                  ? "bg-ink text-white shadow-sm"
                                  : "bg-transparent border border-transparent hover:bg-canvas hover:text-ink text-mid-gray",
                              )}
                            >
                              {i}
                            </button>
                          );
                        }
                        if (i === page - 2 || i === page + 2) {
                          return (
                            <span
                              key={i}
                              className="text-xs text-mid-gray px-1"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      },
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={page >= data.meta.last_page}
                    onClick={() =>
                      updateFilters({
                        page: Math.min(data.meta.last_page, page + 1),
                      })
                    }
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-hairline bg-paper px-3 text-xs font-medium text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <span>Sau</span>
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
      </section>

      {/* Bulk actions floating bar */}
      {selectedUserIds.size > 0 && (
        <div
          id="bulk-actions-bar"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center justify-between gap-6 px-4 py-2.5 bg-ink text-white rounded-[6px] shadow-lg text-xs w-full max-w-[480px] md:max-w-[560px] select-none"
        >
          <div className="flex items-center gap-2.5">
            <span className="font-medium text-white/90">
              Đã chọn{" "}
              <span className="font-bold text-white">
                {selectedUserIds.size}
              </span>{" "}
              tài khoản
            </span>
            <button
              type="button"
              onClick={() => setSelectedUserIds(new Set())}
              className="text-[10px] text-white/70 hover:text-white underline font-medium cursor-pointer bg-transparent border-none font-sans"
            >
              Bỏ chọn
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="px-3 py-1 text-[10px] font-semibold bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors cursor-not-allowed opacity-50 relative group animate-none"
            >
              Khóa hàng loạt
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-paper text-ink border border-hairline text-[9px] px-2 py-1 rounded shadow whitespace-nowrap">
                Chờ nâng cấp API Backend
              </span>
            </button>
          </div>
        </div>
      )}

      {/* DRAWER: USER DETAIL */}
      {isDrawerOpen && activeDetailUser && (
        <>
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
          />
          <div
            id="user-detail-drawer"
            className="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] bg-paper border-l border-hairline shadow-subtle flex flex-col h-full animate-in slide-in-from-right duration-300"
          >
            {/* Header */}
            <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-hairline">
              <h2 className="text-sm font-bold text-ink">
                Chi tiết người dùng
              </h2>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 hover:bg-canvas rounded-full text-mid-gray hover:text-ink transition-colors cursor-pointer bg-transparent border-none"
                aria-label="Đóng chi tiết"
              >
                <svg
                  className="w-4.5 h-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* Scrollable Content */}
            <div className="flex-grow overflow-y-auto p-5 space-y-6 custom-scrollbar">
              {/* Profile Card Header */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white font-bold text-lg shrink-0 select-none">
                  {activeDetailUser.full_name
                    ? activeDetailUser.full_name.charAt(0).toUpperCase()
                    : "U"}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-base font-semibold text-ink flex items-center">
                    {activeDetailUser.full_name}
                    {activeDetailUser.id === CURRENT_ADMIN_ID && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-canvas text-mid-gray border border-hairline ml-1.5 select-none">
                        Bạn
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-mid-gray">
                    {activeDetailUser.email}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {activeDetailUser.role === "admin" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-ink text-white">
                        Quản trị viên
                      </span>
                    ) : activeDetailUser.role === "instructor" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-success-soft text-success border border-success/20">
                        Giảng viên
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-canvas border border-hairline text-mid-gray">
                        Học viên
                      </span>
                    )}

                    <UserStatusMarker
                      locked={activeDetailUser.locked}
                      status={activeDetailUser.status}
                      effectiveStatus={activeDetailUser.effective_status}
                    />
                  </div>
                </div>
              </div>

              {/* General Information Section */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">
                  Thông tin cơ bản
                </h4>
                <div className="rounded-[6px] border border-hairline bg-surface-alt p-3.5 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Họ và tên:</span>
                    <span className="font-medium text-ink">
                      {activeDetailUser.full_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Email:</span>
                    <span className="font-medium text-ink">
                      {activeDetailUser.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Số điện thoại:</span>
                    <span className="font-medium text-ink">
                      {activeDetailUser.phone || "---"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Vai trò:</span>
                    <span className="font-medium text-ink flex-wrap text-right">
                      {activeDetailUser.role === "admin"
                        ? "Quản trị viên"
                        : activeDetailUser.role === "instructor"
                          ? "Giảng viên"
                          : "Học viên"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Trạng thái:</span>
                    <span className="font-medium text-ink">
                      {activeDetailUser.status === "active"
                        ? "Đang hoạt động"
                        : activeDetailUser.status === "inactive"
                          ? "Không hoạt động"
                          : "Đã khóa"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Trạng thái hiệu lực:</span>
                    <span className="font-medium text-ink">
                      {activeDetailUser.effective_status === "locked"
                        ? "Bị khóa"
                        : activeDetailUser.effective_status === "inactive"
                          ? "Vô hiệu hóa"
                          : "Bình thường"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Information Section */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">
                  Thông tin tài khoản
                </h4>
                <div className="rounded-[6px] border border-hairline bg-surface-alt p-3.5 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Đăng nhập OAuth:</span>
                    <span className="font-medium text-ink">
                      {activeDetailUser.oauth_account_login ? "Có" : "Không"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Ngày xác minh email:</span>
                    <span className="font-medium text-ink">
                      {formatDateTime(activeDetailUser.email_verified_at) ||
                        "Chưa xác minh"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mid-gray">
                      Lần đăng nhập gần nhất:
                    </span>
                    <span className="font-medium text-ink">
                      {formatDateTime(activeDetailUser.last_login_at) ||
                        "Chưa đăng nhập"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Ngày tạo:</span>
                    <span className="font-medium text-ink">
                      {formatDateTime(activeDetailUser.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Ngày cập nhật:</span>
                    <span className="font-medium text-ink">
                      {formatDateTime(activeDetailUser.updated_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lock account details if locked */}
              {(activeDetailUser.locked ||
                activeDetailUser.status === "locked") && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-danger-brick">
                    Thông tin khóa tài khoản
                  </h4>
                  <div className="rounded-[6px] border border-danger-brick/20 bg-danger-brick-soft/10 p-3.5 space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-mid-gray">Trạng thái khóa:</span>
                      <span className="font-semibold text-danger-brick">
                        Bị khóa
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-mid-gray">Lý do khóa:</span>
                      <p className="font-medium text-ink bg-paper p-2 rounded border border-hairline leading-relaxed">
                        {activeDetailUser.locked_reason || "Không rõ lý do."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions inside drawer */}
            <div className="p-4 border-t border-hairline bg-surface-alt flex flex-wrap gap-2 justify-end shrink-0">
              <button
                type="button"
                onClick={() => handleOpenEditModal(activeDetailUser)}
                className="px-4 py-1.5 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
              >
                Chỉnh sửa
              </button>
              {activeDetailUser.id !== CURRENT_ADMIN_ID && (
                <>
                  {activeDetailUser.locked ||
                  activeDetailUser.status === "locked" ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickAction("unlock", activeDetailUser)
                      }
                      className="px-4 py-1.5 text-xs font-semibold rounded-full bg-success text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
                    >
                      Mở khóa
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickAction("lock", activeDetailUser)
                      }
                      className="px-4 py-1.5 text-xs font-semibold rounded-full bg-danger-brick text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
                    >
                      Khóa tài khoản
                    </button>
                  )}
                </>
              )}
              {activeDetailUser.id === CURRENT_ADMIN_ID && (
                <button
                  type="button"
                  disabled
                  title="Bạn không thể tự khóa tài khoản của chính mình."
                  className="px-4 py-1.5 text-xs font-semibold rounded-full bg-mid-gray/25 text-mid-gray cursor-not-allowed border-none"
                >
                  Khóa tài khoản
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* MODAL: CREATE USER */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-none">
          <div className="bg-paper border border-hairline rounded-[6px] w-full max-w-md shadow-subtle flex flex-col max-h-[90vh]">
            <div className="flex h-14 shrink-0 items-center justify-between px-5 border-b border-hairline">
              <h3 className="text-sm font-bold text-ink">
                Thêm người dùng mới
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-canvas rounded-full text-mid-gray hover:text-ink transition-colors cursor-pointer bg-transparent border-none"
              >
                <svg
                  className="w-4.5 h-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-5 custom-scrollbar">
              <form
                onSubmit={handleCreateUser}
                id="create-user-form"
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="create-name"
                    className="block text-xs font-semibold text-ink mb-1.5"
                  >
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    id="create-name"
                    value={createFormData.full_name}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        full_name: e.target.value,
                      })
                    }
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-blue-600/40 outline-none text-ink font-medium"
                  />
                  {createErrors.full_name && (
                    <p className="text-[10px] text-danger-brick mt-1">
                      {createErrors.full_name[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="create-email"
                    className="block text-xs font-semibold text-ink mb-1.5"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="create-email"
                    value={createFormData.email}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        email: e.target.value,
                      })
                    }
                    placeholder="example@gmail.com"
                    className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-blue-600/40 outline-none text-ink font-medium"
                  />
                  {createErrors.email && (
                    <p className="text-[10px] text-danger-brick mt-1">
                      {createErrors.email[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="create-password"
                    className="block text-xs font-semibold text-ink mb-1.5"
                  >
                    Mật khẩu *
                  </label>
                  <input
                    type="password"
                    id="create-password"
                    value={createFormData.password}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        password: e.target.value,
                      })
                    }
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-blue-600/40 outline-none text-ink font-medium"
                  />
                  {createErrors.password && (
                    <p className="text-[10px] text-danger-brick mt-1">
                      {createErrors.password[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="create-phone"
                    className="block text-xs font-semibold text-ink mb-1.5"
                  >
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    id="create-phone"
                    value={createFormData.phone}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Ví dụ: 0901234567"
                    className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-blue-600/40 outline-none text-ink font-medium"
                  />
                </div>
                <div>
                  <label
                    htmlFor="create-role"
                    className="block text-xs font-semibold text-ink mb-1.5"
                  >
                    Vai trò *
                  </label>
                  <select
                    id="create-role"
                    value={createFormData.role}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        role: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-blue-600/40 outline-none text-ink cursor-pointer font-medium"
                  >
                    <option value="learner">Học viên</option>
                    <option value="instructor">Giảng viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="create-status"
                    className="block text-xs font-semibold text-ink mb-1.5"
                  >
                    Trạng thái ban đầu
                  </label>
                  <select
                    id="create-status"
                    value={createFormData.status}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        status: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-blue-600/40 outline-none text-ink cursor-pointer font-medium"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="locked">Đã khóa</option>
                  </select>
                </div>
                {createFormData.status === "locked" && (
                  <div>
                    <label
                      htmlFor="create-lock-reason"
                      className="block text-xs font-semibold text-ink mb-1.5"
                    >
                      Lý do khóa *
                    </label>
                    <textarea
                      id="create-lock-reason"
                      value={createFormData.locked_reason}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          locked_reason: e.target.value,
                        })
                      }
                      placeholder="Nhập lý do đình chỉ tài khoản này..."
                      className="w-full h-20 p-2.5 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-blue-600/40 outline-none text-ink resize-none leading-relaxed font-medium"
                    />
                    {createErrors.locked_reason && (
                      <p className="text-[10px] text-danger-brick mt-1">
                        {createErrors.locked_reason[0]}
                      </p>
                    )}
                  </div>
                )}
              </form>
            </div>
            <div className="p-4 border-t border-hairline bg-surface-alt flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-full bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer border border-hairline"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="create-user-form"
                className="px-5 py-1.5 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer border-none"
              >
                Thêm mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-none">
          <div className="bg-paper border border-hairline rounded-[6px] w-full max-w-md shadow-subtle flex flex-col max-h-[90vh]">
            <div className="flex h-14 shrink-0 items-center justify-between px-5 border-b border-hairline">
              <h3 className="text-sm font-bold text-ink">
                Chỉnh sửa người dùng
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-canvas rounded-full text-mid-gray hover:text-ink transition-colors cursor-pointer bg-transparent border-none"
              >
                <svg
                  className="w-4.5 h-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-5 custom-scrollbar">
              <form
                onSubmit={handleEditUser}
                id="edit-user-form"
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="edit-name"
                    className="block text-xs font-semibold text-ink mb-1.5"
                  >
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editFormData.full_name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        full_name: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-blue-600/40 outline-none text-ink font-medium"
                  />
                  {editErrors.full_name && (
                    <p className="text-[10px] text-danger-brick mt-1">
                      {editErrors.full_name[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="edit-email"
                    className="block text-xs font-semibold text-ink mb-1.5"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-blue-600/40 outline-none text-ink font-medium"
                  />
                  {editErrors.email && (
                    <p className="text-[10px] text-danger-brick mt-1">
                      {editErrors.email[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="edit-password"
                    className="block text-xs font-semibold text-ink mb-1.5"
                  >
                    Mật khẩu mới (Để trống nếu không đổi)
                  </label>
                  <input
                    type="password"
                    id="edit-password"
                    value={editFormData.password}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        password: e.target.value,
                      })
                    }
                    placeholder="Nhập mật khẩu mới"
                    className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-blue-600/40 outline-none text-ink font-medium"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-phone"
                    className="block text-xs font-semibold text-ink mb-1.5"
                  >
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    id="edit-phone"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-blue-600/40 outline-none text-ink font-medium"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-role"
                    className="block text-xs font-semibold text-ink mb-1.5"
                  >
                    Vai trò *
                  </label>
                  <select
                    id="edit-role"
                    value={editFormData.role}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, role: e.target.value })
                    }
                    disabled={editFormData.id === CURRENT_ADMIN_ID}
                    className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-blue-600/40 outline-none text-ink cursor-pointer font-medium disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  >
                    <option value="learner">Học viên</option>
                    <option value="instructor">Giảng viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="edit-status"
                    className="block text-xs font-semibold text-ink mb-1.5"
                  >
                    Trạng thái
                  </label>
                  <select
                    id="edit-status"
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        status: e.target.value,
                      })
                    }
                    disabled={editFormData.id === CURRENT_ADMIN_ID}
                    className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-blue-600/40 outline-none text-ink cursor-pointer font-medium disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="locked">Đã khóa</option>
                  </select>
                  {editFormData.id === CURRENT_ADMIN_ID && (
                    <p className="text-[10px] text-mid-gray mt-1 font-medium">
                      Bạn không thể tự vô hiệu hóa hoặc khóa tài khoản của chính
                      mình.
                    </p>
                  )}
                </div>
                {editFormData.status === "locked" && (
                  <div>
                    <label
                      htmlFor="edit-lock-reason"
                      className="block text-xs font-semibold text-ink mb-1.5"
                    >
                      Lý do khóa *
                    </label>
                    <textarea
                      id="edit-lock-reason"
                      value={editFormData.locked_reason}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          locked_reason: e.target.value,
                        })
                      }
                      placeholder="Nhập lý do đình chỉ tài khoản này..."
                      className="w-full h-20 p-2.5 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-blue-600/40 outline-none text-ink resize-none leading-relaxed font-medium"
                    />
                    {editErrors.locked_reason && (
                      <p className="text-[10px] text-danger-brick mt-1">
                        {editErrors.locked_reason[0]}
                      </p>
                    )}
                  </div>
                )}
              </form>
            </div>
            <div className="p-4 border-t border-hairline bg-surface-alt flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-full bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer border border-hairline"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="edit-user-form"
                className="px-5 py-1.5 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION ACTION MODAL: LOCK */}
      {confirmModal.open && confirmModal.type === "lock" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-paper border border-hairline rounded-[6px] w-full max-w-sm shadow-subtle p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-danger-brick">
                Đình chỉ / Khóa tài khoản
              </h3>
              <p className="text-xs text-mid-gray mt-1 leading-normal flex-wrap font-medium">
                Bạn sắp khóa tài khoản{" "}
                <span className="font-semibold text-ink">
                  {confirmModal.user?.full_name}
                </span>{" "}
                ({confirmModal.user?.email}). Người dùng này sẽ không thể đăng
                nhập vào hệ thống.
              </p>
            </div>
            <div>
              <label
                htmlFor="lock-reason-input"
                className="block text-xs font-semibold text-ink mb-1.5"
              >
                Lý do khóa tài khoản *
              </label>
              <textarea
                id="lock-reason-input"
                value={confirmModal.reason}
                onChange={(e) =>
                  setConfirmModal({ ...confirmModal, reason: e.target.value })
                }
                placeholder="Ví dụ: Spam, vi phạm bản quyền nội dung..."
                className="w-full h-20 p-2 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-blue-600/40 outline-none text-ink resize-none leading-relaxed font-medium"
              />
              {confirmModal.error && (
                <p className="text-[10px] text-danger-brick mt-1">
                  {confirmModal.error}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({
                    open: false,
                    type: "",
                    user: null,
                    reason: "",
                    error: "",
                  })
                }
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer"
              >
                Bỏ qua
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] bg-danger-brick text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
              >
                Xác nhận khóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION ACTION MODAL: GENERAL (UNLOCK, ACTIVATE, DEACTIVATE) */}
      {confirmModal.open &&
        (confirmModal.type === "unlock" ||
          confirmModal.type === "activate" ||
          confirmModal.type === "deactivate") && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-paper border border-hairline rounded-[6px] w-full max-w-xs shadow-subtle p-5 space-y-4">
              <div>
                <h3
                  className="text-sm font-bold text-ink"
                  id="confirm-general-title"
                >
                  {confirmModal.type === "unlock"
                    ? "Mở khóa tài khoản"
                    : confirmModal.type === "activate"
                      ? "Kích hoạt tài khoản"
                      : "Vô hiệu hóa tài khoản"}
                </h3>
                <p
                  className="text-xs text-mid-gray mt-1 leading-normal font-medium"
                  id="confirm-general-message"
                >
                  Bạn có chắc chắn muốn{" "}
                  {confirmModal.type === "unlock"
                    ? "mở khóa"
                    : confirmModal.type === "activate"
                      ? "kích hoạt"
                      : "vô hiệu hóa"}{" "}
                  tài khoản{" "}
                  <span className="font-semibold text-ink">
                    {confirmModal.user?.full_name}
                  </span>
                  ?
                </p>
                {confirmModal.error && (
                  <p className="text-[10px] text-danger-brick mt-1">
                    {confirmModal.error}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
                <button
                  type="button"
                  onClick={() =>
                    setConfirmModal({
                      open: false,
                      type: "",
                      user: null,
                      reason: "",
                      error: "",
                    })
                  }
                  className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
