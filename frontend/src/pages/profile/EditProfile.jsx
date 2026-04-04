import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import FileUpload from '../../components/ui/FileUpload';
import { ArrowLeft, X, Plus, Eye, EyeOff } from 'lucide-react';
import { DEPARTMENTS, BRANCHES, YEARS, STATES, SKILLS_SUGGESTIONS } from '../../utils/constants';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', bio: '', department: '', branch: '', year: '', state: '', district: '' });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', bio: user.bio || '', department: user.department || '', branch: user.branch || '', year: user.year || '', state: user.state || '', district: user.district || '' });
      setSkills(user.skills || []);
    }
  }, [user]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const addSkill = (skill) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills(s => [...s, skill.trim()]);
    }
    setSkillInput('');
  };

  const removeSkill = (s) => setSkills(prev => prev.filter(x => x !== s));

  const handlePhotoChange = (file) => {
    setPhoto(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/api/auth/update-profile', form);
      await api.put('/api/auth/update-skills', { skills });

      if (photo) {
        const fd = new FormData();
        fd.append('photo', photo);
        await api.post('/api/auth/upload-photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      updateUser({ ...form, skills });
      toast.success('Profile updated!');
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    setPwLoading(true);
    try {
      await api.put('/api/auth/change-password', { oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally { setPwLoading(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/profile')} className="p-2 rounded-lg text-muted hover:text-text-primary hover:bg-surface-2 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-header">Edit Profile</h1>
          <p className="text-text-muted text-sm">Update your personal information</p>
        </div>
      </div>

      <form onSubmit={handleProfileSave} className="card-base space-y-5">
        {/* Avatar Section */}
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-xl">{initials}</span>
            )}
          </div>
          <FileUpload label="Change Photo" accept="image/*" onChange={handlePhotoChange} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
            <input value={form.name} onChange={set('name')} placeholder="Your name" className="input-base" required />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={set('bio')} rows={3} placeholder="Tell others about yourself..." className="input-base resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Department</label>
            <select value={form.department} onChange={set('department')} className="input-base">
              <option value="">Select</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Branch</label>
            <select value={form.branch} onChange={set('branch')} className="input-base">
              <option value="">Select</option>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Year</label>
            <select value={form.year} onChange={set('year')} className="input-base">
              <option value="">Select</option>
              {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">State</label>
            <select value={form.state} onChange={set('state')} className="input-base">
              <option value="">Select</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">District</label>
            <input value={form.district} onChange={set('district')} placeholder="Your district" className="input-base" />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Skills</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map(s => (
              <span key={s} className="flex items-center gap-1.5 badge-base bg-primary/10 text-primary border border-primary/20 text-xs px-2.5 py-1">
                {s}
                <button type="button" onClick={() => removeSkill(s)}><X size={10} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
              placeholder="Type skill and press Enter" className="input-base flex-1" />
            <button type="button" onClick={() => addSkill(skillInput)} className="btn-secondary px-3">
              <Plus size={16} />
            </button>
          </div>
          {/* Suggestions */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {SKILLS_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 8).map(s => (
              <button key={s} type="button" onClick={() => addSkill(s)}
                className="text-[11px] bg-surface-2 text-text-muted hover:text-primary hover:bg-primary/5 border border-border hover:border-primary/30 px-2 py-0.5 rounded-full transition-all">
                + {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/profile')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Password Change */}
      <form onSubmit={handlePasswordChange} className="card-base space-y-4">
        <h2 className="font-display text-lg font-semibold text-text-primary">Change Password</h2>

        {[
          { key: 'oldPassword', label: 'Current Password', show: showPw.old, toggle: () => setShowPw(s => ({ ...s, old: !s.old })) },
          { key: 'newPassword', label: 'New Password', show: showPw.new, toggle: () => setShowPw(s => ({ ...s, new: !s.new })) },
          { key: 'confirmPassword', label: 'Confirm New Password', show: showPw.confirm, toggle: () => setShowPw(s => ({ ...s, confirm: !s.confirm })) },
        ].map(({ key, label, show, toggle }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} value={pwForm[key]}
                onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder="••••••••" className="input-base pr-10" />
              <button type="button" onClick={toggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text-primary transition-colors">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        ))}

        <button type="submit" disabled={pwLoading} className="btn-primary w-full">
          {pwLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
