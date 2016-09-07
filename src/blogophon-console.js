'use strict';

var config         = require('./config');
var toolshed       = require('./helpers/js-toolshed');
var inquirer       = require('inquirer');
var glob           = require('glob');
var fs             = require('fs-extra-promise');
var shell          = require('shelljs');
var Mustache       = require('./helpers/blogophon-mustache').getTemplates(config.directories.currentTheme + '/templates');
var chalk          = require('chalk');
var generator      = require('./generator');

/**
 * Represents the Inquirer dialogue with which to edit articles.
 * @constructor
 */
var BlogophonConsole = function() {
  var files        = [];
  var choicesStr   = [
    'Create new article',
    'Edit existing article',
    'Rename article',
    'Delete article',
    'Generate & publish articles',
    'Exit'
  ];

  var template     = fs.readFileSync('./src/post.md', 'utf8');

  var internal = {
    /**
     * Get all Markdown files as a simple array
     * @return {Array} [description]
     */
    makeChoices: function() {
      files = glob.sync(config.directories.data + "/**/*.{md,md~}").map(function(v) {
        return v.replace(/^.+\/(.+?)$/,'$1');
      });
      files.push(new inquirer.Separator());
      var choices = [choicesStr[0]];
      if (files.length > 0) {
        choices.push(choicesStr[1], choicesStr[2], choicesStr[3], choicesStr[4]);
      }
      choices.push(new inquirer.Separator(), choicesStr[5]);
      return choices;
    },
    /**
     * Convert title to Markdown filename
     * @param  {String} title [description]
     * @return {String}       [description]
     */
    filenameFromTitle: function(title) {
      return config.directories.data + '/' + internal.shortfilenameFromTitle(title);
    },
    /**
     * Remove stop words from filename
     * @param  {String} title [description]
     * @return {String}       [description]
     */
    shortfilenameFromTitle: function(title) {
      return title
        .trim()
        .toLowerCase()
        .asciify()
        .replace(/(^|\-)(der|die|d(a|o|e)s|eine?|a|the|el|las?|los)\-/g,'$1')
        .replace(/(^[\-]+|[\-]+$)/g,'')
        .replace(/([\-])[\-]+/g,'$1')
        .replace(/\-(md~?)$/,'.$1')
      ;
    },
    /**
     * Convert Markdown filename into corresponding directory name (e.g. for images)
     * @param  {String} filename [description]
     * @return {String}          [description]
     */
    dirnameFromFilename: function(filename) {
      return filename.replace(/\.md~?$/,'');
    }
  };

  var exports = {
    /**
     * This is the Inquirer dialogue for creating a new articles. Will call exports.init() on finish.
     */
    createArticleDialogue: function() {
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
            if (fs.existsSync(filename)) {
              return ("File " + filename + ' already exists');
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
          choices: ['Normal article', 'Images', 'Video', 'Link'],
          default: 'Normal article',
          filter: function(v) {
            return (v === 'Normal article') ? null : v;
          }
        },{
          type: 'confirm',
          name: 'images',
          message: 'But you do want to use images?',
          default: false,
          when: function(answers) {
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
          when: function(answers) {
            return !answers.edit && answers.classes !== 'Link';
          }
        },{
          type: 'input',
          name: 'mainText',
          message: 'Main text',
          default: 'Lorem ipsum…',
          when: function(answers) {
            return !answers.edit;
          }
        }
      ];
      inquirer.prompt(questions).then(
        function(answers) {
          var markdownFilename = internal.filenameFromTitle(answers.title) + (answers.draft ? '.md~' : '.md');
          var filename = internal.dirnameFromFilename(markdownFilename);
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
              var cmd = config.isWin ? 'START ' + markdownFilename : 'open ' + markdownFilename + ' || vi '+ markdownFilename;
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
        function(err) { console.error(err); }
      );
    },

    /**
     * This is the Inquirer dialogue for editing an existing article. Will call exports.init() on finish.
     */
    editArticleDialogue: function() {
      var questions = [
        {
          type: 'list',
          name: 'file',
          message: 'Select file to edit ('+files.length+')',
          choices: files
        }
      ];
      inquirer.prompt(questions).then(
        function(answers) {
          var markdownFilename = config.directories.data + '/' + answers.file;
          var cmd = config.isWin ? 'START ' + markdownFilename : 'open ' + markdownFilename + ' || vi '+ markdownFilename;
          console.log(chalk.grey(cmd));
          shell.exec(cmd);
          exports.init();
        },
        function(err) { console.error(err); }
      );
    },

    /**
     * This is the Inquirer dialogue for renaming an existing article. Will call exports.init() on finish.
     */
    renameArticleDialogue: function() {
      var questions = [
        {
          type: 'list',
          name: 'file',
          message: 'Select filen to rename ('+files.length+')',
          choices: files
        },{
          type: 'input',
          name: 'fileNew',
          message: 'Please enter a new filename or leave empty to cancel',
          filter: function(v) {
            return internal.shortfilenameFromTitle(v);
          },
          validate: function(v) {
            return v.match(/\.md\~?$/) ? true : 'Please supply a file ending like `.md` or `.md~`.';
          }
        }
      ];
      inquirer.prompt(questions).then(
        function(answers) {
          if (answers.fileNew) {
            var processed = 0, maxProcessed = 2;
            var checkProcessed = function(err) {
              if (err) {
                console.error(err);
              }
              if (++processed === maxProcessed) {
                console.log(answers.file + " files moved to "+answers.fileNew+", you may want to generate & publish all index pages");
                exports.init();
              }
            };

            fs.move(config.directories.data + '/' + answers.file, config.directories.data + '/' + answers.fileNew, checkProcessed);
            fs.move(config.directories.data + '/' + internal.dirnameFromFilename(answers.file), config.directories.data + '/' + internal.dirnameFromFilename(answers.fileNew), checkProcessed);
            if (! answers.file.match(/~$/)) {
              maxProcessed ++;
              fs.move(config.directories.data.replace(/^user/, 'htdocs') + '/' + internal.dirnameFromFilename(answers.file), config.directories.data.replace(/^user/, 'htdocs') + '/' + internal.dirnameFromFilename(answers.fileNew), checkProcessed);

            }
          } else {
            exports.init();
          }
        },
        function(err) { console.error(err); }
      );
    },

    /**
     * This is the Inquirer dialogue for deleting an existing article. Will call exports.init() on finish.
     */
    deleteArticleDialogue: function() {
      var questions = [
        {
          type: 'list',
          name: 'file',
          message: 'Select file to delete ('+files.length+')',
          choices: files
        },{
          type: 'confirm',
          name: 'sure',
          message: 'Are you sure?',
          default: true
        }
      ];
      inquirer.prompt(questions).then(
        function(answers) {
          if (answers.sure) {
            var processed = 0, maxProcessed = 3;
            var checkProcessed = function(err) {
              if (++processed === maxProcessed) {
                console.log(answers.file + " files deleted, you may want to generate & publish all index pages");
                exports.init();
              }
            };

            fs.remove(config.directories.data + '/' + answers.file, checkProcessed);
            fs.remove(config.directories.data + '/' + internal.dirnameFromFilename(answers.file), checkProcessed);
            fs.remove(config.directories.data.replace(/^user/, 'htdocs') + '/' + internal.dirnameFromFilename(answers.file), checkProcessed);
          } else {
            exports.init();
          }
        },
        function(err) { console.error(err); }
      );
    },

    /**
     * This is the Inquirer dialogue for generating all HTML files. Will call exports.init() on finish.
     */
    generateDialogue: function() {
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
          when: function(answers) {
            return config.deployCmd;
          }
        }
      ];
      inquirer
        .prompt(questions)
        .then(
          function(answers) {
            generator
              .getArticles()
              .then(function() {
                generator
                  .buildAll(!answers.noforce)
                  .then(function() {
                    if(answers.deploy) {
                      generator.deploy();
                    }
                    exports.init();
                  })
                  .catch( function(err) { console.error(err); } )
                ;
              })
              .catch( function(err) { console.error(err); } )
            ;
          })
        .catch( function(err) { console.error(err); } )
      ;
    },

    /**
     * This is the Inquirer dialogue for showing the main menu. This will be called in a loop until `Exit` is selected.
     */
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
        function(answers) {
          switch (answers.action) {
            case choicesStr[0]:
              exports.createArticleDialogue();
              break;
            case choicesStr[1]:
              exports.editArticleDialogue();
              break;
            case choicesStr[2]:
              exports.renameArticleDialogue();
              break;
            case choicesStr[3]:
              exports.deleteArticleDialogue();
              break;
            case choicesStr[4]:
              exports.generateDialogue();
              break;
            case choicesStr[choicesStr.length -1]:
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
