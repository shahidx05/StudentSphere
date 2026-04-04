import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import FileUpload from '../../components/ui/FileUpload';
import { ArrowLeft, Plus } from 'lucide-react';
import { MARKETPLACE_CATEGORIES, MARKETPLACE_CONDITIONS } from '../../utils/constants';

const AddListing = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'book', price: '', isFree: false,
    condition: 'good', section: 'secondhand', shopAddress: '', contactInfo: '',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.condition) { toast.error('Please fill required fields'); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    images.forEach(img => fd.append('images', img));

    setLoading(true);
    try {
      await api.post('/api/marketplace', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Listing created!');
      navigate('/marketplace');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/marketplace')} className="p-2 rounded-lg text-muted hover:text-text-primary hover:bg-surface-2 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-header">Add Listing</h1>
          <p className="text-text-muted text-sm">List an item for sale or for free</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-base space-y-4">
        {/* Section */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Section *</label>
          <div className="flex gap-2">
            {[{ value: 'secondhand', label: 'Second Hand' }, { value: 'local_shop', label: 'Local Shop' }].map(s => (
              <button key={s.value} type="button" onClick={() => setForm(f => ({ ...f, section: s.value }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  form.section === s.value ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted hover:text-text-primary'
                }`}>{s.label}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Title *</label>
          <input value={form.title} onChange={set('title')} placeholder="e.g. Engineering Mathematics Textbook" className="input-base" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Description *</label>
          <textarea value={form.description} onChange={set('description')} rows={4} placeholder="Describe the item..." className="input-base resize-none" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Category *</label>
            <select value={form.category} onChange={set('category')} className="input-base">
              {MARKETPLACE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Condition *</label>
            <select value={form.condition} onChange={set('condition')} className="input-base">
              {MARKETPLACE_CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <input type="checkbox" checked={form.isFree} onChange={set('isFree')} className="w-4 h-4 accent-primary" />
            <span className="text-sm text-text-secondary font-medium">This item is FREE</span>
          </label>
          {!form.isFree && (
            <input type="number" value={form.price} onChange={set('price')} placeholder="Price in ₹" min="0" className="input-base" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Contact Info</label>
          <input value={form.contactInfo} onChange={set('contactInfo')} placeholder="Email or phone number" className="input-base" />
        </div>

        {form.section === 'local_shop' && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Shop Address</label>
            <input value={form.shopAddress} onChange={set('shopAddress')} placeholder="Shop location" className="input-base" />
          </div>
        )}

        <FileUpload label="Images (up to 5)" multiple accept="image/*" onChange={setImages} />

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/marketplace')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={16} /> Create Listing</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddListing;
