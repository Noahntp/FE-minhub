import React, { useState, useEffect } from 'react';
import { 
  BarChart, Users, DollarSign, Settings, Bell, Shield, 
  Trash2, UserX, Plus, FileText, CheckCircle, Landmark, 
  ShoppingBag, AlertTriangle, AlertCircle, XCircle, 
  FolderTree, Edit2, Key, BookOpen, Search, Check, Layers, ShieldCheck, Filter, Image,
  Award, TrendingUp, GraduationCap, Star, Activity,
  MessageSquare, Compass, Eye, ShieldAlert, Clock, Info, UserPlus, Box
} from 'lucide-react';
import { Course, User, PayoutRequest, AuditLog, AccountRequest, Order, Role, Banner, Notification, Coupon, FlaggedItem } from '../types';
import { safeLocalStorage as localStorage } from '../utils/safeStorage';
import { SYSTEM_COUPONS, AUDIT_LOGS_MOCK } from '../data';
import { ApiService } from '../services/api';

interface ModeratorTabProps {
  currentUser: User;
  courses: Course[];
  flaggedReviews: FlaggedItem[];
  onApproveCourse: (courseId: string) => void;
  onRejectCourse: (courseId: string, reason: string) => void;
  onResolveFlag: (flagId: string, resolveAction: 'dismiss' | 'resolved') => void;
  accountRequests: AccountRequest[];
  onResolveAccountRequest: (id: string, action: 'approved' | 'rejected') => void;
  onClose: () => void;
}

