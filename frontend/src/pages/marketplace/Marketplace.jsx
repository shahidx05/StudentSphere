import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import { MARKETPLACE_CATEGORIES, MARKETPLACE_CONDITIONS } from '../../utils/constants';
import { Plus, Package, Star, Filter } from 'lucide-react';

const TABS = [
  { value: '', label: 'All' },
  { value: 'secondhand', label: 'Second Hand' },
  { value: 'local_shop', label: 'Local Shops' },
];

const Marketplace = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', status: 'available' });
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({
    ...(tab && { section: tab }),
    ...(search && { search }),
    ...(filters.category && { category: filters.category }),
    ...(filters.status && { status: filters.status }),
    page, limit: 12,
  }).toString();

  const { data, loading } = useFetch(`/api/marketplace?${params}`);
  const items = data?.data || [];
  const pagination = data?.pagination || {};

  const getConditionColor = (c) => ({ new: 'accent', good: 'blue', fair: 'warning', poor: 'danger' }[c] || 'default');

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Marketplace</h1>
          <p className="text-text-muted text-sm">Buy and sell student items</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/marketplace/my-listings')} className="btn-secondary">My Listings</button>
          <button onClick={() => navigate('/marketplace/add')} className="btn-primary">
            <Plus size={16} /> Add Listing
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface p-1 rounded-xl border border-border w-fit">
        {TABS.map(({ value, label }) => (
          <button key={value} onClick={() => { setTab(value); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === value ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search items..." />
        </div>
        <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className="input-base w-auto min-w-[150px]">
          <option value="">All Categories</option>
          {MARKETPLACE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="input-base w-auto min-w-[150px]">
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="reserved">Reserved</option>
        </select>
      </div>

      {loading ? <PageSpinner /> : items.length === 0 ? (
        <EmptyState title="No listings found" description="Be the first to list an item!"
          action={<button onClick={() => navigate('/marketplace/add')} className="btn-primary">Add Listing</button>} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item._id} onClick={() => navigate(`/marketplace/${item._id}`)}
                className="card-base card-glow cursor-pointer flex flex-col gap-3">
                {/* Image */}
                <div className="w-full h-36 rounded-lg bg-surface-2 flex items-center justify-center overflow-hidden border border-border">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={32} className="text-muted" />
                  )}
                </div>
                {/* Content */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-text-primary text-sm font-semibold line-clamp-2 flex-1">{item.title}</h3>
                  <Badge variant={item.status}>{item.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-base font-display font-bold ${item.isFree ? 'text-accent' : 'text-text-primary'}`}>
                    {item.isFree ? 'FREE' : formatCurrency(item.price)}
                  </p>
                  <Badge variant={getConditionColor(item.condition)}>{item.condition}</Badge>
                </div>
                <p className="text-text-muted text-xs">{item.seller?.name} · {item.category?.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default Marketplace;
