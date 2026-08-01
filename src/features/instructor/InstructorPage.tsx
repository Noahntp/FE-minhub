import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      if (!currentUser) return;
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

  if (loading || !currentUser) {
    return <div className="p-20 text-center text-stone-500 font-medium">Đang tải dữ liệu giảng viên...</div>;
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
