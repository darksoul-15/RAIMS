import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as assetService from '../../services/assetService';
import { useDebounce } from '../../hooks/useDebounce';
import AssetCard from '../../components/assets/AssetCard';

const STATUSES = ['Available', 'Borrowed', 'Reserved', 'UnderMaintenance', 'Lost', 'Retired'];

const SearchPage = () => {
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    assetService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const runSearch = useCallback(async () => {
    setLoading(true);
    const { assets } = await assetService.getAssets({
      limit: 100,
      search: debouncedSearch,
      category,
      status,
      availability: availableOnly ? 'available' : ''
    });
    setResults(assets);
    setLoading(false);
  }, [debouncedSearch, category, status, availableOnly]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="heading-page mb-1">Search & Discovery</h1>
      <p className="text-sm text-ink-400 mb-4">
        Find existing assets before requesting new purchases.
      </p>

      <div className="bg-white rounded-lg border border-border p-4 mb-5">
        <input
          autoFocus
          placeholder="Type to search assets by name, code, or keyword…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded border border-border px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <div className="flex flex-wrap items-center gap-3">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded border border-border px-3 py-2 text-sm">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border border-border px-3 py-2 text-sm">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-ink-600">
            <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
            Available only
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-ink-400">Searching…</p>
      ) : results.length === 0 ? (
        <p className="text-ink-400">No assets match your search.</p>
      ) : (
        <>
          <p className="text-sm text-ink-400 mb-3">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((a) => <AssetCard key={a._id} asset={a} />)}
          </div>
        </>
      )}

      <p className="mt-6 text-xs text-ink-400">
        Tip: reuse recommendations (similar resources, who holds an asset) arrive with Module 7.
      </p>
    </div>
  );
};

export default SearchPage;
