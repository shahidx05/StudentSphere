import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { PageSpinner } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { ArrowLeft, Star, Phone, MapPin, Send } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useState } from 'react';
import { formatRelative } from '../../utils/formatDate';

const MAP_CONTAINER = { width: '100%', height: '250px', borderRadius: '12px' };
const TYPE_COLOR = { hostel: 'primary', mess: 'accent', pg: 'warning', hardware: 'orange', stationery: 'blue', other: 'default' };

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, refetch } = useFetch(`/api/local/${id}`);
  const svc = data?.data;
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: MAPS_KEY || '' });

  const hasCoords = svc?.location?.coordinates?.length === 2;
  const center = hasCoords ? { lat: svc.location.coordinates[1], lng: svc.location.coordinates[0] } : { lat: 20.5937, lng: 78.9629 };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await api.post(`/api/local/${id}/review`, { rating, text: reviewText });
      toast.success('Review submitted!');
      setRating(0);
      setReviewText('');
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <PageSpinner />;
  if (!svc) return <div className="text-center py-20 text-text-muted">Service not found.</div>;

  return (
    <div className="max-w-3xl animate-fade-in space-y-5">
      <button onClick={() => navigate('/local')} className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Local Navigator
      </button>

      <div className="card-base space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary">{svc.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant={TYPE_COLOR[svc.type] || 'default'}>{svc.type}</Badge>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(svc.avgRating || 0) ? 'text-warning fill-warning' : 'text-muted'} />
                ))}
                <span className="text-text-muted text-xs ml-1">{(svc.avgRating || 0).toFixed(1)} ({svc.reviews?.length || 0})</span>
              </div>
            </div>
          </div>
          {svc.cost && <span className="text-accent font-bold text-xl font-display">₹{svc.cost}/mo</span>}
        </div>

        {svc.description && <p className="text-text-secondary text-sm">{svc.description}</p>}

        {/* Contact & Address */}
        <div className="flex flex-wrap gap-4 text-sm">
          {svc.contact && (
            <div className="flex items-center gap-2 text-text-muted">
              <Phone size={14} className="text-primary" /> {svc.contact}
            </div>
          )}
          {svc.address && (
            <div className="flex items-center gap-2 text-text-muted">
              <MapPin size={14} className="text-primary" /> {svc.address}
            </div>
          )}
        </div>

        {/* Facilities */}
        {svc.facilities?.length > 0 && (
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-2">Facilities</p>
            <div className="flex flex-wrap gap-1.5">
              {svc.facilities.map(f => (
                <span key={f} className="badge-base bg-surface-2 text-text-secondary border border-border text-xs">{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* Google Maps */}
        {isLoaded && (
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-2">Location Map</p>
            <GoogleMap mapContainerStyle={MAP_CONTAINER} center={center} zoom={15}
              options={{ styles: [{ elementType: 'geometry', stylers: [{ color: '#1C1C1C' }] }, { elementType: 'labels.text.stroke', stylers: [{ color: '#111111' }] }, { elementType: 'labels.text.fill', stylers: [{ color: '#6F6F6F' }] }] }}>
              {hasCoords && <Marker position={center} />}
            </GoogleMap>
          </div>
        )}
        {!isLoaded && MAPS_KEY === 'your_google_maps_api_key_here' && (
          <div className="h-16 rounded-xl bg-surface-2 border border-border flex items-center justify-center">
            <p className="text-text-muted text-xs">Configure VITE_GOOGLE_MAPS_API_KEY to see the map</p>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="card-base space-y-4">
        <h3 className="section-title">Reviews</h3>

        {/* Add Review */}
        <form onSubmit={handleReview} className="space-y-3 pb-4 border-b border-border">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={24}
                className={`cursor-pointer transition-all ${i < (hoverRating || rating) ? 'text-warning fill-warning' : 'text-muted'}`}
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i + 1)} />
            ))}
          </div>
          <div className="flex gap-2">
            <input value={reviewText} onChange={e => setReviewText(e.target.value)}
              placeholder="Write your review..." className="input-base flex-1" />
            <button type="submit" disabled={submitting} className="btn-primary px-3">
              <Send size={16} />
            </button>
          </div>
        </form>

        {/* Review List */}
        <div className="space-y-3">
          {svc.reviews?.length === 0 && (
            <p className="text-text-muted text-sm text-center py-4">No reviews yet.</p>
          )}
          {svc.reviews?.map((rev) => (
            <div key={rev._id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-text-muted">{rev.user?.name?.charAt(0) || '?'}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-text-primary text-xs font-semibold">{rev.user?.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: rev.rating }).map((_, i) => <Star key={i} size={10} className="text-warning fill-warning" />)}
                  </div>
                  <span className="text-text-muted text-[10px]">{formatRelative(rev.createdAt)}</span>
                </div>
                {rev.text && <p className="text-text-secondary text-xs mt-0.5">{rev.text}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
