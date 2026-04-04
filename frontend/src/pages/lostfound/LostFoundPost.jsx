import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { formatDate, formatRelative } from '../../utils/formatDate';
import { ArrowLeft, MapPin, Phone, ExternalLink, CheckCircle, Image as ImgIcon } from 'lucide-react';
import { useState } from 'react';
import { getImageUrl } from '../../utils/imageUrl';

const LostFoundPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, refetch } = useFetch(`/api/lostfound/${id}`);
  const item = data?.data;
  const [imgIdx, setImgIdx] = useState(0);
  const [resolving, setResolving] = useState(false);

  const isOwner = item?.postedBy?._id === user?._id;

  const handleResolve = async () => {
    setResolving(true);
    try {
      await api.patch(`/api/lostfound/${id}/resolve`);
      toast.success('Marked as resolved!');
      refetch();
    } catch { toast.error('Failed'); }
    finally { setResolving(false); }
  };

  if (loading) return <PageSpinner />;
  if (!item) return <div className="text-center py-20 text-text-muted">Post not found.</div>;

  return (
    <div className="max-w-3xl animate-fade-in space-y-5">
      <button onClick={() => navigate('/lostfound')} className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Lost & Found
      </button>

      <div className="card-base space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary">{item.title}</h1>
            <p className="text-text-muted text-sm mt-1">{formatRelative(item.createdAt)} · by {item.postedBy?.name}</p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant={item.status} size="md">{item.status}</Badge>
            {item.isResolved && <Badge variant="accent">Resolved ✓</Badge>}
          </div>
        </div>

        {/* Image Gallery */}
        {item.images?.length > 0 && (
          <div className="space-y-2">
            <div className="w-full h-56 rounded-xl overflow-hidden bg-surface-2 border border-border">
              <img src={getImageUrl(item.images[imgIdx])} alt={item.title} className="w-full h-full object-cover" />
            </div>
            {item.images.length > 1 && (
              <div className="flex gap-2">
                {item.images.map((img, i) => (
                  <img key={i} src={getImageUrl(img)} alt="" onClick={() => setImgIdx(i)}
                    className={`w-14 h-14 rounded-lg object-cover cursor-pointer border-2 transition-all ${i === imgIdx ? 'border-primary' : 'border-border'}`} />
                ))}
              </div>
            )}
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

        {/* Resolve Button */}
        {isOwner && !item.isResolved && (
          <button onClick={handleResolve} disabled={resolving} className="btn-primary w-full">
            <CheckCircle size={16} /> Mark as Resolved
          </button>
        )}
      </div>
    </div>
  );
};

export default LostFoundPost;
