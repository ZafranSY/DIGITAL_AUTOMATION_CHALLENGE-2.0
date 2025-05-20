<template>
  <div class="card">
    <h2 class="text-lg font-medium mb-4">Add Leave Application</h2>
    <div v-if="formError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ formError }}
    </div>
    <form @submit.prevent="submitForm">
      <div class="grid grid-cols-2">
        <div class="form-group">
          <label for="employeeId" class="form-label">Employee ID</label>
          <input
            id="employeeId"
            v-model="formData.employeeId"
            type="text"
            required
            placeholder="Enter Employee ID"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="name" class="form-label">Name</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            placeholder="Enter Employee Name"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="leaveType" class="form-label">Leave Type</label>
          <select
            id="leaveType"
            v-model="formData.leaveType"
            required
            class="form-select"
          >
            <option value="Annual">Annual</option>
            <option value="Sick">Sick</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        <div class="form-group">
          <label for="startDate" class="form-label">Start Date</label>
          <input
            id="startDate"
            v-model="formData.startDate"
            type="date"
            required
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="endDate" class="form-label">End Date</label>
          <input
            id="endDate"
            v-model="formData.endDate"
            type="date"
            required
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="status" class="form-label">Status</label>
          <select
            id="status"
            v-model="formData.status"
            required
            class="form-select"
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div class="mt-6 flex gap-4">
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? 'Submitting...' : 'Submit' }}
        </button>
        <button type="button" @click="resetForm" class="btn btn-secondary">Reset</button>
      </div>
    </form>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';
import { LeaveTypes, StatusTypes } from '../types';

export default {
  emits: ['submit'],
  setup(props, { emit }) {
    const formData = reactive({
      employeeId: '',
      name: '',
      leaveType: LeaveTypes.ANNUAL,
      startDate: '',
      endDate: '',
      status: StatusTypes.PENDING
    });

    const formError = ref(null);
    const isSubmitting = ref(false);

    function validateDates() {
      if (!formData.startDate || !formData.endDate) return true;
      
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end < start) {
        formError.value = 'End date cannot be before start date';
        return false;
      }
      
      return true;
    }

    async function submitForm() {
      formError.value = null;
      
      if (!validateDates()) {
        return;
      }
      
      isSubmitting.value = true;
      
      try {
        emit('submit', { ...formData });
        resetForm();
      } catch (error) {
        formError.value = error.message || 'An error occurred while submitting the form';
      } finally {
        isSubmitting.value = false;
      }
    }

    function resetForm() {
      formData.employeeId = '';
      formData.name = '';
      formData.leaveType = LeaveTypes.ANNUAL;
      formData.startDate = '';
      formData.endDate = '';
      formData.status = StatusTypes.PENDING;
      formError.value = null;
    }

    return {
      formData,
      formError,
      isSubmitting,
      submitForm,
      resetForm
    };
  }
};
</script>