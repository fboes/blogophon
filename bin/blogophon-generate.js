#!/usr/bin/env node

import application from '../lib/helpers/Application.js';
application.changeDirectory();

import Generator from '../lib/generator.js';
import argsJs from '../lib/helpers/arguments.js';
import configJs from '../lib/config.js';

const args = argsJs();
const config = configJs();

if (args.help) {
  console.log('Usage: node generate.js [OPTIONS]');
  console.log('Generate Blogophon articles in current directory.');
  console.log('For more information see https://github.com/fboes/blogophon/.');
  console.log('');
  console.log('Options:');
  console.log('  -f, --force                Generate all articles anew, even if they have not changed');
  console.log('  -I, --no-images            Do not generate images');
  console.log('  -d, --deploy               Execute shell command `deployCmd` from file `user/config.json`');
  console.log('      --publish              Same as `--deploy`');
  console.log('      --help                 Display this help and exit');
  console.log('      --version              Show version info');
  console.log('      --log                  Add header to output usable for logging');
  process.exit(0);
} else if (args.log) {
  console.log('---- ' + new Date() + ' -----');
} else if(args.version) {
  console.log(require('../lib/config')().generatorVersion);
  process.exit(0);
}

const generator = Generator(config);
generator
  .getArticles()
  .then(() => {
    return generator.buildAll(args.force || args.f, args.noimages || args.I);
  })
  .then(() => {
    if(args.deploy || args.d || args.publish) {
      generator.deploy();
    } else {
      console.log('Done');
    }
  })
  .catch((err) => {
    console.error(err); process.exit(1);
  })
;
