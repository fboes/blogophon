#!/usr/bin/env node

import application from '../lib/helpers/Application.js';
application.changeDirectory();

import blogophonConsole from '../lib/blogophon-console.js';
import argsJs from '../lib/helpers/arguments.js';

const args = argsJs();
if (args.help) {
  console.log('Usage: node index.js [OPTIONS]');
  console.log('Start interactive Blogophon interface in current directory.');
  console.log('Will setup a new Blogophon instance if there is none in current directory.');
  console.log('For more information see https://github.com/fboes/blogophon/.');
  console.log('');
  console.log('Options:');
  console.log('      --help                 Display this help and exit');
  console.log('      --version              Show version info');
  process.exit(0);
} else if(args.version) {
  console.log(require('../lib/config')().generatorVersion);
  process.exit(0);
}

blogophonConsole().init();
