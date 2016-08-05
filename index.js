#!/usr/bin/env node
'use strict';

var Generator = require('./lib/generator');

Generator.init();
Generator.on('articlesBuild', function (post) {
  Generator.buildOtherPages();
  Generator.copyImages();
});

Generator.buildArticles();
