const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/complaints/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get all complaints (admin/staff only)
router.get('/', auth, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { category, priority, status, department, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (department) query.department = department;

    const complaints = await Complaint.find(query)
      .populate('complainant', 'name email department')
      .populate('assignedTo', 'name email')
      .populate('resolution.resolvedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get complaint by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('complainant', 'name email department')
      .populate('assignedTo', 'name email')
      .populate('resolution.resolvedBy', 'name email')
      .populate('updates.updatedBy', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check access permissions
    const hasAccess = req.user.role === 'admin' ||
                     complaint.complainant._id.toString() === req.user.id ||
                     (complaint.assignedTo && complaint.assignedTo._id.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create complaint
router.post('/', auth, upload.array('attachments', 5), [
  body('title').notEmpty().withMessage('Complaint title is required'),
  body('description').notEmpty().withMessage('Complaint description is required'),
  body('category').isIn(['academic', 'infrastructure', 'food', 'transport', 'hostel', 'library', 'harassment', 'other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, priority, location, department, isAnonymous } = req.body;

    // Process file attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size
    })) : [];

    const complaint = new Complaint({
      title,
      description,
      category,
      priority: priority || 'medium',
      complainant: req.user.id,
      location,
      department: department || req.user.department,
      isAnonymous: isAnonymous === 'true',
      attachments
    });

    await complaint.save();
    
    if (!complaint.isAnonymous) {
      await complaint.populate('complainant', 'name email department');
    }

    res.status(201).json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update complaint (admin/assigned staff only)
router.put('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check permissions
    const canUpdate = req.user.role === 'admin' ||
                     (complaint.assignedTo && complaint.assignedTo.toString() === req.user.id);

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, priority, assignedTo, department } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (department) updateData.department = department;

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('complainant', 'name email department')
    .populate('assignedTo', 'name email');

    res.json(updatedComplaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add update to complaint
router.post('/:id/updates', auth, authorize('admin', 'teacher'), [
  body('message').notEmpty().withMessage('Update message is required')
], async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const { message } = req.body;
    
    const update = {
      message,
      updatedBy: req.user.id,
      updatedAt: new Date()
    };

    complaint.updates.push(update);
    await complaint.save();

    await complaint.populate('updates.updatedBy', 'name email');
    res.json({ message: 'Update added successfully', update });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resolve complaint
router.post('/:id/resolve', auth, authorize('admin', 'teacher'), [
  body('message').notEmpty().withMessage('Resolution message is required')
], async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const { message } = req.body;
    
    complaint.status = 'resolved';
    complaint.resolution = {
      message,
      resolvedBy: req.user.id,
      resolvedAt: new Date()
    };

    await complaint.save();
    await complaint.populate('resolution.resolvedBy', 'name email');

    res.json({ message: 'Complaint resolved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit feedback on resolved complaint
router.post('/:id/feedback', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('message').optional().notEmpty().withMessage('Feedback message cannot be empty')
], async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user is the complainant
    if (complaint.complainant.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (complaint.status !== 'resolved') {
      return res.status(400).json({ message: 'Can only provide feedback on resolved complaints' });
    }

    if (complaint.feedback.rating) {
      return res.status(400).json({ message: 'Feedback already submitted' });
    }

    const { rating, message } = req.body;
    
    complaint.feedback = {
      rating,
      message: message || '',
      submittedAt: new Date()
    };

    await complaint.save();
    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my complaints
router.get('/my/complaints', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ complainant: req.user.id })
      .populate('assignedTo', 'name email')
      .populate('resolution.resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assigned complaints (for staff)
router.get('/assigned/me', auth, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedTo: req.user.id })
      .populate('complainant', 'name email department')
      .sort({ priority: -1, createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get complaint statistics
router.get('/stats/overview', auth, authorize('admin'), async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: null,
          totalComplaints: { $sum: 1 },
          submittedComplaints: { $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] } },
          underReviewComplaints: { $sum: { $cond: [{ $eq: ['$status', 'under-review'] }, 1, 0] } },
          inProgressComplaints: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          resolvedComplaints: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          rejectedComplaints: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
        }
      }
    ]);

    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const priorityStats = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      general: stats[0] || {
        totalComplaints: 0,
        submittedComplaints: 0,
        underReviewComplaints: 0,
        inProgressComplaints: 0,
        resolvedComplaints: 0,
        rejectedComplaints: 0
      },
      categories: categoryStats,
      priorities: priorityStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;