function ModeratorTab({
  currentUser,
  courses,
  flaggedReviews,
  onApproveCourse,
  onRejectCourse,
  onResolveFlag,
  accountRequests,
  onResolveAccountRequest,
  onClose
}: ModeratorTabProps) {

  // Selected tab: 'moderation_courses' | 'moderation_content' | 'account_requests'
  const [activeTab, setActiveTab] = useState<'moderation_courses' | 'moderation_content' | 'account_requests' | 'packages_management'>('moderation_courses');
  
  // Rejection modal state
  const [rejectingCourseId, setRejectingCourseId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  
  // Course detailed inspector state
  const [inspectingCourse, setInspectingCourse] = useState<Course | null>(null);

  // Search & Filter for Pending Courses
  const [courseSearchQuery, setCourseSearchQuery] = useState('');

  // Content search & filter
  const [contentSearchQuery, setContentSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'review' | 'comment'>('all');

  // Course review actions
  const pendingCourses = courses.filter(c => {
    const matchesQuery = c.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
                         c.instructorName.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
                         c.description.toLowerCase().includes(courseSearchQuery.toLowerCase());
    return c.status === 'pending' && matchesQuery;
  });

  const handleOpenRejectModal = (courseId: string) => {
    setRejectingCourseId(courseId);
    setRejectionReasonText('');
  };

  const handleConfirmReject = () => {
    if (!rejectingCourseId || !rejectionReasonText.trim()) return;
    onRejectCourse(rejectingCourseId, rejectionReasonText);
    setRejectingCourseId(null);
    setRejectionReasonText('');
    alert('Đã ghi nhận lý do và từ chối phê duyệt khóa học này thành công!');
  };

  return (
    <div className="bg-white min-h-[75vh] rounded-2xl border border-brand-light-active overflow-hidden flex flex-col md:flex-row text-main-darker animate-fade-in shadow relative">
      
      {/* Tab Selectors Left Sidebar */}
      <div className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-brand-light-active p-4 space-y-2 shrink-0">
        <div className="text-center pb-4 border-b border-brand-light-active mb-4">
          <img src={currentUser.avatar} alt="Avatar" className="w-14 h-14 rounded-full mx-auto mb-2 border-2 border-brand-dark" />
          <h3 className="text-xs font-bold truncate">{currentUser.name}</h3>
          <span className="text-[9px] bg-main-normal text-brand-light uppercase tracking-wider px-2 py-0.5 rounded inline-block mt-1 font-semibold">Admin Moderation</span>
        </div>

        <button 
          onClick={() => setActiveTab('moderation_courses')}
          className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 ${activeTab === 'moderation_courses' ? 'bg-brand-normal text-brand-light' : 'hover:bg-brand-light-hover'}`}
        >
          <Compass className="w-4 h-4 text-stone-700" /> Khóa học Chờ Duyệt ({courses.filter(c => c.status === 'pending').length})
        </button>
        <button 
          onClick={() => setActiveTab('moderation_content')}
          className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 ${activeTab === 'moderation_content' ? 'bg-brand-normal text-brand-light' : 'hover:bg-brand-light-hover'}`}
        >
          <ShieldAlert className="w-4 h-4 text-stone-700" /> Kiểm duyệt Bình luận ({flaggedReviews.length})
        </button>
        <button 
          onClick={() => setActiveTab('account_requests')}
          className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between ${activeTab === 'account_requests' ? 'bg-brand-normal text-brand-light' : 'hover:bg-brand-light-hover'}`}
        >
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4 text-stone-705 shrink-0" /> Yêu cầu Khóa & Xóa
          </div>
          <span className="bg-red-150 text-red-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {accountRequests.filter(r => r.status === 'pending').length}
          </span>
        </button>

        <div className="pt-6">
          <button onClick={onClose} className="w-full text-center border text-xs py-1.5 rounded-lg text-gray-400 hover:text-black">
            Quay lại Admin chính
          </button>
        </div>
      </div>

      {/* Interactive Main Body Content */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        
        {/* COURSES VERIFICATION/APPROVE WORKFLOW */}
        {activeTab === 'moderation_courses' && (() => {
          const totalPendingCount = courses.filter(c => c.status === 'pending').length;

          return (
            <div className="space-y-4 animate-fade-in text-xs text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-stone-100">
                <div>
                  <h3 className="text-sm md:text-base font-display font-bold text-main-normal text-left flex items-center gap-1.5">
                    <Compass className="w-5 h-5 text-stone-800" /> Danh sách khóa học chờ thẩm định xuất bản
                  </h3>
                  <p className="text-[10.5px] text-stone-400">Kiểm tra thông tin đề cương, tài liệu và cấu trúc lớp học trước khi xuất bản rộng rãi.</p>
                </div>
                
                {/* Search query input */}
                {totalPendingCount > 0 && (
                  <div className="w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="Tìm bài giảng theo từ khóa, giảng viên..."
                      value={courseSearchQuery}
                      onChange={(e) => setCourseSearchQuery(e.target.value)}
                      className="w-full text-xs p-2 px-3 border border-brand-light-active rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-normal placeholder-stone-400 font-medium"
                    />
                  </div>
                )}
              </div>
              
              {totalPendingCount === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-dashed rounded-2xl">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                  <p className="font-extrabold text-sm text-stone-800">Xin chúc mừng!</p>
                  <p className="text-stone-500 text-xs mt-1">Không có chương trình đào tạo nào đang tồn đọng chờ kiểm duyệt xuất bản.</p>
                </div>
              ) : pendingCourses.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-dashed rounded-2xl space-y-2">
                  <Info className="w-10 h-10 text-stone-400 mx-auto" />
                  <p className="text-stone-500 font-bold">Không tìm thấy kết quả nào phù hợp với từ khóa "{courseSearchQuery}".</p>
                  <button
                    onClick={() => setCourseSearchQuery('')}
                    className="text-[#8b5e3c] font-black hover:underline text-xs"
                  >
                    Xóa bộ lọc tìm kiếm
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingCourses.map((c) => (
                    <div key={c.id} className="border border-brand-light-active bg-slate-50 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:border-brand-normal/30 transition-all">
                      <div className="flex gap-3 text-left">
                        <img src={c.image} alt="Banner" className="w-20 h-14 object-cover rounded-lg shrink-0 border" />
                        <div>
                          <span className="text-[9px] bg-brand-normal/10 text-brand-dark px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{c.category}</span>
                          <h4 className="font-bold text-xs text-main-normal leading-snug mt-1">{c.title}</h4>
                          <p className="text-[10px] text-stone-500 mt-0.5">Giảng viên: <span className="font-semibold text-stone-700">{c.instructorName}</span> • Đề xuất: <span className="font-bold text-stone-800">{c.price.toLocaleString('vi-VN')} VND</span></p>
                          <p className="text-[11px] text-stone-605 mt-1 line-clamp-2">{c.description}</p>
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0 w-full md:w-auto self-end md:self-center justify-end">
                        <button 
                          onClick={() => setInspectingCourse(c)}
                          className="bg-stone-100 hover:bg-stone-200 text-stone-850 font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 border border-stone-300 shadow-3xs text-[11px]"
                          title="Xem toàn bộ cấu trúc bài viết, tài liệu, quiz"
                        >
                          <Eye className="w-3.5 h-3.5 text-stone-750" /> Xem Chi Tiết
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Xác nhận phê duyệt và phát hành khóa học "${c.title}" lên hệ thống MindHub công khai?`)) {
                              onApproveCourse(c.id);
                              alert('✓ Đã phê duyệt và xuất bản khóa học thành công!');
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 shadow text-[11px]"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Phê Duyệt
                        </button>
                        <button 
                          onClick={() => handleOpenRejectModal(c.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 shadow text-[11px]"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Từ Chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* FLAGGED CONCERNS COMMENT / REVIEWS BLACKLIST VERIFY */}
        {activeTab === 'moderation_content' && (() => {
          const totalFlagsCount = flaggedReviews.length;
          
          const filteredFlagged = flaggedReviews.filter(flag => {
            const matchesSearch = flag.content.toLowerCase().includes(contentSearchQuery.toLowerCase()) ||
                                  flag.reporter.toLowerCase().includes(contentSearchQuery.toLowerCase()) ||
                                  flag.reason.toLowerCase().includes(contentSearchQuery.toLowerCase()) ||
                                  (flag.courseTitle || '').toLowerCase().includes(contentSearchQuery.toLowerCase());
            const matchesType = contentTypeFilter === 'all' || flag.type === contentTypeFilter;
            return matchesSearch && matchesType;
          });

          return (
            <div className="space-y-4 animate-fade-in text-xs text-left">
              <div className="border-b pb-4 space-y-2">
                <h3 className="text-sm md:text-base font-display font-bold text-main-normal flex items-center gap-1.5">
                  <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" /> 
                  Kiểm duyệt nội dung Bình luận & Đánh giá học viên
                </h3>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Xem xét các báo cáo vi phạm tiêu chuẩn cộng đồng, từ ngữ thô tục, spam liên kết lậu, hoặc nội dung không hợp lệ do các thành viên đóng góp.
                </p>
              </div>

              {totalFlagsCount > 0 && (
                <div className="flex flex-col md:flex-row gap-3 bg-slate-50 p-3 rounded-2xl border">
                  
                  {/* Search query field */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Tìm nội dung vi phạm, người báo cáo..."
                      value={contentSearchQuery}
                      onChange={(e) => setContentSearchQuery(e.target.value)}
                      className="w-full text-xs p-2.5 border border-brand-light-active rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-brand-normal placeholder-stone-400 font-medium"
                    />
                  </div>

                  {/* Filter tabs */}
                  <div className="flex gap-1 bg-stone-200/50 p-1 rounded-xl self-start md:self-center">
                    <button
                      type="button"
                      onClick={() => setContentTypeFilter('all')}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                        contentTypeFilter === 'all' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-855'
                      }`}
                    >
                      Tất cả ({flaggedReviews.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentTypeFilter('review')}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                        contentTypeFilter === 'review' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-855'
                      }`}
                    >
                      Đánh giá
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentTypeFilter('comment')}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                        contentTypeFilter === 'comment' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-855'
                      }`}
                    >
                      Bình luận
                    </button>
                  </div>

                </div>
              )}

              {totalFlagsCount === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-dashed rounded-2xl">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                  <p className="font-extrabold text-sm text-stone-800">Không có tố cáo vi phạm!</p>
                  <p className="text-stone-500 text-xs mt-1">Hệ thống bình luận, đánh giá hiện đang hoạt động lành mạnh và an tâm.</p>
                </div>
              ) : filteredFlagged.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-dashed rounded-2xl space-y-2">
                  <Info className="w-10 h-10 text-stone-400 mx-auto" />
                  <p className="text-stone-500 font-semibold text-xs">Không tìm thấy nội dung vi phạm nào khớp với bộ lọc.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setContentSearchQuery('');
                      setContentTypeFilter('all');
                    }}
                    className="text-[#8b5e3c] font-black hover:underline text-[11px]"
                  >
                    Xóa tất cả bộ lọc hiện hữu
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFlagged.map((flag) => (
                    <div key={flag.id} className="border border-red-150 bg-red-50/5 hover:bg-neutral-50/50 p-4 rounded-2xl space-y-3 text-left transition-all relative">
                      
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="font-extrabold text-red-650 flex items-center gap-1 font-sans">
                          <AlertTriangle className="w-4 h-4 text-red-650 shrink-0" />
                          Lý do báo cáo: <span className="underline decoration-red-200">{flag.reason}</span>
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded uppercase ${
                            flag.type === 'review' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {flag.type === 'review' ? '⭐ Đánh giá' : '💬 Thảo luận Q&A'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">Người báo cáo: {flag.reporter}</span>
                        </div>
                      </div>

                      {flag.courseTitle && (
                        <div className="bg-stone-105 hover:bg-stone-200 px-2.5 py-1 rounded-lg text-[10.5px] text-stone-850 flex items-center gap-1 inline-block border font-bold">
                          <BookOpen className="w-3.5 h-3.5 text-stone-700" />
                          <span>Mục tiêu tại:</span> <span className="font-extrabold text-stone-900">{flag.courseTitle}</span>
                        </div>
                      )}

                      <div className="bg-white p-3 rounded-lg border border-red-100/60 text-stone-750 leading-normal text-xs font-semibold whitespace-pre-wrap font-mono italic">
                        "{flag.content}"
                      </div>

                      <div className="flex justify-end gap-2 text-xs pt-1">
                        {/* Dismiss report */}
                        <button 
                          onClick={() => {
                            if (window.confirm('Bác bỏ báo cáo và hiển thị lại bình luận này bình thường?')) {
                              onResolveFlag(flag.id, 'dismiss');
                              alert('✓ Đã bác bỏ báo cáo. Bình luận này an toàn.');
                            }
                          }}
                          className="border border-stone-300 hover:bg-white text-stone-600 font-bold px-3 py-1.5 rounded-xl text-xs bg-slate-50 transition-all shadow-3xs"
                        >
                          Bác bỏ tố cáo (Nội dung Sạch)
                        </button>
                        
                        {/* Logically delete from course’s reviews list & remove flag */}
                        <button 
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn XÓA BỎ VĨNH VIỄN bình luận/đánh giá vi phạm này khỏi hệ thống khóa học?')) {
                              onResolveFlag(flag.id, 'resolved');
                              alert('✓ Nội dung vi phạm đã được gỡ bỏ khỏi cơ sở dữ liệu học trình thành công!');
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all whitespace-nowrap"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Gỡ bỏ Nội dung (Xóa vĩnh viễn)
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* ACCOUNT LOCK/DELETION REQUESTS FOR MODERATORS */}
        {activeTab === 'account_requests' && (
          <div className="space-y-4 animate-fade-in text-xs text-left">
            <h3 className="text-sm md:text-base font-display font-bold text-main-normal flex items-center gap-1.5">
              <UserX className="w-5 h-5 text-red-650" />
              Kiểm duyệt yêu cầu Khóa & Xóa (Moderator Panel)
            </h3>
            <p className="text-gray-400 text-xs">
              Xem xét đề xuất đóng/xóa dữ liệu và vô hiệu hóa tài khoản tự nguyện được gửi từ học viên.
            </p>

            {accountRequests.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-2xl bg-slate-50">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-xs text-main-normal">Không có yêu cầu Khóa/Xóa tài khoản nào cần xử lý.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {accountRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className={`border p-4 rounded-xl bg-white shadow-3xs flex flex-col md:flex-row justify-between gap-4 items-start md:items-center transition-all ${
                      req.status === 'approved' ? 'border-emerald-200/60 bg-emerald-50/10' :
                      req.status === 'rejected' ? 'border-stone-205 bg-stone-50/20' : 'border-red-150 bg-red-50/5'
                    }`}
                  >
                    <div className="space-y-2 flex-1 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-main-normal">{req.userName}</span>
                        <span className="text-stone-400 font-mono">({req.userEmail})</span>
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded tracking-wider ${
                          req.type === 'delete' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.type === 'delete' ? '🚨 Đóng vĩnh viễn' : '⏳ Tạm khóa tài khoản'}
                        </span>
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-850' :
                          req.status === 'rejected' ? 'bg-stone-200 text-stone-605' : 'bg-red-100 text-red-600 border border-red-200'
                        }`}>
                          {req.status === 'approved' ? 'Kiểm duyệt viên đã Duyệt' :
                           req.status === 'rejected' ? 'Kiểm duyệt viên từ chối' : 'Đang Đợi Duyệt'}
                        </span>
                      </div>

                      <div className="text-[11px] text-stone-600 bg-slate-50 p-2.5 rounded-xl border border-stone-100/60">
                        <span className="font-bold text-stone-700 block mb-0.5">Lý do trình báo:</span>
                        <p className="italic font-sans leading-relaxed">"{req.reason}"</p>
                      </div>

                      <div className="text-[9px] text-gray-400 font-mono">
                        Yêu cầu tự nguyện gửi lúc: {new Date(req.timestamp).toLocaleString('vi-VN')}
                      </div>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex gap-1.5 self-end md:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onResolveAccountRequest(req.id, 'approved');
                            alert(`Đã duyệt chấp thuận yêu cầu của ${req.userName}.`);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 shadow transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Duyệt đóng
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onResolveAccountRequest(req.id, 'rejected');
                            alert(`Đã từ chối yêu cầu của ${req.userName}.`);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 shadow transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Từ Chối
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODERATOR COURSE INSPECTION MODAL (CONVERTED TO SUB-VIEW) */}
        {inspectingCourse && (
          <div className="absolute inset-0 bg-stone-50 z-[50] flex flex-col p-4 animate-fade-in overflow-y-auto tactile-scrollbar">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 text-left border shadow-2xl max-h-[92vh] overflow-y-auto tactile-scrollbar">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <span className="text-[9px] bg-stone-900 text-white px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                    {inspectingCourse.category} • NHÁP CHỜ KIỂM DUYỆT
                  </span>
                  <h3 className="font-display font-bold text-main-normal text-base mt-1">{inspectingCourse.title}</h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">Giảng viên xuất bản: <span className="font-bold">{inspectingCourse.instructorName}</span> • Giá dự kiến: {inspectingCourse.price.toLocaleString('vi-VN')} VND</p>
                </div>
                <button 
                  onClick={() => setInspectingCourse(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-stone-500 font-bold"
                >
                  X
                </button>
              </div>

              <div className="space-y-4 text-xs text-stone-800">
                
                {/* Descriptive image & requirements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <img src={inspectingCourse.image} alt="Banner Preview" className="w-full h-32 object-cover rounded-xl border" />
                    <p className="text-[11px] text-stone-500 italic mt-1.5">{inspectingCourse.subtitle}</p>
                  </div>
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border">
                    <h4 className="font-bold text-stone-900 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-stone-700" /> Tiêu chuẩn khóa học
                    </h4>
                    <p className="font-semibold text-[10.5px]">Điều kiện tiên quyết:</p>
                    <ul className="list-disc pl-4 space-y-1 text-[10px] text-stone-600">
                      {inspectingCourse.requirements?.map((req, i) => (
                        <li key={i}>{req}</li>
                      )) || <li>Không yêu cầu gì đặc biệt.</li>}
                    </ul>
                    <p className="font-semibold text-[10.5px] mt-2">Năng lực đạt được sau học trình:</p>
                    <ul className="list-disc pl-4 space-y-1 text-[10px] text-stone-600">
                      {inspectingCourse.willLearn?.map((learn, i) => (
                        <li key={i}>{learn}</li>
                      )) || <li>Hoàn thiện kỹ năng của ngành.</li>}
                    </ul>
                  </div>
                </div>

                {/* Chapters list verification */}
                <div className="space-y-2 border-t pt-3">
                  <h4 className="font-bold text-stone-950 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-stone-700" /> Hệ thống chương học & Nội dung giảng dạy đính kèm
                  </h4>

                  {inspectingCourse.chapters && inspectingCourse.chapters.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {inspectingCourse.chapters.map((ch, idx) => (
                        <div key={ch.id || idx} className="bg-stone-50 p-2.5 rounded-lg border text-left">
                          <p className="font-bold text-stone-900">Chương {idx + 1}: {ch.title}</p>
                          <div className="pl-3 mt-1 space-y-1.5 border-l-2 border-stone-300">
                            {ch.lessons?.map((les, lidx) => (
                              <div key={les.id || lidx} className="text-[11px] space-y-1">
                                <p className="text-stone-700 font-medium">✔️ {les.title} ({les.duration || '0:00'})</p>
                                
                                {les.docContent && (
                                  <div className="bg-white p-2 rounded border border-stone-200 mt-1 max-h-24 overflow-y-auto text-[10px] font-mono leading-relaxed whitespace-pre-wrap text-stone-600">
                                    📄 <b>[NỘI DUNG TÀI LIỆU DOC]:</b>
                                    <br />
                                    {les.docContent}
                                  </div>
                                )}

                                {les.quiz && les.quiz.questions && les.quiz.questions.length > 0 && (
                                  <div className="bg-[#f0f9ff] text-[#0369a1] p-1.5 rounded border border-[#b3e5fc] text-[9.5px] font-medium leading-relaxed">
                                    📝 <b>Có bài tập trắc nghiệm ({les.quiz.questions.length} câu)</b>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl leading-relaxed text-[11px] font-medium border border-red-200">
                      ⚠️ Giảng viên chưa đăng tải nội dung cụ thể hoặc hệ thống bài học nào cho khóa học nháp này! Cần có tối thiểu 1 chương học và bài tập để tiếp cận kiểm duyệt.
                    </div>
                  )}
                </div>

                {/* Additional specific user/course permissions verification */}
                <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100 space-y-1">
                  <h4 className="font-bold text-[#854d0e] flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-[#854d0e]" /> Thiết lập bảo mật quy tắc học viên:
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-[10.5px] text-stone-700">
                    <li>Cho phép tua bài giảng: {inspectingCourse.allowSkip ? 'Đồng ý' : 'Không (Bắt buộc xem hết)'}</li>
                    <li>Cho phép tải code/tài liệu: {inspectingCourse.allowDownload ? 'Đồng ý' : 'Không (Chỉ đọc online)'}</li>
                    <li>Mở cổng thảo luận Q&A: {inspectingCourse.allowDiscussion !== false ? 'Mở' : 'Khóa đóng'}</li>
                    <li>Cấp chứng chỉ: {inspectingCourse.giveCertificate ? 'Có' : 'Không'}</li>
                  </ul>
                </div>

              </div>

              <div className="flex justify-end gap-2 text-xs pt-3 border-t">
                <button 
                  onClick={() => setInspectingCourse(null)}
                  className="px-4 py-2 border rounded-xl bg-slate-50 text-stone-600 hover:text-black font-semibold"
                >
                  Đóng cửa sổ
                </button>
                <button 
                  onClick={() => {
                    const id = inspectingCourse.id;
                    setInspectingCourse(null);
                    onApproveCourse(id);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Phê Duyệt Ngay ✔️
                </button>
                <button 
                  onClick={() => {
                    const id = inspectingCourse.id;
                    setInspectingCourse(null);
                    handleOpenRejectModal(id);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                >
                  Từ Chối Hoàn Trả
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REJECTION REASON DETAIL MODAL SIMULATION (CONVERTED TO SUB-VIEW) */}
        {rejectingCourseId && (
          <div className="absolute inset-0 bg-stone-50 z-[50] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 text-left border shadow-2xl">
              <h3 className="font-display font-semibold text-main-normal text-sm flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" /> Nhập Lý Do Từ Chối Phê Duyệt
              </h3>
              <p className="text-xs text-stone-500 leading-snug">Lý do này sẽ hiển thị trực tiếp trong Hồ Sơ của Giảng viên để họ chỉnh sửa đề cương kịp thời.</p>
              
              <textarea 
                rows={4}
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                placeholder="Bài giảng thử nghiệm còn thiếu chapter 2, âm thanh video bị rè, hoặc có nội dung vi phạm bản quyền..."
                className="w-full text-xs p-3 border rounded-xl focus:ring-1 focus:ring-brand-normal focus:outline-none"
                required
              />

              <div className="flex justify-end gap-2 text-xs">
                <button 
                  onClick={() => setRejectingCourseId(null)}
                  className="px-4 py-2 border rounded-xl text-stone-600 bg-slate-50 hover:bg-white font-medium"
                >
                  Bỏ qua
                </button>
                <button 
                  onClick={handleConfirmReject}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                >
                  Xác nhận Từ Chối xuất bản
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

interface AdminDashboardProps {
  currentUser: User;
  courses: Course[];
  onUpdateCourses: (courses: Course[]) => void;
  payoutRequests: PayoutRequest[];
  onApprovePayout: (requestId: string) => void;
  onRejectPayout: (requestId: string) => void;
  onClose: () => void;
  orders?: Order[];
  onUpdateOrderStatus?: (orderId: string, nextStatus: 'success' | 'pending' | 'failed') => void;
  categoriesList: string[];
  onUpdateCategories: (categories: string[]) => void;
  banners: Banner[];
  onUpdateBanners: (banners: Banner[]) => void;
  notifications?: Notification[];
  onUpdateNotifications?: (notifications: Notification[]) => void;
  flaggedReviews?: FlaggedItem[];
  onResolveFlag?: (flagId: string, resolveAction: 'dismiss' | 'resolved') => void;
  onApproveCourse?: (courseId: string) => void;
  onRejectCourse?: (courseId: string, reason: string) => void;
}

interface CategoryNode {
  id: string;
  name: string;
  subcategories: string[];
}

export default function AdminDashboard({
  currentUser,
  courses,
  onUpdateCourses,
  payoutRequests,
  onApprovePayout,
  onRejectPayout,
  onClose,
  orders = [],
  onUpdateOrderStatus,
  categoriesList,
  onUpdateCategories,
  banners,
  onUpdateBanners,
  notifications = [],
  onUpdateNotifications,
  flaggedReviews = [],
  onResolveFlag = () => {},
  onApproveCourse = () => {},
  onRejectCourse = () => {}
}: AdminDashboardProps) {

  // Selected Tab
  const [activeTab, setActiveTab] = useState<
    'general_admin' | 'courses_management' | 'categories_management' | 
    'users_management' | 'role_permissions' | 'payouts_requests' | 
    'orders_management' | 'marketing_notifications' | 'banners_management' | 'account_requests' | 'instructor_requests' | 'audits_logs' |
    'moderator_controls' | 'api_config' | 'packages_management'
  >('general_admin');

  // Backend API Integration States
  const [apiModeState, setApiModeState] = useState<'mock' | 'api'>(() => ApiService.getConfig().mode);
  const [apiBaseUrlState, setApiBaseUrlState] = useState<string>(() => ApiService.getConfig().baseUrl);
  const [virtualLogs, setVirtualLogs] = useState<any[]>([]);

  // Instructor Requests
  // Account Requests Integration
  const [accountRequests, setAccountRequests] = useState<AccountRequest[]>([]);
  useEffect(() => {
    const fetchAccountRequests = async () => {
      try {
        const data = await ApiService.getAccountRequests();
        setAccountRequests(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAccountRequests();
  }, []);

  const handleResolveAccountRequest = async (id: string, action: 'approved' | 'rejected') => {
    try {
      await ApiService.resolveAccountRequest(id, action);
      alert(`Đã ${action === 'approved' ? 'Phê duyệt' : 'Từ chối'} yêu cầu thành công`);
      const updated = await ApiService.getAccountRequests();
      setAccountRequests(updated);
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
  };

  const [instructorRequests, setInstructorRequests] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'instructor_requests') {
      const fetchInstructorRequests = async () => {
        try {
          const data = await ApiService.getInstructorRequests();
          setInstructorRequests(data);
        } catch (err) {
          console.error('Error fetching instructor requests:', err);
        }
      };
      fetchInstructorRequests();
    }
  }, [activeTab]);

  const handleResolveInstructorRequest = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const res = await ApiService.resolveInstructorRequest({ requestId: id, action, rejectionReason: reason });
      if (res.success) {
         setInstructorRequests(prev => prev.map(r => r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected', rejectionReason: reason } : r));
      }
    } catch(err) {
      console.error(err);
    }
  };
  const [coursePackages, setCoursePackages] = useState<any[]>([]);
  const [adminPackageOrders, setAdminPackageOrders] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const pkgs = await ApiService.getCoursePackages();
        setCoursePackages(pkgs);
        const orders = await ApiService.getAdminPackageOrders();
        setAdminPackageOrders(orders);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [activeTab]);

  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'testing' | 'success' | 'failed';
    message: string;
    latency?: number;
  }>({ status: 'idle', message: '' });

  const handleTestConnection = async () => {
    setTestResult({ status: 'testing', message: 'Đang kiểm tra kết nối tới Backend...' });
    const res = await ApiService.testConnection(apiBaseUrlState.trim());
    if (res.success) {
      setTestResult({
        status: 'success',
        message: res.message,
        latency: res.latency
      });
    } else {
      setTestResult({
        status: 'failed',
        message: res.message,
        latency: res.latency
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'api_config') {
      setVirtualLogs(ApiService.getVirtualLogs());
      const interval = setInterval(() => {
        setVirtualLogs(ApiService.getVirtualLogs());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);
  
  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [couponVal, setCouponVal] = useState(15);
  const [couponDesc, setCouponDesc] = useState('');
  const [couponTargetCourse, setCouponTargetCourse] = useState('all');
  
  // Load coupons with persistent Local Storage
  const [localCoupons, setLocalCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('mindhub_coupons');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return SYSTEM_COUPONS;
  });

  // Notifications state helpers for target course alerts
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'success' | 'warning' | 'reminder'>('info');
  const [notifTargetCourse, setNotifTargetCourse] = useState('all');
  const [marketingSubTab, setMarketingSubTab] = useState<'coupons' | 'notifications'>('coupons');

  // Trigger sync of coupons to localStorage whenever changed
  useEffect(() => {
    localStorage.setItem('mindhub_coupons', JSON.stringify(localCoupons));
  }, [localCoupons]);

  // New Search & Filter States for Orders / Payouts
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | 'pending' | 'success' | 'failed'>('All');
  const [payoutQuery, setPayoutQuery] = useState('');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<'All' | 'pending' | 'completed' | 'rejected'>('All');

  // --- REPORT & ANALYTICS STATE ---
  const [revenueReportType, setRevenueReportType] = useState<'daily' | 'monthly'>('monthly');
  const [selectedReportMonth, setSelectedReportMonth] = useState<string>('06');
  const [selectedReportYear, setSelectedReportYear] = useState<string>('2026');
  const [bestsellerSearchQuery, setBestsellerSearchQuery] = useState<string>('');
  const [bestsellerSortBy, setBestsellerSortBy] = useState<'sales' | 'revenue' | 'rating'>('sales');

  // --- ADVANCED REPORT SUB-TAB SYSTEM ---
  const [reportSubTab, setReportSubTab] = useState<'finance_bestseller' | 'instructor_performance' | 'course_progress' | 'dropout_risk' | 'completion_stats'>('finance_bestseller');
  const [selectedCourseAnalyticId, setSelectedCourseAnalyticId] = useState<string>('course-1');
  const [instructorSortBy, setInstructorSortBy] = useState<'rating' | 'revenue' | 'students' | 'courses'>('revenue');
  const [instructorSearchFilter, setInstructorSearchFilter] = useState<string>('');

  // Combine real user orders with rich, structured historical transactions to make charts realistic and dynamic
  const analyticOrders = React.useMemo(() => {
    const seedOrders: Order[] = [
      // 2026 June
      { id: 'MIND-SD01', date: '2026-06-01', courses: [{ id: 'course-1', title: 'Học máy Cơ bản & Đồ án thực chiến', price: 1200000 }], discountAmount: 0, total: 1200000, status: 'success', paymentMethod: 'Ví MoMo' },
      { id: 'MIND-SD02', date: '2026-06-02', courses: [{ id: 'course-3', title: 'UI/UX Design chuyên sâu cho Web & App', price: 1500000 }], discountAmount: 150000, total: 1350000, status: 'success', paymentMethod: 'Chuyển khoản Ngân hàng' },
      { id: 'MIND-SD03', date: '2026-06-03', courses: [{ id: 'course-2', title: 'Xây dựng Microservices hiệu năng cao với Go & gRPC', price: 1600000 }], discountAmount: 0, total: 1600000, status: 'success', paymentMethod: 'Thẻ Visa/Mastercard' },
      { id: 'MIND-SD04', date: '2026-06-04', courses: [{ id: 'course-1', title: 'Học máy Cơ bản & Đồ án thực chiến', price: 1200000 }], discountAmount: 100005, total: 1099995, status: 'success', paymentMethod: 'Ví MoMo' },
      { id: 'MIND-SD05', date: '2026-06-05', courses: [{ id: 'course-4', title: 'SEO Mastery & Marketing đa nền tảng', price: 890000 }], discountAmount: 0, total: 890000, status: 'success', paymentMethod: 'Chuyển khoản Ngân hàng' },
      { id: 'MIND-SD06', date: '2026-06-06', courses: [{ id: 'course-3', title: 'UI/UX Design chuyên sâu cho Web & App', price: 1500000 }], discountAmount: 0, total: 1500000, status: 'success', paymentMethod: 'Chuyển khoản Ngân hàng' },
      { id: 'MIND-SD07', date: '2026-06-08', courses: [{ id: 'course-2', title: 'Xây dựng Microservices hiệu năng cao với Go & gRPC', price: 1600000 }], discountAmount: 160000, total: 1440000, status: 'failed', paymentMethod: 'Ví MoMo' },
      { id: 'MIND-SD08', date: '2026-06-09', courses: [{ id: 'course-1', title: 'Học máy Cơ bản & Đồ án thực chiến', price: 1200000 }], discountAmount: 120000, total: 1080000, status: 'success', paymentMethod: 'Chuyển khoản Ngân hàng' },
      { id: 'MIND-SD09', date: '2026-06-10', courses: [{ id: 'course-4', title: 'SEO Mastery & Marketing đa nền tảng', price: 890000 }, { id: 'course-3', title: 'UI/UX Design chuyên sâu cho Web & App', price: 1500000 }], discountAmount: 200000, total: 2190000, status: 'success', paymentMethod: 'Chuyển khoản Ngân hàng' },
      { id: 'MIND-SD10', date: '2026-06-11', courses: [{ id: 'course-2', title: 'Xây dựng Microservices hiệu năng cao với Go & gRPC', price: 1600000 }], discountAmount: 0, total: 1600000, status: 'success', paymentMethod: 'Ví MoMo' },
      { id: 'MIND-SD11', date: '2026-06-12', courses: [{ id: 'course-1', title: 'Học máy Cơ bản & Đồ án thực chiến', price: 1200000 }], discountAmount: 0, total: 1200000, status: 'success', paymentMethod: 'Thẻ Visa/Mastercard' },
      
      // 2026 May
      { id: 'MIND-SD20', date: '2026-05-02', courses: [{ id: 'course-1', title: 'Học máy Cơ bản & Đồ án thực chiến', price: 1200000 }], discountAmount: 0, total: 1200000, status: 'success', paymentMethod: 'Ví MoMo' },
      { id: 'MIND-SD21', date: '2026-05-10', courses: [{ id: 'course-2', title: 'Xây dựng Microservices hiệu năng cao với Go & gRPC', price: 1600000 }], discountAmount: 160000, total: 1440000, status: 'success', paymentMethod: 'Chuyển khoản Ngân hàng' },
      { id: 'MIND-SD22', date: '2026-05-18', courses: [{ id: 'course-3', title: 'UI/UX Design chuyên sâu cho Web & App', price: 1500000 }], discountAmount: 0, total: 1500000, status: 'success', paymentMethod: 'Chuyển khoản Ngân hàng' },
      { id: 'MIND-SD23', date: '2026-05-25', courses: [{ id: 'course-4', title: 'SEO Mastery & Marketing đa nền tảng', price: 890000 }], discountAmount: 89000, total: 801000, status: 'success', paymentMethod: 'Ví MoMo' },
      
      // 2026 April
      { id: 'MIND-SD30', date: '2026-04-12', courses: [{ id: 'course-2', title: 'Xây dựng Microservices hiệu năng cao với Go & gRPC', price: 1600000 }], discountAmount: 0, total: 1600000, status: 'success', paymentMethod: 'Ví MoMo' },
      { id: 'MIND-SD31', date: '2026-04-22', courses: [{ id: 'course-1', title: 'Học máy Cơ bản & Đồ án thực chiến', price: 1200000 }], discountAmount: 0, total: 1200000, status: 'success', paymentMethod: 'Chuyển khoản Ngân hàng' },
      
      // 2026 March
      { id: 'MIND-SD40', date: '2026-03-05', courses: [{ id: 'course-3', title: 'UI/UX Design chuyên sâu cho Web & App', price: 1500000 }], discountAmount: 150000, total: 1350000, status: 'success', paymentMethod: 'Thẻ Visa/Mastercard' },
      { id: 'MIND-SD41', date: '2026-03-20', courses: [{ id: 'course-4', title: 'SEO Mastery & Marketing đa nền tảng', price: 890000 }], discountAmount: 0, total: 890000, status: 'success', paymentMethod: 'Ví MoMo' },

      // 2026 February
      { id: 'MIND-SD50', date: '2026-02-14', courses: [{ id: 'course-1', title: 'Học máy Cơ bản & Đồ án thực chiến', price: 1200000 }], discountAmount: 120000, total: 1080000, status: 'success', paymentMethod: 'Chuyển khoản Ngân hàng' },

      // 2026 January  
      { id: 'MIND-SD60', date: '2026-01-10', courses: [{ id: 'course-2', title: 'Xây dựng Microservices hiệu năng cao với Go & gRPC', price: 1600000 }], discountAmount: 0, total: 1600000, status: 'success', paymentMethod: 'Ví MoMo' }
    ];

    const combined = [...orders];
    seedOrders.forEach(seed => {
      if (!combined.some(o => o.id === seed.id)) {
        combined.push(seed);
      }
    });

    return combined.sort((a, b) => b.date.localeCompare(a.date));
  }, [orders]);

  // --- MULTI-LEVEL CATEGORIES SYSTEM ---
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([
    { id: 'cat-1', name: 'Development', subcategories: ['Frontend Development', 'Backend Development', 'Mobile Development', 'DevOps & Cloud'] },
    { id: 'cat-2', name: 'Design', subcategories: ['UI/UX Design', 'Graphic Design', 'Motion Graphics', 'Brand Architecture'] },
    { id: 'cat-3', name: 'Marketing', subcategories: ['Content Strategy', 'Social Media Marketing', 'SEO Optimization'] },
    { id: 'cat-4', name: 'Artificial Intelligence', subcategories: ['LLMs & Prompt Engineering', 'Machine Learning', 'AI Generative Arts'] }
  ]);
  const [selectedParentId, setSelectedParentId] = useState<string>('cat-1');
  const [newParentName, setNewParentName] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatValue, setEditingCatValue] = useState('');

  // Sychronize app category filter options when category tree modifies
  const handleSyncCategoriesToApp = (updatedTree: CategoryNode[]) => {
    const activeParents = updatedTree.map(node => node.name);
    onUpdateCategories(['All', ...activeParents]);
  };

  // --- USERS MANAGEMENT SYSTEM ---
  const [usersList, setUsersList] = useState<User[]>([
    { id: 'u-101', name: 'Nguyễn Đình Văn', email: 'vandinhmock@gmail.com', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', role: 'student', streak: 4, lastActiveDate: '2026-06-11', interestedTopics: [], notificationSettings: { email: true, push: false, app: true, scheduleReminders: false }, phone: '0901234567' },
    { id: 'u-102', name: 'Trịnh Gia Bảo', email: 'giabaoxspammer@gmail.com', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150', role: 'student', streak: 0, lastActiveDate: '2026-05-21', interestedTopics: [], notificationSettings: { email: true, push: false, app: true, scheduleReminders: false }, phone: '0912345678' },
    { id: 'u-103', name: 'Dr. Lê Quốc Khánh', email: 'khanh.le@mindhub.edu.vn', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150', role: 'instructor', streak: 12, lastActiveDate: '2026-06-12', interestedTopics: ['Development'], notificationSettings: { email: true, push: true, app: true, scheduleReminders: true }, phone: '0923456789' },
    { id: 'u-104', name: 'Ninh Thị Lan Chi', email: 'lanchi.ninh@mindhub.edu.vn', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', role: 'instructor', streak: 15, lastActiveDate: '2026-06-10', interestedTopics: ['Design'], notificationSettings: { email: true, push: true, app: true, scheduleReminders: true }, phone: '0934567890' },
    { id: 'u-105', name: 'Tạ Minh Đăng', email: 'dangtm.mod@mindhub.edu.vn', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', role: 'admin', streak: 8, lastActiveDate: '2026-06-12', interestedTopics: [], notificationSettings: { email: true, push: true, app: true, scheduleReminders: false }, phone: '0945678901' }
  ]);
  const [bannedUserIds, setBannedUserIds] = useState<string[]>(['u-102']);
  const [userSearchText, setUserSearchText] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'All' | Role>('All');
  
  // User creation/editing sub-form
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [lockingInstructor, setLockingInstructor] = useState<User | null>(null);
  const [lockingCourseAction, setLockingCourseAction] = useState<'hide' | 'pending' | 'archive' | 'none'>('hide');
  const [userForm, setUserForm] = useState({
    name: '', email: '', avatar: '', role: 'student' as Role, phone: '', bio: '', streak: 0
  });

  // --- ROLE & PERMISSION MATRIX CONTROLS ---
  type PermissionKey = 'course_discussion' | 'payout_request' | 'payout_approval' | 'course_editing' | 'course_verification' | 'content_censorship' | 'coupon_management' | 'user_moderation' | 'category_editing' | 'order_billing';
  
  const [rolePermissions, setRolePermissions] = useState<Record<Role, PermissionKey[]>>({
    student: ['course_discussion'],
    instructor: ['course_discussion', 'payout_request', 'course_editing'],
    admin: ['course_discussion', 'payout_request', 'payout_approval', 'course_editing', 'course_verification', 'content_censorship', 'coupon_management', 'user_moderation', 'category_editing', 'order_billing']
  });

  const appPermissions: { key: PermissionKey; name: string; group: string }[] = [
    { key: 'course_discussion', name: 'Bình luận & Thảo luận Q&A', group: 'Học viên & Cộng đồng' },
    { key: 'payout_request', name: 'Yêu cầu rút tiền thụ động', group: 'Tài chính' },
    { key: 'payout_approval', name: 'Phê duyệt chuyển khoản rút tiền', group: 'Tài chính' },
    { key: 'course_editing', name: 'Đăng tải & Biên soạn chương trình học', group: 'Khóa học' },
    { key: 'course_verification', name: 'Kiểm duyệt & Phát hành bài giảng', group: 'Khóa học' },
    { key: 'content_censorship', name: 'Xoá bình luận vi phạm & Giải quyết cờ', group: 'Cộng đồng' },
    { key: 'coupon_management', name: 'Thiết kế, kích hoạt mã giảm giá', group: 'Marketing' },
    { key: 'user_moderation', name: 'Vô hiệu hóa hoặc đình chỉ thành viên', group: 'Hệ thống' },
    { key: 'category_editing', name: 'Sắp xếp danh mục ngành đa cấp', group: 'Cơ sở dữ liệu' },
    { key: 'order_billing', name: 'Xác thực kích hoạt doanh số học phí', group: 'Tài chính' }
  ];

  // --- SYSTEM-WIDE COURSE MANAGEMENT ---
  const [courseSearchText, setCourseSearchText] = useState('');
  const [courseStatusFilter, setCourseStatusFilter] = useState<'All' | 'active' | 'pending' | 'draft' | 'rejected'>('All');
  const [courseCatFilter, setCourseCatFilter] = useState('All');
  
  // Course creation/editing sub-form
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '', subtitle: '', description: '', category: 'Development', subcategory: 'Frontend Development',
    instructorName: 'Dr. Lê Quốc Khánh', price: '499000', salePrice: '299000', status: 'active' as Course['status'],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
    isFeatured: false, isBestseller: false, isNew: true, allowSkip: true, giveCertificate: true
  });

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // --- CALCULATING REPORTS AND ANALYTICS DATA ---
  const successfulOrders = React.useMemo(() => {
    return analyticOrders.filter(o => o.status === 'success');
  }, [analyticOrders]);

  const totalRevenue = React.useMemo(() => {
    return successfulOrders.reduce((sum, o) => sum + o.total, 0);
  }, [successfulOrders]);

  const totalDiscounts = React.useMemo(() => {
    return successfulOrders.reduce((sum, o) => sum + o.discountAmount, 0);
  }, [successfulOrders]);

  const totalPendingRevenue = React.useMemo(() => {
    return analyticOrders.filter(o => o.status === 'pending').reduce((sum, o) => sum + o.total, 0);
  }, [analyticOrders]);

  const totalPayoutCompleted = React.useMemo(() => {
    return payoutRequests.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.amount, 0);
  }, [payoutRequests]);

  const monthlyRevenueData = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthNum = String(i + 1).padStart(2, '0');
      const prefix = `${selectedReportYear}-${monthNum}`;
      const matching = successfulOrders.filter(o => o.date.startsWith(prefix));
      const gross = matching.reduce((sum, o) => sum + o.total, 0);
      const count = matching.length;
      return {
        label: `Thg ${i + 1}`,
        gross,
        count
      };
    });
  }, [successfulOrders, selectedReportYear]);

  const dailyRevenueData = React.useMemo(() => {
    const year = parseInt(selectedReportYear) || 2026;
    const month = parseInt(selectedReportMonth) || 6;
    const daysInMonth = new Date(year, month, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = String(i + 1).padStart(2, '0');
      const dateStr = `${selectedReportYear}-${selectedReportMonth}-${dayNum}`;
      const matching = successfulOrders.filter(o => o.date === dateStr);
      const gross = matching.reduce((sum, o) => sum + o.total, 0);
      const count = matching.length;
      return {
        label: `${i + 1}`,
        gross,
        count
      };
    });
  }, [successfulOrders, selectedReportYear, selectedReportMonth]);

  const bestsellerCoursesReport = React.useMemo(() => {
    return courses.map(course => {
      const matchingOrders = successfulOrders.filter(order => 
        order.courses.some(c => c.id === course.id)
      );
      const salesCount = matchingOrders.length;
      const totalIncome = matchingOrders.reduce((sum, order) => {
        const matchingCourse = order.courses.find(c => c.id === course.id);
        const itemPrice = matchingCourse ? matchingCourse.price : (course.salePrice || course.price);
        return sum + itemPrice;
      }, 0);
      
      const adminCommission = totalIncome;
      const instructorIncome = totalIncome;

      return {
        ...course,
        salesCount,
        totalIncome,
        adminCommission,
        instructorIncome,
        rating: course.rating || 4.8,
        reviewCount: course.reviewCount || 0
      };
    });
  }, [courses, successfulOrders]);

  const filteredBestsellers = React.useMemo(() => {
    let result = bestsellerCoursesReport.filter(c => 
      c.title.toLowerCase().includes(bestsellerSearchQuery.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(bestsellerSearchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(bestsellerSearchQuery.toLowerCase())
    );

    if (bestsellerSortBy === 'sales') {
      result.sort((a, b) => b.salesCount - a.salesCount);
    } else if (bestsellerSortBy === 'revenue') {
      result.sort((a, b) => b.totalIncome - a.totalIncome);
    } else if (bestsellerSortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [bestsellerCoursesReport, bestsellerSearchQuery, bestsellerSortBy]);

  // --- NEW WORKSPACE INSTRUCTORS ANALYTICS DATABASE MEMO ---
  const instructorsReport = React.useMemo(() => {
    // Collect all unique instructor names in the system
    const instructorNames = Array.from(new Set(courses.map(c => c.instructorName)));
    
    return instructorNames.map(name => {
      const instructorCourses = courses.filter(c => c.instructorName === name);
      const firstCourse = instructorCourses[0];
      
      const courseIds = instructorCourses.map(c => c.id);
      const matchingOrders = successfulOrders.filter(order => 
        order.courses.some(c => courseIds.includes(c.id))
      );
      
      const salesCount = matchingOrders.length;
      const totalIncome = matchingOrders.reduce((sum, order) => {
        const myCourseItems = order.courses.filter(c => courseIds.includes(c.id));
        const itemSum = myCourseItems.reduce((acc, matchC) => {
          return acc + matchC.price;
        }, 0);
        return sum + itemSum;
      }, 0);

      const avgRating = instructorCourses.reduce((sum, c) => sum + (c.rating || 4.8), 0) / (instructorCourses.length || 1);
      const email = name === 'Dr. Lê Quốc Khánh' ? 'khanh.le@mindhub.edu.vn' : 
                    name === 'Ninh Thị Lan Chi' ? 'lanchi.ninh@mindhub.edu.vn' : 
                    `${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '')}@mindhub.edu.vn`;

      // Assign badge based on metrics
      let badge = 'Danh Sư Đồng Hành';
      let colorClass = 'bg-stone-100 text-stone-800 border-stone-200 text-stone-900';
      if (totalIncome > 3000000) {
        badge = 'Khoa Trưởng Bạch Kim (Platinum Mentor)';
        colorClass = 'bg-amber-100 text-[#8b5e3c] border-amber-300';
      } else if (avgRating >= 4.8) {
        badge = 'Chuyên Gia Ưu Tú (Expert Partner)';
        colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-250';
      }

      return {
        name,
        email,
        title: firstCourse?.instructorTitle || 'Giảng viên chuyên gia MindHub',
        avatar: firstCourse?.instructorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        coursesCount: instructorCourses.length,
        coursesList: instructorCourses.map(c => c.title),
        salesCount,
        totalIncome,
        avgRating: parseFloat(avgRating.toFixed(2)),
        badge,
        colorClass,
        status: instructorCourses.some(c => c.status === 'active') ? 'active' : 'inactive'
      };
    });
  }, [courses, successfulOrders]);

  const filteredInstructorsReport = React.useMemo(() => {
    let result = instructorsReport.filter(inst => 
      inst.name.toLowerCase().includes(instructorSearchFilter.toLowerCase()) ||
      inst.title.toLowerCase().includes(instructorSearchFilter.toLowerCase()) ||
      inst.email.toLowerCase().includes(instructorSearchFilter.toLowerCase())
    );

    if (instructorSortBy === 'rating') {
      result.sort((a, b) => b.avgRating - a.avgRating);
    } else if (instructorSortBy === 'revenue') {
      result.sort((a, b) => b.totalIncome - a.totalIncome);
    } else if (instructorSortBy === 'students') {
      result.sort((a, b) => b.salesCount - a.salesCount);
    } else if (instructorSortBy === 'courses') {
      result.sort((a, b) => b.coursesCount - a.coursesCount);
    }

    return result;
  }, [instructorsReport, instructorSearchFilter, instructorSortBy]);

  // --- COMPOSITE INTERACTIVE LEARNING & RETENTION RECORD LIST ---
  const learningProgressRecords = React.useMemo(() => {
    return [
      {
        id: 'rec-1',
        studentId: 'u-101',
        studentName: 'Nguyễn Đình Văn',
        studentEmail: 'vandinhmock@gmail.com',
        studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        courseId: 'course-1',
        courseTitle: 'Học máy Cơ bản & Đồ án thực chiến',
        progressPercent: 85,
        completedLogs: 11,
        totalLessonsCount: 13,
        lastInteractionDate: '2026-06-11',
        daysInactive: 1,
        status: 'active',
        quizAverage: 9.0,
        engagementLevel: 'Tích cực'
      },
      {
        id: 'rec-2',
        studentId: 'u-102',
        studentName: 'Trịnh Gia Bảo',
        studentEmail: 'giabaoxspammer@gmail.com',
        studentAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
        courseId: 'course-3',
        courseTitle: 'UI/UX Design chuyên sâu cho Web & App',
        progressPercent: 20,
        completedLogs: 3,
        totalLessonsCount: 15,
        lastInteractionDate: '2026-05-21',
        daysInactive: 22,
        status: 'dropout',
        quizAverage: 4.5,
        engagementLevel: 'Bỏ dở'
      },
      {
        id: 'rec-3',
        studentId: 'u-201',
        studentName: 'Phạm Đức Anh',
        studentEmail: 'ducanh99@gmail.com',
        studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
        courseId: 'course-1',
        courseTitle: 'Học máy Cơ bản & Đồ án thực chiến',
        progressPercent: 15,
        completedLogs: 2,
        totalLessonsCount: 13,
        lastInteractionDate: '2026-05-28',
        daysInactive: 15,
        status: 'dropout',
        quizAverage: 5.0,
        engagementLevel: 'Bỏ dở'
      },
      {
        id: 'rec-4',
        studentId: 'u-202',
        studentName: 'Hoàng Kim Ngân',
        studentEmail: 'kimngan.hoang@live.com',
        studentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
        courseId: 'course-2',
        courseTitle: 'Xây dựng Microservices hiệu năng cao với Go & gRPC',
        progressPercent: 100,
        completedLogs: 18,
        totalLessonsCount: 18,
        lastInteractionDate: '2026-06-08',
        daysInactive: 4,
        status: 'completed',
        quizAverage: 9.8,
        engagementLevel: 'Đã hoàn thành'
      },
      {
        id: 'rec-5',
        studentId: 'u-203',
        studentName: 'Vũ Quốc Huy',
        studentEmail: 'huyvq.tech@gmail.com',
        studentAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
        courseId: 'course-4',
        courseTitle: 'SEO Mastery & Marketing đa nền tảng',
        progressPercent: 35,
        completedLogs: 4,
        totalLessonsCount: 12,
        lastInteractionDate: '2026-05-30',
        daysInactive: 13,
        status: 'dropout',
        quizAverage: 6.2,
        engagementLevel: 'Bỏ dở'
      },
      {
        id: 'rec-6',
        studentId: 'u-204',
        studentName: 'Lương Mỹ Duyên',
        studentEmail: 'myduyen.arts@gmail.com',
        studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        courseId: 'course-3',
        courseTitle: 'UI/UX Design chuyên sâu cho Web & App',
        progressPercent: 100,
        completedLogs: 15,
        totalLessonsCount: 15,
        lastInteractionDate: '2026-06-10',
        daysInactive: 2,
        status: 'completed',
        quizAverage: 9.5,
        engagementLevel: 'Đã hoàn thành'
      },
      {
        id: 'rec-7',
        studentId: 'u-205',
        studentName: 'Ngô Minh Triết',
        studentEmail: 'trietnm.dev@outlook.com',
        studentAvatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=150',
        courseId: 'course-2',
        courseTitle: 'Xây dựng Microservices hiệu năng cao với Go & gRPC',
        progressPercent: 92,
        completedLogs: 17,
        totalLessonsCount: 18,
        lastInteractionDate: '2026-06-12',
        daysInactive: 0,
        status: 'active',
        quizAverage: 8.8,
        engagementLevel: 'Tích cực'
      },
      {
        id: 'rec-8',
        studentId: 'u-206',
        studentName: 'Trần Thế Vinh',
        studentEmail: 'vinh.tran90@yahoo.com',
        studentAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
        courseId: 'course-4',
        courseTitle: 'SEO Mastery & Marketing đa nền tảng',
        progressPercent: 8,
        completedLogs: 1,
        totalLessonsCount: 12,
        lastInteractionDate: '2026-05-15',
        daysInactive: 28,
        status: 'dropout',
        quizAverage: 3.0,
        engagementLevel: 'Bỏ dở'
      }
    ];
  }, []);

  // --- BANNERS MANAGEMENT STATES & HANDLERS ---
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1541829019-259276a7f013?auto=format&fit=crop&q=80&w=600',
    actionText: 'Học Ngay',
    actionUrl: '#courses-section',
    isActive: true,
    backgroundColor: '#fcf8f2',
    textColor: '#432c28',
    accentColor: '#bc6c25',
    themeName: 'Amber'
  });

  const handleCreateOrUpdateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title.trim()) {
      alert("Vui lòng điền tiêu đề banner.");
      return;
    }

    if (editingBannerId) {
      // Edit
      const updatedBanners: Banner[] = banners.map(b => b.id === editingBannerId ? {
        id: b.id,
        title: bannerForm.title,
        subtitle: bannerForm.subtitle,
        imageUrl: bannerForm.imageUrl,
        actionText: bannerForm.actionText,
        actionUrl: bannerForm.actionUrl,
        isActive: bannerForm.isActive,
        backgroundColor: bannerForm.backgroundColor,
        textColor: bannerForm.textColor,
        accentColor: bannerForm.accentColor
      } : b);
      onUpdateBanners(updatedBanners);
      setEditingBannerId(null);
      alert("✓ Cập nhật Banner thành công và đồng bộ lên trang chủ!");
    } else {
      // Add new
      const newBanner: Banner = {
        id: `banner-${Date.now()}`,
        title: bannerForm.title,
        subtitle: bannerForm.subtitle,
        imageUrl: bannerForm.imageUrl,
        actionText: bannerForm.actionText,
        actionUrl: bannerForm.actionUrl,
        isActive: bannerForm.isActive,
        backgroundColor: bannerForm.backgroundColor,
        textColor: bannerForm.textColor,
        accentColor: bannerForm.accentColor
      };
      onUpdateBanners([...banners, newBanner]);
      alert("✓ Đã tạo và cấu hình Banner mới thành công!");
    }

    // Reset Form
    setBannerForm({
      title: '',
      subtitle: '',
      imageUrl: 'https://images.unsplash.com/photo-1541829019-259276a7f013?auto=format&fit=crop&q=80&w=600',
      actionText: 'Học Ngay',
      actionUrl: '#courses-section',
      isActive: true,
      backgroundColor: '#fcf8f2',
      textColor: '#432c28',
      accentColor: '#bc6c25',
      themeName: 'Amber'
    });
  };

  const handleEditBannerClick = (b: Banner) => {
    setEditingBannerId(b.id);
    setBannerForm({
      title: b.title,
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl || '',
      actionText: b.actionText || '',
      actionUrl: b.actionUrl || '',
      isActive: b.isActive,
      backgroundColor: b.backgroundColor || '#fcf8f2',
      textColor: b.textColor || '#432c28',
      accentColor: b.accentColor || '#bc6c25',
      themeName: b.backgroundColor === '#eefdfb' ? 'Cozy Teal' :
                 b.backgroundColor === '#ebeffd' ? 'Studio Blue' :
                 b.backgroundColor === '#f5f5f4' ? 'Neutral Gray' : 'Amber'
    });
  };

  const handleDeleteBanner = (id: string) => {
    if (confirm("Bạn có tin chắc muốn gỡ bỏ Banner này khỏi hệ thống?")) {
      const filtered = banners.filter(b => b.id !== id);
      onUpdateBanners(filtered);
      alert("✓ Đã gỡ bỏ Banner!");
    }
  };

  const handleToggleBannerStatus = (id: string) => {
    const updated = banners.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b);
    onUpdateBanners(updated);
  };

  // --- ACTIONS ---
  const handleAddNewCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    
    if (localCoupons.some(c => c.code.toUpperCase() === couponCode.trim().toUpperCase())) {
      alert("⚠️ Mã giảm giá này đã tồn tại trên hệ thống!");
      return;
    }

    const newC: Coupon = {
      code: couponCode.trim().toUpperCase(),
      discount: couponVal,
      description: couponDesc || (couponTargetCourse === 'all' 
        ? `Giảm ${couponVal}% cho tất cả đơn hàng.` 
        : `Giảm ${couponVal}% áp dụng đặc cách cho bài học đăng ký mục tiêu.`),
      targetCourseId: couponTargetCourse === 'all' ? undefined : couponTargetCourse
    };
    
    setLocalCoupons([...localCoupons, newC]);
    setCouponCode('');
    setCouponDesc('');
    setCouponTargetCourse('all');
    alert('✓ Tạo coupon mã giảm giá mới thành công!');
  };

  const handleDeleteCoupon = (code: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa mã coupon ${code}?`)) {
      setLocalCoupons(localCoupons.filter(c => c.code !== code));
      alert('✓ Đã xóa mã giảm giá thành công!');
    }
  };

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMsg.trim()) {
      alert('Vui lòng điền đủ Tiêu đề và Nội dung thông báo!');
      return;
    }

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: notifTitle.trim(),
      message: notifMsg.trim(),
      type: notifType,
      date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      targetCourseId: notifTargetCourse === 'all' ? undefined : notifTargetCourse
    };

    if (onUpdateNotifications) {
      onUpdateNotifications([newNotif, ...notifications]);
    }
    
    setNotifTitle('');
    setNotifMsg('');
    setNotifTargetCourse('all');
    alert(`✓ Phát sóng thông báo và kích hoạt bảng hiển thị thông tin thành công!`);
  };

  const executeBlockUser = async (userId: string, courseAction?: string) => {
    const isBanned = bannedUserIds.includes(userId);
    try {
      if (!isBanned) {
        await ApiService.toggleUserLockAdmin(userId, 'lock');
        if (courseAction && courseAction !== 'none') {
          const coursesData = await ApiService.getInstructorCoursesByAdmin(userId);
          if (coursesData && coursesData.length > 0) {
            await Promise.all(coursesData.map((c: any) => 
               ApiService.updateCourseStatusAdmin(c.id, courseAction as any)
            ));
            alert('Đã cập nhật trạng thái các khóa học của giảng viên!');
          }
        }
      } else {
        await ApiService.toggleUserLockAdmin(userId, 'unlock');
      }
      
      setBannedUserIds(prev => {
        const res = isBanned ? prev.filter(id => id !== userId) : [...prev, userId];
        alert(isBanned ? '✓ Đăng nhập tài khoản đã được phục hồi hoạt động bình thường!' : '⚠️ Tài khoản đã tạm ngừng đăng nhập hệ thống.');
        return res;
      });
      setLockingInstructor(null);
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi gọi API.');
    }
  };

  const handleToggleBlockUser = (userId: string) => {
    const usr = usersList.find(u => u.id === userId);
    const isBanned = bannedUserIds.includes(userId);
    
    if (!isBanned && usr && usr.role === 'instructor') {
      setLockingInstructor(usr);
      setLockingCourseAction('hide');
      return;
    }
    
    executeBlockUser(userId);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim()) {
      alert('Vui lòng điền họ tên và email tài khoản.');
      return;
    }

    if (editingUser) {
      // Update existing user
      setUsersList(prev => prev.map(u => u.id === editingUser.id ? { 
        ...u, 
        name: userForm.name, 
        email: userForm.email, 
        avatar: userForm.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        role: userForm.role,
        phone: userForm.phone,
        bio: userForm.bio,
        streak: userForm.streak
      } : u));
      alert('✓ Cập nhật thông tin thành viên thành công!');
    } else {
      // Add new
      const newUser: User = {
        id: `u-${Date.now()}`,
        name: userForm.name,
        email: userForm.email,
        avatar: userForm.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        role: userForm.role,
        phone: userForm.phone,
        bio: userForm.bio,
        streak: userForm.streak,
        lastActiveDate: new Date().toISOString().split('T')[0],
        interestedTopics: [],
        notificationSettings: { email: true, push: false, app: true, scheduleReminders: false }
      };
      setUsersList(prev => [...prev, newUser]);
      alert('✓ Khởi tạo hồ sơ thành viên mới thành công!');
    }

    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Bạn có thực sự muốn xóa tài khoản thành viên này vĩnh viễn?')) {
      setUsersList(prev => prev.filter(u => u.id !== userId));
      alert('✓ Đã xóa dữ liệu thành viên thành công.');
    }
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      alert('Vui lòng điền tiêu đề khóa học.');
      return;
    }

    const priceNum = Number(courseForm.price) || 0;
    const saleNum = courseForm.salePrice ? Number(courseForm.salePrice) : undefined;

    if (editingCourse) {
      const updated = courses.map(c => c.id === editingCourse.id ? {
        ...c,
        title: courseForm.title,
        subtitle: courseForm.subtitle,
        description: courseForm.description,
        category: courseForm.category,
        subcategory: courseForm.subcategory,
        instructorName: courseForm.instructorName,
        price: priceNum,
        salePrice: saleNum,
        status: courseForm.status,
        image: courseForm.image,
        isFeatured: courseForm.isFeatured,
        isBestseller: courseForm.isBestseller,
        isNew: courseForm.isNew,
        allowSkip: courseForm.allowSkip,
        giveCertificate: courseForm.giveCertificate
      } : c);
      onUpdateCourses(updated);
      alert('✓ Cập nhật hồ sơ học liệu khóa học thành công!');
    } else {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: courseForm.title,
        subtitle: courseForm.subtitle || 'Chương trình giảng dạy hàng đầu từ chuyên gia.',
        description: courseForm.description || 'Mô tả chi tiết nội dung chương trình học.',
        category: courseForm.category,
        subcategory: courseForm.subcategory,
        instructorName: courseForm.instructorName,
        instructorTitle: 'Giảng viên ủy quyền MindHub',
        instructorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
        instructorBio: 'Chuyên gia đào tạo chuyên môn thực chiến xuất sắc.',
        price: priceNum,
        salePrice: saleNum,
        rating: 4.8,
        reviewCount: 0,
        enrolledCount: 0,
        completionRate: 0,
        image: courseForm.image,
        chapters: [
          {
            id: `chapter-${Date.now()}`,
            title: 'Chương 1: Giới thiệu & Định hướng tư duy mở đầu',
            lessons: [
              { id: `lesson-${Date.now()}-1`, title: 'Bài học 1.1: Trực quan hóa ứng dụng và cấu trúc', type: 'video', duration: '08:40', isPreview: true }
            ]
          }
        ],
        reviews: [],
        faqs: [],
        requirements: ['Kiến thức và tư duy mở rộng', 'Thiết bị thực hành kết nối mạng'],
        willLearn: ['Năng lực thực tế ứng dụng ngay sau khóa học', 'Khai phá tư duy lõi của lĩnh vực'],
        status: courseForm.status,
        isFeatured: courseForm.isFeatured,
        isBestseller: courseForm.isBestseller,
        isNew: courseForm.isNew,
        allowSkip: courseForm.allowSkip,
        giveCertificate: courseForm.giveCertificate,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onUpdateCourses([newCourse, ...courses]);
      alert('✓ Thêm mới & Xuất bản khóa học toàn sàn thành công!');
    }

    setShowCourseModal(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Bạn có muốn xóa vĩnh viễn khóa học này? Thao tác này sẽ gỡ bỏ hoàn toàn học trình khỏi sinh viên.')) {
      onUpdateCourses(courses.filter(c => c.id !== courseId));
      alert('✓ Đã xóa khóa học khỏi danh sách hệ thống!');
    }
  };

  const handleOpenEditCourse = (c: Course) => {
    setEditingCourse(c);
    setCourseForm({
      title: c.title,
      subtitle: c.subtitle,
      description: c.description,
      category: c.category,
      subcategory: c.subcategory,
      instructorName: c.instructorName,
      price: c.price.toString(),
      salePrice: c.salePrice ? c.salePrice.toString() : '',
      status: c.status,
      image: c.image,
      isFeatured: !!c.isFeatured,
      isBestseller: !!c.isBestseller,
      isNew: !!c.isNew,
      allowSkip: c.allowSkip !== false,
      giveCertificate: c.giveCertificate !== false
    });
    setShowCourseModal(true);
  };

  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      title: '',
      subtitle: '',
      description: '',
      category: 'Development',
      subcategory: 'Frontend Development',
      instructorName: 'Dr. Lê Quốc Khánh',
      price: '599000',
      salePrice: '',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
      isFeatured: false,
      isBestseller: false,
      isNew: true,
      allowSkip: true,
      giveCertificate: true
    });
    setShowCourseModal(true);
  };

  const handleOpenEditUser = (usr: User) => {
    setEditingUser(usr);
    setUserForm({
      name: usr.name,
      email: usr.email,
      avatar: usr.avatar,
      role: usr.role,
      phone: usr.phone || '',
      bio: usr.bio || '',
      streak: usr.streak || 0
    });
    setShowUserModal(true);
  };

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      avatar: '',
      role: 'student',
      phone: '',
      bio: '',
      streak: 0
    });
    setShowUserModal(true);
  };

  return (
    <div className="bg-white min-h-[85vh] rounded-2xl border border-brand-light-active overflow-hidden flex flex-col xl:flex-row text-main-darker animate-fade-in shadow relative">
      
      {/* Sidebar navigation */}
      <div className="w-full xl:w-64 bg-white border-b xl:border-b-0 xl:border-r border-brand-light-active p-4 space-y-1 shrink-0 flex flex-col justify-between">
        <div>
          <div className="text-center pb-4 border-b border-brand-light-active mb-4">
            <img src={currentUser.avatar} alt="Avatar" className="w-14 h-14 rounded-full mx-auto mb-2 border-2 border-brand-normal" />
            <h3 className="text-xs font-bold truncate">{currentUser.name}</h3>
            <span className="text-[9px] bg-stone-900 text-white uppercase tracking-wider px-2 py-0.5 rounded inline-block mt-1 font-extrabold shadow-3xs">TỔNG QUẢN TRỊ ADMIN</span>
          </div>

          <div className="space-y-1">
            <button 
              onClick={() => setActiveTab('general_admin')}
              className={`w-full text-left px-3 py-2 text-[11.5px] font-bold rounded-lg flex items-center gap-2 ${activeTab === 'general_admin' ? 'bg-stone-900 text-white shadow-3xs' : 'hover:bg-brand-light-hover'}`}
            >
              <BarChart className="w-4 h-4 text-stone-700" /> Báo cáo & Thiết lập chung
            </button>
            <button 
              onClick={() => setActiveTab('courses_management')}
              className={`w-full text-left px-3 py-2 text-[11.5px] font-bold rounded-lg flex items-center justify-between ${activeTab === 'courses_management' ? 'bg-stone-900 text-white shadow-3xs' : 'hover:bg-brand-light-hover'}`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-stone-700" /> Quản lý Khóa học
              </div>
              <span className="bg-stone-200 text-stone-850 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full">{courses.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('packages_management')}
              className={`w-full text-left px-3 py-2 text-[11.5px] font-bold rounded-lg flex items-center justify-between ${activeTab === 'packages_management' ? 'bg-stone-900 text-white shadow-3xs' : 'hover:bg-brand-light-hover'}`}
            >
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-stone-700" /> Gói Tạo Khóa Học
              </div>
              <span className="bg-amber-200 text-amber-850 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full">{coursePackages.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('categories_management')}
              className={`w-full text-left px-3 py-2 text-[11.5px] font-bold rounded-lg flex items-center gap-2 ${activeTab === 'categories_management' ? 'bg-stone-900 text-white shadow-3xs' : 'hover:bg-brand-light-hover'}`}
            >
              <FolderTree className="w-4 h-4 text-stone-700" /> Quản lý Danh mục
            </button>
            <button 
              onClick={() => setActiveTab('users_management')}
              className={`w-full text-left px-3 py-2 text-[11.5px] font-bold rounded-lg flex items-center justify-between ${activeTab === 'users_management' ? 'bg-stone-900 text-white shadow-3xs' : 'hover:bg-brand-light-hover'}`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-stone-700" /> Quản lý Người dùng
              </div>
              <span className="bg-stone-200 text-stone-850 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full">{usersList.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('role_permissions')}
              className={`w-full text-left px-3 py-2 text-[11.5px] font-bold rounded-lg flex items-center gap-2 ${activeTab === 'role_permissions' ? 'bg-stone-900 text-white shadow-3xs' : 'hover:bg-brand-light-hover'}`}
            >
              <Key className="w-4 h-4 text-stone-700" /> Quản lý Role & Phân quyền
            </button>
            
            <div className="h-[1px] bg-stone-200 my-2"></div>

            <button 
              onClick={() => setActiveTab('payouts_requests')}
              className={`w-full text-left px-3 py-2 text-[11.5px] font-bold rounded-lg flex items-center justify-between ${activeTab === 'payouts_requests' ? 'bg-stone-900 text-white shadow-3xs' : 'hover:bg-brand-light-hover'}`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-stone-700" /> Duyệt đơn Rút tiền
              </div>
              <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                {payoutRequests.filter(r=>r.status==='pending').length}
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('orders_management')}
              className={`w-full text-left px-3 py-2 text-[11.5px] font-bold rounded-lg flex items-center justify-between ${activeTab === 'orders_management' ? 'bg-stone-900 text-white shadow-3xs' : 'hover:bg-brand-light-hover'}`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-stone-700" /> Duyệt đơn Học phí
              </div>
              <span className="bg-amber-505 text-amber-800 bg-amber-100 text-[9px] font-bold px-2 py-0.5 rounded-full">
                {orders.filter(o => o.status === 'pending').length}
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('marketing_notifications')}
              className={`w-full text-left px-3 py-2 text-[11.5px] font-bold rounded-lg flex items-center justify-between ${activeTab === 'marketing_notifications' ? 'bg-stone-900 text-white shadow-3xs' : 'hover:bg-brand-light-hover'}`}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-stone-700" /> Marketing & Thông báo
              </div>
              <span className="bg-amber-100 text-amber-850 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full">{localCoupons.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('banners_management')}
              className={`w-full text-left px-3 py-2 text-[11.5px] font-bold rounded-lg flex items-center justify-between ${activeTab === 'banners_management' ? 'bg-stone-900 text-white shadow-3xs' : 'hover:bg-brand-light-hover'}`}
            >
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-stone-700" /> Banner & Trang chủ
              </div>
              <span className="bg-stone-100 text-stone-800 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full">{banners.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('account_requests')}
              className={`w-full text-left px-3 py-2 text-[11.5px] font-bold rounded-lg flex items-center justify-between ${activeTab === 'account_requests' ? 'bg-stone-900 text-white shadow-3xs' : 'hover:bg-brand-light-hover'}`}
            >
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-stone-700" /> Đóng góp hủy tài khoản
              </div>
              <span className="bg-red-100 text-red-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {accountRequests.filter(r => r.status === 'pending').length}
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('instructor_requests')}
              className={`w-full text-left px-3 py-2 text-[11.5px] font-bold rounded-lg flex items-center justify-between ${activeTab === 'instructor_requests' ? 'bg-stone-900 text-white shadow-3xs' : 'hover:bg-brand-light-hover'}`}
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-stone-700" /> Yêu cầu Giảng viên
              </div>
              {instructorRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {instructorRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('audits_logs')}
              className={`w-full text-left px-3 py-2 text-[11.5px] font-bold rounded-lg flex items-center gap-2 ${activeTab === 'audits_logs' ? 'bg-stone-900 text-white shadow-3xs' : 'hover:bg-brand-light-hover'}`}
            >
              <FileText className="w-4 h-4 text-stone-700" /> Nhật ký Audit Logs
            </button>
            <button 
              onClick={() => setActiveTab('moderator_controls')}
              className={`w-full text-left px-3 py-2 text-[11.5px] font-bold rounded-lg flex items-center justify-between ${activeTab === 'moderator_controls' ? 'bg-stone-900 text-white shadow-3xs' : 'hover:bg-brand-light-hover'}`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-stone-700" /> Kiểm duyệt nội dung
              </div>
              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {flaggedReviews.length + courses.filter(c => c.status === 'pending').length}
              </span>
            </button>

          </div>
        </div>

        <div className="pt-6">
          <button onClick={onClose} className="w-full text-center border font-bold text-xs py-2 bg-stone-50 border-stone-200 duration-150 rounded-xl text-stone-605 hover:bg-stone-100 hover:text-stone-900">
            Trở về Portal học tập
          </button>
        </div>
      </div>

      {/* Main Administrative Container Body */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[85vh]">
        
        {/* TAB 1: GENERAL STATS */}
        {activeTab === 'general_admin' && (
          <div className="space-y-6 animate-fade-in text-xs text-left">
            
            {/* Header section with summary description */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b pb-4 border-stone-200">
              <div>
                <h3 className="text-lg font-display font-black text-[#5c3a21] flex items-center gap-2">
                  <BarChart className="w-5.5 h-5.5 text-[#8b5e3c]" /> Bảng Điều Hành & Báo Cáo Tài Chính Tổng Dự Án
                </h3>
                <p className="text-stone-400 text-[11px] mt-0.5">Hệ thống phân tích doanh số tích lũy trực thuộc phòng kế toán, báo cáo bán chạy và thiết lập phí dịch vụ.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 bg-stone-100 p-1.5 rounded-xl border">
                <span className="text-[10px] font-bold text-stone-500 px-2 uppercase">Trạng thái VPN:</span>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-lg">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live Gateway
                </span>
              </div>
            </div>

            {/* Elegant Horizontal BI Sub-Menu Bar */}
            <div className="flex border-b border-stone-200 overflow-x-auto select-none no-scrollbar py-1 gap-2 scroll-smooth text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setReportSubTab('finance_bestseller')}
                className={`py-2 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  reportSubTab === 'finance_bestseller' 
                    ? 'border-[#8b5e3c] text-[#8b5e3c] font-black bg-[#8b5e3c]/5 rounded-t-xl' 
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <BarChart className="w-3.5 h-3.5" /> Doanh Thu & Bán Chạy
              </button>
              <button
                type="button"
                onClick={() => setReportSubTab('instructor_performance')}
                className={`py-2 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  reportSubTab === 'instructor_performance' 
                    ? 'border-[#8b5e3c] text-[#8b5e3c] font-black bg-[#8b5e3c]/5 rounded-t-xl' 
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" /> Báo Cáo Giảng Viên
              </button>
              <button
                type="button"
                onClick={() => setReportSubTab('course_progress')}
                className={`py-2 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  reportSubTab === 'course_progress' 
                    ? 'border-[#8b5e3c] text-[#8b5e3c] font-black bg-[#8b5e3c]/5 rounded-t-xl' 
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Activity className="w-3.5 h-3.5" /> Dashboard Từng Khóa Học
              </button>
              <button
                type="button"
                onClick={() => setReportSubTab('dropout_risk')}
                className={`py-2 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  reportSubTab === 'dropout_risk' 
                    ? 'border-[#8b5e3c] text-[#8b5e3c] font-black bg-[#8b5e3c]/5 rounded-t-xl' 
                    : 'border-transparent text-stone-505 hover:text-stone-800'
                }`}
              >
                <UserX className="w-3.5 h-3.5 text-rose-500" /> Học Viên Bỏ Dở
              </button>
              <button
                type="button"
                onClick={() => setReportSubTab('completion_stats')}
                className={`py-2 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  reportSubTab === 'completion_stats' 
                    ? 'border-[#8b5e3c] text-[#8b5e3c] font-black bg-[#8b5e3c]/5 rounded-t-xl' 
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" /> Tỷ Lệ Hoàn Thành
              </button>
            </div>

            {reportSubTab === 'finance_bestseller' && (
              <>
                {/* CORE EXECUTIVE STATS - 4 PREMIUM FINANCIAL CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border border-amber-200 p-4 rounded-2xl bg-amber-50/40 relative overflow-hidden transition-all hover:shadow-xs group">
                    <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:scale-110 duration-200">
                      <DollarSign className="w-12 h-12 text-[#8b5e3c]" />
                    </div>
                    <span className="text-stone-400 text-[9.5px] font-bold uppercase tracking-wider block">Doanh Thu Gói Tạo Khóa Học</span>
                    <span className="text-base lg:text-md font-black text-brand-dark block mt-1.5 font-mono text-[#8b5e3c]">
                      {formatVND(totalRevenue)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                      ✓ {successfulOrders.length} đơn hàng tất toán thành công
                    </span>
                  </div>

                  <div className="border border-blue-200 p-4 rounded-2xl bg-blue-50/20 relative overflow-hidden transition-all hover:shadow-xs group">
                    <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:scale-110 duration-200">
                      <ShoppingBag className="w-12 h-12 text-blue-700" />
                    </div>
                    <span className="text-stone-400 text-[9.5px] font-bold uppercase tracking-wider block">Doanh Số Chờ Khớp Duyệt</span>
                    <span className="text-base lg:text-md font-black text-blue-800 block mt-1.5 font-mono">
                      {formatVND(totalPendingRevenue)}
                    </span>
                    <span className="text-[10px] text-blue-500 font-semibold block mt-0.5">
                      ● {analyticOrders.filter(o => o.status === 'pending').length} đơn hàng đang treo chờ Bank
                    </span>
                  </div>

                  <div className="border border-rose-200 p-4 rounded-2xl bg-rose-50/10 relative overflow-hidden transition-all hover:shadow-xs group">
                    <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:scale-110 duration-200">
                      <ShieldCheck className="w-12 h-12 text-rose-500" />
                    </div>
                    <span className="text-stone-400 text-[9.5px] font-bold uppercase tracking-wider block">Giảm Giá Đã Hỗ Trợ (Couponed)</span>
                    <span className="text-base lg:text-md font-black text-rose-700 block mt-1.5 font-mono">
                      {formatVND(totalDiscounts)}
                    </span>
                    <span className="text-[10px] text-rose-600 block mt-0.5">
                      Tổng thiệt hại mã giảm phí tiếp thị
                    </span>
                  </div>
                </div>

                {/* BENTO ROW: CHART / TABLE REVENUE REPORT ENGINE + COMMISSION CONFIGS */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                  
                  {/* REVENUE REPORTING CONTAINER (MONTHLY / DAILY DRILL-DOWN) */}
                  <div className="xl:col-span-8 border border-stone-200 p-5 rounded-2xl space-y-4 bg-white/50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
                      <div>
                        <h4 className="font-extrabold text-[#783c12] text-xs flex items-center gap-1.5">
                          <Landmark className="w-4 h-4 text-amber-700" /> Báo Cáo Phân Tích Biến Động Doanh Thu Hệ Thống
                        </h4>
                        <p className="text-[10px] text-stone-400">Xem trực quan biểu đồ doanh số cùng bảng biểu chi tiết theo ngày hoặc tháng tùy chỉnh.</p>
                      </div>

                      {/* Mode Selector Option tabs */}
                      <div className="flex bg-stone-100 p-1 rounded-lg border text-[10px] font-bold select-none self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => setRevenueReportType('monthly')}
                          className={`px-3 py-1.5 rounded-md transition-all ${revenueReportType === 'monthly' ? 'bg-white shadow text-[#8b5e3c] font-black' : 'text-stone-550 hover:text-stone-900'}`}
                        >
                          Báo cáo theo Tháng
                        </button>
                        <button
                          type="button"
                          onClick={() => setRevenueReportType('daily')}
                          className={`px-3 py-1.5 rounded-md transition-all ${revenueReportType === 'daily' ? 'bg-white shadow text-[#8b5e3c] font-black' : 'text-stone-550 hover:text-stone-900'}`}
                        >
                          Báo cáo theo Ngày
                        </button>
                      </div>
                    </div>

                    {/* Filter configurations form lines */}
                    <div className="flex items-center gap-3 bg-stone-550/5 bg-stone-50 p-3 rounded-xl flex-wrap text-[10.5px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-550 font-bold">Năm tài khóa:</span>
                        <select
                          value={selectedReportYear}
                          onChange={(e) => setSelectedReportYear(e.target.value)}
                          className="bg-white border rounded-lg px-2.5 py-1 font-bold text-stone-700 focus:outline-hidden"
                        >
                          <option value="2026">Năm 2026 (Hiện tại)</option>
                          <option value="2025">Năm 2025 (Hồi cứu)</option>
                        </select>
                      </div>

                      {revenueReportType === 'daily' && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-stone-550 font-bold">Tháng kiểm toán:</span>
                          <select
                            value={selectedReportMonth}
                            onChange={(e) => setSelectedReportMonth(e.target.value)}
                            className="bg-white border rounded-lg px-2.5 py-1 font-bold text-stone-700 focus:outline-hidden"
                          >
                            <option value="01">Tháng 01</option>
                            <option value="02">Tháng 02</option>
                            <option value="03">Tháng 03</option>
                            <option value="04">Tháng 04</option>
                            <option value="05">Tháng 05</option>
                            <option value="06">Tháng 06 (Hiện thời)</option>
                            <option value="07">Tháng 07</option>
                            <option value="08">Tháng 08</option>
                            <option value="09">Tháng 09</option>
                            <option value="10">Tháng 10</option>
                            <option value="11">Tháng 11</option>
                            <option value="12">Tháng 12</option>
                          </select>
                        </div>
                      )}

                      <div className="ml-auto text-stone-400 italic text-[10px] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block text-[9px] font-bold"></span> Doanh thu gộp
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ml-1 text-[9px] font-bold"></span> Hoa hồng sàn
                      </div>
                    </div>

                    {/* VISUAL CHART COMPONENT (HANDCRAFTED SVG CHART FOR STABILITY & GORGEOUS DESIGN) */}
                    <div className="p-4 border rounded-xl bg-slate-50 relative animate-fade-in">
                      {(() => {
                        const activeDataSet = revenueReportType === 'monthly' ? monthlyRevenueData : dailyRevenueData;
                        const maxGrossVal = Math.max(...activeDataSet.map(d => d.gross), 500000);
                        
                        return (
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-stone-500 px-1 border-b pb-1.5">
                              <span>
                                BIỂU ĐỒ DOANH THU {revenueReportType === 'monthly' ? `THEO CÁC THÁNG (NĂM ${selectedReportYear})` : `THEO NGÀY TRONG THÁNG ${selectedReportMonth}/${selectedReportYear}`}
                              </span>
                              <span className="text-[#8b5e3c]">Doanh thu đỉnh mốc: {formatVND(maxGrossVal)}</span>
                            </div>

                            <div className="h-44 flex items-end justify-between gap-1 pt-6 px-1 relative">
                              
                              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 pr-1 pb-4">
                                <div className="border-t border-dashed border-stone-400 w-full"></div>
                                <div className="border-t border-dashed border-stone-400 w-full"></div>
                                <div className="border-t border-dashed border-stone-400 w-full"></div>
                              </div>

                              {activeDataSet.map((data, index) => {
                                const grossRatio = Math.max(0.03, data.gross / maxGrossVal);
                                const grossPercentHeight = `${grossRatio * 100}%`;

                                return (
                                  <div key={index} className="flex-1 flex flex-col items-center relative group min-w-0">
                                    <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[9.5px] p-2.5 rounded-lg shadow-xl border border-stone-850 hidden group-hover:block z-35 pointer-events-none whitespace-nowrap leading-relaxed">
                                      <p className="font-extrabold text-amber-400 border-b pb-0.5 mb-1 text-center font-mono">
                                        {revenueReportType === 'monthly' ? `Tháng ${index + 1}` : `Ngày ${data.label}/${selectedReportMonth}`}
                                      </p>
                                      <p>Phát sinh: <strong className="font-mono text-[11px] text-white">{data.count} giao dịch gói</strong></p>
                                      <p>Tổng thu nhập: <strong className="font-mono text-[11px] text-amber-300">{formatVND(data.gross)}</strong></p>
                                    </div>

                                    <div className="w-full relative rounded-t-xs hover:brightness-95 duration-105 ease-out cursor-pointer h-32 flex flex-col justify-end bg-stone-200/50">
                                      <div 
                                        className="w-full bg-linear-to-t from-amber-600 to-amber-400 rounded-t-xs absolute bottom-0 relative flex flex-col justify-end" 
                                        style={{ height: grossPercentHeight }}
                                      >
                                      </div>
                                    </div>

                                    <span className="text-[8.5px] font-mono font-bold text-stone-500 mt-1 truncate max-w-full block">
                                      {data.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* DETAILED LEDGER TABLE FOR AUDIT AND EXPORT */}
                    <div className="space-y-2.5 text-left">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#5c3a21] text-[10.5px] block">Sổ Quỹ Kiểm Toán & Chi Giải Ngân ({revenueReportType === 'monthly' ? '12 tháng' : 'Số ngày trong tháng'})</span>
                        <button 
                          type="button" 
                          onClick={() => alert("✓ Đã trích xuất lý lịch tài chính sang tệp CSV mã hóa nội bộ MindHub-Fin-Export.csv thành công!")}
                          className="bg-stone-100 hover:bg-stone-200 border text-stone-750 border-stone-250 font-bold px-2.5 py-1 rounded-lg text-[9.5px] duration-100"
                        >
                          Xuất tệp Excel/CSV
                        </button>
                      </div>

                      <div className="overflow-x-auto border border-stone-200 rounded-xl max-h-[220px] overflow-y-auto">
                        <table className="w-full text-left text-[10px] border-collapse bg-white">
                          <thead className="bg-stone-100/80 uppercase font-black tracking-wider text-stone-500 sticky top-0 z-10 border-b">
                            <tr>
                              <th className="p-2 pl-3">Chu kỳ kiểm soát</th>
                              <th className="p-2 text-center">Đã thanh toán (SL)</th>
                              <th className="p-2 text-right">Tổng thu nhập</th>
                              <th className="p-2 text-center">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y text-stone-605">
                            {(() => {
                              const activeLEDGER = revenueReportType === 'monthly' ? monthlyRevenueData : dailyRevenueData;
                              const hasDataLines = activeLEDGER.some(d => d.gross > 0);

                              if (!hasDataLines) {
                                return (
                                  <tr>
                                    <td colSpan={6} className="p-8 text-center text-stone-400 italic">
                                      Không có dữ liệu phát sinh doanh thu khớp thực trong kỳ kiểm soát được chọn.
                                    </td>
                                  </tr>
                                );
                              }

                              return activeLEDGER.map((line, index) => {
                                if (line.gross === 0) return null;
                                return (
                                  <tr key={index} className="hover:bg-amber-50/20 font-bold transition-colors">
                                    <td className="p-2 pl-3 font-semibold text-stone-800">
                                      {revenueReportType === 'monthly' ? `Tháng ${index + 1}/${selectedReportYear}` : `Ngày ${line.label}/${selectedReportMonth}/${selectedReportYear}`}
                                    </td>
                                    <td className="p-2 text-center text-emerald-600 font-bold">
                                      {line.count} đơn hàng
                                    </td>
                                    <td className="p-2 text-right text-stone-900 font-mono">
                                      {formatVND(line.gross)}
                                    </td>
                                    <td className="p-2 text-center">
                                      <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded-sm">
                                        ĐÃ KIỂM
                                      </span>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  </div>

                {/* SECTION 4: BEST-SELLING COURSES REPORT SECTION (BÁO CÁO KHÓA HỌC BÁN CHẠY) */}
                <div className="border border-stone-200 p-5 rounded-2xl space-y-4 bg-white/50 text-left">
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-stone-100 pb-3">
                    <div>
                      <h4 className="font-extrabold text-[#783c12] text-xs flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-amber-700" /> Báo Cáo Phân Khúc Sản Phẩm & Học Trình Bán Chạy Nhất (Bestsellers)
                      </h4>
                      <p className="text-[10px] text-stone-400">Phân tích xếp hạng học trình bán chạy nhất toàn khóa, tính toán doanh thu trên từng khóa học cụ thể.</p>
                    </div>

                    {/* SEARCH AND SORT CONTROLS IN BESTSELLER PANELS */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0 select-none text-[10px]">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2 w-3 h-3 text-stone-400" />
                        <input
                          type="text"
                          placeholder="Tìm theo Tiêu đề, Danh mục..."
                          value={bestsellerSearchQuery}
                          onChange={(e) => setBestsellerSearchQuery(e.target.value)}
                          className="text-[10px] pl-7 pr-3 py-1.5 border hover:border-stone-300 w-full rounded-lg bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-stone-450 font-bold shrink-0">Xếp hạng:</span>
                        <select
                          value={bestsellerSortBy}
                          onChange={(e) => setBestsellerSortBy(e.target.value as any)}
                          className="bg-white border text-stone-700 rounded-lg px-2 py-1.5 font-bold text-[10px]"
                        >
                          <option value="sales">Xếp theo số học viên (Lượt bán)</option>
                          <option value="revenue">Xếp theo tổng doanh thu khóa</option>
                          <option value="rating">Xếp theo xếp hạng học lực (Rating)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* LIST / CARDS OF BEST-SELLING COURSES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredBestsellers.length === 0 ? (
                      <div className="col-span-full text-center py-12 border border-dashed rounded-2xl bg-stone-50 font-bold text-stone-400 text-xs">
                        Không tìm thấy khóa học bán chạy nào khớp với từ khóa tìm kiếm.
                      </div>
                    ) : (
                      filteredBestsellers.map((item, index) => {
                        return (
                          <div 
                            key={item.id} 
                            className="bg-white border border-stone-200 hover:border-amber-400 p-4 rounded-xl flex flex-col justify-between transition-all hover:shadow-xs relative duration-150 group"
                          >
                            <div className={`absolute top-3 right-3 text-[9px] font-black w-6 h-6 flex items-center justify-center rounded-full text-white shadow-3xs ${
                              index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-[#c18653]' : 'bg-stone-300'
                            }`} title={`Hạng thứ ${index + 1}`}>
                              #{index + 1}
                            </div>

                            <div className="space-y-3">
                              <div className="flex gap-3">
                                <img 
                                  src={item.image} 
                                  alt={item.title} 
                                  className="w-14 h-14 object-cover rounded-lg border bg-stone-50 shrink-0" 
                                  referrerPolicy="no-referrer"
                                />
                                <div className="space-y-0.5 min-w-0 pr-6">
                                  <span className="text-[8.5px] font-extrabold uppercase bg-amber-100 text-[#8b5e3c] px-1.5 py-0.5 rounded-sm block w-fit truncate">
                                    {item.category}
                                  </span>
                                  <h5 className="font-extrabold text-stone-900 text-[11px] leading-tight line-clamp-2 shadow-3xs" title={item.title}>
                                    {item.title}
                                  </h5>
                                  <p className="text-stone-400 text-[9.5px]">Giảng sư: {item.instructorName}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-100 font-bold text-[10px]">
                                <div className="border-r pr-1">
                                  <span className="text-stone-400 block text-[8.5px] uppercase">Lượng bán khớp</span>
                                  <span className="text-emerald-700 block mt-0.5 font-mono text-[11.5px] font-black">{item.salesCount} học viên</span>
                                </div>
                                <div className="pl-1 text-right">
                                  <span className="text-stone-400 block text-[8.5px] uppercase">Tính doanh thu gộp</span>
                                  <span className="text-[#8b5e3c] block mt-0.5 font-mono text-[11.5px] font-black">{formatVND(item.totalIncome)}</span>
                                </div>
                              </div>

                            </div>

                            <div className="flex items-center justify-between text-[9px] border-t pt-2.5 mt-3 text-stone-400 font-bold">
                              <div className="flex items-center gap-0.5">
                                <span className="text-amber-500 text-[10px]">★</span>
                                <span className="text-stone-700">{item.rating}</span>
                                <span>({item.reviewCount} đánh giá)</span>
                              </div>
                              <span className={`px-1.5 py-0.3 rounded-xs border text-[8px] uppercase ${
                                item.status === 'active' ? 'bg-emerald-50 text-emerald-750 border-emerald-100' : 'bg-amber-50 text-amber-800 border-amber-100'
                              }`}>
                                {item.status === 'active' ? 'Đang kinh doanh' : item.status}
                              </span>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              </>
            )}

            {/* Sub-tab 2: instructor_performance */}
            {reportSubTab === 'instructor_performance' && (
              <div className="space-y-6 animate-fade-in text-left">
                {/* Search & Sort Panel */}
                <div className="bg-stone-50 border p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <h4 className="font-extrabold text-[#783c12] text-xs flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-700" /> Bộ Chỉ Số Đánh Giá Quỹ Hoạt Động Giảng Sư
                    </h4>
                    <p className="text-[10px] text-stone-400">Hệ thống đo lường hiệu quả giảng sư dựa trên lượt đăng ký học tập, doanh số gộp, số khóa phát hành và phản hồi khách quan.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto text-[10px] select-none">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Tìm giảng sư..."
                        value={instructorSearchFilter}
                        onChange={(e) => setInstructorSearchFilter(e.target.value)}
                        className="pl-8 pr-3 py-1.5 border rounded-lg bg-white w-full sm:w-48 text-[10px] hover:border-stone-300 focus:outline-hidden font-bold text-stone-700"
                      />
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-505 font-bold shrink-0">Sắp xếp:</span>
                      <select
                        value={instructorSortBy}
                        onChange={(e) => setInstructorSortBy(e.target.value as any)}
                        className="bg-white border rounded-lg px-2.5 py-1.5 font-bold text-stone-700 text-[10px] focus:outline-hidden"
                      >
                        <option value="revenue">Tổng Doanh thu Học phí</option>
                        <option value="rating">Độ hài lòng (Rating Star)</option>
                        <option value="students">Lượng Học viên Đăng ký</option>
                        <option value="courses">Số Giáo trình Đăng tải</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* KPI Metrics Highlight Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#8b5e3c]/5 border border-[#8b5e3c]/20 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 bg-[#8b5e3c]/10 rounded-lg text-[#8b5e3c] shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-stone-400 text-[9px] font-bold block uppercase">Giảng Sư Dẫn Đầu Doanh Số</span>
                      <span className="text-[12px] font-black text-[#5c3a21] block mt-0.5">Dr. Lê Quốc Khánh</span>
                      <span className="text-[9.5px] font-bold text-stone-500">Mức đóng góp: ~82.4% doanh thu khóa học</span>
                    </div>
                  </div>
                  <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                    </div>
                    <div>
                      <span className="text-stone-400 text-[9px] font-bold block uppercase">Độ hài lòng chung (AVG Rating)</span>
                      <span className="text-[12px] font-black text-emerald-800 block mt-0.5">4.89 / 5.0 Sao</span>
                      <span className="text-[9.5px] font-semibold text-emerald-600">Cực kỳ xuất sắc đạt mốc cam kết</span>
                    </div>
                  </div>
                  <div className="bg-blue-50/10 border border-blue-150 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 bg-blue-105 text-blue-800 bg-blue-100 rounded-lg shrink-0">
                      <Users className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <span className="text-stone-400 text-[9px] font-bold block uppercase">Tổng Giảng sư Hoạt động</span>
                      <span className="text-[12px] font-black text-blue-800 block mt-0.5">{instructorsReport.length} Chuyên Gia</span>
                      <span className="text-[9.5px] text-blue-600 font-bold">100% Giảng sư đã xác thực bằng cấp</span>
                    </div>
                  </div>
                </div>

                {/* Instructors Data Grid Table */}
                <div className="border border-stone-200 rounded-2xl bg-white overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px] border-collapse">
                      <thead className="bg-[#8b5e3c]/5 uppercase font-bold text-[#5c3a21] border-b">
                        <tr>
                          <th className="p-3 pl-4">Giảng Sư & Chuyên Môn</th>
                          <th className="p-3 text-center">Liên hệ</th>
                          <th className="p-3 text-center">Số học liệu</th>
                          <th className="p-3 text-center font-bold text-amber-800">Lượt bán khớp</th>
                          <th className="p-3 text-right">Doanh thu gộp</th>
                          <th className="p-3 text-center">Đánh giá chung</th>
                          <th className="p-3 text-right pr-4">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-stone-605">
                        {filteredInstructorsReport.map((inst, idx) => (
                          <tr key={idx} className="hover:bg-amber-50/10 transition-colors">
                            <td className="p-3 pl-4">
                              <div className="flex items-center gap-3">
                                <img src={inst.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover border shrink-0" referrerPolicy="no-referrer" />
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold text-stone-900 text-[11px] truncate">{inst.name}</span>
                                    <span className={`px-1.5 py-0.2 rounded-xs border text-[8.5px] font-extrabold pb-0.5 ${inst.colorClass}`}>
                                      {inst.badge}
                                    </span>
                                  </div>
                                  <p className="text-stone-400 text-[9.5px] italic truncate">{inst.title}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-center font-mono text-stone-550 font-semibold">{inst.email}</td>
                            <td className="p-3 text-center">
                              <span className="bg-stone-100 text-stone-800 font-bold px-2 py-1 rounded-md border text-[10.5px]">
                                {inst.coursesCount} Khóa học
                              </span>
                            </td>
                            <td className="p-3 text-center text-emerald-650 font-black font-mono text-[11px]">
                              {inst.salesCount} học viên
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-stone-900 text-[11px]">
                              {formatVND(inst.totalIncome)}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-0.5 text-amber-550 font-bold">
                                <span>★</span>
                                <span className="text-stone-850 font-black">{inst.avgRating}</span>
                              </div>
                            </td>
                            <td className="p-3 text-right pr-4">
                              <div className="inline-flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => alert(`📧 Đã soạn & Gửi email truyền thống chúc mừng và thống kê tháng đến giảng viên ${inst.name} qua hòm thư: ${inst.email}`)}
                                  className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-2 py-1 rounded duration-100 text-[9px] cursor-pointer"
                                >
                                  Gửi Thông Báo
                                </button>
                                <button
                                  type="button"
                                  onClick={() => alert(`✓ Đã gửi yêu cầu kết nối lịch họp tư vấn tới Zalo/Phone giảng viên ${inst.name}`)}
                                  className="bg-white border hover:bg-stone-100 text-stone-700 font-bold px-2 py-1 rounded duration-100 text-[9px] cursor-pointer"
                                >
                                  Lịch Họp
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Multi-Criteria Score Breakdown Chart */}
                <div className="border border-stone-200 p-5 rounded-2xl bg-[#8b5e3c]/5 space-y-3 shadow-3xs">
                  <h5 className="font-extrabold text-[#5c3a21] text-xs flex items-center gap-1.5 border-b pb-2">
                    <TrendingUp className="w-4 h-4 text-[#8b5e3c]" /> Nhận Xét Toàn Diện Của Ban Đào Tạo
                  </h5>
                  <div className="space-y-2.5 text-[10px] text-stone-605 leading-relaxed font-semibold">
                    <p>
                      ● <strong>Về Doanh Số & Quy Mô:</strong> Tổng giảng viên thực hiện giảng dạy trực tiếp có sự bứt phá lớn từ khối ngành <strong>Development (Dr. Lê Quốc Khánh)</strong>, chiếm hơn 80% thị phần dòng tiền thu giữ. Giáo trình khóa học AI bước đầu nhận phản hồi khả quan nhưng độ phủ đăng ký quy mô còn hạn hẹp.
                    </p>
                    <p>
                      ● <strong>Về Độ Hài Lòng (Rating Stars):</strong> Cam kết KPI sàn về chất lượng đào tạo được giữ ở mốc cực kỳ vững vàng (Trung bình đạt <strong>4.89 / 5.0 Sao</strong>), không phát sinh bất kỳ khiếu nại hoàn tiền nào trong vòng 30 ngày qua trên sổ cái kiểm toán.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 3: course_progress */}
            {reportSubTab === 'course_progress' && (
              <div className="space-y-6 animate-fade-in text-left">
                {/* Course Selection Dropdown Header */}
                <div className="bg-stone-50 border p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="font-extrabold text-[#783c12] text-xs flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-[#8b5e3c]" /> Dashboard Giám Sát Tiến Trình Học Tập Từng Khóa Học
                    </h4>
                    <p className="text-[10px] text-stone-400">Chọn khóa học tùy ý để giám định cấu trúc, mức phân bổ hoàn thành khóa học, và bảng điểm của học viên.</p>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] select-none">
                    <span className="text-stone-505 font-bold shrink-0">Chọn khóa học kiểm toán:</span>
                    <select
                      value={selectedCourseAnalyticId}
                      onChange={(e) => setSelectedCourseAnalyticId(e.target.value)}
                      className="bg-white border rounded-lg px-2.5 py-1.5 font-bold text-stone-700 text-[10px] focus:outline-hidden max-w-xs truncate"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {(() => {
                  const activeCourse = courses.find(c => c.id === selectedCourseAnalyticId) || courses[0];
                  if (!activeCourse) return <div className="text-stone-400 text-xs font-bold p-6">Không có dữ liệu khóa học.</div>;
                  
                  const courseProgressData = learningProgressRecords.filter(rec => rec.courseId === activeCourse.id);
                  const totalStudentsInCourse = courseProgressData.length;
                  
                  const completionsList = courseProgressData.filter(rec => rec.status === 'completed');
                  const completionsCount = completionsList.length;
                  const activeCount = courseProgressData.filter(rec => rec.status === 'active').length;
                  const dropoutCount = courseProgressData.filter(rec => rec.status === 'dropout').length;
                  
                  const averageProgress = Math.round(
                    courseProgressData.reduce((sum, rec) => sum + rec.progressPercent, 0) / (totalStudentsInCourse || 1)
                  );

                  return (
                    <div className="space-y-6">
                      {/* STATS STRIP CARD */}
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-left">
                        <div className="border border-amber-200 p-4 rounded-xl bg-amber-50/10 text-center flex flex-col justify-center">
                          <span className="text-stone-400 text-[9px] font-bold block uppercase">Giảng viên phụ trách</span>
                          <span className="text-[11px] font-extrabold text-[#8b5e3c] block mt-1 truncate">{activeCourse.instructorName}</span>
                        </div>
                        <div className="border p-4 rounded-xl bg-white text-center flex flex-col justify-center">
                          <span className="text-stone-400 text-[9px] font-bold block uppercase">Học Viên Kiểm Toán</span>
                          <span className="text-[14px] font-black block mt-1 font-mono text-stone-850">{totalStudentsInCourse} học viên</span>
                        </div>
                        <div className="border p-4 rounded-xl bg-white text-center flex flex-col justify-center">
                          <span className="text-stone-400 text-[9px] font-bold block uppercase">Tỷ Lệ Hoàn Thành Khóa</span>
                          <span className="text-[14px] font-black block mt-1 font-mono text-emerald-600">
                            {totalStudentsInCourse > 0 ? Math.round((completionsCount / totalStudentsInCourse) * 100) : 0}%
                          </span>
                        </div>
                        <div className="border p-4 rounded-xl bg-white text-center flex flex-col justify-center">
                          <span className="text-stone-400 text-[9px] font-bold block uppercase">Tiến Độ Trung Bình</span>
                          <span className="text-[14px] font-black block mt-1 font-mono text-amber-600">{averageProgress}%</span>
                        </div>
                        <div className="border p-4 rounded-xl bg-emerald-50/20 text-center flex flex-col justify-center">
                          <span className="text-emerald-800 text-[9px] font-bold block uppercase">Đã Tốt Nghiệp (Đạt Chứng Chỉ)</span>
                          <span className="text-[14px] font-black block mt-1 font-mono text-emerald-700">{completionsCount} Đã cấp</span>
                        </div>
                      </div>

                      {/* SEGMENTATION PROGRESS VISUAL BAR CHANGER */}
                      <div className="border border-stone-200 p-4 rounded-xl bg-white space-y-3.5 text-center">
                        <span className="font-bold text-stone-700 text-[10.5px] block text-left">Mức Phân Bổ Trạng Thái Học Viên Khóa Này</span>
                        
                        <div className="w-full bg-stone-100 rounded-full h-5 overflow-hidden flex text-[8.5px] font-black text-white select-none">
                          <div className="bg-emerald-500 h-full flex items-center justify-center transition-all" style={{ width: `${totalStudentsInCourse > 0 ? (completionsCount / totalStudentsInCourse) * 100 : 33}%` }}>
                            {(completionsCount > 0 || totalStudentsInCourse === 0) && `Tốt nghiệp (${completionsCount})`}
                          </div>
                          <div className="bg-amber-400 h-full flex items-center justify-center transition-all text-stone-900" style={{ width: `${totalStudentsInCourse > 0 ? (activeCount / totalStudentsInCourse) * 100 : 33}%` }}>
                            {(activeCount > 0 || totalStudentsInCourse === 0) && `Đang tích cực (${activeCount})`}
                          </div>
                          <div className="bg-rose-500 h-full flex items-center justify-center transition-all" style={{ width: `${totalStudentsInCourse > 0 ? (dropoutCount / totalStudentsInCourse) * 100 : 34}%` }}>
                            {(dropoutCount > 0 || totalStudentsInCourse === 0) && `Bỏ dở trễ học (${dropoutCount})`}
                          </div>
                        </div>

                        <div className="flex gap-4 text-[9.5px] font-bold justify-center pt-2 border-t text-stone-500 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <span>Đã hoàn thành học trình (Tốt nghiệp 100% video)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                            <span>Đang học tập tích cực (Đăng nhập học bài đều trong 5 ngày)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                            <span>Có nguy cơ bỏ học bỏ dở (Trên 5 ngày chưa mở hệ thống)</span>
                          </div>
                        </div>
                      </div>

                      {/* STUDENTS LEDGER GRID OF THIS SPECIFIC COURSE */}
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="font-black text-[#5c3a21] text-[11px] block">Sổ Ghi Học Trình Học Viên Trực Thuộc Khóa</span>
                          <span className="text-stone-400 text-[10px]">Cập nhật tự động</span>
                        </div>

                        {courseProgressData.length === 0 ? (
                          <div className="p-8 text-center border border-dashed rounded-xl bg-stone-50 text-stone-400 font-bold text-xs">
                            Chưa ghi nhận học viên nào mua và đăng ký khóa học này trên hệ thống ledger kiểm toán.
                          </div>
                        ) : (
                          <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-3xs">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-[10px] border-collapse bg-white">
                                <thead className="bg-stone-50 border-b font-extrabold text-stone-500">
                                  <tr>
                                    <th className="p-3 pl-3">Học viên</th>
                                    <th className="p-3 text-center">Học lực (Quiz GPA)</th>
                                    <th className="p-3">Thanh tiến độ học tập (%)</th>
                                    <th className="p-3 text-center">Bộ học liệu đạt</th>
                                    <th className="p-3 text-center">Ngày hoạt động cuối</th>
                                    <th className="p-3 text-right pr-3">Trạng thái</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y text-stone-605">
                                  {courseProgressData.map((rec, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-stone-50/50">
                                      <td className="p-3 pl-3 font-semibold text-stone-850">
                                        <div className="flex items-center gap-2">
                                          <img src={rec.studentAvatar} alt="Student avatar" className="w-7.5 h-7.5 rounded-full border shrink-0" referrerPolicy="no-referrer" />
                                          <div className="min-w-0">
                                            <p className="font-extrabold text-stone-900 leading-tight truncate">{rec.studentName}</p>
                                            <p className="text-stone-401 text-stone-400 font-mono text-[9px] mt-0.5 truncate">{rec.studentEmail}</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-3 text-center font-mono font-bold text-amber-700">
                                        {rec.quizAverage.toFixed(1)} / 10
                                      </td>
                                      <td className="p-3">
                                        <div className="space-y-1">
                                          <div className="flex justify-between items-center text-[9px] font-mono font-bold">
                                            <span className="text-stone-500 text-[8.5px]">Đã xem {rec.completedLogs} / {rec.totalLessonsCount} bài giảng</span>
                                            <span className="font-extrabold text-stone-850">{rec.progressPercent}%</span>
                                          </div>
                                          <div className="w-40 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                              className={`h-full rounded-full ${
                                                rec.progressPercent === 100 ? 'bg-emerald-500':
                                                rec.progressPercent < 40 ? 'bg-rose-500' : 'bg-amber-400'
                                              }`} 
                                              style={{ width: `${rec.progressPercent}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-3 text-center font-mono font-bold text-stone-700">
                                        {rec.completedLogs} bài tập
                                      </td>
                                      <td className="p-3 text-center text-stone-500 font-bold font-mono">
                                        {rec.lastInteractionDate}
                                      </td>
                                      <td className="p-3 text-right pr-3">
                                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-black ${
                                          rec.status === 'completed' ? 'bg-emerald-100 text-emerald-800':
                                          rec.status === 'dropout' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                          {rec.status === 'completed' ? 'TỐT NGHIỆP' : rec.status === 'dropout' ? 'TRỄ NGHỈ' : 'ĐANG HỌC'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

              </div>
            )}

            {/* Sub-tab 4: dropout_risk */}
            {reportSubTab === 'dropout_risk' && (
              <div className="space-y-6 animate-fade-in text-left">
                {/* Descriptive banner header */}
                <div className="bg-red-50 border border-red-150 p-4.5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-red-800 text-sm flex items-center gap-1.5">
                      <AlertCircle className="w-5 h-5 text-rose-600" /> Hệ Thống Cảnh Báo Nguy Cơ Học Viên Bỏ Học (Churn Warning)
                    </h4>
                    <p className="text-[10px] text-red-700/85 leading-relaxed font-semibold">
                      Những học viên trong phạm vi này có tiến trình tích hợp dưới 40% và chưa hoàn thành bất kỳ hoạt động học tập nào trong 5 ngày liên tiếp. Hãy đôn đốc nhanh bằng các công cụ liên lạc bên dưới.
                    </p>
                  </div>
                  <div className="shrink-0 bg-red-105 bg-red-100 border border-red-200 p-2.5 rounded-xl text-center select-none font-bold">
                    <span className="text-[9px] uppercase font-bold text-red-800 tracking-wider">Cơ Số Churn Hệ Thống:</span>
                    <p className="text-base font-black text-red-900 font-mono mt-0.5 animate-pulse">
                      {learningProgressRecords.filter(rec => rec.status === 'dropout').length} Churns
                    </p>
                  </div>
                </div>

                {/* Grid List with Churn Incomplete Members */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-black text-[#5c3a21] text-[11px]">Danh Sách Thành Viên Có Nguy Cơ Bỏ Học Lớn Nhất ({learningProgressRecords.filter(rec => rec.status === 'dropout').length} thành viên)</span>
                    <span className="text-[10px] font-bold text-stone-500 italic block">Tiêu chí: Chưa mở ứng dụng từ 5 ngày trở lên</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learningProgressRecords.filter(rec => rec.status === 'dropout').map((rec, dIdx) => (
                      <div key={dIdx} className="bg-white border border-[#8b5e3c]/10 hover:border-red-400 p-4 rounded-2xl transition-all duration-150 hover:shadow-xs relative">
                        
                        <div className="absolute top-3 right-3 select-none">
                          <span className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded border uppercase ${
                            rec.daysInactive > 20 ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-amber-50 text-[#8b5e3c] border-amber-200'
                          }`}>
                            {rec.daysInactive > 20 ? '🔥 Churn cực cao' : '⚠️ Churn trung bình'}
                          </span>
                        </div>

                        <div className="flex gap-3">
                          <img src={rec.studentAvatar} alt={rec.studentName} className="w-11 h-11 rounded-full object-cover border shrink-0" referrerPolicy="no-referrer" />
                          <div className="space-y-0.5 min-w-0 pr-24">
                            <h5 className="font-extrabold text-stone-900 text-[11.5px] truncate">{rec.studentName}</h5>
                            <p className="text-stone-400 font-mono text-[9px] truncate">{rec.studentEmail}</p>
                            <p className="text-[10px] font-bold text-[#8b5e3c] truncate" title={rec.courseTitle}>Khóa bỏ lỡ: <span className="text-stone-750 font-normal">{rec.courseTitle}</span></p>
                          </div>
                        </div>

                        {/* Middle status section */}
                        <div className="grid grid-cols-3 gap-2 bg-stone-50 p-2.5 rounded-lg border my-3.5 font-bold text-[9.5px]">
                          <div>
                            <span className="text-stone-400 text-[8.5px] uppercase block">Học trình đạt</span>
                            <span className="text-rose-600 font-mono block mt-0.5">{rec.progressPercent}% ({rec.completedLogs} bài)</span>
                          </div>
                          <div>
                            <span className="text-stone-400 text-[8.5px] uppercase block">Điểm thi TB</span>
                            <span className="text-stone-700 font-mono block mt-0.5">{rec.quizAverage.toFixed(1)} / 10</span>
                          </div>
                          <div className="text-right">
                            <span className="text-stone-400 text-[8.5px] uppercase block">Số ngày im hơi</span>
                            <span className="text-red-650 text-red-600 block mt-0.5 font-mono font-black">{rec.daysInactive} ngày nghỉ</span>
                          </div>
                        </div>

                        {/* Interactive actions for Churn reduction */}
                        <div className="flex gap-2 justify-end border-t pt-2.5 text-[9px] font-black">
                          <button
                            type="button"
                            onClick={() => alert(`📧 Hệ thống đã tổng hợp thư đôn đốc gửi tự động đến học viên ${rec.studentName} (${rec.studentEmail}) có nội dung: "Nâng mốc học tập khóa ${rec.courseTitle}" kèm theo voucher giảm giá 15% tiếp sức!`)}
                            className="bg-stone-900 hover:bg-stone-800 text-white font-bold py-1.5 px-3 rounded-xl duration-100 shrink-0 cursor-pointer"
                          >
                            📧 Thư Đôn Đốc
                          </button>
                          <button
                            type="button"
                            onClick={() => alert(`💬 Đã khởi tạo Zalo Call/SMS liên hệ đầu mối chăm sóc học tập cho thành viên ${rec.studentName}!`)}
                            className="bg-white border text-stone-700 hover:bg-stone-105 hover:bg-stone-100 font-bold py-1.5 px-3 rounded-xl duration-100 shrink-0 cursor-pointer"
                          >
                            💬 Gọi Phone/Zalo
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

                {/* Analytical guidelines card */}
                <div className="p-4 rounded-xl border bg-stone-50 text-[10px] leading-relaxed text-stone-500 space-y-1.5">
                  <span className="font-bold text-stone-800 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Lời khuyên tối thiểu hóa tỷ lệ Churn từ MindHub Academic:</span>
                  <p>1. Thực hiện gọi điện thoại trực tiếp đối với học viên có số ngày im lặng lớn hơn 20 ngày.</p>
                  <p>2. Kèm một mã coupon đặc cách từ hệ thống (Ví dụ: <strong>RESTART15</strong>) vào nội dung Email gửi đi để tăng khả năng học viên quay lại chương trình lớp học.</p>
                </div>
              </div>
            )}

            {/* Sub-tab 5: completion_stats */}
            {reportSubTab === 'completion_stats' && (
              <div className="space-y-6 animate-fade-in text-left">
                {/* Performance indicators list */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="border border-stone-200 p-4 rounded-xl bg-white text-center flex flex-col justify-center">
                    <span className="text-stone-400 text-[8.5px] font-bold block uppercase">Tỷ Lệ Hoàn Thành Hệ Thống</span>
                    <span className="text-lg font-black block mt-1 text-emerald-600 font-mono">
                      {(() => {
                        const totals = learningProgressRecords.length;
                        const completes = learningProgressRecords.filter(r => r.status === 'completed').length;
                        return totals > 0 ? Math.round((completes / totals) * 100) : 45;
                      })()}%
                    </span>
                    <span className="text-[9.5px] text-stone-400 block mt-0.5">Dựa trên {learningProgressRecords.length} mẫu giám sát</span>
                  </div>
                  
                  <div className="border border-stone-200 p-4 rounded-xl bg-white text-center flex flex-col justify-center">
                    <span className="text-stone-400 text-[8.5px] font-bold block uppercase">Số Chứng Chỉ Đã Phát Hành</span>
                    <span className="text-lg font-black block mt-1 text-stone-800 font-mono">
                      {learningProgressRecords.filter(r => r.status === 'completed').length} Chứng nhận
                    </span>
                    <span className="text-[9.5px] text-emerald-600 font-bold block mt-0.5">● 100% Đăng ký sổ cái chữ ký số</span>
                  </div>

                  <div className="border border-stone-200 p-4 rounded-xl bg-white text-center flex flex-col justify-center">
                    <span className="text-stone-400 text-[8.5px] font-bold block uppercase">Điểm thi Quiz GPA chung</span>
                    <span className="text-lg font-black block mt-1 text-[#8b5e3c] font-mono">
                      {(() => {
                        const scoreSum = learningProgressRecords.reduce((sum, r) => sum + r.quizAverage, 0);
                        return (scoreSum / learningProgressRecords.length).toFixed(1);
                      })()} / 10.0
                    </span>
                    <span className="text-[9.5px] text-stone-400 block mt-0.5">Tiêu chí học trình nghiêm túc</span>
                  </div>

                  <div className="border border-stone-200 p-4 rounded-xl bg-white text-center flex flex-col justify-center">
                    <span className="text-stone-400 text-[8.5px] font-bold block uppercase">Ngành Học Dẫn Đầu Đạt Chứng Chỉ</span>
                    <span className="text-lg font-black block mt-1 text-sky-800 font-mono">AI & Machine L.</span>
                    <span className="text-[9.5px] text-sky-600 font-bold block mt-0.5">Cam kết tốt nghiệp chuẩn</span>
                  </div>
                </div>

                {/* Segment Completion Rate by Category Chart (using dynamic styling) */}
                <div className="border border-stone-200 p-5 rounded-2xl bg-white space-y-4 shadow-3xs">
                  <h4 className="font-extrabold text-[#783c12] text-xs flex items-center gap-1.5 border-b pb-2.5">
                    <GraduationCap className="w-4 h-4 text-[#8b5e3c]" /> Phân Tích Tỷ Lệ Hoàn Thành Khóa Học Theo Chuyên Ngành Học Thuật
                  </h4>

                  <div className="space-y-3.5 text-[10px] font-bold">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-stone-500">
                        <span>1. Công nghệ phần mềm & Lập trình di động (Software Development)</span>
                        <span className="font-mono text-stone-800">Tỷ lệ hoàn thành: 46.5%</span>
                      </div>
                      <div className="w-full bg-stone-105 bg-stone-100 rounded-lg h-2.5 overflow-hidden">
                        <div className="bg-linear-to-r from-amber-500 to-[#8b5e3c] h-full rounded-lg" style={{ width: '46.5%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-stone-550">
                        <span>2. Thiết kế giao diện đa phương tiện & Định vị thương hiệu (UI/UX Design)</span>
                        <span className="font-mono text-stone-800">Tỷ lệ hoàn thành: 38.2%</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-lg h-2.5 overflow-hidden">
                        <div className="bg-linear-to-r from-amber-500 to-[#8b5e3c] h-full rounded-lg" style={{ width: '38.2%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-stone-550">
                        <span>3. Chiến lược SEO & Tiếp thị Marketing đa năng (Marketing Optimization)</span>
                        <span className="font-mono text-stone-805">Tỷ lệ hoàn thành: 28.0%</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-lg h-2.5 overflow-hidden">
                        <div className="bg-linear-to-r from-amber-500 to-[#8b5e3c] h-full rounded-lg" style={{ width: '28%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-stone-550">
                        <span>4. Trực quan AI học máy & Mô hình ngôn ngữ lớn (Artificial Intelligence)</span>
                        <span className="font-mono text-stone-800 text-emerald-600">Tỷ lệ hoàn thành: 55.4% (Đột Phá)</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-lg h-2.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-lg" style={{ width: '55.4%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sổ cái thông tin chứng nhận thật đã phát hành */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-extrabold text-[#5c3a21] text-[11px] block">Sổ Cái Quản Lý & Xác Thức Chữ Ký Số Chứng Chỉ Thật</span>
                    <button 
                      type="button"
                      onClick={() => alert("✓ Đã trích xuất Sổ Cái Xác Thực Chữ Ký Số MindHub-Certificates-Ledger.csv thành công!")}
                      className="bg-stone-50 hover:bg-stone-100 border font-bold px-2.5 py-1 text-[9px] rounded cursor-pointer"
                    >
                      Xuất Sổ Cái PDF
                    </button>
                  </div>

                  <div className="overflow-x-auto border rounded-xl overflow-hidden bg-white shadow-3xs">
                    <table className="w-full text-left text-[10px] border-collapse">
                      <thead className="bg-[#8b5e3c]/5 border-b font-bold text-[#5c3a21]">
                        <tr>
                          <th className="p-3 pl-4">ID Chứng nhận</th>
                          <th className="p-3">Học viên tốt nghiệp</th>
                          <th className="p-3">Khóa học hoàn thành</th>
                          <th className="p-3 text-center">Xếp loại</th>
                          <th className="p-3 text-center">Ngày Chữ Ký Số</th>
                          <th className="p-3 text-right pr-4">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-stone-605">
                        {learningProgressRecords.filter(r => r.status === 'completed').map((rec, cIdx) => (
                          <tr key={cIdx} className="hover:bg-emerald-50/5 font-semibold transition-colors">
                            <td className="p-3 pl-4 font-mono font-bold text-stone-900 text-[10.5px]">
                              MH-CERT-{1000 + cIdx}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <img src={rec.studentAvatar} alt={rec.studentName} className="w-6.5 h-6.5 rounded-full border shrink-0" referrerPolicy="no-referrer" />
                                <div className="space-y-0.5">
                                  <p className="font-extrabold text-stone-900 leading-tight">{rec.studentName}</p>
                                  <p className="text-stone-400 text-[8.5px] font-mono leading-tight">{rec.studentEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-stone-750 font-bold" title={rec.courseTitle}>
                              {rec.courseTitle}
                            </td>
                            <td className="p-3 text-center">
                              <span className="bg-emerald-100 text-emerald-800 text-[8.5px] font-black px-1.5 py-0.5 rounded-sm">
                                {rec.quizAverage >= 9.2 ? 'XUẤT SẮC' : 'GIỎI'}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono text-stone-500 font-bold">
                              2026-06-12
                            </td>
                            <td className="p-3 text-right pr-4">
                              <div className="inline-flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => alert(`✓ Đã tạo liên kết chứng nhận điện tử an toàn cho học viên ${rec.studentName}. Mã định danh: MH-CERT-${1000 + cIdx}`)}
                                  className="bg-stone-900 hover:bg-stone-850 text-white font-bold px-2 py-1 rounded text-[9px] duration-100 cursor-pointer"
                                >
                                  In PDF
                                </button>
                                <button
                                  type="button"
                                  onClick={() => alert(`✓ Đã gửi email chúc mời tốt nghiệp & link LinkedIn Badge đến hòm thư: ${rec.studentEmail}`)}
                                  className="bg-white border text-stone-700 hover:bg-stone-100 font-bold px-2 py-1 rounded text-[9px] duration-100 cursor-pointer"
                                >
                                  Gửi Mail
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
        {/* TAB: PACKAGES MANAGEMENT */}
        {activeTab === 'packages_management' && (
          <div className="space-y-4 animate-fade-in text-xs text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1.5">
                  <Box className="w-5 h-5 text-stone-850" /> Quản lý Gói Khởi Tạo Khóa Học
                </h3>
                <p className="text-stone-400 mt-0.5">Tạo và cấu hình các gói bán lượt tạo khóa học cho giảng viên.</p>
              </div>
              <button
                className="bg-[#8b5e3c] text-white hover:bg-[#6c472d] font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all shadow-md"
                onClick={() => alert('Chức năng thêm mới gói đang được phát triển.')}
              >
                <Plus className="w-4 h-4" /> Thêm Gói Mới
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {coursePackages.length === 0 ? (
                <div className="col-span-full text-center py-12 text-stone-400 font-bold border-2 border-dashed rounded-2xl">
                  Chưa có gói khởi tạo nào. Hãy thêm gói đầu tiên!
                </div>
              ) : (
                coursePackages.map((pkg) => (
                  <div key={pkg.id} className="bg-white border rounded-2xl p-5 hover:border-amber-400 hover:shadow-xs transition-all relative group flex flex-col">
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-amber-700 rounded-lg" title="Sửa gói" onClick={() => alert('Chức năng sửa gói đang được phát triển.')}>
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 bg-stone-100 text-stone-600 hover:bg-red-100 hover:text-red-700 rounded-lg" title="Xóa gói" onClick={() => alert('Chức năng xóa gói đang được phát triển.')}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <h4 className="font-black text-lg text-stone-800 mb-1 pr-16">{pkg.title}</h4>
                    <p className="text-xs text-stone-500 mb-4 flex-1">{pkg.description}</p>
                    
                    <div className="bg-stone-50 rounded-xl p-3 mb-4 border border-stone-100 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-stone-500">Giá bán (VND)</span>
                        <span className="font-black text-brand-dark font-mono text-sm">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.basePrice)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-stone-500">Số lượt tạo khóa</span>
                        <span className="font-black text-emerald-600 font-mono text-sm">+{pkg.courseCreationQuota}</span>
                      </div>
                    </div>
                    
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex justify-between items-center border-t pt-3">
                      <span>ID: {pkg.id}</span>
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">Đang kích hoạt</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Orders Table */}
            <div className="mt-8">
              <h3 className="text-base font-display font-bold text-main-normal mb-4">Giao dịch mua Gói Lượt tạo</h3>
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-stone-600">Thời gian</th>
                      <th className="px-4 py-3 font-semibold text-stone-600">Giảng viên</th>
                      <th className="px-4 py-3 font-semibold text-stone-600">Gói đã mua</th>
                      <th className="px-4 py-3 font-semibold text-stone-600">Số tiền (VND)</th>
                      <th className="px-4 py-3 font-semibold text-stone-600">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {adminPackageOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-stone-400">Chưa có giao dịch nào</td>
                      </tr>
                    ) : (
                      adminPackageOrders.map(order => (
                        <tr key={order.id} className="hover:bg-stone-50">
                          <td className="px-4 py-3 text-stone-500">
                            {new Date(order.created_at).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold">{order.user?.name || order.user_id}</div>
                            <div className="text-stone-400 text-[10px]">{order.user?.email}</div>
                          </td>
                          <td className="px-4 py-3 font-medium text-stone-800">
                            {order.package_snapshot_name} <span className="text-emerald-600 font-bold ml-1">(+{order.package_snapshot_credits})</span>
                          </td>
                          <td className="px-4 py-3 font-bold text-brand-dark font-mono">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount)}
                          </td>
                          <td className="px-4 py-3">
                            {order.status === 'paid' ? (
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-[10px] font-bold uppercase">Thành công</span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-[10px] font-bold uppercase">{order.status}</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM COURSE MANAGEMENT */}
        {activeTab === 'courses_management' && (
          <div className="space-y-4 animate-fade-in text-xs text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1.5">
                  <BookOpen className="w-5 h-5 text-stone-850" /> Quản lý Khóa học Hệ thống
                </h3>
                <p className="text-stone-400 text-[11px]">Duyệt danh sách, thêm mới, sửa đổi thông tin hoặc đình bản toàn bộ khóa học hiện hoạt toàn sàn dán nhãn.</p>
              </div>
              <button
                onClick={handleOpenAddCourse}
                className="bg-stone-900 hover:bg-stone-800 text-white font-bold p-2 px-4 rounded-xl flex items-center gap-1.5 text-xs transition-colors self-end sm:self-center"
              >
                <Plus className="w-4 h-4" /> Thêm Khóa học Mới
              </button>
            </div>

            {/* Filters panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-stone-50 p-3.5 rounded-2xl border">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Tìm khóa học, giảng viên..."
                  value={courseSearchText}
                  onChange={(e) => setCourseSearchText(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs bg-white focus:outline-none placeholder-stone-400"
                />
              </div>

              <div>
                <select
                  value={courseStatusFilter}
                  onChange={(e) => setCourseStatusFilter(e.target.value as any)}
                  className="w-full p-2 border rounded-xl text-xs bg-white focus:outline-none"
                >
                  <option value="All">--- Trạng thái xuất bản ---</option>
                  <option value="active">Đang hoạt động (Active)</option>
                  <option value="pending">Chờ phê duyệt (Pending)</option>
                  <option value="draft">Bản nháp (Draft)</option>
                  <option value="rejected">Bị Từ chối (Rejected)</option>
                </select>
              </div>

              <div>
                <select
                  value={courseCatFilter}
                  onChange={(e) => setCourseCatFilter(e.target.value)}
                  className="w-full p-2 border rounded-xl text-xs bg-white focus:outline-none"
                >
                  <option value="All">--- Phân ngành lớn ---</option>
                  {categoryTree.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end">
                <span className="text-[10px] bg-stone-200 text-stone-700 px-2.5 py-1.5 rounded-lg font-bold">
                  Khớp lọc: {courses.filter(c => {
                    const matchQ = c.title.toLowerCase().includes(courseSearchText.toLowerCase()) || c.instructorName.toLowerCase().includes(courseSearchText.toLowerCase());
                    const matchStatus = courseStatusFilter === 'All' || c.status === courseStatusFilter;
                    const matchCat = courseCatFilter === 'All' || c.category === courseCatFilter;
                    return matchQ && matchStatus && matchCat;
                  }).length} / {courses.length}
                </span>
              </div>
            </div>

            {/* Courses Table */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-[#fdfbf7] border-b border-stone-200">
                    <tr>
                      <th className="p-3 text-stone-850 font-extrabold w-12 text-center">Bìa</th>
                      <th className="p-3 text-stone-850 font-extrabold">Thông tin khóa học</th>
                      <th className="p-3 text-stone-850 font-extrabold">Giảng viên & Phân phân loại</th>
                      <th className="p-3 text-stone-850 font-extrabold">Học phí</th>
                      <th className="p-3 text-stone-850 font-extrabold text-center">Trạng thái</th>
                      <th className="p-3 text-stone-850 font-extrabold text-center">Kiểm soát nhanh</th>
                      <th className="p-3 text-stone-850 font-extrabold text-right">Tùy biến</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {courses.filter(c => {
                      const matchQ = c.title.toLowerCase().includes(courseSearchText.toLowerCase()) || c.instructorName.toLowerCase().includes(courseSearchText.toLowerCase());
                      const matchStatus = courseStatusFilter === 'All' || c.status === courseStatusFilter;
                      const matchCat = courseCatFilter === 'All' || c.category === courseCatFilter;
                      return matchQ && matchStatus && matchCat;
                    }).map(c => (
                      <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3 text-center shrink-0">
                          <img src={c.image} alt="Bìa" className="w-10 h-7 object-cover rounded border" />
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-stone-900 block line-clamp-1">{c.title}</span>
                          <span className="text-[10px] text-stone-400 block mt-0.5 font-mono">ID: {c.id}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold block">{c.instructorName}</span>
                          <span className="text-[9.5px] text-gray-400">{c.category} • <b className="text-stone-600">{c.subcategory}</b></span>
                        </td>
                        <td className="p-3 font-semibold text-stone-800">
                          {c.salePrice ? (
                            <div>
                              <span className="text-red-655 font-bold text-red-600">{formatVND(c.salePrice)}</span>
                              <span className="line-through text-stone-300 ml-1 text-[10px]">{formatVND(priceNumAndClean(c.price))}</span>
                            </div>
                          ) : (
                            <span>{formatVND(c.price)}</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                            c.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            c.status === 'pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                            c.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-stone-100 text-stone-500'
                          }`}>
                            {c.status === 'active' ? 'Active' : c.status === 'pending' ? 'Pending' : c.status === 'rejected' ? 'Rejected' : 'Draft'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap justify-center gap-1">
                            {c.isFeatured && <span className="bg-[#8b5e3c]/10 text-[#8b5e3c] text-[8px] px-1 rounded font-bold">★ Nổi bật</span>}
                            {c.isBestseller && <span className="bg-amber-100 text-amber-800 text-[8px] px-1 rounded font-bold font-mono">BEST</span>}
                            {c.isHidden && <span className="bg-stone-900 text-white text-[8px] px-1 rounded font-bold">Ẩn</span>}
                            {c.giveCertificate && <span className="bg-blue-105 text-blue-800 bg-blue-100 text-[8px] px-1 rounded font-bold font-sans">Cert</span>}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditCourse(c)}
                              className="p-1 px-2 border hover:bg-stone-100 rounded text-stone-700 bg-white"
                              title="Sửa nhanh thông tin học lý"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(c.id)}
                              className="p-1 px-2 border hover:bg-red-50 hover:border-red-250 rounded text-red-656 text-red-600 bg-white"
                              title="Xóa khóa nghiên cứu học trình"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MULTI-LEVEL CATEGORIES */}
        {activeTab === 'categories_management' && (
          <div className="space-y-4 animate-fade-in text-xs text-left">
            <div className="border-b pb-3">
              <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1.5">
                <FolderTree className="w-5 h-5 text-stone-850" /> Quản lý Danh mục Đa cấp
              </h3>
              <p className="text-stone-400 text-[11px]">Định cấu hình các ngành nghề chính (Level 1) và phân nhóm các chuyên môn học lượng chi tiết hơn (Level 2).</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Categories Level 1 */}
              <div className="lg:col-span-5 bg-white border rounded-2xl p-4 space-y-4 shadow-3xs">
                <div className="border-b pb-2 flex justify-between items-center bg-stone-50/50 p-2 rounded-lg">
                  <span className="font-extrabold text-stone-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-stone-700" /> Ngành học Lớn (Level 1)
                  </span>
                  <span className="bg-stone-200 font-bold px-2 py-0.5 rounded text-[10px]">{categoryTree.length} ngành</span>
                </div>

                <div className="space-y-1.5">
                  {categoryTree.map((cat) => (
                    <div 
                      key={cat.id} 
                      onClick={() => {
                        setSelectedParentId(cat.id);
                        setEditingCatId(null);
                      }}
                      className={`p-2.5 px-3 rounded-xl border flex justify-between items-center transition-all cursor-pointer ${
                        selectedParentId === cat.id ? 'border-brand-normal bg-[#8b5e3c]/5 font-bold shadow-3xs' : 'border-stone-150 bg-stone-50/30 hover:bg-stone-50'
                      }`}
                    >
                      {editingCatId === cat.id ? (
                        <div className="flex gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingCatValue}
                            onChange={(e) => setEditingCatValue(e.target.value)}
                            className="bg-white border text-xs p-1 rounded w-full focus:outline-none"
                            placeholder="Nhập tên ngành..."
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!editingCatValue.trim()) return;
                              const updated = categoryTree.map(c => c.id === cat.id ? { ...c, name: editingCatValue } : c);
                              setCategoryTree(updated);
                              handleSyncCategoriesToApp(updated);
                              setEditingCatId(null);
                            }}
                            className="bg-emerald-600 text-white p-1 px-2 rounded hover:bg-emerald-700"
                          >
                            Lưu
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className={`${selectedParentId === cat.id ? 'text-[#5c3e21]' : 'text-stone-800'}`}>{cat.name}</span>
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCatId(cat.id);
                                setEditingCatValue(cat.name);
                              }}
                              className="text-stone-400 hover:text-stone-700 p-0.5"
                              title="Đổi tên phân ngành"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const countCourses = courses.filter(c => c.category === cat.name).length;
                                if (countCourses > 0) {
                                  alert(`⚠️ Không được phép xóa ngành học này vì có ${countCourses} khóa học đang thuộc phân nhóm này.`);
                                  return;
                                }
                                if (confirm(`Bạn có đồng ý xóa ngành học "${cat.name}" và toàn bộ phân nhóm phụ?`)) {
                                  const updated = categoryTree.filter(c => c.id !== cat.id);
                                  setCategoryTree(updated);
                                  handleSyncCategoriesToApp(updated);
                                  if (selectedParentId === cat.id && updated.length > 0) {
                                    setSelectedParentId(updated[0].id);
                                  }
                                }
                              }}
                              className="text-red-400 hover:text-red-600 p-0.5"
                              title="Xóa phân ngành"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Thêm ngành lớn mới..."
                      value={newParentName}
                      onChange={(e) => setNewParentName(e.target.value)}
                      className="bg-slate-50 border p-2 text-xs rounded-xl w-full focus:outline-none placeholder-stone-400 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newParentName.trim()) return;
                        const existName = categoryTree.some(c => c.name.toLowerCase() === newParentName.trim().toLowerCase());
                        if (existName) {
                          alert('Phân nhóm này đã tồn tại trên dữ liệu.');
                          return;
                        }
                        const newId = `cat-${Date.now()}`;
                        const updated = [...categoryTree, { id: newId, name: newParentName.trim(), subcategories: [] }];
                        setCategoryTree(updated);
                        handleSyncCategoriesToApp(updated);
                        setSelectedParentId(newId);
                        setNewParentName('');
                        alert(`✓ Khởi tạo ngành chính: ${newParentName} thành công.`);
                      }}
                      className="bg-stone-900 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-stone-850"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Categories Level 2 (Subcategories) */}
              <div className="lg:col-span-7 bg-white border rounded-2xl p-4 space-y-4 shadow-3xs">
                {(() => {
                  const node = categoryTree.find(c => c.id === selectedParentId);
                  if (!node) {
                    return <p className="text-center text-stone-400 py-10">Chọn một ngành học lớn để thiết lập chuyên ngành phụ.</p>;
                  }

                  return (
                    <>
                      <div className="border-b pb-2 flex justify-between items-center bg-[#8b5e3c]/5 p-2 rounded-lg">
                        <span className="font-extrabold text-stone-900 flex items-center gap-1.5">
                          <span>🎯 Chuyên ngành thuộc: <b>{node.name}</b></span>
                        </span>
                        <span className="bg-stone-200 font-bold px-2 py-0.5 rounded text-[10px]">{node.subcategories.length} phân nhóm</span>
                      </div>

                      {node.subcategories.length === 0 ? (
                        <div className="text-center py-10 text-stone-400 bg-stone-50 rounded-xl border border-dashed">
                          Chưa cấu hình chuyên ngành cụ thể cho ngành {node.name}.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {node.subcategories.map((sub, idx) => (
                            <div key={idx} className="p-2.5 bg-stone-50 border rounded-xl flex justify-between items-center hover:bg-stone-100/55 duration-100">
                              <span className="font-medium text-stone-700">{sub}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const countCourses = courses.filter(c => c.category === node.name && c.subcategory === sub).length;
                                  if (countCourses > 0) {
                                    alert(`⚠️ Không thể xóa chuyên ngành này do đang có ${countCourses} khóa học liên quan đang được phát hành.`);
                                    return;
                                  }
                                  if (confirm(`Bạn có đồng ý xóa chuyên ngành phụ "${sub}"?`)) {
                                    const nextSubs = node.subcategories.filter((_, i) => i !== idx);
                                    const updated = categoryTree.map(c => c.id === node.id ? { ...c, subcategories: nextSubs } : c);
                                    setCategoryTree(updated);
                                    handleSyncCategoriesToApp(updated);
                                  }
                                }}
                                className="text-stone-400 hover:text-red-500 p-0.5"
                                title="Xóa chuyên ngành này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t flex gap-1.5">
                        <input
                          type="text"
                          placeholder={`Thêm chuyên môn phụ cho ${node.name}...`}
                          value={newSubName}
                          onChange={(e) => setNewSubName(e.target.value)}
                          className="bg-slate-50 border p-2 text-xs rounded-xl w-full focus:outline-none placeholder-stone-400 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newSubName.trim()) return;
                            const existed = node.subcategories.some(s => s.toLowerCase() === newSubName.trim().toLowerCase());
                            if (existed) {
                              alert('Chuyên môn này đã có sẵn trong danh mục.');
                              return;
                            }
                            const updated = categoryTree.map(c => c.id === node.id ? { ...c, subcategories: [...c.subcategories, newSubName.trim()] } : c);
                            setCategoryTree(updated);
                            handleSyncCategoriesToApp(updated);
                            setNewSubName('');
                            alert(`✓ Đã thêm phân lớp nghiên cứu: ${newSubName.trim()} cho ngành ${node.name}.`);
                          }}
                          className="bg-[#8b5e3c] text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#5c3e21] duration-150 shrink-0"
                        >
                          Thêm Chuyên Môn
                        </button>
                      </div>
                    </>
                  );
                })()}

              </div>

            </div>
          </div>
        )}

        {/* TAB 4: USERS MANAGEMENT */}
        {activeTab === 'users_management' && (
          <div className="space-y-4 animate-fade-in text-xs text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1.5">
                  <Users className="w-5 h-5 text-stone-850" /> Quản lý Người dùng hệ thống
                </h3>
                <p className="text-stone-400 text-[11px]">Thực hiện cấp mới, sửa đổi thông tin, kiểm toán định kỳ hoặc hạ dán nhãn block/vô hiệu hóa bất cứ tài khoản nào.</p>
              </div>
              <button
                onClick={handleOpenAddUser}
                className="bg-stone-900 hover:bg-stone-800 text-white font-bold p-2 px-4 rounded-xl flex items-center gap-1.5 text-xs transition-colors self-end sm:self-center"
              >
                <Plus className="w-4 h-4" /> Tạo người dùng
              </button>
            </div>

            {/* Filter Search area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-stone-50 p-3 rounded-2xl border">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Tìm thành viên qua tên, email, sdt..."
                  value={userSearchText}
                  onChange={(e) => setUserSearchText(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border rounded-xl text-xs bg-white focus:outline-none placeholder-stone-400"
                />
              </div>

              <div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value as any)}
                  className="w-full p-1.5 border rounded-xl text-xs bg-white focus:outline-none font-bold"
                >
                  <option value="All">--- Tất cả vai trò hệ thống ---</option>
                  <option value="student">Học viên (Student)</option>
                  <option value="instructor">Giảng viên (Instructor)</option>
                  <option value="admin">Quản trị viên tối cao (Admin)</option>
                </select>
              </div>

              <div className="flex items-center justify-end">
                <span className="text-[10px] bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg font-bold">
                  Khớp lọc: {usersList.filter(u => {
                    const matchQ = u.name.toLowerCase().includes(userSearchText.toLowerCase()) || u.email.toLowerCase().includes(userSearchText.toLowerCase()) || (u.phone || '').includes(userSearchText);
                    const matchRole = userRoleFilter === 'All' || u.role === userRoleFilter;
                    return matchQ && matchRole;
                  }).length} / {usersList.length} thành viên
                </span>
              </div>
            </div>

            {/* User database list */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-[#fcf8f2]/60 border-b">
                    <tr>
                      <th className="p-3 text-stone-850 font-extrabold">Hồ sơ</th>
                      <th className="p-3 text-stone-850 font-extrabold">Email liên hệ / Số Điện thoại</th>
                      <th className="p-3 text-stone-850 font-extrabold text-center">Vai Trò</th>
                      <th className="p-3 text-stone-850 font-extrabold text-center">Chuỗi Streak</th>
                      <th className="p-3 text-stone-850 font-extrabold text-center">Trạng thái hạn ngạch</th>
                      <th className="p-3 text-stone-850 font-extrabold text-right">Tạo tác nhanh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {usersList.filter(u => {
                      const matchQ = u.name.toLowerCase().includes(userSearchText.toLowerCase()) || u.email.toLowerCase().includes(userSearchText.toLowerCase()) || (u.phone || '').includes(userSearchText);
                      const matchRole = userRoleFilter === 'All' || u.role === userRoleFilter;
                      return matchQ && matchRole;
                    }).map((usr) => {
                      const isBanned = bannedUserIds.includes(usr.id);
                      return (
                        <tr key={usr.id} className="hover:bg-stone-50 transition-colors">
                          <td className="p-3 flex items-center gap-2.5">
                            <img src={usr.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border" />
                            <div>
                              <span className="font-bold text-stone-900 block">{usr.name}</span>
                              <span className="text-[9.5px] text-stone-400 block mt-0.5">ID: {usr.id} | Active: {usr.lastActiveDate}</span>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[11px]">
                            <span className="text-stone-800 block font-medium">{usr.email}</span>
                            <span className="text-stone-400 text-[10px]">{usr.phone || 'Chưa cung cấp số dt'}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded tracking-wide ${
                              usr.role === 'admin' ? 'bg-red-150 text-red-800 bg-red-100' :
                              usr.role === 'instructor' ? 'bg-orange-100 text-orange-850 bg-amber-100' : 'bg-stone-105 text-stone-700 bg-stone-100'
                            }`}>
                              {usr.role}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-stone-800">
                            🔥 {usr.streak} ngày
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                              isBanned ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isBanned ? '⛔ ĐÃ ĐÌNH CHỈ' : '✓ BÌNH THƯỜNG'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditUser(usr)}
                                className="p-1 px-2 border hover:bg-stone-100 rounded text-stone-700 bg-white shadow-3xs"
                                title="Biên tập thông tin cá nhân"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleToggleBlockUser(usr.id)}
                                className={`text-[9px] font-bold p-1 px-2 rounded border transition-all ${
                                  isBanned ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-red-50 hover:bg-red-100 text-red-800 border-red-200'
                                }`}
                              >
                                {isBanned ? 'Mở khóa' : 'Khóa acc'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(usr.id)}
                                className="p-1 px-2 border hover:bg-red-100 hover:text-white hover:border-red-600 rounded text-stone-400 bg-white shadow-3xs transition-colors"
                                title="Xóa tài khoản bất biến"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ROLE & PERMISSION MATRIX */}
        {activeTab === 'role_permissions' && (
          <div className="space-y-4 animate-fade-in text-xs text-left">
            <div className="border-b pb-3">
              <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1.5">
                <Key className="w-5 h-5 text-stone-850" /> Quản lý Role & Phân Quyền
              </h3>
              <p className="text-stone-400 text-[11px]">Tùy biến cấp phép các đặc quyền truy cập hệ thống trực tiếp dựa trên nhóm tài khoản. Thay đổi có hiệu lực ngay lập tức toàn trường.</p>
            </div>

            <div className="bg-slate-50 border p-4 rounded-2xl">
              <span className="font-extrabold text-[#8b5e3c] block text-xs mb-1.5">Ma trận Phân quyền Tác vụ Hệ thống MindHub</span>
              <p className="text-stone-500 leading-relaxed text-[11px] mb-4">Nhấp trực tiếp vào ô Checkbox để kích hoạt hoặc thu hồi tức thời một quyền hạn chức năng cụ thể dành cho từng nhóm vai trò.</p>

              <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs align-middle">
                    <thead className="bg-[#fcf8f2] border-b text-stone-850">
                      <tr>
                        <th className="p-3.5 font-black w-72">Quyền Hạn / Tác Vụ</th>
                        <th className="p-3.5 font-black text-center text-stone-700 w-32">Học Viên (student)</th>
                        <th className="p-3.5 font-black text-center text-orange-755 w-32">Giảng Viên (instructor)</th>
                        <th className="p-3.5 font-black text-center text-red-800 w-32">Tổng Trực Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-150 font-medium">
                      {appPermissions.map((permission) => (
                        <tr key={permission.key} className="hover:bg-stone-50/50 transition-colors">
                          <td className="p-3.5">
                            <span className="font-bold text-stone-900 block">{permission.name}</span>
                            <span className="text-[9.5px] text-stone-400 block mt-0.5">Mã định danh: <code className="bg-stone-100 px-1 py-0.5 text-stone-600 rounded font-mono">{permission.key}</code> • Nhóm: {permission.group}</span>
                          </td>
                          {(['student', 'instructor', 'admin'] as Role[]).map((role) => {
                            const hasPerm = rolePermissions[role].includes(permission.key);
                            return (
                              <td key={role} className="p-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={hasPerm}
                                  onChange={() => {
                                    setRolePermissions(prev => {
                                      const currentList = prev[role];
                                      const nextList = currentList.includes(permission.key)
                                        ? currentList.filter(k => k !== permission.key)
                                        : [...currentList, permission.key];
                                      
                                      const updated = { ...prev, [role]: nextList };
                                      return updated;
                                    });
                                  }}
                                  disabled={role === 'admin' && permission.key === 'user_moderation'} // Prevent admin locking lock
                                  className="w-4 h-4 rounded text-stone-900 focus:ring-0 border-stone-300 focus:outline-none transition-all cursor-pointer"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-stone-100 p-3 rounded-lg border border-stone-200 mt-4 text-[10.5px] text-stone-600 flex items-center gap-2 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Toàn bộ các yêu cầu xác minh bảo mật và API trung gian sẽ định tuyến đối soát dựa trên ma trận rà soát trên trong chu kỳ 2026.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PROCESSING INSTRUCTORS PAYOUTS CLAIMS */}
        {activeTab === 'payouts_requests' && (
          <div className="space-y-4 animate-fade-in text-xs text-left">
            <div className="border-b pb-3">
              <h3 className="text-base font-display font-bold text-main-normal">Duyệt Yêu cầu Rút tiền Giảng viên</h3>
              <p className="text-stone-400 text-[11px]">Đánh giá các hồ sơ rút số tiền hoa hồng tích lũy từ lượt bán khóa học, kích hoạt lệnh chuyển khoản tự động.</p>
            </div>

            {/* Filter and Search Bar for Payouts */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Tìm theo Tên giảng viên, Mã hồ sơ (#ID)..."
                  value={payoutQuery}
                  onChange={(e) => setPayoutQuery(e.target.value)}
                  className="w-full bg-white pl-9 pr-3 py-2 border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-stone-900 border-stone-250 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-stone-500 font-bold whitespace-nowrap">Trạng thái:</span>
                <select
                  value={payoutStatusFilter}
                  onChange={(e: any) => setPayoutStatusFilter(e.target.value)}
                  className="bg-white border rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-stone-900 border-stone-250 text-xs"
                >
                  <option value="All">Tất cả trạng thái</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="completed">Đã chuyển khoản</option>
                  <option value="rejected">Đã từ chối</option>
                </select>
              </div>
            </div>

            {(() => {
              const filteredPayouts = payoutRequests.filter((req) => {
                const matchesStatus = payoutStatusFilter === 'All' || req.status === payoutStatusFilter;
                
                const queryStr = payoutQuery.toLowerCase();
                const matchesId = req.id.toLowerCase().includes(queryStr);
                const matchesInstructor = req.instructorName.toLowerCase().includes(queryStr);
                
                return matchesStatus && (matchesId || matchesInstructor || queryStr === '');
              });

              if (filteredPayouts.length === 0) {
                return (
                  <div className="text-center py-12 border border-dashed rounded-2xl bg-white">
                    <CheckCircle className="w-12 h-12 text-stone-400 mx-auto mb-2" />
                    <p className="font-semibold text-xs text-main-normal">Không tìm thấy yêu cầu rút tiền phù hợp với bộ lọc.</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 gap-3">
                  {filteredPayouts.map(request => (
                    <div key={request.id} className="border border-brand-light-active p-4 rounded-2xl bg-slate-50/50 hover:bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-3xs transition-all">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-stone-900 text-xs">{request.instructorName}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-mono font-bold px-1.5 py-0.3 rounded uppercase">Giảng Viên</span>
                        </div>
                        <span className="text-brand-dark font-black tracking-tight text-sm block font-mono">{formatVND(request.amount)}</span>
                        <p className="text-[10px] text-stone-400">Yêu cầu tạo: {request.date} • Mã giao dịch: <code className="font-mono bg-stone-100 px-1 py-0.5 text-[9px] rounded">{request.id}</code></p>
                      </div>

                      <div className="flex gap-2 self-end md:self-center shrink-0">
                        {request.status === 'pending' ? (
                          <>
                            <button 
                              type="button"
                              onClick={() => {
                                onApprovePayout(request.id);
                                alert(`✓ Sàn MindHub đã giải ngân ${formatVND(request.amount)} về tài khoản ngân hàng của giảng viên ${request.instructorName}`);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-4 rounded-xl flex items-center gap-1 shadow-3xs text-[10.5px]"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Duyệt Chuyển Khoản
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                onRejectPayout(request.id);
                                alert(`Đã từ chối chi trả do phát hiện sai sót số đối soát từ giảng viên ${request.instructorName}`);
                              }}
                              className="bg-red-500 hover:bg-red-657 text-white font-semibold py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-3xs text-[10.5px]"
                            >
                              Hủy Yêu Cầu
                            </button>
                          </>
                        ) : (
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                            request.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-700'
                          }`}>
                            {request.status === 'completed' ? '✓ ĐÃ CHUYỂN KHOẢN' : '🚫 ĐÃ BỊ TỪ CHỐI'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 7: DUYỆT ĐƠN HÀNG HỌC PHÍ */}
        {activeTab === 'orders_management' && (
          <div className="space-y-4 animate-fade-in text-xs text-left">
            <div className="border-b pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1.5">
                  <Landmark className="w-5 h-5 text-amber-700 font-bold" />
                  Quản lý Duyệt Đơn hàng & Đóng Học phí (Sandbox Billing Gateways)
                </h3>
                <p className="text-stone-500 text-[11px]">Đối chiếu giao dịch và thủ công kích hoạt ghi danh cho học viên gửi hóa đơn chuyển khoản lẻ không hoàn thành qua internet banking tự động.</p>
              </div>
            </div>

            {/* Filter and Search Bar for Orders */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Tìm theo Mã hóa đơn (#ID), tên khóa học..."
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  className="w-full bg-white pl-9 pr-3 py-2 border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-stone-900 border-stone-250 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-stone-500 font-bold whitespace-nowrap">Trạng thái:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e: any) => setOrderStatusFilter(e.target.value)}
                  className="bg-white border rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-stone-900 border-stone-250 text-xs"
                >
                  <option value="All">Tất cả trạng thái</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="success">Thành công</option>
                  <option value="failed">Thất bại</option>
                </select>
              </div>
            </div>

            {(() => {
              const filteredOrders = orders.filter((or) => {
                const matchesStatus = orderStatusFilter === 'All' || or.status === orderStatusFilter;
                
                const queryStr = orderQuery.toLowerCase();
                const matchesId = or.id.toLowerCase().includes(queryStr);
                const matchesCourses = or.courses.some(c => c.title.toLowerCase().includes(queryStr));
                
                return matchesStatus && (matchesId || matchesCourses || queryStr === '');
              });

              if (filteredOrders.length === 0) {
                return (
                  <div className="text-center py-12 border border-dashed rounded-2xl bg-white">
                    <CheckCircle className="w-12 h-12 text-stone-400 mx-auto mb-2" />
                    <p className="font-semibold text-xs text-main-normal">Không tìm thấy mã đơn hàng hoặc khóa học phù hợp với bộ lọc.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {filteredOrders.map((or) => (
                    <div 
                      key={or.id} 
                      className={`border p-4 rounded-2xl bg-white shadow-3xs flex flex-col md:flex-row justify-between gap-4 items-start md:items-center transition-all ${
                        or.status === 'success' ? 'border-emerald-250 bg-emerald-50/10' :
                        or.status === 'failed' ? 'border-stone-200 bg-stone-50/30' : 'border-amber-250 bg-amber-50/10'
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-stone-850 font-mono text-[12px]">Hóa đơn: #{or.id}</span>
                          <span className="text-stone-400 font-mono">({or.date})</span>
                          <span className="bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded font-bold text-[9px]">{or.paymentMethod}</span>
                          
                          <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded tracking-wider ${
                            or.status === 'success' ? 'bg-emerald-100 text-emerald-800' :
                            or.status === 'failed' ? 'bg-stone-200 text-stone-605' : 'bg-status-unpaid bg-amber-100 text-amber-900 border border-amber-250 animate-pulse'
                          }`}>
                            {or.status === 'success' ? 'Thành Công (Paid)' :
                             or.status === 'failed' ? 'Thất Bại (Failed)' : 'Chờ xác thực dịch vụ'}
                          </span>
                        </div>

                        <div className="text-stone-700 space-y-1 bg-white p-3 rounded-xl border border-stone-100">
                          <p className="font-bold text-[10px] text-stone-500">Giỏ hàng bao gồm:</p>
                          {or.courses.map(c => (
                            <div key={c.id} className="flex justify-between items-center text-[10.5px] text-stone-600">
                              <span>- {c.title}</span>
                              <span className="font-mono font-bold">{formatVND(c.price)}</span>
                            </div>
                          ))}
                          {or.discountAmount > 0 && (
                            <div className="flex justify-between items-center text-[10.5px] text-emerald-600 font-bold">
                              <span>Đã dùng mã ưu đãi áp giảm:</span>
                              <span>-{formatVND(or.discountAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-[11.5px] font-extrabold text-[#783c12] pt-1.5 border-t border-stone-100 mt-1">
                            <span>THU NHẬP ĐỐI SOÁT CUỐI:</span>
                            <span className="font-mono text-sm">{formatVND(or.total)}</span>
                          </div>
                        </div>
                      </div>

                      {or.status === 'pending' && onUpdateOrderStatus && (
                        <div className="flex gap-2 self-end md:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateOrderStatus(or.id, 'success');
                              alert(`✓ Đã kích hoạt học lực thành công cho đơn hàng ${or.id}. Tài khoản học viên tự động được cấp quyền vào lớp.`);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 shadow-sm text-[10.5px]"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Duyệt Chi học phí
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Từ chối giao dịch đóng học phí lẻ này?")) {
                                onUpdateOrderStatus(or.id, 'failed');
                                alert(`✓ Đơn hàng ${or.id} đã bị đóng khóa hủy bỏ.`);
                              }
                            }}
                            className="bg-stone-500 hover:bg-stone-605 text-white font-semibold py-1.5 px-3.5 rounded-xl text-xs flex items-center gap-1 shadow-sm text-[10.5px]"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 8: MARKETING & NOTIFICATIONS SYSTEMS */}
        {activeTab === 'marketing_notifications' && (
          <div className="space-y-6 animate-fade-in text-xs text-left">
            <div className="border-b pb-4 border-stone-200">
              <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#8b5e3c]" /> Quản trị Chiến dịch Marketing & Thông báo Đa lớp học
              </h3>
              <p className="text-stone-400 text-[11px] mt-0.5">
                Thiết lập mã giảm giá (coupon) giới hạn theo từng khóa học cụ thể, và phát hành các bảng tin thông báo đẩy đến phiên học tập của từng lớp học mục tiêu.
              </p>
            </div>

            {/* Sub-tab Selection Buttons */}
            <div className="flex gap-2 p-1 bg-stone-100 rounded-xl max-w-md">
              <button
                type="button"
                onClick={() => setMarketingSubTab('coupons')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-center font-bold text-[11px] transition-all duration-150 ${marketingSubTab === 'coupons' ? 'bg-white shadow-3xs text-stone-900 border border-stone-200' : 'text-stone-500 hover:text-stone-800'}`}
              >
                🎟️ Chương Trình Ưu Đãi (Coupons)
              </button>
              <button
                type="button"
                onClick={() => setMarketingSubTab('notifications')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-center font-bold text-[11px] transition-all duration-150 ${marketingSubTab === 'notifications' ? 'bg-white shadow-3xs text-stone-900 border border-stone-200' : 'text-stone-500 hover:text-stone-800'}`}
              >
                📢 Bảng Tin & Thông Báo Lớp Học
              </button>
            </div>

            {/* Check which subtab is active based on state lookup */}
            {(() => {
              if (marketingSubTab === 'coupons') {
                // COUPONS SUB TAB
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Coupon creation form */}
                    <form onSubmit={handleAddNewCoupon} className="lg:col-span-5 border border-amber-100 bg-amber-50/10 p-5 rounded-2xl space-y-4 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🎟️</span>
                        <h4 className="font-bold text-xs text-brand-dark">Sản sinh Coupon Chiến dịch mới</h4>
                      </div>
                      
                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-605 mb-1">Mã giảm giá (In hoa không dấu, liền nhau):</label>
                        <input 
                          type="text" 
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                          placeholder="Vd: REACTPRO2026, HELLO99, KHOAHOCHAY"
                          className="w-full text-xs px-3 py-2 border rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10.5px] font-bold text-stone-605 mb-1">Tỷ lệ giảm học phí (%):</label>
                          <input 
                            type="number" 
                            min={1}
                            max={100}
                            value={couponVal}
                            onChange={(e) => setCouponVal(parseInt(e.target.value) || 1)}
                            className="w-full text-xs px-3 py-2 border rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10.5px] font-bold text-stone-605 mb-1">Giới hạn theo Khóa học:</label>
                          <select
                            value={couponTargetCourse}
                            onChange={(e) => setCouponTargetCourse(e.target.value)}
                            className="w-full text-xs px-2.5 py-2 border rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium text-stone-800"
                          >
                            <option value="all">Toàn sàn (Tất cả khóa học)</option>
                            {courses.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title.slice(0, 35)}...
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-605 mb-1">Mô tả chương trình ưu đãi:</label>
                        <textarea 
                          rows={2}
                          value={couponDesc}
                          onChange={(e) => setCouponDesc(e.target.value)}
                          placeholder="Mừng ngày tựu trường - Giảm giá đặc xá riêng học viên đăng ký sớm..."
                          className="w-full text-xs px-3 py-2 border rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <button type="submit" className="w-full bg-stone-900 text-white py-2.5 rounded-xl font-bold hover:bg-stone-850 duration-150 flex items-center justify-center gap-1.5 shadow-sm text-xs">
                        <Plus className="w-4 h-4 text-amber-400" /> Kích hoạt Phát hành Coupon
                      </button>
                    </form>

                    {/* Coupons inventory list */}
                    <div className="lg:col-span-7 space-y-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-3xs">
                      <div className="flex justify-between items-center border-b pb-2.5">
                        <h4 className="font-extrabold text-[#784e2d] text-xs flex items-center gap-1">
                          📊 Danh sách mã Coupons đang hoạt động ({localCoupons.length})
                        </h4>
                        <span className="text-[10px] text-stone-400">Tự động sao lưu đồng bộ</span>
                      </div>
                      
                      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                        {localCoupons.length === 0 ? (
                          <div className="py-12 text-center text-stone-400 font-bold bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                             Chưa có mã giảm giá nào được lưu hành.
                          </div>
                        ) : (
                          localCoupons.map((c) => {
                            const targetCourse = courses.find(course => course.id === c.targetCourseId);
                            return (
                              <div key={c.code} className="p-3.5 border rounded-xl bg-stone-50/55 hover:bg-amber-50/15 flex justify-between items-center text-xs transition-colors border-stone-200 relative group">
                                <div className="space-y-1 max-w-[80%]">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-black text-brand-dark text-sm bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-200 shadow-3xs">{c.code}</span>
                                    {c.targetCourseId ? (
                                      <span className="bg-amber-50 text-[#8b5e3c] border border-amber-200 text-[9px] font-black px-1.5 py-0.5 rounded-md truncate max-w-[150px] inline-block" title={targetCourse?.title}>
                                        🎯 Khóa: {targetCourse?.title || c.targetCourseId}
                                      </span>
                                    ) : (
                                      <span className="bg-stone-200 text-stone-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                                        🌍 Toàn sàn
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-stone-600 font-medium leading-relaxed mt-1">{c.description}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="bg-red-100 text-red-800 font-black px-2.5 py-1 rounded-xl text-xs shadow-3xs border border-red-200">
                                    -{c.discount}%
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCoupon(c.code)}
                                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-650 hover:bg-red-50 duration-100"
                                    title="Thu hồi mã giảm giá"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              } else {
                // NOTIFICATIONS BROADCAST SUB TAB
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Notification announcement form */}
                    <form onSubmit={handleCreateNotification} className="lg:col-span-5 border border-indigo-100 bg-indigo-50/10 p-5 rounded-2xl space-y-4 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">📢</span>
                        <h4 className="font-bold text-xs text-indigo-900">Ban hành Thông báo Lớp học mục tiêu</h4>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-605 mb-1">Tiêu đề bản tin:</label>
                        <input 
                          type="text" 
                          value={notifTitle}
                          onChange={(e) => setNotifTitle(e.target.value)}
                          placeholder="Vd: Thay đổi lịch thi cuối khóa, Update học liệu mới"
                          className="w-full text-xs px-3 py-2 border rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10.5px] font-bold text-stone-605 mb-1">Nhóm thẻ hiển thị:</label>
                          <select
                            value={notifType}
                            onChange={(e: any) => setNotifType(e.target.value)}
                            className="w-full text-xs px-2.5 py-2 border rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                          >
                            <option value="info">ℹ️ Tin phổ thông (Info)</option>
                            <option value="success">✅ Khích lệ (Success)</option>
                            <option value="warning">⚠️ Cảnh báo (Warning)</option>
                            <option value="reminder">🔔 Nhắc nhở kiểm tra (Reminder)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10.5px] font-bold text-stone-605 mb-1">Gửi cho học viên lớp:</label>
                          <select
                            value={notifTargetCourse}
                            onChange={(e) => setNotifTargetCourse(e.target.value)}
                            className="w-full text-xs px-2.5 py-2 border rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-stone-800"
                          >
                            <option value="all">Toàn diện học viên hệ thống (Toàn sàn)</option>
                            {courses.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title.slice(0, 35)}...
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-605 mb-1">Nội dung chi tiết thông báo gửi học viên:</label>
                        <textarea 
                          rows={3}
                          value={notifMsg}
                          onChange={(e) => setNotifMsg(e.target.value)}
                          placeholder="Điền đoạn văn nhắn gửi học viên hiện diện ở khóa học này. Hệ thống sẽ ghi nhận tức thì trong bảng thông báo cá nhân..."
                          className="w-full text-xs px-3 py-2 border rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          required
                        />
                      </div>

                      <button type="submit" className="w-full bg-stone-900 text-white py-2.5 rounded-xl font-bold hover:bg-stone-850 duration-150 flex items-center justify-center gap-1.5 shadow-sm text-xs">
                        <Plus className="w-4 h-4 text-teal-400" /> Phát hành công văn / bảng tin tới học viên
                      </button>
                    </form>

                    {/* Notifications logs inventory */}
                    <div className="lg:col-span-7 space-y-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-3xs">
                      <div className="flex justify-between items-center border-b pb-2.5">
                        <h4 className="font-extrabold text-[#2a4d9c] text-xs flex items-center gap-1">
                          🔔 Bảng tin đã phát hành cho học viên ({notifications.length})
                        </h4>
                        <span className="text-[10px] text-stone-400">Đẩy thời gian thực</span>
                      </div>

                      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                        {notifications.length === 0 ? (
                          <div className="py-12 text-center text-stone-400 font-bold bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                            Chưa có thông báo nào được tạo lập phát sóng.
                          </div>
                        ) : (
                          notifications.map((n) => {
                            const targetCourse = courses.find(course => course.id === n.targetCourseId);
                            let typeBg = 'bg-blue-50 border-blue-200 text-blue-800';
                            let emoji = 'ℹ️';
                            if (n.type === 'success') { typeBg = 'bg-emerald-50 border-emerald-200 text-emerald-800'; emoji = '✅'; }
                            if (n.type === 'warning') { typeBg = 'bg-amber-50 border-amber-200 text-amber-800'; emoji = '⚠️'; }
                            if (n.type === 'reminder') { typeBg = 'bg-rose-50 border-rose-200 text-rose-800'; emoji = '🔔'; }

                            return (
                              <div key={n.id} className="p-3.5 border rounded-xl bg-white hover:bg-stone-50 duration-100 flex justify-between items-start text-xs border-stone-200 relative group text-left">
                                <div className="space-y-1.5 max-w-[85%]">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black flex items-center gap-1 ${typeBg}`}>
                                      <span>{emoji}</span> {n.type.toUpperCase()}
                                    </span>
                                    {n.targetCourseId ? (
                                      <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 text-[9px] font-black px-1.5 py-0.5 rounded-md truncate max-w-[150px] inline-block" title={targetCourse?.title}>
                                        🎯 Khóa: {targetCourse?.title || n.targetCourseId}
                                      </span>
                                    ) : (
                                      <span className="bg-stone-100 text-stone-605 border text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                                        🌍 Toàn sàn (All)
                                      </span>
                                    )}
                                    <span className="text-[9px] text-stone-400 font-bold">{n.date}</span>
                                  </div>
                                  <h5 className="font-extrabold text-stone-850 text-xs leading-snug mt-1">{n.title}</h5>
                                  <p className="text-[11px] text-stone-600 font-medium leading-relaxed">{n.message}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm('Bạn có chắc muốn thu hồi / gỡ bỏ bảng tin thông báo tuyển sinh này?')) {
                                      if (onUpdateNotifications) {
                                        onUpdateNotifications(notifications.filter(item => item.id !== n.id));
                                        alert('✓ Thu hồi thành công!');
                                      }
                                    }
                                  }}
                                  className="p-1 px-1.5 rounded bg-stone-50 text-stone-400 hover:text-red-600 hover:bg-red-50 text-[10px] font-bold duration-150 shrink-0"
                                  title="Gỡ thông báo"
                                >
                                  Gỡ
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            })()}
          </div>
        )}

        {/* TAB: QUẢN LÝ BANNER & TRANG CHỦ */}
        {activeTab === 'banners_management' && (
          <div className="space-y-6 animate-fade-in text-xs text-left">
            <div className="border-b pb-3 border-stone-200">
              <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1.5">
                <Image className="w-5 h-5 text-amber-700 font-bold" />
                Quản lý Banner & Khuyến mại Trang chủ
              </h3>
              <p className="text-stone-500 text-[11px]">Thiết kế các biểu ngữ trượt (Homepage Carousel) để thông báo sự kiện, điều hướng chiến dịch hoặc thu hút học viên đăng ký chương trình học mới.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form to Create/Edit Banner */}
              <form onSubmit={handleCreateOrUpdateBanner} className="lg:col-span-5 border border-brand-light-active bg-white p-5 rounded-2xl space-y-4 shadow-3xs">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-extrabold text-sm text-brand-dark">
                    {editingBannerId ? `Hiệu chỉnh Banner (#${editingBannerId.split('-').pop()})` : 'Tạo mới Banner quảng bá'}
                  </h4>
                  {editingBannerId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBannerId(null);
                        setBannerForm({
                          title: '',
                          subtitle: '',
                          imageUrl: 'https://images.unsplash.com/photo-1541829019-259276a7f013?auto=format&fit=crop&q=80&w=600',
                          actionText: 'Học Ngay',
                          actionUrl: '#courses-section',
                          isActive: true,
                          backgroundColor: '#fcf8f2',
                          textColor: '#432c28',
                          accentColor: '#bc6c25',
                          themeName: 'Amber'
                        });
                      }}
                      className="text-stone-500 hover:text-stone-900 border px-2 py-0.5 rounded-lg text-[10px] font-bold"
                    >
                      Hủy để tạo mới
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">Tiêu đề biểu ngữ (Title):</label>
                    <input
                      type="text"
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                      placeholder="Vd: Ưu đãi học phí hè 2026 đợt 1"
                      className="w-full text-xs px-3 py-2 border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-stone-905 border-stone-250 text-stone-800 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">Dòng phụ đề ngắn (Subtitle):</label>
                    <textarea
                      value={bannerForm.subtitle}
                      onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                      placeholder="Mô tả tóm tắt giá trị / quyền lợi của chương trình"
                      rows={2}
                      className="w-full text-xs px-3 py-2 border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-stone-905 border-stone-250 text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">Đường dẫn hình ảnh minh họa (Image URL):</label>
                    <input
                      type="text"
                      value={bannerForm.imageUrl}
                      onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                      placeholder="Địa chỉ ảnh Unsplash có sẵn..."
                      className="w-full text-xs px-3 py-1.5 border rounded-xl focus:outline-hidden border-stone-250 font-mono text-[10px]"
                    />
                    
                    {/* Presets Grid */}
                    <div className="mt-1.5">
                      <span className="text-[10px] text-stone-400 font-bold block mb-1">Gợi ý hình ảnh quán học (Cafe Cozy Presets):</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { url: 'https://images.unsplash.com/photo-1541829019-259276a7f013?auto=format&fit=crop&q=80&w=600', label: 'Laptop & Cafe' },
                          { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600', label: 'Bàn code chuyên nghiệp' },
                          { url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600', label: 'Thảo luận ấm cúng' }
                        ].map((p, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setBannerForm({ ...bannerForm, imageUrl: p.url })}
                            className={`border rounded-lg p-0.5 text-left duration-100 overflow-hidden relative group h-12 flex flex-col justify-end ${bannerForm.imageUrl === p.url ? 'border-amber-700 bg-amber-50' : 'border-stone-200 hover:border-amber-400'}`}
                          >
                            <img src={p.url} className="w-full h-full object-cover absolute inset-0 opacity-80 group-hover:opacity-100" />
                            <div className="absolute inset-0 bg-stone-900/40"></div>
                            <span className="relative z-10 text-[8.5px] text-white px-1 leading-tight font-bold truncate block w-full">{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bg Gradient/Theme Accent Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">Phong cách phối màu (Theme accent Preset):</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { name: 'Amber', bg: '#fcf8f2', text: '#432c28', acc: '#bc6c25' },
                        { name: 'Teal', bg: '#eefdfb', text: '#114b43', acc: '#0d9488' },
                        { name: 'Studio', bg: '#ebeffd', text: '#1a203c', acc: '#4f46e5' },
                        { name: 'Neutral', bg: '#f5f5f4', text: '#2d2c2a', acc: '#44403c' }
                      ].map((accent, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setBannerForm({
                            ...bannerForm,
                            backgroundColor: accent.bg,
                            textColor: accent.text,
                            accentColor: accent.acc,
                            themeName: accent.name
                          })}
                          className={`border rounded-xl px-1 py-1.5 text-center font-bold text-[9px] duration-100 ${bannerForm.backgroundColor === accent.bg ? 'border-amber-700 bg-amber-50/50' : 'border-stone-200 bg-white hover:bg-stone-50'}`}
                        >
                          <span className="block w-4 h-4 rounded-full mx-auto mb-0.5 shadow-3xs" style={{ backgroundColor: accent.bg, border: `1px solid ${accent.acc}` }} />
                          <span className="text-[8px] text-stone-605 block scale-90">{accent.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Banner Actions Configuration */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-150 space-y-2.5">
                    <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">Thiết lập Hành động khi học viên Click</span>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">Kiểu đường dẫn / Đích đến (Action URL):</label>
                      <div className="flex gap-1.5 mb-2">
                        <button
                          type="button"
                          onClick={() => setBannerForm({ ...bannerForm, actionUrl: '#courses-section' })}
                          className={`px-2 py-1 rounded border text-[9px] font-bold ${bannerForm.actionUrl.startsWith('#') ? 'bg-amber-100 border-amber-600 text-amber-900' : 'bg-white text-stone-605'}`}
                        >
                          # Cuộn tới
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerForm({ ...bannerForm, actionUrl: 'Development' })}
                          className={`px-2 py-1 rounded border text-[9px] font-bold ${categoryTree.some(cat => cat.name === bannerForm.actionUrl) ? 'bg-teal-50 border-teal-600 text-teal-900' : 'bg-white text-stone-605'}`}
                        >
                          📁 Danh mục
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerForm({ ...bannerForm, actionUrl: 'https://mindhub.edu.vn/' })}
                          className={`px-2 py-1 rounded border text-[9px] font-bold ${bannerForm.actionUrl.startsWith('http') ? 'bg-indigo-50 border-indigo-600 text-indigo-900' : 'bg-white text-stone-605'}`}
                        >
                          🔗 Mở Link URL
                        </button>
                      </div>

                      {categoryTree.some(cat => cat.name === bannerForm.actionUrl) ? (
                        <select
                          value={bannerForm.actionUrl}
                          onChange={(e) => setBannerForm({ ...bannerForm, actionUrl: e.target.value })}
                          className="w-full text-xs bg-white border rounded-lg px-2.5 py-1.5 focus:outline-hidden"
                        >
                          {categoryTree.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={bannerForm.actionUrl}
                          onChange={(e) => setBannerForm({ ...bannerForm, actionUrl: e.target.value })}
                          placeholder="Nhập anchor ví dụ #courses-section hoặc URL..."
                          className="w-full text-xs px-2.5 py-1.5 border bg-white rounded-lg focus:outline-hidden border-stone-250 font-mono text-[10px]"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 mb-0.5">Nhãn nút hành động:</label>
                        <input
                          type="text"
                          value={bannerForm.actionText}
                          onChange={(e) => setBannerForm({ ...bannerForm, actionText: e.target.value })}
                          placeholder="Học Ngay"
                          className="w-full text-xs px-2 py-1.5 border bg-white rounded-lg focus:outline-hidden border-stone-250 font-bold"
                        />
                      </div>
                      
                      <div className="flex items-center justify-center pt-3.5">
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={bannerForm.isActive}
                            onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                            className="rounded text-amber-700 focus:ring-amber-500 w-3.5 h-3.5"
                          />
                          <span className="text-[11px] font-bold text-stone-700">Hiển thị (Active)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full bg-stone-900 text-white py-2.5 rounded-xl font-bold hover:bg-stone-800 duration-150 flex items-center justify-center gap-1 text-[11px]">
                    {editingBannerId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingBannerId ? 'Cập nhật Thay đổi Banner' : 'Phát hành Banner lên Slide Trang chủ'}
                  </button>
                </div>
              </form>

              {/* List of Current Banners */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-extrabold text-[#783c12] flex items-center gap-2">
                    <span>Hệ thống Carousel Banner Đang Chạy ({banners.length})</span>
                  </h4>
                  <span className="text-stone-400 text-[10px] italic">Bản đồ lướt carousel sẽ tự động lướt sau mỗi 6 giây bên giao diện học viên.</span>
                </div>

                <div className="space-y-3.5 max-h-[650px] overflow-y-auto pr-1">
                  {banners.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-2xl bg-stone-50">
                      <Image className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                      <p className="text-stone-500 font-bold text-xs">Hiện tại chưa thiết lập banner ngoài trang chủ.</p>
                    </div>
                  ) : (
                    banners.map((b) => (
                      <div 
                        key={b.id} 
                        className={`border rounded-2xl p-4 transition-all duration-150 flex flex-col sm:flex-row gap-4 bg-white hover:shadow-xs justify-between items-start ${b.isActive ? 'border-amber-250 shadow-3xs' : 'border-stone-200 opacity-65 bg-stone-50/50'}`}
                        style={{ borderLeft: b.isActive ? `4px solid ${b.accentColor}` : undefined }}
                      >
                        {/* Banner Card Preview */}
                        <div className="flex-1 flex gap-3 items-start text-left">
                          <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 border relative bg-stone-100">
                            {b.imageUrl ? (
                              <img src={b.imageUrl} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400">Không ảnh</div>
                            )}
                            <div className="absolute top-1 left-1 bg-stone-900/70 text-white text-[8px] px-1 rounded font-mono font-black">
                              {b.isActive ? 'BẬT' : 'TẮT'}
                            </div>
                          </div>

                          <div className="space-y-1 text-left flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-stone-850 text-[12px]">{b.title}</span>
                              <span className="text-[8.5px] bg-stone-100 text-stone-600 border px-1.5 py-0.2 rounded-md font-mono">ID: {b.id.split('-').pop()}</span>
                            </div>
                            
                            {b.subtitle && (
                              <p className="text-stone-500 text-[10.5px] line-clamp-1">{b.subtitle}</p>
                            )}

                            {/* Action Summary */}
                            <div className="flex items-center gap-1.5 text-[10px] text-stone-605 flex-wrap">
                              <span className="font-bold text-amber-900 bg-amber-50 px-1.5 py-0.3 rounded text-[9px] border border-amber-100">Nút nhãn: "{b.actionText}"</span>
                              <span className="text-stone-400">|</span>
                              <span className="font-semibold text-stone-605">Đích đến hành động: <code className="bg-stone-50 px-1 py-0.3 rounded border text-[9px] font-mono">{b.actionUrl}</code></span>
                            </div>

                            {/* Style Preset Badges */}
                            <div className="flex gap-1.5 pt-1">
                              <span className="text-[8.5px] font-bold px-1.5 py-0.3 rounded-sm border" style={{ backgroundColor: b.backgroundColor, color: b.textColor }}>Nền mộc ({b.backgroundColor === '#eefdfb' ? 'Teal' : b.backgroundColor === '#ebeffd' ? 'Studio' : b.backgroundColor === '#f5f5f4' ? 'Neutral' : 'Amber'})</span>
                              <span className="text-[8.5px] font-bold px-1.5 py-0.3 rounded-sm border" style={{ borderColor: b.accentColor, color: b.accentColor }}>Điểm nhấn</span>
                            </div>
                          </div>
                        </div>

                        {/* Banner Management Actions */}
                        <div className="flex sm:flex-col justify-end gap-2 w-full sm:w-auto self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleBannerStatus(b.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 ${b.isActive ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                          >
                            {b.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          </button>

                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditBannerClick(b)}
                              className="bg-stone-50 hover:bg-stone-100 border p-1.5 rounded-lg text-stone-605 hover:text-stone-900 shrink-0"
                              title="Chỉnh sửa Banner"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBanner(b.id)}
                              className="bg-red-50 hover:bg-red-100 border border-red-200 p-1.5 rounded-lg text-red-700 shrink-0"
                              title="Xóa Banner"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'account_requests' && (
          <div className="space-y-4 animate-fade-in text-xs text-left">
            <div className="border-b pb-3">
              <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1.5">
                <UserX className="w-5 h-5 text-red-700 animate-pulse" />
                Yêu cầu Khóa & Xóa tài khoản học viên (Admin Panel)
              </h3>
              <p className="text-stone-400 text-[11px]">
                Xem xét, phê duyệt hoặc từ khước các đề xuất vô hiệu hóa tài khoản và xóa hoàn toàn thông tin học lực cá nhân theo đúng luật lưu trữ.
              </p>
            </div>

            {accountRequests.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-2xl bg-slate-50">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-xs text-main-normal">Hệ thống trong sạch, chưa ghi nhận yêu cầu hủy tài khoản nào.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {accountRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className={`border p-4 rounded-2xl bg-white shadow-3xs flex flex-col md:flex-row justify-between gap-4 items-start md:items-center transition-all ${
                      req.status === 'approved' ? 'border-emerald-200 bg-emerald-50/10' :
                      req.status === 'rejected' ? 'border-stone-200 bg-stone-50/30' : 'border-red-200 bg-red-50/10'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{req.userName}</span>
                        <span className="text-stone-400 font-mono">({req.userEmail})</span>
                        <span className={`text-[9.5px] font-mono font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                          req.type === 'delete' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.type === 'delete' ? '🚨 Xóa Vĩnh Viễn' : '⏳ Tạm Khóa'}
                        </span>
                        
                        <span className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'rejected' ? 'bg-stone-200 text-stone-605' : 'bg-red-105 text-red-600 border border-red-200'
                        }`}>
                          {req.status === 'approved' ? 'Chấp Thuận' : req.status === 'rejected' ? 'Từ Chối' : 'Chờ Thẩm Định'}
                        </span>
                      </div>

                      <div className="text-[11px] text-stone-600 bg-slate-50/80 p-3 rounded-xl border mt-2">
                        <span className="font-extrabold text-stone-700 block mb-0.5">Lý do học sinh yêu cầu giải tỏa:</span>
                        <p className="italic font-sans leading-relaxed">"{req.reason}"</p>
                      </div>

                      <div className="text-[9px] text-stone-400 font-mono pt-1">
                        Thời điểm: {new Date(req.timestamp).toLocaleString('vi-VN')}
                      </div>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex gap-2 self-end md:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            handleResolveAccountRequest(req.id, 'approved');
                            // Ban the actual user in state list if approved layout
                            setBannedUserIds(prev => [...prev, req.userId]);
                            alert(`✓ Đã duyệt đề xuất và đình chỉ truy cập đối với thành phần học viên: ${req.userName}.`);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3.5 rounded-xl text-xs flex items-center gap-1 shadow-3xs text-[10.5px]"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Phê Duyệt Đình Bản
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleResolveAccountRequest(req.id, 'rejected');
                            alert(`✓ Đã từ chối đơn hủy của học viên ${req.userName}. Tài khoản giữ nguyên bình thường.`);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 shadow-3xs text-[10.5px]"
                        >
                          Từ Chối Gửi Trả
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

          {/* TAB 10: AUDIT LOGS */}
        {activeTab === 'instructor_requests' && (
          <div className="space-y-4 animate-fade-in text-xs text-left">
            <div className="border-b pb-3">
              <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-amber-600" />
                Yêu cầu liên quan đến Giảng viên
              </h3>
              <p className="text-stone-400 text-[11px]">
                Xem xét, phê duyệt các yêu cầu đăng ký làm giảng viên hoặc ngừng giảng dạy.
              </p>
            </div>

            {instructorRequests.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-2xl bg-slate-50">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-xs text-main-normal">Chưa có yêu cầu nào.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {instructorRequests.map((req) => (
                  <div key={req.id} className="border p-4 rounded-xl bg-white shadow-3xs flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{req.fullName} <span className="text-stone-500 font-normal text-xs">({req.email})</span></h4>
                          {req.requestType === 'leave_instructor' && (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-md">Xin ngừng giảng dạy</span>
                          )}
                        </div>
                        {req.requestType !== 'leave_instructor' && (
                          <>
                            <p className="text-stone-500 text-xs mt-1">SĐT: {req.phone} • Kinh nghiệm: {req.experienceYears}</p>
                            <p className="text-stone-500 text-xs">Lĩnh vực: <span className="font-semibold">{req.expertise}</span></p>
                          </>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {req.status === 'pending' ? 'Đang chờ' : req.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                      </span>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-lg text-xs text-stone-700">
                      {req.requestType === 'leave_instructor' ? (
                        <>
                          <p className="font-semibold mb-1 text-rose-700">Lý do ngừng giảng dạy:</p>
                          <p className="italic">{req.reason}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold mb-1">Giới thiệu:</p>
                          <p className="italic">{req.bio}</p>
                          {req.portfolioUrl && (
                            <p className="mt-2"><span className="font-semibold">Portfolio:</span> <a href={req.portfolioUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">{req.portfolioUrl}</a></p>
                          )}
                        </>
                      )}
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex justify-end gap-2 mt-2">
                        <button 
                          onClick={() => handleResolveInstructorRequest(req.id, 'reject', 'Không đủ điều kiện')}
                          className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-semibold"
                        >Từ chối</button>
                        <button 
                          onClick={() => handleResolveInstructorRequest(req.id, 'approve')}
                          className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-semibold"
                        >Phê duyệt</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 10: AUDIT LOGS */}
        {activeTab === 'audits_logs' && (
          <div className="space-y-4 animate-fade-in text-xs text-left">
            <div className="border-b pb-3">
              <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-stone-850" /> Nhật ký Audit Logs Hệ thống
              </h3>
              <p className="text-stone-400 text-[11px]">Hồ sơ truy vết các thao tác quản trị viên bất biến bảo vệ an ninh học trình toàn bộ cơ sở hạ tầng.</p>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {AUDIT_LOGS_MOCK.map((log) => (
                <div key={log.id} className="border p-3 rounded-xl bg-slate-50 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-extrabold uppercase text-[#8b5e3c] bg-[#8b5e3c]/10 px-2 py-0.5 rounded">{log.action}</span>
                    <span className="font-mono text-gray-400">{log.timestamp}</span>
                  </div>
                  <p className="text-stone-700 font-bold">Thực thi bởi: <b>{log.userName}</b> ({log.userRole.toUpperCase()})</p>
                  <p className="text-[11px] text-stone-500 pl-3 border-l-2 border-stone-350 italic">» {log.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 11: MODERATOR CONTROLS */}
        {activeTab === 'moderator_controls' && (
          <div className="space-y-4 animate-fade-in text-xs text-left">
            <ModeratorTab 
              currentUser={currentUser}
              courses={courses}
              flaggedReviews={flaggedReviews}
              onApproveCourse={onApproveCourse}
              onRejectCourse={onRejectCourse}
              onResolveFlag={onResolveFlag}
              accountRequests={accountRequests}
              onResolveAccountRequest={handleResolveAccountRequest}
              onClose={() => setActiveTab('general_admin')}
            />
          </div>
        )}

        {/* TAB 12: DEVELOPER BACKEND INTEGRATION PANEL REMOVED */}
        {activeTab === 'api_config' && (
          <div className="hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-indigo-100 pb-3">
              <div>
                <h3 className="text-base font-display font-black text-[#5c3a21] flex items-center gap-1.5">
                  <Settings className="w-5 h-5 text-[#8b5e3c] animate-spin" style={{ animationDuration: '6s' }} /> Cấu Hình Kết Nối Backend API Thật
                </h3>
                <p className="text-stone-500 text-[11px] mt-0.5">Chuẩn bị tích hợp, cấu hình địa chỉ endpoint và kiểm tra luồng truyền nhận tải dữ liệu của hệ thống.</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${apiModeState === 'api' ? 'bg-[#8b5e3c] text-white animate-pulse' : 'bg-amber-100 text-amber-800'}`}>
                Trạng thái: {apiModeState === 'api' ? '🔌 KẾT NỐI API THẬT' : '📦 MOCK MODE (LOCAL)'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Config Panel */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-4">
                  <h4 className="font-bold text-stone-800 text-xs">Phím điều khiển Tích Hợp</h4>
                  
                  {/* Mode Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-stone-600">Luồng lưu chuyển dữ liệu:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          ApiService.setMode('mock');
                          setApiModeState('mock');
                          alert('Đã kích hoạt chế độ Giả lập (Mock Mode). Toàn bộ dữ liệu nằm cục bộ trong trình duyệt.');
                        }}
                        className={`py-2 rounded-xl text-center font-bold border transition-all ${apiModeState === 'mock' ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-stone-50 hover:bg-stone-100 text-stone-600'}`}
                      >
                        📦 Giả lập Mock
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          ApiService.setMode('api');
                          setApiModeState('api');
                          alert(`Đã bật chế độ API thật! Trình duyệt sẽ gửi Request trực tiếp tới địa chỉ: ${apiBaseUrlState} \n\nHãy đảm bảo bạn đã cấu hình CORS và kích hoạt Backend server của bạn.`);
                        }}
                        className={`py-2 rounded-xl text-center font-bold border transition-all ${apiModeState === 'api' ? 'bg-indigo-50 border-indigo-400 text-indigo-800' : 'bg-stone-50 hover:bg-stone-100 text-stone-600'}`}
                      >
                        🔌 Gửi API Thật
                      </button>
                    </div>
                  </div>

                  {/* Base URL */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-stone-600">Đường dẫn gốc Backend (API Base URL):</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={apiBaseUrlState}
                        onChange={(e) => setApiBaseUrlState(e.target.value)}
                        placeholder="http://localhost:3000/api"
                        className="flex-1 p-2 border rounded-xl font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!apiBaseUrlState.trim()) return;
                          ApiService.setBaseUrl(apiBaseUrlState.trim());
                          alert('Đã cập nhật base URL kết nối Backend thành công!');
                        }}
                        className="bg-[#8b5e3c] hover:bg-[#724c30] text-white font-bold py-2 px-3 rounded-xl transition-all"
                      >
                        Lưu
                      </button>
                    </div>
                    <span className="text-[10px] text-stone-450 block leading-tight">Yêu cầu giao thức HTTP/HTTPS. Hãy cấu hình CORS trên backend để chấp nhận domain trình duyệt hiện tại.</span>

                    {/* Connection Tester */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={testResult.status === 'testing'}
                        className={`w-full py-1.5 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 text-[11px] ${
                          testResult.status === 'testing'
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {testResult.status === 'testing' ? (
                          <>
                            <span className="w-3 h-3 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                            Đang kết nối...
                          </>
                        ) : (
                          '⚡ Kiểm Tra Kết Nối Backend'
                        )}
                      </button>

                      {testResult.status !== 'idle' && (
                        <div className={`mt-2 p-2.5 rounded-xl text-[10.5px] border leading-relaxed ${
                          testResult.status === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 animate-fade-in'
                            : 'bg-red-50 border-red-200 text-red-800 animate-fade-in'
                        }`}>
                          <div className="flex justify-between items-center font-bold mb-0.5">
                            <span>{testResult.status === 'success' ? '✅ KẾT NỐI THÀNH CÔNG' : '❌ KẾT NỐI THẤT BẠI'}</span>
                            {testResult.latency !== undefined && (
                              <span className="font-mono text-[9.5px] bg-white/60 px-1 py-0.5 rounded border">
                                Latency: {testResult.latency}ms
                              </span>
                            )}
                          </div>
                          <p>{testResult.message}</p>
                          {testResult.status === 'failed' && (
                            <p className="text-[9.5px] text-red-600 mt-1 font-bold">
                              * Hãy chắc chắn backend đang hoạt động, CORS được cấu hình đúng và không bị chặn Mixed Content.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Mixed Content & Failed to fetch Troubleshooting Info Box */}
                    <div className="mt-3 bg-stone-50 border border-stone-200 p-3 rounded-xl text-stone-700 space-y-1.5 animate-fade-in">
                      <div className="flex items-center gap-1.5 text-[#8b5e3c] font-bold text-[11px]">
                        <span>💡</span> Mẹo Khắc Phục Lỗi "Failed to Fetch" (Mixed Content / CORS)
                      </div>
                      <p className="text-[10px] text-stone-600 leading-relaxed">
                        Ứng dụng của bạn đang chạy qua <b>HTTPS bảo mật</b>. Trình duyệt hiện đại sẽ chặn toàn bộ các yêu cầu AJAX gọi đến địa chỉ <b>HTTP không bảo mật</b> (như <code className="bg-white px-1 py-0.5 rounded border text-stone-700">http://localhost:8000/api</code>) do cơ chế Mixed Content.
                      </p>
                      <div className="text-[10px] space-y-1 pl-1 text-stone-600">
                        <div>• <b>Phương án 1 (Khuyên dùng):</b> Tạo đường hầm HTTPS bằng <a href="https://ngrok.com" target="_blank" rel="noreferrer" className="text-[#8b5e3c] hover:underline font-bold">ngrok</a> cực nhanh qua terminal máy tính của bạn:</div>
                        <div className="bg-stone-900 text-stone-100 p-1.5 rounded font-mono text-[9px] select-all my-1 text-center font-bold">
                          ngrok http 8000
                        </div>
                        <div>Sau đó copy địa chỉ HTTPS ngrok cung cấp (ví dụ: <code className="bg-white px-1 py-0.5 rounded border text-stone-700">https://xxxx.ngrok-free.app/api</code>) dán vào ô <b>API Base URL</b> ở trên và lưu lại.</div>
                        <div className="pt-1">• <b>Phương án 2:</b> Kích hoạt SSL/HTTPS trên Laragon hoặc Laravel của bạn để gọi bằng URL <code className="bg-white px-1 py-0.5 rounded border text-stone-700">https://mindhub.test/api</code>.</div>
                      </div>
                    </div>
                  </div>

                  {/* Auth Token Token */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-stone-600">Token bảo mật ủy quyền (Authorization Token):</label>
                    <input
                      type="text"
                      defaultValue={localStorage.getItem('mindhub_api_token') || ''}
                      onChange={(e) => {
                        localStorage.setItem('mindhub_api_token', e.target.value);
                      }}
                      placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                      className="w-full p-2 border rounded-xl font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-[10px] text-stone-400 block leading-tight">Sẽ được tự động gửi đi trong Header yêu cầu dưới dạng: <code className="bg-stone-100 p-0.5 rounded text-red-500 font-mono">Authorization: Bearer [token]</code></span>
                  </div>
                </div>

                {/* API Specs for Developers */}
                <div className="bg-stone-950 text-stone-200 border border-stone-900 rounded-2xl p-4 space-y-3.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1">📋 Đặc tả kỹ thuật Request/Response</h4>
                  <p className="text-[10.5px] text-stone-300">Backend của bạn cần triển khai tối thiểu các endpoint sau:</p>
                  
                  <div className="space-y-2 font-mono text-[10px]">
                    <div className="p-2 bg-black/30 rounded border border-indigo-950">
                      <div className="flex justify-between font-bold text-emerald-400">
                        <span>GET /api/courses</span>
                        <span className="text-[9px] bg-emerald-500/10 px-1 rounded">PUBLIC hoặc ADMIN</span>
                      </div>
                      <p className="text-[9px] text-stone-300 mt-0.5">Lấy danh sách các khóa học hiện hành.</p>
                    </div>

                    <div className="p-2 bg-black/30 rounded border border-indigo-950">
                      <div className="flex justify-between font-bold text-amber-400">
                        <span>POST /api/courses</span>
                        <span className="text-[9px] bg-amber-500/10 px-1 rounded">INSTRUCTOR</span>
                      </div>
                      <p className="text-[9px] text-stone-300 mt-0.5">Tạo bản nháp khóa học (Course Draft) mới.</p>
                    </div>

                    <div className="p-2 bg-black/30 rounded border border-indigo-950">
                      <div className="flex justify-between font-bold text-sky-400">
                        <span>PUT /api/courses/:id/chapters</span>
                        <span className="text-[9px] bg-sky-500/10 px-1 rounded">INSTRUCTOR</span>
                      </div>
                      <p className="text-[9px] text-stone-300 mt-0.5">Lưu đồng bộ toàn bộ chương học & bài học video của giảng viên.</p>
                    </div>

                    <div className="p-2 bg-black/30 rounded border border-indigo-950">
                      <div className="flex justify-between font-bold text-pink-400">
                        <span>POST /api/media/upload-video</span>
                        <span className="text-[9px] bg-pink-500/10 px-1 rounded">MULTIPART FORM</span>
                      </div>
                      <p className="text-[9px] text-stone-300 mt-0.5">Nhận file video bài giảng, chuyển mã adaptive HLS rồi trả về m3u8 stream.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Console/Traffic logs */}
              <div className="lg:col-span-7 flex flex-col space-y-4 min-h-[450px]">
                <div className="flex-1 bg-stone-900 text-stone-200 border border-stone-800 rounded-2xl p-4 flex flex-col font-mono">
                  <div className="flex justify-between items-center border-b border-stone-850 pb-2 mb-3">
                    <span className="text-stone-400 text-[11px] font-bold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Virtual API Traffic Console
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        ApiService.clearVirtualLogs();
                        setVirtualLogs([]);
                      }}
                      className="text-stone-450 hover:text-white text-[10px] font-bold border border-stone-700 px-2 py-0.5 rounded transition-colors"
                    >
                      Clear Logs
                    </button>
                  </div>

                  {/* Terminal Area */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[380px] text-[10.5px]">
                    {virtualLogs.length === 0 ? (
                      <div className="text-stone-500 italic text-center pt-10 text-[11px]">
                        Chưa ghi nhận tín hiệu truyền thông API HTTP nào.<br/>
                        Hãy tạo bản nháp khóa học, thêm chương, hoặc tải video khóa học để theo dõi Request tải lên.
                      </div>
                    ) : (
                      virtualLogs.map((log) => (
                        <div key={log.id} className="border-b border-stone-850 pb-2 space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-indigo-400 font-bold">[{log.time}] [{log.category}]</span>
                            <span className={`px-1 rounded text-[9px] font-bold ${log.mode === 'api' ? 'bg-[#8b5e3c]/30 text-indigo-300' : 'bg-amber-600/20 text-amber-400'}`}>
                              {log.mode.toUpperCase()} MODE
                            </span>
                          </div>
                          <p className="text-emerald-400 font-bold">Action: {log.action}</p>
                          {log.payload && (
                            <pre className="p-2 bg-stone-950/80 border border-stone-850 rounded text-[9.5px] text-sky-305 max-h-36 overflow-y-auto overflow-x-auto whitespace-pre">
                              {log.payload}
                            </pre>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* API Ready Validation Alert */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-start gap-2.5">
                  <span className="text-[#8b5e3c] text-sm mt-0.5">ℹ</span>
                  <div className="space-y-1 leading-relaxed text-[#5c3a21]">
                    <p className="font-bold">Lưu ý cho đội ngũ lập trình Backend:</p>
                    <p>Toàn bộ lớp dữ liệu UI của MindHub (như Video, Thỏa thuận, Bài thi thử, Chứng chỉ PDF, Khảo nghiệm câu trả lời) đã được chuẩn bị chu đáo để hỗ trợ CORS. Nhấp chọn chế độ 'Gửi API thật' rồi cấu hình Base URL là toàn bộ ứng dụng sẽ bắt đầu giao tiếp đồng bộ trực tiếp!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: KHÓA GIẢNG VIÊN VÀ XỬ LÝ KHÓA HỌC */}
      {lockingInstructor && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative overflow-hidden animate-fade-in">
            <button onClick={() => setLockingInstructor(null)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800">
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-display font-bold text-main-normal flex items-center gap-2 mb-2">
              <ShieldAlert className="w-6 h-6 text-red-600" />
              Khóa tài khoản Giảng viên
            </h2>
            <p className="text-stone-500 text-sm mb-6">
              Bạn đang thao tác khóa tài khoản giảng viên <span className="font-bold text-stone-800">{lockingInstructor.name}</span>. 
              Vui lòng chọn hướng xử lý đối với các khóa học hiện tại do giảng viên này quản lý.
            </p>

            <div className="space-y-4 mb-6">
              <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
                <input 
                  type="radio" 
                  name="courseAction" 
                  value="hide"
                  checked={lockingCourseAction === 'hide'}
                  onChange={() => setLockingCourseAction('hide')}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-sm text-stone-800">Ẩn khóa học</div>
                  <div className="text-xs text-stone-500">Gỡ khóa học khỏi hiển thị công cộng, nhưng học viên đã mua vẫn xem được nội dung.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
                <input 
                  type="radio" 
                  name="courseAction" 
                  value="pending"
                  checked={lockingCourseAction === 'pending'}
                  onChange={() => setLockingCourseAction('pending')}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-sm text-stone-800">Chuyển sang trạng thái "Chờ duyệt"</div>
                  <div className="text-xs text-stone-500">Khóa học sẽ cần được quản trị viên kiểm tra và phê duyệt lại trước khi xuất bản.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
                <input 
                  type="radio" 
                  name="courseAction" 
                  value="archive"
                  checked={lockingCourseAction === 'archive'}
                  onChange={() => setLockingCourseAction('archive')}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-sm text-stone-800">Lưu trữ khóa học (Archive)</div>
                  <div className="text-xs text-stone-500">Đóng vĩnh viễn khóa học. Học viên không thể đăng ký mới, nội dung bị đóng băng.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
                <input 
                  type="radio" 
                  name="courseAction" 
                  value="none"
                  checked={lockingCourseAction === 'none'}
                  onChange={() => setLockingCourseAction('none')}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-sm text-stone-800">Giữ nguyên hiển thị khóa học</div>
                  <div className="text-xs text-stone-500">Khóa học vẫn bán bình thường, không thay đổi trạng thái.</div>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <button 
                onClick={() => setLockingInstructor(null)} 
                className="px-5 py-2.5 rounded-xl font-bold border hover:bg-stone-50"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => executeBlockUser(lockingInstructor.id, lockingCourseAction)} 
                className="px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
              >
                Xác nhận khóa & Xử lý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT USER PROFILE (CONVERTED TO SUB-VIEW) */}
      {showUserModal && (
        <div className="absolute inset-0 bg-stone-50 z-[50] flex flex-col items-center justify-start py-10 px-4 overflow-y-auto tactile-scrollbar animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-left space-y-4 shadow-xl border animate-fade-in">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-sm text-stone-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-stone-850" />
                {editingUser ? 'Biên dịch Hồ sơ Thành viên' : 'Tạo người dùng'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-stone-400 hover:text-stone-700 text-xs font-bold">X Đóng</button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-605 mb-0.5">Tên hiển thị *:</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  placeholder="Vd: Nguyễn Đình Văn"
                  className="w-full p-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-605 mb-0.5">Email tài khoản *:</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  placeholder="name@email.com"
                  className="w-full p-2 border rounded-xl"
                  disabled={!!editingUser}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-605 mb-0.5">Vai trò hệ thống *:</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value as Role})}
                    className="w-full p-2 border rounded-xl"
                  >
                    <option value="student">student (Học sinh)</option>
                    <option value="instructor">instructor (Giảng viên)</option>
                    <option value="admin">admin (Quản trị cao cấp)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-605 mb-0.5">Số điện thoại:</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                    placeholder="Vd: 090123456"
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-605 mb-0.5">Học tập ngày liền (streak):</label>
                  <input
                    type="number"
                    value={userForm.streak}
                    onChange={(e) => setUserForm({...userForm, streak: parseInt(e.target.value) || 0})}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-605 mb-0.5">Ảnh Avatar URL:</label>
                  <input
                    type="text"
                    value={userForm.avatar}
                    onChange={(e) => setUserForm({...userForm, avatar: e.target.value})}
                    placeholder="Tùy chọn liên kết ảnh từ Unsplash"
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-605 mb-0.5 font-sans">Tiểu sử nghề (Bio):</label>
                <textarea
                  value={userForm.bio}
                  onChange={(e) => setUserForm({...userForm, bio: e.target.value})}
                  rows={2}
                  placeholder="Giới thiệu nhanh về chuyên môn của thành viên..."
                  className="w-full p-2 border rounded-xl resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t text-[11px]">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="border px-4 py-2 hover:bg-stone-50 rounded-xl font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="bg-stone-900 text-white font-bold px-5 py-2 hover:bg-stone-850 rounded-xl"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT COURSE DETAIL (CONVERTED TO SUB-VIEW) */}
      {showCourseModal && (
        <div className="absolute inset-0 bg-stone-50 z-[50] flex flex-col items-center justify-start py-10 px-4 overflow-y-auto tactile-scrollbar animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 text-left space-y-4 shadow-xl border animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-stone-750" />
                {editingCourse ? `Biên tập khóa: ${editingCourse.title}` : 'Khai sinh Khóa học mới'}
              </h3>
              <button onClick={() => setShowCourseModal(false)} className="text-stone-400 hover:text-stone-700 text-xs font-bold">X Đóng</button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              
              {/* Core Information */}
              <div className="space-y-3.5">
                <span className="font-black text-[11px] text-[#8b5e3c] uppercase block border-b pb-1">1. Thông tin tổng thể học trình</span>
                
                <div>
                  <label className="block font-bold text-stone-605 mb-0.5">Tiêu đề khóa học *:</label>
                  <input
                    type="text"
                    required
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                    placeholder="Vd: Chinh phục React 19 căn bản đến thực chiến nâng cao"
                    className="w-full p-2.5 border rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-605 mb-0.5">Học thuyết nhỏ (Subtitle / Khẩu hiệu):</label>
                  <input
                    type="text"
                    value={courseForm.subtitle}
                    onChange={(e) => setCourseForm({...courseForm, subtitle: e.target.value})}
                    placeholder="Vd: Nắm vững Server Actions, Forms validate và tư duy khai mở sản phẩm"
                    className="w-full p-2 border rounded-xl focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-605 mb-0.5">Danh mục học ngành (Level 1) *:</label>
                    <select
                      value={courseForm.category}
                      onChange={(e) => {
                        const targetCat = e.target.value;
                        const matchingNode = categoryTree.find(n => n.name === targetCat);
                        const firstSub = matchingNode && matchingNode.subcategories.length > 0 ? matchingNode.subcategories[0] : '';
                        setCourseForm({
                          ...courseForm, 
                          category: targetCat,
                          subcategory: firstSub
                        });
                      }}
                      className="w-full p-2 border rounded-xl"
                    >
                      {categoryTree.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-605 mb-0.5">Chuyên ngành định danh (Level 2) *:</label>
                    <select
                      value={courseForm.subcategory}
                      onChange={(e) => setCourseForm({...courseForm, subcategory: e.target.value})}
                      className="w-full p-2 border rounded-xl"
                    >
                      {(categoryTree.find(n => n.name === courseForm.category)?.subcategories || []).map((sub, idx) => (
                        <option key={idx} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-605 mb-0.5">Giảng viên giảng dạy *:</label>
                    <input
                      type="text"
                      required
                      value={courseForm.instructorName}
                      onChange={(e) => setCourseForm({...courseForm, instructorName: e.target.value})}
                      className="w-full p-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-605 mb-0.5">Liên kết Bìa (banner url):</label>
                    <input
                      type="text"
                      value={courseForm.image}
                      onChange={(e) => setCourseForm({...courseForm, image: e.target.value})}
                      className="w-full p-2 border rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & State */}
              <div className="space-y-3.5 pt-2">
                <span className="font-black text-[11px] text-[#8b5e3c] uppercase block border-b pb-1">2. Định giá & Trạng thái hoạt động</span>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-605 mb-0.5">Học phí gốc (VND) *:</label>
                    <input
                      type="text"
                      required
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({...courseForm, price: e.target.value.replace(/\D/g, '')})}
                      className="w-full p-2 border rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-605 mb-0.5">Học phí ưu đãi (VND, tùy chọn):</label>
                    <input
                      type="text"
                      value={courseForm.salePrice}
                      onChange={(e) => setCourseForm({...courseForm, salePrice: e.target.value.replace(/\D/g, '')})}
                      placeholder="Không ưu đãi thì để trống"
                      className="w-full p-2 border rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-605 mb-0.5">Trạng thái xuất bản *:</label>
                    <select
                      value={courseForm.status}
                      onChange={(e) => setCourseForm({...courseForm, status: e.target.value as any})}
                      className="w-full p-2 border rounded-xl"
                    >
                      <option value="active">Kích hoạt sẵn sàng (active)</option>
                      <option value="pending">Chờ phê thẩm định (pending)</option>
                      <option value="rejected">Bị từ từ khước (rejected)</option>
                      <option value="draft">Bản nháp bảo mật (draft)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Settings checklist */}
              <div className="space-y-3.5 pt-2">
                <span className="font-black text-[11px] text-[#8b5e3c] uppercase block border-b pb-1">3. Cấu hình kiểm duyệt nhanh</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 p-1 bg-stone-50 rounded-lg border">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={courseForm.isFeatured}
                        onChange={(e) => setCourseForm({...courseForm, isFeatured: e.target.checked})}
                        className="rounded text-stone-900 focus:ring-0 w-4 h-4 ml-2"
                      />
                      <label htmlFor="isFeatured" className="text-stone-760 text-[10.5px] font-bold">★ Cung cấp Nhãn NỔI BẬT toàn sàn</label>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-stone-50 rounded-lg border">
                      <input
                        type="checkbox"
                        id="isBestseller"
                        checked={courseForm.isBestseller}
                        onChange={(e) => setCourseForm({...courseForm, isBestseller: e.target.checked})}
                        className="rounded text-stone-900 focus:ring-0 w-4 h-4 ml-2"
                      />
                      <label htmlFor="isBestseller" className="text-stone-760 text-[10.5px] font-bold">🛒 Gắn nhãn BÁN CHẠY (Bestseller)</label>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-stone-50 rounded-lg border">
                      <input
                        type="checkbox"
                        id="isNew"
                        checked={courseForm.isNew}
                        onChange={(e) => setCourseForm({...courseForm, isNew: e.target.checked})}
                        className="rounded text-stone-900 focus:ring-0 w-4 h-4 ml-2"
                      />
                      <label htmlFor="isNew" className="text-stone-760 text-[10.5px] font-bold">🎉 Khóa học hoàn toàn MỚI (New)</label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 p-1 bg-stone-50 rounded-lg border">
                      <input
                        type="checkbox"
                        id="allowSkip"
                        checked={courseForm.allowSkip}
                        onChange={(e) => setCourseForm({...courseForm, allowSkip: e.target.checked})}
                        className="rounded text-stone-900 focus:ring-0 w-4 h-4 ml-2"
                      />
                      <label htmlFor="allowSkip" className="text-stone-760 text-[10.5px] font-bold">⏩ Cho phép tua vượt nhanh video</label>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-stone-50 rounded-lg border">
                      <input
                        type="checkbox"
                        id="giveCertificate"
                        checked={courseForm.giveCertificate}
                        onChange={(e) => setCourseForm({...courseForm, giveCertificate: e.target.checked})}
                        className="rounded text-stone-900 focus:ring-0 w-4 h-4 ml-2"
                      />
                      <label htmlFor="giveCertificate" className="text-stone-760 text-[10.5px] font-bold">📜 Cấp chứng nhận Tốt nghiệp khoá học</label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-605 mb-0.5">Giới thiệu tóm lược (Description):</label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                    rows={2.5}
                    placeholder="Mô tả kỹ nội dung biên soạn để học viên tham khảo trước khi giao dịch đóng học phí..."
                    className="w-full p-2 border rounded-xl resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t text-[11px]">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="border px-4 py-2 hover:bg-stone-50 rounded-xl font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="bg-[#8b5e3c] text-white font-bold px-5 py-2 hover:bg-[#5c3e21] rounded-xl duration-155"
                >
                  Lưu & Cập nhật bài học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Inline helper for cleanly dealing with pricing logic
function priceNumAndClean(p: any): number {
  return Number(p) || 0;
}


