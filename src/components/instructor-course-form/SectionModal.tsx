import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: { title: string; description: string; sort_order: number; status: string }) => void;
  initialData?: { title: string; description: string; sort_order: number; status: string } | null;
}

export default function SectionModal({ isOpen, onClose, onSave, initialData }: SectionModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setSortOrder(initialData.sort_order || 1);
      setStatus(initialData.status || 'active');
    } else {
      setTitle('');
      setDescription('');
      setSortOrder(1);
      setStatus('active');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), sort_order: sortOrder, status });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-xs font-sans text-stone-800">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-sm font-black text-stone-900">{initialData ? 'Sửa thông tin chương' : 'Thêm chương học mới'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] font-bold text-stone-600 mb-1">Tiêu đề chương *</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Chương 1: Giới thiệu khóa học"
              className="w-full text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/20 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-600 mb-1">Mô tả ngắn</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả nội dung chương này..."
              className="w-full text-[11px] font-medium text-stone-700 border border-slate-200 rounded-xl p-2.5 bg-slate-50/20 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-1">Thứ tự hiển thị</label>
              <input 
                type="number" 
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
                className="w-full text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-1">Trạng thái</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
              >
                <option value="active">Công khai (Active)</option>
                <option value="draft">Bản nháp (Draft)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-bold text-stone-600">Hủy</button>
            <button type="submit" className="px-5 py-2 bg-[#10b981] hover:bg-emerald-600 text-white font-black rounded-xl">Lưu lại</button>
          </div>
        </form>
      </div>
    </div>
  );
}
