import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import * as checkoutService from '../../services/checkoutService';
import CheckoutTable from '../../components/checkout/CheckoutTable';
import ReturnModal from '../../components/checkout/ReturnModal';

const PAGE_SIZE = 10;

const TableSkeleton = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="px-4 py-3 bg-surface-2 border-b border-border flex gap-6">
      {[80, 140, 100, 80, 80, 60].map((w, i) => (
        <div key={i} className={`h-2.5 bg-cream-200 rounded`} style={{ width: w }} />
      ))}
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="px-4 py-3 border-b border-border last:border-0 flex gap-6 items-center">
        {[80, 140, 100, 80, 80, 60].map((w, j) => (
          <div key={j} className="h-3 bg-cream-100 rounded" style={{ width: w }} />
        ))}
      </div>
    ))}
  </div>
);

const ActiveBorrowingsPage = () => {
  const { hasRole } = useAuth();
  const toast = useToast();
  const canManage = hasRole('Administrator');

  const [data, setData] = useState({ checkouts: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [returning, setReturning] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await checkoutService.getActiveCheckouts({ page, limit: PAGE_SIZE });
      setData(result);
    } catch {
      setError('Failed to load borrowings. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleReturn = async (id, opts) => {
    setSubmitting(true);
    try {
      await checkoutService.returnCheckout(id, opts);
      toast.success('Item returned successfully.');
      setReturning(null);
      load();
    } catch {
      toast.error('Failed to process return. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="heading-section mb-1">Borrowings</p>
          <h1 className="heading-page">Active Borrowings</h1>
        </div>
        {canManage && (
          <Link
            to="/checkout/overdue"
            className="btn-outline border-red-200 text-danger hover:bg-red-50 hover:border-red-300 gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View Overdue
          </Link>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-danger">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
          <button onClick={load} className="ml-auto text-xs font-semibold underline">Retry</button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <TableSkeleton />
      ) : !data.checkouts.length ? (
        <div className="card py-16 text-center">
          <svg className="w-10 h-10 text-ink-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <p className="text-sm font-semibold text-ink-700">No active borrowings</p>
          <p className="text-xs text-ink-400 mt-1">All items are currently in the registry.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <CheckoutTable
            checkouts={data.checkouts}
            canManage={canManage}
            onReturn={(c) => setReturning(c)}
          />
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-2">
            <p className="text-xs text-ink-400">
              {data.total} active borrowing{data.total !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-outline px-3 py-1 text-xs disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-xs font-medium text-ink-600 px-2">{data.page} / {data.pages}</span>
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

      {returning && (
        <ReturnModal
          checkout={returning}
          onConfirm={handleReturn}
          onClose={() => setReturning(null)}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default ActiveBorrowingsPage;
