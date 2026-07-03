import { useState } from 'react';
import RequestStatusBadge from './RequestStatusBadge';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

const ApprovalQueueItem = ({ request, onApprove, onReject }) => {
  const [notes, setNotes] = useState('');
  const [acting, setActing] = useState(false);

  const handleAction = async (action) => {
    setActing(true);
    try {
      if (action === 'approve') await onApprove(request._id, notes);
      else await onReject(request._id, notes);
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-gray-800">
            {request.asset?.name}{' '}
            <span className="font-mono text-xs text-gray-400">{request.asset?.assetCode}</span>
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Requested by <span className="font-medium text-gray-700">{request.requestedBy?.name}</span>
            {' · '}{fmtDate(request.requestDate)}
          </p>
        </div>
        <RequestStatusBadge status={request.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <span className="text-gray-500">Quantity:</span>
        <span className="text-gray-800">{request.quantityRequested}</span>
        <span className="text-gray-500">Return by:</span>
        <span className="text-gray-800">{fmtDate(request.expectedReturnDate)}</span>
      </div>

      <p className="mt-2 text-sm text-gray-600">{request.purpose}</p>

      {request.status === 'Pending' && (
        <div className="mt-4 space-y-3">
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes (optional)…"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('approve')}
              disabled={acting}
              className="rounded bg-green-600 text-white px-4 py-1.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => handleAction('reject')}
              disabled={acting}
              className="rounded border border-red-300 text-red-600 px-4 py-1.5 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalQueueItem;
