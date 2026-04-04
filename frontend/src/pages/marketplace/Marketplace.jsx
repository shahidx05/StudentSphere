import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatRelative } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { MARKETPLACE_CATEGORIES, MARKETPLACE_CONDITIONS } from '../../utils/constants';
import { Plus, Package, Tag, User, Star } from 'lucide-react';

const TABS = [
  { value: '', label: 'All' },
  ...MARKETPLACE_CATEGORIES.map(c => ({ value: c.value, label: c.label })),
];

const STATUS_TABS = [
  { value: '', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'sold', label: 'Sold' },
  { value: 'reserved', label: 'Reserved' },
];

const getConditionColor = (c) =>
  ({ new: 'text-emerald-400', good: 'text-blue-400', fair: 'text-amber-400', poor: 'text-red-400' }[c] || 'text-slate-400');

const Marketplace = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({
    ...(category && { category }),
    ...(status && { status }),
    ...(search && { search }),
    page, limit: 12,
  }).toString();

  const { data, loading } = useFetch(`/api/marketplace?${params}`);
  const items = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6 slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">Marketplace</h1>
          <p className="text-sm text-slate-400 mt-1">Buy and sell with fellow students</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/marketplace/my-listings')} className="btn-secondary">My Listings</button>
          <button onClick={() => navigate('/marketplace/add')} className="btn-primary"><Plus size={15} /> Add Listing</button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl w-fit border border-white/5 overflow-x-auto">
        {TABS.map(({ value, label }) => (
          <button key={value} onClick={() => { setCategory(value); setPage(1); }}
            className={`tab-btn ${category === value ? 'active' : ''}`}>{label}</button>
        ))}
      </div>

      {/* Status + Search */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/5">
          {STATUS_TABS.map(({ value, label }) => (
            <button key={value} onClick={() => { setStatus(value); setPage(1); }}
              className={`tab-btn text-xs py-1 px-2.5 ${status === value ? 'active' : ''}`}>{label}</button>
          ))}
        </div>
        <div className="flex-1 min-w-[200px]">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search listings..." />
        </div>
      </div>

      {loading ? <PageSpinner /> : items.length === 0 ? (
        <EmptyState icon="default" title="No listings found" description="Be the first to sell something!"
          action={<button onClick={() => navigate('/marketplace/add')} className="btn-primary"><Plus size={15} /> Add Listing</button>} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(item => (
              <div key={item._id} className="glass-card p-0 overflow-hidden cursor-pointer group"
                onClick={() => navigate(`/marketplace/${item._id}`)}>
                {/* Image */}
                <div className="w-full h-40 bg-indigo-500/5 flex items-center justify-center overflow-hidden">
                  {item.images?.[0]
                    ? <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <Package size={32} className="text-slate-700" />
                  }
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-white text-sm line-clamp-2 flex-1">{item.title}</h3>
                    <Badge variant={item.status || 'available'}>{item.status || 'available'}</Badge>
                  </div>
                  <p className={`text-lg font-bold font-display mb-2 ${item.isFree ? 'text-emerald-400' : 'text-indigo-400'}`}>
                    {item.isFree ? 'FREE' : formatCurrency(item.price)}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    {item.category && (
                      <span className="flex items-center gap-1"><Tag size={10} /> {item.category}</span>
                    )}
                    {item.condition && (
                      <span className={`flex items-center gap-1 font-medium ${getConditionColor(item.condition)}`}>
                        <Star size={10} /> {item.condition}
                      </span>
                    )}
                  </div>
                  {item.seller && (
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">
                      <User size={10} /> {item.seller?.name}
                      <span className="ml-auto">{formatRelative(item.createdAt)}</span>
                    </div>
                  )}
                </div>
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
