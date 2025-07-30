const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    const { category, department, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = { isPublic: true };
    
    if (category) query.category = category;
    if (department) query.department = department;
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email department')
      .populate('attendees.user', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startDate: 1 });

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email department')
      .populate('attendees.user', 'name email studentId');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event
router.post('/', auth, [
  body('title').notEmpty().withMessage('Event title is required'),
  body('description').notEmpty().withMessage('Event description is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('location').notEmpty().withMessage('Event location is required'),
  body('category').isIn(['academic', 'cultural', 'sports', 'workshop', 'seminar', 'social', 'other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      location,
      category,
      department,
      isPublic,
      maxAttendees,
      registrationRequired,
      registrationDeadline,
      image
    } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const event = new Event({
      title,
      description,
      startDate,
      endDate,
      location,
      category,
      organizer: req.user.id,
      department: department || req.user.department,
      isPublic: isPublic !== false,
      maxAttendees,
      registrationRequired: registrationRequired === true,
      registrationDeadline,
      image
    });

    await event.save();
    await event.populate('organizer', 'name email department');

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      location,
      category,
      department,
      isPublic,
      maxAttendees,
      registrationRequired,
      registrationDeadline,
      image,
      status
    } = req.body;

    // Validate dates if provided
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (location) updateData.location = location;
    if (category) updateData.category = category;
    if (department) updateData.department = department;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (maxAttendees) updateData.maxAttendees = maxAttendees;
    if (registrationRequired !== undefined) updateData.registrationRequired = registrationRequired;
    if (registrationDeadline) updateData.registrationDeadline = registrationDeadline;
    if (image) updateData.image = image;
    if (status) updateData.status = status;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('organizer', 'name email department');

    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for event
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.registrationRequired) {
      return res.status(400).json({ message: 'Registration not required for this event' });
    }

    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if already registered
    const alreadyRegistered = event.attendees.some(
      attendee => attendee.user.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    event.attendees.push({ user: req.user.id });
    await event.save();

    res.json({ message: 'Successfully registered for event' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unregister from event
router.post('/:id/unregister', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const attendeeIndex = event.attendees.findIndex(
      attendee => attendee.user.toString() === req.user.id
    );

    if (attendeeIndex === -1) {
      return res.status(400).json({ message: 'Not registered for this event' });
    }

    event.attendees.splice(attendeeIndex, 1);
    await event.save();

    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my events (organized by user)
router.get('/my/organized', auth, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id })
      .populate('attendees.user', 'name email')
      .sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my registered events
router.get('/my/registered', auth, async (req, res) => {
  try {
    const events = await Event.find({ 'attendees.user': req.user.id })
      .populate('organizer', 'name email department')
      .sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming events
router.get('/upcoming', auth, async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.find({
      startDate: { $gt: now },
      isPublic: true,
      status: 'upcoming'
    })
    .populate('organizer', 'name email department')
    .sort({ startDate: 1 })
    .limit(10);

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;