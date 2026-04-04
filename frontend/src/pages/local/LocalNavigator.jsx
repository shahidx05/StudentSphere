import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { LOCAL_SERVICE_TYPES } from '../../utils/constants';
import { MapPin, Phone, Star, Plus, Trash2, Edit3, Navigation } from 'lucide-react';

// ─── Helper: extract lat/lng from service ────────────────────────────────────
const getCoords = (svc) => {
  const [lng, lat] = svc?.location?.coordinates || [0, 0];
  return { lat, lng };
};

// ─── Pure Leaflet Map ─────────────────────────────────────────────────────────
const ServiceMap = ({ services, selected, onSelect, pickMode, onPick }) => {
  const mapRef     = useRef(null);
  const leafRef    = useRef(null);   // L instance
  const mapInst    = useRef(null);
  const markerRefs = useRef({});     // id → L.Marker
  const pickMarker = useRef(null);

  // Boot the map once
  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;
    import('leaflet').then((mod) => {
      const L = mod.default;
      leafRef.current = L;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        scrollWheelZoom: true,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapInst.current = map;
    });

    return () => {
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; }
    };
  }, []);

  // Update markers when services change
  useEffect(() => {
    if (!mapInst.current || !leafRef.current) return;
    const L = leafRef.current;

    // Remove old markers
    Object.values(markerRefs.current).forEach(m => m.remove());
    markerRefs.current = {};

    const mappable = services.filter(s => {
      const { lat, lng } = getCoords(s);
      return lat !== 0 || lng !== 0;
    });

    mappable.forEach(svc => {
      const { lat, lng } = getCoords(svc);
      const marker = L.marker([lat, lng])
        .addTo(mapInst.current)
        .bindPopup(`<strong>${svc.name}</strong><br/><small>${svc.type} · ${svc.address}</small>`);

      marker.on('click', () => onSelect && onSelect(svc));
      markerRefs.current[svc._id] = marker;
    });

    if (mappable.length > 0) {
      const bounds = L.latLngBounds(mappable.map(s => {
        const { lat, lng } = getCoords(s);
        return [lat, lng];
      }));
      mapInst.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [services]);

  // Pan to selected service
  useEffect(() => {
    if (!mapInst.current || !selected) return;
    const { lat, lng } = getCoords(selected);
    if (lat === 0 && lng === 0) return;
    mapInst.current.setView([lat, lng], 15, { animate: true });
    if (markerRefs.current[selected._id]) {
      markerRefs.current[selected._id].openPopup();
    }
  }, [selected]);

  // Pick-mode: click on map to drop a pin
  useEffect(() => {
    if (!mapInst.current || !leafRef.current) return;
    const L = leafRef.current;
    const map = mapInst.current;

    if (pickMode) {
      map.getContainer().style.cursor = 'crosshair';
      const handler = (e) => {
        const { lat, lng } = e.latlng;
        if (pickMarker.current) pickMarker.current.remove();
        pickMarker.current = L.marker([lat, lng]).addTo(map)
          .bindPopup('Selected location').openPopup();
        onPick && onPick(lat, lng);
      };
      map.on('click', handler);
      return () => { map.off('click', handler); map.getContainer().style.cursor = ''; };
    } else {
      if (pickMarker.current) { pickMarker.current.remove(); pickMarker.current = null; }
      map.getContainer().style.cursor = '';
    }
  }, [pickMode]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      {pickMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
          📍 Click on the map to set location
        </div>
      )}
    </div>
  );
};

// ─── Add / Edit Service Form ──────────────────────────────────────────────────
const FACILITIES_OPTS = ['Wi-Fi', 'Laundry', 'Mess', 'Gym', 'AC', 'Food', 'Parking', 'Security', 'Hot Water', 'Lift'];

