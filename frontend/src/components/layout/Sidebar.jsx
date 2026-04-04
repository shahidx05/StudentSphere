import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, Wallet, Briefcase, MapPin,
  ShoppingBag, Search, Users, Globe, User, LogOut,
  ChevronRight, GraduationCap, X,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/resources', icon: BookOpen, label: 'Resource Hub' },
  { path: '/finance', icon: Wallet, label: 'Finance Tracker' },
  { path: '/opportunities', icon: Briefcase, label: 'Opportunities' },
  { path: '/local', icon: MapPin, label: 'Local Navigator' },
  { path: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  { path: '/lostfound', icon: Search, label: 'Lost & Found' },
  { path: '/campus', icon: Globe, label: 'Campus Connect' },
  { path: '/social', icon: Users, label: 'Student Social' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SS';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-secondary border-r border-border z-40 flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-text-primary text-lg tracking-tight">
              Student<span className="text-primary">Sphere</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-muted hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] text-muted uppercase tracking-widest font-medium px-3 mb-3">Menu</p>
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => onClose?.()}
              className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer group">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-border" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-primary text-xs font-semibold">{initials}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-xs font-semibold truncate">{user?.name || 'Student'}</p>
              <p className="text-text-muted text-[10px] truncate">{user?.department || 'Student'}</p>
            </div>
          </div>

          <div className="flex gap-1 mt-1">
            <button
              onClick={() => { navigate('/profile'); onClose?.(); }}
              className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 text-xs transition-all"
            >
              <User size={14} />
              Profile
            </button>
            <button
              onClick={logout}
              className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg text-danger/70 hover:text-danger hover:bg-danger/5 text-xs transition-all"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
