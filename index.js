#!/usr/bin/env node
'use strict';

var Generator = require('./lib/generator');

Generator
  .getArticles()
  .then(
    function (post) {
      Generator.buildAllPages();
      Generator.copyImages();
    }
  )
;
