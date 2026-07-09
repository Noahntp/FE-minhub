import re

with open('src/components/InstructorDashboard.tsx', 'r') as f:
    content = f.read()

# Conflict 1
c1_search = """<<<<<<< HEAD
  AlertTriangle, Play, HelpCircle, Lock, Sparkles, Upload, ArrowUp, ArrowDown, Shield, Key, Smartphone, Mail, X, List, AlertCircle, Search
=======
  AlertTriangle, Play, HelpCircle, Lock, Sparkles, Upload, ArrowUp, ArrowDown, Shield, Key, Smartphone, Mail, X, LayoutDashboard, Activity, MessageSquare
>>>>>>> develop"""
c1_replace = "  AlertTriangle, Play, HelpCircle, Lock, Sparkles, Upload, ArrowUp, ArrowDown, Shield, Key, Smartphone, Mail, X, List, AlertCircle, Search, LayoutDashboard, Activity, MessageSquare"
content = content.replace(c1_search, c1_replace)

# Conflict 2
c2_search = """<<<<<<< HEAD
  const rawInstructorCourses = courses.filter(c => c.instructorName === currentUser.name && c.status !== 'archived');
  const instructorCourses = rawInstructorCourses.filter(c => {
    if (courseSearchQuery.trim() && !c.title.toLowerCase().includes(courseSearchQuery.toLowerCase())) {
      return false;
    }
    if (courseStatusFilter === 'all') return true;
    if (courseStatusFilter === 'draft') return c.status === 'draft';
    if (courseStatusFilter === 'pending') return c.status === 'pending';
    if (courseStatusFilter === 'rejected') return c.status === 'rejected';
    if (courseStatusFilter === 'active') return c.status === 'active' && !c.isHidden;
    if (courseStatusFilter === 'hidden') return c.isHidden;
    return true;
  });
  const totalStudents = rawInstructorCourses.reduce((sum, c) => sum + c.enrolledCount, 0);
  const mockupAverageCompletion = Math.round(rawInstructorCourses.reduce((sum, c) => sum + c.completionRate, 0) / (rawInstructorCourses.length || 1));
=======
  const totalStudents = instructorCourses.reduce((sum, c) => sum + c.enrolledCount, 0);
  const mockupAverageCompletion = Math.round(instructorCourses.reduce((sum, c) => sum + c.completionRate, 0) / (instructorCourses.length || 1));
>>>>>>> develop"""
c2_replace = """  const rawInstructorCourses = courses.filter(c => c.instructorName === currentUser.name && c.status !== 'archived');
  const filteredInstructorCourses = rawInstructorCourses.filter(c => {
    if (courseSearchQuery.trim() && !c.title.toLowerCase().includes(courseSearchQuery.toLowerCase())) {
      return false;
    }
    if (courseStatusFilter === 'all') return true;
    if (courseStatusFilter === 'draft') return c.status === 'draft';
    if (courseStatusFilter === 'pending') return c.status === 'pending';
    if (courseStatusFilter === 'rejected') return c.status === 'rejected';
    if (courseStatusFilter === 'active') return c.status === 'active' && !c.isHidden;
    if (courseStatusFilter === 'hidden') return c.isHidden;
    return true;
  });
  const totalStudents = rawInstructorCourses.reduce((sum, c) => sum + c.enrolledCount, 0);
  const mockupAverageCompletion = Math.round(rawInstructorCourses.reduce((sum, c) => sum + c.completionRate, 0) / (rawInstructorCourses.length || 1));"""
content = content.replace(c2_search, c2_replace)

# Now we need to find everywhere `instructorCourses` was used by HEAD (my course list) and replace it with `filteredInstructorCourses`.
# Wait, let's just do it manually with regex.
# Actually I'll just change `instructorCourses.map` to `filteredInstructorCourses.map` in the courses tab.
# Or better, just rename `instructorCourses` in develop's chart to `allInstructorCourses`!
# Let's keep `filteredInstructorCourses` for safety.
content = content.replace("instructorCourses.map((course) =>", "filteredInstructorCourses.map((course) =>")
content = content.replace("instructorCourses.length === 0", "filteredInstructorCourses.length === 0")

