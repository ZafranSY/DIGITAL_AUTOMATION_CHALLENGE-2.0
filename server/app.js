// server/app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

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
    required: true
  },
  name: {
    type: String,
    required: true
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
  createdAt: {
    type: Date,
    default: Date.now
  }
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
    // Check for duplicate leave application
    const { employeeId, startDate, endDate } = req.body;
    
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
    
    const newLeave = new Leave(req.body);
    const savedLeave = await newLeave.save();
    res.status(201).json(savedLeave);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update leave
app.put('/api/leaves/:id', async (req, res) => {
  try {
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
app.get('/api/leaves/search', async (req, res) => {
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
        // Check for duplicate leave application
        const { employeeId, startDate, endDate } = leaveRequest;
        
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
        
        const newLeave = new Leave(leaveRequest);
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;