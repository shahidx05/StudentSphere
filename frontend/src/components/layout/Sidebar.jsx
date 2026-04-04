import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, Wallet, Briefcase, MapPin,
  ShoppingBag, Search, Users, Globe, LogOut, User,
  GraduationCap, ChevronLeft, ChevronRight, CheckSquare, X, Shield,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks',        icon: CheckSquare,     label: 'My Tasks' },
  { path: '/resources',    icon: BookOpen,        label: 'Resource Hub' },
  { path: '/finance',      icon: Wallet,          label: 'Finance' },
  { path: '/opportunities',icon: Briefcase,       label: 'Opportunities' },
  { path: '/local',        icon: MapPin,          label: 'Local Navigator' },
  { path: '/marketplace',  icon: ShoppingBag,     label: 'Marketplace' },
  { path: '/lostfound',    icon: Search,          label: 'Lost & Found' },
  { path: '/campus',       icon: Globe,           label: 'Campus Connect' },
  { path: '/social',       icon: Users,           label: 'Student Social' },
];

const ADMIN_NAV = { path: '/admin', icon: Shield, label: 'Admin Panel' };

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SS';

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`sidebar fixed left-0 top-0 h-full z-40 flex flex-col
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-indigo-500/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            <GraduationCap size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="fade-in overflow-hidden">
              <h1 className="text-base font-bold gradient-text leading-tight font-display">StudentSphere</h1>
              <p className="text-[10px] text-slate-500 tracking-wider uppercase">Student Ecosystem</p>
            </div>
          )}
          <button onClick={onClose} className="lg:hidden ml-auto text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {!collapsed && (
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium px-3 mb-3">Navigation</p>
          )}
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => onClose?.()}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center !gap-0 !px-0' : ''}`
              }
            >
              <Icon size={19} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}

          {/* Admin-only link */}
          {user?.role === 'admin' && (
            <NavLink to={ADMIN_NAV.path} onClick={() => onClose?.()}
              title={collapsed ? ADMIN_NAV.label : undefined}
              className={({ isActive }) =>
                `sidebar-link mt-2 border border-red-500/20 ${isActive ? 'bg-red-500/15 text-red-400' : 'text-red-400/70 hover:text-red-400 hover:bg-red-500/10'} ${collapsed ? 'justify-center !gap-0 !px-0' : ''}`
              }>
              <Shield size={19} className="flex-shrink-0" />
              {!collapsed && <span>{ADMIN_NAV.label}</span>}
            </NavLink>
          )}
        </nav>

        {/* Collapse toggle */}
        <div className="px-3 py-2 border-t border-indigo-500/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-link w-full justify-center text-slate-500 hover:text-white"
          >
            {collapsed
              ? <ChevronRight size={17} />
              : <><ChevronLeft size={17} /><span className="text-xs">Collapse</span></>
            }
          </button>
        </div>

        {/* User Card */}
        {!collapsed && (
          <div className="px-4 py-4 border-t border-indigo-500/10 fade-in">
            <div className="flex items-center gap-3 mb-3">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name || 'Student'}</p>
                <p className="text-[11px] text-slate-500 truncate">
                  {user?.department || 'Student'}
                  {user?.year ? ` · Yr ${user.year}` : ''}
                </p>
              </div>
              <div className="pulse-dot" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { navigate('/profile'); onClose?.(); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium transition-all"
              >
                <User size={13} /> Profile
              </button>
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium transition-all"
              >
                <LogOut size={13} /> Logout
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
