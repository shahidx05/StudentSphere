import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import FileUpload from '../../components/ui/FileUpload';
import { ArrowLeft, Sparkles, Camera, X, CheckCircle, FileText } from 'lucide-react';

const AddLostFound = () => {
  const navigate = useNavigate();

  // ── Existing state (unchanged) ──────────────────────────────────────────────
  const [form, setForm] = useState({
    status: 'lost', title: '', description: '',
    locationLost: '', contactInfo: '', externalLink: '',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  // ── Existing submit (unchanged) ─────────────────────────────────────────────
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

  // ── AI state ────────────────────────────────────────────────────────────────
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiImage, setAiImage]       = useState(null);
  const [aiPreview, setAiPreview]   = useState(null);
  const [aiDone, setAiDone]         = useState(false);

  // ── Helper: file → base64 ───────────────────────────────────────────────────
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // ── AI image picker ─────────────────────────────────────────────────────────
  const handleAiImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAiImage(file);
    setAiPreview(URL.createObjectURL(file));
    setAiDone(false);
    // Also inject into images so it gets submitted with the form
    setImages(prev => {
      const exists = prev.find(f => f.name === file.name);
      return exists ? prev : [file, ...prev];
    });
  };

  // ── AI analysis ─────────────────────────────────────────────────────────────
  const analyzeWithAI = async () => {
    if (!aiImage) { toast.error('Please upload an image first'); return; }
    setAiLoading(true);
    try {
      const base64 = await fileToBase64(aiImage);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'StudentSphere',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${base64}` },
              },
              {
                type: 'text',
                text: `You are helping a college student report a lost or found item on campus.
Analyze this image carefully and identify the item.

Return ONLY a valid JSON object with NO markdown, NO backticks, NO explanation:
{
  "title": "short item name, max 5 words",
  "description": "describe color, brand if visible, size, condition, any identifying features. 2-3 sentences.",
  "category": "one of: electronics, stationery, clothing, accessories, bag, bottle, id-card, keys, books, sports, other"
}`,
              },
            ],
          }],
          max_tokens: 300,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'AI analysis failed');

      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from AI');

      const cleaned = content.replace(/```json|```/g, '').trim();
      const parsed  = JSON.parse(cleaned);

      setForm(f => ({
        ...f,
        title:       parsed.title       || f.title,
        description: parsed.description || f.description,
      }));

      setAiDone(true);
      toast.success('AI analyzed the image! Review and edit if needed.');
    } catch (err) {
      console.error('AI error:', err);
      toast.error('Analysis failed. Try again or fill manually.');
    } finally {
      setAiLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/lostfound')}
          className="p-2 rounded-lg text-muted hover:text-text-primary hover:bg-surface-2 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-header">Report Item</h1>
          <p className="text-text-muted text-sm">Upload a photo — AI will fill the details for you</p>
        </div>
      </div>

      {/* ── AI ANALYZER SECTION ──────────────────────────────────────────── */}
      <div className="card-base space-y-4 border border-primary/20">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles size={15} className="text-primary" />
          </div>
          <div>
            <p className="text-text-primary text-sm font-semibold">AI Image Analyzer</p>
            <p className="text-text-muted text-xs">Upload photo → AI fills Title &amp; Description automatically</p>
          </div>
          <span className="ml-auto text-[10px] text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            Gemini Vision
          </span>
        </div>

        {/* Upload zone or preview */}
        {!aiPreview ? (
          <label className="block border-2 border-dashed border-border hover:border-primary/40 rounded-xl p-8 text-center cursor-pointer transition-all duration-200 hover:bg-primary/5">
            <input type="file" accept="image/*" className="hidden" onChange={handleAiImageChange} />
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Camera size={22} className="text-primary" />
            </div>
            <p className="text-text-secondary text-sm font-medium">Click to upload item photo</p>
            <p className="text-text-muted text-xs mt-1">Works with any item — bottle, bag, earphones, wallet...</p>
          </label>
        ) : (
          <div className="space-y-3">
            {/* Preview */}
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border bg-surface-2">
              <img src={aiPreview} alt="Item" className="w-full h-full object-contain" />
              {/* Remove */}
              <button type="button"
                onClick={() => { setAiPreview(null); setAiImage(null); setAiDone(false); }}
                className="absolute top-2 right-2 w-7 h-7 bg-surface/80 backdrop-blur rounded-full flex items-center justify-center text-text-muted hover:text-danger transition-colors">
                <X size={14} />
              </button>
              {/* Success overlay */}
              {aiDone && (
                <div className="absolute inset-0 bg-accent/10 border-2 border-accent/40 rounded-xl flex items-center justify-center">
                  <div className="bg-surface/90 rounded-xl px-4 py-2 flex items-center gap-2">
                    <CheckCircle size={16} className="text-accent" />
                    <span className="text-accent text-sm font-medium">Form auto-filled!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Analyze button */}
            {!aiDone ? (
              <button type="button" onClick={analyzeWithAI} disabled={aiLoading} className="btn-primary w-full">
                {aiLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing image...
                  </>
                ) : (
                  <><Sparkles size={16} /> Analyze with AI</>
                )}
              </button>
            ) : (
              <button type="button" onClick={analyzeWithAI} disabled={aiLoading} className="btn-secondary w-full text-xs">
                <Sparkles size={13} /> Re-analyze
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── MANUAL FORM SECTION ──────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="card-base space-y-4">
        <p className="text-text-secondary text-sm font-semibold flex items-center gap-2">
          <FileText size={15} className="text-text-muted" />
          Item Details
          {aiDone && <span className="text-xs text-accent font-normal">(auto-filled — edit if needed)</span>}
        </p>

        {/* Lost / Found toggle */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Status *</label>
          <div className="flex gap-2">
            {['lost', 'found'].map(s => (
              <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border capitalize transition-all ${
                  form.status === s
                    ? s === 'lost'
                      ? 'bg-danger/10 border-danger/30 text-danger'
                      : 'bg-accent/10 border-accent/30 text-accent'
                    : 'border-border text-muted hover:text-text-primary'
                }`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Title *
            {aiDone && form.title && (
              <span className="ml-2 text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">AI filled</span>
            )}
          </label>
          <input value={form.title} onChange={set('title')}
            placeholder="e.g. Black JBL Earphones"
            className={`input-base ${aiDone && form.title ? 'border-accent/30 focus:border-accent' : ''}`}
            required />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Description
            {aiDone && form.description && (
              <span className="ml-2 text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">AI filled</span>
            )}
          </label>
          <textarea value={form.description} onChange={set('description')} rows={3}
            placeholder="Describe the item..."
            className={`input-base resize-none ${aiDone && form.description ? 'border-accent/30 focus:border-accent' : ''}`} />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Location {form.status === 'lost' ? 'Lost' : 'Found'} *
          </label>
          <input value={form.locationLost} onChange={set('locationLost')}
            placeholder="e.g. Central Library, 2nd Floor" className="input-base" required />
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Contact Info *</label>
          <input value={form.contactInfo} onChange={set('contactInfo')}
            placeholder="Email or phone number" className="input-base" required />
        </div>

        {/* External link */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">External Link (optional)</label>
          <input value={form.externalLink} onChange={set('externalLink')}
            placeholder="https://..." className="input-base" />
        </div>

        {/* Additional photos */}
        <FileUpload label="Additional Photos (optional)" multiple accept="image/*" onChange={setImages} />

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
