#!/usr/bin/env node
'use strict';

var Generator = require('./src/generator');

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

Generator.getArticles().then(
  function () {
    Generator.buildAll(force).then(
      function() {
        if(deploy) {
          Generator.deploy();
        }
      },
      function(err) { console.error(err); process.exit(1); }
    );
  },
  function(err) { console.error(err); process.exit(1); }
);
