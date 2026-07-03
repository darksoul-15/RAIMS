import { useState } from 'react';

const CATEGORIES = ['Electronics', 'Robotics', 'Computing', 'Media', 'Design', 'Other'];
const STATUSES = ['Available', 'Borrowed', 'Reserved', 'UnderMaintenance', 'Lost', 'Retired'];

const field = 'w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500';
const label = 'block text-sm font-medium text-gray-700 mb-1';

const emptyAsset = {
  name: '',
  category: 'Electronics',
  description: '',
  quantityTotal: 1,
  quantityAvailable: 1,
  purchaseDate: '',
  purchaseCost: '',
  status: 'Available',
  storageLocation: '',
  vendor: { name: '', contact: '', details: '' },
  warranty: { period: '', expiryDate: '', details: '' }
};

// `initial` may carry a populated storageLocation object; normalize to an id string for the select
const normalize = (initial) => {
  if (!initial) return emptyAsset;
  return {
    ...emptyAsset,
    ...initial,
    storageLocation: initial.storageLocation?._id || initial.storageLocation || '',
    purchaseDate: initial.purchaseDate ? initial.purchaseDate.slice(0, 10) : '',
    vendor: { ...emptyAsset.vendor, ...(initial.vendor || {}) },
    warranty: {
      ...emptyAsset.warranty,
      ...(initial.warranty || {}),
      expiryDate: initial.warranty?.expiryDate ? initial.warranty.expiryDate.slice(0, 10) : ''
    }
  };
};

const AssetForm = ({ initial, locations = [], onSubmit, submitting, submitLabel = 'Save' }) => {
  const [form, setForm] = useState(() => normalize(initial));
  const [error, setError] = useState('');

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setNested = (group, key, value) =>
    setForm((f) => ({ ...f, [group]: { ...f[group], [key]: value } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (Number(form.quantityAvailable) > Number(form.quantityTotal)) {
      setError('Available quantity cannot exceed total quantity');
      return;
    }
    onSubmit({
      ...form,
      quantityTotal: Number(form.quantityTotal),
      quantityAvailable: Number(form.quantityAvailable),
      purchaseCost: form.purchaseCost === '' ? undefined : Number(form.purchaseCost),
      // keep a denormalized location object so the mock UI can display the name
      storageLocation: locations.find((l) => l._id === form.storageLocation) || null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && <div className="rounded bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={label}>Name *</label>
          <input className={field} value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div>
          <label className={label}>Category *</label>
          <select className={field} value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Status</label>
          <select className={field} value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Description</label>
          <textarea className={field} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div>
          <label className={label}>Total quantity</label>
          <input type="number" min="0" className={field} value={form.quantityTotal} onChange={(e) => set('quantityTotal', e.target.value)} />
        </div>
        <div>
          <label className={label}>Available quantity</label>
          <input type="number" min="0" className={field} value={form.quantityAvailable} onChange={(e) => set('quantityAvailable', e.target.value)} />
        </div>
        <div>
          <label className={label}>Storage location</label>
          <select className={field} value={form.storageLocation} onChange={(e) => set('storageLocation', e.target.value)}>
            <option value="">— Select —</option>
            {locations.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Purchase date</label>
          <input type="date" className={field} value={form.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} />
        </div>
        <div>
          <label className={label}>Purchase cost</label>
          <input type="number" min="0" step="0.01" className={field} value={form.purchaseCost} onChange={(e) => set('purchaseCost', e.target.value)} />
        </div>
      </div>

      <fieldset className="border border-gray-200 rounded p-4">
        <legend className="text-sm font-medium text-gray-600 px-1">Vendor</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input className={field} placeholder="Name" value={form.vendor.name} onChange={(e) => setNested('vendor', 'name', e.target.value)} />
          <input className={field} placeholder="Contact" value={form.vendor.contact} onChange={(e) => setNested('vendor', 'contact', e.target.value)} />
          <input className={field} placeholder="Details" value={form.vendor.details} onChange={(e) => setNested('vendor', 'details', e.target.value)} />
        </div>
      </fieldset>

      <fieldset className="border border-gray-200 rounded p-4">
        <legend className="text-sm font-medium text-gray-600 px-1">Warranty</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input className={field} placeholder="Period (e.g. 1 year)" value={form.warranty.period} onChange={(e) => setNested('warranty', 'period', e.target.value)} />
          <input type="date" className={field} value={form.warranty.expiryDate} onChange={(e) => setNested('warranty', 'expiryDate', e.target.value)} />
          <input className={field} placeholder="Details" value={form.warranty.details} onChange={(e) => setNested('warranty', 'details', e.target.value)} />
        </div>
      </fieldset>

      <div>
        <label className={label}>Images</label>
        <input type="file" multiple accept="image/*" className="text-sm text-gray-500" disabled />
        <p className="text-xs text-gray-400 mt-1">Image upload is wired on the backend; disabled in the mock UI for now.</p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-primary-600 text-white px-5 py-2 font-medium hover:bg-primary-700 disabled:opacity-60"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
};

export default AssetForm;
