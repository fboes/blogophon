'use strict';

var EventEmitter = require( "events" ).EventEmitter;
var Mustache     = require('mustache');
var fs           = require('fs-extra');
var shell        = require('shelljs');
var glob         = require("glob");
var PostReader   = require('./post_reader');
var config       = require('./config');
var gm           = require('gm').subClass({imageMagick: true});

/**
 * Generator used for creating the blog
 * @constructor
 */
var Generator = new EventEmitter();

var templates;
var index = require('./index')();

/**
 * [init description]
 * @return {[type]}         [description]
 */
Generator.init = function ( ) {
  templates = {
    post:    fs.readFileSync(config.directories.theme+'/post.html', 'utf8'),
    index:   fs.readFileSync(config.directories.theme+'/index.html', 'utf8'),
    rss:     fs.readFileSync(config.directories.theme+'/rss.xml', 'utf8'),
    sitemap: fs.readFileSync(config.directories.theme+'/sitemap.xml', 'utf8')
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
  glob(config.directories.data + "/**/*.md", function (er, files) {
    var i, finished = 0;

    PostReader.on('parsed', function (post) {
      shell.mkdir('-p', config.directories.htdocs + '/' + post.meta.Url);
      fs.writeFile(config.directories.htdocs + '/' + post.meta.Url + 'index.html', Mustache.render(templates.post, {
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

  fs.writeFile(config.directories.htdocs + '/sitemap.json', JSON.stringify(index.getPosts()), function() {
    console.log("Wrote sitemap.json");
  });

  fs.remove(config.directories.htdocs + '/index*', function (err) {
    for (page = 0; page < pagedPosts.length; page ++) {
      var curPageObj    = index.getPageData(page, pagedPosts.length);
      curPageObj.index  = pagedPosts[page];
      curPageObj.config = config;
      fs.writeFile(config.directories.htdocs + '/' + curPageObj.currentUrl, Mustache.render(templates.index, curPageObj), function() {
        console.log("Wrote index file");
      });
    }
  });

  fs.writeFile(config.directories.htdocs + '/posts.rss', Mustache.render(templates.rss, {
    index: index.getPosts(10),
    config: config
  }), function () {
    console.log("Wrote posts.rss");
  });

  fs.writeFile(config.directories.htdocs + '/sitemap.xml', Mustache.render(templates.sitemap, {
    index: index.getPosts(10),
    config: config
  }),function () {
    console.log("Wrote sitemap.xml");
  });

  var tags = index.getTags();
  fs.remove(config.directories.htdocs + '/tagged', function (err) {
    Object.keys(tags).map(function (key) {
      shell.mkdir('-p', config.directories.htdocs + '/tagged/' + tags[key].id);
      tags[key].config = config;
      fs.writeFile(config.directories.htdocs + '/tagged/' + tags[key].id + '/index.html', Mustache.render(templates.index, tags[key]), function() {
          console.log("Wrote tagged/" + tags[key].id + '/index.html');
      });
    });
  });
};

Generator.copyImages = function () {
  glob(config.directories.data + "/**/*.{png,jpg,gif}", function (er, files) {
    var i, copiedFiles = 0;
    var copyEnd = function () {
      copiedFiles ++;
      if (copiedFiles === files.length) {
        console.log("Copied "+copiedFiles+" images");
      }
    };
    for (i = 0; i < files.length; i++) {
      var targetFile = files[i].replace(/^user\//, config.directories.htdocs + '/');
      fs.copy(files[i], targetFile, copyEnd);
      config.imageSizes.forEach(function(imageSize) {
        // console.log(targetFile.replace(/(\.[a-z]+$)/,'-'+imageSize[0]+'x'+imageSize[1]+'$1'));
        gm(files[i])
          .resize(imageSize[0], imageSize[1])
          .noProfile()
          .write(targetFile.replace(/(\.[a-z]+$)/,'-'+imageSize[0]+'x'+imageSize[1]+'$1'),function() {

          })
        ;
      })
    }
  });
};

module.exports = Generator;
