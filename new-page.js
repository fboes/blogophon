#!/usr/bin/env node
'use strict';

var config       = require('./lib/config');
var inquirer     = require('inquirer');
var fs           = require('fs-extra');
var Mustache     = require('mustache');
var shell        = require('shelljs');
var toolshed     = require('./lib/js-toolshed/src/js-toolshed');

var filenameFromTitle = function (title) {
  return config.directories.data + '/' + title.trim().asciify();
};
var template     = fs.readFileSync(config.directories.theme+'/post.md', 'utf8');
var questions    = [
  {
    type: 'input',
    name: 'title',
    message: 'Title',
    validate: function(v) {
      if (v.trim().length <= 2) {
        return 'This title is way too short.';
      }
      var filename = filenameFromTitle(v);
      if (fs.existsSync(filename + '.md')) {
        return ("File " + filename + '.md already exists');
      }
      return true;
    },
    filter: function(v) {
      return v.trim();
    }
  },{
    type: 'list',
    name: 'classes',
    message: 'Type of article',
    choices: ['Normal article', 'Images', 'Video'],
    default: 'Normal article',
    filter: function(v) {
      return (v === 'Normal article') ? null : v;
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
inquirer.prompt(questions).then(
  function (answers) {
    var filename = filenameFromTitle(answers.title);
    fs.writeFile(filename + '.md', Mustache.render(template, {
      title: answers.title,
      keywords: answers.keywords,
      classes: answers.classes,
      lead: answers.lead,
      mainText: answers.mainText,
      date: new Date()
    }), function(err) {
      if (err) {
        console.error( filename + '.md could not be written');
      } else {
        console.log( filename + '.md created');
        shell.mkdir('-p', filename);
      }
    });
  },
  function(err) { console.log(err); }
);
