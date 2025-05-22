<template>
  <div class="leave-form-container">
    <div class="leave-form">
      <div class="form-header">
        <h3>New Leave Application</h3>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      
      <form @submit.prevent="submitForm">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Employee ID</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="formData.employeeId" 
              placeholder="Enter employee ID"
              required
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Employee Name</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="formData.name" 
              placeholder="Enter employee name"
              required
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Leave Type</label>
            <select class="form-select" v-model="formData.leaveType" required>
              <option value="" disabled>Select leave type</option>
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
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            Submit Application
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'LeaveApplicationForm',
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const formData = ref({
      employeeId: '',
      name: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      status: 'Pending'
    });
    
    const submitForm = () => {
      // Validate dates
      const startDate = new Date(formData.value.startDate);
      const endDate = new Date(formData.value.endDate);
      
      if (endDate < startDate) {
        alert('End date cannot be before start date');
        return;
      }
      
      emit('submit', formData.value);
      
      // Reset form
      formData.value = {
        employeeId: '',
        name: '',
        leaveType: '',
        startDate: '',
        endDate: '',
        status: 'Pending'
      };
    };
    
    return {
      formData,
      submitForm
    };
  }
};
</script>

<style scoped>
.leave-form-container {
  margin-bottom: 2rem;
  animation: form-appear 0.4s ease;
}

@keyframes form-appear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.leave-form {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-top: 4px solid var(--dhl-yellow);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--dhl-border);
}

.form-header h3 {
  margin: 0;
  color: var(--dhl-red);
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-control, .form-select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--dhl-border);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-control:focus, .form-select:focus {
  border-color: var(--dhl-yellow);
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 204, 0, 0.25);
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--dhl-gray);
}
</style>