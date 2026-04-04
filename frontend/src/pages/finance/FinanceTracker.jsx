import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { PageSpinner } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import FilterBar from '../../components/ui/FilterBar';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { FINANCE_CATEGORIES } from '../../utils/constants';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react';
import Modal from '../../components/ui/Modal';

const TABS = ['Daily', 'Monthly', 'Yearly', 'Analytics'];

const CATEGORY_COLORS = {
  food: '#FA4D56', transport: '#F1C21B', stationery: '#0F62FE',
  rent: '#42BE65', entertainment: '#A78BFA', other: '#6F6F6F',
};

const FinanceTracker = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Monthly');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ type: '', category: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ type: 'expense', amount: '', category: 'other', description: '', date: new Date().toISOString().split('T')[0] });
  const [submitting, setSubmitting] = useState(false);

  // Fetch transactions
  const txParams = new URLSearchParams({ ...filters, page, limit: 10 }).toString();
  const { data: txData, loading: txLoading, refetch } = useFetch(`/api/finance/transactions?${txParams}`);

  // Fetch summaries
  const { data: dailyData } = useFetch('/api/finance/summary/daily');
  const { data: monthlyData } = useFetch('/api/finance/summary/monthly');
  const { data: yearlyData } = useFetch('/api/finance/summary/yearly');
  const { data: categoryData } = useFetch('/api/finance/analytics/category');

  const txList = txData?.data || [];
  const pagination = txData?.pagination || {};
  const daily = dailyData?.data || {};
  const monthly = monthlyData?.data || [];
  const yearly = yearlyData?.data || [];
  const categories = categoryData?.data || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.amount) { toast.error('Amount is required'); return; }
    setSubmitting(true);
    try {
      await api.post('/api/finance/transactions', { ...form, amount: Number(form.amount) });
      toast.success('Transaction added!');
      setShowAdd(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/finance/transactions/${deleteId}`);
      toast.success('Transaction deleted.');
      setDeleteId(null);
      refetch();
    } catch { toast.error('Delete failed'); }
  };

  // Chart Data
  const pieData = {
    labels: categories.map(c => c._id),
    datasets: [{ data: categories.map(c => c.total), backgroundColor: categories.map(c => CATEGORY_COLORS[c._id] || '#6F6F6F'), borderWidth: 0 }],
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const incomeByMonth = Array(12).fill(0);
  const expenseByMonth = Array(12).fill(0);
  yearly.forEach(({ _id, total }) => {
    if (_id.type === 'income') incomeByMonth[_id.month - 1] = total;
    if (_id.type === 'expense') expenseByMonth[_id.month - 1] = total;
  });

  const lineData = {
    labels: months,
    datasets: [
      { label: 'Income', data: incomeByMonth, borderColor: '#42BE65', backgroundColor: 'rgba(66,190,101,0.1)', fill: true, tension: 0.4 },
      { label: 'Expenses', data: expenseByMonth, borderColor: '#FA4D56', backgroundColor: 'rgba(250,77,86,0.1)', fill: true, tension: 0.4 },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#A8A8A8', boxWidth: 12 } } },
    scales: { x: { grid: { color: '#2E2E2E' }, ticks: { color: '#6F6F6F' } }, y: { grid: { color: '#2E2E2E' }, ticks: { color: '#6F6F6F' } } },
  };

  const pieOptions = {
    responsive: true,
    plugins: { legend: { position: 'right', labels: { color: '#A8A8A8', boxWidth: 12, padding: 20 } } },
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Finance Tracker</h1>
          <p className="text-text-muted text-sm">Track income, expenses, and savings</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Today\'s Income', val: daily.income || 0, color: 'text-accent', icon: TrendingUp },
          { label: 'Today\'s Expenses', val: daily.expense || 0, color: 'text-danger', icon: TrendingDown },
          { label: 'Today\'s Balance', val: daily.balance || 0, color: (daily.balance || 0) >= 0 ? 'text-primary' : 'text-danger', icon: Wallet },
        ].map(({ label, val, color, icon: Icon }) => (
          <div key={label} className="card-base flex items-center gap-3">
            <Icon size={20} className={color} />
            <div>
              <p className="text-text-muted text-xs">{label}</p>
              <p className={`font-display font-bold text-lg ${color}`}>{formatCurrency(val)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface p-1 rounded-xl border border-border w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Analytics' ? (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card-base">
            <h3 className="section-title">Expense by Category</h3>
            <Pie data={pieData} options={pieOptions} />
          </div>
          <div className="card-base">
            <h3 className="section-title">Yearly Income vs Expenses</h3>
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>
      ) : (
        <div className="card-base">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Transactions</h2>
            <FilterBar
              filters={[
                { key: 'type', options: [{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }], placeholder: 'All Types' },
                { key: 'category', options: FINANCE_CATEGORIES, placeholder: 'All Categories' },
              ]}
              values={filters}
              onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }}
            />
          </div>

          {txLoading ? <PageSpinner /> : txList.length === 0 ? (
            <EmptyState title="No transactions" description="Add your first income or expense to get started." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wider">
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Description</th>
                    <th className="text-left py-3 px-2">Category</th>
                    <th className="text-left py-3 px-2">Type</th>
                    <th className="text-right py-3 px-2">Amount</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {txList.map((tx) => (
                    <tr key={tx._id} className="hover:bg-surface-2 transition-all">
                      <td className="py-3 px-2 text-text-muted text-xs">{formatDate(tx.date, 'MMM D')}</td>
                      <td className="py-3 px-2 text-text-primary">{tx.description || '—'}</td>
                      <td className="py-3 px-2"><Badge variant="default">{tx.category}</Badge></td>
                      <td className="py-3 px-2"><Badge variant={tx.type === 'income' ? 'accent' : 'danger'}>{tx.type}</Badge></td>
                      <td className={`py-3 px-2 text-right font-semibold ${tx.type === 'income' ? 'text-accent' : 'text-danger'}`}>
                        {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-2">
                        <button onClick={() => setDeleteId(tx._id)} className="p-1.5 rounded text-muted hover:text-danger transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      {/* Add Transaction Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Transaction">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="flex gap-2">
            {['income', 'expense'].map(t => (
              <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  form.type === t
                    ? t === 'income' ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-danger/10 border-danger/30 text-danger'
                    : 'border-border text-muted hover:text-text-primary'
                }`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Amount (₹) *</label>
            <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00" min="0" step="0.01" className="input-base" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-base">
              {FINANCE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Hostel rent" className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-base" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Add Transaction'}
          </button>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Transaction" size="sm">
        <p className="text-text-secondary text-sm mb-4">Are you sure you want to delete this transaction?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default FinanceTracker;
