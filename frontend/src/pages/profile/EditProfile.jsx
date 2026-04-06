import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { PageSpinner } from '../../components/ui/Spinner';
import { User, Mail, Building, BookOpen, Hash, FileText, Save, ArrowLeft, Camera, Lock, Eye, EyeOff } from 'lucide-react';
import { DEPARTMENTS, BRANCHES, YEARS } from '../../utils/constants';
import { resolvePhoto } from '../../utils/resolvePhoto';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [showPwSection, setShowPwSection] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', bio: '', department: '', branch: '', year: '',
    college: '', skills: '', interests: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        department: user.department || '',
        branch: user.branch || '',
        year: user.year || '',
        college: user.college || '',
        skills: (user.skills || []).join(', '),
        interests: (user.interests || []).join(', '),
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
        year: form.year ? Number(form.year) : undefined,
      };
      const { data } = await api.put('/api/auth/update-profile', payload);
      if (data.success) {
        updateUser?.(data.data);
        toast.success('Profile updated!');
        navigate('/profile');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    const fd = new FormData();
    fd.append('photo', file);
    setPhotoUploading(true);
    try {
      const { data } = await api.post('/api/auth/upload-photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        updateUser?.(data.data);
        toast.success('Photo updated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Photo upload failed');
    }
    finally { setPhotoUploading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setPwLoading(true);
    try {
      const { data } = await api.put('/api/auth/change-password', {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      if (data.success) {
        toast.success('Password changed successfully!');
        setPwForm({ oldPassword: '', newPassword: '', confirm: '' });
        setShowPwSection(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally { setPwLoading(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SS';

  const FIELDS = [
    { key: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Aarav Sharma' },
    { key: 'bio', label: 'Bio', icon: FileText, type: 'textarea', placeholder: 'Tell others about yourself...' },
    { key: 'college', label: 'College / University', icon: Building, type: 'text', placeholder: 'Your university name' },
    { key: 'skills', label: 'Skills (comma separated)', icon: Hash, type: 'text', placeholder: 'React, Python, ML, Design' },
    { key: 'interests', label: 'Interests (comma separated)', icon: BookOpen, type: 'text', placeholder: 'Music, AI, Robotics' },
  ];

  return (
    <div className="space-y-6 slide-up max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/profile')} className="btn-secondary py-2 px-3">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="page-header">Edit Profile</h1>
          <p className="text-sm text-slate-400 mt-0.5">Update your personal information</p>
        </div>
      </div>

      {/* Photo Section */}
      <div className="glass-card p-6 flex items-center gap-5" style={{ transform: 'none' }}>
        <div className="relative flex-shrink-0">
          {user?.profilePhoto ? (
            <img src={resolvePhoto(user.profilePhoto)} alt={user.name} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/30" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
              {initials}
            </div>
          )}
          {photoUploading && (
            <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div>
          <p className="text-white font-semibold mb-1">Profile Photo</p>
          <p className="text-slate-400 text-xs mb-3">JPG, PNG or GIF. Max 5MB.</p>
          <label className="btn-primary py-2 px-4 text-xs cursor-pointer">
            <Camera size={13} /> Change Photo
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4" style={{ transform: 'none' }}>
        {FIELDS.map(({ key, label, icon: Icon, type, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
            <div className="relative">
              <Icon size={16} className="absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
              {type === 'textarea' ? (
                <textarea
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  rows={3}
                  className="input-field pl-10 resize-none"
                />
              ) : (
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="input-field pl-10"
                />
              )}
            </div>
          </div>
        ))}

        {/* Dept / Branch / Year */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Department</label>
            <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="input-field">
              <option value="">Select</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Branch</label>
            <select value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} className="input-field">
              <option value="">Select</option>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Year</label>
            <select value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className="input-field">
              <option value="">Select</option>
              {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Save size={15} /> Save Changes</>}
        </button>
      </form>

      {/* ── Change Password ── */}
      <div className="glass-card p-6" style={{ transform: 'none' }}>
        <button
          type="button"
          onClick={() => setShowPwSection(v => !v)}
          className="flex items-center justify-between w-full"
        >
          <span className="flex items-center gap-2 font-semibold text-white text-sm">
            <Lock size={15} className="text-indigo-400" /> Change Password
          </span>
          <span className="text-slate-500 text-xs">{showPwSection ? 'Cancel' : 'Update'}</span>
        </button>

        {showPwSection && (
          <form onSubmit={handleChangePassword} className="space-y-3 mt-4 pt-4 border-t border-indigo-500/10">
            {/* Old password */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Current Password</label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={pwForm.oldPassword}
                  onChange={e => setPwForm(f => ({ ...f, oldPassword: e.target.value }))}
                  className="input-field pr-10" placeholder="Enter current password" required
                />
                <button type="button" onClick={() => setShowOld(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {/* New password */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={pwForm.newPassword}
                  onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                  className="input-field pr-10" placeholder="Min. 6 characters" required
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {/* Confirm */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Confirm New Password</label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                className="input-field" placeholder="Repeat new password" required
              />
            </div>
            <button type="submit" disabled={pwLoading} className="btn-primary w-full">
              {pwLoading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Lock size={14} /> Update Password</>
              }
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
