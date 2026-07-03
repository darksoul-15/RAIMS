import { checkoutStatusClass, humanizeStatus } from '../../utils/statusColors';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

const CheckoutTable = ({ checkouts, onReturn, canManage = false }) => {
  if (!checkouts.length) {
    return <p className="text-gray-500 text-sm py-4">No checkouts found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2 pr-3 font-medium">Asset</th>
            <th className="py-2 pr-3 font-medium">Borrower</th>
            <th className="py-2 pr-3 font-medium">Checked out</th>
            <th className="py-2 pr-3 font-medium">Due</th>
            <th className="py-2 pr-3 font-medium">Condition</th>
            <th className="py-2 pr-3 font-medium">Status</th>
            {canManage && <th className="py-2 font-medium">Action</th>}
          </tr>
        </thead>
        <tbody>
          {checkouts.map((c) => {
            const isOverdue =
              c.status !== 'Returned' &&
              new Date(c.expectedReturnDate) < new Date();
            return (
              <tr key={c._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2.5 pr-3">
                  <div className="font-medium text-gray-800">{c.asset?.name}</div>
                  <div className="font-mono text-xs text-gray-400">{c.asset?.assetCode}</div>
                </td>
                <td className="py-2.5 pr-3 text-gray-700">{c.borrower?.name}</td>
                <td className="py-2.5 pr-3 text-gray-600">{fmtDate(c.checkoutDate)}</td>
                <td className={`py-2.5 pr-3 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {fmtDate(c.expectedReturnDate)}
                </td>
                <td className="py-2.5 pr-3 text-gray-600">{c.conditionAtCheckout}</td>
                <td className="py-2.5 pr-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${checkoutStatusClass(c.status)}`}
                  >
                    {humanizeStatus(c.status)}
                  </span>
                </td>
                {canManage && (
                  <td className="py-2.5">
                    {(c.status === 'Active' || c.status === 'Overdue') && (
                      <button
                        onClick={() => onReturn(c)}
                        className="rounded border border-primary-300 text-primary-600 px-3 py-1 text-xs font-medium hover:bg-primary-50"
                      >
                        Process Return
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CheckoutTable;
