import React, { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  colorClass?: string;
  hoverBgClass?: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (val: string) => void;
  placeholder: string;
  id: string;
  activeId?: string | null;
  setActiveId?: (id: string | null) => void;
  className?: string;
}

export default function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  id,
  activeId,
  setActiveId,
  className,
}: FilterSelectProps) {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  const isOpen = activeId !== undefined ? activeId === id : internalIsOpen;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (setActiveId) {
      setActiveId(isOpen ? null : id);
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const handleClose = () => {
    if (setActiveId) {
      setActiveId(null);
    } else {
      setInternalIsOpen(false);
    }
  };

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const displayColor = selectedOption ? selectedOption.colorClass : 'text-neutral-700';

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isOpen) handleClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen, activeId, id, setActiveId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("w-full relative flex flex-col", className)}>
      {label && (
        <span className="block text-[10px] font-bold text-mid-gray uppercase tracking-wider mb-1.5 select-none">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full h-10 px-3 text-xs bg-paper border border-hairline rounded-[6px] hover:border-mid-gray/40 focus:ring-1 focus:ring-mid-gray/40 outline-none flex items-center justify-between transition-all cursor-pointer text-left shadow-subtle font-medium text-ink"
      >
        <span className={cn("truncate", displayColor, !selectedOption && "text-mid-gray/70")}>
          {displayLabel}
        </span>
        <svg className={cn("w-3.5 h-3.5 text-mid-gray/80 shrink-0 transition-transform duration-200 ml-1.5", isOpen && "transform rotate-180")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute left-0 right-0 top-[62px] z-40 bg-paper border border-hairline rounded-[6px] shadow-lg py-1 flex flex-col max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in duration-100">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  handleClose();
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer border-none bg-transparent flex items-center justify-between select-none truncate",
                  opt.colorClass,
                  isSelected 
                    ? "bg-emerald-50 text-emerald-700 font-semibold" 
                    : "text-ink hover:bg-canvas"
                )}
              >
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
