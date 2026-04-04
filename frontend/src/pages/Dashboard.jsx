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
  Download, Package, Search, Megaphone,
  ArrowRight, Clock,
} from 'lucide-react';

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

  const { expenseSummary = {}, upcomingDeadlines = [], recentNotes = [],
    recentMarketplaceItems = [], recentLostFound = [], campusAnnouncements = [] } = overview || {};

  // Bar chart data for expenses overview
  const barData = {
    labels: ['Income', 'Expenses', 'Balance'],
    datasets: [{
      label: 'Monthly Summary (₹)',
      data: [expenseSummary.income || 0, expenseSummary.expense || 0, expenseSummary.balance || 0],
      backgroundColor: ['rgba(66, 190, 101, 0.7)', 'rgba(250, 77, 86, 0.7)', 'rgba(15, 98, 254, 0.7)'],
      borderColor: ['#42BE65', '#FA4D56', '#0F62FE'],
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#2E2E2E' }, ticks: { color: '#6F6F6F' } },
      y: { grid: { color: '#2E2E2E' }, ticks: { color: '#6F6F6F', callback: (v) => `₹${(v/1000).toFixed(0)}k` } },
    },
  };

  const getOpportunityColor = (type) => OPPORTUNITY_TYPES.find(o => o.value === type)?.color || 'text-muted bg-muted/10';
  const getPostColor = (type) => POST_TYPES.find(p => p.value === type)?.color || 'text-muted bg-muted/10';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {formatDate(new Date(), 'dddd, MMMM D YYYY')} · Here's your overview
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Monthly Balance"
          value={formatCurrency(expenseSummary.balance || 0)}
          icon={Wallet}
          color={(expenseSummary.balance || 0) >= 0 ? 'accent' : 'danger'}
        />
        <DashboardCard
          title="Total Income"
          value={formatCurrency(expenseSummary.income || 0)}
          icon={TrendingUp}
          color="accent"
        />
        <DashboardCard
          title="Total Expenses"
          value={formatCurrency(expenseSummary.expense || 0)}
          icon={TrendingDown}
          color="danger"
        />
        <DashboardCard
          title="Active Opportunities"
          value={upcomingDeadlines.length}
          icon={Briefcase}
          color="primary"
          subtitle="Upcoming deadlines"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expense Summary Chart */}
          <div className="card-base">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Monthly Finance Summary</h2>
              <button onClick={() => navigate('/finance')} className="text-primary text-xs flex items-center gap-1 hover:text-primary-light transition-colors">
                View Details <ArrowRight size={12} />
              </button>
            </div>
            <Bar data={barData} options={barOptions} height={80} />
          </div>

          {/* Upcoming Deadlines */}
          <div className="card-base">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Upcoming Deadlines</h2>
              <button onClick={() => navigate('/opportunities')} className="text-primary text-xs flex items-center gap-1 hover:text-primary-light transition-colors">
                View All <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-text-muted text-sm py-4 text-center">No upcoming deadlines</p>
              ) : (
                upcomingDeadlines.map((opp) => (
                  <div key={opp._id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 hover:bg-border/30 transition-all cursor-pointer"
                    onClick={() => navigate('/opportunities')}>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{opp.title}</p>
                      <p className="text-text-muted text-xs mt-0.5">{opp.organization} · Due {formatDate(opp.lastDate)}</p>
                    </div>
                    <span className={`badge-base text-xs ${getOpportunityColor(opp.type)}`}>{opp.type}</span>
                    <CountdownTimer deadline={opp.lastDate} compact />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Marketplace */}
          <div className="card-base">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Marketplace Updates</h2>
              <button onClick={() => navigate('/marketplace')} className="text-primary text-xs flex items-center gap-1 hover:text-primary-light">
                View All <ArrowRight size={12} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recentMarketplaceItems.map((item) => (
                <div key={item._id} className="bg-surface-2 rounded-lg p-3 hover:bg-border/30 transition-all cursor-pointer"
                  onClick={() => navigate(`/marketplace/${item._id}`)}>
                  <div className="w-full h-24 rounded-lg bg-border mb-2 flex items-center justify-center overflow-hidden">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={24} className="text-muted" />
                    )}
                  </div>
                  <p className="text-text-primary text-xs font-medium truncate">{item.title}</p>
                  <p className={`text-xs font-semibold mt-0.5 ${item.isFree ? 'text-accent' : 'text-primary'}`}>
                    {item.isFree ? 'FREE' : formatCurrency(item.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent Resources */}
          <div className="card-base">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Recent Resources</h2>
              <button onClick={() => navigate('/resources')} className="text-primary text-xs flex items-center gap-1 hover:text-primary-light">
                View All <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-2.5">
              {recentNotes.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-4">No resources yet</p>
              ) : (
                recentNotes.map((note) => (
                  <div key={note._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-2 hover:bg-border/30 transition-all cursor-pointer"
                    onClick={() => navigate('/resources')}>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Download size={14} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-xs font-medium truncate">{note.title}</p>
                      <p className="text-text-muted text-[10px]">{note.subject} · {note.downloadCount} downloads</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lost & Found */}
          <div className="card-base">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Lost & Found</h2>
              <button onClick={() => navigate('/lostfound')} className="text-primary text-xs flex items-center gap-1 hover:text-primary-light">
                View All <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-2.5">
              {recentLostFound.map((item) => (
                <div key={item._id} onClick={() => navigate(`/lostfound/${item._id}`)}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-2 hover:bg-border/30 transition-all cursor-pointer">
                  <Search size={16} className={item.status === 'lost' ? 'text-danger' : 'text-accent'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-xs font-medium truncate">{item.title}</p>
                    <p className="text-text-muted text-[10px]">{formatRelative(item.createdAt)}</p>
                  </div>
                  <Badge variant={item.status}>{item.status}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Campus Announcements */}
          <div className="card-base">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Campus Updates</h2>
              <button onClick={() => navigate('/campus')} className="text-primary text-xs flex items-center gap-1 hover:text-primary-light">
                View All <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-2.5">
              {campusAnnouncements.map((post) => (
                <div key={post._id} onClick={() => navigate(`/campus/posts/${post._id}`)}
                  className="p-2.5 rounded-lg bg-surface-2 hover:bg-border/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge-base text-[10px] border ${getPostColor(post.type)}`}>{post.type}</span>
                    <span className="text-text-muted text-[10px] flex items-center gap-1">
                      <Clock size={10} /> {formatRelative(post.createdAt)}
                    </span>
                  </div>
                  <p className="text-text-primary text-xs font-medium truncate">{post.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
