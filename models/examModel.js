const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  examCode: {
    type: 'String',
    required: true
  },
  creator: mongoose.Schema.ObjectId,
  startTime: {
    type: Date,
    required: [true, 'Exam must have a start time'],
  },
  endTime: {
    type: Date,
    required: [true, 'Exam must have a end time'],
  },
  questions: [
    {
      ques: {
        type: 'String',
        maxlength: 255,
        required: [true, 'Empty question found']
      },
      options: [String],
      correctOption: {
        type: Number,
        select: false,
        required: true,
        min: 1,
        max: 4
      }
    }
  ]
});

module.exports = mongoose.model('Exam', examSchema);