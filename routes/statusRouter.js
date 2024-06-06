const express = require('express');
const authController = require('../controllers/authController');
const statusController = require('../controllers/statusController');

const Router = express.Router();

Router.use(authController.protect);

Router.route('/exam/:examCode').get(authController.restrictTo('teacher'), statusController.getAllStatusByExamCode);
Router.route('/student/:studentEmail').get(statusController.getAllStatusByStudent);
Router.route('/').post(statusController.createStatus).patch(statusController.updateStatus);

module.exports = Router;