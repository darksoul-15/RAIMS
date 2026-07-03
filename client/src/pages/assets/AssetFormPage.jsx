import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as assetService from '../../services/assetService';
import * as locationService from '../../services/locationService';
import AssetForm from '../../components/assets/AssetForm';

const AssetFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [initial, setInitial] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const locs = await locationService.getLocations();
      setLocations(locs);
      if (isEdit) {
        const asset = await assetService.getAsset(id);
        setInitial(asset);
      }
    } catch {
      setLoadError('Failed to load form data. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [id, isEdit]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      if (isEdit) {
        await assetService.updateAsset(id, payload);
        navigate(`/assets/${id}`);
      } else {
        const created = await assetService.createAsset(payload);
        navigate(`/assets/${created._id}`);
      }
    } catch {
      setError('Failed to save asset. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Link to="/assets" className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-ink-700 transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to assets
      </Link>

      <div>
        <p className="heading-section mb-1">Registry</p>
        <h1 className="heading-page">{isEdit ? 'Edit Asset' : 'New Asset'}</h1>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-danger">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {loadError}
          <button onClick={load} className="ml-auto text-xs font-semibold underline">Retry</button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-danger">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <div className="card p-6 space-y-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-2.5 w-24 bg-cream-200 rounded" />
              <div className="h-9 w-full bg-cream-100 rounded-md" />
            </div>
          ))}
        </div>
      ) : !loadError ? (
        <AssetForm
          initial={initial}
          locations={locations}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel={isEdit ? 'Save Changes' : 'Create Asset'}
        />
      ) : null}
    </div>
  );
};

export default AssetFormPage;
