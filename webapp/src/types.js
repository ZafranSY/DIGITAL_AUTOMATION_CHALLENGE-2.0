/**
 * @typedef {Object} LeaveApplication
 * @property {string} id
 * @property {string} employeeId
 * @property {string} name
 * @property {'Annual'|'Sick'|'Emergency'} leaveType
 * @property {string} startDate
 * @property {string} endDate
 * @property {'Pending'|'Approved'|'Rejected'} status
 */

export const LeaveTypes = {
  ANNUAL: 'Annual',
  SICK: 'Sick',
  EMERGENCY: 'Emergency'
}

export const StatusTypes = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
}