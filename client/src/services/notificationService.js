import api from './api/axiosInstance';

export const getNotifications = async (params = {}) => {
  const { data } = await api.get('/notifications', { params });
  return data.data;
};

export const getUnreadCount = async () => {
  const { data } = await api.get('/notifications/unread-count');
  return data.data?.count ?? 0;
};

export const getLatestUnread = async (limit = 5) => {
  const { data } = await api.get('/notifications/latest', { params: { limit } });
  return data.data?.notifications || [];
};

export const markAsRead = async (id) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data.data?.notification;
};

export const markAllAsRead = async () => {
  const { data } = await api.put('/notifications/read-all');
  return data;
};

export const deleteNotification = async (id) => {
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
};
