import React, { useState, useMemo } from 'react';
import { Search, X, Layers } from 'lucide-react';

export type CategoryItem = string | { name: string; count?: number };

interface CategoryFilterBarProps {
  categories: CategoryItem[];
  activeCategory: string;
  onSelectCategory: (name: string) => void;
  allLabel?: string;
  colorScheme?: 'indigo' | 'brown';
  label?: React.ReactNode;
}

export default function CategoryFilterBar({
  categories,
  activeCategory,
  onSelectCategory,
  allLabel = 'Tất cả',
  colorScheme = 'indigo',
  label
}: CategoryFilterBarProps) {
  const [showAllModal, setShowAllModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize categories
  const normalizedCategories = useMemo(() => {
    return categories.map(c => typeof c === 'string' ? { name: c, count: undefined } : c);
  }, [categories]);

  // Sort to ensure active category is always at the top/front
  const sortedCategories = useMemo(() => {
    const active = normalizedCategories.filter(c => c.name === activeCategory);
    const others = normalizedCategories.filter(c => c.name !== activeCategory);
    return [...active, ...others];
  }, [normalizedCategories, activeCategory]);

  const filteredModalCategories = useMemo(() => {
    if (!searchQuery) return normalizedCategories;
    return normalizedCategories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [normalizedCategories, searchQuery]);

  const isIndigo = colorScheme === 'indigo';
  
  const getActiveClasses = () => {
    return isIndigo 
      ? 'bg-deep-indigo text-white shadow-xs scale-102 font-bold'
      : 'bg-[#8b5e3c] text-white shadow-3xs font-bold';
  };

  const getInactiveClasses = () => {
    return isIndigo
      ? 'bg-stone-100 hover:bg-stone-200 text-stone-600'
      : 'bg-stone-50 border border-stone-200/50 hover:bg-stone-100 text-stone-550';
  };

  const getBadgeActiveClasses = () => {
    return 'bg-white/20 text-white';
  };

  const getBadgeInactiveClasses = () => {
    return 'bg-stone-200 text-stone-500';
  };

  const THRESHOLD = 8;
  const isLarge = sortedCategories.length > THRESHOLD;

  const handleSelect = (name: string) => {
    onSelectCategory(name);
    setShowAllModal(false);
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-start gap-2 ${!isIndigo ? 'bg-[#fdfcfb] border border-stone-150/60 p-2.5 rounded-2xl sm:pl-4 animate-fade-in' : ''}`}>
      {label && (
        <div className="shrink-0 mt-1.5 flex items-center">
          {label}
        </div>
      )}
      
      <div className="flex-1 flex items-start gap-2">
        <div className="flex flex-wrap gap-1.5 max-h-[72px] overflow-hidden flex-1 relative">
          <button 
            onClick={() => handleSelect('All')}
            className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${activeCategory === 'All' ? getActiveClasses() : getInactiveClasses()}`}
          >
            <span>{allLabel}</span>
          </button>
          
          {sortedCategories.map((cat, idx) => (
            <button 
              key={`${cat.name}-${idx}`}
              onClick={() => handleSelect(cat.name)}
              className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${activeCategory === cat.name ? getActiveClasses() : getInactiveClasses()}`}
            >
              <span>{cat.name}</span>
              {cat.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${activeCategory === cat.name ? getBadgeActiveClasses() : getBadgeInactiveClasses()}`}>
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {isLarge && (
          <button 
            onClick={() => setShowAllModal(true)}
            className="shrink-0 mt-0.5 px-3 py-1.5 bg-stone-100 border border-stone-200 text-stone-600 hover:bg-stone-200 hover:text-brand-dark rounded-full font-bold text-[11px] shadow-sm transition-all"
          >
            + Xem tất cả
          </button>
        )}
      </div>

      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[85vh] animate-slide-up overflow-hidden border border-stone-200">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <h3 className="font-black text-main-darker text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-normal" /> Toàn bộ Danh mục
              </h3>
              <button 
                onClick={() => setShowAllModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-200 transition-colors"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            
            <div className="p-4 border-b border-stone-100">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Tìm kiếm danh mục..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-normal/30 focus:border-brand-normal transition-all"
                />
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 flex flex-wrap gap-2 content-start min-h-[200px]">
              <button 
                onClick={() => handleSelect('All')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${activeCategory === 'All' ? getActiveClasses() : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}
              >
                <span>{allLabel}</span>
              </button>
              
              {filteredModalCategories.length === 0 ? (
                <div className="w-full text-center py-8 text-stone-400 text-sm">
                  Không tìm thấy danh mục nào phù hợp với "{searchQuery}"
                </div>
              ) : (
                filteredModalCategories.map((cat, idx) => (
                  <button 
                    key={`${cat.name}-${idx}`}
                    onClick={() => handleSelect(cat.name)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${activeCategory === cat.name ? getActiveClasses() : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}
                  >
                    <span>{cat.name}</span>
                    {cat.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${activeCategory === cat.name ? getBadgeActiveClasses() : getBadgeInactiveClasses()}`}>
                        {cat.count}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
