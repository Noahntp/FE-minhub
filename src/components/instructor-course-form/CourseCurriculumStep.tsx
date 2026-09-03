import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Edit, FileText, CheckCircle, Video, File, HelpCircle, X, 
  ChevronRight, ChevronDown, Upload, Play, Sparkles, AlertTriangle, Eye, Save, 
  Globe, MoreVertical, GripVertical, Clock 
} from 'lucide-react';

import SectionModal from './SectionModal';
import LessonModal from './LessonModal';
import AssetModal from './AssetModal';
import LessonPreviewModal from './LessonPreviewModal';
import { InstructorVideoUploader, InstructorAssetUploader } from './InstructorUploaders';
import { sharedApi } from '@/features/shared/api';
import { instructorApi } from '@/features/instructor/api';
import { 
  formatDuration, 
  parseDurationToSeconds, 
  getVideoDurationSecondsFromFile, 
  generateSlug 
} from '@/shared/utils/format';

interface CourseCurriculumStepProps {
  chapters: any[];
  setChapters: React.Dispatch<React.SetStateAction<any[]>>;
  checklistProgress: number;
  missingItems: string[];
  completedItems: string[];
  onSubmitForReview: () => void;
  courseId?: string | number;
}

export function resolveLessonVideoUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  const url = String(rawUrl).trim();
  if (!url || url === 'undefined' || url === 'null') return null;

  // Blob URLs or absolute HTTP/HTTPS URLs
  if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Relative storage paths
  const configUrl = sharedApi.getConfig().baseUrl || 'http://127.0.0.1:8000';
  const backendOrigin = configUrl.replace(/\/api\/?$/, '');

  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  if (cleanPath.startsWith('/storage/')) {
    return `${backendOrigin}${cleanPath}`;
  }
  return `${backendOrigin}/storage${cleanPath}`;
}

