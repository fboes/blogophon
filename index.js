#!/usr/bin/env node

var application = require('./src/helpers/application')();
application.changeDirectory();

var blogophonConsole = require('./src/blogophon-console');

blogophonConsole().init();
