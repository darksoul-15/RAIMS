import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import * as procurementService from '../../services/procurementService';
import * as assetService from '../../services/assetService';

const EMPTY = {
  purchaseDate: '',
  purchaseCost: '',
  vendorName: '',
  vendorContact: '',
  warrantyPeriod: '',
  purchaseOrderRef: '',
  category: '',
  notes: '',
  assetId: ''
};

const CATEGORIES = ['Electronics', 'Computing', 'Robotics', 'Media', 'Design', 'Services', 'Other'];

const ProcurementFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [assets, setAssets] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    assetService.getAssets({ limit: 200 }).then((r) => setAssets(r.assets));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    procurementService.getProcurement(id).then((p) => {
      if (!p) { setLoadError('Record not found'); return; }
      setForm({
        purchaseDate: p.purchaseDate?.slice(0, 10) || '',
        purchaseCost: p.purchaseCost ?? '',
        vendorName: p.vendorName || '',
        vendorContact: p.vendorContact || '',
        warrantyPeriod: p.warrantyPeriod || '',
        purchaseOrderRef: p.purchaseOrderRef || '',
        category: p.category || '',
        notes: p.notes || '',
        assetId: p.asset?._id || ''
      });
    });
  }, [id, isEdit]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.purchaseDate) errs.purchaseDate = 'Required';
    if (!form.purchaseCost || Number(form.purchaseCost) <= 0) errs.purchaseCost = 'Must be > 0';
    if (!form.vendorName.trim()) errs.vendorName = 'Required';
    if (!form.category) errs.category = 'Select a category';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const selectedAsset = assets.find((a) => a._id === form.assetId);
    const payload = {
      purchaseDate: form.purchaseDate,
      purchaseCost: Number(form.purchaseCost),
      vendorName: form.vendorName.trim(),
      vendorContact: form.vendorContact.trim(),
      warrantyPeriod: form.warrantyPeriod.trim(),
      purchaseOrderRef: form.purchaseOrderRef.trim(),
      category: form.category,
      notes: form.notes.trim(),
      asset: selectedAsset
        ? { _id: selectedAsset._id, name: selectedAsset.name, assetCode: selectedAsset.assetCode }
        : null,
      createdBy: { _id: user._id, name: user.name }
    };

    try {
      if (isEdit) await procurementService.updateProcurement(id, payload);
      else await procurementService.createProcurement(payload);
      navigate('/procurement');
    } catch {
      setErrors({ _form: 'Failed to save' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) return <div className="p-6 max-w-6xl mx-auto space-y-6 text-ink-400">{loadError}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Link to="/procurement" className="text-sm text-amber-600 hover:underline">
        ← Back to procurement
      </Link>
      <h1 className="heading-page mt-3 mb-5">
        {isEdit ? 'Edit Procurement Record' : 'New Procurement Record'}
      </h1>

      {errors._form && (
        <div className="mb-4 rounded bg-red-50 text-red-700 text-sm px-3 py-2">{errors._form}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Purchase date</label>
            <input type="date" value={form.purchaseDate} onChange={set('purchaseDate')}
              className="w-full rounded border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            {errors.purchaseDate && <p className="mt-1 text-xs text-red-600">{errors.purchaseDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Cost ($)</label>
            <input type="number" step="0.01" min="0" value={form.purchaseCost} onChange={set('purchaseCost')}
              className="w-full rounded border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            {errors.purchaseCost && <p className="mt-1 text-xs text-red-600">{errors.purchaseCost}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Vendor name</label>
          <input value={form.vendorName} onChange={set('vendorName')}
            className="w-full rounded border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          {errors.vendorName && <p className="mt-1 text-xs text-red-600">{errors.vendorName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Vendor contact</label>
          <input value={form.vendorContact} onChange={set('vendorContact')} placeholder="email or phone"
            className="w-full rounded border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Category</label>
            <select value={form.category} onChange={set('category')}
              className="w-full rounded border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="">— Select —</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">PO reference</label>
            <input value={form.purchaseOrderRef} onChange={set('purchaseOrderRef')} placeholder="PO-2026-…"
              className="w-full rounded border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Warranty period</label>
          <input value={form.warrantyPeriod} onChange={set('warrantyPeriod')} placeholder="e.g. 1 year"
            className="w-full rounded border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Link to asset (optional)</label>
          <select value={form.assetId} onChange={set('assetId')}
            className="w-full rounded border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="">— None (standalone purchase) —</option>
            {assets.map((a) => (
              <option key={a._id} value={a._id}>{a.assetCode} — {a.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Invoice file</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" disabled
            className="w-full text-sm text-ink-400 file:mr-3 file:rounded file:border-0 file:bg-cream-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink-700 disabled:opacity-50" />
          <p className="mt-1 text-xs text-ink-400">Upload available after backend integration (Phase 3)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Notes</label>
          <textarea rows={3} value={form.notes} onChange={set('notes')}
            className="w-full rounded border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting}
            className="rounded bg-ink-900 text-white px-5 py-2 text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
            {submitting ? 'Saving…' : isEdit ? 'Update Record' : 'Create Record'}
          </button>
          <Link to="/procurement"
            className="rounded border border-border px-5 py-2 text-sm font-medium hover:bg-cream-100">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ProcurementFormPage;
