'use strict';

/**
 * Represents all posts
 * @constructor
 */
var BlogophonConsole = function () {
  var config       = require('./config');
  var toolshed     = require('./js-toolshed/src/js-toolshed');
  var inquirer     = require('inquirer');
  var glob         = require('glob');
  var fs           = require('fs-extra');
  var shell        = require('shelljs');
  var Mustache     = require('mustache');
  var chalk        = require('chalk');

  var Generator    = require('./generator');

  var files        = [];
  var choicesStr   = [
    'Create new article',
    'Edit existing article',
    'Delete article',
    'Generate & publish articles',
    'Exit'
  ];

  var template     = fs.readFileSync(config.directories.theme+'/post.md', 'utf8');

  var internal = {
    /**
     * [makeChoices description]
     * @return {[type]} [description]
     */
    makeChoices: function () {
      files = glob.sync(config.directories.data + "/**/*.md").map(function(v) {
        return v.replace(/^.+\/(.+?)\.md$/,'$1');
      });
      var choices = [choicesStr[0]];
      if (files.length > 0) {
        choices.push(choicesStr[1],choicesStr[2],choicesStr[3]);
      }
      choices.push(choicesStr[4]);
      return choices;
    },
    filenameFromTitle: function (title) {
      return config.directories.data + '/' + title.trim().asciify();
    }
  };

  var exports = {
    /**
     * [createArticle description]
     * @return {[type]} [description]
     */
    createArticle: function() {
      var questions    = [
        {
          type: 'input',
          name: 'title',
          message: 'Title',
          validate: function(v) {
            if (v.trim().length <= 2) {
              return 'This title is way too short.';
            }
            var filename = internal.filenameFromTitle(v);
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
          name: 'draft',
          message: 'Is this a draft?',
          default: false
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
        }
      ];
      inquirer.prompt(questions).then(
        function (answers) {
          var filename = internal.filenameFromTitle(answers.title);
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
              exports.init();
            }
          });
        },
        function(err) { console.log(err); }
      );
    },
    /**
     * [editArticle description]
     * @return {[type]} [description]
     */
    editArticle: function() {
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
          console.log(chalk.grey(cmd));
          shell.exec(cmd);
          exports.init();
        },
        function(err) { console.error(err); }
      );
    },
    /**
     * [deleteArticle description]
     * @return {[type]} [description]
     */
    deleteArticle: function() {
      var questions = [
        {
          type: 'list',
          name: 'file',
          message: 'Select filename to delete',
          choices: files
        },{
          type: 'confirm',
          name: 'sure',
          message: 'Are you sure?',
          default: true
        }
      ];
      inquirer.prompt(questions).then(
        function (answers) {
          if (answers.sure) {
            // Sync delete? :(
            fs.removeSync(config.directories.data + '/' + answers.file + ".md");
            fs.removeSync(config.directories.data + '/' + answers.file);
            fs.removeSync(config.directories.data.replace(/^user/, 'htdocs') + '/' + answers.file);
            console.log(answers.file + " file deleted, you may want to generate & publish all index pages");
          }
          exports.init();
        },
        function(err) { console.error(err); }
      );
    },
    /**
     * [generate description]
     * @return {[type]} [description]
     */
    generate: function() {
      var questions = [
        {
          type: 'confirm',
          name: 'noforce',
          message: 'Only generate new files?',
          default: true
        },{
          type: 'confirm',
          name: 'deploy',
          message: 'Do you want to publish all files?',
          default: true,
          when: function (answers) {
            return config.deployCmd;
          }
        }
      ];
      inquirer.prompt(questions).then(
        function (answers) {
          Generator.getArticles().then(
            function () {
              Generator.buildAll(!answers.noforce).then(
                function() {
                  if(answers.deploy) {
                    Generator.deploy();
                  }
                  exports.init();
                },
                function(err) { console.error(err); }
              );
            },
            function(err) { console.error(err); }
          );
        },
        function(err) { console.error(err); }
      );
    },
    init: function() {
      var questions = [
        {
          type: 'list',
          name: 'action',
          message: 'Select action',
          choices: internal.makeChoices()
        }
      ];
      inquirer.prompt(questions).then(
        function (answers) {
          switch (answers.action) {
            case choicesStr[0]:
              exports.createArticle();
              break;
            case choicesStr[1]:
              exports.editArticle();
              break;
            case choicesStr[2]:
              exports.deleteArticle();
              break;
            case choicesStr[3]:
              exports.generate();
              break;
            case choicesStr[4]:
              console.log("Good bye");
              break;
            default:
              exports.init();
              break;
          }
        },
        function(err) { console.error(err); }
      );
    }
  };

  return exports;
};

module.exports = BlogophonConsole;
