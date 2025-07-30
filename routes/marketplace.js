const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Marketplace = require('../models/Marketplace');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/marketplace/');
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

// Get all marketplace items
router.get('/', auth, async (req, res) => {
  try {
    const { category, condition, minPrice, maxPrice, search, page = 1, limit = 12 } = req.query;
    const query = { isActive: true, status: 'available' };
    
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const items = await Marketplace.find(query)
      .populate('seller', 'name email department')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Marketplace.countDocuments(query);

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
    const item = await Marketplace.findById(req.params.id)
      .populate('seller', 'name email department phone')
      .populate('interested.user', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Increment view count
    await Marketplace.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create marketplace item
router.post('/', auth, upload.array('images', 5), [
  body('title').notEmpty().withMessage('Item title is required'),
  body('description').notEmpty().withMessage('Item description is required'),
  body('category').isIn(['books', 'electronics', 'furniture', 'clothing', 'food', 'services', 'other']).withMessage('Invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('condition').isIn(['new', 'like-new', 'good', 'fair', 'poor']).withMessage('Invalid condition')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, price, condition, location, contactMethod, tags } = req.body;

    // Process image uploads
    const images = req.files ? req.files.map(file => `/uploads/marketplace/${file.filename}`) : [];

    const item = new Marketplace({
      title,
      description,
      category,
      price: parseFloat(price),
      condition,
      seller: req.user.id,
      images,
      location,
      contactMethod,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await item.save();
    await item.populate('seller', 'name email department');

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update marketplace item
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Marketplace.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the seller
    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, price, condition, location, contactMethod, tags, status } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (condition) updateData.condition = condition;
    if (location) updateData.location = location;
    if (contactMethod) updateData.contactMethod = contactMethod;
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
    if (status) updateData.status = status;

    const updatedItem = await Marketplace.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('seller', 'name email department');

    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete marketplace item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Marketplace.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the seller or admin
    if (item.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Marketplace.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Express interest in item
router.post('/:id/interest', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const item = await Marketplace.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.seller.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot express interest in your own item' });
    }

    if (item.status !== 'available') {
      return res.status(400).json({ message: 'Item is no longer available' });
    }

    // Check if already expressed interest
    const alreadyInterested = item.interested.some(
      interest => interest.user.toString() === req.user.id
    );

    if (alreadyInterested) {
      return res.status(400).json({ message: 'Already expressed interest in this item' });
    }

    item.interested.push({
      user: req.user.id,
      message: message || ''
    });

    await item.save();
    res.json({ message: 'Interest expressed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my items
router.get('/my/items', auth, async (req, res) => {
  try {
    const items = await Marketplace.find({ seller: req.user.id, isActive: true })
      .populate('interested.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my interested items
router.get('/my/interested', auth, async (req, res) => {
  try {
    const items = await Marketplace.find({
      'interested.user': req.user.id,
      isActive: true
    })
    .populate('seller', 'name email department')
    .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark item as sold
router.post('/:id/sold', auth, async (req, res) => {
  try {
    const item = await Marketplace.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the seller
    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    item.status = 'sold';
    await item.save();

    res.json({ message: 'Item marked as sold' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get popular categories
router.get('/stats/categories', auth, async (req, res) => {
  try {
    const categories = await Marketplace.aggregate([
      { $match: { isActive: true, status: 'available' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;