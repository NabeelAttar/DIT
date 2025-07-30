const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/assignments/');
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

// Get all assignments
router.get('/', auth, async (req, res) => {
  try {
    const { course, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };
    
    if (course) query.course = course;

    // Filter assignments based on user role
    if (req.user.role === 'student') {
      // Get courses the student is enrolled in
      const enrolledCourses = req.user.enrolledCourses;
      query.course = { $in: enrolledCourses };
    } else if (req.user.role === 'teacher') {
      // Get courses the teacher is teaching
      const teachingCourses = req.user.teachingCourses;
      query.course = { $in: teachingCourses };
    }

    const assignments = await Assignment.find(query)
      .populate('course', 'title code')
      .populate('teacher', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ dueDate: 1 });

    const total = await Assignment.countDocuments(query);

    res.json({
      assignments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assignment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title code')
      .populate('teacher', 'name email')
      .populate('submissions.student', 'name email studentId');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user has access to this assignment
    const course = await Course.findById(assignment.course._id);
    const hasAccess = req.user.role === 'admin' ||
                     assignment.teacher._id.toString() === req.user.id ||
                     course.students.includes(req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create assignment (teachers only)
router.post('/', auth, authorize('teacher', 'admin'), upload.array('attachments', 5), [
  body('title').notEmpty().withMessage('Assignment title is required'),
  body('description').notEmpty().withMessage('Assignment description is required'),
  body('course').notEmpty().withMessage('Course is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('maxMarks').isInt({ min: 1 }).withMessage('Max marks must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, course, dueDate, maxMarks, instructions, allowLateSubmission } = req.body;

    // Check if the course exists and user is the teacher
    const courseObj = await Course.findById(course);
    if (!courseObj) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (courseObj.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Process file attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size
    })) : [];

    const assignment = new Assignment({
      title,
      description,
      course,
      teacher: req.user.id,
      dueDate,
      maxMarks,
      instructions,
      allowLateSubmission: allowLateSubmission === 'true',
      attachments
    });

    await assignment.save();
    await assignment.populate('course', 'title code');
    await assignment.populate('teacher', 'name email');

    res.status(201).json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit assignment (students only)
router.post('/:id/submit', auth, authorize('student'), upload.array('files', 5), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('course');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student is enrolled in the course
    if (!assignment.course.students.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Check if assignment is past due date
    const now = new Date();
    const isLate = now > assignment.dueDate;
    
    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({ message: 'Assignment submission deadline has passed' });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === req.user.id
    );
    
    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    // Process file uploads
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size
    })) : [];

    const submission = {
      student: req.user.id,
      files,
      description: req.body.description,
      status: isLate ? 'late' : 'submitted'
    };

    assignment.submissions.push(submission);
    await assignment.save();

    res.json({ message: 'Assignment submitted successfully', submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Grade submission (teachers only)
router.put('/:id/submissions/:submissionId/grade', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is the assignment teacher
    if (assignment.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';

    await assignment.save();

    res.json({ message: 'Submission graded successfully', submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my submissions (students only)
router.get('/my/submissions', auth, authorize('student'), async (req, res) => {
  try {
    const assignments = await Assignment.find({
      'submissions.student': req.user.id,
      isActive: true
    })
    .populate('course', 'title code')
    .populate('teacher', 'name email');

    const mySubmissions = assignments.map(assignment => {
      const submission = assignment.submissions.find(
        sub => sub.student.toString() === req.user.id
      );
      return {
        assignment: {
          _id: assignment._id,
          title: assignment.title,
          course: assignment.course,
          teacher: assignment.teacher,
          dueDate: assignment.dueDate,
          maxMarks: assignment.maxMarks
        },
        submission
      };
    });

    res.json(mySubmissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update assignment (teachers only)
router.put('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is the assignment teacher
    if (assignment.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, dueDate, maxMarks, instructions, allowLateSubmission, isActive } = req.body;
    
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { title, description, dueDate, maxMarks, instructions, allowLateSubmission, isActive },
      { new: true }
    ).populate('course', 'title code').populate('teacher', 'name email');

    res.json(updatedAssignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;