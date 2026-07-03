import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import * as procurementService from '../../services/procurementService';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');
const fmtCost = (v) => (v != null ? `$${Number(v).toLocaleString()}` : '—');
const PAGE_SIZE = 10;

const ProcurementListPage = () => {
  const { hasRole } = useAuth();
  const canManage = hasRole('Administrator', 'ResourceManager');

  const [data, setData] = useState({ procurements: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    procurementService.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => setPage(1), [debouncedSearch, category]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await procurementService.getProcurements({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        category
      });
      setData(result);
    } catch {
      setError('Failed to load procurement records');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (proc) => {
    if (!window.confirm(`Delete procurement ${proc.purchaseOrderRef || proc._id}?`)) return;
    await procurementService.deleteProcurement(proc._id);
    load();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="heading-page">Procurement Records</h1>
        {canManage && (
          <Link
            to="/procurement/new"
            className="rounded bg-ink-900 text-white px-4 py-2 text-sm font-medium hover:bg-primary-700"
          >
            + New Record
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Search by vendor, PO#, asset, notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] rounded border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border border-border px-3 py-2"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {error && <div className="mb-4 rounded bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      {loading ? (
        <p className="text-ink-400">Loading records…</p>
      ) : !data.procurements.length ? (
        <p className="text-ink-400 py-4">No procurement records found.</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-ink-400">
                  <th className="py-2.5 px-4 font-medium">PO Ref</th>
                  <th className="py-2.5 px-4 font-medium">Date</th>
                  <th className="py-2.5 px-4 font-medium">Vendor</th>
                  <th className="py-2.5 px-4 font-medium">Asset</th>
                  <th className="py-2.5 px-4 font-medium">Category</th>
                  <th className="py-2.5 px-4 font-medium text-right">Cost</th>
                  <th className="py-2.5 px-4 font-medium">Warranty</th>
                  {canManage && <th className="py-2.5 px-4 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data.procurements.map((p) => (
                  <tr key={p._id} className="border-b border-border hover:bg-surface-2">
                    <td className="py-2.5 px-4 font-mono text-xs text-ink-600">
                      {p.purchaseOrderRef || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-ink-600">{fmtDate(p.purchaseDate)}</td>
                    <td className="py-2.5 px-4 text-ink-900">{p.vendorName}</td>
                    <td className="py-2.5 px-4">
                      {p.asset ? (
                        <Link to={`/assets/${p.asset._id}`} className="text-amber-600 hover:underline">
                          {p.asset.assetCode}
                        </Link>
                      ) : (
                        <span className="text-ink-400 text-xs">— not linked —</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="rounded bg-cream-100 px-2 py-0.5 text-xs text-ink-600">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-ink-900">
                      {fmtCost(p.purchaseCost)}
                    </td>
                    <td className="py-2.5 px-4 text-ink-600 text-xs">{p.warrantyPeriod || '—'}</td>
                    {canManage && (
                      <td className="py-2.5 px-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/procurement/${p._id}/edit`}
                            className="text-amber-600 hover:underline text-xs"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(p)}
                            className="text-red-600 hover:underline text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-ink-600">
            <span>{data.total} record{data.total !== 1 ? 's' : ''}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border border-border px-3 py-1 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-2 py-1">Page {data.page} / {data.pages}</span>
              <button
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border border-border px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProcurementListPage;
