import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import * as requestService from '../../services/requestService';
import RequestForm from '../../components/requests/RequestForm';

const RequestFormPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(null); // holds the created request

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError('');
    try {
      const created = await requestService.createRequest(formData);
      setSuccess(created);
      // Redirect to My Requests after 2.5s
      setTimeout(() => navigate('/requests'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success screen ──────────────────────────────────── */
  if (success) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="card p-8 text-center space-y-4">
          {/* Checkmark */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-emerald-600 mb-1">Request submitted</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">You're all set!</h2>
            <p className="text-sm text-ink-400 mt-2">
              Your request is now <span className="font-semibold text-amber-600">Pending</span> and waiting for approval.
              You'll receive a notification once it's reviewed.
            </p>
          </div>

          {/* Request summary */}
          <div className="rounded-lg border border-border bg-surface-2 px-4 py-3 text-left space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-400">Asset</span>
              <span className="font-medium text-ink-800">{success?.asset?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400">Quantity</span>
              <span className="font-medium text-ink-800">{success?.quantityRequested}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400">Return by</span>
              <span className="font-medium text-ink-800">
                {success?.expectedReturnDate
                  ? new Date(success.expectedReturnDate).toLocaleDateString()
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400">Status</span>
              <span className="badge badge-borrowed">Pending</span>
            </div>
          </div>

          <p className="text-xs text-ink-400">Redirecting to My Requests in a moment…</p>

          <button
            onClick={() => navigate('/requests')}
            className="btn-primary w-full py-2.5"
          >
            Go to My Requests now
          </button>
        </div>
      </div>
    );
  }

  /* ── Form screen ─────────────────────────────────────── */
  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <Link
          to="/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-400 hover:text-ink-700 transition-colors mb-4"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Requests
        </Link>
        <p className="heading-section mb-1">New Request</p>
        <h1 className="heading-page">Request an Asset</h1>
        <p className="text-sm text-ink-400 mt-1">
          Fill in the details below. Your request will be sent to approvers once submitted.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <svg className="w-4 h-4 text-danger mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Form card */}
      <div className="card p-6">
        <RequestForm onSubmit={handleSubmit} loading={submitting} />
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 text-xs text-ink-400">
        <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>Requests are reviewed by Resource Managers and Administrators. You will be notified by email when your request status changes.</p>
      </div>
    </div>
  );
};

export default RequestFormPage;
