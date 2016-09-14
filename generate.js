#!/usr/bin/env node
'use strict';

var Generator = require('./src/generator');
var args      = require('./src/helpers/arguments')();
var config    = require('./src/config');

if (args.log) {
  console.log('---- ' + new Date() + ' -----');
}

var generator = new Generator(config);
generator
  .getArticles()
  .then(function () {
    generator
      .buildAll(args.force)
      .then(function() {
        if(args.deploy || args.publish) {
          generator.deploy();
        }
      })
      .catch(function(err) {
        console.error(err); process.exit(1);
      })
    ;
  })
  .catch(function(err) {
    console.error(err); process.exit(1);
  })
;
