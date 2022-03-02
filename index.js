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
const exphbs = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('./app/globals/constants');

// Middle-ware
const compression = require('compression');
const minify = require('express-minify');

app.disable('x-powered-by');

app.use(compression());
app.use(minify());
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/public')));

const routeIndex = require('./app/routes');

// Set view engine ( hbs : handlebars )
app.set('trust proxy', 'loopback');
app.engine('.hbs', exphbs.engine({
  defaultLayout: 'default',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'app/views/layouts')
}));
app.set('view engine', '.hbs');
app.set('views', __dirname + '/app/views');

// Set pre route
require('./app/globals/pre-route')(app);

// Set routes
app.use('/', routeIndex);

// Set post route
require('./app/globals/post-route')(app);


module.exports = app;
