import { create } from 'zustand';
import api from '../utils/api';

const useNotificationStore = create((set) => ({
  notifications: [],
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/notifications');
      set({ notifications: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch notifications', loading: false });
    }
  },

  postNotification: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/notifications', data);
      set((state) => ({
        notifications: [response.data.notification, ...state.notifications],
        loading: false
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to post notification', loading: false });
      return { success: false, error: error.response?.data?.error };
    }
  },

  deleteNotification: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/notifications/${id}`);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== parseInt(id)),
        loading: false
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to delete notification', loading: false });
      return { success: false, error: error.response?.data?.error };
    }
  }
}));

export default useNotificationStore;
