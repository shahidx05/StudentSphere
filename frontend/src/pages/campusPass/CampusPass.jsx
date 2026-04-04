import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/ui/Spinner';
import { QrCode, RefreshCw, Download, GraduationCap, User, Building, Calendar, Shield } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

const CampusPass = () => {
  const { user } = useAuth();
  const [pass, setPass] = useState(null);
  const [passUser, setPassUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchPass = async () => {
    try {
      const { data } = await api.get('/api/campus-pass/me');
      if (data.success) {
        setPass(data.data.pass);
        setPassUser(data.data.user);
      }
    } catch {
      // No pass yet — show generate button
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPass(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/api/campus-pass/generate');
      if (data.success) {
        setPass(data.data.pass);
        setPassUser(data.data.user);
        toast.success('Campus pass generated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pass?.qrData) return;
    const link = document.createElement('a');
    link.download = `campus-pass-${user?.name?.replace(/\s+/g, '-')}.png`;
    link.href = pass.qrData;
    link.click();
    toast.success('QR code downloaded!');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SS';
  const displayUser = passUser || user;

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="page-header">Campus Pass</h1>
        <p className="text-text-muted text-sm">Your digital identity card for campus access</p>
      </div>

      {/* ID Card */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-surface to-surface shadow-glow">
        {/* Top gradient bar */}
        <div className="h-2 bg-gradient-to-r from-primary via-blue-400 to-primary" />

        <div className="p-6">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-text-primary text-base">StudentSphere</p>
                <p className="text-text-muted text-xs">University Campus Pass</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30">
              <Shield size={12} className="text-accent" />
              <span className="text-accent text-xs font-medium">{pass?.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>

          <div className="flex items-stretch gap-6">
            {/* Left — User Info */}
            <div className="flex-1 space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary font-bold text-xl font-display">{initials}</span>
                  )}
                </div>
                <div>
                  <p className="font-display font-bold text-text-primary text-lg">{displayUser?.name || 'Student'}</p>
                  <p className="text-text-muted text-xs">{displayUser?.email}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2.5">
                {[
                  { icon: Building, label: 'Department', value: displayUser?.department || '—' },
                  { icon: User, label: 'Branch', value: displayUser?.branch || '—' },
                  { icon: Calendar, label: 'Year', value: displayUser?.year ? `Year ${displayUser.year}` : '—' },
                  { icon: QrCode, label: 'Pass ID', value: pass?._id?.slice(-8).toUpperCase() || '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon size={13} className="text-text-muted flex-shrink-0" />
                    <span className="text-text-muted text-xs">{label}:</span>
                    <span className="text-text-primary text-xs font-medium">{value}</span>
                  </div>
                ))}

                {pass && (
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-text-muted flex-shrink-0" />
                    <span className="text-text-muted text-xs">Generated:</span>
                    <span className="text-text-primary text-xs font-medium">
                      {formatDate(pass.generatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right — QR Code */}
            <div className="flex flex-col items-center justify-center">
              {pass?.qrData ? (
                <div className="p-3 bg-white rounded-xl">
                  <img src={pass.qrData} alt="QR Code" className="w-32 h-32" />
                </div>
              ) : (
                <div className="w-40 h-40 rounded-xl bg-surface-2 border-2 border-dashed border-border flex flex-col items-center justify-center gap-2">
                  <QrCode size={32} className="text-muted" />
                  <p className="text-text-muted text-xs text-center">No pass yet</p>
                </div>
              )}
              <p className="text-text-muted text-[10px] mt-2 text-center">Scan to verify identity</p>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="h-1 bg-gradient-to-r from-accent/50 via-primary/50 to-accent/50" />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary flex-1 sm:flex-none"
        >
          {generating ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          {pass ? 'Regenerate Pass' : 'Generate Pass'}
        </button>

        {pass?.qrData && (
          <button onClick={handleDownload} className="btn-secondary flex-1 sm:flex-none">
            <Download size={16} /> Download QR
          </button>
        )}
      </div>

      {/* Info Card */}
      <div className="card-base bg-primary/5 border-primary/20">
        <h3 className="font-semibold text-text-primary text-sm mb-2 flex items-center gap-2">
          <Shield size={14} className="text-primary" /> How it works
        </h3>
        <ul className="space-y-1.5 text-text-muted text-xs">
          <li>• Your campus pass contains a unique QR code linked to your identity</li>
          <li>• Security staff can scan the QR to verify your enrollment</li>
          <li>• Regenerating creates a new QR and invalidates the old one</li>
          <li>• Download your QR to save it to your device for offline use</li>
        </ul>
      </div>
    </div>
  );
};

export default CampusPass;
