<template>
  <div class="container">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-xl font-normal flex items-center">
        <span class="inline-block w-4 h-4 bg-black mr-2"></span>
        Leave Management System
      </h1>
      <DateRangeSearch @search="handleSearch" />
    </div>

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
</template>

<script>
import { ref, computed } from 'vue';
import DateRangeSearch from './components/DateRangeSearch.vue';
import LeaveApplicationForm from './components/LeaveApplicationForm.vue';
import LeaveApplicationTable from './components/LeaveApplicationTable.vue';
import EditLeaveModal from './components/EditLeaveModal.vue';

export default {
  components: {
    DateRangeSearch,
    LeaveApplicationForm,
    LeaveApplicationTable,
    EditLeaveModal
  },
  setup() {
    const leaveApplications = ref([
      {
        id: "1",
        employeeId: "E001",
        name: "Alice Johnson",
        leaveType: "Annual",
        startDate: "2023-11-01",
        endDate: "2023-11-10",
        status: "Pending",
      },
      {
        id: "2",
        employeeId: "E002",
        name: "Bob Smith",
        leaveType: "Sick",
        startDate: "2023-11-05",
        endDate: "2023-11-07",
        status: "Approved",
      },
      {
        id: "3",
        employeeId: "E003",
        name: "Carol White",
        leaveType: "Emergency",
        startDate: "2023-11-12",
        endDate: "2023-11-15",
        status: "Rejected",
      },
    ]);

    const editingApplication = ref(null);
    const isEditModalOpen = ref(false);
    const searchQuery = ref({
      employeeId: '',
      startDate: '',
      endDate: ''
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

    function handleAddLeaveApplication(application) {
      const newApplication = {
        ...application,
        id: Math.random().toString(36).substring(2, 9),
      };

      leaveApplications.value.push(newApplication);
    }

    function handleEditLeaveApplication(application) {
      editingApplication.value = application;
      isEditModalOpen.value = true;
    }

    function handleUpdateLeaveApplication(updatedApplication) {
      const index = leaveApplications.value.findIndex(app => app.id === updatedApplication.id);
      if (index !== -1) {
        leaveApplications.value[index] = updatedApplication;
      }
      isEditModalOpen.value = false;
      editingApplication.value = null;
    }

    function handleDeleteLeaveApplication(id) {
      leaveApplications.value = leaveApplications.value.filter(app => app.id !== id);
    }

    function handleSearch(query) {
      searchQuery.value = query;
    }

    return {
      leaveApplications,
      filteredApplications,
      editingApplication,
      isEditModalOpen,
      handleAddLeaveApplication,
      handleEditLeaveApplication,
      handleUpdateLeaveApplication,
      handleDeleteLeaveApplication,
      handleSearch
    };
  }
};
</script>