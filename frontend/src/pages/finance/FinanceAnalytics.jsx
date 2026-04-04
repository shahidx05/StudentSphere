import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { Doughnut, Line } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/formatCurrency';
import { TrendingUp, TrendingDown, Wallet, Star } from 'lucide-react';
import { PageSpinner } from '../../components/ui/Spinner';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CHART_COLORS = ['#ef4444','#f59e0b','#6366f1','#22c55e','#a855f7','#64748b','#fb923c'];

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

const FinanceAnalytics = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: summaryData, loading } = useFetch(`/api/finance/analytics/summary?month=${month}&year=${year}`);
  const { data: categoryData } = useFetch('/api/finance/analytics/category');
  const { data: yearlyData } = useFetch('/api/finance/summary/yearly');

  const summary = summaryData?.data || {};
  const categories = categoryData?.data || [];
  const yearly = yearlyData?.data || [];

  const incomeByMonth = Array(12).fill(0);
  const expenseByMonth = Array(12).fill(0);
  yearly.forEach(({ _id, total }) => {
    if (_id.type === 'income') incomeByMonth[(_id.month || 1) - 1] = total;
    if (_id.type === 'expense') expenseByMonth[(_id.month || 1) - 1] = total;
  });

  const lineData = {
    labels: MONTHS,
    datasets: [
      { label: 'Income', data: incomeByMonth, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', fill: true, tension: 0.4 },
      { label: 'Expenses', data: expenseByMonth, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 },
    ],
  };

  const donutData = {
    labels: categories.map(c => c._id),
    datasets: [{
      data: categories.map(c => c.total),
      backgroundColor: categories.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
      borderWidth: 2, borderColor: 'rgba(30,30,60,0.8)',
    }],
  };

  const donutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, padding: 12, usePointStyle: true } },
      tooltip: { backgroundColor: '#1e1e3c', borderColor: 'rgba(99,102,241,0.3)', borderWidth: 1, titleColor: '#fff', bodyColor: '#94a3b8', padding: 10, cornerRadius: 8 },
    },
    cutout: '65%',
  };

  const topCategory = categories.length > 0
    ? categories.reduce((max, c) => c.total > max.total ? c : max, categories[0])
    : null;
  const balance = (summary.totalIncome || 0) - (summary.totalExpense || 0);

  return (
    <div className="space-y-6 slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">Finance Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Detailed spending breakdown and trends</p>
        </div>
        <div className="flex gap-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input-field w-auto py-2 text-sm">
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="input-field w-auto py-2 text-sm">
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? <PageSpinner /> : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card flex items-center gap-3">
              <div className="icon-box-lg bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp size={22} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">Total Income</p>
                <p className="font-display font-bold text-xl text-emerald-400">{formatCurrency(summary.totalIncome || 0)}</p>
              </div>
            </div>
            <div className="stat-card flex items-center gap-3">
              <div className="icon-box-lg bg-red-500/10 border border-red-500/20">
                <TrendingDown size={22} className="text-red-400" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">Total Expenses</p>
                <p className="font-display font-bold text-xl text-red-400">{formatCurrency(summary.totalExpense || 0)}</p>
              </div>
            </div>
            <div className="stat-card flex items-center gap-3">
              <div className={`icon-box-lg border ${balance >= 0 ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <Wallet size={22} className={balance >= 0 ? 'text-indigo-400' : 'text-red-400'} />
              </div>
              <div>
                <p className="text-slate-500 text-xs">Net Balance</p>
                <p className={`font-display font-bold text-xl ${balance >= 0 ? 'text-indigo-400' : 'text-red-400'}`}>{formatCurrency(balance)}</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="glass-card p-5" style={{ transform: 'none' }}>
              <h3 className="section-header mb-4"><Wallet size={18} className="text-indigo-400" /> Category Breakdown</h3>
              {categories.length === 0
                ? <p className="text-slate-500 text-sm text-center py-8">No expense data</p>
                : (
                  <>
                    <div style={{ height: 220 }}><Doughnut data={donutData} options={donutOptions} /></div>
                    {topCategory && (
                      <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
                        <Star size={16} className="text-amber-400" />
                        <div>
                          <p className="text-slate-500 text-xs">Top Spending Category</p>
                          <p className="text-white font-semibold text-sm capitalize">
                            {topCategory._id} — {formatCurrency(topCategory.total)}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
            </div>
            <div className="glass-card p-5" style={{ transform: 'none' }}>
              <h3 className="section-header mb-4"><TrendingUp size={18} className="text-indigo-400" /> Yearly Trend</h3>
              <div style={{ height: 260 }}><Line data={lineData} options={chartOptions} /></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinanceAnalytics;