# Conflict 3
c3_search = """<<<<<<< HEAD
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm khóa học..."
                    value={courseSearchQuery}
                    onChange={e => setCourseSearchQuery(e.target.value)}
                    className="w-full md:w-64 pl-9 pr-3 py-2 border rounded-xl focus:outline-none focus:border-brand-normal"
                  />
                </div>
                <select
                  value={courseStatusFilter}
                  onChange={e => setCourseStatusFilter(e.target.value)}
                  className="border rounded-xl px-3 py-2 bg-white min-w-[160px] focus:outline-none focus:border-brand-normal cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="draft">Đang hoàn thiện</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="rejected">Bị từ chối</option>
                  <option value="active">Đang công khai</option>
                  <option value="hidden">Đã ẩn</option>
                </select>
                <button 
                  onClick={startBuilderForCreate}
                  className="bg-brand-normal hover:bg-brand-hover text-brand-light text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all shrink-0 justify-center"
                >
                  <Plus className="w-4 h-4" /> Tạo khóa học
=======
              <div className="flex items-center gap-3">
                <select 
                  value={courseFilterStatus}
                  onChange={(e) => setCourseFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-stone-200 text-stone-700 text-xs font-semibold py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal transition-all"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang Published</option>
                  <option value="draft">Bản Draft</option>
                  <option value="pending">Chờ Duyệt</option>
                  <option value="rejected">Bị Từ Chối</option>
                </select>
                <button 
                  onClick={startBuilderForCreate}
                  className="bg-brand-normal hover:bg-brand-hover text-brand-light text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Thiết kế khóa học mới
>>>>>>> develop"""

c3_replace = """              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm khóa học..."
                    value={courseSearchQuery}
                    onChange={e => setCourseSearchQuery(e.target.value)}
                    className="w-full md:w-64 pl-9 pr-3 py-2 border rounded-xl focus:outline-none focus:border-brand-normal"
                  />
                </div>
                <select
                  value={courseStatusFilter}
                  onChange={e => setCourseStatusFilter(e.target.value)}
                  className="border rounded-xl px-3 py-2 bg-white min-w-[160px] focus:outline-none focus:border-brand-normal cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="draft">Đang hoàn thiện</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="rejected">Bị từ chối</option>
                  <option value="active">Đang công khai</option>
                  <option value="hidden">Đã ẩn</option>
                </select>
                <button 
                  onClick={startBuilderForCreate}
                  className="bg-brand-normal hover:bg-brand-hover text-brand-light text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all shrink-0 justify-center"
                >
                  <Plus className="w-4 h-4" /> Tạo khóa học"""
content = content.replace(c3_search, c3_replace)

# Conflict 4
c4_search = """<<<<<<< HEAD
                      {course.status !== 'active' && (
                        <button 
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn khóa học này? Thao tác này không thể thu hồi.')) {
                              onDeleteCourse(course.id);
                            }
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-1.5 rounded-xl flex items-center justify-center font-bold"
                          title="Xóa khóa học"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
=======
                      {/* View Reason for Rejected */}
                      {course.status === 'rejected' && course.rejectionReason && (
                        <button 
                          onClick={() => alert(`Lý do từ chối: ${course.rejectionReason}`)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 p-2 px-3 rounded-xl flex items-center gap-1 text-xs font-bold"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>Xem lý do</span>
                        </button>
                      )}

                      {/* Checklist option for Draft/Rejected */}
                      {(course.status === 'draft' || course.status === 'rejected') && (
                        <button 
                          onClick={() => alert('Chức năng Xem Checklist đang được phát triển.')}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 p-2 px-3 rounded-xl flex items-center gap-1 text-xs font-bold"
                        >
                          <List className="w-4 h-4" />
                          <span>Checklist</span>
                        </button>
                      )}

                      <button 
                        onClick={() => {
                          setEditingCourseId(course.id);
                          setBuilderStep(1);
                          setActiveTab('builder');
                        }}
                        className="bg-white hover:bg-slate-50 text-stone-700 border border-stone-200 p-2 px-3 rounded-xl flex items-center gap-1 text-xs font-bold"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Chỉnh sửa</span>
                      </button>

                      {/* Delete option */}
                      {course.status !== 'active' && (
                        <button 
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn khóa học này? Thao tác này không thể thu hồi.')) {
                              onDeleteCourse(course.id);
                            }
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-2 rounded-xl flex items-center justify-center font-bold shrink-0"
                          title="Xóa khóa học"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
>>>>>>> develop"""

c4_replace = """                      {course.status !== 'active' && (
                        <button 
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn khóa học này? Thao tác này không thể thu hồi.')) {
                              onDeleteCourse(course.id);
                            }
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-1.5 rounded-xl flex items-center justify-center font-bold"
                          title="Xóa khóa học"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}"""
content = content.replace(c4_search, c4_replace)

with open('src/components/InstructorDashboard.tsx', 'w') as f:
    f.write(content)
