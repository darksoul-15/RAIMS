import { Link } from 'react-router-dom';
import { assetStatusClass, humanizeStatus } from '../../utils/statusColors';

const AssetCard = ({ asset }) => (
  <Link
    to={`/assets/${asset._id}`}
    className="block rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between gap-2">
      <h3 className="font-medium text-gray-800">{asset.name}</h3>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${assetStatusClass(asset.status)}`}>
        {humanizeStatus(asset.status)}
      </span>
    </div>
    <p className="mt-1 font-mono text-xs text-gray-400">{asset.assetCode}</p>
    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{asset.description}</p>
    <div className="mt-3 flex items-center justify-between text-sm">
      <span className="text-gray-600">{asset.category}</span>
      <span className={asset.quantityAvailable === 0 ? 'text-red-600' : 'text-green-700'}>
        {asset.quantityAvailable} available
      </span>
    </div>
    <p className="mt-1 text-xs text-gray-400">{asset.storageLocation?.name || '—'}</p>
  </Link>
);

export default AssetCard;
