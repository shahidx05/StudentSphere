import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import FileUpload from '../../components/ui/FileUpload';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload } from 'lucide-react';
import { DEPARTMENTS, YEARS, RESOURCE_TYPES } from '../../utils/constants';

const ResourceUpload = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', type: '', subject: '', department: '', year: '', tags: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.type) { toast.error('Title and type are required'); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (file) fd.append('file', file);

    setLoading(true);
    try {
      await api.post('/api/resources', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Resource uploaded successfully!');
      navigate('/resources');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/resources')} className="p-2 rounded-lg text-muted hover:text-text-primary hover:bg-surface-2 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-header">Upload Resource</h1>
          <p className="text-text-muted text-sm">Share study materials with your peers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-base space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Title *</label>
            <input value={form.title} onChange={set('title')} placeholder="e.g. Data Structures Complete Notes" className="input-base" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Resource Type *</label>
            <select value={form.type} onChange={set('type')} className="input-base" required>
              <option value="">Select type</option>
              {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Subject</label>
            <input value={form.subject} onChange={set('subject')} placeholder="e.g. Data Structures" className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Department</label>
            <select value={form.department} onChange={set('department')} className="input-base">
              <option value="">Select</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Year</label>
            <select value={form.year} onChange={set('year')} className="input-base">
              <option value="">Any Year</option>
              {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Describe the resource..." className="input-base resize-none" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Tags (comma-separated)</label>
            <input value={form.tags} onChange={set('tags')} placeholder="DSA, algorithms, trees" className="input-base" />
          </div>
          <div className="col-span-2">
            <FileUpload label="Upload File (PDF or Image)" accept="application/pdf,image/*" onChange={setFile} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/resources')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Upload size={16} /> Upload Resource</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceUpload;
