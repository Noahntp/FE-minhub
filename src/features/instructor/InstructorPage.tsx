import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import InstructorDashboard from './InstructorDashboard';
import { Course } from '@/shared/types';
import { useApp } from '@/app/AppContext';
import { instructorApi } from '@/features/instructor/api';

export default function InstructorPage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!currentUser) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const coursesRes = await instructorApi.getInstructorCourses({ per_page: 100 });
        const coursesList = Array.isArray(coursesRes) ? coursesRes : (coursesRes?.data || []);
        if (isMounted) {
          setCourses(coursesList);
        }
      } catch (e) {
        console.error("Error loading instructor page data:", e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#0066FF] mb-3" />
        <p className="text-sm font-bold text-slate-700">Đang tải dữ liệu giảng viên...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-500">
        <p className="text-base font-bold text-slate-800 mb-2">Phiên đăng nhập đã hết hạn</p>
        <p className="text-xs text-slate-500 mb-4">Vui lòng đăng nhập với tài khoản Giảng viên để tiếp tục.</p>
        <button 
          onClick={() => navigate('/login')}
          className="px-5 py-2.5 bg-[#0066FF] text-white font-bold rounded-xl text-xs shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen relative">
      <InstructorDashboard 
        currentUser={currentUser}
        courses={courses || []}
        onCreateCourseDraft={(newC) => {
          console.log("Create draft:", newC);
        }}
        onUpdateCourse={(updated) => {
          console.log("Update:", updated);
        }}
        onDeleteCourse={(id) => {
          console.log("Delete:", id);
        }}
        onClose={() => navigate('/')}
      />
    </div>
  );
}
