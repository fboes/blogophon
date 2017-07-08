#!/usr/bin/env node
'use strict';

var application = require('./src/helpers/application')();
application.changeDirectory();

var Generator   = require('./src/generator');
var args        = require('./src/helpers/arguments')();
var config      = require('./src/config');

if (args.help) {
  console.log('Usage: node generate.js [OPTIONS]');
  console.log('Generate Blogophon articles in current directory.');
  console.log('');
  console.log('Options:');
  console.log('  -f, --force                Generate all articles anew, even if they have not changed');
  console.log('  -I, --no-images            Do not generate images');
  console.log('  -d, --deploy               Execute shell command `deployCmd` from file `user/config.json`');
  console.log('      --publish              Same as `--deploy`');
  console.log('      --help                 Display this help and exit');
  console.log('      --log                  Add header to output usable for logging');
  process.exit(0);
} else if (args.log) {
  console.log('---- ' + new Date() + ' -----');
}

var generator = Generator(config);
generator
  .getArticles()
  .then(function() {
    return generator.buildAll(args.force || args.f, args.noimages || args.I);
  })
  .then(function() {
    if(args.deploy || args.d || args.publish) {
      generator.deploy();
    } else {
      console.log('Done');
    }
  })
  .catch(function(err) {
    console.error(err); process.exit(1);
  })
;
