import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstructorDashboard from './InstructorDashboard';
import { User, Course } from '@/shared/types';

export default function InstructorPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);
        
        const myCourses = await Promise.resolve((Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any));
        setCourses(myCourses);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [navigate]);

  if (loading || !user) {
    return <div className="p-20 text-center">Đang tải dữ liệu giảng viên...</div>;
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
