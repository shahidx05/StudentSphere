import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Upload, Download, FileText, BookOpen, Bookmark, BookmarkCheck } from 'lucide-react';
import { DEPARTMENTS, YEARS } from '../../utils/constants';

const TYPE_TABS = [
  { value: '', label: 'All' },
  { value: 'notes', label: 'Notes' },
  { value: 'pyq', label: 'PYQs' },
  { value: 'department_notes', label: 'Dept. Notes' },
  { value: 'gate', label: 'GATE' },
  { value: 'course_resource', label: 'Courses' },
  { value: 'saved', label: '🔖 Saved' },
];

const TYPE_BADGE = {
  notes: 'primary', pyq: 'warning', department_notes: 'accent',
  gate: 'danger', course_resource: 'purple', learning_path: 'blue',
};

const ResourceHub = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);
  const [savedIds, setSavedIds] = useState(new Set());
  const [togglingId, setTogglingId] = useState(null);

  const isSavedTab = tab === 'saved';

  const params = new URLSearchParams({
    ...(tab && tab !== 'saved' && { type: tab }),
    ...(search && { search }),
    ...(department && { department }),
    ...(year && { year }),
    page, limit: 12,
  }).toString();

  const { data, loading, refetch } = useFetch(isSavedTab ? '/api/resources/bookmarks/me' : `/api/resources?${params}`);
  const resources = data?.data || [];
  const pagination = isSavedTab ? {} : (data?.pagination || {});

  const { data: bookmarkData } = useFetch('/api/resources/bookmarks/me');
  useEffect(() => {
    if (bookmarkData?.data) setSavedIds(new Set(bookmarkData.data.map(r => r._id)));
  }, [bookmarkData]);

  const handleDownload = async (resource) => {
    try {
      await api.patch(`/api/resources/${resource._id}/download`);
      if (resource.fileUrl) window.open(resource.fileUrl, '_blank');
      toast.success('Download started!');
      refetch();
    } catch { toast.error('Could not process download'); }
  };

  const handleBookmark = async (e, resourceId) => {
    e.stopPropagation();
    setTogglingId(resourceId);
    try {
      const { data: res } = await api.post(`/api/resources/${resourceId}/bookmark`);
      if (res.success) {
        setSavedIds(prev => {
          const next = new Set(prev);
          if (res.data.bookmarked) next.add(resourceId); else next.delete(resourceId);
          return next;
        });
        toast.success(res.message);
        if (isSavedTab) refetch();
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setTogglingId(null); }
  };

  return (
    <div className="space-y-6 slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">Resource Hub</h1>
          <p className="text-sm text-slate-400 mt-1">Notes, PYQs, GATE material & course resources</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/resources/learning-paths')} className="btn-secondary">
            <BookOpen size={15} /> Learning Paths
          </button>
          <button onClick={() => navigate('/resources/upload')} className="btn-primary">
            <Upload size={15} /> Upload
          </button>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl w-fit border border-white/5 overflow-x-auto">
        {TYPE_TABS.map(({ value, label }) => (
          <button key={value} onClick={() => { setTab(value); setPage(1); }}
            className={`tab-btn ${tab === value ? 'active' : ''}`}>{label}</button>
        ))}
      </div>

      {/* Filters */}
      {!isSavedTab && (
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search resources..." />
          </div>
          <select value={department} onChange={e => { setDepartment(e.target.value); setPage(1); }}
            className="input-field w-auto py-2 text-sm">
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={year} onChange={e => { setYear(e.target.value); setPage(1); }}
            className="input-field w-auto py-2 text-sm">
            <option value="">All Years</option>
            {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>
      )}

      {loading ? <PageSpinner /> : resources.length === 0 ? (
        <EmptyState icon="resources" title="No resources found"
          description={isSavedTab ? 'Bookmark resources to see them here.' : 'Try different filters or upload a resource.'}
          action={!isSavedTab && <button onClick={() => navigate('/resources/upload')} className="btn-primary"><Upload size={15} /> Upload Resource</button>} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(r => (
              <div key={r._id} className="glass-card p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="icon-box bg-gradient-to-br from-indigo-500 to-purple-600">
                    <FileText size={18} className="text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={TYPE_BADGE[r.type] || 'default'}>{r.type?.replace(/_/g, ' ')}</Badge>
                    <button onClick={e => handleBookmark(e, r._id)} disabled={togglingId === r._id}
                      title={savedIds.has(r._id) ? 'Remove bookmark' : 'Bookmark'}
                      className={`p-1.5 rounded-lg transition-all ${savedIds.has(r._id) ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10'}`}>
                      {savedIds.has(r._id) ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm line-clamp-2">{r.title}</h3>
                  {r.description && <p className="text-slate-400 text-xs mt-1 line-clamp-2">{r.description}</p>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {r.subject && <span className="badge badge-slate text-[10px]">{r.subject}</span>}
                  {r.department && <span className="badge badge-indigo text-[10px]">{r.department}</span>}
                  {r.year && <span className="badge badge-purple text-[10px]">Yr {r.year}</span>}
                </div>
                {r.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {r.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] text-indigo-400/70 bg-indigo-500/8 px-1.5 py-0.5 rounded">#{t}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-indigo-500/10">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
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
          {!isSavedTab && <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
};

export default ResourceHub;
