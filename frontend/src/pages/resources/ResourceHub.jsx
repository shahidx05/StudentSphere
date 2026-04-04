import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import SearchBar from '../../components/ui/SearchBar';
import FilterBar from '../../components/ui/FilterBar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Upload, Download, FileText, BookOpen, ExternalLink } from 'lucide-react';
import { formatDate, formatRelative } from '../../utils/formatDate';
import { DEPARTMENTS, YEARS } from '../../utils/constants';

const TABS = [
  { value: '', label: 'All' },
  { value: 'notes', label: 'Notes' },
  { value: 'pyq', label: 'PYQs' },
  { value: 'department_notes', label: 'Dept. Notes' },
  { value: 'gate', label: 'GATE' },
  { value: 'course_resource', label: 'Courses' },
];

const TYPE_BADGE = {
  notes: 'primary', pyq: 'warning', department_notes: 'accent',
  gate: 'danger', course_resource: 'purple', learning_path: 'blue',
};

const ResourceHub = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department: '', year: '' });
  const [page, setPage] = useState(1);
  const limit = 12;

  const params = new URLSearchParams({
    ...(tab && { type: tab }),
    ...(search && { search }),
    ...(filters.department && { department: filters.department }),
    ...(filters.year && { year: filters.year }),
    page, limit,
  }).toString();

  const { data, loading, refetch } = useFetch(`/api/resources?${params}`);
  const resources = data?.data || [];
  const pagination = data?.pagination || {};

  const handleDownload = async (resource) => {
    try {
      await api.patch(`/api/resources/${resource._id}/download`);
      if (resource.fileUrl) window.open(resource.fileUrl, '_blank');
      toast.success('Download started!');
      refetch();
    } catch {
      toast.error('Could not process download');
    }
  };

  const filterConfig = [
    { key: 'department', label: 'Department', options: DEPARTMENTS.map(d => ({ value: d, label: d })) },
    { key: 'year', label: 'Year', options: YEARS.map(y => ({ value: y, label: `Year ${y}` })) },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Resource Hub</h1>
          <p className="text-text-muted text-sm">Notes, PYQs, GATE material & course resources</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/resources/learning-paths')} className="btn-secondary">
            <BookOpen size={16} /> Learning Paths
          </button>
          <button onClick={() => navigate('/resources/upload')} className="btn-primary">
            <Upload size={16} /> Upload
          </button>
        </div>
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search resources..." />
        </div>
        <FilterBar filters={filterConfig} values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} />
      </div>

      {/* Content */}
      {loading ? <PageSpinner /> : resources.length === 0 ? (
        <EmptyState icon="resources" title="No resources found"
          description="Try changing the filters or upload a resource to share with others."
          action={<button onClick={() => navigate('/resources/upload')} className="btn-primary">Upload Resource</button>} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((r) => (
              <div key={r._id} className="card-base card-glow flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center border border-border flex-shrink-0">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <Badge variant={TYPE_BADGE[r.type] || 'default'}>
                    {r.type?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="flex-1">
                  <h3 className="text-text-primary font-semibold text-sm line-clamp-2">{r.title}</h3>
                  {r.description && <p className="text-text-muted text-xs mt-1 line-clamp-2">{r.description}</p>}
                </div>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {r.subject && <span className="badge-base bg-surface-2 text-text-secondary border border-border">{r.subject}</span>}
                  {r.department && <span className="badge-base bg-surface-2 text-text-secondary border border-border">{r.department}</span>}
                  {r.year && <span className="badge-base bg-surface-2 text-text-secondary border border-border">Year {r.year}</span>}
                </div>
                {r.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {r.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded">#{t}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-[10px] text-text-muted">
                    <span>{r.uploadedBy?.name}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Download size={10} /> {r.downloadCount}</span>
                  </div>
                  <button onClick={() => handleDownload(r)} className="btn-primary py-1.5 px-3 text-xs">
                    <Download size={12} /> Download
                  </button>
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

export default ResourceHub;
