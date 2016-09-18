#!/usr/bin/env node

'use strict';

var fs             = require('fs');
var inquirer       = require('inquirer');
var defaultValues  = require('./src/config');
var themesAvailable= fs.readdirSync(defaultValues.directories.theme);
var args           = require('./src/helpers/arguments')();
var Generator      = require('./src/generator');

if (themesAvailable.length < 1) {
  throw new Error('No themes found');
}

if (args.onlynew && ! defaultValues.notInitialized) {
  console.log('`config.json` already present, start without `--only-new` to overwrite configuration.');
  process.exit(0);
}

defaultValues.imageSizes = defaultValues.imageSizes.map(function(i){
  return i[0] + 'x' + i[1];
});

var questions = [
  {
    type: 'input',
    name: 'name',
    message: 'The name of your site',
    default: defaultValues.name,
    validate: function(v) {
      return v ? true : 'Please supply at least a short name for your site.';
    }
  },{
    type: 'list',
    name: 'theme',
    message: 'Choose theme',
    default: defaultValues.theme,
    choices: themesAvailable,
    when: function() {
      return (themesAvailable.length > 1);
    }
  },{
    type: 'input',
    name: 'baseUrl',
    message: 'Domain of your site, starting with `http`',
    default: defaultValues.baseUrl,
    validate: function(v) {
      return v.match(/^http(s)?:\/\/\S+$/) ? true : 'Please supply a valid url, starting with `http://`.';
    },
    filter: function(v) {
      return v.replace(/\/$/,'');
    }
  },{
    type: 'input',
    name: 'basePath',
    message: 'Base URL path, usually just `/`',
    default: defaultValues.basePath,
    validate: function(v) {
      return v.match(/^[a-zA-Z0-9\.\/_-]+$/) ? true : 'Please supply a valid path, at least `/`.';
    },
    filter: function(v) {
      return v.replace(/^([^\/])/,'/$1').replace(/([^\/])$/,'$1/');
    }
  },{
    type: 'input',
    name: 'description',
    message: 'A short description of your blog (optional)',
    default: defaultValues.description
  },{
    type: 'input',
    name: 'language',
    message: 'Standard language of your blog, like `en` for English',
    default: defaultValues.language,
    validate: function(v) {
      return v.match(/^[a-zA-Z\-]+$/) ? true : 'Please supply a valid two-letter language code like `en`, `es`, `fr` or `de`.';
    },
    filter: function(v) {
      return v.toLowerCase();
    }
  },{
    type: 'input',
    name: 'itemsPerPage',
    message: 'How many articles per page?',
    default: defaultValues.itemsPerPage,
    validate: function(v) {
      return Number(v)> 0 ? true : 'Please supply a positive number.';
    },
    filter: function(v) {
      return Number(v);
    }
  },{
    type: 'checkbox',
    name: 'imageSizes',
    message: 'What image sizes will be used?',
    default: defaultValues.imageSizes,
    choices: [
      "180x180",
      "240x240",
      "320x320",
      "640x640",
      new inquirer.Separator(),
      "320x240",
      "640x480",
      "1024x768",
      "1280x1024",
      new inquirer.Separator(),
      "400x225",
      "800x450",
      "1024x576",
      "1280x720",
      new inquirer.Separator()
    ]
  },{
    type: 'input',
    name: 'defaultAuthor',
    message: 'Default name of author',
    default: defaultValues.defaultAuthor.name,
    validate: function(v) {
      return v ? true : 'Please supply at least a short name for your site.';
    }
  },{
    type: 'input',
    name: 'defaultAuthorEmail',
    message: 'Default email address of author',
    default: defaultValues.defaultAuthor.email,
    validate: function(v) {
      return (v.match(/^\S+@\S+$/)) ? true : 'Please supply a valid email address.';
    }
  },{
    type: 'input',
    name: 'faviconBaseUrl',
    message: 'Base-URL of favicons (optional)',
    default: defaultValues.faviconBaseUrl,
    validate: function(v) {
      return (!v || v.match(/^http(s)?:\/\/\S+\/$/)) ? true : 'Please supply a valid url, starting with `http://` and ending with `/` - or leave field empty.';
    }
  },{
    type: 'checkbox',
    name: 'faviconSizes',
    message: 'What favicon sizes will be used?',
    default: defaultValues.faviconSizes,
    choices: [
      "96x96",
      "128x128",
      "144x144",
      "196x196",
      "256x256"
    ],
    when: function(answers) {
      return (answers.faviconBaseUrl);
    }
  },{
    type: 'input',
    name: 'ogImage',
    message: 'URL of standard teaser image (optional)',
    default: defaultValues.ogImage,
    validate: function(v) {
      return (!v || v.match(/^http(s)?:\/\/\S+$/)) ? true : 'Please supply a valid url, starting with `http://` or leave field empty.';
    },
    when: function(answers) {
      return (!answers.faviconBaseUrl);
    }
  },{
    type: 'input',
    name: 'twitterAccount',
    message: 'Twitter account name (optional)',
    default: defaultValues.twitterAccount,
    validate: function(v) {
      return (!v || v.match(/^[a-zA-z0-9_-]+$/)) ? true : 'Please supply a Twitter account name or leave field empty.';
    }
  },{
    type: 'input',
    name: 'themeColor',
    message: 'Basic color of your theme as hexcode (optional)',
    default: defaultValues.themeColor,
    validate: function(v) {
      return (!v || v.match(/^#[a-zA-z0-9]{3,6}$/)) ? true : 'Please supply a hex color code like `#fa647a`.';
    },
    filter: function(v) {
      return v.toLowerCase();
    }
  },{
    type: 'input',
    name: 'deployCmd',
    message: 'CLI command to copy files to your live server (optional)',
    default: defaultValues.deployCmd
  }
];

inquirer.prompt(questions).then(
  function (answers) {
    answers.theme = defaultValues.theme ? defaultValues.theme : themesAvailable[0];
    answers.defaultAuthor = {
      "email": answers.defaultAuthorEmail,
      "name": answers.defaultAuthor
    };
    delete answers.defaultAuthorEmail;
    answers.imageSizes = answers.imageSizes.map(function(i) {
      return i.split(/x/);
    });

    var ogImage = null;
    if (answers.faviconBaseUrl) {
      answers.icons = answers.faviconSizes.map(function(i) {
        ogImage = answers.faviconBaseUrl + 'favicon-'+i+'.png';
        return {
          src: ogImage,
          sizes: i,
        };
      });
    }
    if (!answers.ogImage && ogImage) {
      answers.ogImage = ogImage;
    }

    var generator = new Generator(defaultValues);
    generator.buildBasicFiles(answers);
  },
  function(err) { console.error(err); process.exit(1); }
);
