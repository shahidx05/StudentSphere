import { useState, useCallback, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { PageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import CountdownTimer from '../../components/ui/CountdownTimer';
import Badge from '../../components/ui/Badge';
import { Plus, Trash2, CheckCircle2, Clock, Loader2, Edit3 } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];
const PRIORITIES = ['low', 'medium', 'high'];
const NEXT_STATUS = { pending: 'in-progress', 'in-progress': 'completed', completed: 'pending' };

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ pending: 0, 'in-progress': 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('');
  const [priority, setPriority] = useState('');
  const [subject, setSubject] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [form, setForm]       = useState({ title: '', description: '', subject: '', deadline: '', priority: 'medium' });
  const [editingTask, setEditingTask] = useState(null); // task being edited

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab) params.set('status', tab);
      if (priority) params.set('priority', priority);
      if (subject) params.set('subject', subject);
      params.set('limit', '50');
      const [tasksRes, statsRes] = await Promise.all([
        api.get(`/api/tasks?${params}`),
        api.get('/api/tasks/stats'),
      ]);
      if (tasksRes.data.success) setTasks(tasksRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data.stats);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, [tab, priority, subject]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSubmitting(true);
    try {
      if (editingTask) {
        // Update
        await api.patch(`/api/tasks/${editingTask._id}`, { ...form, deadline: form.deadline || undefined });
        toast.success('Task updated!');
      } else {
        // Create
        await api.post('/api/tasks', { ...form, deadline: form.deadline || undefined });
        toast.success('Task created!');
      }
      setShowAdd(false);
      setEditingTask(null);
      setForm({ title: '', description: '', subject: '', deadline: '', priority: 'medium' });
      fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      subject: task.subject || '',
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
      priority: task.priority || 'medium',
    });
    setShowAdd(true);
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/api/tasks/${id}`); toast.success('Deleted'); fetchTasks(); }
    catch { toast.error('Delete failed'); }
  };

  const handleStatusCycle = async (task) => {
    setUpdatingId(task._id);
    try { await api.patch(`/api/tasks/${task._id}`, { status: NEXT_STATUS[task.status] }); fetchTasks(); }
    catch { toast.error('Update failed'); }
    finally { setUpdatingId(null); }
  };

  const totalTasks = (stats.pending || 0) + (stats['in-progress'] || 0) + (stats.completed || 0);

  return (
    <div className="space-y-6 slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">My Tasks</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your academic tasks and deadlines</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary w-fit">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: totalTasks, bg: 'bg-white/[0.03] border-white/[0.06]', color: 'text-white' },
          { label: 'Pending', value: stats.pending || 0, bg: 'bg-amber-500/5 border-amber-500/15', color: 'text-amber-400' },
          { label: 'In Progress', value: stats['in-progress'] || 0, bg: 'bg-indigo-500/5 border-indigo-500/15', color: 'text-indigo-400' },
          { label: 'Completed', value: stats.completed || 0, bg: 'bg-emerald-500/5 border-emerald-500/15', color: 'text-emerald-400' },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className={`stat-card text-center border ${bg}`}>
            <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/5">
          {STATUS_TABS.map(({ value, label }) => (
            <button key={value} onClick={() => setTab(value)} className={`tab-btn ${tab === value ? 'active' : ''}`}>{label}</button>
          ))}
        </div>
        <select value={priority} onChange={e => setPriority(e.target.value)}
          className="input-field w-auto min-w-[130px] py-2 text-sm">
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Filter by subject..."
          className="input-field w-auto min-w-[160px] py-2 text-sm" />
      </div>

      {/* Task List */}
      {loading ? <PageSpinner /> : tasks.length === 0 ? (
        <EmptyState title="No tasks found" description="Create your first task to track your academic work."
          action={<button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={16} /> New Task</button>} />
      ) : (
        <div className="space-y-2.5">
          {tasks.map(task => (
            <div key={task._id}
              className={`glass-card p-4 flex items-start gap-4 group ${task.status === 'completed' ? 'opacity-60' : ''}`}
              style={{ transform: 'none' }}>
              {/* Status circle */}
              <button onClick={() => handleStatusCycle(task)} disabled={updatingId === task._id}
                title={`Mark as ${NEXT_STATUS[task.status]}`}
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white'
                  : task.status === 'in-progress' ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-600 hover:border-indigo-500'
                }`}>
                {updatingId === task._id
                  ? <Loader2 size={10} className="animate-spin" />
                  : task.status === 'completed' ? <CheckCircle2 size={10} />
                  : task.status === 'in-progress' ? <Clock size={10} className="text-indigo-400" />
                  : null}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h3 className={`font-semibold text-sm ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge variant={task.priority}>{task.priority}</Badge>
                    <Badge variant={task.status}>{task.status}</Badge>
                  </div>
                </div>
                {task.description && <p className="text-slate-500 text-xs mt-1 line-clamp-2">{task.description}</p>}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {task.subject && (
                    <span className="badge badge-slate text-[10px]">{task.subject}</span>
                  )}
                  {task.deadline && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[10px]">Due: {formatDate(task.deadline)}</span>
                      <CountdownTimer deadline={task.deadline} compact />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => openEdit(task)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all opacity-0 group-hover:opacity-100">
                  <Edit3 size={13} />
                </button>
                <button onClick={() => handleDelete(task._id)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditingTask(null); setForm({ title: '', description: '', subject: '', deadline: '', priority: 'medium' }); }}
        title={editingTask ? 'Edit Task' : 'New Task'}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Complete Data Structures assignment" className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional details..." rows={2} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Subject</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="e.g. DBMS" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input-field">
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Deadline</label>
            <input type="datetime-local" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              className="input-field" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Task'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TaskManager;
