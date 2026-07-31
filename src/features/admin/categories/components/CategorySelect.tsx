import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface CategorySelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function CategorySelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  disabled = false,
  className,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // Click outside hook
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
        const currentIdx = options.findIndex((opt) => opt.value === value);
        setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (options.length > 0 ? (prev + 1) % options.length : -1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (options.length > 0 ? (prev - 1 + options.length) % options.length : -1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          handleSelect(options[highlightedIndex].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  // Scroll active option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          "w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] flex items-center justify-between text-ink transition-all focus:outline-none focus:ring-1 focus:ring-mid-gray/40 select-none text-left",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer"
        )}
      >
        <span className={cn("truncate mr-2", !selectedOption && "text-mid-gray/70")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-mid-gray/80 transition-transform duration-200 shrink-0", isOpen && "transform rotate-180")} />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-40 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-paper border border-hairline rounded-[6px] shadow-lg py-1 focus:outline-none"
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-xs text-mid-gray italic select-none">
              Không có lựa chọn nào
            </li>
          ) : (
            options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isHighlighted = idx === highlightedIndex;
              return (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={cn(
                    "px-3 py-2 text-xs text-ink cursor-pointer transition-colors select-none truncate",
                    isHighlighted && "bg-canvas",
                    isSelected && "bg-emerald-50 text-emerald-700 font-semibold"
                  )}
                >
                  {opt.label}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
