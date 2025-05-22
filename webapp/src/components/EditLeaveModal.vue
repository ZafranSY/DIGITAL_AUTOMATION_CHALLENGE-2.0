<template>
  <div class="modal-backdrop">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Edit Leave Application</h3>
        <button class="modal-close" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label class="form-label">Employee ID</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="formData.employeeId" 
              required
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Employee Name</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="formData.name" 
              required
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Leave Type</label>
            <select class="form-select" v-model="formData.leaveType" required>
              <option value="Annual">Annual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Emergency">Emergency Leave</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input 
              type="date" 
              class="form-control" 
              v-model="formData.startDate" 
              required
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">End Date</label>
            <input 
              type="date" 
              class="form-control" 
              v-model="formData.endDate" 
              required
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-select" v-model="formData.status" required>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancel</button>
            <button type="submit" class="btn btn-primary">Update Leave</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'EditLeaveModal',
  props: {
    leave: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'update'],
  setup(props, { emit }) {
    const formData = ref({
      id: '',
      employeeId: '',
      name: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      status: ''
    });
    
    onMounted(() => {
      // Format dates for input fields
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };
      
      formData.value = {
        ...props.leave,
        startDate: formatDate(props.leave.startDate),
        endDate: formatDate(props.leave.endDate)
      };
    });
    
    const submitForm = () => {
      // Validate dates
      const startDate = new Date(formData.value.startDate);
      const endDate = new Date(formData.value.endDate);
      
      if (endDate < startDate) {
        alert('End date cannot be before start date');
        return;
      }
      
      emit('update', formData.value);
    };
    
    return {
      formData,
      submitForm
    };
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: modal-appear 0.3s ease;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid var(--dhl-border);
}

.modal-title {
  margin: 0;
  color: var(--dhl-red);
  font-size: 1.25rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--dhl-border);
  margin-top: 1rem;
}
</style>