const ServiceForm = ({ initial, onSave, onCancel, onPickRequest, pickedCoords }) => {
  const [form, setForm] = useState(initial || {
    name: '', type: 'hostel', description: '', address: '',
    cost: '', contactNumber: '', facilities: [],
    latitude: '', longitude: '',
  });

  useEffect(() => {
    if (pickedCoords) {
      setForm(f => ({ ...f, latitude: pickedCoords.lat.toFixed(6), longitude: pickedCoords.lng.toFixed(6) }));
    }
  }, [pickedCoords]);

  const toggle = (f) => setForm(prev => ({
    ...prev,
    facilities: prev.facilities.includes(f)
      ? prev.facilities.filter(x => x !== f)
      : [...prev.facilities, f],
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs text-slate-400 mb-1 block">Name *</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            required className="input-field" placeholder="Sunrise Boys Hostel" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Type *</label>
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
            className="input-field">
            {['hostel', 'mess', 'pg', 'hardware', 'stationery', 'other'].map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Cost (₹/month)</label>
          <input value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })}
            className="input-field" placeholder="5000" />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-slate-400 mb-1 block">Address *</label>
          <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
            required className="input-field" placeholder="Karol Bagh, New Delhi" />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-slate-400 mb-1 block">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="input-field resize-none" rows={2} placeholder="Brief description..." />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Contact Number</label>
          <input value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })}
            className="input-field" placeholder="+91 98765 43210" />
        </div>
      </div>

      {/* Facilities */}
      <div>
        <label className="text-xs text-slate-400 mb-2 block">Facilities</label>
        <div className="flex flex-wrap gap-2">
          {FACILITIES_OPTS.map(f => (
            <button key={f} type="button" onClick={() => toggle(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                form.facilities.includes(f)
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-indigo-500/30'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Coordinates */}
      <div>
        <label className="text-xs text-slate-400 mb-2 block">Location Coordinates</label>
        <div className="grid grid-cols-2 gap-2">
          <input value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })}
            className="input-field" placeholder="Latitude (e.g. 28.6139)" />
          <input value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })}
            className="input-field" placeholder="Longitude (e.g. 77.2090)" />
        </div>
        <button type="button" onClick={onPickRequest}
          className="mt-2 flex items-center gap-2 text-indigo-400 text-xs hover:text-indigo-300 transition-colors">
          <Navigation size={13} /> Click on map to pick location
        </button>
      </div>

      <div className="flex gap-3 pt-2 sticky bottom-0 bg-transparent">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1">
          {initial ? 'Save Changes' : 'Add Location'}
        </button>
      </div>
    </form>
  );
};

