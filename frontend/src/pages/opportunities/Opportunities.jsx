import { useState, useEffect } from 'react';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../../components/ui/SearchBar';
import CountdownTimer from '../../components/ui/CountdownTimer';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatDate } from '../../utils/formatDate';
import {
  ExternalLink, Calendar, Building, Heart, Plus, Edit3, Trash2,
  Briefcase, GraduationCap, Code2, Handshake, Trophy, X,
} from 'lucide-react';

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { value: '',             label: 'All'           },
  { value: 'internship',  label: 'Internships'   },
  { value: 'scholarship', label: 'Scholarships'  },
  { value: 'hackathon',   label: 'Hackathons'    },
  { value: 'job',         label: 'Jobs'          },
  { value: 'competition', label: 'Competitions'  },
  { value: 'saved',       label: 'Saved'         },
];

const TAB_ICONS = {
  internship:  <Briefcase size={12} />,
  scholarship: <GraduationCap size={12} />,
  hackathon:   <Code2 size={12} />,
  job:         <Handshake size={12} />,
  competition: <Trophy size={12} />,
};

const TYPE_OPTS = ['internship', 'scholarship', 'hackathon', 'job', 'competition'];

const EMPTY_FORM = {
  title: '', type: 'internship', organization: '', description: '',
  applyLink: '', startDate: '', lastDate: '', tags: '', isActive: true,
};

