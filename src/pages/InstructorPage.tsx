import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstructorDashboard from '@/components/InstructorDashboard';
import { getCurrentUser, AuthUser } from '@/services/auth.service';
import { getInstructorCourses, Course } from '@/services/course.service';

export default function InstructorPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);
        
        const myCourses = await getInstructorCourses();
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
