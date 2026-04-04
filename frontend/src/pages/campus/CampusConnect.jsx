import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatRelative } from '../../utils/formatDate';
import { Plus, Heart, MessageCircle, Share2, Megaphone, Users, Globe } from 'lucide-react';

const TABS = [
  { value: 'posts', label: 'Posts', icon: Globe },
  { value: 'clubs', label: 'Clubs', icon: Users },
  { value: 'announcements', label: 'Announcements', icon: Megaphone },
];

const POST_TYPE_BADGE = {
  announcement: 'announcement', event: 'event',
  recruitment: 'recruitment', general: 'general',
};

const EMOJI_ICONS = ['🎨','🏆','💻','🎵','📚','⚽','🌿','🚀'];

const CampusConnect = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('posts');
  const [page, setPage] = useState(1);
  const [postPage, setPostPage] = useState(1);
  const [postType, setPostType] = useState('');
  const [search, setSearch] = useState('');
  const [clubCategory, setClubCategory] = useState('');
  const [likingId, setLikingId] = useState(null);

  const { data: postsData, loading: postsLoading, refetch: refetchPosts } = useFetch(
    tab === 'posts' ? `/api/campus/posts?${postType ? `type=${postType}&` : ''}${search ? `search=${search}&` : ''}page=${postPage}&limit=10` : null
  );
  const { data: clubsData, loading: clubsLoading } = useFetch(
    tab === 'clubs' ? `/api/campus/clubs${clubCategory ? `?category=${clubCategory}` : ''}` : null
  );
  const { data: annData, loading: annLoading } = useFetch(
    tab === 'announcements' ? `/api/campus/posts?type=announcement&page=${page}&limit=10` : null
  );

  const posts = postsData?.data || [];
  const clubs = clubsData?.data || [];
  const announcements = annData?.data || [];
  const pagination = postsData?.pagination || annData?.pagination || {};

  const handleLike = async (postId) => {
    setLikingId(postId);
    try {
      await api.post(`/api/campus/posts/${postId}/like`);
      refetchPosts();
    } catch { toast.error('Failed'); }
    finally { setLikingId(null); }
  };

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({ title: post.title, text: post.content?.slice(0, 100) }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  return (
    <div className="space-y-6 slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">Campus Connect</h1>
          <p className="text-sm text-slate-400 mt-1">News, clubs, events and announcements</p>
        </div>
        <button onClick={() => navigate('/campus/create-post')} className="btn-primary w-fit">
          <Plus size={15} /> Create Post
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl w-fit border border-white/5">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button key={value} onClick={() => { setTab(value); setPage(1); }}
            className={`tab-btn flex items-center gap-2 ${tab === value ? 'active' : ''}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Posts Tab */}
      {tab === 'posts' && (
        postsLoading ? <PageSpinner /> : posts.length === 0 ? (
          <EmptyState icon="default" title="No posts yet" description="Be the first to share something with campus!"
            action={<button onClick={() => navigate('/campus/create-post')} className="btn-primary"><Plus size={15} /> Create Post</button>} />
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post._id} className="glass-card p-5" style={{ transform: 'none' }}>
                {/* Post header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {post.author?.name?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{post.author?.name}</p>
                      <p className="text-slate-500 text-xs">{formatRelative(post.createdAt)}</p>
                    </div>
                  </div>
                  <Badge variant={POST_TYPE_BADGE[post.type] || 'general'}>{post.type}</Badge>
                </div>

                {/* Content */}
                <h3 className="font-display text-base font-semibold text-white mb-2 cursor-pointer hover:text-indigo-400 transition-colors"
                  onClick={() => navigate(`/campus/posts/${post._id}`)}>
                  {post.title}
                </h3>
                {post.content && (
                  <p className="text-slate-400 text-sm line-clamp-3 mb-3">{post.content}</p>
                )}
                {post.image && (
                  <img src={post.image} alt={post.title}
                    className="w-full rounded-xl mb-3 max-h-60 object-cover" />
                )}

                {/* Tags */}
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.map(t => <span key={t} className="text-[10px] text-indigo-400/70 bg-indigo-500/8 px-2 py-0.5 rounded">#{t}</span>)}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-indigo-500/10">
                  <button onClick={() => handleLike(post._id)} disabled={likingId === post._id}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors text-xs">
                    <Heart size={15} className={post.isLiked ? 'fill-red-400 text-red-400' : ''} />
                    {post.likesCount || post.likes?.length || 0}
                  </button>
                  <button onClick={() => navigate(`/campus/posts/${post._id}`)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition-colors text-xs">
                    <MessageCircle size={15} />
                    {post.commentsCount || post.comments?.length || 0}
                  </button>
                  <button onClick={() => handleShare(post)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition-colors text-xs ml-auto">
                    <Share2 size={15} /> Share
                  </button>
                </div>
              </div>
            ))}
            <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
          </div>
        )
      )}

      {/* Clubs Tab */}
      {tab === 'clubs' && (
        clubsLoading ? <PageSpinner /> : clubs.length === 0 ? (
          <EmptyState icon="users" title="No clubs yet" description="Clubs will appear here once they are created." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((club, idx) => (
              <div key={club._id} className="glass-card p-5 cursor-pointer"
                onClick={() => navigate(`/campus/clubs/${club._id}`)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="icon-box-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl flex-shrink-0">
                    {club.image
                      ? <img src={club.image} alt={club.name} className="w-full h-full object-cover rounded-xl" />
                      : <span>{EMOJI_ICONS[idx % EMOJI_ICONS.length]}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-white text-sm">{club.name}</h3>
                    <Badge variant={club.category || 'technical'}>{club.category}</Badge>
                  </div>
                </div>
                <p className="text-slate-400 text-xs line-clamp-2 mb-3">{club.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><Users size={10} /> {club.members?.length || 0} members</span>
                  <button className="btn-primary py-1 px-2.5 text-xs">View</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Announcements Tab */}
      {tab === 'announcements' && (
        annLoading ? <PageSpinner /> : announcements.length === 0 ? (
          <EmptyState icon="default" title="No announcements" description="Check back for important campus updates." />
        ) : (
          <div className="space-y-3">
            {announcements.map(ann => (
              <div key={ann._id} className="row-item cursor-pointer" onClick={() => navigate(`/campus/posts/${ann._id}`)}>
                <div className="icon-box bg-indigo-500/10 border border-indigo-500/20">
                  <Megaphone size={16} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{ann.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{ann.author?.name} · {formatRelative(ann.createdAt)}</p>
                </div>
                <Badge variant="announcement">Announcement</Badge>
              </div>
            ))}
            <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
          </div>
        )
      )}
    </div>
  );
};

export default CampusConnect;
