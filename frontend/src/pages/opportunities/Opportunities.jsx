import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import SearchBar from '../../components/ui/SearchBar';
import CountdownTimer from '../../components/ui/CountdownTimer';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatDate } from '../../utils/formatDate';
import { OPPORTUNITY_TYPES } from '../../utils/constants';
import { ExternalLink, Calendar, Building, Tag } from 'lucide-react';

const TABS = [
  { value: '', label: 'All' },
  { value: 'internship', label: 'Internships' },
  { value: 'scholarship', label: 'Scholarships' },
  { value: 'hackathon', label: 'Hackathons' },
  { value: 'job', label: 'Jobs' },
  { value: 'competition', label: 'Competitions' },
];

const getTypeStyle = (type) => {
  const map = {
    internship: 'blue', scholarship: 'accent', hackathon: 'purple',
    job: 'warning', competition: 'orange',
  };
  return map[type] || 'default';
};

const Opportunities = () => {
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({
    ...(tab && { type: tab }),
    ...(search && { search }),
    sortBy: 'lastDate', order: 'asc',
    page, limit: 9,
  }).toString();

  const { data, loading } = useFetch(`/api/opportunities?${params}`);
  const opportunities = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-header">Opportunities</h1>
        <p className="text-text-muted text-sm">Internships, scholarships, hackathons & more</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface p-1 rounded-xl border border-border w-fit overflow-x-auto">
        {TABS.map(({ value, label }) => (
          <button key={value} onClick={() => { setTab(value); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === value ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search opportunities..." />

      {loading ? <PageSpinner /> : opportunities.length === 0 ? (
        <EmptyState icon="default" title="No opportunities found" description="Check back soon for new opportunities." />
      ) : (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {opportunities.map((opp) => (
              <div key={opp._id}
                className={`card-base card-glow flex flex-col gap-3 ${
                  opp.daysLeft < 3 ? 'border-danger/40' : opp.daysLeft < 7 ? 'border-warning/40' : ''
                }`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold text-text-primary text-sm line-clamp-2 flex-1">{opp.title}</h3>
                  <Badge variant={getTypeStyle(opp.type)}>{opp.type}</Badge>
                </div>

                {/* Org */}
                <div className="flex items-center gap-2 text-text-muted text-xs">
                  <Building size={12} />
                  <span>{opp.organization}</span>
                </div>

                {/* Description */}
                <p className="text-text-muted text-xs line-clamp-2">{opp.description}</p>

                {/* Tags */}
                {opp.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {opp.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded">#{t}</span>
                    ))}
                  </div>
                )}

                {/* Dates */}
                <div className="flex items-center gap-2 text-text-muted text-xs">
                  <Calendar size={12} />
                  <span>Deadline: <span className="text-text-secondary">{formatDate(opp.lastDate)}</span></span>
                </div>

                {/* Countdown */}
                <div className="flex items-center justify-between">
                  <CountdownTimer deadline={opp.lastDate} />
                </div>

                {/* Apply button */}
                {opp.applyLink && (
                  <a href={opp.applyLink} target="_blank" rel="noreferrer"
                    className="btn-primary w-full mt-auto">
                    Apply Now <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default Opportunities;
