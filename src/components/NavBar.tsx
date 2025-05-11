
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react';

const NavBar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardLink = user?.role === 'teacher' ? '/teacher' : '/student';

  return (
    <nav className="w-full py-4 px-6 flex items-center justify-between header-gradient text-white shadow-md">
      <Link to="/" className="text-2xl font-bold tracking-tight">
        Exam Vault RVITM
      </Link>

      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <Link to={dashboardLink}>
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                Dashboard
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-white hover:text-white hover:bg-white/20">
                  <User className="h-5 w-5" />
                  {user.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-white text-exam-primary hover:bg-white/90">
                Register
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
