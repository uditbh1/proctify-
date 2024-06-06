const express = require('express');

const userRouter = require('./userRouter');
const examRouter = require('./examRouter');
const statusRouter = require('./statusRouter');
const resultRouter = require('./resultRouter');

const Router = express.Router();

Router.use('/v1/user', userRouter);
Router.use('/v1/exam', examRouter);
Router.use('/v1/status', statusRouter);
Router.use('/v1/result', resultRouter);

module.exports = Router;