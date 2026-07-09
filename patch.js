const fs = require('fs');
let content = fs.readFileSync('src/components/InstructorDashboard.tsx', 'utf-8');

// Conflict 1: Imports
content = content.replace(
`<<<<<<< HEAD
  AlertTriangle, Play, HelpCircle, Lock, Sparkles, Upload, ArrowUp, ArrowDown, Shield, Key, Smartphone, Mail, X, List, AlertCircle, Search
=======
  AlertTriangle, Play, HelpCircle, Lock, Sparkles, Upload, ArrowUp, ArrowDown, Shield, Key, Smartphone, Mail, X, LayoutDashboard, Activity, MessageSquare
>>>>>>> develop`,
`  AlertTriangle, Play, HelpCircle, Lock, Sparkles, Upload, ArrowUp, ArrowDown, Shield, Key, Smartphone, Mail, X, List, AlertCircle, Search, LayoutDashboard, Activity, MessageSquare`
);

// Conflict 2: instructorCourses
content = content.replace(
`<<<<<<< HEAD
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
>>>>>>> develop`,
`  const rawInstructorCourses = courses.filter(c => c.instructorName === currentUser.name && c.status !== 'archived');
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
  const mockupAverageCompletion = Math.round(rawInstructorCourses.reduce((sum, c) => sum + c.completionRate, 0) / (rawInstructorCourses.length || 1));`
);

// We need to rename instructorCourses to filteredInstructorCourses in our logic to avoid conflict with develop's instructorCourses (which might be used by their new charts).
// Actually, let's look at what develop added.

fs.writeFileSync('src/components/InstructorDashboard.tsx', content);
