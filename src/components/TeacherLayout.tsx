
import { ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/NavBar';
import { BookOpen, PlusCircle, Users, BarChart, FileText } from 'lucide-react';

interface TeacherLayoutProps {
  children: ReactNode;
  activeTab?: 'dashboard' | 'create' | 'manage' | 'students';
}

const TeacherLayout = ({ children, activeTab = 'dashboard' }: TeacherLayoutProps) => {
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart, path: '/teacher' },
    { id: 'create', label: 'Create Exam', icon: PlusCircle, path: '/teacher/create-exam' },
    { id: 'manage', label: 'Manage Exams', icon: BookOpen, path: '/teacher/manage-exams' },
    { id: 'students', label: 'View Students', icon: Users, path: '/teacher/students' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar for larger screens */}
        <div className="hidden md:flex flex-col w-64 bg-slate-50 border-r p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.id} to={item.path}>
                <Button
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    activeTab === item.id ? 'gradient-primary' : ''
                  }`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Bottom navigation for mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-10">
          {navItems.map((item) => (
            <Button 
              key={item.id} 
              variant="ghost" 
              className={`flex-col py-2 px-1 h-auto ${
                activeTab === item.id ? 'text-exam-primary' : ''
              }`} 
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6 md:p-8 pb-16 md:pb-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TeacherLayout;
