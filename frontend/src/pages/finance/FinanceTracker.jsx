import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { PageSpinner } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { FINANCE_CATEGORIES } from '../../utils/constants';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, BarChart3, List, PlusCircle } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'add', label: 'Add Entry', icon: PlusCircle },
  { id: 'history', label: 'History', icon: List },
];

const CHART_COLORS = ['#ef4444', '#f59e0b', '#6366f1', '#22c55e', '#a855f7', '#64748b'];

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#94a3b8', font: { size: 11 }, usePointStyle: true, padding: 16 } },
    tooltip: { backgroundColor: '#1e1e3c', borderColor: 'rgba(99,102,241,0.3)', borderWidth: 1, titleColor: '#fff', bodyColor: '#94a3b8', padding: 12, cornerRadius: 8 },
  },
  scales: {
    x: { grid: { color: 'rgba(99,102,241,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
    y: { grid: { color: 'rgba(99,102,241,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
  },
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const FinanceTracker = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [form, setForm] = useState({ type: 'expense', amount: '', category: 'food', description: '', date: new Date().toISOString().split('T')[0] });
  const [submitting, setSubmitting] = useState(false);

  const txParams = new URLSearchParams({ ...(typeFilter && { type: typeFilter }), ...(categoryFilter && { category: categoryFilter }), page, limit: 10 }).toString();
  const { data: txData, loading: txLoading, refetch } = useFetch(`/api/finance/transactions?${txParams}`);
  const { data: categoryData } = useFetch('/api/finance/analytics/category');
  const { data: yearlyData } = useFetch('/api/finance/summary/yearly');

  const txList = txData?.data || [];
  const pagination = txData?.pagination || {};
  const categories = categoryData?.data || [];
  const yearly = yearlyData?.data || [];

  // Compute this month's totals from yearly breakdown
  const currentMonth = new Date().getMonth() + 1; // 1–12
  const monthlyIncome  = yearly.filter(r => r._id.month === currentMonth && r._id.type === 'income').reduce((s, r) => s + r.total, 0);
  const monthlyExpense = yearly.filter(r => r._id.month === currentMonth && r._id.type === 'expense').reduce((s, r) => s + r.total, 0);
  const monthlyBalance = monthlyIncome - monthlyExpense;

  // All-time totals
  const totalIncome  = yearly.filter(r => r._id.type === 'income').reduce((s, r) => s + r.total, 0);
  const totalExpense = yearly.filter(r => r._id.type === 'expense').reduce((s, r) => s + r.total, 0);
  const totalBalance = totalIncome - totalExpense;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Enter a valid amount'); return; }
    setSubmitting(true);
    try {
      await api.post('/api/finance/transactions', { ...form, amount: Number(form.amount) });
      toast.success('Transaction added!');
      setForm({ type: 'expense', amount: '', category: 'food', description: '', date: new Date().toISOString().split('T')[0] });
      setTab('history'); refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try { await api.delete(`/api/finance/transactions/${id}`); toast.success('Deleted.'); refetch(); }
    catch { toast.error('Delete failed'); }
  };

  const incomeByMonth = Array(12).fill(0);
  const expenseByMonth = Array(12).fill(0);
  yearly.forEach(({ _id, total }) => {
    if (_id.type === 'income') incomeByMonth[(_id.month || 1) - 1] = total;
    if (_id.type === 'expense') expenseByMonth[(_id.month || 1) - 1] = total;
  });

  const barData = {
    labels: MONTHS,
    datasets: [
      { label: 'Income', data: incomeByMonth, backgroundColor: 'rgba(34,197,94,0.6)', borderColor: '#22c55e', borderWidth: 1, borderRadius: 4 },
      { label: 'Expenses', data: expenseByMonth, backgroundColor: 'rgba(239,68,68,0.6)', borderColor: '#ef4444', borderWidth: 1, borderRadius: 4 },
    ],
  };
  const lineData = {
    labels: MONTHS,
    datasets: [
      { label: 'Income', data: incomeByMonth, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', fill: true, tension: 0.4 },
      { label: 'Expenses', data: expenseByMonth, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 },
    ],
  };
  const pieData = {
    labels: categories.map(c => c._id),
    datasets: [{ data: categories.map(c => c.total), backgroundColor: categories.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]), borderWidth: 0 }],
  };
  const pieOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, padding: 12, usePointStyle: true } },
      tooltip: { backgroundColor: '#1e1e3c', borderColor: 'rgba(99,102,241,0.3)', borderWidth: 1, titleColor: '#fff', bodyColor: '#94a3b8', padding: 10, cornerRadius: 8 },
    },
  };

  return (
    <div className="space-y-6 slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">Finance Tracker</h1>
          <p className="text-sm text-slate-400 mt-1">Track income, expenses, and savings</p>
        </div>
        <button onClick={() => navigate('/finance/analytics')} className="btn-secondary w-fit">
          <BarChart3 size={16} /> Analytics
        </button>
      </div>

      {/* Quick Stats — This Month */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "This Month's Income",  val: monthlyIncome,  color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/15', icon: TrendingUp },
          { label: "This Month's Expenses", val: monthlyExpense, color: 'text-red-400',     bg: 'bg-red-500/5 border-red-500/15',         icon: TrendingDown },
          { label: "This Month's Balance",  val: monthlyBalance, color: monthlyBalance >= 0 ? 'text-indigo-400' : 'text-red-400', bg: 'bg-indigo-500/5 border-indigo-500/15', icon: Wallet },
        ].map(({ label, val, color, bg, icon: Icon }) => (
          <div key={label} className={`stat-card flex items-center gap-4 border ${bg}`}>
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">{label}</p>
              <p className={`font-display font-bold text-xl ${color}`}>{formatCurrency(val)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* All-Time Totals */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Income All Time',  val: totalIncome,  color: 'text-emerald-400/80' },
          { label: 'Total Expenses All Time', val: totalExpense, color: 'text-red-400/80' },
          { label: 'Net Balance All Time',    val: totalBalance, color: totalBalance >= 0 ? 'text-indigo-400/80' : 'text-red-400/80' },
        ].map(({ label, val, color }) => (
          <div key={label} className="glass-card p-3 text-center" style={{ transform: 'none' }}>
            <p className="text-slate-600 text-[10px] uppercase tracking-wider">{label}</p>
            <p className={`font-display font-bold text-base mt-1 ${color}`}>{formatCurrency(val)}</p>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl w-fit border border-white/5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`tab-btn flex items-center gap-2 ${tab === id ? 'active' : ''}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="glass-card p-5" style={{ transform: 'none' }}>
              <h3 className="section-header mb-4"><BarChart3 size={18} className="text-indigo-400" /> Monthly Bar</h3>
              <div style={{ height: 220 }}><Bar data={barData} options={chartOptions} /></div>
            </div>
            <div className="glass-card p-5" style={{ transform: 'none' }}>
              <h3 className="section-header mb-4"><Wallet size={18} className="text-indigo-400" /> By Category</h3>
              {categories.length === 0
                ? <EmptyState title="No data" description="Add transactions to see breakdown." />
                : <div style={{ height: 220 }}><Pie data={pieData} options={pieOptions} /></div>
              }
            </div>
          </div>
          <div className="glass-card p-5" style={{ transform: 'none' }}>
            <h3 className="section-header mb-4"><TrendingUp size={18} className="text-indigo-400" /> Yearly Trend</h3>
            <div style={{ height: 220 }}><Line data={lineData} options={chartOptions} /></div>
          </div>
        </div>
      )}

      {/* Add Entry */}
      {tab === 'add' && (
        <div className="glass-card p-6 max-w-lg" style={{ transform: 'none' }}>
          <h2 className="section-header mb-5"><PlusCircle size={18} className="text-indigo-400" /> Add Transaction</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex gap-2">
              {['income', 'expense'].map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2 ${
                    form.type === t
                      ? t === 'income' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' : 'bg-red-500/15 border-red-500/40 text-red-400'
                      : 'border-indigo-500/15 text-slate-500 hover:text-slate-300'
                  }`}>
                  {t === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00" min="0" step="0.01" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                {FINANCE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Note (optional)</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Hostel rent" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={16} /> Add Transaction</>}
            </button>
          </form>
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="glass-card p-5" style={{ transform: 'none' }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="section-header"><List size={18} className="text-indigo-400" /> Transaction History</h2>
            <div className="flex gap-2">
              <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="input-field w-auto text-sm py-2">
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="input-field w-auto text-sm py-2">
                <option value="">All Categories</option>
                {FINANCE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          {txLoading ? <PageSpinner /> : txList.length === 0 ? (
            <EmptyState title="No transactions" description="Add your first income or expense."
              action={<button onClick={() => setTab('add')} className="btn-primary"><Plus size={16} /> Add</button>} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-indigo-500/10 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="text-left py-3 px-3">Date</th>
                      <th className="text-left py-3 px-3">Note</th>
                      <th className="text-left py-3 px-3">Category</th>
                      <th className="text-left py-3 px-3">Type</th>
                      <th className="text-right py-3 px-3">Amount</th>
                      <th className="py-3 px-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-500/5">
                    {txList.map(tx => (
                      <tr key={tx._id} className="hover:bg-indigo-500/5 transition-colors">
                        <td className="py-3 px-3 text-slate-500 text-xs">{formatDate(tx.date, 'MMM D')}</td>
                        <td className="py-3 px-3 text-white">{tx.description || '—'}</td>
                        <td className="py-3 px-3"><Badge variant="default">{tx.category}</Badge></td>
                        <td className="py-3 px-3"><Badge variant={tx.type}>{tx.type}</Badge></td>
                        <td className={`py-3 px-3 text-right font-semibold font-display ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                        </td>
                        <td className="py-3 px-3">
                          <button onClick={() => handleDelete(tx._id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FinanceTracker;
