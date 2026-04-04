import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { ArrowLeft, UserPlus, UserCheck, Clock, UserX, MapPin, GraduationCap } from 'lucide-react';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, refetch } = useFetch(`/api/social/students/${id}`);
  const student = data?.data;

  const isOwnProfile = user?._id === id;
  const connection = student?.connectionStatus;

  const initials = student?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleConnect = async () => {
    try {
      await api.post(`/api/social/connect/${id}`);
      toast.success('Request sent!');
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemove = async () => {
    try {
      await api.delete(`/api/social/connect/${id}`);
      toast.success('Connection removed.');
      refetch();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <PageSpinner />;
  if (!student) return <div className="text-center py-20 text-text-muted">Student not found.</div>;

  return (
    <div className="max-w-2xl animate-fade-in space-y-5">
      <button onClick={() => navigate('/social')} className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Student Social
      </button>

      <div className="card-base space-y-5">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {student.profilePhoto ? (
              <img src={student.profilePhoto} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-2xl">{initials}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-text-primary">{student.name}</h1>
            <div className="flex flex-wrap gap-2 mt-1">
              {student.department && <Badge variant="primary">{student.department}</Badge>}
              {student.branch && <Badge variant="default">{student.branch}</Badge>}
              {student.year && <Badge variant="default">Year {student.year}</Badge>}
            </div>
            {(student.state || student.district) && (
              <div className="flex items-center gap-1.5 text-text-muted text-xs mt-2">
                <MapPin size={12} />
                {[student.district, student.state].filter(Boolean).join(', ')}
              </div>
            )}
          </div>

          {/* Connection Button */}
          {!isOwnProfile && (
            <div>
              {connection === 'accepted' ? (
                <button onClick={handleRemove} className="btn-secondary">
                  <UserX size={16} /> Disconnect
                </button>
              ) : connection === 'pending' ? (
                <button disabled className="btn-secondary opacity-60">
                  <Clock size={16} /> Pending
                </button>
              ) : (
                <button onClick={handleConnect} className="btn-primary">
                  <UserPlus size={16} /> Connect
                </button>
              )}
            </div>
          )}

          {isOwnProfile && (
            <button onClick={() => navigate('/profile/edit')} className="btn-secondary">Edit Profile</button>
          )}
        </div>

        {/* Bio */}
        {student.bio && (
          <div>
            <p className="text-text-muted text-xs uppercase tracking-wider font-medium mb-1">About</p>
            <p className="text-text-secondary text-sm leading-relaxed">{student.bio}</p>
          </div>
        )}

        {/* Skills */}
        {student.skills?.length > 0 && (
          <div>
            <p className="text-text-muted text-xs uppercase tracking-wider font-medium mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {student.skills.map(s => (
                <span key={s} className="badge-base bg-primary/5 text-primary border border-primary/20 text-xs">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
