const fs = require('fs');
let content = fs.readFileSync('src/components/InstructorDashboard.tsx', 'utf-8');

const oldStateStr = `  const [studentsList, setStudentsList] = useState<any[]>([`;

const newStateStr = `  const [courseStudents, setCourseStudents] = useState<import('../types').EnrollmentDetail[]>([]);
  const [totalCourseStudents, setTotalCourseStudents] = useState<number>(0);
  const [studentPage, setStudentPage] = useState<number>(1);
  const [studentTotalPages, setStudentTotalPages] = useState<number>(1);
  const [studentsLoading, setStudentsLoading] = useState<boolean>(false);

  // Fetch enrollments whenever filters or page changes
  useEffect(() => {
    if (activeTab === 'students') {
      const fetchEnrollments = async () => {
        setStudentsLoading(true);
        try {
          const res = await ApiService.getInstructorEnrollments(currentUser.id, {
            courseId: selectedStudentCourseId,
            status: studentFilterStatus === 'all' ? undefined : studentFilterStatus,
            search: studentSearchQuery || undefined,
            page: studentPage,
            limit: 10
          });
          setCourseStudents(res.data);
          setTotalCourseStudents(res.total);
          setStudentTotalPages(res.totalPages);
        } catch (error) {
          console.error('Error fetching students:', error);
        } finally {
          setStudentsLoading(false);
        }
      };

      const delayTimer = setTimeout(fetchEnrollments, 300);
      return () => clearTimeout(delayTimer);
    }
  }, [activeTab, selectedStudentCourseId, studentFilterStatus, studentSearchQuery, studentPage, currentUser.id]);

  const [studentsList, setStudentsList] = useState<any[]>([`;

if (content.includes(oldStateStr)) {
  content = content.replace(oldStateStr, newStateStr);
}

const oldLogic = `          // Initialize selectedStudentCourseId if empty
          const coursesTaught = instructorCourses;
          const currentCourseId = selectedStudentCourseId || (coursesTaught[0]?.id || '');
          
          // Filter students matching the course
          const courseStudents = studentsList.filter(s => {
            const matchCourse = s.courseId === currentCourseId;
            const matchSearch = s.studentName.toLowerCase().includes(studentSearchQuery.toLowerCase()) || 
                                s.email.toLowerCase().includes(studentSearchQuery.toLowerCase());
            const matchStatus = studentFilterStatus === 'all' || s.status === studentFilterStatus;
            return matchCourse && matchSearch && matchStatus;
          });

          const currentCourseDetails = coursesTaught.find(c => c.id === currentCourseId);

          // Calculations
          const totalCourseStudents = courseStudents.length;
          const avgProgress = totalCourseStudents > 0 
            ? Math.round(courseStudents.reduce((sum, s) => sum + s.progress, 0) / totalCourseStudents)
            : 0;`;

const newLogic = `          const coursesTaught = [{ id: 'all', title: 'Tất cả khóa học', enrolledCount: totalEnrollments }, ...instructorCourses];
          const currentCourseId = selectedStudentCourseId || 'all';
          const currentCourseDetails = instructorCourses.find(c => c.id === currentCourseId);

          // Calculations from dynamic state
          const avgProgress = totalCourseStudents > 0 
            ? Math.round(courseStudents.reduce((sum, s) => sum + s.progress, 0) / totalCourseStudents)
            : 0;`;

if (content.includes(oldLogic)) {
  content = content.replace(oldLogic, newLogic);
}

// Replace status filter mapping
content = content.replace(
  `{['all', 'active', 'completed', 'suspended'].map((st) => (`,
  `{['all', 'enrolled', 'learning', 'completed'].map((st) => (`
);

content = content.replace(
  `{st === 'all' ? 'Tất cả' : st === 'active' ? 'Đang học' : st === 'completed' ? 'Tốt nghiệp' : 'Tạm khóa'}`,
  `{st === 'all' ? 'Tất cả' : st === 'learning' ? 'Đang học' : st === 'completed' ? 'Hoàn thành' : 'Mới ghi danh'}`
);

// We need to replace studentsList references with courseStudents for the rendering maps.
content = content.replace(/\{courseStudents\.map\(\(stud\) => \{/g, '{courseStudents.map((stud: any) => {');

// Replace mapping logic properties using regex for safety
content = content.replace(/stud\.studentName/g, 'stud.user.name');
content = content.replace(/stud\.email/g, 'stud.user.email');
content = content.replace(/stud\.avatar/g, 'stud.user.avatar');
content = content.replace(/stud\.enrollDate/g, 'new Date(stud.createdAt).toLocaleDateString(\"vi-VN\")');

// Replace student status rendering
content = content.replace(/stud\.status === 'completed'/g, 'stud.completedAt !== null');
content = content.replace(/stud\.status === 'suspended'/g, 'stud.progress > 0 && stud.completedAt === null');
content = content.replace(/'Tốt nghiệp' : stud\.status === 'suspended' \? 'Đã khóa' : 'Đang học'/g, "'Hoàn thành' : (stud.progress > 0 && stud.completedAt === null) ? 'Đang học' : 'Mới ghi danh'");

fs.writeFileSync('src/components/InstructorDashboard.tsx', content);
console.log('Replaced render logic successfully.');
