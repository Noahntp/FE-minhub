import React from "react";
import { cn } from "@/shared/lib/utils";

interface AdminPaginationProps {
  currentPage: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  itemLabel?: string;
}

export default function AdminPagination({
  currentPage,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
  itemLabel = "bản ghi",
}: AdminPaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  const startRecord = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(currentPage * perPage, total);

  // Generate pagination buttons
  const pages: (number | string)[] = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }
  }

  return (
    <div
      id="pagination-wrapper"
      className="px-4 py-3 bg-surface-alt/30 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-3 select-none w-full"
    >
      <div className="text-xs text-mid-gray">
        Đang hiển thị{" "}
        <span className="font-semibold text-ink" id="pag-showing-range">
          {total === 0 ? "0-0" : `${startRecord}-${endRecord}`}
        </span>
        {" trong tổng số "}
        <span className="font-semibold text-ink" id="pag-total-records">
          {total}
        </span>
        {` ${itemLabel}`}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-mid-gray">Hiển thị</span>
          <select
            id="pagination-per-page"
            value={perPage}
            onChange={(e) => {
              onPerPageChange(Number(e.target.value));
              onPageChange(1); // Reset to page 1 on per-page change
            }}
            className="h-7 px-2 bg-canvas border border-hairline rounded focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink cursor-pointer font-medium"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-mid-gray">dòng</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1 || total === 0}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-full border border-hairline transition-colors flex items-center justify-center shrink-0 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5 text-ink"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          
          {total > 0 &&
            pages.map((p, index) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="w-7.5 text-center text-xs font-semibold text-mid-gray border-none"
                  >
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => onPageChange(p as number)}
                  className={cn(
                    "h-7.5 w-7.5 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer border-none",
                    p === currentPage
                      ? "bg-ink text-white shadow-sm"
                      : "bg-transparent hover:bg-canvas hover:text-ink text-mid-gray"
                  )}
                >
                  {p}
                </button>
              );
            })}

          <button
            type="button"
            disabled={currentPage === totalPages || total === 0}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-full border border-hairline transition-colors flex items-center justify-center shrink-0 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5 text-ink"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
