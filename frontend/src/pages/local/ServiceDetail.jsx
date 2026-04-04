import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { PageSpinner } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { ArrowLeft, Star, Phone, MapPin, Send } from 'lucide-react';
import { formatRelative } from '../../utils/formatDate';

// ─── Pure vanilla Leaflet map (no react-leaflet) ──────────────────────────────
const ServiceMap = ({ lat, lng, name }) => {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    import('leaflet').then((mod) => {
      const L = mod.default;

      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, { center: [lat, lng], zoom: 15, scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      L.marker([lat, lng]).addTo(map).bindPopup(`<strong>${name}</strong>`).openPopup();

      instanceRef.current = map;
    });

    return () => {
      if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; }
    };
  }, [lat, lng, name]);

  return <div ref={mapRef} style={{ height: '220px', width: '100%', borderRadius: '12px' }} />;
};
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_BADGE = { hostel: 'hostel', mess: 'mess', pg: 'pg', hardware: 'hardware', stationery: 'stationery', other: 'default' };

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, refetch } = useFetch(`/api/local/${id}`);
  const svc = data?.data;
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasCoords = svc?.latitude && svc?.longitude;

  const handleReview = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      await api.post(`/api/local/${id}/review`, { rating, text: reviewText });
      toast.success('Review submitted!');
      setRating(0); setReviewText(''); refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <PageSpinner />;
  if (!svc) return <div className="text-center py-20 text-slate-500">Service not found.</div>;

  return (
    <div className="max-w-3xl slide-up space-y-5">
      <button onClick={() => navigate('/local')}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Local Navigator
      </button>

      {/* Main Card */}
      <div className="glass-card p-6 space-y-5" style={{ transform: 'none' }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">{svc.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant={TYPE_BADGE[svc.type] || 'default'}>{svc.type}</Badge>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13}
                    className={i < Math.round(svc.avgRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'} />
                ))}
                <span className="text-slate-500 text-xs ml-1">
                  {(svc.avgRating || 0).toFixed(1)} ({svc.reviews?.length || 0})
                </span>
              </div>
            </div>
          </div>
          {svc.cost && (
            <div className="text-right flex-shrink-0">
              <p className="text-emerald-400 font-bold text-xl font-display">
                ₹{svc.cost}<span className="text-xs text-slate-500">/month</span>
              </p>
            </div>
          )}
        </div>

        {svc.description && <p className="text-slate-300 text-sm">{svc.description}</p>}

        {/* Contact & Address */}
        <div className="flex flex-wrap gap-4 text-sm">
          {svc.contact && (
            <div className="flex items-center gap-2 text-slate-400">
              <Phone size={14} className="text-indigo-400" /> {svc.contact}
            </div>
          )}
          {svc.address && (
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin size={14} className="text-indigo-400" /> {svc.address}
            </div>
          )}
        </div>

        {/* Facilities */}
        {svc.facilities?.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Facilities</p>
            <div className="flex flex-wrap gap-1.5">
              {svc.facilities.map(f => (
                <span key={f} className="badge badge-slate text-xs">{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* Map */}
        {hasCoords && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Location</p>
            <div className="rounded-xl overflow-hidden">
              <ServiceMap lat={svc.latitude} lng={svc.longitude} name={svc.name} />
            </div>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="glass-card p-6 space-y-4" style={{ transform: 'none' }}>
        <h3 className="section-header"><Star size={16} className="text-amber-400" /> Reviews</h3>

        {/* Add Review */}
        <form onSubmit={handleReview} className="space-y-3 pb-4 border-b border-indigo-500/10">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={24}
                className={`cursor-pointer transition-all ${i < (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i + 1)} />
            ))}
          </div>
          <div className="flex gap-2">
            <input value={reviewText} onChange={e => setReviewText(e.target.value)}
              placeholder="Write your review..." className="input-field flex-1" />
            <button type="submit" disabled={submitting} className="btn-primary px-4">
              <Send size={15} />
            </button>
          </div>
        </form>

        {/* Review List */}
        <div className="space-y-3">
          {(!svc.reviews || svc.reviews.length === 0) && (
            <p className="text-slate-500 text-sm text-center py-4">No reviews yet. Be the first!</p>
          )}
          {svc.reviews?.map((rev) => (
            <div key={rev._id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-white">{rev.user?.name?.[0]?.toUpperCase() || '?'}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white text-xs font-semibold">{rev.user?.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-slate-600 text-[10px]">{formatRelative(rev.createdAt)}</span>
                </div>
                {rev.text && <p className="text-slate-400 text-xs mt-0.5">{rev.text}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
