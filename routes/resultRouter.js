const express = require('express');
const resultController = require('../controllers/resultController');
const authController = require('../controllers/authController');

const Router = express.Router();

Router.use(authController.protect);
Router.get('/:examCode', resultController.getResult);
Router.get('/', resultController.getExams);
Router.post('/', resultController.createResult);

module.exports = Router;