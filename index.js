#!/usr/bin/env node
'use strict';

var Generator = require('./src/generator');

var deploy = (process.argv[2] !== undefined && process.argv[2].match(/(^|\s)--deploy(\s|$)/));
var force  = (process.argv[2] !== undefined && process.argv[2].match(/(^|\s)--force(\s|$)/));

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
