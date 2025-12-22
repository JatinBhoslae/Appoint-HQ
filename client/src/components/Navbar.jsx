import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ModeToggle } from './mode-toggle';
import { Calendar, LogOut, User, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const btnClass =
    "flex items-center px-3 py-2 text-sm rounded-md hover:bg-primary/10 transition";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">AppointHQ</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link to="/dashboard">
                  <button className={btnClass}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </button>
                </Link>

                <Link to="/profile">
                  <button className={btnClass}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </button>
                </Link>

                <button
                  onClick={handleLogout}
                  className={`${btnClass} text-destructive`}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className={btnClass}>Login</button>
                </Link>
                <Link to="/register">
                  <button className={`${btnClass} bg-primary text-white`}>
                    Sign Up
                  </button>
                </Link>
              </>
            )}

            <div className="ml-2 pl-2 border-l border-border/50">
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
