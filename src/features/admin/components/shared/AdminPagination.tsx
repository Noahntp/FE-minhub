import React, { useState, useRef, useEffect } from "react";
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
  const [isPerPageOpen, setIsPerPageOpen] = useState(false);
  const perPageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        perPageRef.current &&
        !perPageRef.current.contains(e.target as Node)
      ) {
        setIsPerPageOpen(false);
      }
    };
    if (isPerPageOpen) {
      window.addEventListener("click", handleOutside);
    }
    return () => window.removeEventListener("click", handleOutside);
  }, [isPerPageOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPerPageOpen) {
        setIsPerPageOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPerPageOpen]);

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
      className="px-4 py-3 bg-paper border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-3 select-none w-full"
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
        <div className="flex items-center gap-2 text-xs">
          <span className="text-mid-gray">Hiển thị</span>
          <div ref={perPageRef} className="relative">
            <button
              type="button"
              onClick={() => setIsPerPageOpen(!isPerPageOpen)}
              className="h-8 px-2.5 bg-paper border border-hairline rounded-lg hover:border-mid-gray/40 hover:bg-neutral-100 focus:ring-1 focus:ring-mid-gray/40 outline-none flex items-center justify-between gap-1.5 transition-all cursor-pointer shadow-subtle font-medium text-ink"
            >
              <span>{perPage}</span>
              <svg
                className={cn(
                  "w-3 h-3 text-mid-gray shrink-0 transition-transform duration-200",
                  isPerPageOpen && "rotate-180"
                )}
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
            {isPerPageOpen && (
              <div className="absolute left-0 bottom-full mb-1.5 z-50 min-w-full w-max bg-paper border border-hairline rounded-xl p-1 shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden animate-in fade-in duration-100">
                {[10, 20, 50, 100].map((opt) => {
                  const isSelected = opt === perPage;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onPerPageChange(opt);
                        setIsPerPageOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs rounded-md transition-colors font-medium cursor-pointer border-none bg-transparent flex items-center justify-between hover:bg-neutral-100",
                        isSelected ? "bg-neutral-50 font-semibold text-ink" : "text-neutral-700"
                      )}
                    >
                      <span className="pr-4">{opt}</span>
                      {isSelected && (
                        <svg
                          className="w-3.5 h-3.5 text-ink shrink-0"
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
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
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
