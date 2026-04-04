import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { ArrowLeft, Package, User, Phone, MapPin, Tag, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const MarketplaceItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, refetch } = useFetch(`/api/marketplace/${id}`);
  const item = data?.data;
  const [imgIdx, setImgIdx] = useState(0);
  const [marking, setMarking] = useState(false);

  const isOwner = item?.seller?._id === user?._id;
  const getConditionColor = (c) => ({ new: 'accent', good: 'blue', fair: 'warning', poor: 'danger' }[c] || 'default');

  const handleStatusChange = async (status) => {
    setMarking(true);
    try {
      await api.patch(`/api/marketplace/${id}/status`, { status });
      toast.success(`Marked as ${status}`);
      refetch();
    } catch { toast.error('Failed to update status'); }
    finally { setMarking(false); }
  };

  if (loading) return <PageSpinner />;
  if (!item) return <div className="text-center py-20 text-text-muted">Item not found.</div>;

  return (
    <div className="animate-fade-in space-y-6">
      <button onClick={() => navigate('/marketplace')} className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Marketplace
      </button>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="w-full h-72 rounded-xl bg-surface-2 border border-border flex items-center justify-center overflow-hidden">
            {item.images?.[imgIdx] ? (
              <img src={item.images[imgIdx]} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <Package size={48} className="text-muted" />
            )}
          </div>
          {item.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {item.images.map((img, i) => (
                <img key={i} src={img} alt="" onClick={() => setImgIdx(i)}
                  className={`w-14 h-14 rounded-lg object-cover cursor-pointer border-2 transition-all ${i === imgIdx ? 'border-primary' : 'border-border'}`} />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-bold text-text-primary">{item.title}</h1>
            <Badge variant={item.status}>{item.status}</Badge>
          </div>

          <div className="flex items-center gap-3">
            <p className={`text-3xl font-display font-bold ${item.isFree ? 'text-accent' : 'text-primary'}`}>
              {item.isFree ? 'FREE' : formatCurrency(item.price)}
            </p>
            <Badge variant={getConditionColor(item.condition)}>{item.condition}</Badge>
          </div>

          <p className="text-text-secondary text-sm">{item.description}</p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-text-muted">
              <Tag size={14} /> <span className="capitalize">{item.category?.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <User size={14} /> <span>{item.seller?.name}</span>
              {item.seller?.department && <span className="text-text-muted">· {item.seller.department}</span>}
            </div>
            {item.contactInfo && (
              <div className="flex items-center gap-2 text-text-muted">
                <Phone size={14} /> <span>{item.contactInfo}</span>
              </div>
            )}
            {item.shopAddress && (
              <div className="flex items-center gap-2 text-text-muted">
                <MapPin size={14} /> <span>{item.shopAddress}</span>
              </div>
            )}
          </div>

          <p className="text-text-muted text-xs">Listed on {formatDate(item.createdAt)}</p>

          {/* Owner actions */}
          {isOwner && item.status === 'available' && (
            <div className="flex gap-3 pt-2">
              <button onClick={() => handleStatusChange('reserved')} disabled={marking}
                className="btn-secondary flex-1">Mark Reserved</button>
              <button onClick={() => handleStatusChange('sold')} disabled={marking}
                className="btn-primary flex-1">
                <CheckCircle size={16} /> Mark Sold
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceItem;
