<template>
  <div class="flex items-center gap-2">
    <div class="flex items-center">
      <input 
        type="text" 
        placeholder="Search by Employee ID" 
        class="form-control" 
        v-model="employeeId"
        style="width: 200px;"
      />
    </div>
    <div class="flex items-center gap-2">
      <input 
        type="date" 
        class="form-control" 
        v-model="startDate"
        style="width: 150px;"
      />
      <span>to</span>
      <input 
        type="date" 
        class="form-control" 
        v-model="endDate"
        style="width: 150px;"
      />
      <button class="btn btn-primary" @click="search">Search</button>
      <button class="btn btn-secondary" @click="reset">Reset</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  emits: ['search'],
  setup(props, { emit }) {
    const employeeId = ref('');
    const startDate = ref('');
    const endDate = ref('');

    function search() {
      emit('search', {
        employeeId: employeeId.value,
        startDate: startDate.value,
        endDate: endDate.value
      });
    }
    
    function reset() {
      employeeId.value = '';
      startDate.value = '';
      endDate.value = '';
      emit('search', {
        employeeId: '',
        startDate: '',
        endDate: ''
      });
    }

    return {
      employeeId,
      startDate,
      endDate,
      search,
      reset
    };
  }
};
</script>