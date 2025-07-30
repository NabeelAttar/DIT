const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all courses
router.get('/', auth, async (req, res) => {
  try {
    const { department, semester, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };
    
    if (department) query.department = department;
    if (semester) query.semester = semester;

    const courses = await Course.find(query)
      .populate('teacher', 'name email')
      .populate('students', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name email department')
      .populate('students', 'name email studentId');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create course (teachers and admin only)
router.post('/', auth, authorize('teacher', 'admin'), [
  body('title').notEmpty().withMessage('Course title is required'),
  body('code').notEmpty().withMessage('Course code is required'),
  body('description').notEmpty().withMessage('Course description is required'),
  body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('department').notEmpty().withMessage('Department is required'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, code, description, credits, department, semester, schedule, maxStudents, syllabus } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: code.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    const course = new Course({
      title,
      code: code.toUpperCase(),
      description,
      credits,
      department,
      semester,
      teacher: req.user.id,
      schedule,
      maxStudents,
      syllabus
    });

    await course.save();

    // Add course to teacher's teaching courses
    await User.findByIdAndUpdate(req.user.id, {
      $push: { teachingCourses: course._id }
    });

    await course.populate('teacher', 'name email');
    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course (course teacher or admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the course teacher or admin
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, credits, schedule, maxStudents, syllabus, isActive } = req.body;
    
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { title, description, credits, schedule, maxStudents, syllabus, isActive },
      { new: true }
    ).populate('teacher', 'name email');

    res.json(updatedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete course (course teacher or admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the course teacher or admin
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Course.findByIdAndDelete(req.params.id);

    // Remove course from all users
    await User.updateMany(
      { $or: [{ enrolledCourses: req.params.id }, { teachingCourses: req.params.id }] },
      { $pull: { enrolledCourses: req.params.id, teachingCourses: req.params.id } }
    );

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enroll in course (students only)
router.post('/:id/enroll', auth, authorize('student'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.isActive) {
      return res.status(400).json({ message: 'Course is not active' });
    }

    if (course.students.length >= course.maxStudents) {
      return res.status(400).json({ message: 'Course is full' });
    }

    if (course.students.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Add student to course
    await Course.findByIdAndUpdate(req.params.id, {
      $push: { students: req.user.id }
    });

    // Add course to student's enrolled courses
    await User.findByIdAndUpdate(req.user.id, {
      $push: { enrolledCourses: req.params.id }
    });

    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unenroll from course (students only)
router.post('/:id/unenroll', auth, authorize('student'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.students.includes(req.user.id)) {
      return res.status(400).json({ message: 'Not enrolled in this course' });
    }

    // Remove student from course
    await Course.findByIdAndUpdate(req.params.id, {
      $pull: { students: req.user.id }
    });

    // Remove course from student's enrolled courses
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { enrolledCourses: req.params.id }
    });

    res.json({ message: 'Successfully unenrolled from course' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my courses
router.get('/my/courses', auth, async (req, res) => {
  try {
    let courses;
    
    if (req.user.role === 'student') {
      courses = await Course.find({ students: req.user.id, isActive: true })
        .populate('teacher', 'name email');
    } else if (req.user.role === 'teacher') {
      courses = await Course.find({ teacher: req.user.id, isActive: true })
        .populate('students', 'name email studentId');
    } else {
      courses = await Course.find({ isActive: true })
        .populate('teacher', 'name email')
        .populate('students', 'name email studentId');
    }

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add course material (course teacher only)
router.post('/:id/materials', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the course teacher
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, url } = req.body;
    
    const material = {
      title,
      url,
      uploadDate: new Date()
    };

    await Course.findByIdAndUpdate(req.params.id, {
      $push: { materials: material }
    });

    res.json({ message: 'Material added successfully', material });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;