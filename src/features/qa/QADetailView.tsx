import React, { useState, useRef, useEffect } from 'react';
import { 
  Bookmark, MoreVertical, Send, EyeOff, Eye, User, Loader2,
  Bold, Italic, Underline, Strikethrough, Code, Link as LinkIcon, 
  List, ListOrdered, AlignLeft, Smile, Image as ImageIcon, Table, Undo2, Redo2
} from 'lucide-react';
import { Question } from './types';

interface QADetailViewProps {
  question: Question | null;
  onReply: (replyText: string, isOfficial: boolean, notifyStudent: boolean) => Promise<void> | void;
  onHide: () => void;
  onToggleBookmark: () => void;
}

const EMOJI_LIST = ['😊', '👍', '❤️', '🎉', '💡', '❓', '👏', '🚀', '🔥', '✅', '✨', '🙏'];

export const QADetailView: React.FC<QADetailViewProps> = ({
  question,
  onReply,
  onHide,
  onToggleBookmark,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isOfficial, setIsOfficial] = useState(true);
  const [notifyStudent, setNotifyStudent] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeMarks, setActiveMarks] = useState<Record<string, boolean>>({});

  const [sortReplies, setSortReplies] = useState<'newest' | 'oldest'>('newest');

  // Auto focus editor when a question is selected
  useEffect(() => {
    if (question?.id) {
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }, 150);
    }
  }, [question?.id]);

  // Helper: Strip HTML tags to check if empty
  const isContentEmpty = (html: string): boolean => {
    if (!html) return true;
    const stripped = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return stripped.length === 0;
  };

  const updateContentState = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setReplyContent(html);
      if (!isContentEmpty(html)) {
        setValidationError('');
      }
    }
  };

  const updateActiveMarks = () => {
    if (typeof document === 'undefined') return;
    try {
      setActiveMarks({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikethrough: document.queryCommandState('strikeThrough'),
        bulletList: document.queryCommandState('insertUnorderedList'),
        orderedList: document.queryCommandState('insertOrderedList'),
      });
    } catch {
      // Ignore if document selection is out of scope
    }
  };

  const applyCommand = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    try {
      document.execCommand(command, false, value);
    } catch (e) {
      console.warn("execCommand failed:", e);
    }
    updateContentState();
    updateActiveMarks();
  };

  const handleLinkClick = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const url = window.prompt('Nhập địa chỉ đường dẫn (URL):', 'https://');
    if (url && url.trim() && url !== 'https://') {
      applyCommand('createLink', url.trim());
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    applyCommand('insertText', emoji);
    setShowEmojiPicker(false);
  };

  const handleCodeBlock = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection()?.toString();
    if (selection) {
      applyCommand('insertHTML', `<code>${selection}</code>`);
    } else {
      applyCommand('formatBlock', 'pre');
    }
  };

  const handleReplySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const currentContent = editorRef.current ? editorRef.current.innerHTML : replyContent;
    if (isContentEmpty(currentContent)) {
      setValidationError('Vui lòng nhập nội dung trả lời.');
      return;
    }

    setValidationError('');
    setIsSubmitting(true);
    try {
      await onReply(currentContent, isOfficial, notifyStudent);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      setReplyContent('');
    } catch (err: any) {
      if (err?.errors?.content) {
        setValidationError(Array.isArray(err.errors.content) ? err.errors.content.join(' ') : String(err.errors.content));
      } else if (err?.message) {
        setValidationError(err.message);
      } else {
        setValidationError('Gửi trả lời thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    setReplyContent('');
    setValidationError('');
  };

  const handleHideClick = () => {
    if (!question) return;
    const isCurrentlyHidden = question.status === 'hidden';
    const actionText = isCurrentlyHidden ? 'hiển thị lại' : 'ẩn';
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} câu hỏi này?`)) {
      onHide();
    }
  };

  // Safe renderer for reply contents
  const renderFormattedContent = (content: string) => {
    if (!content) return null;
    const containsHtml = /<[a-z][\s\S]*>/i.test(content);
    if (!containsHtml) {
      return <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{content}</p>;
    }
    const sanitized = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');

    return (
      <div 
        className="text-xs text-slate-700 leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-brand-normal [&_a]:underline [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_strong]:font-bold [&_em]:italic"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  };

  if (!question) {
    return (
      <div className="bg-white rounded-2xl shadow-3xs border border-slate-100 p-8 text-center flex flex-col items-center justify-center h-[750px]">
        <User className="w-16 h-16 text-slate-200 mb-4" />
        <h3 className="text-sm font-black text-slate-800">Không có câu hỏi nào được chọn</h3>
        <p className="text-xs text-slate-400 mt-1">Chọn một câu hỏi ở danh sách bên trái để xem chi tiết.</p>
      </div>
    );
  }

  const getBadgeStyle = (status: Question['status']) => {
    switch (status) {
      case 'unanswered':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'answered':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'hidden':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  const getBadgeLabel = (status: Question['status']) => {
    switch (status) {
      case 'unanswered':
        return 'Chưa trả lời';
      case 'answered':
        return 'Đã trả lời';
      case 'hidden':
        return 'Đã ẩn';
      default:
        return status;
    }
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins > 0 ? diffMins : 1} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const sortedReplies = [...(question.replies || [])].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortReplies === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const isHidden = question.status === 'hidden';

  return (
    <div className="bg-white rounded-2xl shadow-3xs border border-slate-200/80 flex flex-col h-full overflow-hidden">
      {/* Detail Header */}
      <div className="p-5 border-b border-slate-100 shrink-0 text-left bg-slate-50/50">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={question.student_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'} 
              alt={question.student_name}
              className="w-10 h-10 rounded-full border border-slate-100 object-cover"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs font-black text-slate-800">{question.student_name}</h3>
                <span className="text-[9px] text-slate-400 font-bold">•</span>
                <span className="text-xs font-bold text-brand-normal">{question.lesson_name}</span>
                <span className="text-[9px] text-slate-400 font-bold">•</span>
                <span className="text-[10px] text-slate-400 font-bold">{formatTime(question.created_at)}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                Thiết bị: {question.device || 'Windows'} • Trình duyệt: {question.browser || 'Chrome 124.0.0.0'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getBadgeStyle(question.status)}`}>
              {getBadgeLabel(question.status)}
            </span>
            <button 
              onClick={onToggleBookmark}
              type="button"
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                question.is_bookmarked 
                  ? 'bg-amber-50 text-amber-500 border-amber-200' 
                  : 'bg-white text-slate-400 hover:text-slate-600 border-slate-200'
              }`}
              title={question.is_bookmarked ? 'Bỏ đánh dấu câu hỏi' : 'Đánh dấu câu hỏi'}
              aria-label="Đánh dấu câu hỏi"
            >
              <Bookmark className={`w-3.5 h-3.5 ${question.is_bookmarked ? 'fill-amber-500' : ''}`} />
            </button>
            <button type="button" className="p-1.5 bg-white text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg cursor-pointer" aria-label="Tùy chọn khác">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Content (Scrollable Thread) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-left custom-scrollbar">
        {/* Original Question Content */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5">
          {renderFormattedContent(question.content)}
        </div>

        {/* Responses Thread */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-wider">
              {(question.replies && question.replies.length > 0) ? question.replies.length : (question.reply_count ?? (question as any).replies_count ?? 0)} câu trả lời
            </h4>
            
            <select
              value={sortReplies}
              onChange={(e) => setSortReplies(e.target.value as 'newest' | 'oldest')}
              className="text-[11px] font-bold text-slate-500 bg-transparent outline-none cursor-pointer hover:text-brand-normal"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>

          <div className="space-y-4">
            {sortedReplies.map((reply) => {
              const isInstructor = reply.role === 'instructor';
              return (
                <div 
                  key={reply.id} 
                  className={`p-4 rounded-2xl border transition-all flex flex-col gap-2 ${
                    isInstructor 
                      ? 'bg-brand-light/5 border-brand-light/35 ml-6' 
                      : 'bg-white border-slate-100 mr-6 shadow-3xs'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img 
                        src={reply.user_avatar || (isInstructor 
                          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80' 
                          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'
                        )} 
                        alt={reply.user_name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-100"
                      />
                      <div>
                        <span className="text-xs font-black text-slate-800">
                          {reply.user_name}
                        </span>
                        {isInstructor && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-brand-normal text-white text-[8px] font-black rounded-md uppercase tracking-wider">
                            Giảng viên
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {formatTime(reply.created_at)}
                    </span>
                  </div>
                  {renderFormattedContent(reply.content)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reply Editor (Footer Form) */}
      <form 
        onSubmit={handleReplySubmit}
        className="p-4 lg:p-5 border-t border-slate-100 bg-slate-50/40 shrink-0 text-left relative z-10"
      >
        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Trả lời học viên</h4>
        
        {/* Rich Text Editor Container */}
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white focus-within:border-brand-normal focus-within:ring-1 focus-within:ring-brand-normal transition-all shadow-3xs">
          {/* Editor Toolbar - All buttons use type="button" and onMouseDown={(e)=>e.preventDefault()} */}
          <div className="flex flex-wrap items-center gap-0.5 bg-slate-50/90 border-b border-slate-200 p-1.5 relative">
            <button 
              type="button" 
              disabled={isSubmitting} 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCommand('bold')}
              className={`p-1 rounded cursor-pointer disabled:opacity-40 transition-colors ${
                activeMarks.bold ? 'bg-emerald-100 text-emerald-800 font-black' : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`} 
              title="In đậm (Bold)" 
              aria-label="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            <button 
              type="button" 
              disabled={isSubmitting} 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCommand('italic')}
              className={`p-1 rounded cursor-pointer disabled:opacity-40 transition-colors ${
                activeMarks.italic ? 'bg-emerald-100 text-emerald-800 font-black' : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`} 
              title="In nghiêng (Italic)" 
              aria-label="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            <button 
              type="button" 
              disabled={isSubmitting} 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCommand('underline')}
              className={`p-1 rounded cursor-pointer disabled:opacity-40 transition-colors ${
                activeMarks.underline ? 'bg-emerald-100 text-emerald-800 font-black' : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`} 
              title="Gạch chân (Underline)" 
              aria-label="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            <button 
              type="button" 
              disabled={isSubmitting} 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCommand('strikeThrough')}
              className={`p-1 rounded cursor-pointer disabled:opacity-40 transition-colors ${
                activeMarks.strikethrough ? 'bg-emerald-100 text-emerald-800 font-black' : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`} 
              title="Gạch ngang (Strikethrough)" 
              aria-label="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            
            <div className="w-[1px] h-4 bg-slate-250 mx-1" aria-hidden="true" />
            
            <button 
              type="button" 
              disabled={isSubmitting} 
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCodeBlock}
              className="p-1 rounded text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 cursor-pointer disabled:opacity-40" 
              title="Đoạn mã (Code)" 
              aria-label="Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>

            <button 
              type="button" 
              disabled={isSubmitting} 
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleLinkClick}
              className="p-1 rounded text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 cursor-pointer disabled:opacity-40" 
              title="Liên kết (Link)" 
              aria-label="Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            
            <div className="w-[1px] h-4 bg-slate-250 mx-1" aria-hidden="true" />
            
            <button 
              type="button" 
              disabled={isSubmitting} 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCommand('insertUnorderedList')}
              className={`p-1 rounded cursor-pointer disabled:opacity-40 transition-colors ${
                activeMarks.bulletList ? 'bg-emerald-100 text-emerald-800 font-black' : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`} 
              title="Danh sách chấm (Bullet List)" 
              aria-label="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            <button 
              type="button" 
              disabled={isSubmitting} 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCommand('insertOrderedList')}
              className={`p-1 rounded cursor-pointer disabled:opacity-40 transition-colors ${
                activeMarks.orderedList ? 'bg-emerald-100 text-emerald-800 font-black' : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`} 
              title="Danh sách số (Numbered List)" 
              aria-label="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            <button 
              type="button" 
              disabled={isSubmitting} 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCommand('justifyLeft')}
              className="p-1 rounded text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 cursor-pointer disabled:opacity-40" 
              title="Căn lề trái (Align Left)" 
              aria-label="Align"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            
            <div className="w-[1px] h-4 bg-slate-250 mx-1" aria-hidden="true" />
            
            {/* Emoji Selector Popup */}
            <div className="relative">
              <button 
                type="button" 
                disabled={isSubmitting} 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 rounded text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 cursor-pointer disabled:opacity-40" 
                title="Biểu tượng cảm xúc (Emoji)" 
                aria-label="Emoji"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-8 left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-2 grid grid-cols-4 gap-1.5 w-36 animate-in fade-in zoom-in-95">
                  {EMOJI_LIST.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleInsertEmoji(emoji)}
                      className="p-1 hover:bg-slate-100 rounded text-sm text-center cursor-pointer transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Unsupported / Coming soon buttons with clear tooltips */}
            <button 
              type="button" 
              disabled
              className="p-1 rounded text-slate-300 cursor-not-allowed opacity-50" 
              title="Chèn ảnh (Tính năng chưa hỗ trợ)" 
              aria-label="Image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>

            <button 
              type="button" 
              disabled
              className="p-1 rounded text-slate-300 cursor-not-allowed opacity-50" 
              title="Chèn bảng (Tính năng chưa hỗ trợ)" 
              aria-label="Table"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            
            <div className="w-[1px] h-4 bg-slate-250 mx-1" aria-hidden="true" />
            
            <button 
              type="button" 
              disabled={isSubmitting} 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCommand('undo')}
              className="p-1 rounded text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 cursor-pointer disabled:opacity-40" 
              title="Hoàn tác (Undo)" 
              aria-label="Undo"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            <button 
              type="button" 
              disabled={isSubmitting} 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCommand('redo')}
              className="p-1 rounded text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 cursor-pointer disabled:opacity-40" 
              title="Làm lại (Redo)" 
              aria-label="Redo"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ContentEditable Rich Text Input Area */}
          <div
            ref={editorRef}
            contentEditable={!isSubmitting}
            suppressContentEditableWarning
            onInput={updateContentState}
            onKeyUp={updateActiveMarks}
            onMouseUp={updateActiveMarks}
            data-placeholder="Nhập câu trả lời của bạn..."
            className={`w-full p-3 text-xs outline-none bg-white resize-y min-h-[130px] text-slate-800 font-medium leading-relaxed overflow-y-auto relative empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-brand-normal [&_a]:underline [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono ${
              validationError ? 'bg-red-50/10' : ''
            }`}
          />
        </div>
        
        {validationError && (
          <p className="text-[11px] font-bold text-red-500 mt-1.5 flex items-center gap-1">
            ⚠ {validationError}
          </p>
        )}

        {/* Footer Actions Row */}
        <div className="mt-4 flex flex-col gap-4 border-t border-slate-200/60 pt-4 lg:flex-row lg:items-end lg:justify-between">
          
          {/* Nhóm Checkbox Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                disabled={isSubmitting}
                checked={isOfficial} 
                onChange={(e) => setIsOfficial(e.target.checked)}
                className="w-4 h-4 accent-brand-normal rounded cursor-pointer shrink-0"
              />
              <span className="text-xs text-slate-700 font-semibold">Đánh dấu là câu trả lời chính thức</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                disabled={isSubmitting}
                checked={notifyStudent} 
                onChange={(e) => setNotifyStudent(e.target.checked)}
                className="w-4 h-4 accent-brand-normal rounded cursor-pointer shrink-0"
              />
              <span className="text-xs text-slate-700 font-semibold">Gửi thông báo cho học viên</span>
            </label>
          </div>

          {/* Nhóm Button Hành động */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-2 w-full lg:w-auto">
            {/* Mobile Hàng 1: Hủy & Ẩn câu hỏi */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCancel}
                className="h-10 flex-1 sm:flex-none px-4 min-w-[70px] border border-slate-200 bg-white hover:bg-slate-100/80 text-slate-700 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer disabled:opacity-40 text-center"
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleHideClick}
                title={isHidden ? "Hiện lại câu hỏi này" : "Ẩn câu hỏi này khỏi danh sách công khai"}
                aria-label={isHidden ? "Hiện câu hỏi" : "Ẩn câu hỏi"}
                className="h-10 flex-1 sm:flex-none px-4 border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 text-amber-800 text-xs font-bold rounded-xl transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-40"
              >
                {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{isHidden ? 'Hiện câu hỏi' : 'Ẩn câu hỏi'}</span>
              </button>
            </div>

            {/* Mobile Hàng 2 / Desktop: Nút Gửi trả lời */}
            <button
              type="submit"
              disabled={isSubmitting || isContentEmpty(replyContent)}
              className="h-10 w-full sm:w-auto sm:min-w-[132px] px-5 bg-[#111a4a] hover:bg-[#0c1338] text-white text-xs font-bold rounded-xl transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>Gửi câu trả lời</span>
                </>
              )}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};
