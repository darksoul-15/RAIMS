import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import * as requestService from '../../services/requestService';
import RequestStatusBadge from '../../components/requests/RequestStatusBadge';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const PAGE_SIZE = 10;

const EmptyState = ({ filtered }) => (
  <div className="card py-14 text-center">
    <svg className="w-10 h-10 text-ink-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    <p className="text-sm font-semibold text-ink-700">
      {filtered ? 'No requests match this filter' : 'No requests yet'}
    </p>
    <p className="text-xs text-ink-400 mt-1">
      {filtered ? 'Try changing the status filter.' : 'Submit your first asset request to get started.'}
    </p>
    {!filtered && (
      <Link to="/requests/new" className="btn-primary inline-flex mt-4 px-5">
        + New Request
      </Link>
    )}
  </div>
);

const MyRequestsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData]             = useState({ requests: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]             = useState(1);

  useEffect(() => setPage(1), [statusFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await requestService.getMyRequests({ page, limit: PAGE_SIZE, status: statusFilter });
      setData(result);
    } catch {
      setError('Failed to load requests. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, user?._id]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this request?')) return;
    try {
      await requestService.cancelRequest(id);
      toast.success('Request cancelled.');
      load();
    } catch {
      toast.error('Failed to cancel request.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="heading-section mb-1">Requests</p>
          <h1 className="heading-page">My Requests</h1>
        </div>
        <Link to="/requests/new" className="btn-primary gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </Link>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-ink-500 shrink-0">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="">All</option>
          {requestService.REQUEST_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {statusFilter && (
          <button onClick={() => setStatusFilter('')} className="btn-ghost text-xs px-2 py-1">
            Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-danger">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 w-48 bg-cream-200 rounded" />
                  <div className="h-3 w-64 bg-cream-100 rounded" />
                </div>
                <div className="h-5 w-20 bg-cream-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : !data.requests?.length ? (
        <EmptyState filtered={!!statusFilter} />
      ) : (
        <>
          <div className="space-y-3">
            {data.requests.map((r) => (
              <div key={r._id} className="card p-4 hover:shadow-card-md transition-shadow duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-ink-900 text-sm">
                        {r.asset?.name || '—'}
                      </h3>
                      <span className="font-mono text-[10px] text-ink-400 bg-cream-100 px-1.5 py-0.5 rounded">
                        {r.asset?.assetCode}
                      </span>
                    </div>
                    <p className="text-xs text-ink-400 mt-1">
                      Qty: <span className="font-medium text-ink-600">{r.quantityRequested}</span>
                      {' · '}Submitted {fmtDate(r.requestDate)}
                      {' · '}Return by <span className="font-medium text-ink-600">{fmtDate(r.expectedReturnDate)}</span>
                    </p>
                  </div>
                  <RequestStatusBadge status={r.status} />
                </div>

                {r.purpose && (
                  <p className="mt-2 text-xs text-ink-500 line-clamp-2 leading-relaxed">{r.purpose}</p>
                )}

                {r.notes && (
                  <p className="mt-1.5 text-xs text-ink-400 italic border-l-2 border-cream-300 pl-2">{r.notes}</p>
                )}

                {r.status === 'Pending' && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <button
                      onClick={() => handleCancel(r._id)}
                      className="btn-outline px-3 py-1 text-xs text-danger border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      Cancel Request
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-ink-400">
            <span>{data.total} request{data.total !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-outline px-3 py-1 text-xs disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="font-medium text-ink-600 px-2">{data.page} / {data.pages}</span>
              <button
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-outline px-3 py-1 text-xs disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyRequestsPage;
