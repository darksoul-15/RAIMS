import axiosInstance from './api/axiosInstance';

// ─── Token helpers ────────────────────────────────────────
const storeTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// ─── Auth ─────────────────────────────────────────────────
export const login = async (credentials) => {
  const { data } = await axiosInstance.post('/auth/login', credentials);
  storeTokens(data.data);
  return data.data.user;
};

export const register = async (payload) => {
  const { data } = await axiosInstance.post('/auth/register', payload);
  storeTokens(data.data);
  return data.data.user;
};

export const getMe = async () => {
  const { data } = await axiosInstance.get('/auth/me');
  return data.data.user;
};

export const logout = () => {
  clearTokens();
};

export const isAuthenticated = () => !!localStorage.getItem('accessToken');

// ─── User management (Administrator) ──────────────────────
export const getUsers = async (params = {}) => {
  const { data } = await axiosInstance.get('/users', { params });
  return data.data;
};

export const updateUser = async (id, payload) => {
  const { data } = await axiosInstance.put(`/users/${id}`, payload);
  return data.data.user;
};

export const deleteUser = async (id) => {
  const { data } = await axiosInstance.delete(`/users/${id}`);
  return data;
};