export default function CourseCurriculumStep({
  chapters,
  setChapters,
  checklistProgress,
  missingItems,
  completedItems,
  onSubmitForReview,
  courseId
}: CourseCurriculumStepProps) {
  
  // Selection states (ID-based to prevent index mismatches & state corruption)
  const [activeSectionId, setActiveSectionId] = useState<string | number | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | number | null>(null);
  const [lessonDraft, setLessonDraft] = useState<any>(null);
  
  // Modal states
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  // Edit/Adding tracking states (ID-based)
  const [editingSectionId, setEditingSectionId] = useState<string | number | null>(null);
  const [addingLessonSectionId, setAddingLessonSectionId] = useState<string | number | null>(null);
  
  // Dropdown states
  const [dropdownOpenSectionId, setDropdownOpenSectionId] = useState<string | number | null>(null);
  const [dropdownOpenLessonId, setDropdownOpenLessonId] = useState<string | number | null>(null);
  
  // Collapse/Expand state for chapters
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Drag & Drop states
  const [draggedSectionIdx, setDraggedSectionIdx] = useState<number | null>(null);
  const [dragOverSectionIdx, setDragOverSectionIdx] = useState<number | null>(null);
  const [draggedLessonInfo, setDraggedLessonInfo] = useState<{ sectionId: string | number; lessonIdx: number } | null>(null);
  const [dragOverLessonInfo, setDragOverLessonInfo] = useState<{ sectionId: string | number; lessonIdx: number } | null>(null);

  // Section Drag & Drop handlers
  const handleSectionDragStart = (e: React.DragEvent, sIdx: number) => {
    e.dataTransfer.setData('text/plain', `section:${sIdx}`);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSectionIdx(sIdx);
  };

  const handleSectionDragOver = (e: React.DragEvent, sIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSectionIdx !== sIdx) {
      setDragOverSectionIdx(sIdx);
    }
  };

  const handleSectionDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedSectionIdx === null || draggedSectionIdx === targetIdx) {
      setDraggedSectionIdx(null);
      setDragOverSectionIdx(null);
      return;
    }
    setChapters(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(draggedSectionIdx, 1);
      updated.splice(targetIdx, 0, moved);
      return updated.map((ch, idx) => ({ ...ch, sort_order: idx + 1 }));
    });
    setDraggedSectionIdx(null);
    setDragOverSectionIdx(null);
  };

  // Lesson Drag & Drop handlers
  const handleLessonDragStart = (e: React.DragEvent, sectionId: string | number, lIdx: number) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', `lesson:${sectionId}:${lIdx}`);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedLessonInfo({ sectionId, lessonIdx: lIdx });
  };

  const handleLessonDragOver = (e: React.DragEvent, sectionId: string | number, lIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverLessonInfo?.sectionId !== sectionId || dragOverLessonInfo?.lessonIdx !== lIdx) {
      setDragOverLessonInfo({ sectionId, lessonIdx: lIdx });
    }
  };

  const handleLessonDrop = (e: React.DragEvent, targetSectionId: string | number, targetLIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedLessonInfo) {
      setDraggedLessonInfo(null);
      setDragOverLessonInfo(null);
      return;
    }

    setChapters(prev => {
      const next = prev.map(ch => ({ ...ch, lessons: [...(ch.lessons || [])] }));
      const sourceSec = next.find(s => String(s.id) === String(draggedLessonInfo.sectionId));
      const targetSec = next.find(s => String(s.id) === String(targetSectionId));
      if (!sourceSec || !targetSec) return prev;

      const [moved] = sourceSec.lessons.splice(draggedLessonInfo.lessonIdx, 1);
      targetSec.lessons.splice(targetLIdx, 0, moved);

      return next.map(ch => ({
        ...ch,
        lessons: (ch.lessons || []).map((les: any, idx: number) => ({ ...les, sort_order: idx + 1 }))
      }));
    });

    setDraggedLessonInfo(null);
    setDragOverLessonInfo(null);
  };

  // Derive active section & lesson using robust ID comparison
  const selectedSection = chapters.find(ch => String(ch.id) === String(activeSectionId)) || null;
  const selectedLesson = selectedSection?.lessons?.find((les: any) => String(les.id) === String(activeLessonId)) || null;

  // Auto-select first lesson on mount if available and no active selection
  useEffect(() => {
    if (chapters.length > 0 && chapters[0].lessons && chapters[0].lessons.length > 0 && activeSectionId === null) {
      setActiveSectionId(chapters[0].id);
      setActiveLessonId(chapters[0].lessons[0].id);
    }
  }, [chapters]);

  // Sync draft state with selection changes
  useEffect(() => {
    if (selectedLesson) {
      const rawSec = selectedLesson.video_duration_seconds ?? selectedLesson.duration_seconds ?? selectedLesson.duration ?? 0;
      const seconds = Math.max(0, Math.floor(Number(rawSec) || 0));
      const durationStr = formatDuration(seconds);

      let previewType = 'none';
      if (selectedLesson.is_preview) {
        previewType = selectedLesson.preview_type || '2';
      }

      setLessonDraft({
        id: selectedLesson.id,
        title: selectedLesson.title || '',
        slug: selectedLesson.slug || generateSlug(selectedLesson.title || ''),
        content: selectedLesson.content || '',
        video_url: selectedLesson.video_url || '',
        video_name: selectedLesson.video_name || '',
        video_size: selectedLesson.video_size || '',
        duration_seconds: seconds,
        video_duration_seconds: seconds,
        durationStr: durationStr,
        previewType: previewType,
        status: selectedLesson.status || 'published',
        lesson_type: selectedLesson.lesson_type || 'video',
        resources: selectedLesson.resources || selectedLesson.assets || []
      });
    } else {
      setLessonDraft(null);
    }
  }, [activeSectionId, activeLessonId, selectedLesson?.id, selectedLesson?.title, selectedLesson?.video_url, selectedLesson?.video_duration_seconds, selectedLesson?.duration_seconds, selectedLesson?.duration]);

  // Handle draft field changes
  const handleUpdateDraftField = (field: string, value: any) => {
    setLessonDraft((prev: any) => {
      if (!prev) return null;
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !prev.isSlugManuallyEdited) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });

    // If updating duration seconds or durationStr, sync immediately to chapters state
    if (field === 'video_duration_seconds' || field === 'duration_seconds' || field === 'durationStr') {
      let sec = 0;
      if (field === 'video_duration_seconds' || field === 'duration_seconds') {
        sec = Math.max(0, Math.floor(Number(value) || 0));
      } else if (field === 'durationStr') {
        sec = parseDurationToSeconds(String(value));
      }
      setChapters(prev => prev.map(ch => {
        if (String(ch.id) !== String(activeSectionId)) return ch;
        return {
          ...ch,
          lessons: (ch.lessons || []).map((les: any) => {
            if (String(les.id) !== String(activeLessonId)) return les;
            return {
              ...les,
              video_duration_seconds: sec,
              duration_seconds: sec,
              duration: sec
            };
          })
        };
      }));
    }
  };

  // Section Modal triggers
  const handleOpenAddSection = () => {
    setEditingSectionId(null);
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (sectionId: string | number) => {
    setEditingSectionId(sectionId);
    setIsSectionModalOpen(true);
    setDropdownOpenSectionId(null);
  };

  const handleSaveSection = (payload: any) => {
    if (editingSectionId !== null) {
      setChapters(prev => prev.map(ch => {
        if (String(ch.id) !== String(editingSectionId)) return ch;
        return {
          ...ch,
          title: payload.title,
          description: payload.description,
          sort_order: payload.sort_order,
          status: payload.status,
          lessons: ch.lessons || []
        };
      }));
      alert('Đã cập nhật chương thành công!');
    } else {
      const newSec = {
        id: 'sec-' + Date.now(),
        title: payload.title,
        description: payload.description,
        sort_order: payload.sort_order,
        status: payload.status,
        lessons: []
      };
      setChapters(prev => [...prev, newSec]);
      setActiveSectionId(newSec.id);
      alert('Đã thêm chương thành công!');
    }
    setIsSectionModalOpen(false);
  };

  const handleRemoveSection = (sectionId: string | number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chương này và toàn bộ bài học bên trong?')) {
      setChapters(prev => prev.filter(ch => String(ch.id) !== String(sectionId)));
      if (String(activeSectionId) === String(sectionId)) {
        setActiveSectionId(null);
        setActiveLessonId(null);
      }
      setDropdownOpenSectionId(null);
    }
  };

  // Lesson Modal triggers
  const handleOpenAddLesson = (sectionId: string | number) => {
    setAddingLessonSectionId(sectionId);
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = (payload: any) => {
    if (addingLessonSectionId !== null) {
      const newLessonId = 'les-' + Date.now();
      const newLesson = {
        id: newLessonId,
        title: payload.title,
        slug: payload.slug || generateSlug(payload.title),
        lesson_type: payload.lesson_type,
        content: payload.content || '',
        video_url: payload.video_url || '',
        video_duration_seconds: payload.video_duration_seconds || 0,
        is_preview: payload.is_preview || false,
        status: payload.status || 'published',
        sort_order: payload.sort_order || 1,
        resources: []
      };

      setChapters(prev => prev.map(ch => {
        if (String(ch.id) !== String(addingLessonSectionId)) return ch;
        return { ...ch, lessons: [...(ch.lessons || []), newLesson] };
      }));

      const targetSecId = addingLessonSectionId;
      setAddingLessonSectionId(null);
      setIsLessonModalOpen(false);

      setActiveSectionId(targetSecId);
      setActiveLessonId(newLessonId);
      alert('Đã thêm bài học thành công!');
    }
  };

  const handleRemoveLesson = (sectionId: string | number, lessonId: string | number) => {
    if (window.confirm('Bạn có chắc muốn xóa bài học này?')) {
      setChapters(prev => prev.map(ch => {
        if (String(ch.id) !== String(sectionId)) return ch;
        return { ...ch, lessons: (ch.lessons || []).filter((les: any) => String(les.id) !== String(lessonId)) };
      }));
      if (String(activeLessonId) === String(lessonId)) {
        setActiveLessonId(null);
      }
      setDropdownOpenLessonId(null);
    }
  };

  // Save Lesson Inline (Panel bên phải)
  const handleSaveLessonInline = async () => {
    if (activeSectionId !== null && activeLessonId !== null && lessonDraft) {
      const parsedSec = parseDurationToSeconds(lessonDraft.durationStr);
      const totalSec = parsedSec > 0 ? parsedSec : (Number(lessonDraft.video_duration_seconds) || 0);
      const finalSlug = lessonDraft.slug ? lessonDraft.slug : generateSlug(lessonDraft.title);
      const isPreviewBool = Boolean(lessonDraft.is_preview || lessonDraft.previewType === 'free' || lessonDraft.previewType === '2');

      const numericLessonId = Number(activeLessonId);
      if (!isNaN(numericLessonId) && numericLessonId > 0 && sharedApi.getConfig().mode === 'api') {
        try {
          const res = await instructorApi.updateLesson(numericLessonId, {
            title: lessonDraft.title,
            slug: finalSlug,
            content: lessonDraft.content,
            video_url: lessonDraft.video_url,
            video_duration_seconds: totalSec,
            is_preview: isPreviewBool,
            preview_type: isPreviewBool ? 'free' : 'none',
            status: lessonDraft.status,
            lesson_type: lessonDraft.lesson_type,
          });

          if (res) {
            const apiSec = Number(res.video_duration_seconds ?? res.data?.video_duration_seconds) ?? totalSec;
            const apiIsPreview = res.is_preview !== undefined ? Boolean(res.is_preview) : isPreviewBool;
            if (!isNaN(apiSec) && apiSec >= 0) {
              setChapters(prev => prev.map(ch => {
                if (String(ch.id) !== String(activeSectionId)) return ch;
                return {
                  ...ch,
                  lessons: (ch.lessons || []).map((les: any) => {
                    if (String(les.id) !== String(activeLessonId)) return les;
                    return {
                      ...les,
                      title: lessonDraft.title,
                      content: lessonDraft.content,
                      video_url: lessonDraft.video_url,
                      lesson_type: lessonDraft.lesson_type,
                      video_duration_seconds: apiSec,
                      duration_seconds: apiSec,
                      is_preview: apiIsPreview
                    };
                  })
                };
              }));
            }
          }
        } catch (e) {
          console.error('Failed to update lesson API:', e);
        }
      }

      setChapters(prev => prev.map(ch => {
        if (String(ch.id) !== String(activeSectionId)) return ch;
        const updatedLessons = (ch.lessons || []).map((les: any) => {
          if (String(les.id) !== String(activeLessonId)) return les;
          return {
            ...les,
            title: lessonDraft.title,
            slug: finalSlug,
            content: lessonDraft.content,
            video_url: lessonDraft.video_url,
            video_name: lessonDraft.video_name,
            video_size: lessonDraft.video_size,
            duration_seconds: totalSec,
            video_duration_seconds: totalSec,
            is_preview: isPreviewBool,
            preview_type: isPreviewBool ? 'free' : 'none',
            status: lessonDraft.status,
            lesson_type: lessonDraft.lesson_type,
            resources: lessonDraft.resources || []
          };
        });
        return { ...ch, lessons: updatedLessons };
      }));
      alert('Đã lưu bài học thành công!');
    }
  };

  // Cancel edits inline
  const handleCancelChanges = () => {
    if (selectedLesson) {
      const seconds = selectedLesson.video_duration_seconds || 0;
      const durationStr = formatDuration(seconds);

      setLessonDraft({
        id: selectedLesson.id,
        title: selectedLesson.title || '',
        slug: selectedLesson.slug || generateSlug(selectedLesson.title || ''),
        content: selectedLesson.content || '',
        video_url: selectedLesson.video_url || '',
        video_name: selectedLesson.video_name || '',
        video_size: selectedLesson.video_size || '',
        durationStr: durationStr,
        previewType: selectedLesson.is_preview ? (selectedLesson.preview_type || '2') : 'none',
        status: selectedLesson.status || 'published',
        lesson_type: selectedLesson.lesson_type || 'video',
        resources: selectedLesson.resources || selectedLesson.assets || []
      });
    }
  };

  // Asset Modal triggers
  const handleOpenAddAsset = () => {
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = async (payload: any) => {
    if (!lessonDraft) return;

    try {
      let createdAsset: any = {
        id: 'asset-' + Date.now(),
        title: payload.title,
        file_url: payload.file_url,
        file_name: payload.file_name,
        file_type: payload.file_type,
        file_size: payload.file_size,
        note: payload.note
      };

      const numericLessonId = Number(activeLessonId);
      if (!isNaN(numericLessonId) && numericLessonId > 0 && sharedApi.getConfig().mode === 'api') {
        const res = await instructorApi.createLessonAsset(numericLessonId, payload);
        if (res && (res.id || res.data?.id)) {
          const item = res.data || res;
          createdAsset = {
            id: item.id,
            title: item.title || payload.title,
            file_url: item.file_url || payload.file_url,
            file_name: item.file_name || payload.file_name,
            file_type: item.file_type || payload.file_type,
            file_size: item.file_size || payload.file_size,
            note: item.note || payload.note
          };
        }
      }

      const updatedResources = [...(lessonDraft.resources || []), createdAsset];
      handleUpdateDraftField('resources', updatedResources);

      setChapters(prev => prev.map(ch => {
        if (String(ch.id) !== String(activeSectionId)) return ch;
        return {
          ...ch,
          lessons: (ch.lessons || []).map((les: any) => {
            if (String(les.id) !== String(activeLessonId)) return les;
            return {
              ...les,
              resources: updatedResources,
              assets: updatedResources
            };
          })
        };
      }));

      setIsAssetModalOpen(false);
      alert('Đã thêm tài liệu đính kèm thành công!');
    } catch (e: any) {
      alert(`Thêm tài liệu thất bại: ${e.message || 'Lỗi hệ thống'}`);
    }
  };

  const handleRemoveAsset = (assetId: string | number) => {
    if (window.confirm('Bạn có chắc chắn muốn gỡ bỏ tài nguyên đính kèm này?')) {
      const updatedResources = (lessonDraft.resources || []).filter((r: any) => String(r.id) !== String(assetId));
      handleUpdateDraftField('resources', updatedResources);

      setChapters(prev => prev.map(ch => {
        if (String(ch.id) !== String(activeSectionId)) return ch;
        return {
          ...ch,
          lessons: (ch.lessons || []).map((les: any) => {
            if (String(les.id) !== String(activeLessonId)) return les;
            return {
              ...les,
              resources: updatedResources,
              assets: updatedResources
            };
          })
        };
      }));
    }
  };

  // Handle Preview Lesson Modal trigger
  const handlePreviewLesson = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPreviewModalOpen(true);
  };

  const toggleCollapse = (secId: string | number) => {
    setCollapsedSections(prev => ({ ...prev, [String(secId)]: !prev[String(secId)] }));
  };

  const editingSection = chapters.find(ch => String(ch.id) === String(editingSectionId)) || null;

  // Resolve current lesson video URL for preview modal
  const previewVideoUrlResolved = resolveLessonVideoUrl(lessonDraft?.video_url || selectedLesson?.video_url);

  return (
    <div className="space-y-6 text-stone-850 font-sans text-xs antialiased text-left max-w-7xl mx-auto pb-16">
      
      {/* 3-COLUMN MAIN LAYOUT (RESTORED TO ORIGINAL FORMAT: LEFT=STRUCTURE, MIDDLE=EDITOR, RIGHT=CHECKLIST) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ==================================================
            CỘT BÊN TRÁI: DANH SÁCH CHƯƠNG & BÀI HỌC (col-span-4)
            ================================================== */}
        <div id="focus-published_section" data-focus-id="published_section" className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs space-y-3 instructor-curriculum-sidebar">
          <div className="flex justify-between items-center pb-2 border-b">
            <h3 className="font-black text-xs text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" /> Cấu trúc khóa học
            </h3>
            <button
              id="focus-add-section"
              data-focus-id="add-section"
              type="button"
              onClick={handleOpenAddSection}
              className="text-[9.5px] font-extrabold text-white bg-[#10b981] hover:bg-emerald-600 rounded-lg px-2.5 py-1 flex items-center gap-1 cursor-pointer transition-colors shadow-3xs"
            >
              <Plus className="w-3 h-3 stroke-[3]" /> Thêm chương
            </button>
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {chapters.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-slate-50/50">
                <p className="text-stone-400 italic text-[11px]">Chưa có chương nào. Hãy thêm chương đầu tiên cho khóa học.</p>
              </div>
            ) : (
              chapters.map((chapter, sIdx) => {
                const isCollapsed = !!collapsedSections[String(chapter.id)];
                const isSectionDraggedOver = dragOverSectionIdx === sIdx && draggedSectionIdx !== null && draggedSectionIdx !== sIdx;

                return (
                  <div 
                    key={chapter.id || sIdx} 
                    onDragOver={(e) => handleSectionDragOver(e, sIdx)}
                    onDrop={(e) => handleSectionDrop(e, sIdx)}
                    className={`border rounded-xl p-3 bg-slate-50/20 space-y-2 instructor-section-card relative transition-all ${
                      isSectionDraggedOver 
                        ? 'border-emerald-500 bg-emerald-50/30 scale-[1.01]' 
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    
                    {/* Chapter Header */}
                    <div className="flex justify-between items-center group/chapter">
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        {/* Drag Handle */}
                        <div
                          draggable
                          onDragStart={(e) => handleSectionDragStart(e, sIdx)}
                          className="p-1 text-stone-300 hover:text-stone-600 cursor-grab active:cursor-grabbing rounded transition-colors"
                          title="Kéo thả để sắp xếp lại chương"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>

                        <button 
                          type="button"
                          onClick={() => toggleCollapse(chapter.id)}
                          className="flex items-center gap-1.5 text-left min-w-0 flex-1 hover:text-emerald-700 select-none cursor-pointer focus:outline-none"
                        >
                          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-stone-400" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-400" />}
                          <span className="font-extrabold text-stone-850 truncate text-[11px] select-none">
                            Chương {sIdx + 1}: {chapter.title}
                          </span>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1.5 ml-2 shrink-0">
                        <button
                          id="focus-add-lesson"
                          data-focus-id="add-lesson"
                          type="button"
                          onClick={() => handleOpenAddLesson(chapter.id)}
                          className="text-[9.5px] font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-2 py-0.5 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" /> Thêm bài
                        </button>
                        
                        <div className="relative">
                          <button 
                            type="button"
                            onClick={() => setDropdownOpenSectionId(dropdownOpenSectionId === chapter.id ? null : chapter.id)}
                            className="p-1 hover:bg-slate-100 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer transition-colors"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Section Actions Dropdown */}
                          {dropdownOpenSectionId === chapter.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpenSectionId(null)} />
                              <div className="absolute right-0 mt-1 w-28 bg-white border border-stone-200 rounded-xl shadow-lg z-20 py-1 text-stone-700 text-[10px] font-bold">
                                <button 
                                  type="button"
                                  onClick={() => handleOpenEditSection(chapter.id)}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit className="w-3 h-3" /> Chỉnh sửa
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleRemoveSection(chapter.id)}
                                  className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer border-t"
                                >
                                  <Trash2 className="w-3 h-3" /> Xóa chương
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lessons list inside Chapter */}
                    {!isCollapsed && (
                      <div className="space-y-1 pl-2 border-l border-slate-200/80 mt-1">
                        {chapter.lessons && chapter.lessons.map((lesson: any, lIdx: number) => {
                          const isSelected = String(chapter.id) === String(activeSectionId) && String(lesson.id) === String(activeLessonId);
                          const lessonSec = Number(lesson.video_duration_seconds ?? lesson.duration_seconds ?? lesson.duration ?? 0);
                          const durationStr = formatDuration(lessonSec);
                          const isLessonDraggedOver = dragOverLessonInfo?.sectionId === chapter.id && dragOverLessonInfo?.lessonIdx === lIdx;
                          
                          return (
                            <div 
                              key={lesson.id || lIdx}
                              onDragOver={(e) => handleLessonDragOver(e, chapter.id, lIdx)}
                              onDrop={(e) => handleLessonDrop(e, chapter.id, lIdx)}
                              onClick={() => {
                                setActiveSectionId(chapter.id);
                                setActiveLessonId(lesson.id);
                              }}
                              className={`flex justify-between items-center px-2 py-2 rounded-lg cursor-pointer transition-all instructor-lesson-row group/lesson relative border ${
                                isLessonDraggedOver
                                  ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                                  : isSelected 
                                    ? 'bg-[#e6f4ea] border-emerald-500/50 text-emerald-800 shadow-3xs font-bold' 
                                    : 'hover:bg-slate-50/70 border-transparent text-stone-650'
                              }`}
                            >
                              <div className="flex items-center gap-1 truncate flex-1 min-w-0 pr-1.5">
                                {/* Lesson Drag Handle */}
                                <div
                                  draggable
                                  onDragStart={(e) => handleLessonDragStart(e, chapter.id, lIdx)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-0.5 text-stone-300 hover:text-stone-600 cursor-grab active:cursor-grabbing rounded transition-colors shrink-0"
                                  title="Kéo thả sắp xếp bài học"
                                >
                                  <GripVertical className="w-3 h-3" />
                                </div>

                                {lesson.lesson_type === 'video' ? (
                                  <Video className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                )}
                                <span className="truncate text-[10.5px]">
                                  {sIdx + 1}.{lIdx + 1} {lesson.title}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 shrink-0 ml-1">
                                {Boolean(lesson.is_preview) && (
                                  <span className="text-[8px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                                    Xem thử
                                  </span>
                                )}
                                <span className="text-[8.5px] font-bold text-stone-400 uppercase">
                                  {lesson.lesson_type === 'video' ? 'Video' : 'Tài liệu'}
                                </span>
                                <span className="text-[8.5px] font-semibold text-stone-455 shrink-0 font-mono">
                                  {lesson.lesson_type === 'video' ? durationStr : 'PDF'}
                                </span>
                                
                                <div className="relative">
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDropdownOpenLessonId(dropdownOpenLessonId === lesson.id ? null : lesson.id);
                                    }}
                                    className="p-0.5 hover:bg-slate-200 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer transition-colors"
                                  >
                                    <MoreVertical className="w-3 h-3" />
                                  </button>
                                  
                                  {/* Lesson Actions Dropdown */}
                                  {dropdownOpenLessonId === lesson.id && (
                                    <>
                                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpenLessonId(null)} />
                                      <div className="absolute right-0 mt-1 w-24 bg-white border border-stone-200 rounded-xl shadow-lg z-20 py-1 text-stone-700 text-[10px] font-bold">
                                        <button 
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveLesson(chapter.id, lesson.id);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                                        >
                                          <Trash2 className="w-3 h-3" /> Xóa bài
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {(!chapter.lessons || chapter.lessons.length === 0) && (
                          <div className="py-2.5 pl-3 border border-dashed rounded-lg bg-white/40 text-center">
                            <p className="text-[9.5px] text-stone-400 italic">Chưa có bài học nào trong chương này.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ==================================================
            CỘT GIỮA: CHỈNH SỬA BÀI HỌC (col-span-5)
            ================================================== */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs text-left instructor-lesson-editor relative z-10">
          
          {lessonDraft ? (
            <div className="space-y-4">
              
              {/* Editor Header */}
              <div className="flex justify-between items-start border-b pb-3">
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs text-stone-900">Chỉnh sửa bài học</h4>
                  <p className="text-[10px] text-[#8b5e3c] font-bold truncate mt-0.5" title={selectedSection?.title}>
                    Chương {selectedSection ? (chapters.findIndex(c => String(c.id) === String(selectedSection.id)) + 1) : 1}: {selectedSection?.title}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button 
                    type="button"
                    onClick={handlePreviewLesson}
                    className="border border-slate-200 hover:bg-slate-50 text-stone-700 font-extrabold px-3 py-1.5 rounded-xl shadow-3xs transition-all flex items-center gap-1 cursor-pointer text-[10.5px]"
                  >
                    <Eye className="w-3.5 h-3.5 text-stone-500" /> Xem trước
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => handleRemoveLesson(activeSectionId!, activeLessonId!)}
                    className="p-2 border border-slate-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 rounded-xl transition-all cursor-pointer shadow-3xs"
                    title="Xóa bài học"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="space-y-4">
                
                {/* 1. Tiêu đề bài học */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-stone-600">Tiêu đề bài học *</label>
                  <div className="relative">
                    <input 
                      type="text"
                      maxLength={150}
                      value={lessonDraft.title}
                      onChange={(e) => handleUpdateDraftField('title', e.target.value)}
                      placeholder="Nhập tiêu đề bài học"
                      className="w-full text-[10.5px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50/15 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-3.5 bottom-2.5 text-[8.5px] text-stone-400 font-bold">
                      {lessonDraft.title ? lessonDraft.title.length : 0}/150
                    </span>
                  </div>
                </div>

                {/* 2. Loại bài học */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-stone-600">Loại bài học</label>
                  <select 
                    value={lessonDraft.lesson_type || 'video'} 
                    onChange={(e) => handleUpdateDraftField('lesson_type', e.target.value)}
                    className="w-full text-[10.5px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="video">Video bài giảng</option>
                    <option value="document">Tài liệu học tập (Doc/PDF/Slide)</option>
                    <option value="text">Bài đọc lý thuyết (Text)</option>
                  </select>
                </div>

                {/* 3. Đường dẫn bài học (slug) */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-stone-600">Đường dẫn bài học (slug)</label>
                  <input 
                    type="text"
                    value={lessonDraft.slug || ''}
                    onChange={(e) => {
                      handleUpdateDraftField('slug', e.target.value);
                      handleUpdateDraftField('isSlugManuallyEdited', true);
                    }}
                    placeholder="duong-dan-bai-hoc"
                    className="w-full text-[10.5px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/15 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* 4. Mô tả / Nội dung bài học */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-stone-600">
                    {lessonDraft.lesson_type === 'text' ? 'Nội dung bài viết (Markdown/HTML) *' : 'Mô tả bài học'}
                  </label>
                  <div className="relative">
                    <textarea 
                      rows={lessonDraft.lesson_type === 'text' ? 7 : 4}
                      maxLength={lessonDraft.lesson_type === 'text' ? 5000 : 500}
                      value={lessonDraft.content}
                      onChange={(e) => handleUpdateDraftField('content', e.target.value)}
                      placeholder={lessonDraft.lesson_type === 'text' ? "Soạn thảo nội dung bài viết hướng dẫn chi tiết..." : "Mô tả tóm tắt nội dung bài học..."}
                      className="w-full text-[10.5px] font-medium text-stone-700 border border-slate-200 rounded-xl p-3 bg-slate-50/15 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-3.5 bottom-2.5 text-[8.5px] text-stone-400 font-bold">
                      {lessonDraft.content ? lessonDraft.content.length : 0}/{lessonDraft.lesson_type === 'text' ? 5000 : 500}
                    </span>
                  </div>
                </div>

                {/* 5. Tải lên video bài học (File Upload Duy Nhất cho Video) */}
                {lessonDraft.lesson_type === 'video' && (
                  <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-2">
                    <InstructorVideoUploader 
                      value={lessonDraft.video_url} 
                      onChange={(url) => {
                        handleUpdateDraftField('video_url', url);
                        if (url) {
                          handleUpdateDraftField('video_name', 'Video bài học đã được tải lên');
                        } else {
                          handleUpdateDraftField('video_name', '');
                          handleUpdateDraftField('video_size', '');
                          handleUpdateDraftField('video_duration_seconds', 0);
                          handleUpdateDraftField('durationStr', '00:00');
                        }
                      }}
                      onDurationExtracted={(sec) => {
                        if (sec > 0) {
                          handleUpdateDraftField('video_duration_seconds', sec);
                          handleUpdateDraftField('durationStr', formatDuration(sec));
                        }
                      }}
                      type="lesson_video" 
                      label="File Video bài học"
                    />
                  </div>
                )}

                {/* 5. Tải lên file tài liệu (cho loại Document) */}
                {lessonDraft.lesson_type === 'document' && (
                  <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-2">
                    <label className="block text-[10px] font-bold text-stone-700">Tải lên file tài liệu học tập (PDF, DOCX, ZIP, Slide)</label>
                    <InstructorAssetUploader 
                      onAssetUploaded={(asset) => {
                        handleSaveAsset(asset);
                        if (!lessonDraft.video_url) {
                          handleUpdateDraftField('video_url', asset.file_url);
                        }
                      }}
                      label="Tải tài liệu đính kèm"
                    />
                  </div>
                )}

                {/* 6. Cài đặt thời lượng & Học thử */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-1">Thời lượng (mm:ss)</label>
                    <input 
                      type="text"
                      value={lessonDraft.durationStr || '00:00'}
                      onChange={(e) => handleUpdateDraftField('durationStr', e.target.value)}
                      placeholder="15:00"
                      className="w-full text-[10.5px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/15 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-1">Học thử (Preview)</label>
                    <select 
                      value={lessonDraft.previewType || 'none'}
                      onChange={(e) => handleUpdateDraftField('previewType', e.target.value)}
                      className="w-full text-[10.5px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none cursor-pointer"
                    >
                      <option value="none">Không cho học thử</option>
                      <option value="free">Học thử toàn bộ bài này</option>
                    </select>
                  </div>
                </div>

                {/* 6. Tài nguyên đính kèm */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-stone-600">Tài liệu đính kèm ({lessonDraft.resources ? lessonDraft.resources.length : 0})</label>
                    <button 
                      type="button"
                      onClick={handleOpenAddAsset}
                      className="text-[9.5px] font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-2 py-1 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" /> Thêm tài liệu
                    </button>
                  </div>

                  {lessonDraft.resources && lessonDraft.resources.length > 0 ? (
                    <div className="space-y-1.5">
                      {lessonDraft.resources.map((res: any, rIdx: number) => (
                        <div key={res.id || rIdx} className="flex justify-between items-center p-2 bg-slate-50 border rounded-xl">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <File className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="text-[10px] font-bold text-stone-700 truncate">{res.title || res.file_name}</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveAsset(res.id)}
                            className="p-1 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9.5px] text-stone-400 italic">Chưa có tài liệu đính kèm nào cho bài học này.</p>
                  )}
                </div>

                {/* 7. Action Footer */}
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={handleCancelChanges}
                    className="px-4 py-2 border rounded-xl font-bold text-stone-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="button"
                    onClick={handleSaveLessonInline}
                    className="px-5 py-2 bg-[#10b981] hover:bg-emerald-600 text-white font-black rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" /> Lưu bài học
                  </button>
                </div>

              </div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-stone-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-stone-500 font-bold text-xs">Vui lòng chọn một bài học bên danh sách trái để chỉnh sửa chi tiết</p>
            </div>
          )}

        </div>

        {/* ==================================================
            CỘT PHẢI: CHECKLIST HOÀN THIỆN KHÓA HỌC (col-span-3)
            ================================================== */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs text-left space-y-3">
            <h3 className="font-black text-xs text-stone-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Checklist hoàn thiện
            </h3>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-stone-600">Tiến độ hoàn thiện</span>
                <span className="text-emerald-700 font-extrabold">{checklistProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${checklistProgress}%` }}
                />
              </div>
            </div>

            {/* Missing Items */}
            {missingItems && missingItems.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t">
                <p className="text-[10px] font-extrabold text-amber-700 uppercase">Cần bổ sung ({missingItems.length})</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {missingItems.map((item, idx) => (
                    <div key={idx} className="text-[10px] font-medium text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200/70 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Items */}
            {completedItems && completedItems.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t">
                <p className="text-[10px] font-extrabold text-emerald-700 uppercase">Đã hoàn thành ({completedItems.length})</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {completedItems.map((item, idx) => (
                    <div key={idx} className="text-[10px] font-semibold text-emerald-800 bg-emerald-50/50 p-1.5 rounded-lg flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-3 border-t">
              <button
                type="button"
                onClick={onSubmitForReview}
                className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-black py-2.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <Sparkles className="w-4 h-4" /> Gửi duyệt khóa học
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* MODALS */}
      <SectionModal 
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        onSave={handleSaveSection}
        initialData={editingSection}
      />

      <LessonModal 
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        onSave={handleSaveLesson}
        initialData={null}
        courseId={courseId}
      />

      <AssetModal 
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onSave={handleSaveAsset}
      />

      <LessonPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={lessonDraft?.title || selectedLesson?.title || ''}
        lessonType={lessonDraft?.lesson_type || selectedLesson?.lesson_type || 'video'}
        videoUrl={previewVideoUrlResolved}
        content={lessonDraft?.content || selectedLesson?.content || ''}
        durationStr={lessonDraft?.durationStr}
        isPreview={lessonDraft?.previewType !== 'none' || selectedLesson?.is_preview}
      />
    </div>
  );
}
