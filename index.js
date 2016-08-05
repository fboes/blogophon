#!/usr/bin/env node
'use strict';

var Generator = require('./lib/generator');

Generator
  .buildArticles
  .then(
    function (post) {
      Generator.buildOtherPages();
      Generator.copyImages();
    }
  )
;
