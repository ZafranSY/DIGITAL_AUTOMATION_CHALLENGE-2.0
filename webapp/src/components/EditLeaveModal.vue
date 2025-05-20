<template>
  <div v-if="isOpen" class="modal-backdrop">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Edit Leave Application</h2>
        <button @click="$emit('close')" class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
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
                type="text"
                required
                placeholder="YYYY-MM-DD"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="edit-endDate" class="form-label">End Date</label>
              <input
                id="edit-endDate"
                v-model="formData.endDate"
                type="text"
                required
                placeholder="YYYY-MM-DD"
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
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, watch } from 'vue';

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
      id: '',
      employeeId: '',
      name: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      status: ''
    });

    // Update form data when the application prop changes
    watch(() => props.application, (newApplication) => {
      if (newApplication) {
        Object.assign(formData, newApplication);
      }
    }, { immediate: true });

    function submitForm() {
      emit('submit', { ...formData });
    }

    return {
      formData,
      submitForm
    };
  }
};
</script>