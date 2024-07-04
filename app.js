const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const rateLimit = require('express-rate-limit');

// Setting up environment variables for development purpose
dotenv.config({ path: './config.env' });

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

// CORS
const cors = require('cors');

// Add CORS middleware
app.use(cors({
  // origin: 'http://172.26.101.10:8000', // Replace this with the actual origin or use a function to dynamically set it
  // origin:'http://172.26.83.75:8000',   //pc
  origin:'*',   //pc
  credentials: true // Allow credentials (cookies)
}));

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

// Route to handle logging errors
app.post('/log-error', (req, res) => {
  console.error('Client Error:', req.body.error);
  res.sendStatus(200);
});

// Global error handler middleware
app.use(globalErrorHandler);

// ****************
//  *** Server and Database ***
// ****************
mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log('Database connected');
});

// app.listen(process.env.PORT || 8000, () => {
//   console.log('listening on port');
// });

app.listen(process.env.PORT || 8000, '0.0.0.0', () => {
  console.log('listening on port 8000');
});
