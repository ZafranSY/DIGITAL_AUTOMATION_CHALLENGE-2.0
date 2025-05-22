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
    type: Number
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
const Leave = mongoose.model('leaves', leaveSchema);

// API Routes

// Get all leaves
app.get('/api/leaves', async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    // Transform MongoDB _id to id for frontend compatibility
    const transformedLeaves = leaves.map(leave => {
      const leavePlain = leave.toObject();
      leavePlain.id = leavePlain._id.toString();
      return leavePlain;
    });
    res.json(transformedLeaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/leaves/employee/:employeeId', async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    let leaves = await Leave.find({ employeeId }).lean();

    if (leaves.length === 0) {
      return res.status(404).json({ message: `No leave records found for employee ${employeeId}` });
    }

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});
app.put("/api/rejectleaves/:employeeId", async (req, res)=>{
  try {
    const employeeId = req.params.employeeId;
    let leaves = await Leave.findByIdAndUpdate(
      {employeeId},  
      { status: 'Rejected' }, 
      { new: true, runValidators: true })
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
})
app.get('/api/debug/leaves', async (req, res) => {
  try {
    // Get raw data from MongoDB
    const rawData = await mongoose.connection.db.collection('leaves').find({}).toArray();
    console.log('Raw database data:', JSON.stringify(rawData, null, 2));
    
    res.json({
      count: rawData.length,
      data: rawData
    });
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
    const totalDays = leaves.reduce((acc, leave) => acc + (leave.days || 0), 0);
    const annualDays = leaves
      .filter(leave => leave.leaveType === 'Annual')
      .reduce((acc, leave) => acc + (leave.days || 0), 0);
    const sickDays = leaves
      .filter(leave => leave.leaveType === 'Sick')
      .reduce((acc, leave) => acc + (leave.days || 0), 0);
    const emergencyDays = leaves
      .filter(leave => leave.leaveType === 'Emergency')
      .reduce((acc, leave) => acc + (leave.days || 0), 0);
    
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