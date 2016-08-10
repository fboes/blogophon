#!/usr/bin/env node
'use strict';

var config       = require('./lib/config');
var inquirer     = require('inquirer');
var fs           = require('fs-extra');
var Mustache     = require('mustache');
var shell        = require('shelljs');
var toolshed     = require('./lib/js-toolshed/src/js-toolshed');

var template     = fs.readFileSync(config.directories.theme+'/post.md', 'utf8');
var questions    = [
  {
    type: 'input',
    name: 'title',
    message: 'Title',
    validate: function(v) {
      return (v.trim().length > 2) || 'This title is way too short.';
    },
    filter: function(v) {
      return v.trim();
    }
  },{
    type: 'input',
    name: 'keywords',
    message: 'Keywords, comma-separated',
    default: '',
    filter: function(v) {
      return v.trim();
    }
  },{
    type: 'input',
    name: 'lead',
    message: 'Lead / teaser text',
    default: ''
  },{
    type: 'input',
    name: 'mainText',
    message: 'Main text',
    default: 'Lorem ipsum…'
  }
];
inquirer.prompt(questions).then(function (answers) {
  var filename = config.directories.data + '/' + answers.title.asciify();
  if (!fs.existsSync(filename + '.md')) {
    fs.writeFile(filename + '.md', Mustache.render(template, {
      title: answers.title,
      keywords: answers.keywords,
      lead: answers.lead,
      mainText: answers.mainText,
      date: new Date()
    }),function() {
      console.log( filename + '.md created');
      shell.mkdir('-p', filename);
    });
  } else {
    console.log("File " + filename + '.md already exists');
    process.exit(1);
  }
});
