import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import FileUpload from '../../components/ui/FileUpload';
import useFetch from '../../hooks/useFetch';
import { ArrowLeft } from 'lucide-react';
import { POST_TYPES } from '../../utils/constants';

const CreatePost = () => {
  const navigate = useNavigate();
  const { data: clubsData } = useFetch('/api/campus/clubs?limit=50');
  const clubs = clubsData?.data || [];
  const [form, setForm] = useState({ title: '', content: '', type: 'general', club: '', eventDate: '', eventVenue: '' });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) { toast.error('Title and content are required'); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    images.forEach(img => fd.append('images', img));

    setLoading(true);
    try {
      await api.post('/api/campus/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Post published!');
      navigate('/campus');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/campus')} className="p-2 rounded-lg text-muted hover:text-text-primary hover:bg-surface-2 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-header">Create Post</h1>
          <p className="text-text-muted text-sm">Share with the campus community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-base space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Post Type *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {POST_TYPES.map(({ value, label, color }) => (
              <button key={value} type="button" onClick={() => setForm(f => ({ ...f, type: value }))}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                  form.type === value ? `${color} border-current` : 'border-border text-muted hover:text-text-primary'
                }`}>{label}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Title *</label>
          <input value={form.title} onChange={set('title')} placeholder="Post title" className="input-base" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Content *</label>
          <textarea value={form.content} onChange={set('content')} rows={5} placeholder="What's on your mind?" className="input-base resize-none" required />
        </div>

        {clubs.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Club (optional)</label>
            <select value={form.club} onChange={set('club')} className="input-base">
              <option value="">— No Club —</option>
              {clubs.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {form.type === 'event' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Event Date</label>
              <input type="datetime-local" value={form.eventDate} onChange={set('eventDate')} className="input-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Venue</label>
              <input value={form.eventVenue} onChange={set('eventVenue')} placeholder="e.g. Main Auditorium" className="input-base" />
            </div>
          </div>
        )}

        <FileUpload label="Images (optional)" multiple accept="image/*" onChange={setImages} />

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/campus')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
