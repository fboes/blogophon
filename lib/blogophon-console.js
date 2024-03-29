import inquirer from 'inquirer';
import fs from 'fs-extra-promise';
import shell from 'shelljs';
import path from 'path';
import configJs from './config.js';
import Handlebars from './helpers/blogophon-handlebars.js';
import setupJs from './setup.js';
import Generator from './generator.js';
import blogophonDateFormat from './helpers/blogophon-date-format.js';
import blogophonEditorJs from './editor.js';
import datePickerPrompt from 'inquirer-datepicker-prompt';

inquirer.registerPrompt('datetime', datePickerPrompt);

/**
 * Represents the Inquirer dialog with which to edit articles.
 * @constructor
 * @return {Object} [description]
 */
const BlogophonConsole = function() {
  const config = configJs();
  const setup = setupJs();
  const blogophonEditor = blogophonEditorJs(config);
  const external     = {};
  const internal     = {};
  let files          = [];
  const choicesStr   = [
    'Create new article',
    'Edit existing article',
    'Rename article',
    'Delete article',
    'Generate & publish articles',
    config.notInitialized ? 'Setup' : 'Change settings',
    'Exit'
  ];

  internal.moreTag = '--- More ---';

  Handlebars.getTemplates(config.locale.language);

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
    let choices = [];
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

  /**
   * [makePost description]
   * @param  {String} markdownFilename [description]
   * @param  {String} templateData     [description]
   * @return {[type]}                  [description]
   */
  internal.makePost = function(markdownFilename, templateData) {
    blogophonEditor.createFile(
      markdownFilename,
      templateData,
      function(err) {
        if (err) {
          console.error(markdownFilename + ' could not be written');
        } else {
          console.log(markdownFilename + ' created');
          if (templateData.edit) {
            const cmd = config.isWin
              ? 'START ' + markdownFilename
              : 'open ' + markdownFilename + ' || vi ' + markdownFilename
            ;
            shell.exec(cmd);
            console.log('$ ' + cmd);
          }
          external.init();
        }
      }
    );
  };

  /**
   * Get array of default tags
   * @return {Array} of tags
   */
  internal.getTagChoices = function() {
    let tags = [];
    if (config.tags.length > 0) {
      tags = config.tags;
      tags.push(internal.moreTag);
      if (config.tags.length > 4) {
        tags.push(new inquirer.Separator());
      }
    }
    return tags;
  };

  /**
   * Display the setup dialog.
   * @return {[type]} [description]
   */
  external.setupDialog = function() {
    const themesAvailable = fs.readdirSync(config.directories.theme).filter(function(file) {
      return fs.statSync(path.join(config.directories.theme, file)).isDirectory();
    });
    const questions = [
      {
        type: 'input',
        name: 'name',
        message: 'The name of your site',
        default: config.name,
        validate(v) {
          return v ? true : 'Please supply at least a short name for your site.';
        }
      }, {
        type: 'input',
        name: 'shortName',
        message: 'A short name for your site (max. 12 characters)',
        default: config.shortName || config.name,
        validate(v) {
          return (v.length <= 12) ? true : 'Please supply a short name for your site (max. 12 characters).';
        },
        when(answers) {
          return (answers.name.length > 12);
        }
      }, {
        type: 'list',
        name: 'theme',
        message: 'Choose theme',
        default: config.theme,
        choices: themesAvailable,
        when() {
          return (themesAvailable.length > 1);
        }
      }, {
        type: 'input',
        name: 'baseUrl',
        message: 'Domain of your site, starting with `http://` or `https://`',
        default: config.baseUrl,
        validate(v) {
          return v.match(/^http(s)?:\/\/\S+[^/]$/) ? true : 'Please supply a valid url, starting with `http://` or `https://`, but without trailing `/`.';
        },
        filter(v) {
          return v.replace(/\/$/, '');
        }
      }, {
        type: 'input',
        name: 'basePath',
        message: 'Base URL path, usually just `/`',
        default: config.basePath,
        validate(v) {
          return v.match(/^[a-zA-Z0-9./_-]*\/$/) ? true : 'Please supply a valid path with a trailing `/`.';
        },
        filter(v) {
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
        validate(v) {
          return v.match(/^[a-z]{2,3}([-_][A-Z][a-z]{3})?([-_][A-Z0-9]{2,3})?$/) ? true : 'Please supply a valid BCP 47 language code like `en`, `es`, `fr`, `de-DE` or `pt-BR`.';
        },
        filter(v) {
          return v.replace(/_/g, '-');
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
          'Year/Month/Day',
          'Category'
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
        validate(v) {
          return Number(v) > 0 ? true : 'Please supply a positive number.';
        },
        filter(v) {
          return Number(v);
        }
      }, {
        type: 'input',
        name: 'defaultAuthor.name',
        message: 'Default name of author',
        default: config.defaultAuthor.name,
        validate(v) {
          return v ? true : 'Please supply at least a short name for your site.';
        }
      }, {
        type: 'input',
        name: 'defaultAuthor.email',
        message: 'Default email address of author',
        default: config.defaultAuthor.email,
        validate(v) {
          return (v.match(/^\S+@\S+$/)) ? true : 'Please supply a valid email address.';
        }
      }, {
        type: 'input',
        name: 'twitterAccount',
        message: 'Twitter account name (optional)',
        default: config.twitterAccount,
        validate(v) {
          return (!v || v.match(/^[a-zA-z0-9_-]+$/)) ? true : 'Please supply a Twitter account name or leave field empty.';
        }
      }, {
        type: 'input',
        name: 'copyright',
        message: 'Copyright notice like "© YEAR AUTHOR RIGHT" (optional)',
        default: config.copyright
      }, {
        type: 'input',
        name: 'tags',
        message: 'Enter a comma-separated list of tags (optional)',
        default: config.tags.join(', '),
        filter(v) {
          return v.trim().split(/,\s?/).sort();
        }
      }, {
        type: 'input',
        name: 'categories',
        message: 'Enter a comma-separated list of categories (optional)',
        default: config.categories.join(', '),
        filter(v) {
          return v.trim().split(/,\s?/);
        }
      }, {
        type: 'input',
        name: 'searchUrl',
        message: 'Search engine URL (optional)',
        default: config.searchUrl,
        validate(v) {
          return (!v || v.match(/^http\S+$/)) ? true : 'Please supply a search engine URL, starting with `http`. The search term will be appended to this URL.';
        }
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
          "JSON-LD",
          "Markdown",
          "Webmentions",
          "Apple News",
          "Facebook Instant Articles",
          "Accelerated Mobile Pages",
          "Progressive Web App",
          "Microsoft tiles",
          "ICS-Calendar",
          "ICS-Journal",
          "GeoJSON",
          "KML",
          "AJAX",
          "Server Side Includes",
          "Gopher"
        ]
      }, {
        type: 'input',
        name: 'deployCmd',
        message: 'CLI command to copy files to your live server (optional)',
        default: config.deployCmd
      }, {
        type: 'input',
        name: 'htmlAnalytics',
        message: 'Analytics HTML code (optional)',
        default: config.htmlAnalytics
      }, {
        type: 'input',
        name: 'htmlAnalyticsAmp',
        message: 'Analytics HTML code for AMP pages (optional)',
        default: config.htmlAnalyticsAmp,
        when(answers) {
          return answers.useSpecialFeature.indexOf('Accelerated Mobile Pages') >= 0;
        }
      }, {
        type: 'input',
        name: 'htmlAnalyticsFeed',
        message: 'Analytics HTML code for feed articles (optional)',
        default: config.htmlAnalyticsFeed,
        when(answers) {
          return (
            answers.useSpecialFeature.indexOf('RSS') >= 0
            || answers.useSpecialFeature.indexOf('ATOM') >= 0
            || answers.useSpecialFeature.indexOf('JSON Feed') >= 0
            || answers.useSpecialFeature.indexOf('Apple News') >= 0
            || answers.useSpecialFeature.indexOf('Facebook Instant Articles') >= 0
          );
        }
      }
    ];

    inquirer.prompt(questions).then(
      function(answers) {
        answers.shortName = answers.shortName || answers.name;
        answers.theme = answers.theme ? answers.theme : themesAvailable[0];
        answers.locale.direction = answers.locale.direction || config.locale.direction || (answers.language.match(/^(ar|zh|fa|he)/) ? 'rtl' : 'ltr');
        answers.componentScripts = config.componentScripts;
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
    const defaults = {
      classes: 'Normal article',
      link: '',
      location: '',
      tags(answers) {
        switch (answers.classes) {
          case 'Micro post':
            return 'Micro post';
          default:
            return '';
        }
      },
      category: '',
      date: new Date(),
      author: config.defaultAuthor.name + ' <' + config.defaultAuthor.email + '>',
      rating: "5",
      draft: false,
      edit: true,
      lead(answers) {
        switch (answers.classes) {
          case 'Images':
            return "![](image.jpg#default)";
          case 'Video':
            return "https://www.youtube.com/watch?v=6A5EpqqDOdk";
          case 'Recipe':
            return "Introduction";
          case 'Link':
          case 'Quote':
          case 'Micro post':
          case 'Conversation':
            return '';
          default:
            return 'Lorem ipsum…';
        }
      },
      mainText(answers) {
        switch (answers.classes) {
          case 'Link':
            return "[Lorem ipsum…](" + answers.link + ")";
          case 'Quote':
            return "> Lorem ipsum…\n\n-- <cite>[Cicero](https://www.example.com)</cite>";
          case 'Conversation':
            return "-- Mr. X\n> Lorem ipsum…\n\n--Mr. Y\n> Lorem ipsum…";
          case 'Recipe':
            return "Ingredients\n----------\n\n* Ingredient\n* Ingredient\n\nInstructions\n----------\n\n1. Instruction\n2. Instruction";
          default:
            return '![](image.jpg#default)\n\nLorem ipsum…';
        }
      }
    };

    const questions    = [
      {
        type: 'list',
        name: 'classes',
        message: 'Type of article',
        choices: ['Normal article', 'Images', 'Video', 'Link', 'Quote', 'Conversation', 'Review', 'Location', 'Recipe', 'Micro post'],
        default: defaults.classes,
        filter(v) {
          return (v === 'Normal article') ? null : v;
        }
      }, {
        type: 'input',
        name: 'title',
        message: 'Title',
        validate(v) {
          if (v.trim().length <= 2) {
            return 'This title is way too short.';
          }
          let filename = blogophonEditor.filenameFromTitle(v);
          if (fs.existsSync(filename)) {
            return ("File " + filename + ' already exists');
          }
          return true;
        },
        when(answers) {
          return answers.classes !== 'Micro post';
        },
        filter(v) {
          return v.trim();
        }
      }, {
        type: 'input',
        name: 'link',
        message: 'URL of page you want to link to',
        default: defaults.link,
        when(answers) {
          return answers.classes === 'Link';
        },
        validate(v) {
          return v.match(/^http(s)?:\/\/\S+$/) ? true : 'Please supply a valid url, starting with `http://` or `https://`.';
        }
      }, {
        type: 'input',
        name: 'location',
        message: 'Place name or address',
        default: defaults.location,
        when(answers) {
          return answers.classes === 'Location';
        }
      }, {
        type: 'list',
        name: 'rating',
        message: 'Rating',
        choices: ["1", "2", "3", "4", "5"],
        default: defaults.rating,
        when(answers) {
          return answers.classes === 'Review';
        },
        validate(v) {
          return (Number(v) >= 1 && Number(v)) <= 5 ? true : 'Please supply a number between 1 - 5.';
        },
        filter(v) {
          return Number(v);
        }
      }, {
        type: 'checkbox',
        name: 'tags',
        message: 'Tags',
        when(answers) {
          return (config.tags.length > 0) && answers.classes !== 'Micro post';
        },
        default(answers) {
          defaults.tags(answers).trim().split(/,\s?/);
        },
        filter(v) {
          return v.join(', ');
        },
        choices: internal.getTagChoices()
      }, {
        type: 'input',
        name: 'moreTags',
        message: 'More tags, comma-separated',
        when(answers) {
          return answers.tags && answers.tags.indexOf(internal.moreTag) >= 0;
        },
        filter(v) {
          return v.trim();
        }
      }, {
        type: 'input',
        name: 'tags',
        message: 'Tags, comma-separated',
        when(answers) {
          return answers.classes !== 'Micro post' && (!answers.tags);
        },
        default(answers) {
          return answers.tags || defaults.tags(answers);
        },
        filter(v) {
          return v.trim();
        }
      }, {
        type: 'list',
        name: 'category',
        message: 'Category',
        choices: config.categories,
        when() {
          return config.categories.length;
        },
        default: defaults.category
      }, {
        type: 'input',
        name: 'author',
        message: 'Author <E-Mail-Address>',
        default: defaults.author,
        when() {
          return config.specialFeatures.multipleauthors;
        }
      }, {
        type: 'datetime',
        name: 'date',
        message: 'Publishing date',
        format: ['yyyy', '/', 'mm', '/', 'dd', ' ', 'HH', ':', 'MM'],
        initial: defaults.date,
        when(answers) {
          return answers.classes !== 'Micro post';
        }
      }, {
        type: 'confirm',
        name: 'draft',
        message: 'Is this a draft?',
        default: defaults.draft,
        when(answers) {
          return answers.classes !== 'Micro post' && blogophonDateFormat(answers.date, 'iso') === blogophonDateFormat(defaults.date, 'iso');
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
        when(answers) {
          return !answers.edit && answers.classes !== 'Link' && answers.classes !== 'Micro post';
        }
      }, {
        type: 'input',
        name: 'mainText',
        message: 'Main text',
        default: defaults.mainText,
        when(answers) {
          return !answers.edit;
        }
      }
    ];
    inquirer.prompt(questions).then(
      function(answers) {
        answers.title = answers.title || Math.round(new Date().getTime() / 1000);
        answers.date = blogophonDateFormat(answers.date, 'iso') || defaults.date;
        let markdownFilename = blogophonEditor.filenameFromTitle(
          blogophonEditor.titleForFilename(answers.title, config, answers.date)
        );
        let templateData = answers;
        templateData.isMicropost = (answers.classes === 'Micro post');
        templateData.lead        = templateData.lead     || defaults.lead(answers);
        templateData.mainText    = templateData.mainText || defaults.mainText(answers);
        if (templateData.classes === 'Location') {
          templateData.latitude = 0.00001;
          templateData.longitude = 0.00001;
        }
        templateData.tags = templateData.tags.replace(RegExp(', ' + internal.moreTag), '');
        if (templateData.moreTags && templateData.tags) {
          templateData.tags += ', ' + templateData.moreTags;
          delete templateData.moreTags;
        }
        if (templateData.location) {
          console.log('Geocoding...');
          blogophonEditor.convertAddress(templateData.location, config.locale.language, function(err, geo) {
            templateData.latitude = geo.latitude || templateData.latitude;
            templateData.longitude = geo.longitude || templateData.longitude;
            internal.makePost(markdownFilename, templateData);
          });
        } else {
          internal.makePost(markdownFilename, templateData);
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
    const questions = [
      {
        type: 'list',
        name: 'file',
        message: 'Select file to edit (' + files.length + ')',
        choices: files
      }
    ];
    inquirer.prompt(questions).then(
      function(answers) {
        let markdownFilename = path.join(config.directories.data, answers.file);
        let cmd = config.isWin ? 'START ' + markdownFilename : 'open ' + markdownFilename + ' || vi ' + markdownFilename;
        console.log('$ ' + cmd);
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
    const questions = [
      {
        type: 'list',
        name: 'file',
        message: 'Select file to rename (' + files.length + ')',
        choices: files
      }, {
        type: 'input',
        name: 'fileNew',
        message: 'Please enter a new filename or leave empty to cancel',
        filter(v) {
          return blogophonEditor.shortfilenameFromTitle(v);
        },
        validate(v) {
          return !v.match(/\.md~?$/) ? true : 'Please omit file ending like `.md` or `.md~`.';
        }
      }
    ];
    inquirer.prompt(questions).then(
      function(answers) {
        if (answers.fileNew) {
          blogophonEditor.renameFile(answers.file, answers.fileNew, (err) => {
            if (err) {
              console.error(err);
            }
            console.log(answers.file + " files moved to " + answers.fileNew + ", you may want to generate & publish all index pages");
            external.init();
          });
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
    const questions = [
      {
        type: 'list',
        name: 'file',
        message: 'Select file to delete (' + files.length + ')',
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
        if (answers.sure && answers.file) {
          blogophonEditor.deleteFile(answers.file, (err) => {
            if (err) {
              console.error(err);
            }
            console.log("Files / directories deleted, you may want to generate & publish all index pages");
            external.init();
          });
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
    const questions = [
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
        when() { // answers
          return config.deployCmd;
        }
      }
    ];
    let generator = Generator(config);
    let answers;
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
      fs.ensureDirSync(config.directories.theme);
      fs.copySync(config.directories.themeBase, config.directories.theme);
      external.setupDialog();
    } else {
      const questions = [
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
            case choicesStr[choicesStr.length - 1]:
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

export default BlogophonConsole;
