import api from './api/axiosInstance';

export const getAssets = async (params = {}) => {
  const { data } = await api.get('/assets', { params });
  return data.data;
};

export const getAsset = async (id) => {
  const { data } = await api.get(`/assets/${id}`);
  return data.data?.asset;
};

export const getCategories = async () => {
  const { data } = await api.get('/assets/categories');
  return data.data?.categories || [];
};

export const createAsset = async (payload) => {
  const { data } = await api.post('/assets', payload);
  return data.data?.asset;
};

export const updateAsset = async (id, payload) => {
  const { data } = await api.put(`/assets/${id}`, payload);
  return data.data?.asset;
};

export const deleteAsset = async (id) => {
  const { data } = await api.delete(`/assets/${id}`);
  return data;
};
