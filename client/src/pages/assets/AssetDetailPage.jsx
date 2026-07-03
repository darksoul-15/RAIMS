import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as assetService from '../../services/assetService';
import { useAuth } from '../../hooks/useAuth';
import { assetStatusClass, humanizeStatus } from '../../utils/statusColors';

const Row = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-border text-sm">
    <span className="text-ink-400">{label}</span>
    <span className="text-ink-900 text-right">{value ?? '—'}</span>
  </div>
);

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

const AssetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canManage = hasRole('Administrator', 'ProjectLead');
  const canDelete = hasRole('Administrator');

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assetService.getAsset(id).then((a) => {
      setAsset(a);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${asset.name}?`)) return;
    await assetService.deleteAsset(id);
    navigate('/assets');
  };

  if (loading) return <div className="p-6 text-ink-400">Loading…</div>;
  if (!asset) return <div className="p-6 text-ink-400">Asset not found. <Link to="/assets" className="text-amber-600">Back</Link></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Link to="/assets" className="text-sm text-amber-600 hover:underline">← Back to assets</Link>

      <div className="mt-3 bg-white rounded-lg border border-border p-6 max-w-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="heading-page">{asset.name}</h1>
            <p className="font-mono text-sm text-ink-400">{asset.assetCode}</p>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${assetStatusClass(asset.status)}`}>
            {humanizeStatus(asset.status)}
          </span>
        </div>

        {asset.description && <p className="mt-3 text-ink-600 text-sm">{asset.description}</p>}

        <div className="mt-5">
          <Row label="Category" value={asset.category} />
          <Row label="Quantity" value={`${asset.quantityAvailable} / ${asset.quantityTotal} available`} />
          <Row label="Storage location" value={asset.storageLocation?.name} />
          <Row label="Purchase date" value={fmtDate(asset.purchaseDate)} />
          <Row label="Purchase cost" value={asset.purchaseCost != null ? `$${asset.purchaseCost}` : '—'} />
          <Row label="Vendor" value={asset.vendor?.name} />
          <Row label="Warranty" value={asset.warranty?.period} />
          <Row label="Warranty expiry" value={fmtDate(asset.warranty?.expiryDate)} />
        </div>

        {(canManage || canDelete) && (
          <div className="mt-6 flex gap-3">
            {canManage && (
              <Link to={`/assets/${id}/edit`} className="rounded bg-ink-900 text-white px-4 py-2 text-sm font-medium hover:bg-primary-700">
                Edit
              </Link>
            )}
            {canDelete && (
              <button onClick={handleDelete} className="rounded border border-red-300 text-red-600 px-4 py-2 text-sm font-medium hover:bg-red-50">
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetDetailPage;
