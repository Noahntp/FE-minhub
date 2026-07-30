import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstructorDashboard from './InstructorDashboard';
import { User, Course } from '@/shared/types';
import { ApiService } from '@/services/api';

export default function InstructorPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const currentUserRes = await ApiService.getCurrentUser();
        const currentUserData = (currentUserRes as any)?.data || currentUserRes;
        if (!currentUserData && isMounted) {
          navigate('/login');
          return;
        }
        if (isMounted) {
          setUser(currentUserData);
        }
        
        const coursesRes = await ApiService.getInstructorCourses({ per_page: 100 });
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
  }, [navigate]);

  if (loading || !user) {
    return <div className="p-20 text-center text-stone-500 font-medium">Đang tải dữ liệu giảng viên...</div>;
  }

  return (
    <div className="w-full h-full min-h-screen relative">
      <InstructorDashboard 
        currentUser={user as any}
        courses={courses as any}
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
