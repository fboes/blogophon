#!/usr/bin/env node
'use strict';

var generator = require('./src/generator');
var args      = require('./src/helpers/arguments')();

if (args.log) {
  console.log('---- ' + new Date() + ' -----');
}

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
