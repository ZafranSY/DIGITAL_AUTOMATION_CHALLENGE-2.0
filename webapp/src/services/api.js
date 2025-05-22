// webapp/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

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
  getLeave(employeeId) {
    return apiClient.get(`/leaves/employee/${employeeId}`);
  },

  // Create a new leave
  createLeave(leave) {
    return apiClient.post('/addleaves', leave);
  },

  // Update a leave
  updateLeave(id, leave) {
    return apiClient.put(`/leaves/${id}`, leave);
  },

  // Delete a leave
  deleteLeave(id) {
    return apiClient.delete(`/deleteleaves/${id}`);
  },

  // Reject a leave
  rejectLeave(id) {
    return apiClient.put(`/rejectleaves/${id}`);
  },

  // Search leaves
  searchLeaves(params) {
    return apiClient.get('/search', { params });
  }
};