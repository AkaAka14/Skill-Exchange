import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <Sparkles className="h-6 w-6" />
          <span className="font-bold text-xl font-heading tracking-tight text-white">SkillSwap AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Home
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link 
                to="/matches" 
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/matches') ? 'text-primary' : 'text-muted-foreground'}`}
              >
                Matches
              </Link>
              <Link 
                to={`/profile/${currentUser?.id}`} 
                className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname.startsWith('/profile') ? 'text-primary' : 'text-muted-foreground'}`}
              >
                Profile
              </Link>
            </>   
          ) : null}
        </nav>

        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <Button asChild variant="default" className="bg-primary text-white hover:bg-primary/90">
              <Link to="/auth">Get Started</Link>
            </Button>
          ) : (
            <Button variant="outline" className="border-white/20 text-foreground hover:bg-white/10" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;