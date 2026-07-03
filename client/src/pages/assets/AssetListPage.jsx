import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as assetService from '../../services/assetService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';
import AssetTable from '../../components/assets/AssetTable';

const STATUSES = ['Available', 'Borrowed', 'Reserved', 'UnderMaintenance', 'Lost', 'Retired'];
const PAGE_SIZE = 12;

const AssetListPage = () => {
  const { hasRole } = useAuth();
  const toast = useToast();
  const canManage = hasRole('Administrator', 'ProjectLead');
  const canDelete  = hasRole('Administrator');

  const [data, setData]           = useState({ assets: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [categories, setCategories] = useState([]);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('');
  const [status, setStatus]       = useState('');
  const [page, setPage]           = useState(1);
  const debouncedSearch           = useDebounce(search);

  useEffect(() => { assetService.getCategories().then(setCategories).catch(() => {}); }, []);
  useEffect(() => setPage(1), [debouncedSearch, category, status]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await assetService.getAssets({ page, limit: PAGE_SIZE, search: debouncedSearch, category, status });
      setData(result);
    } catch { setError('Failed to load assets. Please refresh.'); }
    finally { setLoading(false); }
  }, [page, debouncedSearch, category, status]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (asset) => {
    if (!window.confirm(`Permanently delete "${asset.name}"?`)) return;
    try {
      await assetService.deleteAsset(asset._id);
      toast.success(`"${asset.name}" deleted.`);
      load();
    } catch {
      toast.error('Failed to delete asset. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* ── Page header ────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="heading-section mb-1">Registry</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Asset Registry</h1>
        </div>
        {canManage && (
          <Link to="/assets/new" className="btn-primary gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Asset
          </Link>
        )}
      </div>

      {/* ── Filters ────────────────────────────────────── */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, keyword…"
              className="input pl-9"
            />
          </div>

          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input w-auto min-w-[150px]">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto min-w-[150px]">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {(search || category || status) && (
            <button
              onClick={() => { setSearch(''); setCategory(''); setStatus(''); }}
              className="btn-outline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Content ────────────────────────────────────── */}
      {loading ? (
        <div className="card">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-4 px-4 py-3 border-b border-border last:border-0 animate-pulse">
              <div className="w-32 h-3 bg-cream-200 rounded" />
              <div className="flex-1 h-3 bg-cream-100 rounded" />
              <div className="w-20 h-3 bg-cream-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <AssetTable
            assets={data.assets}
            canManage={canManage}
            canDelete={canDelete}
            onDelete={handleDelete}
          />

          {/* ── Pagination ─────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-2">
            <p className="text-xs text-ink-400">
              {data.total} asset{data.total !== 1 ? 's' : ''}
              {(search || category || status) && ' · filtered'}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-outline px-3 py-1 text-xs disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-xs text-ink-600 font-medium px-2">
                {data.page} / {data.pages}
              </span>
              <button
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-outline px-3 py-1 text-xs disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetListPage;
