/*
 * Function : index.js
 *
 * Description : main route
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
const router = express.Router();
const clientIndex = path.join(__dirname, '../../dist/index.html');

router.get(/.*/, function (req, res, next) {
  res.sendFile(clientIndex, function (err) {
    if (err) {
      next(err);
    }
  });
});

module.exports = router;
