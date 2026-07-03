import api from './api/axiosInstance';

export const CONDITIONS = ['Good', 'Fair', 'Poor', 'Damaged', 'Lost'];

export const getCheckouts = async (params = {}) => {
  const { data } = await api.get('/checkouts', { params });
  return data.data;
};

export const getActiveCheckouts = async (params = {}) => {
  const { data } = await api.get('/checkouts/active', { params });
  return data.data;
};

export const getOverdueCheckouts = async (params = {}) => {
  const { data } = await api.get('/checkouts/overdue', { params });
  return data.data;
};

export const getCheckout = async (id) => {
  const { data } = await api.get(`/checkouts/${id}`);
  return data.data?.checkout;
};

export const returnCheckout = async (id, payload) => {
  const { data } = await api.put(`/checkouts/${id}/return`, payload);
  return data.data?.checkout;
};

export const scanOverdue = async () => {
  const { data } = await api.put('/checkouts/scan-overdue');
  return data.data;
};
