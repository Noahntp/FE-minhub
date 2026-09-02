import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Heading2, Heading3, 
  List, ListOrdered, Link as LinkIcon, Unlink, Code, 
  RotateCcw, RotateCw, RemoveFormatting, Code2, Eye, HelpCircle
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập mô tả chi tiết khóa học...',
  minHeight = '180px',
  disabled = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);
  const [isRawHtmlMode, setIsRawHtmlMode] = useState(false);
  const [activeMarks, setActiveMarks] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  // Calculate word & character counts
  const plainText = (value || '').replace(/<[^>]+>/g, '').trim();
  const charCount = plainText.length;
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;

  // Initialize and synchronize HTML content
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalUpdate.current = false;
  }, [value, isRawHtmlMode]);

  const updateActiveMarks = useCallback(() => {
    if (disabled || isRawHtmlMode) return;
    try {
      setActiveMarks({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });
    } catch {
      // Ignore if document selection is out of focus
    }
  }, [disabled, isRawHtmlMode]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      // Clean up empty paragraph tags
      const cleanHtml = html === '<p><br></p>' || html === '<br>' ? '' : html;
      isInternalUpdate.current = true;
      onChange(cleanHtml);
      updateActiveMarks();
    }
  };

  const execCmd = (command: string, arg?: string) => {
    if (disabled || isRawHtmlMode) return;
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleInput();
    updateActiveMarks();
  };

  const handleInsertLink = () => {
    if (disabled || isRawHtmlMode) return;
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    const url = window.prompt('Nhập đường dẫn liên kết (URL):', 'https://');
    if (url && url.trim() !== '' && url !== 'https://') {
      if (!selectedText) {
        document.execCommand('insertHTML', false, `<a href="${url.trim()}" target="_blank" rel="noopener noreferrer">${url.trim()}</a>`);
      } else {
        document.execCommand('createLink', false, url.trim());
      }
      handleInput();
    }
  };

  const handleFormatBlock = (tag: string) => {
    if (disabled || isRawHtmlMode) return;
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, tag);
    handleInput();
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all text-left">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-1.5 bg-slate-50/80 border-b border-slate-200 text-stone-700 select-none">
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Headings */}
          <button
            type="button"
            disabled={disabled || isRawHtmlMode}
            onMouseDown={(e) => { e.preventDefault(); handleFormatBlock('<h2>'); }}
            className="p-1.5 rounded-lg text-stone-600 hover:bg-slate-200/80 hover:text-stone-900 transition-colors disabled:opacity-40 cursor-pointer"
            title="Tiêu đề 2 (H2)"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled || isRawHtmlMode}
            onMouseDown={(e) => { e.preventDefault(); handleFormatBlock('<h3>'); }}
            className="p-1.5 rounded-lg text-stone-600 hover:bg-slate-200/80 hover:text-stone-900 transition-colors disabled:opacity-40 cursor-pointer"
            title="Tiêu đề 3 (H3)"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <span className="w-[1px] h-4 bg-slate-300 mx-1" />

          {/* Basic Inline Styles */}
          <button
            type="button"
            disabled={disabled || isRawHtmlMode}
            onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 ${
              activeMarks.bold ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-stone-600 hover:bg-slate-200/80 hover:text-stone-900'
            }`}
            title="In đậm (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled || isRawHtmlMode}
            onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 ${
              activeMarks.italic ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-stone-600 hover:bg-slate-200/80 hover:text-stone-900'
            }`}
            title="In nghiêng (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled || isRawHtmlMode}
            onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 ${
              activeMarks.underline ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-stone-600 hover:bg-slate-200/80 hover:text-stone-900'
            }`}
            title="Gạch chân (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled || isRawHtmlMode}
            onMouseDown={(e) => { e.preventDefault(); execCmd('strikeThrough'); }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 ${
              activeMarks.strikeThrough ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-stone-600 hover:bg-slate-200/80 hover:text-stone-900'
            }`}
            title="Gạch ngang"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <span className="w-[1px] h-4 bg-slate-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            disabled={disabled || isRawHtmlMode}
            onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 ${
              activeMarks.insertUnorderedList ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-stone-600 hover:bg-slate-200/80 hover:text-stone-900'
            }`}
            title="Danh sách dấu đầu dòng (Bullet list)"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled || isRawHtmlMode}
            onMouseDown={(e) => { e.preventDefault(); execCmd('insertOrderedList'); }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 ${
              activeMarks.insertOrderedList ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-stone-600 hover:bg-slate-200/80 hover:text-stone-900'
            }`}
            title="Danh sách số (Numbered list)"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <span className="w-[1px] h-4 bg-slate-300 mx-1" />

          {/* Link */}
          <button
            type="button"
            disabled={disabled || isRawHtmlMode}
            onMouseDown={(e) => { e.preventDefault(); handleInsertLink(); }}
            className="p-1.5 rounded-lg text-stone-600 hover:bg-slate-200/80 hover:text-stone-900 transition-colors disabled:opacity-40 cursor-pointer"
            title="Chèn liên kết (Link)"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled || isRawHtmlMode}
            onMouseDown={(e) => { e.preventDefault(); execCmd('unlink'); }}
            className="p-1.5 rounded-lg text-stone-600 hover:bg-slate-200/80 hover:text-stone-900 transition-colors disabled:opacity-40 cursor-pointer"
            title="Bỏ liên kết"
          >
            <Unlink className="w-3.5 h-3.5" />
          </button>

          {/* Clear Format */}
          <button
            type="button"
            disabled={disabled || isRawHtmlMode}
            onMouseDown={(e) => { e.preventDefault(); execCmd('removeFormat'); }}
            className="p-1.5 rounded-lg text-stone-600 hover:bg-slate-200/80 hover:text-stone-900 transition-colors disabled:opacity-40 cursor-pointer"
            title="Xóa định dạng"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mode Switch & History */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={disabled || isRawHtmlMode}
            onMouseDown={(e) => { e.preventDefault(); execCmd('undo'); }}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-slate-200/80 hover:text-stone-900 transition-colors disabled:opacity-40 cursor-pointer"
            title="Hoàn tác (Ctrl+Z)"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <button
            type="button"
            disabled={disabled || isRawHtmlMode}
            onMouseDown={(e) => { e.preventDefault(); execCmd('redo'); }}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-slate-200/80 hover:text-stone-900 transition-colors disabled:opacity-40 cursor-pointer"
            title="Làm lại (Ctrl+Y)"
          >
            <RotateCw className="w-3 h-3" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsRawHtmlMode(!isRawHtmlMode)}
            className={`px-2 py-1 rounded-lg text-[9.5px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
              isRawHtmlMode 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-white text-stone-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Chuyển chế độ soạn thảo HTML/Trực quan"
          >
            {isRawHtmlMode ? <Eye className="w-3 h-3" /> : <Code2 className="w-3 h-3" />}
            {isRawHtmlMode ? 'Xem trực quan' : 'Mã HTML'}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isRawHtmlMode ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Nhập mã HTML tùy chỉnh..."
          style={{ minHeight }}
          className="w-full p-3 font-mono text-[11px] text-stone-800 bg-slate-900/5 outline-none resize-y leading-relaxed"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyUp={updateActiveMarks}
          onMouseUp={updateActiveMarks}
          data-placeholder={placeholder}
          style={{ minHeight }}
          className="w-full p-3 text-[11px] font-normal leading-relaxed text-stone-800 outline-none overflow-y-auto relative empty:before:content-[attr(data-placeholder)] empty:before:text-stone-400 empty:before:pointer-events-none [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-stone-900 [&_h2]:my-2 [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-stone-800 [&_h3]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_a]:text-emerald-600 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-500 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-stone-600 [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_p]:my-1"
        />
      )}

      {/* Word & Character Counter Footer */}
      <div className="flex justify-between items-center px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[9px] text-stone-400 font-bold">
        <span>Định dạng HTML tiêu chuẩn WYSIWYG</span>
        <div className="flex items-center gap-3">
          <span>{wordCount} từ</span>
          <span>{charCount} ký tự</span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
