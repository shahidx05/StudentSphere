import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatRelative } from '../../utils/formatDate';
import { Plus, Search, MapPin, Phone, Image as ImageIcon } from 'lucide-react';

const TABS = [
  { value: '', label: 'All' },
  { value: 'lost', label: 'Lost' },
  { value: 'found', label: 'Found' },
  { value: 'resolved', label: 'Resolved' },
];

const LostFound = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const isResolved = tab === 'resolved';
  const statusFilter = isResolved ? '' : tab;

  const params = new URLSearchParams({
    ...(statusFilter && { status: statusFilter }),
    ...(isResolved && { isResolved: 'true' }),
    ...(!isResolved && tab === '' && { isResolved: 'false' }),
    ...(search && { search }),
    page, limit: 12,
  }).toString();

  const { data, loading } = useFetch(`/api/lostfound?${params}`);
  const items = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Lost & Found</h1>
          <p className="text-text-muted text-sm">Help reunite people with their belongings</p>
        </div>
        <button onClick={() => navigate('/lostfound/add')} className="btn-primary">
          <Plus size={16} /> Report Item
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface p-1 rounded-xl border border-border w-fit">
        {TABS.map(({ value, label }) => (
          <button key={value} onClick={() => { setTab(value); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === value ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'
            }`}>{label}</button>
        ))}
      </div>

      <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search lost items..." />

      {loading ? <PageSpinner /> : items.length === 0 ? (
        <EmptyState title="Nothing reported" description="Report a lost or found item to help the community."
          action={<button onClick={() => navigate('/lostfound/add')} className="btn-primary">Report Item</button>} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item._id} onClick={() => navigate(`/lostfound/${item._id}`)}
                className="card-base card-glow cursor-pointer flex flex-col gap-3">
                {/* Image */}
                <div className="w-full h-32 rounded-lg bg-surface-2 border border-border flex items-center justify-center overflow-hidden">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <Search size={28} className="text-muted" />
                  )}
                </div>
                {/* Content */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-text-primary font-semibold text-sm line-clamp-2 flex-1">{item.title}</h3>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={item.status}>{item.status}</Badge>
                    {item.isResolved && <Badge variant="muted">Resolved</Badge>}
                  </div>
                </div>
                {item.locationLost && (
                  <div className="flex items-center gap-1.5 text-text-muted text-xs">
                    <MapPin size={12} /> {item.locationLost}
                  </div>
                )}
                <p className="text-text-muted text-xs">{formatRelative(item.createdAt)}</p>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default LostFound;
