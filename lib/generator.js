'use strict';

var EventEmitter = require( "events" ).EventEmitter;
var Mustache     = require('mustache');
var fs           = require('fs-extra');
var shell        = require('shelljs');
var glob         = require("glob");
var PostReader   = require('./post_reader');

/**
 * Generator used for creating the blog
 * @constructor
 */
var Generator = new EventEmitter();

var config = {}, pkg = {}, templates;
var index = require('./index')();

/**
 * [init description]
 * @param  {[type]} Cconfig [description]
 * @param  {[type]} Cpkg    [description]
 * @return {[type]}         [description]
 */
Generator.init = function ( Cconfig, Cpkg ) {
  config = Cconfig;
  pkg    = Cpkg;
  templates = {
    post:    fs.readFileSync(pkg.directories.theme+'/post.html', 'utf8'),
    index:   fs.readFileSync(pkg.directories.theme+'/index.html', 'utf8'),
    rss:     fs.readFileSync(pkg.directories.theme+'/rss.xml', 'utf8'),
    sitemap: fs.readFileSync(pkg.directories.theme+'/sitemap.xml', 'utf8')
  };

  Object.keys(templates).map(function (template) {
    Mustache.parse(template);
  });
}

/**
 * [buildArticles description]
 * @return {[type]} [description]
 */
Generator.buildArticles = function () {
  glob(pkg.directories.data + "/**/*.md", function (er, files) {
    var i, finished = 0;

    PostReader.on('parsed', function (post) {
      shell.mkdir('-p', pkg.directories.htdocs + '/' + post.meta.Url);
      fs.writeFile(pkg.directories.htdocs + '/' + post.meta.Url + 'index.html', Mustache.render(templates.post, {
        meta: post.meta,
        content: post.html,
        config: config
      }));
      // console.log("Wrote " + post.meta.Url + "index.html");
      index.push(post);
      finished ++;
      if (finished === files.length) {
        console.log("Wrote "+files.length+" articles");
        Generator.emit('articlesBuild', finished);
      }
    });

    for (i = 0; i < files.length; i++) {
      PostReader.parse(files[i]);
    }
  });
};

/**
 * [buildOtherPages description]
 * @return {[type]} [description]
 */
Generator.buildOtherPages = function ( ) {
  var pagedPosts = index.getPagedPosts(5), page, indexFilename;

  fs.writeFile(pkg.directories.htdocs + '/sitemap.json', JSON.stringify(index.getPosts()), function() {
    console.log("Wrote sitemap.json");
  });

  fs.remove(pkg.directories.htdocs + '/index*', function (err) {
    for (page = 0; page < pagedPosts.length; page ++) {
      var curPageObj    = index.getPageData(page, pagedPosts.length);
      curPageObj.index  = pagedPosts[page];
      curPageObj.config = config;
      fs.writeFile(pkg.directories.htdocs + '/' + curPageObj.currentUrl, Mustache.render(templates.index, curPageObj), function() {
        console.log("Wrote index file");
      });
    }
  });

  fs.writeFile(pkg.directories.htdocs + '/posts.rss', Mustache.render(templates.rss, {
    index: index.getPosts(10),
    config: config
  }), function () {
    console.log("Wrote posts.rss");
  });

  fs.writeFile(pkg.directories.htdocs + '/sitemap.xml', Mustache.render(templates.sitemap, {
    index: index.getPosts(10),
    config: config
  }),function () {
    console.log("Wrote sitemap.xml");
  });

  var tags = index.getTags();
  fs.remove(pkg.directories.htdocs + '/tagged', function (err) {
    Object.keys(tags).map(function (key) {
      shell.mkdir('-p', pkg.directories.htdocs + '/tagged/' + tags[key].id);
      tags[key].config = config;
      fs.writeFile(pkg.directories.htdocs + '/tagged/' + tags[key].id + '/index.html', Mustache.render(templates.index, tags[key]), function() {
          console.log("Wrote tagged/" + tags[key].id + '/index.html');
      });
    });
  });
};

Generator.copyImages = function () {
  glob(pkg.directories.data + "/**/*.{png,jpg,gif}", function (er, files) {
    var i, copiedFiles = 0;
    var copyEnd = function () {
      copiedFiles ++;
      if (copiedFiles === files.length) {
        console.log("Copied "+copiedFiles+" images");
      }
    };
    for (i = 0; i < files.length; i++) {
      fs.copy(files[i], files[i].replace(/^user\//, 'htdocs/'), copyEnd);
    }
  });
};

module.exports = Generator;
