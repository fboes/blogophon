#!/usr/bin/env node
'use strict';

var fs     = require('fs-extra');
var pkg    = JSON.parse(fs.readFileSync('./package.json'));
var config = JSON.parse(fs.readFileSync('./user/config.json'));

var Generator = require('./lib/generator');

Generator.init(config, pkg);
Generator.on('articlesBuild', function (post) {
  Generator.buildOtherPages();
  Generator.copyImages();
});

Generator.buildArticles();
