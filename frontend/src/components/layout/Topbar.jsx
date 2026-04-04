import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu, Moon, Sun, ChevronDown, Settings, User, LogOut } from 'lucide-react';

const ROUTE_TITLES = {
  '/dashboard': 'Dashboard', '/tasks': 'My Tasks',
  '/resources': 'Resource Hub', '/resources/upload': 'Upload Resource',
  '/resources/learning-paths': 'Learning Paths', '/finance': 'Finance Tracker',
  '/finance/analytics': 'Finance Analytics', '/opportunities': 'Opportunities',
  '/local': 'Local Navigator', '/marketplace': 'Marketplace',
  '/marketplace/add': 'Add Listing', '/marketplace/my-listings': 'My Listings',
  '/lostfound': 'Lost & Found', '/lostfound/add': 'Report Item',
  '/campus': 'Campus Connect', '/campus/create-post': 'Create Post',
  '/campus-pass': 'Campus Pass',
  '/social': 'Student Social', '/social/connections': 'My Connections',
  '/profile': 'My Profile', '/profile/edit': 'Edit Profile',
};

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('ss_theme') !== 'light');

  // Apply stored theme on mount (before first render)
  useEffect(() => {
    const stored = localStorage.getItem('ss_theme');
    if (stored === 'light') {
      document.documentElement.classList.add('light');
      setIsDark(false);
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  // Sync theme on toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('ss_theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('ss_theme', 'light');
    }
  }, [isDark]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('[data-dropdown]')) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pageTitle = ROUTE_TITLES[location.pathname] || 'StudentSphere';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SS';
  const notifCount = user?.notifications?.filter(n => !n.read).length || 0;

  return (
    <header className="topbar h-14 flex items-center justify-between px-5 sticky top-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-xl bg-white/5 border border-indigo-500/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={19} />
        </button>
        <div>
          <h2 className="font-display text-base font-semibold text-white leading-tight">{pageTitle}</h2>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-9 h-9 rounded-xl bg-white/5 border border-indigo-500/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/profile')}
          className="relative w-9 h-9 rounded-xl bg-white/5 border border-indigo-500/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <Bell size={17} />
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>

        {/* Avatar dropdown */}
        <div className="relative" data-dropdown>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl bg-white/5 border border-indigo-500/10 hover:bg-white/10 transition-all"
          >
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
            )}
            <span className="text-sm text-slate-300 font-medium hidden sm:block">{user?.name?.split(' ')[0]}</span>
            <ChevronDown size={13} className="text-slate-500 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-[#12122a] border border-indigo-500/15 rounded-2xl shadow-2xl overflow-hidden z-50 fade-in">
              <button onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-all">
                <User size={14} /> My Profile
              </button>
              <button onClick={() => { navigate('/profile/edit'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-all">
                <Settings size={14} /> Settings
              </button>
              <div className="border-t border-indigo-500/10" />
              <button onClick={() => { logout(); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 text-sm transition-all">
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
