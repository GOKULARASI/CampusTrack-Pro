import { create } from 'zustand';
import api from '../utils/api';

const useDocumentStore = create((set, get) => ({
  documents: [],
  loading: false,
  error: null,

  fetchMyDocuments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/documents/my-documents');
      set({ documents: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch documents', loading: false });
    }
  },

  uploadDocument: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      set((state) => ({
        documents: [...state.documents, response.data.document],
        loading: false
      }));
      return { success: true, document: response.data.document };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to upload document', loading: false });
      return { success: false, error: error.response?.data?.error };
    }
  },

  deleteDocument: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/documents/${id}`);
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== parseInt(id)),
        loading: false
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to delete document', loading: false });
      return { success: false, error: error.response?.data?.error };
    }
  },

  verifyDocument: async (id, status, remarks) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/documents/${id}/verify`, { status, remarks });
      set({ loading: false });
      return { success: true, document: response.data.document };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to verify document', loading: false });
      return { success: false, error: error.response?.data?.error };
    }
  }
}));

export default useDocumentStore;
