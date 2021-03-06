import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { json, urlencoded } from 'express';
import logger from '../logger.js';
import config from '../config.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {initializeCache} from '../cache.js';
import {initializeData, setDbContext} from '../dbcontext.js';

const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');

const app = express();
app.config = config;

//using the logger and its configured transports, to save the logs created by Morgan
const logStream = {
  write: (text) => {
    logger.info(text);
  }
}
app.log = logger;
app.use(morgan('tiny', { stream: logStream }));

app.log.debug(JSON.stringify(process.env, null,2));
app.cache = initializeCache(app);
app.db = initializeData(app);

function customHeaders( _req, res, next ){
  // Switch off the default 'X-Powered-By: Express' header
  app.disable( 'x-powered-by' );

  // OR set your own header here
  res.setHeader( 'X-Powered-By', 'PS Engineering' );

  // .. other headers here

  next();
}

app.use( customHeaders );
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'","'unsafe-inline'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
      imgSrc: ["'self'", 'https://storage.googleapis.com', 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  }
}));

app.use(json()); // for parsing application/json
app.use(urlencoded({ extended: true }));
app.use(cookieParser(config.cookieSecret));


import {getAuthRouter} from './auth';
app.use(getAuthRouter(app));
app.use(setDbContext);

app.get('/ping', function(_req,res){
  res.status(200).send('pong');
})

import usersApiRouter from '../api/users';
app.use('/api/users', usersApiRouter);


export default app;
