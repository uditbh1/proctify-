const express = require('express');
const authController = require('../controllers/authController');
const examController = require('../controllers/examController');

const Router = express.Router();

Router.use(authController.protect);
Router.route('/:examCode').get(examController.getExam);

Router.use(authController.restrictTo('teacher'));
Router.route('/').get(examController.getExams).post(examController.createExam);

module.exports = Router;