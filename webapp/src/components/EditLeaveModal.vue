<template>
  <div v-if="isOpen" class="modal-backdrop">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Edit Leave Application</h2>
        <button @click="$emit('close')" class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div v-if="formError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ formError }}
        </div>
        <form @submit.prevent="submitForm">
          <div class="grid grid-cols-2">
            <div class="form-group">
              <label for="edit-employeeId" class="form-label">Employee ID</label>
              <input
                id="edit-employeeId"
                v-model="formData.employeeId"
                type="text"
                required
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="edit-name" class="form-label">Name</label>
              <input
                id="edit-name"
                v-model="formData.name"
                type="text"
                required
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="edit-leaveType" class="form-label">Leave Type</label>
              <select
                id="edit-leaveType"
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
              <label for="edit-startDate" class="form-label">Start Date</label>
              <input
                id="edit-startDate"
                v-model="formData.startDate"
                type="date"
                required
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="edit-endDate" class="form-label">End Date</label>
              <input
                id="edit-endDate"
                v-model="formData.endDate"
                type="date"
                required
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="edit-status" class="form-label">Status</label>
              <select
                id="edit-status"
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

          <div class="modal-footer">
            <button type="button" @click="$emit('close')" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, watch } from 'vue';

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    application: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const formData = reactive({
      _id: '',
      employeeId: '',
      name: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      status: ''
    });
    
    const formError = ref(null);
    const isSubmitting = ref(false);

    // Format dates for input fields
    function formatDateForInput(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    }

    // Update form data when the application prop changes
    watch(() => props.application, (newApplication) => {
      if (newApplication) {
        formData._id = newApplication._id;
        formData.employeeId = newApplication.employeeId;
        formData.name = newApplication.name;
        formData.leaveType = newApplication.leaveType;
        formData.startDate = formatDateForInput(newApplication.startDate);
        formData.endDate = formatDateForInput(newApplication.endDate);
        formData.status = newApplication.status;
      }
    }, { immediate: true });

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
      } catch (error) {
        formError.value = error.message || 'An error occurred while updating the leave application';
      } finally {
        isSubmitting.value = false;
      }
    }

    return {
      formData,
      formError,
      isSubmitting,
      submitForm
    };
  }
};
</script>