import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import {
  Sparkles, Home, Users, User, Heart,
  MessageCircle, LogOut, LogIn, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home',     icon: Home,          path: '/',          public: true },
  { label: 'Matches',  icon: Users,         path: '/matches',   public: false },
  { label: 'Messages', icon: MessageCircle, path: '/messages',  public: false },
  { label: 'Saved',    icon: Heart,         path: '/favorites', public: false },
];

export default function Sidebar() {
  const { isAuthenticated, logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const profilePath = `/profile/${currentUser?.id}`;
  const isProfileActive = location.pathname.startsWith('/profile');

  const visibleItems = NAV_ITEMS.filter((i) => i.public || isAuthenticated);

  // ── Shared nav content ───────────────────────────────────────────────────────
  const NavContent = ({ onNavigate }) => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 mb-2 ${collapsed ? 'justify-center px-0' : ''}`}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-900/40">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight text-white leading-none">
            Saheli
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 space-y-0.5">
        {visibleItems.map(({ label, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group relative
                ${active
                  ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/10 text-white'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }
                ${collapsed ? 'justify-center px-0' : ''}
              `}
            >
              {/* Active indicator bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-gradient-to-b from-pink-400 to-purple-500" />
              )}
              <Icon className={`h-4 w-4 flex-shrink-0 transition-colors ${active ? 'text-pink-400' : 'text-muted-foreground group-hover:text-white'}`} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {/* Profile — separate since path is dynamic */}
        {isAuthenticated && (
          <Link
            to={profilePath}
            onClick={onNavigate}
            title={collapsed ? 'Profile' : undefined}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-150 group relative
              ${isProfileActive
                ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/10 text-white'
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }
              ${collapsed ? 'justify-center px-0' : ''}
            `}
          >
            {isProfileActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-gradient-to-b from-pink-400 to-purple-500" />
            )}
            <User className={`h-4 w-4 flex-shrink-0 ${isProfileActive ? 'text-pink-400' : 'text-muted-foreground group-hover:text-white'}`} />
            {!collapsed && <span>Profile</span>}
          </Link>
        )}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px bg-white/5 mb-3" />

      {/* Bottom: user info + logout / login */}
      <div className="px-2 pb-4 space-y-1">
        {isAuthenticated ? (
          <>
            {/* User chip */}
            {!collapsed && currentUser && (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 mb-1">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {currentUser.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate leading-none mb-0.5">{currentUser.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate leading-none">{currentUser.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              title={collapsed ? 'Log out' : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                text-muted-foreground hover:text-rose-400 hover:bg-rose-500/5
                transition-all duration-150 group
                ${collapsed ? 'justify-center px-0' : ''}
              `}
            >
              <LogOut className="h-4 w-4 flex-shrink-0 group-hover:text-rose-400" />
              {!collapsed && <span>Log out</span>}
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            onClick={onNavigate}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700
              text-white transition-all duration-150 shadow-md shadow-pink-900/30
              ${collapsed ? 'justify-center px-0' : ''}
            `}
          >
            <LogIn className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Get started</span>}
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ────────────────────────────────────────────────── */}
      <aside
        className={`
          hidden md:flex flex-col flex-shrink-0 sticky top-0 h-screen
          border-r border-white/5 bg-background/95 backdrop-blur-sm
          transition-all duration-200 ease-in-out
          ${collapsed ? 'w-16' : 'w-56'}
        `}
      >
        <NavContent onNavigate={undefined} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-card border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:border-pink-500/40 transition-all shadow-md"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* ── Mobile top bar ─────────────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-background/90 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">Saheli</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* ── Mobile drawer ──────────────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-background border-r border-white/5 shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
            <NavContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}