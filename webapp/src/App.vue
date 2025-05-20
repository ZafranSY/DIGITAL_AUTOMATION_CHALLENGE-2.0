<template>
  <div class="container">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-xl font-normal flex items-center">
        <span class="inline-block w-4 h-4 bg-black mr-2"></span>
        Leave Management System
      </h1>
      <DateRangeSearch @search="handleSearch" />
    </div>

    <div v-if="loading" class="text-center py-4">
      Loading...
    </div>
    <div v-else-if="error" class="text-center py-4 text-red-500">
      {{ error }}
    </div>
    <div v-else>
      <LeaveApplicationForm @submit="handleAddLeaveApplication" />

      <div class="mt-6">
        <LeaveApplicationTable 
          :applications="filteredApplications"
          @edit="handleEditLeaveApplication"
          @delete="handleDeleteLeaveApplication"
        />
      </div>

      <EditLeaveModal
        v-if="editingApplication"
        :is-open="isEditModalOpen"
        :application="editingApplication"
        @close="isEditModalOpen = false"
        @submit="handleUpdateLeaveApplication"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import DateRangeSearch from './components/DateRangeSearch.vue';
import LeaveApplicationForm from './components/LeaveApplicationForm.vue';
import LeaveApplicationTable from './components/LeaveApplicationTable.vue';
import EditLeaveModal from './components/EditLeaveModal.vue';
import api from './services/api';

export default {
  components: {
    DateRangeSearch,
    LeaveApplicationForm,
    LeaveApplicationTable,
    EditLeaveModal
  },
  setup() {
    const leaveApplications = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const editingApplication = ref(null);
    const isEditModalOpen = ref(false);
    const searchQuery = ref({
      employeeId: '',
      startDate: '',
      endDate: ''
    });

    // Fetch all leave applications when component mounts
    onMounted(async () => {
      try {
        const response = await api.getLeaves();
        leaveApplications.value = response.data;
        loading.value = false;
      } catch (err) {
        error.value = 'Failed to load leave applications. Please try again later.';
        loading.value = false;
        console.error('Error fetching leaves:', err);
      }
    });

    const filteredApplications = computed(() => {
      return leaveApplications.value.filter(app => {
        // Filter by employee ID if search query exists
        if (searchQuery.value.employeeId && 
            !app.employeeId.toLowerCase().includes(searchQuery.value.employeeId.toLowerCase())) {
          return false;
        }

        // Filter by date range if both dates are provided
        if (searchQuery.value.startDate && searchQuery.value.endDate) {
          const appStart = new Date(app.startDate);
          const appEnd = new Date(app.endDate);
          const searchStart = new Date(searchQuery.value.startDate);
          const searchEnd = new Date(searchQuery.value.endDate);

          if (appStart < searchStart || appEnd > searchEnd) {
            return false;
          }
        }

        return true;
      });
    });

    async function handleAddLeaveApplication(application) {
      try {
        const response = await api.createLeave(application);
        leaveApplications.value.push(response.data);
        // Show success message
        alert('Leave application created successfully!');
      } catch (err) {
        console.error('Error adding leave application:', err);
        if (err.response && err.response.data && err.response.data.message) {
          alert(err.response.data.message);
        } else {
          alert('Failed to create leave application. Please try again.');
        }
      }
    }

    function handleEditLeaveApplication(application) {
      editingApplication.value = application;
      isEditModalOpen.value = true;
    }

    async function handleUpdateLeaveApplication(updatedApplication) {
      try {
        const response = await api.updateLeave(updatedApplication._id, updatedApplication);
        const index = leaveApplications.value.findIndex(app => app._id === updatedApplication._id);
        if (index !== -1) {
          leaveApplications.value[index] = response.data;
        }
        isEditModalOpen.value = false;
        editingApplication.value = null;
        // Show success message
        alert('Leave application updated successfully!');
      } catch (err) {
        console.error('Error updating leave application:', err);
        alert('Failed to update leave application. Please try again.');
      }
    }

    async function handleDeleteLeaveApplication(id) {
      if (confirm('Are you sure you want to delete this leave application?')) {
        try {
          await api.deleteLeave(id);
          leaveApplications.value = leaveApplications.value.filter(app => app._id !== id);
          // Show success message
          alert('Leave application deleted successfully!');
        } catch (err) {
          console.error('Error deleting leave application:', err);
          alert('Failed to delete leave application. Please try again.');
        }
      }
    }

    async function handleSearch(query) {
      searchQuery.value = query;
      
      // If we have search parameters, use the API to search
      if (query.employeeId || (query.startDate && query.endDate)) {
        try {
          loading.value = true;
          const response = await api.searchLeaves(query);
          leaveApplications.value = response.data;
          loading.value = false;
        } catch (err) {
          console.error('Error searching leaves:', err);
          error.value = 'Failed to search leave applications. Please try again.';
          loading.value = false;
        }
      } else {
        // If no search parameters, fetch all leaves
        try {
          loading.value = true;
          const response = await api.getLeaves();
          leaveApplications.value = response.data;
          loading.value = false;
        } catch (err) {
          console.error('Error fetching leaves:', err);
          error.value = 'Failed to load leave applications. Please try again.';
          loading.value = false;
        }
      }
    }

    return {
      leaveApplications,
      filteredApplications,
      editingApplication,
      isEditModalOpen,
      loading,
      error,
      handleAddLeaveApplication,
      handleEditLeaveApplication,
      handleUpdateLeaveApplication,
      handleDeleteLeaveApplication,
      handleSearch
    };
  }
};
</script>