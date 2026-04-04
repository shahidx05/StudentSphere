import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import { UserPlus, UserCheck, UserX, Users } from 'lucide-react';

const TABS = [
  { value: 'discover', label: 'Discover' },
  { value: 'pending', label: 'Requests' },
  { value: 'connections', label: 'Network' },
];

const StudentSocial = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('discover');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionId, setActionId] = useState(null);

  const params = new URLSearchParams({ ...(search && { search }), page, limit: 12 }).toString();
  const { data, loading, refetch } = useFetch(
    tab === 'discover' ? `/api/social/discover?${params}`
    : tab === 'pending' ? '/api/social/requests/pending'
    : '/api/social/connections'
  );

  const students = data?.data || [];
  const pagination = tab === 'discover' ? (data?.pagination || {}) : {};

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ST';
  const GRAD_COLORS = [
    'from-indigo-500 to-purple-600', 'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-500',
    'from-rose-500 to-red-600', 'from-cyan-500 to-blue-600',
  ];

  const handleConnect = async (userId) => {
    setActionId(userId);
    try {
      const { data: res } = await api.post(`/api/social/connect/${userId}`);
      toast.success(res.message || 'Request sent!'); refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionId(null); }
  };

  const handleAccept = async (userId) => {
    setActionId(userId);
    try {
      await api.put(`/api/social/connect/${userId}/accept`);
      toast.success('Connection accepted!'); refetch();
    } catch { toast.error('Failed'); }
    finally { setActionId(null); }
  };

  const handleReject = async (userId) => {
    setActionId(userId);
    try {
      await api.put(`/api/social/connect/${userId}/reject`);
      toast.success('Request rejected'); refetch();
    } catch { toast.error('Failed'); }
    finally { setActionId(null); }
  };

  return (
    <div className="space-y-6 slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">Student Social</h1>
          <p className="text-sm text-slate-400 mt-1">Expand your network with fellow students</p>
        </div>
        <button onClick={() => navigate('/social/connections')} className="btn-secondary w-fit">
          <Users size={15} /> My Connections
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl w-fit border border-white/5">
        {TABS.map(({ value, label }) => (
          <button key={value} onClick={() => { setTab(value); setPage(1); }}
            className={`tab-btn ${tab === value ? 'active' : ''}`}>{label}</button>
        ))}
      </div>

      {tab === 'discover' && (
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search students..." />
      )}

      {loading ? <PageSpinner /> : students.length === 0 ? (
        <EmptyState icon="users" title={tab === 'pending' ? 'No pending requests' : tab === 'connections' ? 'No connections yet' : 'No students found'}
          description={tab === 'discover' ? 'Try a different search term.' : 'Start connecting with fellow students!'} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student, idx) => (
              <div key={student._id} className="glass-card p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {student.profilePhoto ? (
                    <img src={student.profilePhoto} alt={student.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/30 flex-shrink-0" />
                  ) : (
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${GRAD_COLORS[idx % GRAD_COLORS.length]} flex items-center justify-center text-base font-bold text-white flex-shrink-0`}>
                      {getInitials(student.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm cursor-pointer hover:text-indigo-400 transition-colors"
                      onClick={() => navigate(`/social/${student._id}`)}>{student.name}</h3>
                    <p className="text-slate-500 text-xs">{student.department} · Yr {student.year}</p>
                  </div>
                </div>

                {student.bio && <p className="text-slate-400 text-xs line-clamp-2">{student.bio}</p>}

                {student.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {student.skills.slice(0, 3).map(s => (
                      <span key={s} className="badge badge-indigo text-[10px]">{s}</span>
                    ))}
                  </div>
                )}

                {tab === 'discover' && (
                  <button onClick={() => handleConnect(student._id)} disabled={actionId === student._id}
                    className="btn-primary py-2 text-xs w-full">
                    {actionId === student._id
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><UserPlus size={13} /> Connect</>
                    }
                  </button>
                )}

                {tab === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(student._id)} disabled={actionId === student._id}
                      className="flex-1 btn-primary py-2 text-xs">
                      <UserCheck size={13} /> Accept
                    </button>
                    <button onClick={() => handleReject(student._id)} disabled={actionId === student._id}
                      className="flex-1 btn-danger py-2 text-xs">
                      <UserX size={13} /> Reject
                    </button>
                  </div>
                )}

                {tab === 'connections' && (
                  <button onClick={() => navigate(`/social/${student._id}`)} className="btn-secondary py-2 text-xs w-full">
                    View Profile
                  </button>
                )}
              </div>
            ))}
          </div>
          {tab === 'discover' && <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
};

export default StudentSocial;
