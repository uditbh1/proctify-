const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  id: {
    type: 'String',
    required: true,
    unique: true
  },
  exam: {
    type: mongoose.Schema.ObjectId,
    ref: 'Exam'
  },
  studentEmail: {
    type: 'String',
    required: true
  },
  totalMarks: Number,
  obtainedMarks: Number
});

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;