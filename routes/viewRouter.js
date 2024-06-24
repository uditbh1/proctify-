const express = require('express');
const {viewAuthHandler, protectView} = require('../controllers/authController');
const {render, protectExam, dashBoardRendering,protectMobileExam} = require('../controllers/viewController');
const Router = express.Router();

const handleLandingPage = (req, res) =>  res.status(200).render('landing', {loggedIn : req.cookies?.JWT});

Router.get('/exam/:examCode', protectView, protectExam, (_, res) => render(res, 'exam'));
Router.get('/mobilecam/exam/:examCode', protectView, protectMobileExam, (_, res) => render(res, 'mobileCamExam'));
Router.get('/dashboard', protectView, dashBoardRendering);
Router.get('/login', viewAuthHandler, (_, res) => render(res, 'login'));
Router.get('/signup', viewAuthHandler, (_, res) => render(res, 'signup'));
Router.get('/', handleLandingPage);

Router.all('*', (req, res) =>
  res.status(404).render('error', {
    loggedIn : req.cookies?.JWT,
    errorCode: 404,
    errorString: '404 Page Not Found'
  })
);

module.exports = Router;