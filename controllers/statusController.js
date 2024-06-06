const catchAsync = require('../utils/catchAsync');
const Status = require('../models/statusModel');
const Result = require('../models/resultModel');
const Exam = require('../models/examModel');
const AppError = require('../utils/AppError');

// Get all the logs of given exam
exports.getAllStatusByExamCode = catchAsync(async (req, res, next) => {
  const status = await Status.find({examCode : req.params.examCode}).select('-_id -examCode -__v');
  if(!status.length) return next(new AppError('Either exam code is wrong or exam has not been started yet', 404));

  res.status(200).json({
    status: 'success',
    data: status
  })
});

// Get all the previous records of given student
exports.getAllStatusByStudent = catchAsync(async (req, res, next) => {
  const status = await Status.find({studentEmail : req.params.studentEmail});
  if(!status.length) return next(new AppError('There are no records found of this student', 404));

  res.status(200).json({
    status: 'success',
    data: status
  })
});

exports.createStatus = catchAsync(async (req, res) => {
  // Check if exam exists
  const exam = await Exam.findOne({examCode: req.body.examCode});
  if(!exam) return res.status(404).json({ status: 'fail', message: 'Exam not found'});

  // Check if exam is already ended or not started yet
  const examStartTime = new Date(exam.startTime).getTime();
  const examEndTime = new Date(exam.endTime).getTime();
  const currTime = Date.now();

  if(examStartTime > currTime || currTime >= examEndTime) return res.status(404).json({ status: 'fail',
    message: examStartTime > currTime ? 'Exam not started yet' : 'Exam is already finished',
  });

  const data = await Status.create({
    ...req.body,
    id: req.body.examCode+req.user.email,
    studentName: req.user.name,
    studentEmail: req.user.email
  });

  res.status(200).json({
    status: 'success',
    msg: 'Status created successfully',
    data: data
  })
});

exports.updateStatus = catchAsync(async (req, res, next) => {
  // Check if result already submitted for this examCode+studentEmail (if he gave the exam)
  const isAlreadySubmitted = await Result.findOne({id : req.body.examCode+req.user.email});
  if(isAlreadySubmitted) return next(new AppError('Exam already submitted for this exam', 400));

  let data = await Status.findOne({id: req.body.examCode+req.user.email});
  if(!data) return next(new AppError('Exam code is invalid OR student has no record for this exam'));

  // Allow values to be incremented only 
  data = await Status.findOneAndUpdate({id: req.body.examCode+req.user.email}, {
    tabSwitchCount: req.body.tabSwitchCount ? data.tabSwitchCount+1 : data.tabSwitchCount,
    keyPressCount: req.body.keyPressCount ? data.keyPressCount+1 : data.keyPressCount,
    mobileFound: req.body.mobileFound ? true : data.mobileFound,
    prohibitedObjectFound: req.body.prohibitedObjectFound ? true : data.prohibitedObjectFound,
    faceNotVisible: req.body.faceNotVisible ? true : data.faceNotVisible,
    multipleFaceFound: req.body.multipleFaceFound ? true : data.multipleFaceFound,
    id: req.body.examCode+req.user.email,
    studentName: req.user.name,
    studentEmail: req.user.email
  }, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    msg: 'Status updated successfully',
    data: data
  })
});