import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import { DEPARTMENTS, BRANCHES, STATES } from '../../utils/constants';
import { UserPlus, UserCheck, Clock, User2 } from 'lucide-react';

const StudentSocial = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department: '', branch: '', state: '' });
  const [page, setPage] = useState(1);
  const [connecting, setConnecting] = useState({});

  const params = new URLSearchParams({
    ...(search && { search }),
    ...(filters.department && { department: filters.department }),
    ...(filters.branch && { branch: filters.branch }),
    ...(filters.state && { state: filters.state }),
    page, limit: 12,
  }).toString();

  const { data, loading, refetch } = useFetch(`/api/social/students?${params}`);
  const students = data?.data || [];
  const pagination = data?.pagination || {};

  // Get connection statuses from logged-in user
  const { data: meData } = useFetch('/api/auth/me');
  const myConnections = meData?.data?.connections || [];

  const getConnectionStatus = (studentId) => {
    const conn = myConnections.find(c => (c.user?._id || c.user) === studentId);
    return conn?.status || null;
  };

  const handleConnect = async (studentId) => {
    setConnecting(c => ({ ...c, [studentId]: true }));
    try {
      await api.post(`/api/social/connect/${studentId}`);
      toast.success('Connection request sent!');
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setConnecting(c => ({ ...c, [studentId]: false })); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Student Social</h1>
          <p className="text-text-muted text-sm">Connect with fellow students</p>
        </div>
        <button onClick={() => navigate('/social/connections')} className="btn-secondary">
          <UserCheck size={16} /> My Connections
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name..." />
        </div>
        <select value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))} className="input-base w-auto min-w-[150px]">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filters.branch} onChange={e => setFilters(f => ({ ...f, branch: e.target.value }))} className="input-base w-auto min-w-[150px]">
          <option value="">All Branches</option>
          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={filters.state} onChange={e => setFilters(f => ({ ...f, state: e.target.value }))} className="input-base w-auto min-w-[150px]">
          <option value="">All States</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <PageSpinner /> : students.length === 0 ? (
        <EmptyState icon="users" title="No students found" description="Try changing your search filters." />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {students.map((student) => {
              const status = getConnectionStatus(student._id);
              const initials = student.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

              return (
                <div key={student._id} className="card-base card-glow flex flex-col gap-3">
                  {/* Avatar */}
                  <div className="flex items-center gap-3">
                    <div onClick={() => navigate(`/social/${student._id}`)}
                      className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0">
                      {student.profilePhoto ? (
                        <img src={student.profilePhoto} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-primary font-bold text-sm">{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary font-semibold text-sm truncate cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigate(`/social/${student._id}`)}>
                        {student.name}
                      </p>
                      <p className="text-text-muted text-xs truncate">{student.branch || student.department}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  {student.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {student.skills.slice(0, 3).map(s => (
                        <span key={s} className="text-[10px] bg-primary/5 text-primary/70 border border-primary/10 px-1.5 py-0.5 rounded-full">{s}</span>
                      ))}
                      {student.skills.length > 3 && (
                        <span className="text-[10px] text-muted">+{student.skills.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Connect Button */}
                  {status === 'accepted' ? (
                    <div className="flex items-center gap-1.5 justify-center py-1.5 text-accent text-xs font-medium">
                      <UserCheck size={14} /> Connected
                    </div>
                  ) : status === 'pending' ? (
                    <div className="flex items-center gap-1.5 justify-center py-1.5 text-warning text-xs font-medium">
                      <Clock size={14} /> Pending
                    </div>
                  ) : (
                    <button onClick={() => handleConnect(student._id)} disabled={connecting[student._id]}
                      className="btn-secondary w-full py-1.5 text-xs">
                      <UserPlus size={14} /> Connect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default StudentSocial;
