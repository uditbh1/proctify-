const Status = require('../models/statusModel');

const catchAsync = require('../utils/catchAsync');
const Result = require('../models/resultModel');
const Exam = require('../models/examModel');
const AppError = require('../utils/AppError');

exports.createResult = catchAsync(async (req, res, next) => {
  // Check if result already submitted for this examCode+studentEmail (if he gave the exam)
  const isAlreadySubmitted = await Result.findOne({id : req.body.examCode+req.user.email});
  if(isAlreadySubmitted) return next(new AppError('Exam already submitted for this exam', 400));

  // Check if exam exists
  const exam = await Exam.findOne({examCode : req.body.examCode}, {'questions.correctOption': 1}).select('+_id');
  if(!exam) return res.status(404).json({ status: 'fail', message: 'Exam not found'});

  // Check if exam already ended or not started yet
  const examStartTime = new Date(exam.startTime).getTime();
  const examEndTime = new Date(exam.endTime).getTime();
  const currTime = Date.now();

  if(examStartTime > currTime || currTime >= examEndTime) return res.status(404).json({ status: 'fail',
    message: examStartTime > currTime ? 'Exam not started yet' : 'Exam is already finished',
  });

  // *** Calculating result ***

  // Get the correct answers for this exam
  const correctOptions = exam.questions.map(obj => obj.correctOption);
  const chosedOptions = req.body.ans;

  let obtainedMarks = 0;
  let totalMarks = 0;
  for(let i = 0; i < correctOptions.length; i++) {
    totalMarks++;
    if(chosedOptions[i] == correctOptions[i]){
      obtainedMarks++;
    }
  }

  const data = await Result.create({
    id: req.body.examCode+req.user.email,
    exam: exam._id,
    studentEmail: req.user.email,
    totalMarks,
    obtainedMarks
  });

  // Send response
  res.status(200).json({
    status: 'success',
    message: 'Exam submitted successfully',
    data: null
  })
});

// Get result of the given examCode by (current student) or (given student email by teacher)
exports.getResult = catchAsync(async (req, res, next) => {
  const data = await Result.findOne({id: req.params.examCode + (req.user.role=="teacher" ? req.query.email : req.user.email)}).select('studentEmail totalMarks obtainedMarks -_id');
  if(!data) return next(new AppError('Result not found', 404));

  res.status(200).json({
    status: 'success',
    data
  });
});

// Get all the exams submitted by current student
exports.getExams = catchAsync(async (req, res, next) => {
  let data = await Result.find({studentEmail : req.user.email}).populate('exam').select('totalMarks obtainedMarks exam -_id');
  if(!data.length) return next(new AppError('User has not created any exam yet', 404));

  res.status(200).json({
    status: 'success',
    data
  });
});