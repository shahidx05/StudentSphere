import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import FileUpload from '../../components/ui/FileUpload';
import { ArrowLeft } from 'lucide-react';

const AddLostFound = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ status: 'lost', title: '', description: '', locationLost: '', contactInfo: '', externalLink: '' });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.contactInfo) { toast.error('Title and contact info are required'); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    images.forEach(img => fd.append('images', img));

    setLoading(true);
    try {
      await api.post('/api/lostfound', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Post created!');
      navigate('/lostfound');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/lostfound')} className="p-2 rounded-lg text-muted hover:text-text-primary hover:bg-surface-2 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-header">Report Item</h1>
          <p className="text-text-muted text-sm">Report a lost or found item</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-base space-y-4">
        {/* Status Toggle */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Status *</label>
          <div className="flex gap-2">
            {['lost', 'found'].map(s => (
              <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border capitalize transition-all ${
                  form.status === s
                    ? s === 'lost' ? 'bg-danger/10 border-danger/30 text-danger' : 'bg-accent/10 border-accent/30 text-accent'
                    : 'border-border text-muted hover:text-text-primary'
                }`}>{s}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Title *</label>
          <input value={form.title} onChange={set('title')} placeholder="e.g. Black JBL Earphones" className="input-base" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
          <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Describe the item..." className="input-base resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Location {form.status === 'lost' ? 'Lost' : 'Found'}</label>
          <input value={form.locationLost} onChange={set('locationLost')} placeholder="e.g. Central Library, 2nd Floor" className="input-base" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Contact Info *</label>
          <input value={form.contactInfo} onChange={set('contactInfo')} placeholder="Email or phone number" className="input-base" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">External Link (optional)</label>
          <input value={form.externalLink} onChange={set('externalLink')} placeholder="https://..." className="input-base" />
        </div>

        <FileUpload label="Photos (up to 3)" multiple accept="image/*" onChange={setImages} />

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/lostfound')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLostFound;
