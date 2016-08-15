#!/usr/bin/env node

'use strict';

// var pkg            = JSON.parse(fs.readFileSync('./package.json'));
var fs             = require('fs-extra');
var inquirer       = require('inquirer');
var configFilename = 'user/config.json';

var defaultValues = require('./src/config');

defaultValues.imageSizes = defaultValues.imageSizes.map(function(i){
  return i.join('x');
});

var questions = [
  {
    type: 'input',
    name: 'name',
    message: 'The name of your site',
    default: defaultValues.name,
    validate: function(v) {
      return v ? true : 'Please supply at least a short name for your site.'
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
    message: 'Base path like `/`',
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
    message: 'Language code',
    default: defaultValues.language,
    validate: function(v) {
      return v.match(/^[a-zA-Z]+$/) ? true : 'Please supply a valid language code like `en` or `es`.';
    },
    filter: function(v) {
      return v.toLowerCase();
    }
  },{
    type: 'input',
    name: 'itemsPerPage',
    message: 'Items per page',
    default: defaultValues.itemsPerPage,
    validate: function(v) {
      return Number(v)> 0 ? true : 'Please supply a positive number.';
    },
    filter: function(v) {
      return Number(v);
    }
  },{
    type: 'input',
    name: 'defaultAuthor',
    message: 'Default author name',
    default: defaultValues.defaultAuthor.name,
    validate: function(v) {
      return v ? true : 'Please supply at least a short name for your site.'
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
    name: 'ogImage',
    message: 'URL of standard teaser image (optional)',
    default: defaultValues.ogImage,
    validate: function(v) {
      return (!v || v.match(/^http(s)?:\/\/\S+$/)) ? true : 'Please supply a valid url, starting with `http://` or leave field empty.';
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
      return (!v || v.match(/^#[a-zA-z0-9]{3,6}$/)) ? true : 'Please supply a Thex color code like `#fa647a`.';
    },
    filter: function(v) {
      return v.toLowerCase();
    }
  },{
    type: 'input',
    name: 'deployCmd',
    message: 'CLI command to copy files to your live server (optional)',
    default: defaultValues.deployCmd
  },{
    type: 'checkbox',
    name: 'imageSizes',
    message: 'What image sizes will be used?',
    default: defaultValues.imageSizes,
    choices: [
      "180x180",
      "200x200",
      "300x300",
      "320x240",
      "640x480",
      "400x225",
      "800x450"
    ]
  }
];

inquirer.prompt(questions).then(
  function (answers) {

    answers.defaultAuthor = {
      "email": answers.defaultAuthorEmail,
      "name": answers.defaultAuthor
    };
    delete(answers.defaultAuthorEmail);
    answers.imageSizes = answers.imageSizes.map(function(i) {
      return i.split(/x/);
    });
    //console.log(answers);
    fs.writeFile(configFilename, JSON.stringify(answers), function(err) {
      if (err) {
        console.error(configFilename + ' could not be written' ); process.exit(1);
      } else {
        console.log( configFilename + ' created');
      }
    });
    fs.writeFile('htdocs/robots.txt', "# http://www.robotstxt.org/\n\nUser-agent: *\nSitemap: "+defaultValues.baseUrl+defaultValues.basePath+"sitemap.xml\n", function(err) {
      if (err) {
        console.error('htdocs/robots.txt' + ' could not be written' ); process.exit(1);
      } else {
        console.log( 'htdocs/robots.txt' + ' created');
      }
    });
  },
  function(err) { console.log(err); process.exit(1); }
);
