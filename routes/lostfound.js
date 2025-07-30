const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const LostFound = require('../models/LostFound');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/lostfound/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// Get all lost and found items
router.get('/', auth, async (req, res) => {
  try {
    const { type, category, location, search, page = 1, limit = 12 } = req.query;
    const query = { isActive: true, status: 'active' };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const items = await LostFound.find(query)
      .populate('reporter', 'name email department')
      .populate('claims.claimant', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await LostFound.countDocuments(query);

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get item by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id)
      .populate('reporter', 'name email department phone')
      .populate('claims.claimant', 'name email')
      .populate('resolvedWith', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create lost/found item
router.post('/', auth, upload.array('images', 5), [
  body('title').notEmpty().withMessage('Item title is required'),
  body('description').notEmpty().withMessage('Item description is required'),
  body('type').isIn(['lost', 'found']).withMessage('Type must be lost or found'),
  body('category').isIn(['electronics', 'documents', 'keys', 'jewelry', 'clothing', 'books', 'bags', 'other']).withMessage('Invalid category'),
  body('location').notEmpty().withMessage('Location is required'),
  body('dateOccurred').isISO8601().withMessage('Valid date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, type, category, location, dateOccurred, contactInfo, tags } = req.body;

    // Process image uploads
    const images = req.files ? req.files.map(file => `/uploads/lostfound/${file.filename}`) : [];

    const item = new LostFound({
      title,
      description,
      type,
      category,
      location,
      dateOccurred,
      reporter: req.user.id,
      images,
      contactInfo: {
        email: contactInfo?.email || req.user.email,
        phone: contactInfo?.phone || req.user.phone
      },
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await item.save();
    await item.populate('reporter', 'name email department');

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update lost/found item
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the reporter or admin
    if (item.reporter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, location, contactInfo, tags, status } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (location) updateData.location = location;
    if (contactInfo) updateData.contactInfo = contactInfo;
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
    if (status) updateData.status = status;

    const updatedItem = await LostFound.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('reporter', 'name email department');

    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete lost/found item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the reporter or admin
    if (item.reporter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await LostFound.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Claim item
router.post('/:id/claim', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const item = await LostFound.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.reporter.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot claim your own item' });
    }

    if (item.status !== 'active') {
      return res.status(400).json({ message: 'Item is no longer active' });
    }

    // Check if already claimed
    const alreadyClaimed = item.claims.some(
      claim => claim.claimant.toString() === req.user.id
    );

    if (alreadyClaimed) {
      return res.status(400).json({ message: 'Already submitted a claim for this item' });
    }

    item.claims.push({
      claimant: req.user.id,
      message: message || ''
    });

    await item.save();
    res.json({ message: 'Claim submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject claim
router.put('/:id/claims/:claimId', auth, async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const item = await LostFound.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the reporter or admin
    if (item.reporter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const claim = item.claims.id(req.params.claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    if (action === 'approve') {
      claim.status = 'approved';
      item.status = 'resolved';
      item.resolvedWith = claim.claimant;
      item.resolvedAt = new Date();
      
      // Reject all other claims
      item.claims.forEach(c => {
        if (c._id.toString() !== claim._id.toString()) {
          c.status = 'rejected';
        }
      });
    } else if (action === 'reject') {
      claim.status = 'rejected';
    }

    await item.save();
    res.json({ message: `Claim ${action}ed successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my items
router.get('/my/items', auth, async (req, res) => {
  try {
    const items = await LostFound.find({ reporter: req.user.id, isActive: true })
      .populate('claims.claimant', 'name email')
      .populate('resolvedWith', 'name email')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my claims
router.get('/my/claims', auth, async (req, res) => {
  try {
    const items = await LostFound.find({
      'claims.claimant': req.user.id,
      isActive: true
    })
    .populate('reporter', 'name email department')
    .sort({ createdAt: -1 });

    const myClaims = items.map(item => {
      const claim = item.claims.find(
        c => c.claimant.toString() === req.user.id
      );
      return {
        item: {
          _id: item._id,
          title: item.title,
          type: item.type,
          category: item.category,
          location: item.location,
          reporter: item.reporter,
          status: item.status
        },
        claim
      };
    });

    res.json(myClaims);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent items
router.get('/recent', auth, async (req, res) => {
  try {
    const items = await LostFound.find({
      isActive: true,
      status: 'active'
    })
    .populate('reporter', 'name email department')
    .sort({ createdAt: -1 })
    .limit(10);

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await LostFound.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          lostItems: { $sum: { $cond: [{ $eq: ['$type', 'lost'] }, 1, 0] } },
          foundItems: { $sum: { $cond: [{ $eq: ['$type', 'found'] }, 1, 0] } },
          resolvedItems: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
        }
      }
    ]);

    const categoryStats = await LostFound.aggregate([
      { $match: { isActive: true, status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      general: stats[0] || { totalItems: 0, lostItems: 0, foundItems: 0, resolvedItems: 0 },
      categories: categoryStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;