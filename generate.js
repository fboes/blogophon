#!/usr/bin/env node
'use strict';

var generator = require('./src/generator');

var deploy = false;
var force  = false;
var i;

for (var i = 2; i < process.argv.length; i++) {
  switch (process.argv[i]) {
    case '--force'  : force  = true; break;
    case '--deploy' : deploy = true; break;
    case '--publish': deploy = true; break;
    case '--log'    :
      console.log('---- ' + new Date() + ' -----');
      break;
  }
}

generator
  .getArticles()
  .then(function () {
    generator
      .buildAll(force)
      .then(function() {
        if(deploy) {
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
