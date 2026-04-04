import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import Badge from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatDate } from '../../utils/formatDate';
import { Edit2, GraduationCap, MapPin, Users, BookOpen, ShoppingBag, Search } from 'lucide-react';

const MyProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: resourcesData } = useFetch('/api/resources?limit=5&myUploads=true');
  const { data: listingsData } = useFetch('/api/marketplace/my-listings');
  const { data: lostFoundData } = useFetch('/api/lostfound?myPosts=true&limit=5');
  const { data: connectionsData } = useFetch('/api/social/connections');

  const resources = resourcesData?.data || [];
  const listings = listingsData?.data || [];
  const lostFoundPosts = lostFoundData?.data || [];
  const connections = connectionsData?.data || [];

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  if (!user) return <PageSpinner />;

  return (
    <div className="animate-fade-in space-y-5">
      {/* Profile Header Card */}
      <div className="card-base">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-2xl font-display">{initials}</span>
            )}
          </div>

          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-text-primary">{user.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.department && <Badge variant="primary">{user.department}</Badge>}
              {user.branch && <Badge variant="default">{user.branch}</Badge>}
              {user.year && <Badge variant="default">Year {user.year}</Badge>}
              {user.role === 'admin' && <Badge variant="danger">Admin</Badge>}
            </div>
            {(user.state || user.district) && (
              <div className="flex items-center gap-1.5 text-text-muted text-xs mt-2">
                <MapPin size={12} />
                {[user.district, user.state].filter(Boolean).join(', ')}
              </div>
            )}
            {user.email && <p className="text-text-muted text-xs mt-1">{user.email}</p>}
          </div>

          <button onClick={() => navigate('/profile/edit')} className="btn-secondary self-start">
            <Edit2 size={16} /> Edit Profile
          </button>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-text-secondary text-sm mt-4 pt-4 border-t border-border">{user.bio}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Connections', value: connections.length, icon: Users, path: '/social/connections', color: 'primary' },
          { label: 'Resources', value: resources.length, icon: BookOpen, path: '/resources', color: 'accent' },
          { label: 'Listings', value: listings.length, icon: ShoppingBag, path: '/marketplace/my-listings', color: 'warning' },
        ].map(({ label, value, icon: Icon, path, color }) => (
          <div key={label} onClick={() => navigate(path)}
            className="card-base card-glow cursor-pointer text-center">
            <Icon size={20} className={`mx-auto mb-1 text-${color}`} />
            <p className="font-display text-2xl font-bold text-text-primary">{value}</p>
            <p className="text-text-muted text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Skills */}
      {user.skills?.length > 0 && (
        <div className="card-base">
          <h2 className="section-title">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {user.skills.map(s => (
              <span key={s} className="badge-base bg-primary/5 text-primary border border-primary/20 text-xs px-3 py-1">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* My Resources */}
      {resources.length > 0 && (
        <div className="card-base">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">My Resources</h2>
            <button onClick={() => navigate('/resources')} className="text-primary text-xs hover:text-primary-light transition-colors">View All</button>
          </div>
          <div className="space-y-2">
            {resources.map(r => (
              <div key={r._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-2">
                <BookOpen size={16} className="text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm truncate">{r.title}</p>
                  <p className="text-text-muted text-xs">{r.type?.replace(/_/g, ' ')} · {r.downloadCount} downloads</p>
                </div>
                <span className="text-text-muted text-xs">{formatDate(r.createdAt, 'MMM D')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