// ─── Admin Form ───────────────────────────────────────────────────────────────
const OpportunityForm = ({ initial, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => { e.preventDefault(); onSave(form); };

  // Format date for input[type=date]
  const fmtDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        {/* Title */}
        <div className="col-span-2">
          <label className="text-xs text-slate-400 mb-1 block">Title *</label>
          <input value={form.title} onChange={set('title')} required
            className="input-field" placeholder="Google Summer of Code 2025" />
        </div>

        {/* Type */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Type *</label>
          <select value={form.type} onChange={set('type')} className="input-field">
            {TYPE_OPTS.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Organization */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Organization *</label>
          <input value={form.organization} onChange={set('organization')} required
            className="input-field" placeholder="Google, AICTE, etc." />
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className="text-xs text-slate-400 mb-1 block">Description</label>
          <textarea value={form.description} onChange={set('description')} rows={3}
            className="input-field resize-none" placeholder="Brief description..." />
        </div>

        {/* Apply link */}
        <div className="col-span-2">
          <label className="text-xs text-slate-400 mb-1 block">Apply Link</label>
          <input value={form.applyLink} onChange={set('applyLink')}
            className="input-field" placeholder="https://..." type="url" />
        </div>

        {/* Dates */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Start Date</label>
          <input type="date" value={fmtDate(form.startDate)} onChange={set('startDate')}
            className="input-field" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Deadline *</label>
          <input type="date" value={fmtDate(form.lastDate)} onChange={set('lastDate')} required
            className="input-field" />
        </div>

        {/* Tags */}
        <div className="col-span-2">
          <label className="text-xs text-slate-400 mb-1 block">Tags (comma separated)</label>
          <input value={form.tags} onChange={set('tags')}
            className="input-field" placeholder="react, python, open-source" />
        </div>

        {/* Active toggle */}
        {initial && (
          <div className="col-span-2 flex items-center gap-3">
            <button type="button"
              onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className={`w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${
                form.isActive ? 'bg-indigo-500' : 'bg-slate-700'
              }`}>
              <span className={`block w-4 h-4 rounded-full bg-white mx-0.5 transition-transform duration-200 ${
                form.isActive ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
            <span className="text-sm text-slate-400">
              {form.isActive ? 'Active (visible to students)' : 'Inactive (hidden)'}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2 sticky bottom-0 bg-transparent">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : initial ? 'Save Changes' : 'Post Opportunity'
          }
        </button>
      </div>
    </form>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Opportunities = () => {
  const { user } = useAuth();
  const isAdmin   = user?.role === 'admin';

  const [tab,        setTab]        = useState('');
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  const [savedIds,   setSavedIds]   = useState(new Set());
  const [togglingId, setTogglingId] = useState(null);

  // Admin modal state
  const [showForm,   setShowForm]   = useState(false);
  const [editItem,   setEditItem]   = useState(null);  // null = add, obj = edit
  const [deleteId,   setDeleteId]   = useState(null);
  const [saving,     setSaving]     = useState(false);

  const isSavedTab = tab === 'saved';
  const params = new URLSearchParams({
    ...(tab && tab !== 'saved' && { type: tab }),
    ...(search && { search }),
    sortBy: 'lastDate', order: 'asc', page, limit: 9,
  }).toString();

  const { data, loading, refetch } = useFetch(
    isSavedTab ? '/api/opportunities/saved/me' : `/api/opportunities?${params}`
  );
  const opportunities = data?.data || [];
  const pagination    = isSavedTab ? {} : (data?.pagination || {});

  const { data: savedData, refetch: refetchSaved } = useFetch('/api/opportunities/saved/me');
  useEffect(() => {
    if (savedData?.data) setSavedIds(new Set(savedData.data.map(o => o._id)));
  }, [savedData]);

  // Save / unsave
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

  // Admin: create/update
  const handleSave = async (form) => {
    setSaving(true);
    const payload = {
      title: form.title, type: form.type, organization: form.organization,
      description: form.description, applyLink: form.applyLink,
      startDate: form.startDate || undefined, lastDate: form.lastDate,
      tags: form.tags, isActive: form.isActive,
    };
    try {
      if (editItem?._id) {
        await api.put(`/api/opportunities/${editItem._id}`, payload);
        toast.success('Opportunity updated!');
      } else {
        await api.post('/api/opportunities', payload);
        toast.success('Opportunity posted!');
      }
      setShowForm(false); setEditItem(null);
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  // Admin: delete
  const handleDelete = async () => {
    try {
      await api.delete(`/api/opportunities/${deleteId}`);
      toast.success('Opportunity deleted.');
      setDeleteId(null);
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const openEdit = (opp, e) => {
    e.stopPropagation();
    setEditItem({
      _id: opp._id,
      title: opp.title, type: opp.type, organization: opp.organization,
      description: opp.description || '', applyLink: opp.applyLink || '',
      startDate: opp.startDate || '', lastDate: opp.lastDate || '',
      tags: opp.tags?.join(', ') || '', isActive: opp.isActive,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6 slide-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">Opportunities</h1>
          <p className="text-sm text-slate-400 mt-1">Internships, scholarships, hackathons & more</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditItem(null); setShowForm(true); }} className="btn-primary">
            <Plus size={16} /> Add Opportunity
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl w-fit border border-white/5 overflow-x-auto">
        {TABS.map(({ value, label }) => (
          <button key={value} onClick={() => { setTab(value); setPage(1); }}
            className={`tab-btn flex items-center gap-1.5 ${tab === value ? 'active' : ''}`}>
            {TAB_ICONS[value]}{label}
          </button>
        ))}
      </div>

      {!isSavedTab && (
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }}
          placeholder="Search opportunities..." />
      )}

      {/* Cards */}
      {loading ? <PageSpinner /> : opportunities.length === 0 ? (
        <EmptyState icon="default"
          title={isSavedTab ? 'No saved opportunities' : 'No opportunities found'}
          description={isSavedTab
            ? 'Save opportunities by clicking the heart icon.'
            : isAdmin
              ? 'No opportunities yet. Click "Add Opportunity" to post the first one.'
              : 'Check back soon for new listings.'} />
      ) : (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {opportunities.map(opp => (
              <div key={opp._id} className="glass-card p-5 flex flex-col gap-3 group">

                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold text-white text-sm line-clamp-2 flex-1">
                    {opp.title}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge variant={opp.type || 'default'}>{opp.type}</Badge>
                    {/* Save button */}
                    <button onClick={e => handleSaveToggle(e, opp._id)} disabled={togglingId === opp._id}
                      className={`p-1.5 rounded-lg transition-all ${
                        savedIds.has(opp._id) ? 'text-red-400 bg-red-500/10' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                      }`}>
                      <Heart size={14} className={savedIds.has(opp._id) ? 'fill-red-400' : ''} />
                    </button>
                  </div>
                </div>

                {/* Org */}
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Building size={12} />
                  <span>{opp.organization}</span>
                  {!opp.isActive && (
                    <span className="ml-auto text-amber-500 text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>

                <p className="text-slate-400 text-xs line-clamp-2">{opp.description}</p>

                {opp.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {opp.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] text-indigo-400/70 bg-indigo-500/8 px-1.5 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Calendar size={12} />
                  <span>Deadline: <span className="text-slate-300">{formatDate(opp.lastDate)}</span></span>
                </div>

                <CountdownTimer deadline={opp.lastDate} />

                {/* Footer */}
                <div className="flex items-center gap-2 mt-auto pt-1">
                  {opp.applyLink && (
                    <a href={opp.applyLink} target="_blank" rel="noreferrer"
                      className="btn-primary flex-1 text-sm">
                      Apply Now <ExternalLink size={13} />
                    </a>
                  )}
                  {/* Admin actions */}
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                      <button onClick={e => openEdit(opp, e)}
                        className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                        <Edit3 size={13} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setDeleteId(opp._id); }}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

          {!isSavedTab && (
            <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
          )}
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditItem(null); }}
        title={editItem ? 'Edit Opportunity' : 'Add New Opportunity'}
        size="lg"
      >
        <OpportunityForm
          initial={editItem}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditItem(null); }}
          saving={saving}
        />
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Opportunity" size="sm">
        <p className="text-slate-400 text-sm mb-5">
          This will permanently remove the opportunity. Students who saved it will lose it too.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
        </div>
      </Modal>

    </div>
  );
};

export default Opportunities;
