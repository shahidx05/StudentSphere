import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { formatDate, formatRelative } from '../../utils/formatDate';
import { ArrowLeft, Heart, MessageCircle, Send, Trash2, Globe, Users, Calendar } from 'lucide-react';
import { useState } from 'react';
import { POST_TYPES } from '../../utils/constants';

const CampusPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, refetch } = useFetch(`/api/campus/posts/${id}`);
  const post = data?.data;
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isLiked = post?.likes?.some(u => (u._id || u) === user?._id);
  const getTypeColor = (type) => POST_TYPES.find(p => p.value === type)?.color || 'text-muted bg-muted/10';

  const handleLike = async () => {
    try {
      await api.post(`/api/campus/posts/${id}/like`);
      refetch();
    } catch { toast.error('Failed'); }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/campus/posts/${id}`);
      toast.success('Post deleted.');
      navigate('/campus');
    } catch { toast.error('Failed to delete post'); }
    finally { setDeleting(false); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/api/campus/posts/${id}/comment`, { text: comment });
      setComment('');
      refetch();
    } catch { toast.error('Failed to add comment'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteComment = async (cid) => {
    try {
      await api.delete(`/api/campus/posts/${id}/comment/${cid}`);
      toast.success('Comment deleted.');
      refetch();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <PageSpinner />;
  if (!post) return <div className="text-center py-20 text-text-muted">Post not found.</div>;

  return (
    <div className="max-w-2xl animate-fade-in space-y-5">
      <button onClick={() => navigate('/campus')} className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Campus Connect
      </button>

      <div className="card-base space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
              {post.club?.logo ? (
                <img src={post.club.logo} alt={post.club.name} className="w-full h-full object-cover" />
              ) : (
                <Globe size={18} className="text-primary" />
              )}
            </div>
            <div>
              <p className="text-text-primary font-semibold text-sm">{post.club?.name || post.postedBy?.name}</p>
              <p className="text-text-muted text-xs">{formatRelative(post.createdAt)}</p>
            </div>
          </div>
          <span className={`badge-base text-xs border ${getTypeColor(post.type)}`}>{post.type}</span>
        </div>

        <h1 className="font-display text-xl font-bold text-text-primary">{post.title}</h1>
        <p className="text-text-secondary text-sm leading-relaxed">{post.content}</p>

        {post.eventDate && (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
            <div className="flex items-center gap-2 text-primary">
              <Calendar size={14} />
              <span>{formatDate(post.eventDate, 'MMM D, YYYY')}</span>
            </div>
            {post.eventVenue && <span className="text-text-muted">📍 {post.eventVenue}</span>}
          </div>
        )}

        {/* Images */}
        {post.images?.length > 0 && (
          <div className={`grid gap-2 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {post.images.map((img, i) => (
              <img key={i} src={img} alt="" className="rounded-xl w-full object-cover max-h-48" />
            ))}
          </div>
        )}

        {/* Like & Comment Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <button onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? 'text-danger' : 'text-text-muted hover:text-danger'}`}>
            <Heart size={16} fill={isLiked ? '#FA4D56' : 'none'} />
            {post.likes?.length || 0} likes
          </button>
          <div className="flex items-center gap-1.5 text-text-muted text-sm">
            <MessageCircle size={16} />
            {post.comments?.length || 0} comments
          </div>
          {/* Delete post — owner or admin only */}
          {(post.author?._id === user?._id || user?.role === 'admin') && (
            <button onClick={handleDeletePost} disabled={deleting}
              className="ml-auto flex items-center gap-1.5 text-text-muted hover:text-danger transition-colors text-sm">
              <Trash2 size={15} />
              {deleting ? 'Deleting…' : 'Delete Post'}
            </button>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="card-base space-y-4">
        <h3 className="section-title mb-0">Comments</h3>

        {/* Add Comment */}
        <form onSubmit={handleComment} className="flex gap-2">
          <input value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Add a comment..." className="input-base flex-1" />
          <button type="submit" disabled={submitting || !comment.trim()} className="btn-primary px-3">
            <Send size={16} />
          </button>
        </form>

        {/* Comment List */}
        <div className="space-y-3">
          {post.comments?.length === 0 && (
            <p className="text-text-muted text-sm text-center py-4">No comments yet. Be the first!</p>
          )}
          {post.comments?.map((c) => (
            <div key={c._id} className="flex gap-3 group">
              <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-text-muted">
                  {c.user?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="flex-1 bg-surface-2 rounded-xl px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-text-primary text-xs font-semibold">{c.user?.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-[10px]">{formatRelative(c.createdAt)}</span>
                    {(c.user?._id === user?._id || user?.role === 'admin') && (
                      <button onClick={() => handleDeleteComment(c._id)}
                        className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger transition-all">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-text-secondary text-xs mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampusPost;
