const Exam = require('../models/examModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Create exam with given information
exports.createExam = catchAsync(async (req, res) => {
  const exam = await Exam.create({
    examCode: Math.random().toString(36).slice(-5).toUpperCase(),
    creator: req.user._id,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    questions: req.body.questions
  });

  res.status(200).json({
    status: 'success',
    message: 'Exam created successfully',
    data: {
      examCode: exam.examCode,
    }
  });
});

exports.getExam = catchAsync(async (req, res, next) => {
  // Check if exam exists
  const exam = await Exam.findOne({examCode : req.params.examCode});
  if(!exam) return res.status(404).json({ status: 'fail', message: 'Exam not found'});

  // Check if exam already ended or not started yet
  const examStartTime = new Date(exam.startTime).getTime();
  const examEndTime = new Date(exam.endTime).getTime();
  const currTime = Date.now();

  if(examStartTime > currTime || currTime >= examEndTime) return res.status(404).json({ status: 'fail',
    message: examStartTime > currTime ? 'Exam not started yet' : 'Exam is already finished',
  });

  res.status(200).json({
    status: 'success',
    data: exam
  })
});

// Get all the exams created by current user(teacher) till now
exports.getExams = catchAsync(async (req, res, next) => {
  const data = await Exam.find({creator : req.user._id}).select('-_id -__v');
  if(!data.length) return next(new AppError('User has not created any exam yet', 404));

  res.status(200).json({
    status: 'success',
    data: data
  })
});