import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import FileUpload from '../../components/ui/FileUpload';
import { ArrowLeft, Wand2, Loader2 } from 'lucide-react';

const PROMPT = `You are helping a college student report a lost or found item on campus.
Analyze this image carefully and identify the item.

Return ONLY a valid JSON object with NO markdown, NO backticks, NO explanation:
{
  "title": "short item name, max 5 words",
  "description": "describe color, brand if visible, size, condition, any identifying features. 2-3 sentences.",
  "category": "one of: electronics, stationery, clothing, accessories, bag, bottle, id-card, keys, books, sports, other"
}`;

const MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'google/gemini-2.5-pro-exp-03-25:free',
  'meta-llama/llama-4-scout:free',
  'openrouter/auto',
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload  = () => resolve(reader.result.split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const getGPSAddress = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return; }
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
        );
        const data = await res.json();
        // Build a short human-readable address
        const parts = [
          data.address?.road,
          data.address?.suburb,
          data.address?.city || data.address?.town || data.address?.village,
        ].filter(Boolean);
        resolve(parts.join(', ') || data.display_name || 'Current location');
      } catch {
        resolve('Current location');
      }
    },
    (err) => reject(err),
    { timeout: 8000 }
  );
});

// ─────────────────────────────────────────────────────────────────────────────

