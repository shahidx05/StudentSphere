import { useState, useEffect } from 'react';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import SearchBar from '../../components/ui/SearchBar';
import CountdownTimer from '../../components/ui/CountdownTimer';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatDate } from '../../utils/formatDate';
import { ExternalLink, Calendar, Building, Heart } from 'lucide-react';

const TABS = [
  { value: '', label: 'All' },
  { value: 'internship', label: 'Internships' },
  { value: 'scholarship', label: 'Scholarships' },
  { value: 'hackathon', label: 'Hackathons' },
  { value: 'job', label: 'Jobs' },
  { value: 'competition', label: 'Competitions' },
  { value: 'saved', label: '❤️ Saved' },
];

const TYPE_BADGE = { internship: 'internship', scholarship: 'scholarship', hackathon: 'hackathon', job: 'job', competition: 'competition' };

const Opportunities = () => {
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [savedIds, setSavedIds] = useState(new Set());
  const [togglingId, setTogglingId] = useState(null);

  const isSavedTab = tab === 'saved';
  const params = new URLSearchParams({
    ...(tab && tab !== 'saved' && { type: tab }),
    ...(search && { search }),
    sortBy: 'lastDate', order: 'asc', page, limit: 9,
  }).toString();

  const { data, loading, refetch } = useFetch(isSavedTab ? '/api/opportunities/saved/me' : `/api/opportunities?${params}`);
  const opportunities = data?.data || [];
  const pagination = isSavedTab ? {} : (data?.pagination || {});

  const { data: savedData, refetch: refetchSaved } = useFetch('/api/opportunities/saved/me');
  useEffect(() => {
    if (savedData?.data) setSavedIds(new Set(savedData.data.map(o => o._id)));
  }, [savedData]);

  const handleSaveToggle = async (e, oppId) => {
    e.stopPropagation();
    setTogglingId(oppId);
    try {
      const { data: res } = await api.post(`/api/opportunities/${oppId}/save`);
      if (res.success) {
        setSavedIds(prev => {
          const next = new Set(prev);
          if (res.data.saved) next.add(oppId); else next.delete(oppId);
          return next;
        });
        toast.success(res.message);
        if (isSavedTab) refetch();
        refetchSaved();
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setTogglingId(null); }
  };

  return (
    <div className="space-y-6 slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">Opportunities</h1>
          <p className="text-sm text-slate-400 mt-1">Internships, scholarships, hackathons & more</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl w-fit border border-white/5 overflow-x-auto">
        {TABS.map(({ value, label }) => (
          <button key={value} onClick={() => { setTab(value); setPage(1); }}
            className={`tab-btn ${tab === value ? 'active' : ''}`}>{label}</button>
        ))}
      </div>

      {!isSavedTab && <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search opportunities..." />}

      {loading ? <PageSpinner /> : opportunities.length === 0 ? (
        <EmptyState icon="default"
          title={isSavedTab ? 'No saved opportunities' : 'No opportunities found'}
          description={isSavedTab ? 'Save opportunities by clicking the heart icon.' : 'Check back soon for new listings.'} />
      ) : (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {opportunities.map(opp => (
              <div key={opp._id} className="glass-card p-5 flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold text-white text-sm line-clamp-2 flex-1">{opp.title}</h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge variant={TYPE_BADGE[opp.type] || 'default'}>{opp.type}</Badge>
                    <button
                      onClick={e => handleSaveToggle(e, opp._id)}
                      disabled={togglingId === opp._id}
                      className={`p-1.5 rounded-lg transition-all ${savedIds.has(opp._id) ? 'text-red-400 bg-red-500/10' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'}`}
                    >
                      <Heart size={14} className={savedIds.has(opp._id) ? 'fill-red-400' : ''} />
                    </button>
                  </div>
                </div>

                {/* Org */}
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Building size={12} />
                  <span>{opp.organization}</span>
                </div>

                <p className="text-slate-400 text-xs line-clamp-2">{opp.description}</p>

                {opp.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {opp.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] text-indigo-400/70 bg-indigo-500/8 px-1.5 py-0.5 rounded-md">#{t}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Calendar size={12} />
                  <span>Deadline: <span className="text-slate-300">{formatDate(opp.lastDate)}</span></span>
                </div>

                <CountdownTimer deadline={opp.lastDate} />

                {opp.applyLink && (
                  <a href={opp.applyLink} target="_blank" rel="noreferrer" className="btn-primary w-full mt-auto text-sm">
                    Apply Now <ExternalLink size={13} />
                  </a>
                )}
              </div>
            ))}
          </div>
          {!isSavedTab && <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
};

export default Opportunities;
