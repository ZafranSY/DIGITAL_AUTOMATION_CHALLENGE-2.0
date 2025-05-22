<template>
  <div class="dhl-app">
    <!-- DHL Navbar -->
    <header class="dhl-navbar">
      <div class="container">
        <div class="navbar-content">
          <div class="logo">
            <img src="https://www.dhl.com/content/dam/dhl/global/core/images/logos/dhl-logo.svg" alt="DHL Logo">
          </div>
          <h1>Leave Management System</h1>
          <div class="user-info">
            <span class="user-name">HR Admin</span>
            <span class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </span>
          </div>
        </div>
      </div>
    </header>

    <main class="container">
      <!-- Dashboard Header -->
      <div class="dashboard-header">
        <h2>Leave Application Dashboard</h2>
        <p>Manage employee leave applications efficiently</p>
      </div>

      <!-- Dashboard Stats -->
      <div class="stats-cards">
        <div class="stat-card pending">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-info">
            <h3>{{ pendingLeaves }}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
        <div class="stat-card approved">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <h3>{{ approvedLeaves }}</h3>
            <p>Approved Leaves</p>
          </div>
        </div>
        <div class="stat-card rejected">
          <div class="stat-icon">
            <i class="fas fa-times-circle"></i>
          </div>
          <div class="stat-info">
            <h3>{{ rejectedLeaves }}</h3>
            <p>Rejected Leaves</p>
          </div>
        </div>
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="stat-info">
            <h3>{{ leaves.length }}</h3>
            <p>Total Applications</p>
          </div>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="search-filter-section">
        <DateRangeSearch @search="searchLeaves" />
        <button class="btn btn-primary add-leave-btn" @click="showLeaveForm = true">
          <i class="fas fa-plus"></i> New Leave Application
        </button>
      </div>

      <!-- Leave Application Form -->
      <LeaveApplicationForm 
        v-if="showLeaveForm" 
        @close="showLeaveForm = false"
        @submit="addLeaveApplication" 
      />

      <!-- Leave Applications Table -->
      <LeaveApplicationTable 
        :leaves="filteredLeaves" 
        @edit="editLeave" 
        @delete="deleteLeave"
        @status-change="updateLeaveStatus" 
      />

      <!-- Edit Leave Modal -->
      <EditLeaveModal 
        v-if="showEditModal" 
        :leave="selectedLeave" 
        @close="showEditModal = false"
        @update="updateLeave" 
      />
    </main>

    <!-- Footer -->
    <footer class="dhl-footer">
      <div class="container">
        <p>© 2024 DHL Asia Pacific Shared Services. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import LeaveApplicationForm from './components/LeaveApplicationForm.vue';
import LeaveApplicationTable from './components/LeaveApplicationTable.vue';
import EditLeaveModal from './components/EditLeaveModal.vue';
import DateRangeSearch from './components/DateRangeSearch.vue';
import api from './services/api';

