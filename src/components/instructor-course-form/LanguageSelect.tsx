import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Globe, Search, Check, ChevronDown, Plus, AlertCircle } from 'lucide-react';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  aliases: string[];
}

export const STANDARD_LANGUAGES: LanguageOption[] = [
  { code: 'vi', name: 'Tiếng Việt', nativeName: 'Tiếng Việt', aliases: ['tieng viet', 'viet nam', 'vietnamese', 'vn', 'vi'] },
  { code: 'en', name: 'Tiếng Anh', nativeName: 'English', aliases: ['tieng anh', 'anh', 'english', 'us', 'uk', 'en'] },
  { code: 'ja', name: 'Tiếng Nhật', nativeName: '日本語', aliases: ['tieng nhat', 'nhat ban', 'nhat', 'japanese', 'nihongo', 'ja'] },
  { code: 'ko', name: 'Tiếng Hàn', nativeName: '한국어', aliases: ['tieng han', 'han quoc', 'han', 'korean', 'hangul', 'ko'] },
  { code: 'zh', name: 'Tiếng Trung', nativeName: '中文 (Quan thoại)', aliases: ['tieng trung', 'trung quoc', 'trung', 'tieng hoa', 'hoa', 'chinese', 'mandarin', 'zh', 'cn'] },
  { code: 'fr', name: 'Tiếng Pháp', nativeName: 'Français', aliases: ['tieng phap', 'phap', 'french', 'francais', 'fr'] },
  { code: 'de', name: 'Tiếng Đức', nativeName: 'Deutsch', aliases: ['tieng duc', 'duc', 'german', 'deutsch', 'de'] },
  { code: 'es', name: 'Tiếng Tây Ban Nha', nativeName: 'Español', aliases: ['tieng tay ban nha', 'tay ban nha', 'spanish', 'espanol', 'es'] },
  { code: 'ru', name: 'Tiếng Nga', nativeName: 'Русский', aliases: ['tieng nga', 'nga', 'russian', 'russkiy', 'ru'] },
  { code: 'th', name: 'Tiếng Thái', nativeName: 'ไทย', aliases: ['tieng thai', 'thai lan', 'thai', 'th'] },
  { code: 'id', name: 'Tiếng Indonesia', nativeName: 'Bahasa Indonesia', aliases: ['tieng indonesia', 'indonesia', 'bahasa indonesia', 'id'] },
  { code: 'pt', name: 'Tiếng Bồ Đào Nha', nativeName: 'Português', aliases: ['tieng bo dao nha', 'bo dao nha', 'portuguese', 'portugues', 'pt'] },
  { code: 'it', name: 'Tiếng Ý', nativeName: 'Italiano', aliases: ['tieng y', 'y', 'italian', 'italiano', 'it'] },
  { code: 'ar', name: 'Tiếng Ả Rập', nativeName: 'العربية', aliases: ['tieng a rap', 'a rap', 'arabic', 'ar'] },
  { code: 'hi', name: 'Tiếng Hindi', nativeName: 'हिन्दी', aliases: ['tieng hindi', 'an do', 'hindi', 'hi'] },
  { code: 'nl', name: 'Tiếng Hà Lan', nativeName: 'Nederlands', aliases: ['tieng ha lan', 'ha lan', 'dutch', 'nederlands', 'nl'] },
  { code: 'tr', name: 'Tiếng Thổ Nhĩ Kỳ', nativeName: 'Türkçe', aliases: ['tieng tho nhi ky', 'tho nhi ky', 'turkish', 'turkce', 'tr'] },
  { code: 'pl', name: 'Tiếng Ba Lan', nativeName: 'Polski', aliases: ['tieng ba lan', 'ba lan', 'polish', 'polski', 'pl'] },
  { code: 'sv', name: 'Tiếng Thụy Điển', nativeName: 'Svenska', aliases: ['tieng thuy dien', 'thuy dien', 'swedish', 'svenska', 'sv'] },
  { code: 'tl', name: 'Tiếng Filipino', nativeName: 'Filipino', aliases: ['tieng filipino', 'philippines', 'filipino', 'tagalog', 'tl'] },
  { code: 'ms', name: 'Tiếng Mã Lai', nativeName: 'Bahasa Melayu', aliases: ['tieng ma lai', 'malaysia', 'malay', 'bahasa melayu', 'ms'] },
];

/**
 * Remove Vietnamese accents and special marks for robust fuzzy alias lookup
 */
export function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Match a raw input string to a standard language ISO code
 */
