import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import * as requestService from '../../services/requestService';
import ApprovalQueueItem from '../../components/requests/ApprovalQueueItem';

const PAGE_SIZE = 10;

const SkeletonRow = () => (
  <div className="card p-4 animate-pulse space-y-3">
    <div className="flex justify-between gap-4">
      <div className="space-y-2 flex-1">
        <div className="h-3.5 w-48 bg-cream-200 rounded" />
        <div className="h-3 w-64 bg-cream-100 rounded" />
      </div>
      <div className="h-5 w-20 bg-cream-100 rounded-full" />
    </div>
    <div className="flex gap-2 pt-1">
      <div className="h-8 w-24 bg-cream-200 rounded-md" />
      <div className="h-8 w-24 bg-cream-100 rounded-md" />
    </div>
  </div>
);

const ApprovalsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState({ requests: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await requestService.getPendingApprovals({ page, limit: PAGE_SIZE });
      setData(result);
    } catch {
      setError('Failed to load approvals. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id, notes) => {
    try {
      await requestService.approveRequest(id, { _id: user._id, name: user.name }, notes);
      toast.success('Request approved successfully.');
      load();
    } catch {
      toast.error('Failed to approve request. Please try again.');
    }
  };

  const handleReject = async (id, notes) => {
    try {
      await requestService.rejectRequest(id, { _id: user._id, name: user.name }, notes);
      toast.success('Request rejected.');
      load();
    } catch {
      toast.error('Failed to reject request. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <p className="heading-section mb-1">Requests</p>
        <h1 className="heading-page">Approval Queue</h1>
        {!loading && (
          <p className="text-sm text-ink-400 mt-1">
            {data.total} pending request{data.total !== 1 ? 's' : ''} awaiting review
          </p>
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
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : !data.requests.length ? (
        <div className="card py-16 text-center">
          <svg className="w-10 h-10 text-ink-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-semibold text-ink-700">Queue is clear</p>
          <p className="text-xs text-ink-400 mt-1">No pending requests to review right now.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.requests.map((r) => (
              <ApprovalQueueItem
                key={r._id}
                request={r}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-ink-400">
            <span>{data.total} pending</span>
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

export default ApprovalsPage;
