import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { PageSpinner } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate, formatRelative } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  Users, BookOpen, ShoppingBag, Search, Shield,
  Trash2, UserCog, BarChart3, Activity, TrendingUp,
  Globe, Package, Briefcase,
} from 'lucide-react';

const TABS = [
  { id: 'overview',    label: 'Overview',    icon: BarChart3 },
  { id: 'users',       label: 'Users',       icon: Users },
  { id: 'resources',   label: 'Resources',   icon: BookOpen },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
];

const AdminDashboard = () => {
  const [tab, setTab]             = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole]   = useState('');
  const [userPage, setUserPage]   = useState(1);
  const [resPage, setResPage]     = useState(1);
  const [mktPage, setMktPage]     = useState(1);
  const [deleteModal, setDeleteModal] = useState(null); // { type, id, name }
  const [roleModal, setRoleModal]     = useState(null); // { id, name, currentRole }

  const { data: statsData, loading: statsLoading } = useFetch('/api/admin/stats');
  const { data: activityData } = useFetch('/api/admin/activity');

  const userParams = new URLSearchParams({
    ...(userSearch && { search: userSearch }),
    ...(userRole && { role: userRole }),
    page: userPage, limit: 15,
  }).toString();
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useFetch(
    tab === 'users' ? `/api/admin/users?${userParams}` : null
  );
  const { data: resData, loading: resLoading, refetch: refetchRes } = useFetch(
    tab === 'resources' ? `/api/admin/resources?page=${resPage}&limit=15` : null
  );
  const { data: mktData, loading: mktLoading, refetch: refetchMkt } = useFetch(
    tab === 'marketplace' ? `/api/admin/marketplace?page=${mktPage}&limit=15` : null
  );

  const stats    = statsData?.data || {};
  const activity = activityData?.data || {};
  const users    = usersData?.data || [];
  const resources = resData?.data || [];
  const mktItems  = mktData?.data || [];

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/api/admin/${deleteModal.type}/${deleteModal.id}`);
      toast.success(`${deleteModal.name} deleted.`);
      setDeleteModal(null);
      if (deleteModal.type === 'users') refetchUsers();
      if (deleteModal.type === 'resources') refetchRes();
      if (deleteModal.type === 'marketplace') refetchMkt();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRoleChange = async (newRole) => {
    if (!roleModal) return;
    try {
      await api.patch(`/api/admin/users/${roleModal.id}/role`, { role: newRole });
      toast.success(`Role changed to ${newRole}`);
      setRoleModal(null);
      refetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const STAT_CARDS = [
    { label: 'Total Users',    value: stats.totalUsers || 0,    icon: Users,       color: 'indigo' },
    { label: 'Students',       value: stats.students || 0,      icon: Shield,      color: 'purple' },
    { label: 'Resources',      value: stats.resources || 0,     icon: BookOpen,    color: 'blue' },
    { label: 'Marketplace',    value: stats.marketplace || 0,   icon: ShoppingBag, color: 'accent' },
    { label: 'Opportunities',  value: stats.opportunities || 0, icon: Briefcase,   color: 'warning' },
    { label: 'Campus Posts',   value: stats.posts || 0,         icon: Globe,       color: 'indigo' },
  ];

  const colorMap = {
    indigo: { icon: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    purple: { icon: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    blue:   { icon: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
    accent: { icon: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20' },
    warning:{ icon: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
  };

  return (
    <div className="space-y-6 slide-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-header">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Platform management & oversight</p>
        </div>
        <Badge variant="danger" className="text-sm px-3 py-1">
          <Shield size={14} /> Admin Mode
        </Badge>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl w-fit border border-white/5 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`tab-btn flex items-center gap-2 ${tab === id ? 'active' : ''}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {statsLoading ? <PageSpinner /> : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {STAT_CARDS.map(({ label, value, icon: Icon, color }) => {
                const c = colorMap[color] || colorMap.indigo;
                return (
                  <div key={label} className={`stat-card flex items-center gap-4 border ${c.bg}`}>
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                      <Icon size={22} className={c.icon} />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">{label}</p>
                      <p className={`font-display text-3xl font-bold ${c.icon}`}>{value.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Recent Users */}
            <div className="glass-card p-5" style={{ transform: 'none' }}>
              <h3 className="section-header mb-4"><Users size={16} className="text-indigo-400" /> New Users</h3>
              <div className="space-y-3">
                {(activity.recentUsers || []).map(u => (
                  <div key={u._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{u.name}</p>
                      <p className="text-slate-500 text-xs">{formatRelative(u.createdAt)}</p>
                    </div>
                    <Badge variant={u.role === 'admin' ? 'danger' : 'indigo'}>{u.role}</Badge>
                  </div>
                ))}
              </div>
            </div>
            {/* Recent Resources */}
            <div className="glass-card p-5" style={{ transform: 'none' }}>
              <h3 className="section-header mb-4"><BookOpen size={16} className="text-purple-400" /> New Resources</h3>
              <div className="space-y-3">
                {(activity.recentResources || []).map(r => (
                  <div key={r._id} className="row-item">
                    <BookOpen size={14} className="text-purple-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{r.title}</p>
                      <p className="text-slate-500 text-[10px]">{formatRelative(r.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Recent Listings */}
            <div className="glass-card p-5" style={{ transform: 'none' }}>
              <h3 className="section-header mb-4"><ShoppingBag size={16} className="text-emerald-400" /> New Listings</h3>
              <div className="space-y-3">
                {(activity.recentListings || []).map(l => (
                  <div key={l._id} className="row-item">
                    <Package size={14} className="text-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{l.title}</p>
                      <p className="text-slate-500 text-[10px]">{formatRelative(l.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── USERS ── */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <SearchBar value={userSearch} onChange={v => { setUserSearch(v); setUserPage(1); }} placeholder="Search users..." />
            </div>
            <select value={userRole} onChange={e => { setUserRole(e.target.value); setUserPage(1); }}
              className="input-field w-36">
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          {usersLoading ? <PageSpinner /> : users.length === 0 ? <EmptyState title="No users found" /> : (
            <>
              <div className="glass-card overflow-hidden p-0" style={{ transform: 'none' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-indigo-500/10 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Department</th>
                      <th className="text-left py-3 px-4">Joined</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-500/5">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-indigo-500/5 transition-all">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">{u.name}</p>
                              <p className="text-slate-500 text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{u.department || '—'}</td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{formatDate(u.createdAt)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={u.role === 'admin' ? 'danger' : 'indigo'}>{u.role}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setRoleModal({ id: u._id, name: u.name, currentRole: u.role })}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                              <UserCog size={14} />
                            </button>
                            <button onClick={() => setDeleteModal({ type: 'users', id: u._id, name: u.name })}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={userPage} totalPages={usersData?.pagination?.totalPages || 1} onPageChange={setUserPage} />
            </>
          )}
        </div>
      )}

      {/* ── RESOURCES ── */}
      {tab === 'resources' && (
        <div className="space-y-4">
          {resLoading ? <PageSpinner /> : resources.length === 0 ? <EmptyState title="No resources found" /> : (
            <>
              <div className="glass-card overflow-hidden p-0" style={{ transform: 'none' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-indigo-500/10 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Uploaded By</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-500/5">
                    {resources.map(r => (
                      <tr key={r._id} className="hover:bg-indigo-500/5 transition-all">
                        <td className="py-3 px-4 text-white font-medium">{r.title}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{r.uploadedBy?.name || '—'}</td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{formatDate(r.createdAt)}</td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => setDeleteModal({ type: 'resources', id: r._id, name: r.title })}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={resPage} totalPages={resData?.pagination?.totalPages || 1} onPageChange={setResPage} />
            </>
          )}
        </div>
      )}

      {/* ── MARKETPLACE ── */}
      {tab === 'marketplace' && (
        <div className="space-y-4">
          {mktLoading ? <PageSpinner /> : mktItems.length === 0 ? <EmptyState title="No listings found" /> : (
            <>
              <div className="glass-card overflow-hidden p-0" style={{ transform: 'none' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-indigo-500/10 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="text-left py-3 px-4">Item</th>
                      <th className="text-left py-3 px-4">Seller</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-500/5">
                    {mktItems.map(item => (
                      <tr key={item._id} className="hover:bg-indigo-500/5 transition-all">
                        <td className="py-3 px-4 text-white font-medium">{item.title}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{item.seller?.name || '—'}</td>
                        <td className="py-3 px-4 text-emerald-400 font-semibold">{item.isFree ? 'FREE' : formatCurrency(item.price)}</td>
                        <td className="py-3 px-4"><Badge variant={item.status}>{item.status}</Badge></td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => setDeleteModal({ type: 'marketplace', id: item._id, name: item.title })}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={mktPage} totalPages={mktData?.pagination?.totalPages || 1} onPageChange={setMktPage} />
            </>
          )}
        </div>
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Confirm Deletion" size="sm">
        <p className="text-slate-400 text-sm mb-4">
          Are you sure you want to delete <strong className="text-white">{deleteModal?.name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModal(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
        </div>
      </Modal>

      {/* Role Change Modal */}
      <Modal isOpen={!!roleModal} onClose={() => setRoleModal(null)} title="Change User Role" size="sm">
        <p className="text-slate-400 text-sm mb-4">
          Change role for <strong className="text-white">{roleModal?.name}</strong> (currently: <Badge variant={roleModal?.currentRole === 'admin' ? 'danger' : 'indigo'}>{roleModal?.currentRole}</Badge>)
        </p>
        <div className="flex gap-3">
          <button onClick={() => handleRoleChange('student')} className="btn-secondary flex-1">
            <Users size={15} /> Make Student
          </button>
          <button onClick={() => handleRoleChange('admin')} className="btn-danger flex-1">
            <Shield size={15} /> Make Admin
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
