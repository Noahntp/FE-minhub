import React, { useState, useEffect } from 'react';
import { X, File } from 'lucide-react';
import { InstructorAssetUploader } from './InstructorUploaders';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    file_url: string;
    file_name: string;
    file_type: string;
    file_size: number;
    note: string;
    file?: File;
  }) => void;
  initialData?: {
    title: string;
    file_url: string;
    file_name: string;
    file_type: string;
    file_size: number;
    note: string;
  } | null;
}

export default function AssetModal({ isOpen, onClose, onSave, initialData }: AssetModalProps) {
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [note, setNote] = useState('');
  const [rawFile, setRawFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setFileUrl(initialData.file_url || '');
      setFileName(initialData.file_name || '');
      setFileType(initialData.file_type || '');
      setFileSize(initialData.file_size || 0);
      setNote(initialData.note || '');
      setRawFile(undefined);
    } else {
      setTitle('');
      setFileUrl('');
      setFileName('');
      setFileType('');
      setFileSize(0);
      setNote('');
      setRawFile(undefined);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAssetUploaded = (meta: { file_url: string; file_name: string; file_type: string; file_size: number; file?: File }) => {
    setFileUrl(meta.file_url);
    setFileName(meta.file_name);
    setFileType(meta.file_type);
    setFileSize(meta.file_size);
    if (meta.file) {
      setRawFile(meta.file);
    }
    if (!title.trim()) {
      setTitle(meta.file_name.split('.')[0] || 'Tài liệu đính kèm');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!fileUrl.trim() && !rawFile) return;

    onSave({
      title: title.trim(),
      file_url: fileUrl.trim(),
      file_name: fileName || 'file-resource',
      file_type: fileType || 'unknown',
      file_size: fileSize,
      note: note.trim(),
      file: rawFile
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-xs font-sans text-stone-850">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-sm font-black text-stone-900">{initialData ? 'Sửa thông tin tài nguyên' : 'Thêm tài nguyên bài học'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] font-bold text-stone-600 mb-1">Tiêu đề tài nguyên *</label>
            <input 
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Slide bài giảng Python"
              className="w-full text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/20 focus:outline-none"
            />
          </div>

          <div className="space-y-3 bg-slate-50 p-3 rounded-xl border">
            <InstructorAssetUploader onAssetUploaded={handleAssetUploaded} label="Chọn tệp tài liệu (PDF, ZIP, DOCX...)" />
            
            <div className="relative flex items-center gap-1 my-1 justify-center">
              <span className="h-[1px] bg-slate-200 flex-1"></span>
              <span className="text-[9px] text-stone-400 font-bold uppercase px-2">Hoặc nhập URL</span>
              <span className="h-[1px] bg-slate-200 flex-1"></span>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-stone-500 mb-1">Liên kết URL tài nguyên:</label>
              <input 
                type="text" value={fileUrl} onChange={(e) => {
                  setFileUrl(e.target.value);
                  if (e.target.value && !fileName) {
                    setFileName(e.target.value.split('/').pop() || 'resource-link');
                  }
                }}
                placeholder="https://example.com/resources/slide.pdf"
                className="w-full text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
              />
            </div>
          </div>

          {fileUrl && (
            <div className="p-2.5 bg-emerald-50 rounded-xl flex items-center gap-2 border border-emerald-100">
              <File className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-stone-850 truncate">{fileName || 'Tài nguyên đã tải lên'}</p>
                <p className="text-[8.5px] text-stone-400 font-bold mt-0.5">{fileSize > 0 ? formatSize(fileSize) : 'URL Link'} • {fileType || 'Link'}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-stone-600 mb-1">Ghi chú cho học viên</label>
            <textarea 
              value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú đính kèm (Ví dụ: Các bạn tải slide về và giải nén nhé)..."
              className="w-full text-[11px] font-medium text-stone-700 border border-slate-200 rounded-xl p-2.5 bg-slate-50/20 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-bold text-stone-600 cursor-pointer">Hủy</button>
            <button type="submit" disabled={(!fileUrl || !fileUrl.trim()) && !rawFile} className="px-5 py-2 bg-[#10b981] hover:bg-emerald-600 text-white font-black rounded-xl cursor-pointer disabled:opacity-50">Lưu lại</button>
          </div>
        </form>
      </div>
    </div>
  );
}
