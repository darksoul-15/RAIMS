import { useState, useEffect } from 'react';
import * as assetService from '../../services/assetService';

const RequestForm = ({ onSubmit, loading = false }) => {
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [form, setForm] = useState({
    assetId: '',
    quantityRequested: 1,
    purpose: '',
    expectedReturnDate: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    assetService.getAssets({ limit: 100, status: 'Available' })
      .then((res) => setAssets(res.assets || []))
      .catch(() => setAssets([]))
      .finally(() => setAssetsLoading(false));
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.assetId)                        errs.assetId = 'Please select an asset';
    if (!form.quantityRequested || form.quantityRequested < 1)
                                               errs.quantityRequested = 'Must be at least 1';
    if (!form.purpose.trim())                  errs.purpose = 'Purpose is required';
    if (!form.expectedReturnDate)              errs.expectedReturnDate = 'Return date is required';
    else if (new Date(form.expectedReturnDate) <= new Date())
                                               errs.expectedReturnDate = 'Return date must be in the future';

    const selected = assets.find((a) => a._id === form.assetId);
    if (selected && Number(form.quantityRequested) > selected.quantityAvailable)
      errs.quantityRequested = `Only ${selected.quantityAvailable} unit${selected.quantityAvailable !== 1 ? 's' : ''} available`;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const selected = assets.find((a) => a._id === form.assetId);
    onSubmit({
      asset: selected._id,
      quantityRequested: Number(form.quantityRequested),
      purpose: form.purpose.trim(),
      expectedReturnDate: form.expectedReturnDate
    });
  };

  const selectedAsset = assets.find((a) => a._id === form.assetId);
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Asset picker */}
      <div>
        <label className="label">Asset <span className="text-danger">*</span></label>
        {assetsLoading ? (
          <div className="input flex items-center gap-2 text-ink-400">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Loading assets…
          </div>
        ) : (
          <select value={form.assetId} onChange={set('assetId')} className="input">
            <option value="">— Select an asset —</option>
            {assets.map((a) => (
              <option key={a._id} value={a._id}>
                {a.assetCode} — {a.name} ({a.quantityAvailable} available)
              </option>
            ))}
          </select>
        )}
        {errors.assetId && <p className="mt-1 text-xs text-danger">{errors.assetId}</p>}
      </div>

      {/* Selected asset info card */}
      {selectedAsset && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
          <svg className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
          <div className="text-xs">
            <p className="font-semibold text-amber-900">{selectedAsset.name}</p>
            <p className="text-amber-700 mt-0.5">
              {selectedAsset.category} · {selectedAsset.quantityAvailable} of {selectedAsset.quantityTotal} available
              {selectedAsset.storageLocation?.name && ` · ${selectedAsset.storageLocation.name}`}
            </p>
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="label">Quantity <span className="text-danger">*</span></label>
        <input
          type="number"
          min="1"
          max={selectedAsset?.quantityAvailable || 999}
          value={form.quantityRequested}
          onChange={set('quantityRequested')}
          className="input w-32"
        />
        {errors.quantityRequested && <p className="mt-1 text-xs text-danger">{errors.quantityRequested}</p>}
      </div>

      {/* Purpose */}
      <div>
        <label className="label">Purpose <span className="text-danger">*</span></label>
        <textarea
          rows={3}
          value={form.purpose}
          onChange={set('purpose')}
          placeholder="Describe why you need this asset and how it will be used…"
          className="input resize-none"
        />
        {errors.purpose && <p className="mt-1 text-xs text-danger">{errors.purpose}</p>}
      </div>

      {/* Return date */}
      <div>
        <label className="label">Expected return date <span className="text-danger">*</span></label>
        <input
          type="date"
          min={today}
          value={form.expectedReturnDate}
          onChange={set('expectedReturnDate')}
          className="input w-auto"
        />
        {errors.expectedReturnDate && <p className="mt-1 text-xs text-danger">{errors.expectedReturnDate}</p>}
      </div>

      {/* Submit */}
      <div className="pt-2 flex gap-3">
        <button type="submit" disabled={loading || assetsLoading} className="btn-primary px-6 py-2.5">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Submitting…
            </span>
          ) : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};

export default RequestForm;
