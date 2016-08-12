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
      message: 'Select filename to delete',
      choices: files
    }
  ];
  inquirer.prompt(questions).then(
    function (answers) {
      fs.remove(config.directories.data + '/' + answers.file + ".md", function (err) {
        if (err) {return console.error(err);}
        console.log("Delete file " + config.directories.data + '/' + answers.file + ".md");
      });
      fs.remove(config.directories.data + '/' + answers.file, function (err) {
        if (err) {return console.error(err);}
        console.log("Delete directory " + config.directories.data + '/' + answers.file);
      });
      fs.remove(config.directories.data.replace(/^user/, 'htdocs') + '/' + answers.file, function (err) {
        if (err) {return console.error(err);}
        console.log("Delete directory " + config.directories.data.replace(/^user/, 'htdocs') + '/' + answers.file);
      });
    },
    function(err) { console.error(err); }
  );
});
