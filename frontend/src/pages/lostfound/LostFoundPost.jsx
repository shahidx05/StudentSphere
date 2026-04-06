import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { formatDate, formatRelative } from '../../utils/formatDate';
import { ArrowLeft, MapPin, Phone, ExternalLink, CheckCircle, Trash2, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { getImageUrl } from '../../utils/imageUrl';
import { resolvePhoto } from '../../utils/resolvePhoto';

const LostFoundPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, refetch } = useFetch(`/api/lostfound/${id}`);
  const item = data?.data;
  const [imgIdx, setImgIdx] = useState(0);
  const [resolving, setResolving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner  = item?.postedBy?._id === user?._id;
  const canDelete = isOwner || user?.role === 'admin';

  const handleResolve = async () => {
    setResolving(true);
    try {
      await api.patch(`/api/lostfound/${id}/resolve`);
      toast.success('Marked as resolved!');
      refetch();
    } catch { toast.error('Failed to resolve'); }
    finally { setResolving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/lostfound/${id}`);
      toast.success('Report deleted.');
      navigate('/lostfound');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally { setDeleting(false); }
  };

  if (loading) return <PageSpinner />;
  if (!item) return <div className="text-center py-20 text-text-muted">Post not found.</div>;

  return (
    <div className="max-w-3xl animate-fade-in space-y-5">
      <button onClick={() => navigate('/lostfound')}
        className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Lost &amp; Found
      </button>

      <div className="card-base space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary">{item.title}</h1>
            <p className="text-text-muted text-sm mt-1">
              {formatRelative(item.createdAt)} · by {item.postedBy?.name}
            </p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant={item.status} size="md">{item.status}</Badge>
            {item.isResolved && <Badge variant="accent">Resolved ✓</Badge>}
          </div>
        </div>

        {/* Image Gallery */}
        {item.images?.length > 0 && (
          <div className="space-y-2">
            <div className="w-full h-56 rounded-xl overflow-hidden bg-surface-2 border border-border relative">
              <img
                src={getImageUrl(item.images[imgIdx])}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback shown on broken load */}
              <div className="absolute inset-0 flex-col items-center justify-center gap-2 bg-surface-2"
                style={{ display: 'none' }}>
                <ImageOff size={32} className="text-slate-600" />
                <span className="text-slate-500 text-sm">Image unavailable</span>
              </div>
            </div>
            {item.images.length > 1 && (
              <div className="flex gap-2">
                {item.images.map((img, i) => (
                  <img key={i} src={getImageUrl(img)} alt=""
                    onClick={() => setImgIdx(i)}
                    className={`w-14 h-14 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                      i === imgIdx ? 'border-primary' : 'border-border opacity-60 hover:opacity-100'
                    }`}
                    onError={e => { e.target.style.opacity = '0.3'; }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Who posted + their photo */}
        {item.postedBy?.profilePhoto && (
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <img src={resolvePhoto(item.postedBy.profilePhoto)} alt={item.postedBy.name}
              className="w-6 h-6 rounded-full object-cover" />
            <span>{item.postedBy.name}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-text-secondary text-sm leading-relaxed">{item.description}</p>

        {/* Details */}
        <div className="space-y-2.5 text-sm">
          {item.locationLost && (
            <div className="flex items-center gap-2 text-text-muted">
              <MapPin size={15} className="text-primary" />
              <span>Last seen: <span className="text-text-primary">{item.locationLost}</span></span>
            </div>
          )}
          {item.contactInfo && (
            <div className="flex items-center gap-2 text-text-muted">
              <Phone size={15} className="text-primary" />
              <span>Contact: <span className="text-text-primary">{item.contactInfo}</span></span>
            </div>
          )}
          {item.externalLink && (
            <a href={item.externalLink} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors">
              <ExternalLink size={15} /> Additional Info
            </a>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Actions */}
        <div className="space-y-2">
          {/* Mark Resolved — owner only, not yet resolved */}
          {isOwner && !item.isResolved && (
            <button onClick={handleResolve} disabled={resolving} className="btn-primary w-full">
              {resolving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><CheckCircle size={16} /> Mark as Resolved</>
              }
            </button>
          )}

          {/* Delete — owner or admin */}
          {canDelete && (
            <button onClick={handleDelete} disabled={deleting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50">
              {deleting
                ? <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                : <><Trash2 size={15} /> Delete Report</>
              }
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default LostFoundPost;
