import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { PageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { UserCheck, UserX, Clock } from 'lucide-react';

const Connections = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('connections');
  const { data: connData, loading: connLoading, refetch: connRefetch } = useFetch('/api/social/connections');
  const { data: reqData, loading: reqLoading, refetch: reqRefetch } = useFetch('/api/social/requests');

  const connections = connData?.data || [];
  const requests = reqData?.data || [];

  const handleAccept = async (userId) => {
    try {
      await api.put(`/api/social/connect/${userId}/accept`);
      toast.success('Connection accepted!');
      reqRefetch();
      connRefetch();
    } catch { toast.error('Failed'); }
  };

  const handleReject = async (userId) => {
    try {
      await api.put(`/api/social/connect/${userId}/reject`);
      toast.success('Request rejected.');
      reqRefetch();
    } catch { toast.error('Failed'); }
  };

  const handleRemove = async (userId) => {
    try {
      await api.delete(`/api/social/connect/${userId}`);
      toast.success('Connection removed.');
      connRefetch();
    } catch { toast.error('Failed'); }
  };

  const StudentCard = ({ student, actions }) => {
    const initials = student?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    return (
      <div className="card-base flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer"
          onClick={() => navigate(`/social/${student._id}`)}>
          {student.profilePhoto ? (
            <img src={student.profilePhoto} alt={student.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary font-bold text-xs">{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/social/${student._id}`)}>
          <p className="text-text-primary text-sm font-semibold truncate">{student.name}</p>
          <p className="text-text-muted text-xs">{student.department} · {student.branch}</p>
        </div>
        <div className="flex gap-2">{actions}</div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-header">Connections</h1>
        <p className="text-text-muted text-sm">Manage your network</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface p-1 rounded-xl border border-border w-fit">
        <button onClick={() => setTab('connections')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === 'connections' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}>
          <UserCheck size={15} /> My Connections {connections.length > 0 && `(${connections.length})`}
        </button>
        <button onClick={() => setTab('requests')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === 'requests' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}>
          <Clock size={15} /> Pending Requests {requests.length > 0 && (
            <span className="w-5 h-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">{requests.length}</span>
          )}
        </button>
      </div>

      {tab === 'connections' ? (
        connLoading ? <PageSpinner /> : connections.length === 0 ? (
          <EmptyState icon="users" title="No connections yet" description="Start connecting with fellow students!"
            action={<button onClick={() => navigate('/social')} className="btn-primary">Find Students</button>} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {connections.map((student) => (
              <StudentCard key={student._id} student={student} actions={
                <button onClick={() => handleRemove(student._id)}
                  className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/5 transition-all">
                  <UserX size={16} />
                </button>
              } />
            ))}
          </div>
        )
      ) : (
        reqLoading ? <PageSpinner /> : requests.length === 0 ? (
          <EmptyState title="No pending requests" description="You're all caught up!" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {requests.map((req) => {
              const student = req.user;
              return (
                <StudentCard key={student?._id} student={student || {}} actions={
                  <>
                    <button onClick={() => handleReject(student?._id)}
                      className="btn-danger py-1.5 px-3 text-xs">Reject</button>
                    <button onClick={() => handleAccept(student?._id)}
                      className="btn-primary py-1.5 px-3 text-xs">Accept</button>
                  </>
                } />
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default Connections;
