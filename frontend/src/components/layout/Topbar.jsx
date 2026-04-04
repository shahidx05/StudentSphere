import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const ROUTE_TITLES = {
  '/dashboard': 'Dashboard',
  '/resources': 'Resource Hub',
  '/resources/upload': 'Upload Resource',
  '/resources/learning-paths': 'Learning Paths',
  '/finance': 'Finance Tracker',
  '/finance/analytics': 'Finance Analytics',
  '/opportunities': 'Opportunities',
  '/local': 'Local Navigator',
  '/marketplace': 'Marketplace',
  '/marketplace/add': 'Add Listing',
  '/marketplace/my-listings': 'My Listings',
  '/lostfound': 'Lost & Found',
  '/lostfound/add': 'Report Item',
  '/campus': 'Campus Connect',
  '/campus/create-post': 'Create Post',
  '/social': 'Student Social',
  '/social/connections': 'My Connections',
  '/profile': 'My Profile',
  '/profile/edit': 'Edit Profile',
};

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const pageTitle = ROUTE_TITLES[location.pathname] || 'StudentSphere';

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SS';

  const notificationCount = user?.notifications?.filter((n) => !n.read).length || 0;

  return (
    <header className="h-14 bg-secondary/80 backdrop-blur border-b border-border flex items-center justify-between px-5 sticky top-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-muted hover:text-text-primary hover:bg-surface-2 transition-all"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-display font-semibold text-text-primary text-base">{pageTitle}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          onClick={() => navigate('/profile')}
          className="relative p-2 rounded-lg text-muted hover:text-text-primary hover:bg-surface-2 transition-all"
        >
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-2 transition-all group"
          >
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-border" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-primary text-xs font-semibold">{initials}</span>
              </div>
            )}
            <span className="text-text-secondary text-sm font-medium hidden sm:block">{user?.name?.split(' ')[0]}</span>
            <ChevronDown size={14} className="text-muted hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl shadow-card overflow-hidden z-50 animate-slide-up">
              <button
                onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all text-sm"
              >
                <User size={15} />
                My Profile
              </button>
              <button
                onClick={() => { navigate('/profile/edit'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all text-sm"
              >
                <Settings size={15} />
                Edit Profile
              </button>
              <div className="border-t border-border" />
              <button
                onClick={() => { logout(); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-danger hover:bg-danger/5 transition-all text-sm"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
