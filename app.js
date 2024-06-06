const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const rateLimit = require('express-rate-limit');

// Setting up environment variables for development purpose
dotenv.config({path : './config.env'});

// Local Modules
const globalErrorHandler = require('./utils/globalErrorHandler');
const apiRouter = require('./routes/apiRouter');
const viewRouter = require('./routes/viewRouter');

// Rate limiter
const limiter = rateLimit({
  max: 10, // 10 requests per 3 seconds
  windowMs: 3000,
  message: 'Too many requests',
});

const app = express();

// *********************
//  *** MIDDLEWARES ***
// *********************

app.use(cookieParser());
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, './public')));

// Rate limiting on /api route
app.use('/api', limiter);

// Get data in req.body with data limit
app.use(express.json({ limit: '5kb' }));

// ****************
//  *** Routes ***
// ****************
app.use('/api', apiRouter);
app.use('/', viewRouter);

// Global error handler middleware 
app.use(globalErrorHandler); 

// ****************
//  *** Server and Database ***
// ****************
mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log('Database connected');
});

app.listen(process.env.PORT || 8000, () => {
  console.log('listening on port');
});
