import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import SearchBar from '../../components/ui/SearchBar';
import { PageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { formatRelative } from '../../utils/formatDate';
import { CLUB_CATEGORIES, POST_TYPES } from '../../utils/constants';
import { Plus, Heart, MessageCircle, Users, Globe, Megaphone, Calendar } from 'lucide-react';

const CampusConnect = () => {
  const navigate = useNavigate();
  const [clubCategory, setClubCategory] = useState('');
  const [postType, setPostType] = useState('');
  const [search, setSearch] = useState('');
  const [postPage, setPostPage] = useState(1);

  const { data: clubsData, loading: clubsLoading } = useFetch(
    `/api/campus/clubs?${clubCategory ? `category=${clubCategory}` : ''}`
  );
  const clubs = clubsData?.data || [];

  const postParams = new URLSearchParams({
    ...(postType && { type: postType }),
    ...(search && { search }),
    page: postPage, limit: 10,
  }).toString();

  const { data: postsData, loading: postsLoading, refetch: refetchPosts } = useFetch(`/api/campus/posts?${postParams}`);
  const posts = postsData?.data || [];
  const pagination = postsData?.pagination || {};

  const handleLike = async (postId, isLiked) => {
    // Optimistic: we just call API and rely on refetch
    try {
      await api.post(`/api/campus/posts/${postId}/like`);
      refetchPosts();
    } catch { toast.error('Failed to toggle like'); }
  };

  const getPostTypeColor = (type) => POST_TYPES.find(p => p.value === type)?.color || 'text-muted bg-muted/10';
  const getClubCatColor = (cat) => {
    const map = { technical: 'primary', cultural: 'purple', sports: 'accent', social: 'warning', other: 'default' };
    return map[cat] || 'default';
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Campus Connect</h1>
          <p className="text-text-muted text-sm">Clubs, events, announcements & campus life</p>
        </div>
        <button onClick={() => navigate('/campus/create-post')} className="btn-primary">
          <Plus size={16} /> Create Post
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Clubs Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title mb-0">Clubs</h2>
          </div>

          {/* Club Category Tabs */}
          <div className="flex flex-wrap gap-1">
            <button onClick={() => setClubCategory('')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${!clubCategory ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted hover:text-text-primary'}`}>
              All
            </button>
            {CLUB_CATEGORIES.map(({ value, label }) => (
              <button key={value} onClick={() => setClubCategory(value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                  clubCategory === value ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted hover:text-text-primary'
                }`}>{label}</button>
            ))}
          </div>

          {clubsLoading ? <PageSpinner /> : clubs.length === 0 ? (
            <EmptyState title="No clubs yet" description="Check back soon." />
          ) : (
            <div className="space-y-2.5">
              {clubs.map((club) => (
                <div key={club._id} onClick={() => navigate(`/campus/clubs/${club._id}`)}
                  className="card-base card-glow cursor-pointer flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {club.logo ? (
                      <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
                    ) : (
                      <Globe size={18} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-text-primary text-sm font-semibold truncate">{club.name}</p>
                      {club.recruitmentOpen && (
                        <span className="text-[9px] bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                          Hiring
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={getClubCatColor(club.category)} size="xs">{club.category}</Badge>
                      <span className="text-text-muted text-[10px] flex items-center gap-1">
                        <Users size={10} /> {club.members?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Posts Feed */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title mb-0">Campus Feed</h2>
          </div>

          {/* Post Type Filter */}
          <div className="flex gap-1 flex-wrap">
            {[{ value: '', label: 'All' }, ...POST_TYPES].map(({ value, label }) => (
              <button key={value} onClick={() => { setPostType(value); setPostPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  postType === value ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted hover:text-text-primary'
                }`}>{label}</button>
            ))}
          </div>

          <SearchBar value={search} onChange={(v) => { setSearch(v); setPostPage(1); }} placeholder="Search posts..." />

          {postsLoading ? <PageSpinner /> : posts.length === 0 ? (
            <EmptyState icon="default" title="No posts yet" description="Be the first to share something with campus!"
              action={<button onClick={() => navigate('/campus/create-post')} className="btn-primary">Create Post</button>} />
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post._id} className="card-base card-glow">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {post.club?.logo ? (
                        <img src={post.club.logo} alt={post.club.name} className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <Globe size={13} className="text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="text-text-primary text-xs font-semibold">{post.club?.name || post.postedBy?.name}</p>
                        <p className="text-text-muted text-[10px]">{formatRelative(post.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`badge-base text-[10px] border ${getPostTypeColor(post.type)}`}>{post.type}</span>
                  </div>

                  {/* Post Content */}
                  <h3 className="text-text-primary font-semibold text-sm mb-1 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/campus/posts/${post._id}`)}>
                    {post.title}
                  </h3>
                  <p className="text-text-muted text-xs line-clamp-2">{post.content}</p>

                  {/* Event Info */}
                  {post.eventDate && (
                    <div className="flex items-center gap-1.5 text-primary text-xs mt-2">
                      <Calendar size={12} />
                      <span>{formatRelative(post.eventDate)}</span>
                      {post.eventVenue && <span>· {post.eventVenue}</span>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                    <button onClick={() => handleLike(post._id)}
                      className="flex items-center gap-1.5 text-text-muted hover:text-danger transition-colors text-xs">
                      <Heart size={14} />
                      <span>{post.likes?.length || 0}</span>
                    </button>
                    <button onClick={() => navigate(`/campus/posts/${post._id}`)}
                      className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors text-xs">
                      <MessageCircle size={14} />
                      <span>{post.comments?.length || 0}</span>
                    </button>
                  </div>
                </div>
              ))}
              <Pagination currentPage={postPage} totalPages={pagination.totalPages || 1} onPageChange={setPostPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampusConnect;
