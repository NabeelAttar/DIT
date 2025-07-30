const mongoose = require('mongoose');

const LostFoundSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  category: {
    type: String,
    enum: ['electronics', 'documents', 'keys', 'jewelry', 'clothing', 'books', 'bags', 'other'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  dateOccurred: {
    type: Date,
    required: true
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [String],
  contactInfo: {
    email: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'closed'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  claims: [{
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    claimedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  resolvedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('LostFound', LostFoundSchema);