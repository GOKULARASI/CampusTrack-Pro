import { create } from 'zustand';
import api from '../utils/api';

const usePlacementStore = create((set) => ({
  myRecord: null,
  stats: [],
  loading: false,
  error: null,

  fetchMyRecord: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/placements/my');
      set({ myRecord: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch placement record', loading: false });
    }
  },

  updateMyRecord: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/placements/my', data);
      set({ myRecord: response.data.record, loading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update placement record', loading: false });
      return { success: false, error: error.response?.data?.error };
    }
  },

  verifyPlacementRecord: async (id, isVerified, remarks) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/placements/${id}/verify`, { isVerified, remarks });
      set({ loading: false });
      return { success: true, record: response.data.record };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to verify placement record', loading: false });
      return { success: false, error: error.response?.data?.error };
    }
  },

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/placements/stats');
      set({ stats: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch stats', loading: false });
    }
  }
}));

export default usePlacementStore;
