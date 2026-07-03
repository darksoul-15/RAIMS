import api from './api/axiosInstance';

export const getProcurements = async (params = {}) => {
  const { data } = await api.get('/procurements', { params });
  return data.data;
};

export const getProcurement = async (id) => {
  const { data } = await api.get(`/procurements/${id}`);
  return data.data?.procurement;
};

export const getCategories = async () => {
  const { data } = await api.get('/procurements/categories');
  return data.data?.categories || [];
};

export const createProcurement = async (payload) => {
  const { data } = await api.post('/procurements', payload);
  return data.data?.procurement;
};

export const updateProcurement = async (id, payload) => {
  const { data } = await api.put(`/procurements/${id}`, payload);
  return data.data?.procurement;
};

export const deleteProcurement = async (id) => {
  const { data } = await api.delete(`/procurements/${id}`);
  return data;
};
