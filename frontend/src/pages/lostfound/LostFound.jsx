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
import { formatDate, formatRelative } from '../../utils/formatDate';
import { Plus, Search, Package } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

const TABS = [
  { value: '', label: 'All' },
  { value: 'lost', label: '🔍 Lost' },
  { value: 'found', label: '✅ Found' },
  { value: 'resolved', label: '🎉 Resolved' },
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
  const { data: statsData } = useFetch('/api/lostfound/stats');

  const items = data?.data || [];
  const pagination = data?.pagination || {};
  const stats = statsData?.data || { lost: 0, found: 0 };

  return (
    <div className="space-y-6 slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">Lost & Found</h1>
          <p className="text-sm text-slate-400 mt-1">Report or discover lost items on campus</p>
        </div>
        <button onClick={() => navigate('/lostfound/add')} className="btn-primary w-fit">
          <Plus size={15} /> Report Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card flex items-center gap-3 bg-red-500/5 border border-red-500/15">
          <div className="icon-box-lg bg-red-500/10 border border-red-500/20">
            <Search size={20} className="text-red-400" />
          </div>
          <div>
            <p className="text-slate-500 text-xs">Lost Items</p>
            <p className="font-display text-2xl font-bold text-red-400">{stats.lost || 0}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/15">
          <div className="icon-box-lg bg-emerald-500/10 border border-emerald-500/20">
            <Package size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-500 text-xs">Found Items</p>
            <p className="font-display text-2xl font-bold text-emerald-400">{stats.found || 0}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3 bg-indigo-500/5 border border-indigo-500/15">
          <div className="icon-box-lg bg-indigo-500/10 border border-indigo-500/20">
            <Package size={20} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-slate-500 text-xs">Resolved</p>
            <p className="font-display text-2xl font-bold text-indigo-400">{stats.resolved || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl w-fit border border-white/5">
        {TABS.map(({ value, label }) => (
          <button key={value} onClick={() => { setTab(value); setPage(1); }}
            className={`tab-btn ${tab === value ? 'active' : ''}`}>{label}</button>
        ))}
      </div>

      <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search items..." />

      {loading ? <PageSpinner /> : items.length === 0 ? (
        <EmptyState icon="search" title="No items found"
          description="Try different filters or report a new item."
          action={<button onClick={() => navigate('/lostfound/add')} className="btn-primary"><Plus size={15} /> Report Item</button>} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item._id} className="glass-card p-5 flex flex-col gap-3 cursor-pointer"
                onClick={() => navigate(`/lostfound/${item._id}`)}>
                {item.images?.[0] && (
                  <div className="w-full h-36 rounded-xl overflow-hidden">
                    <img src={getImageUrl(item.images[0])} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white text-sm line-clamp-2 flex-1">{item.title}</h3>
                  <Badge variant={item.status}>{item.status}</Badge>
                </div>
                <p className="text-slate-400 text-xs line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-indigo-500/10 text-[10px] text-slate-500">
                  <span>{item.postedBy?.name}</span>
                  <span>{formatRelative(item.createdAt)}</span>
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

export default LostFound;
