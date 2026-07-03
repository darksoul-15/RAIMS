import { Link } from 'react-router-dom';
import { assetStatusClass, humanizeStatus } from '../../utils/statusColors';

const AssetTable = ({ assets, canManage = false, canDelete = false, onDelete }) => {
  if (!assets.length) {
    return <p className="text-gray-500 py-8 text-center">No assets found.</p>;
  }

  return (
    <div className="overflow-x-auto rounded border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-4 py-2">Code</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Available</th>
            <th className="px-4 py-2">Location</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {assets.map((a) => (
            <tr key={a._id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-gray-500">{a.assetCode}</td>
              <td className="px-4 py-2 font-medium text-gray-800">{a.name}</td>
              <td className="px-4 py-2 text-gray-600">{a.category}</td>
              <td className="px-4 py-2">
                <span className={a.quantityAvailable === 0 ? 'text-red-600' : 'text-gray-700'}>
                  {a.quantityAvailable}/{a.quantityTotal}
                </span>
              </td>
              <td className="px-4 py-2 text-gray-600">{a.storageLocation?.name || '—'}</td>
              <td className="px-4 py-2">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${assetStatusClass(a.status)}`}>
                  {humanizeStatus(a.status)}
                </span>
              </td>
              <td className="px-4 py-2 text-right whitespace-nowrap">
                <Link to={`/assets/${a._id}`} className="text-primary-600 hover:underline">
                  View
                </Link>
                {canManage && (
                  <Link to={`/assets/${a._id}/edit`} className="ml-3 text-primary-600 hover:underline">
                    Edit
                  </Link>
                )}
                {canDelete && (
                  <button
                    onClick={() => onDelete?.(a)}
                    className="ml-3 text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssetTable;
