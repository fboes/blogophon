#!/usr/bin/env node
'use strict';

var application = require('./src/helpers/application')();
application.changeDirectory();

var Generator   = require('./src/generator');
var args        = require('./src/helpers/arguments')();
var config      = require('./src/config');

if (args.help) {
  console.log('Usage:');
  console.log('  node generate.js [options]');
  console.log('Options:');
  console.log('  --force         Generate all articles anew, even if they have not changed');
  console.log('  --no-images     Do not generate images');
  console.log('  --deploy        Execute shell command `deployCmd` from file `user/config.json`');
  console.log('  --publish       Same as `--deploy`');
  console.log('  --help          Display this help and exit');
  process.exit(0);
} else if (args.log) {
  console.log('---- ' + new Date() + ' -----');
}

var generator = Generator(config);
generator
  .getArticles()
  .then(function () {
    generator
      .buildAll(args.force, args.noimages)
      .then(function() {
        if(args.deploy || args.publish) {
          generator.deploy();
        } else {
          console.log('Done');
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
