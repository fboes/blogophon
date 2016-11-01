'use strict';

var inquirer       = require('inquirer');
var glob           = require('glob');
var fs             = require('fs-extra-promise');
var chalk          = require('chalk');
var shell          = require('shelljs');
var SuperString    = require('./helpers/super-string');
var config         = require('./config');
var Mustache       = require('./helpers/blogophon-mustache').getTemplates(config.directories.currentTheme + '/templates');
var Generator      = require('./generator');

/**
 * Represents the Inquirer dialogue with which to edit articles.
 * @constructor
 */
var BlogophonConsole = function() {
  var external     = {};
  var internal     = {};
  var files        = [];
  var choicesStr   = [
    'Create new article',
    'Edit existing article',
    'Rename article',
    'Delete article',
    'Generate & publish articles',
    'Exit'
  ];

  var template     = fs.readFileSync('./src/templates/post.md', 'utf8');

  /**
   * Get all Markdown files as a simple array
   * @return {Array} [description]
   */
  internal.makeChoices = function() {
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
  };

  /**
   * Convert title to Markdown filename
   * @param  {String} title [description]
   * @return {String}       [description]
   */
  internal.filenameFromTitle = function(title) {
    return config.directories.data + '/' + internal.shortfilenameFromTitle(title);
  };

  /**
   * Remove stop words from filename and limit it to a sane length.
   * @param  {String} title [description]
   * @return {String}       [description]
   */
  internal.shortfilenameFromTitle = function(title) {
    return SuperString(title.trim().toLowerCase())
      .asciify()
      .replace(/(^|\-)(de(r|n|m|s)|die(s|se|ser|ses|sen|sem)?|d(a|o|e)s|(m|s|d)ein(e|es|er|em|en)?|a|the|(e|a)l|l(a|o)s?|(i|o|a)(n|m))\-/g,'$1')
      .replace(/(^[\-]+|[\-]+$)/g,'')
      .replace(/([\-])[\-]+/g,'$1')
      .replace(/\-(md~?)$/,'.$1')
      .replace(/^(.{64}[^-]*).*?(\.md~?)?$/,'$1$2')
    ;
  };

  /**
   * Convert Markdown filename into corresponding directory name (e.g. for images)
   * @param  {String} filename [description]
   * @return {String}          [description]
   */
  internal.dirnameFromFilename = function(filename) {
    return filename.replace(/\.md~?$/,'');
  };

  /**
   * This is the Inquirer dialogue for creating a new articles. Will call external.init() on finish.
   */
  external.createArticleDialogue = function() {
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
        choices: ['Normal article', 'Images', 'Video', 'Link', 'Quote'],
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
        type: 'input',
        name: 'author',
        message: 'Author <E-Mail-Address>',
        default: config.defaultAuthor.name +' <'+config.defaultAuthor.email + '>',
        when: function() {
          return config.specialFeatures.multipleauthors;
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
        var filename = internal.dirnameFromFilename(markdownFilename); // TODO: There is a class for that
        var templateData = {
          title: answers.title,
          keywords: answers.keywords,
          classes: answers.classes,
          author: answers.author,
          lead: answers.lead || 'Lorem ipsum…',
          mainText: answers.mainText || 'Lorem ipsum…',
          date: new Date()
        };
        switch (answers.classes) {
          case 'Images':
            templateData.lead = "![](image.jpg#default)\n\nLorem ipsum…";
            break;
          case 'Video':
            templateData.lead = "https://www.youtube.com/watch?v=6A5EpqqDOdk\n\nLorem ipsum…";
            break;
          case 'Link':
            templateData.mainText = "[Lorem ipsum…](http://www.example.com)";
            break;
          case 'Quote':
            templateData.mainText = "> Lorem ipsum…\n> <cite>Cicero</cite>";
            break;
        }
        fs.writeFile(markdownFilename, Mustache.render(template, templateData), function(err) {
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
            external.init();
          }
        });
      },
      function(err) { console.error(err); }
    );
  };

  /**
   * This is the Inquirer dialogue for editing an existing article. Will call external.init() on finish.
   */
  external.editArticleDialogue = function() {
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
        external.init();
      },
      function(err) { console.error(err); }
    );
  };

  /**
   * This is the Inquirer dialogue for renaming an existing article. Will call external.init() on finish.
   */
  external.renameArticleDialogue = function() {
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
              external.init();
            }
          };

          fs.move(config.directories.data + '/' + answers.file, config.directories.data + '/' + answers.fileNew, checkProcessed);
          fs.move(config.directories.data + '/' + internal.dirnameFromFilename(answers.file), config.directories.data + '/' + internal.dirnameFromFilename(answers.fileNew), checkProcessed);
          if (! answers.file.match(/~$/)) {
            maxProcessed ++;
            fs.move(config.directories.data.replace(/^user/, 'htdocs') + '/' + internal.dirnameFromFilename(answers.file), config.directories.data.replace(/^user/, 'htdocs') + '/' + internal.dirnameFromFilename(answers.fileNew), checkProcessed);

          }
        } else {
          external.init();
        }
      },
      function(err) { console.error(err); }
    );
  };

  /**
   * This is the Inquirer dialogue for deleting an existing article. Will call external.init() on finish.
   */
  external.deleteArticleDialogue = function() {
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
            if (err) {
              console.error(err);
            }
            if (++processed === maxProcessed) {
              console.log(answers.file + " files deleted, you may want to generate & publish all index pages");
              external.init();
            }
          };

          fs.remove(config.directories.data + '/' + answers.file, checkProcessed);
          fs.remove(config.directories.data + '/' + internal.dirnameFromFilename(answers.file), checkProcessed);
          fs.remove(config.directories.data.replace(/^user/, 'htdocs') + '/' + internal.dirnameFromFilename(answers.file), checkProcessed);
        } else {
          external.init();
        }
      },
      function(err) { console.error(err); }
    );
  };

  /**
   * This is the Inquirer dialogue for generating all HTML files. Will call external.init() on finish.
   */
  external.generateDialogue = function() {
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
        when: function() { // answers
          return config.deployCmd;
        }
      }
    ];
    var generator = Generator(config);
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
                  external.init();
                })
                .catch( function(err) { console.error(err); } )
              ;
            })
            .catch( function(err) { console.error(err); } )
          ;
        })
      .catch( function(err) { console.error(err); } )
    ;
  };

  /**
   * This is the Inquirer dialogue for showing the main menu. This will be called in a loop until `Exit` is selected.
   */
  external.init = function() {
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
            external.createArticleDialogue();
            break;
          case choicesStr[1]:
            external.editArticleDialogue();
            break;
          case choicesStr[2]:
            external.renameArticleDialogue();
            break;
          case choicesStr[3]:
            external.deleteArticleDialogue();
            break;
          case choicesStr[4]:
            external.generateDialogue();
            break;
          case choicesStr[choicesStr.length -1]:
            console.log("Good bye");
            break;
          default:
            external.init();
            break;
        }
      },
      function(err) { console.error(err); }
    );
  };
  return external;
};

module.exports = BlogophonConsole;
