import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Link as LinkIcon, Unlink, 
  RotateCcw, RotateCw, RemoveFormatting, Code2, Eye, HelpCircle,
  Quote, ChevronDown, Check, AlertCircle
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
  error?: string;
}

const HEADING_OPTIONS = [
  { value: 'p', label: 'Đoạn văn (Paragraph)', tag: '<p>' },
  { value: 'h1', label: 'Tiêu đề 1 (H1 - Lớn nhất)', tag: '<h1>' },
  { value: 'h2', label: 'Tiêu đề 2 (H2 - Chính)', tag: '<h2>' },
  { value: 'h3', label: 'Tiêu đề 3 (H3 - Phụ)', tag: '<h3>' },
  { value: 'h4', label: 'Tiêu đề 4 (H4)', tag: '<h4>' },
  { value: 'h5', label: 'Tiêu đề 5 (H5)', tag: '<h5>' },
  { value: 'h6', label: 'Tiêu đề 6 (H6)', tag: '<h6>' },
  { value: 'blockquote', label: 'Trích dẫn (Quote)', tag: '<blockquote>' },
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập mô tả chi tiết khóa học...',
  minHeight = '180px',
  disabled = false,
  error,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);
  const [isRawHtmlMode, setIsRawHtmlMode] = useState(false);
  const [headingDropdownOpen, setHeadingDropdownOpen] = useState(false);
  const [currentBlockTag, setCurrentBlockTag] = useState('p');
  
  const [activeMarks, setActiveMarks] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    blockquote: false,
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

  // Determine active block tag & inline marks
  const updateActiveStates = useCallback(() => {
    if (disabled || isRawHtmlMode) return;
    try {
      // 1. Inline marks
      const bold = document.queryCommandState('bold');
      const italic = document.queryCommandState('italic');
      const underline = document.queryCommandState('underline');
      const strikeThrough = document.queryCommandState('strikeThrough');
      const insertUnorderedList = document.queryCommandState('insertUnorderedList');
      const insertOrderedList = document.queryCommandState('insertOrderedList');

      // 2. Block format detection (traverse DOM upwards)
      const selection = window.getSelection();
      let blockTag = 'p';
      let isBlockquote = false;

      if (selection && selection.rangeCount > 0 && editorRef.current) {
        let node: Node | null = selection.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = (node as HTMLElement).tagName.toLowerCase();
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p'].includes(tagName)) {
              blockTag = tagName;
              if (tagName === 'blockquote') isBlockquote = true;
              break;
            }
          }
          node = node.parentNode;
        }
      }

      setCurrentBlockTag(blockTag);
      setActiveMarks({
        bold,
        italic,
        underline,
        strikeThrough,
        insertUnorderedList,
        insertOrderedList,
        blockquote: isBlockquote,
      });
    } catch {
      // Ignore if document selection is out of focus
    }
  }, [disabled, isRawHtmlMode]);

  // Listen to selection changes across the document
  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current || editorRef.current?.contains(document.activeElement)) {
        updateActiveStates();
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateActiveStates]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      // Clean up empty paragraph tags
      const cleanHtml = html === '<p><br></p>' || html === '<br>' ? '' : html;
      isInternalUpdate.current = true;
      onChange(cleanHtml);
      updateActiveStates();
    }
  };

  const execCmd = (command: string, arg?: string) => {
    if (disabled || isRawHtmlMode) return;
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleInput();
    updateActiveStates();
  };

  const handleFormatBlock = (tag: string) => {
    if (disabled || isRawHtmlMode) return;
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, tag);
    handleInput();
    updateActiveStates();
    setHeadingDropdownOpen(false);
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

  const currentHeadingObj = HEADING_OPTIONS.find(h => h.value === currentBlockTag) || HEADING_OPTIONS[0];

  return (
    <div className={`border rounded-xl overflow-hidden bg-white transition-all text-left ${
      error ? 'border-red-400 ring-2 ring-red-400/10' : 'border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10'
    }`}>
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-1.5 bg-slate-50/90 border-b border-slate-200 text-stone-700 select-none">
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Headings Dropdown */}
          <div className="relative">
            <button
              type="button"
              disabled={disabled || isRawHtmlMode}
              onClick={() => setHeadingDropdownOpen(!headingDropdownOpen)}
              className={`h-7 px-2 text-[11px] font-bold rounded-lg border flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 ${
                currentBlockTag.startsWith('h')
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold'
                  : 'bg-white text-stone-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Định dạng dòng / Tiêu đề (H1 - H6)"
            >
              <span className="truncate max-w-[90px]">{currentHeadingObj.label.split('(')[0]}</span>
              <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${headingDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {headingDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setHeadingDropdownOpen(false)} 
                />
                <div className="absolute top-full left-0 mt-1 z-50 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1 space-y-0.5 animate-fade-in">
                  {HEADING_OPTIONS.map((item) => {
                    const isSelected = currentBlockTag === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleFormatBlock(item.tag);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-[11px] flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-800 font-bold'
                            : 'text-stone-700 hover:bg-slate-100/80 font-medium'
                        }`}
                      >
                        <span className={item.value.startsWith('h') ? 'font-bold' : ''}>
                          {item.label}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <span className="w-[1px] h-4 bg-slate-300 mx-1" />

          {/* Basic Inline Styles */}
          <button
            type="button"
            disabled={disabled || isRawHtmlMode}
            onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 ${
              activeMarks.bold ? 'bg-emerald-100 text-emerald-800 font-bold shadow-inner' : 'text-stone-600 hover:bg-slate-200/80 hover:text-stone-900'
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
              activeMarks.italic ? 'bg-emerald-100 text-emerald-800 font-bold shadow-inner' : 'text-stone-600 hover:bg-slate-200/80 hover:text-stone-900'
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
              activeMarks.underline ? 'bg-emerald-100 text-emerald-800 font-bold shadow-inner' : 'text-stone-600 hover:bg-slate-200/80 hover:text-stone-900'
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
              activeMarks.strikeThrough ? 'bg-emerald-100 text-emerald-800 font-bold shadow-inner' : 'text-stone-600 hover:bg-slate-200/80 hover:text-stone-900'
            }`}
            title="Gạch ngang"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <span className="w-[1px] h-4 bg-slate-300 mx-1" />

          {/* Lists & Quote */}
          <button
            type="button"
            disabled={disabled || isRawHtmlMode}
            onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 ${
              activeMarks.insertUnorderedList ? 'bg-emerald-100 text-emerald-800 font-bold shadow-inner' : 'text-stone-600 hover:bg-slate-200/80 hover:text-stone-900'
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
              activeMarks.insertOrderedList ? 'bg-emerald-100 text-emerald-800 font-bold shadow-inner' : 'text-stone-600 hover:bg-slate-200/80 hover:text-stone-900'
            }`}
            title="Danh sách số (Numbered list)"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled || isRawHtmlMode}
            onMouseDown={(e) => { e.preventDefault(); handleFormatBlock('<blockquote>'); }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 ${
              activeMarks.blockquote ? 'bg-emerald-100 text-emerald-800 font-bold shadow-inner' : 'text-stone-600 hover:bg-slate-200/80 hover:text-stone-900'
            }`}
            title="Khối trích dẫn (Blockquote)"
          >
            <Quote className="w-3.5 h-3.5" />
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

          <span className="w-[1px] h-4 bg-slate-300 mx-1" />

          {/* Raw HTML Mode Switch */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsRawHtmlMode(!isRawHtmlMode)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              isRawHtmlMode 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-stone-600 hover:bg-slate-200/80'
            }`}
            title={isRawHtmlMode ? 'Chuyển sang chế độ Soạn thảo trực quan' : 'Chuyển sang chế độ Mã HTML nguồn'}
          >
            {isRawHtmlMode ? <Eye className="w-3 h-3" /> : <Code2 className="w-3 h-3" />}
            <span>{isRawHtmlMode ? 'Soạn thảo' : 'Mã HTML'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isRawHtmlMode ? (
        <textarea
          disabled={disabled}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập mã HTML tại đây..."
          style={{ minHeight }}
          className="w-full p-4 font-mono text-[11px] text-stone-800 bg-slate-50/50 outline-none resize-y"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onKeyUp={updateActiveStates}
          onMouseUp={updateActiveStates}
          onBlur={updateActiveStates}
          style={{ minHeight }}
          data-placeholder={placeholder}
          className="p-4 text-xs leading-relaxed text-stone-800 outline-none prose prose-stone max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-stone-400 empty:before:pointer-events-none"
        />
      )}

      {/* Footer Info / Word Counter */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-stone-400 select-none">
        <div className="flex items-center gap-2">
          {error ? (
            <span className="text-red-500 font-bold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {error}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-stone-500">
              <HelpCircle className="w-3 h-3" />
              <span>Định dạng hỗ trợ đầy đủ H1-H6, in đậm, gạch chân, danh sách và liên kết.</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 font-mono font-medium">
          <span>{wordCount} từ</span>
          <span>•</span>
          <span>{charCount} ký tự</span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
