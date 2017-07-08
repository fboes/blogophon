'use strict';

var inquirer       = require('inquirer');
var fs             = require('fs-extra-promise');
var path           = require('path');
var chalk          = require('chalk');
var shell          = require('shelljs');
var config         = require('./config');
var Mustache       = require('./helpers/blogophon-mustache');
var setup          = require('./setup')();
var Generator      = require('./generator');
var blogophonDate  = require('./models/blogophon-date');
var blogophonEditor = require('./editor')(config);

/**
 * Represents the Inquirer dialog with which to edit articles.
 * @constructor
 * @return {Object} [description]
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
    config.notInitialized ? 'Setup' : 'Change settings',
    'Exit'
  ];

  Mustache.getTemplates();

  /**
   * Get all Markdown files as a simple array.
   * Array values can be simple strings, or objects containing
   * a name (to display in list),
   * a value (to save in the answers hash) and
   * a short (to display after selection) properties.
   * The choices array can also contain a Separator.
   * @return {Array} [description]
   */
  internal.makeChoices = function() {
    var choices = [];
    if (!config.notInitialized) {
      files = blogophonEditor.makeFiles(new inquirer.Separator());
      choices.push(choicesStr[0]);
      if (files.length > 0) {
        choices.push(choicesStr[1], choicesStr[2], choicesStr[3], choicesStr[4]);
      }
      choices.push(new inquirer.Separator());
    }
    choices.push(choicesStr[5], new inquirer.Separator(), choicesStr[6]);
    return choices;
  };

  internal.makePost = function(markdownFilename, filename, templateData) {
    blogophonEditor.makePost(
      markdownFilename,
      filename,
      templateData,
      function(err) {
        if (err) {
          console.error(chalk.red(markdownFilename + ' could not be written'));
        } else {
          console.log(markdownFilename + ' created');
          if (templateData.edit) {
            var cmd = config.isWin
              ? 'START ' + markdownFilename
              : 'open ' + markdownFilename + ' || vi '+ markdownFilename
            ;
            shell.exec(cmd);
            console.log(chalk.grey(cmd));
          }
          external.init();
        }
      }
    );
  };


  /**
   * Display the setup dialog.
   * @return {[type]} [description]
   */
  external.setupDialog = function() {
    var themesAvailable= fs.readdirSync(config.directories.theme).filter(function(file) {
      return fs.statSync(path.join(config.directories.theme, file)).isDirectory();
    });
    var questions = [
      {
        type: 'input',
        name: 'name',
        message: 'The name of your site',
        default: config.name,
        validate: function(v) {
          return v ? true : 'Please supply at least a short name for your site.';
        }
      }, {
        type: 'list',
        name: 'theme',
        message: 'Choose theme',
        default: config.theme,
        choices: themesAvailable,
        when: function() {
          return (themesAvailable.length > 1);
        }
      }, {
        type: 'input',
        name: 'baseUrl',
        message: 'Domain of your site, starting with `http`',
        default: config.baseUrl,
        validate: function(v) {
          return v.match(/^http(s)?:\/\/\S+[^/]$/) ? true : 'Please supply a valid url, starting with `http://`, but without trailing `/`.';
        },
        filter: function(v) {
          return v.replace(/\/$/, '');
        }
      }, {
        type: 'input',
        name: 'basePath',
        message: 'Base URL path, usually just `/`',
        default: config.basePath,
        validate: function(v) {
          return v.match(/^[a-zA-Z0-9./_-]*\/$/) ? true : 'Please supply a valid path with a trailing `/`.';
        },
        filter: function(v) {
          return v.replace(/^([^/])/, '/$1').replace(/([^/])$/, '$1/');
        }
      }, {
        type: 'input',
        name: 'description',
        message: 'A short description of your blog (optional)',
        default: config.description
      }, {
        type: 'input',
        name: 'locale.language',
        message: 'Standard language of your blog, like `en` for English',
        default: config.locale.language || config.language,
        validate: function(v) {
          return v.match(/^[a-zA-Z]+([-_][a-zA-Z]+)?$/) ? true : 'Please supply a valid language code like `en`, `es`, `fr`, `de` or `pt-br`.';
        },
        filter: function(v) {
          return v.toLowerCase().replace(/_/, '-');
        }
      }, {
        type: 'list',
        name: 'postPathMode',
        message: 'Choose URL path pattern for your posts:',
        default: config.postPathMode,
        choices: [
          'Static path',
          'Year',
          'Year/Month',
          'Year/Month/Day'
        ]
      }, {
        type: 'list',
        name: 'postFileMode',
        message: 'Choose URL file pattern for your posts:',
        default: config.postFileMode || 'Title',
        choices: [
          'Title',
          'Title-Date',
          'Date-Title',
          'Date'
        ]
      }, {
        type: 'input',
        name: 'itemsPerPage',
        message: 'How many articles per page?',
        default: config.itemsPerPage,
        validate: function(v) {
          return Number(v)> 0 ? true : 'Please supply a positive number.';
        },
        filter: function(v) {
          return Number(v);
        }
      }, {
        type: 'input',
        name: 'defaultAuthor.name',
        message: 'Default name of author',
        default: config.defaultAuthor.name,
        validate: function(v) {
          return v ? true : 'Please supply at least a short name for your site.';
        }
      }, {
        type: 'input',
        name: 'defaultAuthor.email',
        message: 'Default email address of author',
        default: config.defaultAuthor.email,
        validate: function(v) {
          return (v.match(/^\S+@\S+$/)) ? true : 'Please supply a valid email address.';
        }
      }, {
        type: 'input',
        name: 'twitterAccount',
        message: 'Twitter account name (optional)',
        default: config.twitterAccount,
        validate: function(v) {
          return (!v || v.match(/^[a-zA-z0-9_-]+$/)) ? true : 'Please supply a Twitter account name or leave field empty.';
        }
      }, {
        type: 'input',
        name: 'deployCmd',
        message: 'CLI command to copy files to your live server (optional)',
        default: config.deployCmd
      }, {
        type: 'checkbox',
        name: 'useSpecialFeature',
        message: 'Do you want to use the following special features?',
        default: config.useSpecialFeature,
        choices: [
          "Multiple authors",
          'Teaser snippets',
          "RSS",
          "ATOM",
          'JSON Feed',
          "JSON for Slack",
          "JSON-RSS",
          "Apple News",
          "Facebook Instant Articles",
          "Accelerated Mobile Pages",
          "Microsoft tiles",
          "ICS-Calendar",
          "GeoJSON",
          "KML",
          "AJAX"
        ]
      }
    ];

    inquirer.prompt(questions).then(
      function(answers) {
        answers.theme = config.theme ? config.theme : themesAvailable[0];
        answers.locale.direction = answers.locale.direction || config.locale.direction || (answers.language.match(/^(ar|zh|fa|he)/) ? 'rtl' : 'ltr');
        setup
          .buildBasicFiles(config, answers)
          .then(function() {
            console.log("Settings changed, please restart the Blogophon.");
            // TODO: reload config and return to main menu
            // external.init();
          })
        ;
      },
      function(err) {
        console.error(err);
        process.exit(1);
      }
    );
  };

  /**
   * This is the Inquirer dialog for creating a new articles. Will call external.init() on finish.
   * @return {[type]} [description]
   */
  external.createArticleDialog = function() {
    var defaults = {
      classes: 'Normal article',
      link: '',
      location: '',
      images: false,
      keywords: function(answers) {
        switch (answers.classes) {
          case 'Micro post':
            return 'Micro post';
          default:
            return '';
        }
      },
      date: blogophonDate(new Date()).iso,
      author: config.defaultAuthor.name +' <'+config.defaultAuthor.email + '>',
      rating: "5",
      draft: false,
      edit: true,
      lead: function(answers) {
        switch (answers.classes) {
          case 'Images':
            return "![](image.jpg#default)\n\nLorem ipsum…";
          case 'Video':
            return "https://www.youtube.com/watch?v=6A5EpqqDOdk\n\nLorem ipsum…";
          default:
            return '';
        }
      },
      mainText: function(answers) {
        switch (answers.classes) {
          case 'Link':
            return "[Lorem ipsum…](" + answers.link + ")";
          case 'Quote':
            return "> Lorem ipsum…\n> <cite>Cicero</cite>";
          default:
            return 'Lorem ipsum…';
        }
      }
    };

    var questions    = [
      {
        type: 'list',
        name: 'classes',
        message: 'Type of article',
        choices: ['Normal article', 'Images', 'Video', 'Link', 'Quote', 'Review', 'Location', 'Micro post'],
        default: defaults.classes,
        filter: function(v) {
          return (v === 'Normal article') ? null : v;
        }
      }, {
        type: 'input',
        name: 'title',
        message: 'Title',
        validate: function(v) {
          if (v.trim().length <= 2) {
            return 'This title is way too short.';
          }
          var filename = blogophonEditor.filenameFromTitle(v);
          if (fs.existsSync(filename)) {
            return ("File " + filename + ' already exists');
          }
          return true;
        },
        when: function(answers) {
          return answers.classes !== 'Micro post';
        },
        filter: function(v) {
          return v.trim();
        }
      }, {
        type: 'input',
        name: 'link',
        message: 'URL of page you want to link to',
        default: defaults.link,
        when: function(answers) {
          return answers.classes === 'Link';
        },
        validate: function(v) {
          return v.match(/^http(s)?:\/\/\S+$/) ? true : 'Please supply a valid url, starting with `http://` or `https://`.';
        }
      }, {
        type: 'input',
        name: 'location',
        message: 'Place name or address',
        default: defaults.location,
        when: function(answers) {
          return answers.classes === 'Location';
        }
      }, {
        type: 'list',
        name: 'rating',
        message: 'Rating',
        choices: ["1", "2", "3", "4", "5"],
        default: defaults.rating,
        when: function(answers) {
          return answers.classes === 'Review';
        },
        validate: function(v) {
          return (Number(v) >= 1 && Number(v)) <= 5 ? true : 'Please supply a number between 1 - 5.';
        },
        filter: function(v) {
          return Number(v);
        }
      }, {
        type: 'confirm',
        name: 'images',
        message: 'Do you want to use images?',
        default: defaults.images,
        when: function(answers) {
          return (answers.classes !== 'Images' && answers.classes !== 'Micro post');
        }
      }, {
        type: 'input',
        name: 'keywords',
        message: 'Keywords, comma-separated',
        when: function(answers) {
          return answers.classes !== 'Micro post';
        },
        default: defaults.keywords,
        filter: function(v) {
          return v.trim();
        }
      }, {
        type: 'input',
        name: 'author',
        message: 'Author <E-Mail-Address>',
        default: defaults.author,
        when: function() {
          return config.specialFeatures.multipleauthors;
        }
      }, {
        type: 'input',
        name: 'date',
        message: 'Publishing date',
        default: defaults.date,
        filter: function(v) {
          return blogophonDate(v).iso;
        },
        when: function(answers) {
          return answers.classes !== 'Micro post';
        },
        validate: function(v) {
          return v.match(/^\d[\d:+T-]+\d$/) ? true : 'Please supply a valid date like ' + defaults.date + '.';
        }
      }, {
        type: 'confirm',
        name: 'draft',
        message: 'Is this a draft?',
        default: defaults.draft,
        when: function(answers) {
          return answers.classes !== 'Micro post' && answers.date === defaults.date;
        }
      }, {
        type: 'confirm',
        name: 'edit',
        message: 'Open this in editor right away?',
        default: defaults.edit
      }, {
        type: 'input',
        name: 'lead',
        message: 'Lead / teaser text',
        default: defaults.lead,
        when: function(answers) {
          return !answers.edit && answers.classes !== 'Link' && answers.classes !== 'Micro post';
        }
      }, {
        type: 'input',
        name: 'mainText',
        message: 'Main text',
        default: defaults.mainText,
        when: function(answers) {
          return !answers.edit;
        }
      }
    ];
    inquirer.prompt(questions).then(
      function(answers) {
        answers.title = answers.title || defaults.date;
        answers.date = answers.date || defaults.date;
        var markdownFilename = blogophonEditor.filenameFromTitle(blogophonEditor.titleForFilename(answers.title, config, answers.date)) + '.md';
        var filename = blogophonEditor.dirnameFromFilename(markdownFilename); // TODO: There is a class for that
        var templateData = answers;
        templateData.isMicropost = (answers.classes === 'Micro post');
        templateData.lead        = templateData.lead     || defaults.lead(answers);
        templateData.mainText    = templateData.mainText || defaults.mainText(answers);
        if (templateData.classes === 'Location') {
          templateData.latitude = 0.00001;
          templateData.longitude = 0.00001;
        }
        if (templateData.location) {
          console.log('Geocoding...');
          blogophonEditor.convertAddress(templateData.location, config.locale.language, function(err, geo) {
            templateData.latitude = geo.latitude || templateData.latitude;
            templateData.longitude = geo.longitude || templateData.longitude;
            internal.makePost(markdownFilename, filename, templateData);
          });
        } else {
          internal.makePost(markdownFilename, filename, templateData);
        }

      },
      function(err) {
        console.error(err);
      }
    );
  };

  /**
   * This is the Inquirer dialog for editing an existing article. Will call external.init() on finish.
   * @return {void} [description]
   */
  external.editArticleDialog = function() {
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
        var markdownFilename = path.join(config.directories.data, answers.file);
        var cmd = config.isWin ? 'START ' + markdownFilename : 'open ' + markdownFilename + ' || vi '+ markdownFilename;
        console.log(chalk.grey(cmd));
        shell.exec(cmd);
        external.init();
      },
      function(err) {
        console.error(err);
      }
    );
  };

  /**
   * This is the Inquirer dialog for renaming an existing article. Will call external.init() on finish.
   * @return {void} [description]
   */
  external.renameArticleDialog = function() {
    var questions = [
      {
        type: 'list',
        name: 'file',
        message: 'Select filen to rename ('+files.length+')',
        choices: files
      }, {
        type: 'input',
        name: 'fileNew',
        message: 'Please enter a new filename or leave empty to cancel',
        filter: function(v) {
          return blogophonEditor.shortfilenameFromTitle(v);
        },
        validate: function(v) {
          return v.match(/\.md~?$/) ? true : 'Please supply a file ending like `.md` or `.md~`.';
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

          fs.move(
            config.directories.data + '/' + answers.file,
            config.directories.data + '/' + answers.fileNew,
            checkProcessed
          );
          fs.move(
            config.directories.data + '/' + blogophonEditor.dirnameFromFilename(answers.file),
            config.directories.data + '/' + blogophonEditor.dirnameFromFilename(answers.fileNew),
            checkProcessed
          );
          if (! answers.file.match(/~$/)) {
            maxProcessed ++;
            fs.move(
              config.directories.data.replace(/^user/, 'htdocs') + '/' + blogophonEditor.dirnameFromFilename(answers.file),
              config.directories.data.replace(/^user/, 'htdocs') + '/' + blogophonEditor.dirnameFromFilename(answers.fileNew),
              checkProcessed
            );
          }
        } else {
          external.init();
        }
      },
      function(err) {
        console.error(err);
      }
    );
  };

  /**
   * This is the Inquirer dialog for deleting an existing article. Will call external.init() on finish.
   * @return {void} [description]
   */
  external.deleteArticleDialog = function() {
    var questions = [
      {
        type: 'list',
        name: 'file',
        message: 'Select file to delete ('+files.length+')',
        choices: files
      }, {
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

          fs.remove(path.join(config.directories.data, answers.file), checkProcessed);
          fs.remove(path.join(config.directories.data, blogophonEditor.dirnameFromFilename(answers.file)), checkProcessed);
          fs.remove(path.join(config.directories.data.replace(/^user/, 'htdocs'), blogophonEditor.dirnameFromFilename(answers.file)), checkProcessed);
        } else {
          external.init();
        }
      },
      function(err) {
        console.error(err);
      }
    );
  };

  /**
   * This is the Inquirer dialog for generating all HTML files. Will call external.init() on finish.
   * @return {void} [description]
   */
  external.generateDialog = function() {
    var questions = [
      {
        type: 'confirm',
        name: 'noforce',
        message: 'Only generate new files?',
        default: true
      }, {
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
    var answers;
    inquirer
      .prompt(questions)
      .then(function(inquirerAnswers) {
        answers = inquirerAnswers;
        return generator.getArticles();
      })
      .then(function() {
        return generator.buildAll(!answers.noforce);
      })
      .then(function() {
        if(answers.deploy) {
          generator.deploy();
        }
        external.init();
      })
      .catch(function(err) {
        console.error(err);
      })
    ;
  };

  /**
   * This is the Inquirer dialog for showing the main menu. This will be called in a loop until `Exit` is selected.
   * @return {void} [description]
   */
  external.init = function() {
    if (config.notInitialized) {
      fs.ensureDirSync(config.directories.data);
      fs.ensureDirSync(config.directories.htdocs);
      external.setupDialog();
    } else {
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
              external.createArticleDialog();
              break;
            case choicesStr[1]:
              external.editArticleDialog();
              break;
            case choicesStr[2]:
              external.renameArticleDialog();
              break;
            case choicesStr[3]:
              external.deleteArticleDialog();
              break;
            case choicesStr[4]:
              external.generateDialog();
              break;
            case choicesStr[5]:
              external.setupDialog();
              break;
            case choicesStr[choicesStr.length -1]:
              console.log("Good bye");
              break;
            default:
              external.init();
              break;
          }
        },
        function(err) {
          console.error(err);
        }
      );
    }
  };
  return external;
};

module.exports = BlogophonConsole;
