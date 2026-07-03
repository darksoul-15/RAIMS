import api from './api/axiosInstance';

export const getAssetSummary = async () => {
  const { data } = await api.get('/reports/asset-summary');
  return data.data;
};

export const getAssetsByCategory = async () => {
  const { data } = await api.get('/reports/assets-by-category');
  return data.data?.categories || [];
};

export const getAssetsByStatus = async () => {
  const { data } = await api.get('/reports/assets-by-status');
  return data.data?.statuses || [];
};

export const getProcurementSpend = async () => {
  const { data } = await api.get('/reports/procurement-spend');
  return data.data?.spend || [];
};

export const getBorrowingTrends = async () => {
  const { data } = await api.get('/reports/borrowing-trends');
  return data.data?.trends || [];
};
