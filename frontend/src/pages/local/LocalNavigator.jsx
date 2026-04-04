import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import { LOCAL_SERVICE_TYPES } from '../../utils/constants';
import { MapPin, Phone, Star, Wifi, Home, Coffee, Wrench, BookOpen } from 'lucide-react';

const TYPE_COLOR = { hostel: 'primary', mess: 'accent', pg: 'warning', hardware: 'orange', stationery: 'blue', other: 'default' };

const LocalNavigator = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({
    ...(tab && { type: tab }),
    ...(search && { search }),
    page, limit: 12,
  }).toString();

  const { data, loading } = useFetch(`/api/local?${params}`);
  const services = data?.data || [];
  const pagination = data?.pagination || {};

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={12} className={i < Math.round(rating) ? 'text-warning fill-warning' : 'text-muted'} />
    ));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-header">Local Navigator</h1>
        <p className="text-text-muted text-sm">Hostels, mess, PG, shops & services near campus</p>
      </div>

      {/* Type Tabs */}
      <div className="flex flex-wrap gap-1 bg-surface p-1 rounded-xl border border-border w-fit">
        {[{ value: '', label: 'All' }, ...LOCAL_SERVICE_TYPES].map(({ value, label }) => (
          <button key={value} onClick={() => { setTab(value); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${
              tab === value ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'
            }`}>{label}</button>
        ))}
      </div>

      <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search services..." />

      {loading ? <PageSpinner /> : services.length === 0 ? (
        <EmptyState icon="search" title="No services found" description="Try different filters or search terms." />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((svc) => (
              <div key={svc._id} onClick={() => navigate(`/local/${svc._id}`)}
                className="card-base card-glow cursor-pointer flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-text-primary text-sm">{svc.name}</h3>
                    <Badge variant={TYPE_COLOR[svc.type] || 'default'} size="xs">{svc.type}</Badge>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {renderStars(svc.avgRating || 0)}
                    <span className="text-text-muted text-[10px] ml-1">({svc.reviews?.length || 0})</span>
                  </div>
                </div>

                {svc.description && (
                  <p className="text-text-muted text-xs line-clamp-2">{svc.description}</p>
                )}

                {/* Facilities */}
                {svc.facilities?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {svc.facilities.slice(0, 4).map((f) => (
                      <span key={f} className="badge-base bg-surface-2 text-text-secondary border border-border text-[10px]">{f}</span>
                    ))}
                    {svc.facilities.length > 4 && (
                      <span className="text-[10px] text-muted">+{svc.facilities.length - 4} more</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  {svc.contact && (
                    <div className="flex items-center gap-1 text-text-muted">
                      <Phone size={11} /> {svc.contact}
                    </div>
                  )}
                  {svc.cost && (
                    <span className="text-accent font-semibold">₹{svc.cost}/mo</span>
                  )}
                </div>

                <button className="btn-primary py-1.5 text-xs w-full">
                  <MapPin size={13} /> View Details & Map
                </button>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default LocalNavigator;
