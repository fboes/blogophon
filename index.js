#!/usr/bin/env node
'use strict';

var application = require('./src/helpers/application')();
application.changeDirectory();

var blogophonConsole = require('./src/blogophon-console');
var args             = require('./src/helpers/arguments')();

if (args.help) {
  console.log('Usage: node index.js [OPTIONS]');
  console.log('Start interactive Blogophon interface in current directory. Will setup a new Blogophon instance if there is none in current directory.');
  console.log('');
  console.log('Options:');
  console.log('      --help                 Display this help and exit');
  process.exit(0);
}

blogophonConsole().init();
