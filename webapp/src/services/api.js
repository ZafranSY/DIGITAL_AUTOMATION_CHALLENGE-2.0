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
  updateLeave(employeeId, leave) {
    return apiClient.put(`/leaves/${employeeId}`, leave);
  },

  // Delete a leave
  deleteLeave(employeeId) {
    return apiClient.delete(`/deleteleaves/${employeeId}`);
  },

  // Reject a leave
  rejectLeave(employeeId) {
    return apiClient.put(`/rejectleaves/${employeeId}`);
  },
  approveLeave(employeeId){
    return apiClient.put(`/approveleaves/${employeeId}`)
  },
  // Search leaves
  searchLeaves(params) {
    return apiClient.get('/search', { params });
  }
};