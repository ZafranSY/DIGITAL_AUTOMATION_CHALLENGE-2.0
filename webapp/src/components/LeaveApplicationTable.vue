<template>
  <div class="leave-table-container">
    <div v-if="leaves.length === 0" class="no-leaves">
      <div class="empty-state">
        <i class="fas fa-calendar-times"></i>
        <p>No leave applications found</p>
      </div>
    </div>
    
    <div v-else class="table-responsive">
      <table class="leave-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
<tr v-for="leave in leaves" 
    :key="leave.employeeId" 
    :class="'status-' + (leave.status ? leave.status.toLowerCase() : '')">
            <td>{{ leave.employeeId }}</td>
            <td>{{ leave.name }}</td>
            <td>{{ leave.leaveType }}</td>
            <td>{{ formatDate(leave.startDate) }}</td>
            <td>{{ formatDate(leave.endDate) }}</td>
            <td>{{ calculateDuration(leave.startDate, leave.endDate) }} days</td>
            <td>
              <span class="status-badge" :class="'status-' + leave.status">
                {{ leave.status }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="action-btn edit" @click="$emit('edit', leave)" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                
                <div class="status-actions" v-if="leave.status === 'Pending'">
                  <button 
                    class="action-btn approve" 
                    @click="$emit('status-change', leave.employeeId, 'Approved')"
                    title="Approve"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  
                  <button 
                    class="action-btn reject" 
                    @click="$emit('status-change', leave.employeeId, 'Rejected')"
                    title="Reject"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                
                <button class="action-btn delete" @click="$emit('delete', leave.employeeId)" title="Delete">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LeaveApplicationTable',
  props: {
    leaves: {
      type: Array,
      required: true
    }
  },
  emits: ['edit', 'delete', 'status-change'],
  setup() {
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    const calculateDuration = (startDate, endDate) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
      return diffDays;
    };
    
    return {
      formatDate,
      calculateDuration
    };
  }
};
</script>

<style scoped>
.leave-table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.leave-table {
  width: 100%;
  border-collapse: collapse;
}

.leave-table th {
  background-color: var(--dhl-red);
  color: white;
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  white-space: nowrap;
}

.leave-table th:first-child {
  border-top-left-radius: 8px;
}

.leave-table th:last-child {
  border-top-right-radius: 8px;
}

.leave-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--dhl-border);
}

.leave-table tbody tr:hover {
  background-color: rgba(255, 204, 0, 0.05);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-pending {
  background-color: rgba(37, 99, 235, 0.1);
  color: var(--status-pending);
}

.status-approved {
  background-color: rgba(22, 163, 74, 0.1);
  color: var(--status-approved);
}

.status-rejected {
  background-color: rgba(220, 38, 38, 0.1);
  color: var(--status-rejected);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.edit {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.action-btn.edit:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

.action-btn.approve {
  background-color: rgba(22, 163, 74, 0.1);
  color: var(--status-approved);
}

.action-btn.approve:hover {
  background-color: rgba(22, 163, 74, 0.2);
}

.action-btn.reject {
  background-color: rgba(220, 38, 38, 0.1);
  color: var(--status-rejected);
}

.action-btn.reject:hover {
  background-color: rgba(220, 38, 38, 0.2);
}

.action-btn.delete {
  background-color: rgba(220, 38, 38, 0.1);
  color: var(--status-rejected);
}

.action-btn.delete:hover {
  background-color: rgba(220, 38, 38, 0.2);
}

.status-actions {
  display: flex;
  gap: 0.25rem;
}

.no-leaves {
  padding: 3rem 1rem;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #888;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ccc;
}

.empty-state p {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-wrap: wrap;
  }
}
</style>