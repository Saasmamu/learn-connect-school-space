
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { Dashboard } from "./pages/Dashboard";
import { Homepage } from "./pages/Homepage";
import { AboutPage } from "./pages/AboutPage";
import { AdmissionsPage } from "./pages/AdmissionsPage";
import { CoursesPage } from "./pages/CoursesPage";
import { Navigation } from "./components/Navigation";
import NotFound from "./pages/NotFound";
import { StudentsPage } from "./pages/admin/StudentsPage";
import { TeachersPage } from "./pages/admin/TeachersPage";
import { CoursesPage as AdminCoursesPage } from "./pages/admin/CoursesPage";
import { AnalyticsPage } from "./pages/admin/AnalyticsPage";
import { PaymentsPage } from "./pages/admin/PaymentsPage";
import { LessonsPage } from "./pages/LessonsPage";
import { AssignmentsPage } from "./pages/AssignmentsPage";
import { GradebookPage } from "./pages/GradebookPage";
import { AttendancePage } from "./pages/AttendancePage";
import { MessagingPage } from "./pages/MessagingPage";
import { TeacherClassesPage } from "./pages/teacher/TeacherClassesPage";
import { TeacherGradebookPage } from "./pages/teacher/TeacherGradebookPage";
import { StudentClassesPage } from "./pages/student/StudentClassesPage";
import { StudentLessonsPage } from "./pages/student/StudentLessonsPage";
import { NotificationsPage } from "./pages/NotificationsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navigation />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Homepage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/admissions" element={<AdmissionsPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin/students" element={<StudentsPage />} />
              <Route path="/admin/teachers" element={<TeachersPage />} />
              <Route path="/admin/courses" element={<AdminCoursesPage />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
              <Route path="/admin/payments" element={<PaymentsPage />} />
              
              {/* Teacher Routes */}
              <Route path="/teacher/classes" element={<TeacherClassesPage />} />
              <Route path="/teacher/gradebook" element={<TeacherGradebookPage />} />
              
              {/* Student Routes */}
              <Route path="/student/classes" element={<StudentClassesPage />} />
              <Route path="/student/classes/:classId/lessons" element={<StudentLessonsPage />} />
              
              {/* Shared Routes */}
              <Route path="/lessons" element={<LessonsPage />} />
              <Route path="/assignments" element={<AssignmentsPage />} />
              <Route path="/gradebook" element={<GradebookPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/messaging" element={<MessagingPage />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
