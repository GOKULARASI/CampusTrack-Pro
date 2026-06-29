import { create } from 'zustand';
import api from '../utils/api';

const useInternshipStore = create((set, get) => ({
  internships: [],
  loading: false,
  error: null,

  fetchInternships: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/internships');
      set({ internships: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch internships', loading: false });
    }
  },

  addInternship: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/internships', data);
      set((state) => ({
        internships: [...state.internships, response.data.internship],
        loading: false
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to add internship', loading: false });
      return { success: false, error: error.response?.data?.error };
    }
  },

  updateInternship: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/internships/${id}`, data);
      set((state) => ({
        internships: state.internships.map((item) =>
          item.id === parseInt(id) ? response.data.internship : item
        ),
        loading: false
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update internship', loading: false });
      return { success: false, error: error.response?.data?.error };
    }
  },

  deleteInternship: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/internships/${id}`);
      set((state) => ({
        internships: state.internships.filter((item) => item.id !== parseInt(id)),
        loading: false
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to delete internship', loading: false });
      return { success: false, error: error.response?.data?.error };
    }
  },

  verifyInternship: async (id, status, remarks) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/internships/${id}/verify`, { status, remarks });
      set((state) => ({
        internships: state.internships.map((item) =>
          item.id === parseInt(id) ? response.data.internship : item
        ),
        loading: false
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to verify internship', loading: false });
      return { success: false, error: error.response?.data?.error };
    }
  }
}));

export default useInternshipStore;
