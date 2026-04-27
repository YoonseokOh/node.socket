/*
 * Function : index.js
 *
 * Description : start up
 *
 * Copyright (c) 2017, Yoonseok Oh.
 * Licensed under Yoonseok Oh
 *
 * Email : yoonseok.oh@icloud.com
 *
 */


"use strict";

const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('./app/globals/constants');

// Middle-ware
const compression = require('compression');

app.disable('x-powered-by');

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/dist')));

const routeIndex = require('./app/routes');

app.set('trust proxy', 'loopback');

// Set pre route
require('./app/globals/pre-route')(app);

// Set routes
app.use('/', routeIndex);

// Set post route
require('./app/globals/post-route')(app);


module.exports = app;
