// Shared Tailwind class maps for status badges across modules.

export const ASSET_STATUS_STYLES = {
  Available: 'bg-green-100 text-green-800',
  Borrowed: 'bg-amber-100 text-amber-800',
  Reserved: 'bg-blue-100 text-blue-800',
  UnderMaintenance: 'bg-orange-100 text-orange-800',
  Lost: 'bg-red-100 text-red-800',
  Retired: 'bg-gray-200 text-gray-700'
};

export const assetStatusClass = (status) =>
  ASSET_STATUS_STYLES[status] || 'bg-gray-100 text-gray-700';

export const REQUEST_STATUS_STYLES = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Allocated: 'bg-blue-100 text-blue-800',
  CheckedOut: 'bg-purple-100 text-purple-800',
  Returned: 'bg-gray-200 text-gray-700',
  Overdue: 'bg-red-200 text-red-900',
  Cancelled: 'bg-gray-100 text-gray-500'
};

export const requestStatusClass = (status) =>
  REQUEST_STATUS_STYLES[status] || 'bg-gray-100 text-gray-700';

export const CHECKOUT_STATUS_STYLES = {
  Active: 'bg-blue-100 text-blue-800',
  Returned: 'bg-gray-200 text-gray-700',
  Overdue: 'bg-red-200 text-red-900'
};

export const checkoutStatusClass = (status) =>
  CHECKOUT_STATUS_STYLES[status] || 'bg-gray-100 text-gray-700';

// Human-friendly label (e.g. UnderMaintenance -> "Under Maintenance")
export const humanizeStatus = (status = '') =>
  status.replace(/([a-z])([A-Z])/g, '$1 $2');
