#!/usr/bin/env node
'use strict';

var config       = require('./src/config');
var inquirer     = require('inquirer');
var fs           = require('fs-extra');
var Mustache     = require('mustache');
var shell        = require('shelljs');
var toolshed     = require('./src/js-toolshed/src/js-toolshed');
var chalk        = require('chalk');

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
    type: 'confirm',
    name: 'images',
    message: 'But you do want to use images?',
    default: false,
    when: function (answers) {
      return answers.classes !== 'Images';
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
    type: 'confirm',
    name: 'edit',
    message: 'Open this in editor right away?',
    default: true
  },{
    type: 'input',
    name: 'lead',
    message: 'Lead / teaser text',
    default: '',
    when: function (answers) {
      return !answers.edit;
    }
  },{
    type: 'input',
    name: 'mainText',
    message: 'Main text',
    default: 'Lorem ipsum…',
    when: function (answers) {
      return !answers.edit;
    }
  },{
    type: 'confirm',
    name: 'draft',
    message: 'Is this a draft?',
    default: false
  }
];
inquirer.prompt(questions).then(
  function (answers) {
    var filename = filenameFromTitle(answers.title);
    var markdownFilename = filename + '.md' + (answers.draft ? '~' : '');
    fs.writeFile(markdownFilename, Mustache.render(template, {
      title: answers.title,
      keywords: answers.keywords,
      classes: answers.classes,
      lead: answers.lead || 'Lorem ipsum…',
      mainText: answers.mainText || 'Lorem ipsum…',
      date: new Date()
    }), function(err) {
      if (err) {
        console.error(chalk.red( markdownFilename + ' could not be written' ));
      } else {
        console.log( markdownFilename + ' created');
        var cmd = 'open ' + markdownFilename;
        console.log(chalk.grey(cmd));
        if (answers.edit) {
          shell.exec(cmd);
        }
        if (answers.classes === 'Images' || answers.images) {
          shell.mkdir('-p', filename);
        }
      }
    });
  },
  function(err) { console.log(err); }
);
