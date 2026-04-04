import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatDate';
import { ArrowLeft, Users, UserPlus, UserMinus, Globe, Mail } from 'lucide-react';
import { CLUB_CATEGORIES } from '../../utils/constants';
import { Heart, MessageCircle } from 'lucide-react';
import { formatRelative } from '../../utils/formatDate';

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, refetch } = useFetch(`/api/campus/clubs/${id}`);
  const club = data?.data?.club;
  const posts = data?.data?.recentPosts || [];

  const isMember = club?.members?.some(m => (m._id || m) === user?._id);
  const categoryColor = (cat) => {
    const map = { technical: 'primary', cultural: 'purple', sports: 'accent', social: 'warning', other: 'default' };
    return map[cat] || 'default';
  };

  const handleJoin = async () => {
    try {
      await api.post(`/api/campus/clubs/${id}/join`);
      toast.success('Joined club!');
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleLeave = async () => {
    try {
      await api.post(`/api/campus/clubs/${id}/leave`);
      toast.success('Left club.');
      refetch();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <PageSpinner />;
  if (!club) return <div className="text-center py-20 text-text-muted">Club not found.</div>;

  return (
    <div className="animate-fade-in space-y-5">
      <button onClick={() => navigate('/campus')} className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Campus Connect
      </button>

      {/* Club Header */}
      <div className="card-base space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {club.logo ? (
              <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
            ) : (
              <Globe size={28} className="text-primary" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold text-text-primary">{club.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={categoryColor(club.category)}>{club.category}</Badge>
                  {club.recruitmentOpen && <Badge variant="accent">🎯 Recruiting</Badge>}
                </div>
              </div>
              {isMember ? (
                <button onClick={handleLeave} className="btn-secondary">
                  <UserMinus size={16} /> Leave
                </button>
              ) : (
                <button onClick={handleJoin} className="btn-primary">
                  <UserPlus size={16} /> Join Club
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-text-secondary text-sm">{club.description}</p>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-text-muted">
            <Users size={15} className="text-primary" />
            <span>{club.members?.length || 0} members</span>
          </div>
          {club.contactEmail && (
            <div className="flex items-center gap-2 text-text-muted">
              <Mail size={15} className="text-primary" />
              <span>{club.contactEmail}</span>
            </div>
          )}
          {club.recruitmentOpen && club.recruitmentEndDate && (
            <div className="flex items-center gap-2 text-text-muted">
              <span>Recruitment ends: <span className="text-warning">{formatDate(club.recruitmentEndDate)}</span></span>
            </div>
          )}
        </div>
      </div>

      {/* Members preview */}
      {club.members?.length > 0 && (
        <div className="card-base">
          <h3 className="section-title">Members ({club.members.length})</h3>
          <div className="flex flex-wrap gap-2">
            {club.members.slice(0, 12).map((member) => (
              <div key={member._id || member} className="flex items-center gap-2 bg-surface-2 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-border/40 transition-all"
                onClick={() => navigate(`/social/${member._id || member}`)}>
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                  {member.name?.charAt(0) || '?'}
                </div>
                <span className="text-text-secondary text-xs">{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts */}
      <div className="card-base">
        <h3 className="section-title">Recent Posts</h3>
        {posts.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-4">No posts yet.</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post._id} onClick={() => navigate(`/campus/posts/${post._id}`)}
                className="p-3 rounded-lg bg-surface-2 hover:bg-border/40 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-text-primary text-sm font-semibold">{post.title}</p>
                  <span className="text-text-muted text-[10px]">{formatRelative(post.createdAt)}</span>
                </div>
                <p className="text-text-muted text-xs line-clamp-2">{post.content}</p>
                <div className="flex gap-3 mt-2 text-text-muted text-xs">
                  <span className="flex items-center gap-1"><Heart size={10} /> {post.likes?.length || 0}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={10} /> {post.comments?.length || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDetail;
