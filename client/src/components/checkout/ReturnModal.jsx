import { useState } from 'react';
import { CONDITIONS } from '../../services/checkoutService';

const ReturnModal = ({ checkout, onConfirm, onClose }) => {
  const [condition, setCondition] = useState('Good');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onConfirm(checkout._id, { conditionAtReturn: condition, notes });
    } finally {
      setSubmitting(false);
    }
  };

  if (!checkout) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Process Return</h2>
        <p className="text-sm text-gray-500 mb-4">
          Returning <span className="font-medium text-gray-700">{checkout.asset?.name}</span> from{' '}
          <span className="font-medium text-gray-700">{checkout.borrower?.name}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition at return
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any damage or remarks…"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-primary-600 text-white px-4 py-2 text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? 'Processing…' : 'Confirm Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnModal;
