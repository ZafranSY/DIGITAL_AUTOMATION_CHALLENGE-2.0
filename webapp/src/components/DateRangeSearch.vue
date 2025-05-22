<template>
  <div class="date-range-search">
    <div class="search-fields">
      <div class="form-group">
        <label class="form-label">Employee ID</label>
        <input 
          type="text" 
          class="form-control" 
          placeholder="Enter Employee ID" 
          v-model="employeeId"
        >
      </div>
      
      <div class="form-group">
        <label class="form-label">Start Date</label>
        <input 
          type="date" 
          class="form-control" 
          v-model="startDate"
        >
      </div>
      
      <div class="form-group">
        <label class="form-label">End Date</label>
        <input 
          type="date" 
          class="form-control" 
          v-model="endDate"
        >
      </div>
      
      <div class="search-buttons-container">
        <div class="search-buttons">
          <button class="btn btn-primary search-btn" @click="search">
            <i class="fas fa-search"></i> Search
          </button>
          <button class="btn btn-secondary reset-btn" @click="resetSearch">
            <i class="fas fa-redo"></i> Reset
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'DateRangeSearch',
  emits: ['search'],
  setup(props, { emit }) {
    const employeeId = ref('');
    const startDate = ref('');
    const endDate = ref('');
    
    const search = () => {
      emit('search', {
        employeeId: employeeId.value,
        startDate: startDate.value,
        endDate: endDate.value
      });
    };
    
    const resetSearch = () => {
      employeeId.value = '';
      startDate.value = '';
      endDate.value = '';
      emit('search', {
        employeeId: '',
        startDate: '',
        endDate: ''
      });
    };
    
    return {
      employeeId,
      startDate,
      endDate,
      search,
      resetSearch
    };
  }
};
</script>

<style scoped>
.date-range-search {
  width: 100%;
}

.search-fields {
  display: flex;
  align-items: center; /* Center align all items */
  gap: 1rem;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 150px;
  display: flex;
  flex-direction: column;
}

/* Container to align the buttons with the bottom of the form */
.search-buttons-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* Push buttons to the bottom */
  height: 100%;
}

.search-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.8rem; /* Push buttons to the bottom */
}

/* Match the button styles from the screenshot */
.search-btn {
  background-color: #6366F1; /* Purple color from screenshot */
  border: none;
  padding: 0.6rem 2rem;
  margin: 0 10px;
  height: 40px; /* Set fixed height to match other buttons */
}

.reset-btn {
  background-color: white;
  border: 1px solid #E5E7EB;
  color: #333;
  padding: 0.6rem 2rem;
  height: 40px; /* Set fixed height to match other buttons */
  margin:0 10px;
}

@media (max-width: 768px) {
  .search-fields {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-group {
    width: 100%;
  }
  
  .search-buttons-container {
    width: 100%;
    margin-top: 2rem;
  }
  
  .search-buttons {
    width: 100%;
    justify-content: space-between;
  }
}
</style>