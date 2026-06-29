import { create } from 'zustand';
import api from '../utils/api';

const useProfileStore = create((set, get) => ({
  profile: null,
  students: [], // List of students for Coordinator/Faculty
  loading: false,
  error: null,

  fetchProfile: async (studentUserId = null) => {
    set({ loading: true, error: null });
    try {
      const url = studentUserId ? `/students/profile?studentUserId=${studentUserId}` : '/students/profile';
      const response = await api.get(url);
      if (!studentUserId) {
        set({ profile: response.data, loading: false });
      } else {
        set({ loading: false });
      }
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch profile', loading: false });
      return null;
    }
  },

  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/students');
      set({ students: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch students list', loading: false });
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/students/profile', profileData);
      set({ profile: response.data.profile, loading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update profile', loading: false });
      return { success: false, error: error.response?.data?.error };
    }
  },

  updateAcademicRecords: async (records) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/students/academic', { semesterRecords: records });
      set({ loading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update academic records', loading: false });
      return { success: false, error: error.response?.data?.error };
    }
  }
}));

export default useProfileStore;
