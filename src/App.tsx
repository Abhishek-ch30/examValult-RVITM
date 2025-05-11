
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/student/Dashboard";
import TeacherDashboard from "./pages/teacher/Dashboard";
import CreateExam from "./pages/teacher/CreateExam";
import ManageExams from "./pages/teacher/ManageExams";
import ViewStudents from "./pages/teacher/ViewStudents";
import ExamList from "./pages/student/ExamList";
import TakeExam from "./pages/student/TakeExam";
import ExamHistory from "./pages/student/ExamHistory";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode, 
  allowedRole?: "student" | "teacher" 
}) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/exams" element={
              <ProtectedRoute allowedRole="student">
                <ExamList />
              </ProtectedRoute>
            } />
            <Route path="/student/exam/:examId" element={
              <ProtectedRoute allowedRole="student">
                <TakeExam />
              </ProtectedRoute>
            } />
            <Route path="/student/history" element={
              <ProtectedRoute allowedRole="student">
                <ExamHistory />
              </ProtectedRoute>
            } />
            
            {/* Teacher Routes */}
            <Route path="/teacher" element={
              <ProtectedRoute allowedRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/teacher/create-exam" element={
              <ProtectedRoute allowedRole="teacher">
                <CreateExam />
              </ProtectedRoute>
            } />
            <Route path="/teacher/manage-exams" element={
              <ProtectedRoute allowedRole="teacher">
                <ManageExams />
              </ProtectedRoute>
            } />
            <Route path="/teacher/students" element={
              <ProtectedRoute allowedRole="teacher">
                <ViewStudents />
              </ProtectedRoute>
            } />
            
            {/* Common Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
