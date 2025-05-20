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
        type="text" 
        placeholder="YYYY-MM-DD" 
        class="form-control" 
        v-model="startDate"
        style="width: 130px;"
      />
      <span>to</span>
      <input 
        type="text" 
        placeholder="YYYY-MM-DD" 
        class="form-control" 
        v-model="endDate"
        style="width: 130px;"
      />
      <button class="btn btn-primary" @click="search">Search</button>
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

    return {
      employeeId,
      startDate,
      endDate,
      search
    };
  }
};
</script>