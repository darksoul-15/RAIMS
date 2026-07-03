import api from './api/axiosInstance';

export const REQUEST_STATUSES = [
  'Pending', 'Approved', 'Rejected', 'Allocated',
  'CheckedOut', 'Returned', 'Overdue', 'Cancelled'
];

export const getRequests = async (params = {}) => {
  const { data } = await api.get('/requests', { params });
  return data.data;
};

export const getMyRequests = async (params = {}) => {
  const { data } = await api.get('/requests/my', { params });
  return data.data;
};

export const getPendingApprovals = async (params = {}) => {
  const { data } = await api.get('/requests/approvals', { params });
  return data.data;
};

export const getRequest = async (id) => {
  const { data } = await api.get(`/requests/${id}`);
  return data.data?.request;
};

export const createRequest = async (payload) => {
  const { data } = await api.post('/requests', payload);
  return data.data?.request;
};

export const approveRequest = async (id, notes = '') => {
  const { data } = await api.put(`/requests/${id}/approve`, { notes });
  return data.data?.request;
};

export const rejectRequest = async (id, notes = '') => {
  const { data } = await api.put(`/requests/${id}/reject`, { notes });
  return data.data?.request;
};

export const cancelRequest = async (id) => {
  const { data } = await api.put(`/requests/${id}/cancel`);
  return data.data?.request;
};