export function matchStandardLanguage(rawInput: string): LanguageOption | null {
  if (!rawInput) return null;
  const normalized = removeDiacritics(rawInput);

  for (const lang of STANDARD_LANGUAGES) {
    if (lang.code.toLowerCase() === normalized) return lang;
    if (removeDiacritics(lang.name) === normalized) return lang;
    if (removeDiacritics(lang.nativeName) === normalized) return lang;
    if (lang.aliases.some(alias => removeDiacritics(alias) === normalized)) {
      return lang;
    }
  }
  return null;
}

interface LanguageSelectProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  error?: string;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [customError, setCustomError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedStandard = useMemo(() => {
    return matchStandardLanguage(value || 'vi') || STANDARD_LANGUAGES[0];
  }, [value]);

  const displayLabel = `${selectedStandard.name} (${selectedStandard.nativeName})`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCustomInput(false);
        setCustomError('');
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

  const filteredLanguages = useMemo(() => {
    const term = removeDiacritics(searchTerm);
    if (!term) return STANDARD_LANGUAGES;

    return STANDARD_LANGUAGES.filter(lang => {
      return (
        lang.code.toLowerCase().includes(term) ||
        removeDiacritics(lang.name).includes(term) ||
        removeDiacritics(lang.nativeName).includes(term) ||
        lang.aliases.some(alias => removeDiacritics(alias).includes(term))
      );
    });
  }, [searchTerm]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsCustomInput(false);
    setCustomError('');
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCustomSubmit = () => {
    const sanitized = customValue.trim();
    if (!sanitized) {
      setCustomError('Vui lòng nhập tên hoặc mã ngôn ngữ.');
      return;
    }

    const matched = matchStandardLanguage(sanitized);
    if (matched) {
      onChange(matched.code);
      setIsCustomInput(false);
      setCustomValue('');
      setCustomError('');
      setIsOpen(false);
      setSearchTerm('');
    } else {
      setCustomError(`Ngôn ngữ "${sanitized}" không hợp lệ. Vui lòng chọn ngôn ngữ từ danh mục chuẩn.`);
    }
  };

  return (
    <div className="relative text-left" ref={containerRef}>
      <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5 flex items-center gap-1">
        <Globe className="w-3 h-3 text-stone-400" /> Ngôn ngữ giảng dạy *
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-[11px] font-bold border rounded-xl px-3 py-2.5 bg-white flex items-center justify-between cursor-pointer transition-colors ${
          error || customError
            ? 'border-red-400 text-red-900 focus:border-red-500'
            : 'border-slate-200 text-stone-700 hover:bg-slate-50/60 focus:border-emerald-500'
        }`}
      >
        <span className="truncate flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-slate-100 text-slate-600 font-bold uppercase">
            {selectedStandard.code}
          </span>
          {displayLabel}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-2 animate-fade-in">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên (Anh, Nhật, Trung...), mã ISO (en, ja, vi)..."
              className="w-full text-[10.5px] font-medium text-stone-700 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Languages List */}
          <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => {
                const isSelected = selectedStandard.code === lang.code;
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
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 text-center text-[9px] font-mono font-bold text-slate-400">
                        {lang.code.toUpperCase()}
                      </span>
                      <span>
                        {lang.name} <span className="text-stone-400 text-[9.5px]">({lang.nativeName})</span>
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center space-y-1">
                <p className="text-[10.5px] font-medium text-stone-500">Không tìm thấy ngôn ngữ "{searchTerm}".</p>
                <p className="text-[9.5px] text-stone-400">Vui lòng kiểm tra lại từ khóa hoặc chọn từ danh sách 20+ ngôn ngữ chuẩn.</p>
              </div>
            )}
          </div>

          {/* Custom Language lookup option */}
          <div className="border-t border-slate-100 pt-1.5">
            {!isCustomInput ? (
              <button
                type="button"
                onClick={() => {
                  setIsCustomInput(true);
                  setCustomError('');
                }}
                className="w-full text-left px-2 py-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Tìm & chuẩn hóa ngôn ngữ khác
              </button>
            ) : (
              <div className="space-y-1">
                <div className="flex gap-1">
                  <input
                    type="text"
                    maxLength={30}
                    value={customValue}
                    onChange={(e) => {
                      setCustomValue(e.target.value);
                      if (customError) setCustomError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCustomSubmit();
                      }
                    }}
                    placeholder="Nhập tên ngôn ngữ (VD: Tiếng Pháp, Deutsch, ru)..."
                    className="flex-1 text-[10px] border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    className="bg-emerald-600 text-white text-[9.5px] font-bold px-2.5 py-1 rounded-lg cursor-pointer hover:bg-emerald-700"
                  >
                    Áp dụng
                  </button>
                </div>
                {customError && (
                  <div className="flex items-center gap-1 text-[9.5px] font-medium text-red-600 px-1 py-0.5 bg-red-50 rounded">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{customError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {error && !customError && (
        <p className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
};

export default LanguageSelect;
