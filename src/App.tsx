
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import Index from "./pages/Index";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { Dashboard } from "./pages/Dashboard";
import { AboutPage } from "./pages/AboutPage";
import { AdmissionsPage } from "./pages/AdmissionsPage";
import { CoursesPage } from "./pages/CoursesPage";
import { LessonsPage } from "./pages/LessonsPage";
import { AssignmentsPage } from "./pages/AssignmentsPage";
import { GradebookPage } from "./pages/GradebookPage";
import { AttendancePage } from "./pages/AttendancePage";
import NotFound from "./pages/NotFound";
import { ProfilePage } from "./pages/ProfilePage";
import { ScholarsPage } from "./pages/ScholarsPage";
import { SettingsPage } from "./pages/SettingsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/admissions" element={<AdmissionsPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/lessons" element={<LessonsPage />} />
                <Route path="/assignments" element={<AssignmentsPage />} />
                <Route path="/gradebook" element={<GradebookPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/scholars" element={<ScholarsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
