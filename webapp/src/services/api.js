// webapp/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
  // Get all leaves
  getLeaves() {
    return apiClient.get('/leaves');
  },

  // Get a single leave by ID
  getLeave(id) {
    return apiClient.get(`/leaves/${id}`);
  },

  // Create a new leave
  createLeave(leave) {
    return apiClient.post('/leaves', leave);
  },

  // Update a leave
  updateLeave(id, leave) {
    return apiClient.put(`/leaves/${id}`, leave);
  },

  // Delete a leave
  deleteLeave(id) {
    return apiClient.delete(`/leaves/${id}`);
  },

  // Search leaves
  searchLeaves(params) {
    return apiClient.get('/search', { params });
  }
};