import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import Badge from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatDate, formatRelative } from '../../utils/formatDate';
import {
  Edit3, BookOpen, Briefcase, Users, Download,
  MapPin, FileText, ExternalLink, Plus, Clock,
} from 'lucide-react';
import { resolvePhoto } from '../../utils/resolvePhoto';

const TYPE_COLOR = {
  pdf:        'text-red-400 bg-red-500/10 border-red-500/20',
  video:      'text-purple-400 bg-purple-500/10 border-purple-500/20',
  link:       'text-blue-400 bg-blue-500/10 border-blue-500/20',
  notes:      'text-amber-400 bg-amber-500/10 border-amber-500/20',
  assignment: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  other:      'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

const MyProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: statsData, loading: statsLoading } = useFetch('/api/social/profile/stats');
  const { data: resourcesData, loading: resLoading } = useFetch('/api/resources/mine');

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SS';
  const stats     = statsData?.data || {};
  const myResources = resourcesData?.data || [];

  if (statsLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 slide-up max-w-3xl mx-auto">

      {/* ── Profile Header ────────────────────────────────────────────────── */}
      <div className="glass-card p-6 relative overflow-hidden" style={{ transform: 'none' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 60%)' }} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          {user?.profilePhoto ? (
            <img src={resolvePhoto(user.profilePhoto)} alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/30 flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-xl shadow-indigo-500/25">
              {initials}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">{user?.name}</h2>
                <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
              </div>
              <button onClick={() => navigate('/profile/edit')} className="btn-secondary flex-shrink-0">
                <Edit3 size={15} /> Edit
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {user?.department  && <Badge variant="indigo">{user.department}</Badge>}
              {user?.branch      && <Badge variant="purple">{user.branch}</Badge>}
              {user?.year        && <Badge variant="accent">Year {user.year}</Badge>}
              {user?.role === 'admin' && <Badge variant="danger">Admin</Badge>}
            </div>
          </div>
        </div>

        {user?.bio && (
          <div className="mt-5 pt-5 border-t border-indigo-500/10">
            <p className="text-slate-300 text-sm leading-relaxed">{user.bio}</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
          {user?.college && (
            <span className="flex items-center gap-1.5"><MapPin size={12} />{user.college}</span>
          )}
          {user?.createdAt && (
            <span className="flex items-center gap-1.5"><Clock size={12} />Joined {formatDate(user.createdAt, 'MMM YYYY')}</span>
          )}
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Connections',   value: stats.connections   || 0, icon: Users,     color: 'indigo'  },
          { label: 'Resources',     value: stats.resources     || myResources.length,  icon: BookOpen,  color: 'purple'  },
          { label: 'Opportunities', value: stats.opportunities || 0, icon: Briefcase,  color: 'accent'  },
          { label: 'Downloads',     value: stats.downloads     || 0, icon: Download,   color: 'warning' },
        ].map(({ label, value, icon: Icon, color }) => {
          const colorMap = {
            indigo:  { icon: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20'  },
            purple:  { icon: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20'  },
            accent:  { icon: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            warning: { icon: 'text-amber-400',  bg: 'bg-amber-500/10  border-amber-500/20'   },
          };
          const c = colorMap[color];
          return (
            <div key={label} className="stat-card text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border mx-auto mb-2 ${c.bg}`}>
                <Icon size={18} className={c.icon} />
              </div>
              <p className="font-display text-xl font-bold text-white">{value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Skills & Interests ────────────────────────────────────────────── */}
      {(user?.skills?.length > 0 || user?.interests?.length > 0) && (
        <div className="glass-card p-5" style={{ transform: 'none' }}>
          {user?.skills?.length > 0 && (
            <div className="mb-4">
              <h3 className="section-header mb-3"><BookOpen size={15} className="text-indigo-400" /> Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map(s => <span key={s} className="badge badge-indigo">{s}</span>)}
              </div>
            </div>
          )}
          {user?.interests?.length > 0 && (
            <div>
              <h3 className="section-header mb-3"><Users size={15} className="text-purple-400" /> Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map(i => <span key={i} className="badge badge-purple">{i}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── My Resources ─────────────────────────────────────────────────── */}
      <div className="glass-card p-5" style={{ transform: 'none' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-header"><BookOpen size={15} className="text-indigo-400" /> My Resources</h3>
          <button onClick={() => navigate('/resources/upload')} className="btn-primary py-1.5 px-3 text-xs">
            <Plus size={13} /> Upload
          </button>
        </div>

        {resLoading ? (
          <div className="flex justify-center py-6">
            <span className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : myResources.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
              <FileText size={20} className="text-indigo-400" />
            </div>
            <p className="text-slate-400 text-sm">No resources uploaded yet</p>
            <button onClick={() => navigate('/resources/upload')}
              className="mt-3 text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors">
              Upload your first resource →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {myResources.map(r => (
              <div key={r._id}
                onClick={() => navigate(`/resources/${r._id}`)}
                className="row-item cursor-pointer hover:bg-white/[0.04] transition-all group">
                {/* Type badge */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border text-xs font-bold uppercase ${TYPE_COLOR[r.type] || TYPE_COLOR.other}`}>
                  {r.type?.slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium line-clamp-1 group-hover:text-indigo-300 transition-colors">
                    {r.title}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {r.subject} · {formatRelative(r.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 flex-shrink-0">
                  <span className="flex items-center gap-1">
                    <Download size={11} /> {r.downloads || 0}
                  </span>
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default MyProfile;
