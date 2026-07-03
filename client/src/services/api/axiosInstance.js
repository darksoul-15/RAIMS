import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach access token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Silent token refresh on 401 — queue concurrent requests while refreshing
let refreshing = false;
let waitQueue = [];

const processQueue = (error, token = null) => {
  waitQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  waitQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only intercept 401s; skip the refresh call itself to avoid loops
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (refreshing) {
      // Queue this request until the in-flight refresh completes
      return new Promise((resolve, reject) => {
        waitQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(original);
      });
    }

    original._retry = true;
    refreshing = true;

    try {
      const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });
      const newToken = data.data?.accessToken;
      const newRefresh = data.data?.refreshToken;

      localStorage.setItem('accessToken', newToken);
      if (newRefresh) localStorage.setItem('refreshToken', newRefresh);

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      original.headers.Authorization = `Bearer ${newToken}`;

      processQueue(null, newToken);
      return axiosInstance(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      refreshing = false;
    }
  }
);

export default axiosInstance;
