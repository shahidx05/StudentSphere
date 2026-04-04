import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DashboardCard from '../components/ui/DashboardCard';
import CountdownTimer from '../components/ui/CountdownTimer';
import Badge from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { Bar } from 'react-chartjs-2';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate, formatRelative } from '../utils/formatDate';
import { OPPORTUNITY_TYPES, POST_TYPES } from '../utils/constants';
import {
  Wallet, TrendingUp, TrendingDown, Briefcase,
  Download, Package, Search, CheckSquare,
  ArrowRight, BookOpen, Megaphone,
} from 'lucide-react';

const getChartOptions = (isDark) => {
  const gridColor = isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.08)';
  const tickColor = isDark ? '#64748b' : '#94a3b8';
  const legendColor = isDark ? '#94a3b8' : '#475569';
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: legendColor, font: { size: 11 }, usePointStyle: true, padding: 16 } },
      tooltip: {
        backgroundColor: isDark ? '#1e1e3c' : '#ffffff',
        borderColor: 'rgba(99,102,241,0.3)', borderWidth: 1,
        titleColor: isDark ? '#fff' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#64748b',
        padding: 12, cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } },
      y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 }, callback: v => `₹${(v/1000).toFixed(0)}k` } },
    },
  };
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/overview')
      .then(({ data }) => { if (data.success) setOverview(data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return <PageSpinner />;

  const isDark = !document.documentElement.classList.contains('light');
  const chartOptions = getChartOptions(isDark);

  const {
    expenseSummary = {},
    upcomingDeadlines = [],
    recentNotes = [],
    recentMarketplaceItems = [],
    recentLostFound = [],
    campusAnnouncements = [],
    taskSummary = { pending: 0, 'in-progress': 0, completed: 0 },
  } = overview || {};

  const barData = {
    labels: ['Income', 'Expenses', 'Balance'],
    datasets: [{
      label: 'Monthly (₹)',
      data: [expenseSummary.income || 0, expenseSummary.expense || 0, Math.abs(expenseSummary.balance || 0)],
      backgroundColor: ['rgba(34,197,94,0.6)', 'rgba(239,68,68,0.6)', 'rgba(99,102,241,0.6)'],
      borderColor: ['#22c55e', '#ef4444', '#6366f1'],
      borderWidth: 1, borderRadius: 6,
    }],
  };

  const totalTasks = (taskSummary.pending || 0) + (taskSummary['in-progress'] || 0) + (taskSummary.completed || 0);

  return (
    <div className="space-y-6 slide-up">
      {/* Welcome Banner */}
      <div className="glass-card p-6 relative overflow-hidden" style={{ transform: 'none' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 50%, transparent 100%)' }} />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">{formatDate(new Date(), 'MMM D, YYYY')}</p>
            <h1 className="page-header text-2xl">
              {greeting}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {user?.department ? `${user.department}${user.year ? ` · Year ${user.year}` : ''}` : 'Welcome to StudentSphere'}
            </p>
          </div>
          <button onClick={() => navigate('/tasks')} className="btn-primary w-fit">
            <CheckSquare size={16} /> My Tasks
          </button>
        </div>
      </div>

      {/* Finance Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Monthly Balance" value={formatCurrency(expenseSummary.balance || 0)}
          icon={Wallet} color={(expenseSummary.balance || 0) >= 0 ? 'accent' : 'danger'} />
        <DashboardCard title="Total Income" value={formatCurrency(expenseSummary.income || 0)}
          icon={TrendingUp} color="accent" />
        <DashboardCard title="Total Expenses" value={formatCurrency(expenseSummary.expense || 0)}
          icon={TrendingDown} color="danger" />
        <DashboardCard title="Opportunities" value={upcomingDeadlines.length}
          icon={Briefcase} color="indigo" subtitle="Upcoming deadlines" />
      </div>

      {/* Task Overview */}
      <div className="glass-card p-5" style={{ transform: 'none' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-header"><CheckSquare size={18} className="text-indigo-400" /> Task Overview</h3>
          <button onClick={() => navigate('/tasks')} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 transition-colors">
            Manage <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: totalTasks, color: 'text-white', bg: 'bg-white/5 border-white/8' },
            { label: 'Pending', value: taskSummary.pending || 0, color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/15' },
            { label: 'In Progress', value: taskSummary['in-progress'] || 0, color: 'text-indigo-400', bg: 'bg-indigo-500/5 border-indigo-500/15' },
            { label: 'Done', value: taskSummary.completed || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/15' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`text-center p-3.5 rounded-2xl border ${bg}`}>
              <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-slate-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main 2-col grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Finance Chart */}
          <div className="glass-card p-5" style={{ transform: 'none' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-header"><Wallet size={18} className="text-indigo-400" /> Monthly Finance</h3>
              <button onClick={() => navigate('/finance')} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 transition-colors">
                View <ArrowRight size={12} />
              </button>
            </div>
            <div style={{ height: 200 }}>
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="glass-card p-5" style={{ transform: 'none' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-header"><Briefcase size={18} className="text-indigo-400" /> Upcoming Deadlines</h3>
              <button onClick={() => navigate('/opportunities')} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 transition-colors">
                View All <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">No upcoming deadlines</p>
              ) : upcomingDeadlines.map((opp) => (
                <div key={opp._id} className="row-item cursor-pointer" onClick={() => navigate('/opportunities')}>
                  <div className="icon-box bg-indigo-500/10 border border-indigo-500/20">
                    <Briefcase size={15} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{opp.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{opp.organization} · Due {formatDate(opp.lastDate)}</p>
                  </div>
                  <CountdownTimer deadline={opp.lastDate} compact />
                </div>
              ))}
            </div>
          </div>

          {/* Marketplace */}
          <div className="glass-card p-5" style={{ transform: 'none' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-header"><Package size={18} className="text-indigo-400" /> Marketplace</h3>
              <button onClick={() => navigate('/marketplace')} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 transition-colors">
                View All <ArrowRight size={12} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {recentMarketplaceItems.length === 0 ? (
                <p className="text-slate-500 text-sm col-span-3 text-center py-4">No listings yet</p>
              ) : recentMarketplaceItems.map((item) => (
                <div key={item._id} className="rounded-xl overflow-hidden border border-indigo-500/10 bg-white/[0.02] hover:border-indigo-500/25 transition-all cursor-pointer group"
                  onClick={() => navigate(`/marketplace/${item._id}`)}>
                  <div className="w-full h-24 bg-indigo-500/5 flex items-center justify-center overflow-hidden">
                    {item.images?.[0]
                      ? <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      : <Package size={24} className="text-slate-600" />
                    }
                  </div>
                  <div className="p-2.5">
                    <p className="text-white text-xs font-medium truncate">{item.title}</p>
                    <p className={`text-xs font-bold mt-0.5 ${item.isFree ? 'text-emerald-400' : 'text-indigo-400'}`}>
                      {item.isFree ? 'FREE' : formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Resources */}
          <div className="glass-card p-5" style={{ transform: 'none' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-header"><BookOpen size={18} className="text-indigo-400" /> Resources</h3>
              <button onClick={() => navigate('/resources')} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 transition-colors">
                View All <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {recentNotes.length === 0
                ? <p className="text-slate-500 text-sm text-center py-4">No resources yet</p>
                : recentNotes.map(note => (
                  <div key={note._id} className="row-item cursor-pointer" onClick={() => navigate('/resources')}>
                    <div className="icon-box bg-purple-500/10 border border-purple-500/20">
                      <Download size={14} className="text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{note.title}</p>
                      <p className="text-slate-500 text-[10px]">{note.subject} · {note.downloadCount} downloads</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Lost & Found */}
          <div className="glass-card p-5" style={{ transform: 'none' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-header"><Search size={18} className="text-indigo-400" /> Lost & Found</h3>
              <button onClick={() => navigate('/lostfound')} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 transition-colors">
                View All <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {recentLostFound.length === 0
                ? <p className="text-slate-500 text-sm text-center py-4">No reports yet</p>
                : recentLostFound.map(item => (
                  <div key={item._id} className="row-item cursor-pointer" onClick={() => navigate(`/lostfound/${item._id}`)}>
                    <Search size={16} className={item.status === 'lost' ? 'text-red-400' : 'text-emerald-400'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{item.title}</p>
                      <p className="text-slate-500 text-[10px]">{formatRelative(item.createdAt)}</p>
                    </div>
                    <Badge variant={item.status}>{item.status}</Badge>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Campus Updates */}
          <div className="glass-card p-5" style={{ transform: 'none' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-header"><Megaphone size={18} className="text-indigo-400" /> Campus Updates</h3>
              <button onClick={() => navigate('/campus')} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 transition-colors">
                View All <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {campusAnnouncements.length === 0
                ? <p className="text-slate-500 text-sm text-center py-4">No announcements</p>
                : campusAnnouncements.map(post => (
                  <div key={post._id} className="row-item cursor-pointer" onClick={() => navigate(`/campus/posts/${post._id}`)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant={post.type}>{post.type}</Badge>
                        <span className="text-slate-600 text-[10px]">{formatRelative(post.createdAt)}</span>
                      </div>
                      <p className="text-white text-xs font-medium truncate">{post.title}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
