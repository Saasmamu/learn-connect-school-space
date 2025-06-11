
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Homepage } from "@/pages/Homepage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { Dashboard } from "@/pages/Dashboard";
import { CoursesPage } from "@/pages/CoursesPage";
import { AboutPage } from "@/pages/AboutPage";
import { AdmissionsPage } from "@/pages/AdmissionsPage";
import { StudentsPage } from "@/pages/admin/StudentsPage";
import { TeachersPage } from "@/pages/admin/TeachersPage";
import { CoursesPage as AdminCoursesPage } from "@/pages/admin/CoursesPage";
import { PaymentsPage } from "@/pages/admin/PaymentsPage";
import { AnalyticsPage } from "@/pages/admin/AnalyticsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/admissions" element={<AdmissionsPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<CoursesPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin/students" element={<StudentsPage />} />
              <Route path="/admin/teachers" element={<TeachersPage />} />
              <Route path="/admin/courses" element={<AdminCoursesPage />} />
              <Route path="/admin/payments" element={<PaymentsPage />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
