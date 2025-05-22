// server/app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import utilities
const { isValidDateRange, calculateDays } = require('./utils/dateUtils');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leave-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define Leave Schema
const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  leaveType: {
    type: String,
    enum: ['Annual', 'Sick', 'Emergency'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  days: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add pre-save middleware to calculate days
leaveSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    this.days = calculateDays(this.startDate, this.endDate);
  }
  next();
});

// Create Leave model
const Leave = mongoose.model('Leave', leaveSchema);

// API Routes

// Get all leaves
app.get('/api/leaves', async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leave by ID
app.get('/api/leaves/:id', async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new leave
app.post('/api/leaves', async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.body;
    
    // Validate date range
    if (!isValidDateRange(startDate, endDate)) {
      return res.status(400).json({ message: 'End date must be after or equal to start date' });
    }
    
    // Convert string dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if there's already a leave application for this employee in this date range
    const existingLeave = await Leave.findOne({
      employeeId,
      $or: [
        // Check if the new leave overlaps with any existing leave
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });
    
    if (existingLeave) {
      return res.status(400).json({ 
        message: 'Duplicate leave application. Employee already has leave during this period.' 
      });
    }
    
    // Calculate number of days
    const days = calculateDays(startDate, endDate);
    
    const newLeave = new Leave({
      ...req.body,
      days
    });
    
    const savedLeave = await newLeave.save();
    res.status(201).json(savedLeave);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update leave
app.put('/api/leaves/:id', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    // Validate date range if both dates are provided
    if (startDate && endDate && !isValidDateRange(startDate, endDate)) {
      return res.status(400).json({ message: 'End date must be after or equal to start date' });
    }
    
    // If dates are provided, calculate days
    if (startDate && endDate) {
      req.body.days = calculateDays(startDate, endDate);
    }
    
    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedLeave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    
    res.json(updatedLeave);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete leave
app.delete('/api/leaves/:id', async (req, res) => {
  try {
    const deletedLeave = await Leave.findByIdAndDelete(req.params.id);
    
    if (!deletedLeave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    
    res.json({ message: 'Leave deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search leaves by employee ID and date range
app.get('/api/search', async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    
    let query = {};
    
    if (employeeId) {
      query.employeeId = { $regex: employeeId, $options: 'i' };
    }
    
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }
    
    const leaves = await Leave.find(query).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for UiPath RPA integration
app.post('/api/leaves/batch', async (req, res) => {
  try {
    const leaveRequests = req.body;
    const results = {
      success: [],
      failures: []
    };
    
    // Process each leave request
    for (const leaveRequest of leaveRequests) {
      try {
        const { employeeId, startDate, endDate } = leaveRequest;
        
        // Validate date range
        if (!isValidDateRange(startDate, endDate)) {
          results.failures.push({
            data: leaveRequest,
            error: 'End date must be after or equal to start date'
          });
          continue;
        }
        
        // Convert string dates to Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Check if there's already a leave application for this employee in this date range
        const existingLeave = await Leave.findOne({
          employeeId,
          $or: [
            // Check if the new leave overlaps with any existing leave
            {
              startDate: { $lte: end },
              endDate: { $gte: start }
            }
          ]
        });
        
        if (existingLeave) {
          results.failures.push({
            data: leaveRequest,
            error: 'Duplicate leave application'
          });
          continue;
        }
        
        // Calculate number of days
        const days = calculateDays(startDate, endDate);
        
        const newLeave = new Leave({
          ...leaveRequest,
          days
        });
        
        const savedLeave = await newLeave.save();
        results.success.push(savedLeave);
      } catch (error) {
        results.failures.push({
          data: leaveRequest,
          error: error.message
        });
      }
    }
    
    res.status(200).json({
      message: 'Batch processing completed',
      successCount: results.success.length,
      failureCount: results.failures.length,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leave statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalLeaves = await Leave.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });
    const rejectedLeaves = await Leave.countDocuments({ status: 'Rejected' });
    
    // Get leaves by type
    const annualLeaves = await Leave.countDocuments({ leaveType: 'Annual' });
    const sickLeaves = await Leave.countDocuments({ leaveType: 'Sick' });
    const emergencyLeaves = await Leave.countDocuments({ leaveType: 'Emergency' });
    
    res.json({
      total: totalLeaves,
      byStatus: {
        pending: pendingLeaves,
        approved: approvedLeaves,
        rejected: rejectedLeaves
      },
      byType: {
        annual: annualLeaves,
        sick: sickLeaves,
        emergency: emergencyLeaves
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employee leave summary
app.get('/api/employees/:employeeId/summary', async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const leaves = await Leave.find({ employeeId });
    
    if (leaves.length === 0) {
      return res.status(404).json({ message: 'No leave records found for this employee' });
    }
    
    // Calculate total days by leave type
    const totalDays = leaves.reduce((acc, leave) => acc + leave.days, 0);
    const annualDays = leaves
      .filter(leave => leave.leaveType === 'Annual')
      .reduce((acc, leave) => acc + leave.days, 0);
    const sickDays = leaves
      .filter(leave => leave.leaveType === 'Sick')
      .reduce((acc, leave) => acc + leave.days, 0);
    const emergencyDays = leaves
      .filter(leave => leave.leaveType === 'Emergency')
      .reduce((acc, leave) => acc + leave.days, 0);
    
    // Get the employee name from the most recent record
    const employeeName = leaves[0].name;
    
    res.json({
      employeeId,
      name: employeeName,
      totalLeaves: leaves.length,
      totalDays,
      byType: {
        annual: annualDays,
        sick: sickDays,
        emergency: emergencyDays
      },
      recentLeaves: leaves.slice(0, 5) // Return 5 most recent leaves
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('public'));
  
  // Any route that is not an API route should serve the index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
    }
  });
}

// Import error handler middleware
const errorHandler = require('./middleware/error');
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;