import React, { useState, useRef, useEffect } from 'react';
import { Globe, Search, Check, ChevronDown, Plus } from 'lucide-react';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const STANDARD_LANGUAGES: LanguageOption[] = [
  { code: 'vi', name: 'Tiếng Việt', nativeName: 'Tiếng Việt' },
  { code: 'en', name: 'Tiếng Anh', nativeName: 'English' },
  { code: 'ja', name: 'Tiếng Nhật', nativeName: '日本語' },
  { code: 'ko', name: 'Tiếng Hàn', nativeName: '한국어' },
  { code: 'zh', name: 'Tiếng Trung', nativeName: '中文' },
  { code: 'fr', name: 'Tiếng Pháp', nativeName: 'Français' },
  { code: 'de', name: 'Tiếng Đức', nativeName: 'Deutsch' },
  { code: 'es', name: 'Tiếng Tây Ban Nha', nativeName: 'Español' },
  { code: 'ru', name: 'Tiếng Nga', nativeName: 'Русский' },
  { code: 'th', name: 'Tiếng Thái', nativeName: 'ไทย' },
  { code: 'id', name: 'Tiếng Indonesia', nativeName: 'Bahasa Indonesia' },
  { code: 'pt', name: 'Tiếng Bồ Đào Nha', nativeName: 'Português' },
  { code: 'it', name: 'Tiếng Ý', nativeName: 'Italiano' },
];

interface LanguageSelectProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedStandard = STANDARD_LANGUAGES.find(l => l.code.toLowerCase() === (value || 'vi').toLowerCase());
  const displayLabel = selectedStandard 
    ? `${selectedStandard.name} (${selectedStandard.nativeName})` 
    : (value || 'Tiếng Việt');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredLanguages = STANDARD_LANGUAGES.filter(lang => {
    const term = searchTerm.toLowerCase().trim();
    return (
      lang.name.toLowerCase().includes(term) ||
      lang.nativeName.toLowerCase().includes(term) ||
      lang.code.toLowerCase().includes(term)
    );
  });

  const handleSelect = (code: string) => {
    onChange(code);
    setIsCustomInput(false);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCustomSubmit = () => {
    const sanitized = customValue.trim().slice(0, 20);
    if (sanitized) {
      onChange(sanitized);
      setIsCustomInput(false);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className="relative text-left" ref={containerRef}>
      <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5 flex items-center gap-1">
        <Globe className="w-3 h-3 text-stone-400" /> Ngôn ngữ *
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-[11px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2.5 bg-white hover:bg-slate-50/60 focus:outline-none focus:border-emerald-500 flex items-center justify-between cursor-pointer transition-colors"
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-lg p-2 space-y-2 animate-fade-in">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm ngôn ngữ (tên, mã)..."
              className="w-full text-[10.5px] font-medium text-stone-700 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Languages List */}
          <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => {
                const isSelected = (value || 'vi').toLowerCase() === lang.code.toLowerCase();
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10.5px] flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-emerald-50 text-emerald-800 font-bold' 
                        : 'text-stone-700 hover:bg-slate-100/70 font-medium'
                    }`}
                  >
                    <span>{lang.name} <span className="text-stone-400 text-[9.5px]">({lang.nativeName})</span></span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <p className="text-[10px] text-stone-400 py-2 text-center">Không tìm thấy ngôn ngữ phù hợp.</p>
            )}
          </div>

          {/* Custom Language input option */}
          <div className="border-t border-slate-100 pt-1.5">
            {!isCustomInput ? (
              <button
                type="button"
                onClick={() => setIsCustomInput(true)}
                className="w-full text-left px-2 py-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Nhập ngôn ngữ khác
              </button>
            ) : (
              <div className="flex gap-1">
                <input
                  type="text"
                  maxLength={20}
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="Mã/tên ngôn ngữ (tối đa 20 ký tự)..."
                  className="flex-1 text-[10px] border border-slate-200 rounded px-2 py-1 outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleCustomSubmit}
                  className="bg-emerald-600 text-white text-[9.5px] font-bold px-2 py-1 rounded cursor-pointer hover:bg-emerald-700"
                >
                  Lưu
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelect;
