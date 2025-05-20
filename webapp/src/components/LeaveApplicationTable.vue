<template>
  <div class="overflow-x-auto">
    <table>
      <thead>
        <tr>
          <th>Employee ID</th>
          <th>Name</th>
          <th>Leave Type</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="application in applications" :key="application.id">
          <td>{{ application.employeeId }}</td>
          <td>{{ application.name }}</td>
          <td>{{ application.leaveType }}</td>
          <td>{{ application.startDate }}</td>
          <td>{{ application.endDate }}</td>
          <td :class="getStatusClass(application.status)">{{ application.status }}</td>
          <td>
            <div class="flex gap-2">
              <button @click="$emit('edit', application)" class="text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button @click="$emit('delete', application.id)" class="text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="applications.length === 0">
          <td colspan="7" class="text-center py-4">No leave applications found</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { StatusTypes } from '../types';

export default {
  props: {
    applications: {
      type: Array,
      required: true
    }
  },
  emits: ['edit', 'delete'],
  setup() {
    function getStatusClass(status) {
      switch (status) {
        case StatusTypes.APPROVED:
          return 'status-approved';
        case StatusTypes.REJECTED:
          return 'status-rejected';
        default:
          return 'status-pending';
      }
    }

    return {
      getStatusClass
    };
  }
};
</script>