const AddLostFound = () => {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [form, setForm] = useState({
    status: 'lost', title: '', description: '',
    locationLost: '', contactInfo: '', externalLink: '',
  });
  const [images,     setImages]     = useState([]);
  const [loading,    setLoading]    = useState(false);

  // AI image
  const [aiImage,    setAiImage]    = useState(null);
  const [aiPreview,  setAiPreview]  = useState(null);

  // Auto-fill state
  const [filling,    setFilling]    = useState(false);  // when auto-fill running
  const [filled,     setFilled]     = useState(false);  // after success

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  // ── Image picker (for AI + submission) ────────────────────────────────
  const handleAiImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAiImage(file);
    setAiPreview(URL.createObjectURL(file));
    setFilled(false);
    // Add to images list for upload (avoid duplicate by name)
    setImages(prev => prev.find(f => f.name === file.name) ? prev : [file, ...prev]);
  };

  // When the secondary FileUpload picks more images, MERGE with existing (don't replace)
  const handleExtraImages = (files) => {
    const arr = Array.isArray(files) ? files : (files ? [files] : []);
    setImages(prev => {
      const existing = prev.filter(p => !arr.find(a => a.name === p.name));
      return [...existing, ...arr];
    });
  };

  // ── Auto Fill — combines AI + GPS + user email ─────────────────────────────
  const handleAutoFill = async () => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      toast.error('AI key not configured. Check VITE_OPENROUTER_API_KEY in .env');
      return;
    }
    setFilling(true);
    const results = { title: '', description: '', locationLost: '', contactInfo: '' };

    // 1. AI image analysis (if image uploaded)
    if (aiImage) {
      try {
        const base64 = await fileToBase64(aiImage);
        const mimeType = aiImage.type || 'image/jpeg';
        let parsed = null;

        for (const model of MODELS) {
          try {
            console.log(`[AI] Trying model: ${model}`);
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'StudentSphere Lost & Found',
              },
              body: JSON.stringify({
                model,
                messages: [{
                  role: 'user',
                  content: [
                    { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
                    { type: 'text', text: PROMPT },
                  ],
                }],
                max_tokens: 400,
              }),
            });

            const data = await response.json();
            console.log(`[AI] ${model} response:`, data);

            if (!response.ok || data.error) {
              console.warn(`[AI] ${model} failed:`, data.error?.message || response.status);
              continue;
            }

            const content = data.choices?.[0]?.message?.content;
            if (!content) { console.warn(`[AI] ${model}: no content`); continue; }

            const cleaned = content.replace(/```json\s*|```/g, '').trim();
            const match   = cleaned.match(/\{[\s\S]*\}/);
            if (!match) { console.warn(`[AI] ${model}: no JSON in response`); continue; }

            parsed = JSON.parse(match[0]);
            console.log(`[AI] Success with ${model}:`, parsed);
            break;
          } catch (e) { console.warn(`[AI] ${model} threw:`, e); continue; }
        }

        if (parsed) {
          results.title       = parsed.title       || '';
          results.description = parsed.description || '';
        } else {
          console.warn('AI: no parseable JSON from any model');
        }
      } catch (err) {
        console.warn('AI error:', err);
      }
    }

    // 2. GPS location → reverse geocode
    try {
      const address = await getGPSAddress();
      results.locationLost = address;
    } catch {
      console.warn('GPS not available');
    }

    // 3. User email
    if (user?.email) results.contactInfo = user.email;

    // Apply results — only overwrite empty fields (don't clobber user edits)
    setForm(f => ({
      ...f,
      title:        results.title       || f.title,
      description:  results.description || f.description,
      locationLost: results.locationLost || f.locationLost,
      contactInfo:  results.contactInfo  || f.contactInfo,
    }));

    setFilled(true);
    setFilling(false);

    const filled = [];
    if (results.title)        filled.push('title');
    if (results.description)  filled.push('description');
    if (results.locationLost) filled.push('location');
    if (results.contactInfo)  filled.push('contact');

    if (filled.length > 0) {
      toast.success(`Auto-filled: ${filled.join(', ')}. Review and edit as needed.`);
    } else {
      toast('Could not auto-fill. Please fill manually.', { icon: 'ℹ️' });
    }
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.contactInfo) { toast.error('Title and contact info are required'); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    images.forEach(img => fd.append('images', img));

    // Debug: confirm files are in FormData
    console.log('[Submit] images state:', images.length, images.map(f => f.name));
    for (const [key, val] of fd.entries()) {
      if (val instanceof File) console.log(`  fd[${key}]:`, val.name, val.size, 'bytes');
      else console.log(`  fd[${key}]:`, val);
    }

    setLoading(true);
    try {
      // Do NOT set Content-Type manually — browser sets multipart/form-data with boundary automatically
      const res = await api.post('/api/lostfound', fd);
      console.log('[Submit] response:', res.data);
      toast.success('Post created!');
      navigate('/lostfound');
    } catch (err) {
      console.error('[Submit] error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/lostfound')}
          className="p-2 rounded-lg text-muted hover:text-text-primary hover:bg-surface-2 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-header">Report Item</h1>
          <p className="text-text-muted text-sm">Upload a photo and let AI fill the form for you</p>
        </div>
      </div>

      {/* ── PHOTO + AUTO FILL ─────────────────────────────────────────────── */}
      <div className="card-base space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-primary text-sm font-semibold">Item Photo</p>
            <p className="text-text-muted text-xs mt-0.5">Upload a photo to enable AI auto-fill</p>
          </div>
          {/* Auto Fill button */}
          <button
            type="button"
            onClick={handleAutoFill}
            disabled={filling}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              filled
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {filling ? (
              <><Loader2 size={14} className="animate-spin" /> Filling...</>
            ) : filled ? (
              'Filled'
            ) : (
              <><Wand2 size={14} /> Auto Fill</>
            )}
          </button>
        </div>

        {/* Upload zone / preview */}
        {!aiPreview ? (
          <label className="block border-2 border-dashed border-border hover:border-primary/40 rounded-xl p-8 text-center cursor-pointer transition-all duration-200 hover:bg-primary/5">
            <input type="file" accept="image/*" className="hidden" onChange={handleAiImageChange} />
            <p className="text-text-secondary text-sm font-medium">Click to upload item photo</p>
            <p className="text-text-muted text-xs mt-1">JPEG, PNG, WEBP up to 5MB</p>
          </label>
        ) : (
          <div className="relative w-full h-44 rounded-xl overflow-hidden border border-border bg-surface-2">
            <img src={aiPreview} alt="Item" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={() => { setAiPreview(null); setAiImage(null); setFilled(false); }}
              className="absolute top-2 right-2 w-6 h-6 bg-surface/80 backdrop-blur rounded-full flex items-center justify-center text-text-muted hover:text-danger text-xs transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* What auto-fill does */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'AI analyzes photo', sub: 'Fills title & description' },
            { label: 'GPS location detect', sub: 'Fills location lost field' },
            { label: 'Your account email', sub: 'Fills contact info' },
            { label: 'Fully editable', sub: 'Change anything after fill' },
          ].map(({ label, sub }) => (
            <div key={label} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-text-secondary text-xs font-medium">{label}</p>
                <p className="text-text-muted text-[10px]">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FORM ─────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="card-base space-y-4">
        <p className="text-text-secondary text-sm font-semibold">
          Item Details
          {filled && <span className="ml-2 text-xs text-accent font-normal">Auto-filled — edit if needed</span>}
        </p>

        {/* Lost / Found */}
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

        {/* Title */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
            Title *
            {filled && form.title && <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded-full font-normal">auto-filled</span>}
          </label>
          <input value={form.title} onChange={set('title')}
            placeholder="e.g. Black JBL Earphones"
            className={`input-base ${filled && form.title ? 'border-accent/30' : ''}`}
            required />
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
            Description
            {filled && form.description && <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded-full font-normal">auto-filled</span>}
          </label>
          <textarea value={form.description} onChange={set('description')} rows={3}
            placeholder="Describe the item — color, brand, size, condition..."
            className={`input-base resize-none ${filled && form.description ? 'border-accent/30' : ''}`} />
        </div>

        {/* Location */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
            Location {form.status === 'lost' ? 'Lost' : 'Found'} *
            {filled && form.locationLost && <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded-full font-normal">GPS detected</span>}
          </label>
          <input value={form.locationLost} onChange={set('locationLost')}
            placeholder="e.g. Central Library, 2nd Floor"
            className={`input-base ${filled && form.locationLost ? 'border-accent/30' : ''}`}
            required />
        </div>

        {/* Contact */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
            Contact Info *
            {filled && form.contactInfo && <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded-full font-normal">from account</span>}
          </label>
          <input value={form.contactInfo} onChange={set('contactInfo')}
            placeholder="Email or phone number"
            className={`input-base ${filled && form.contactInfo ? 'border-accent/30' : ''}`}
            required />
        </div>

        {/* External link */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">External Link (optional)</label>
          <input value={form.externalLink} onChange={set('externalLink')}
            placeholder="https://..." className="input-base" />
        </div>

        <FileUpload label="Additional Photos (optional)" multiple accept="image/*" onChange={handleExtraImages} />

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/lostfound')} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Submit Report'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLostFound;
