const express = require('express');
// const userController = require('../controller/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/info', authController.protect, authController.info);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/contact', authController.sendMail);

router.all('*', (req, res, next) => {
  res.status(404).json({msg : 'Route Not Found'})
});

module.exports = router;