// ─── TYPE ICON ────────────────────────────────────────────────────────────────
const TYPE_ICONS = {
  hostel: '🏠', mess: '🍽️', pg: '🏢', hardware: '🔧', stationery: '📚', other: '📍',
};
const TYPE_COLORS = {
  hostel: 'text-indigo-400 bg-indigo-500/10',
  mess:   'text-amber-400 bg-amber-500/10',
  pg:     'text-purple-400 bg-purple-500/10',
  hardware: 'text-orange-400 bg-orange-500/10',
  stationery: 'text-blue-400 bg-blue-500/10',
  other:  'text-slate-400 bg-slate-500/10',
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const LocalNavigator = () => {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const isAdmin    = user?.role === 'admin';

  const [tab, setTab]           = useState('');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [pickMode, setPickMode] = useState(false);
  const [pickedCoords, setPickedCoords] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const params = new URLSearchParams({
    ...(tab && { type: tab }), ...(search && { search }), page, limit: 12,
  }).toString();

  const { data, loading, refetch } = useFetch(`/api/local?${params}`);
  const services   = data?.data || [];
  const pagination = data?.pagination || {};

  const handlePick = useCallback((lat, lng) => {
    setPickedCoords({ lat, lng });
  }, []);

  const openAdd = () => {
    setEditItem(null);
    setPickedCoords(null);
    setShowForm(true);
    setPickMode(false);
  };

  const openEdit = (svc, e) => {
    e.stopPropagation();
    const { lat, lng } = getCoords(svc);
    setEditItem({
      _id: svc._id,
      name: svc.name, type: svc.type, description: svc.description || '',
      address: svc.address, cost: svc.cost || '', contactNumber: svc.contactNumber || '',
      facilities: svc.facilities || [],
      latitude: lat !== 0 ? String(lat) : '',
      longitude: lng !== 0 ? String(lng) : '',
    });
    setPickedCoords(null);
    setShowForm(true);
    setPickMode(false);
  };

  const handleSave = async (form) => {
    setSubmitting(true);
    const payload = {
      name: form.name, type: form.type, description: form.description,
      address: form.address, cost: form.cost, contactNumber: form.contactNumber,
      facilities: form.facilities,
      latitude: parseFloat(form.latitude) || 0,
      longitude: parseFloat(form.longitude) || 0,
    };
    try {
      if (editItem?._id) {
        await api.put(`/api/local/${editItem._id}`, payload);
        toast.success('Location updated!');
      } else {
        await api.post('/api/local', payload);
        toast.success('Location added!');
      }
      setShowForm(false); setEditItem(null); setPickMode(false);
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/local/${deleteId}`);
      toast.success('Location deleted.');
      setDeleteId(null);
      if (selected?._id === deleteId) setSelected(null);
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-4 slide-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-header">Local Navigator</h1>
          <p className="text-sm text-slate-400 mt-1">Hostels, mess, PG &amp; shops near campus</p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="btn-primary">
            <Plus size={16} /> Add Location
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/5 overflow-x-auto flex-shrink-0">
          {[{ value: '', label: 'All' }, ...LOCAL_SERVICE_TYPES].map(({ value, label }) => (
            <button key={value} onClick={() => { setTab(value); setPage(1); }}
              className={`tab-btn capitalize whitespace-nowrap ${tab === value ? 'active' : ''}`}>{label}</button>
          ))}
        </div>
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search services..." />
      </div>

      {/* Main split layout */}
      <div className="flex gap-4 items-start">
        {/* Left: Service cards — scrollable list, ~65% width */}
        <div className="flex flex-col gap-0 overflow-y-auto flex-1 rounded-xl border border-indigo-500/10" style={{ maxHeight: '520px' }}>
          {loading ? <PageSpinner /> : services.length === 0 ? (
            <EmptyState icon="search" title="No services found" description="Try different filters." />
          ) : (
            <>
              {services.map(svc => {
                const { lat, lng } = getCoords(svc);
                const hasCoords = lat !== 0 || lng !== 0;
                const isSelected = selected?._id === svc._id;
                return (
                  <div key={svc._id}
                    onClick={() => setSelected(isSelected ? null : svc)}
                    className={`p-4 border-b cursor-pointer transition-all group ${
                      isSelected
                        ? 'bg-indigo-500/10 border-indigo-500/30'
                        : 'border-indigo-500/5 hover:bg-white/[0.03]'
                    }`}>
                    <div className="flex items-start gap-3">
                      {/* Type icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${TYPE_COLORS[svc.type] || TYPE_COLORS.other}`}>
                        {TYPE_ICONS[svc.type] || '📍'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-white text-sm">{svc.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant={svc.type || 'other'}>{svc.type}</Badge>
                              {hasCoords && (
                                <span className="text-slate-500 text-[10px] flex items-center gap-1">
                                  <MapPin size={9} /> Has location
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-amber-400 text-xs font-medium">{(svc.rating || 0).toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                          {svc.cost && (
                            <div>
                              <p className="text-[9px] text-slate-600 uppercase tracking-wider">Cost</p>
                              <p className="text-emerald-400 font-semibold text-xs">₹{svc.cost}/month</p>
                            </div>
                          )}
                          {svc.contactNumber && (
                            <div>
                              <p className="text-[9px] text-slate-600 uppercase tracking-wider">Contact</p>
                              <p className="text-slate-300 text-xs flex items-center gap-1">
                                <Phone size={9} /> {svc.contactNumber}
                              </p>
                            </div>
                          )}
                          {svc.address && (
                            <div className="col-span-2">
                              <p className="text-[9px] text-slate-600 uppercase tracking-wider">Address</p>
                              <p className="text-slate-400 text-xs line-clamp-1">{svc.address}</p>
                            </div>
                          )}
                        </div>

                        {/* Facilities */}
                        {svc.facilities?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {svc.facilities.slice(0, 5).map(f => (
                              <span key={f} className="badge badge-slate text-[9px] px-1.5 py-0.5">{f}</span>
                            ))}
                            {svc.facilities.length > 5 && (
                              <span className="text-slate-600 text-[9px]">+{svc.facilities.length - 5} more</span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/local/${svc._id}`); }}
                            className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors">
                            View Details →
                          </button>
                          {isAdmin && (
                            <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => openEdit(svc, e)}
                                className="p-1 rounded text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                                <Edit3 size={12} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setDeleteId(svc._id); }}
                                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="p-3">
                <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>

        {/* Right: Sticky map — ~35% width, 400px tall */}
        <div className="hidden lg:flex flex-col flex-shrink-0 glass-card overflow-hidden p-0" style={{ transform: 'none', width: '35%', height: '400px', position: 'sticky', top: '1rem' }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-indigo-500/10">
            <MapPin size={15} className="text-indigo-400" />
            <span className="text-white text-sm font-semibold">Location Map</span>
            {selected && (
              <span className="text-slate-400 text-xs ml-2">— {selected.name}</span>
            )}
            {pickMode && (
              <span className="ml-auto text-amber-400 text-xs animate-pulse">📍 Click map to place pin</span>
            )}
          </div>
          <div className="flex-1">
            <ServiceMap
              services={services}
              selected={selected}
              onSelect={setSelected}
              pickMode={pickMode}
              onPick={handlePick}
            />
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setPickMode(false); setEditItem(null); }}
        title={editItem ? `Edit: ${editItem.name}` : 'Add New Location'}
        size="lg"
      >
        {/* Map picker strip */}
        <div className="mb-4 rounded-xl overflow-hidden border border-indigo-500/20" style={{ height: 160 }}>
          <ServiceMap
            services={editItem ? [{ ...editItem, location: { coordinates: [parseFloat(editItem.longitude) || 0, parseFloat(editItem.latitude) || 0] } }] : []}
            selected={null}
            pickMode={pickMode}
            onPick={handlePick}
          />
        </div>
        <ServiceForm
          initial={editItem}
          pickedCoords={pickedCoords}
          onPickRequest={() => setPickMode(p => !p)}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setPickMode(false); setEditItem(null); }}
        />
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Location" size="sm">
        <p className="text-slate-400 text-sm mb-4">This cannot be undone. All reviews will also be removed.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default LocalNavigator;
