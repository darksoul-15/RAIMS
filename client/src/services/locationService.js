import api from './api/axiosInstance';

export const getLocations = async () => {
  const { data } = await api.get('/locations');
  return data.data?.locations || [];
};

export const getLocationSummaries = async () => {
  const { data } = await api.get('/locations/summaries');
  return data.data?.locations || [];
};

export const getLocationWithAssets = async (id) => {
  const { data } = await api.get(`/locations/${id}/assets`);
  return data.data;
};

export const getReuseSuggestions = async (params = {}) => {
  const { data } = await api.get('/assets/reuse', { params });
  return data.data?.assets || [];
};