export default {
  name: 'App',
  components: {
    LeaveApplicationForm,
    LeaveApplicationTable,
    EditLeaveModal,
    DateRangeSearch
  },
  setup() {
    const leaves = ref([]);
    const showLeaveForm = ref(false);
    const showEditModal = ref(false);
    const selectedLeave = ref(null);
    const searchParams = ref({
      employeeId: '',
      startDate: '',
      endDate: ''
    });

    // Fetch all leaves when component mounts
    onMounted(async () => {
      try {
        const response = await api.getLeaves();
        leaves.value = response.data;
      } catch (error) {
        console.error('Failed to fetch leaves:', error);
        alert('Failed to load leave applications. Please try again later.');
      }
    });

    // Computed properties for statistics
    const pendingLeaves = computed(() => 
      leaves.value.filter(leave => leave.status === 'Pending').length
    );
    
    const approvedLeaves = computed(() => 
      leaves.value.filter(leave => leave.status === 'Approved').length
    );
    
    const rejectedLeaves = computed(() => 
      leaves.value.filter(leave => leave.status === 'Rejected').length
    );

    const filteredLeaves = computed(() => {
      if (!searchParams.value.employeeId && !searchParams.value.startDate && !searchParams.value.endDate) {
        return leaves.value;
      }
      
      return leaves.value.filter(leave => {
        const matchesEmployeeId = !searchParams.value.employeeId || 
          leave.employeeId.toLowerCase().includes(searchParams.value.employeeId.toLowerCase());
        
        let matchesDateRange = true;
        if (searchParams.value.startDate && searchParams.value.endDate) {
          const leaveStart = new Date(leave.startDate);
          const leaveEnd = new Date(leave.endDate);
          const searchStart = new Date(searchParams.value.startDate);
          const searchEnd = new Date(searchParams.value.endDate);
          
          matchesDateRange = (leaveStart >= searchStart && leaveEnd <= searchEnd);
        }
        
        return matchesEmployeeId && matchesDateRange;
      });
    });

    // Add a new leave application
    const addLeaveApplication = async (leaveData) => {
      try {
        const response = await api.createLeave(leaveData);
        leaves.value.unshift(response.data);
        showLeaveForm.value = false;
      } catch (error) {
        console.error('Failed to create leave:', error);
        alert(error.response?.data?.message || 'Failed to create leave application');
      }
    };

    // Edit a leave application
    const editLeave = (leave) => {
      selectedLeave.value = { ...leave };
      showEditModal.value = true;
    };

    // Update a leave application
    const updateLeave = async (updatedLeave) => {
      try {
        const response = await api.updateLeave(updatedLeave.id, updatedLeave);
        const index = leaves.value.findIndex(leave => leave.id === updatedLeave.id);
        if (index !== -1) {
          leaves.value[index] = response.data;
        }
        showEditModal.value = false;
      } catch (error) {
        console.error('Failed to update leave:', error);
        alert('Failed to update leave application');
      }
    };

    // Update the deleteLeave method in App.vue
const deleteLeave = async (leaveId) => {
  if (confirm('Are you sure you want to delete this leave application?')) {
    try {
      await api.deleteLeave(leaveId);
      leaves.value = leaves.value.filter(leave => leave.id !== leaveId);
    } catch (error) {
      console.error('Failed to delete leave:', error);
      alert('Failed to delete leave application');
    }
  }
};

// Update the updateLeaveStatus method in App.vue
const updateLeaveStatus = async (leaveId, newStatus) => {
  try {
    const leaveToUpdate = leaves.value.find(leave => leave.id === leaveId);
    if (leaveToUpdate) {
      let response;
      
      if (newStatus === 'Rejected') {
        response = await api.rejectLeave(leaveId);
      } else {
        const updatedLeave = { ...leaveToUpdate, status: newStatus };
        response = await api.updateLeave(leaveId, updatedLeave);
      }
      
      const index = leaves.value.findIndex(leave => leave.id === leaveId);
      if (index !== -1) {
        leaves.value[index] = response.data;
      }
    }
  } catch (error) {
    console.error('Failed to update leave status:', error);
    alert('Failed to update leave status');
  }
};
    // Search leaves by date range and employee ID
    const searchLeaves = async (params) => {
      searchParams.value = { ...params };
      
      if (params.employeeId || (params.startDate && params.endDate)) {
        try {
          const response = await api.searchLeaves(params);
          leaves.value = response.data;
        } catch (error) {
          console.error('Failed to search leaves:', error);
          alert('Failed to search leave applications');
        }
      } else {
        // If no search parameters, fetch all leaves
        try {
          const response = await api.getLeaves();
          leaves.value = response.data;
        } catch (error) {
          console.error('Failed to fetch leaves:', error);
          alert('Failed to load leave applications');
        }
      }
    };

    return {
      leaves,
      filteredLeaves,
      showLeaveForm,
      showEditModal,
      selectedLeave,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      addLeaveApplication,
      editLeave,
      updateLeave,
      deleteLeave,
      updateLeaveStatus,
      searchLeaves
    };
  }
};
</script>

<style>
/* DHL Colors */
:root {
  --dhl-yellow: #FFCC00;
  --dhl-red: #D40511;
  --dhl-dark-red: #B00009;
  --dhl-gray: #333333;
  --dhl-light-gray: #F5F5F5;
  --dhl-text: #333333;
  --dhl-border: #E0E0E0;
  --status-pending: #2563eb;
  --status-approved: #16a34a;
  --status-rejected: #dc2626;
}

/* Global Styles */
body {
  font-family: 'Roboto', sans-serif;
  color: var(--dhl-text);
  background-color: #f9f9f9;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* DHL Navbar */
.dhl-navbar {
  background-color: var(--dhl-yellow);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0.75rem 0;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo img {
  height: 40px;
}

.dhl-navbar h1 {
  color: var(--dhl-gray);
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--dhl-gray);
}

.user-avatar i {
  font-size: 1.5rem;
}

/* Dashboard Header */
.dashboard-header {
  margin: 2rem 0;
  text-align: center;
  border-bottom: 3px solid var(--dhl-yellow);
  padding-bottom: 1rem;
}

.dashboard-header h2 {
  color: var(--dhl-red);
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.dashboard-header p {
  color: var(--dhl-gray);
  font-size: 1.1rem;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: white;
}

.stat-card.pending .stat-icon {
  background-color: var(--status-pending);
}

.stat-card.approved .stat-icon {
  background-color: var(--status-approved);
}

.stat-card.rejected .stat-icon {
  background-color: var(--status-rejected);
}

.stat-card.total .stat-icon {
  background-color: var(--dhl-red);
}

.stat-info h3 {
  font-size: 1.8rem;
  margin: 0 0 0.25rem 0;
  font-weight: 700;
}

.stat-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* Search and Filter Section */
.search-filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.add-leave-btn {
  background-color: var(--dhl-red);
  color: white;
  border: none;
  transition: background-color 0.3s ease;
  margin-top:0.5rem;
}

.add-leave-btn:hover {
  background-color: var(--dhl-dark-red);
}

/* Button Styles */
.btn {
  border-radius: 4px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: var(--dhl-red);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: var(--dhl-dark-red);
}

.btn-secondary {
  background-color: white;
  border: 1px solid var(--dhl-border);
  color: var(--dhl-gray);
}

.btn-secondary:hover {
  background-color: var(--dhl-light-gray);
}

/* Footer */
.dhl-footer {
  background-color: var(--dhl-gray);
  color: white;
  padding: 1.5rem 0;
  margin-top: 3rem;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 992px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .navbar-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .search-filter-section {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>