#!/usr/bin/env node
'use strict';

var config       = require('./src/config');
var inquirer     = require('inquirer');
var fs           = require('fs-extra');
var shell        = require('shelljs');
var glob         = require("glob");

glob(config.directories.data + "/**/*.md", function (err, files) {
  files = files.map(function(v) {
    return v.replace(/^.+\/(.+?)\.md$/,'$1');
  });
  var questions = [
    {
      type: 'list',
      name: 'file',
      message: 'Select file to edit',
      choices: files
    }
  ];
  inquirer.prompt(questions).then(
    function (answers) {
       var cmd = "open " + config.directories.data + '/' + answers.file + ".md";
       console.log(cmd);
       shell.exec(cmd);
    },
    function(err) { console.error(err); }
  );
});
