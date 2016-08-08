'use strict';

var Mustache     = require('mustache');
var fs           = require('fs-extra');
var shell        = require('shelljs');
var glob         = require("glob");
var PostReader   = require('./post_reader');
var config       = require('./config');
var gm           = require('gm').subClass({imageMagick: true});
var dateFormat   = require('dateformat');
var RssJs        = require('./rssjs');
var Promise      = require('promise/lib/es6-extensions');

/**
 * Generator used for creating the blog
 * @constructor
 */
var Generator = {};

var templates = {
  post:    fs.readFileSync(config.directories.theme+'/post.html', 'utf8'),
  index:   fs.readFileSync(config.directories.theme+'/index.html', 'utf8'),
  rss:     fs.readFileSync(config.directories.theme+'/rss.xml', 'utf8'),
  atom:    fs.readFileSync(config.directories.theme+'/atom.xml', 'utf8'),
  sitemap: fs.readFileSync(config.directories.theme+'/sitemap.xml', 'utf8')
};
Object.keys(templates).map(function (template) {
  Mustache.parse(template);
});
var index = require('./index')();

/**
 * [buildArticles description]
 * @return {[type]} [description]
 */
Generator.getArticles = function() {
  return new Promise (
    function(resolve, reject) {
      glob(config.directories.data + "/**/*.md", function (er, files) {
        var i, finished = 0;
        PostReader.on('parsed', function (post) {
          index.push(post);
          finished ++;
          if (finished === files.length) {
            index.makeNextPrev();
            resolve( finished );
          }
        });
        for (i = 0; i < files.length; i++) {
          PostReader.parse(files[i]);
        }
      });
    }
  );
};

/**
 * [buildOtherPages description]
 * @return {[type]} [description]
 */
Generator.buildAllPages = function ( ) {
  var pagedPosts = index.getPagedPosts(5), page, indexFilename, i, allPosts = index.getPosts();
  var fileReady  = function(filename) {
    console.log("Wrote " + filename);
  };
      console.log(allPosts);

  for (i = 0; i < allPosts.length; i++) {
    var post = allPosts[i];
    shell.mkdir('-p', config.directories.htdocs + '/' + post.meta.Url);
    fs.writeFile(config.directories.htdocs + post.meta.Url + 'index.html', Mustache.render(templates.post, {
      post: post,
      config: config
    }),fileReady( post.meta.Url + 'index.html'));
  }

  fs.remove(config.directories.htdocs + '/index*', function (err) {
    for (page = 0; page < pagedPosts.length; page ++) {
      var curPageObj    = index.getPageData(page, pagedPosts.length);
      curPageObj.index  = pagedPosts[page];
      curPageObj.config = config;
      fs.writeFile(config.directories.htdocs + '/' + curPageObj.currentUrl, Mustache.render(templates.index, curPageObj), fileReady('index file'));
    }
  });

  fs.writeFile(config.directories.htdocs + '/sitemap.json', JSON.stringify(allPosts), fileReady("/sitemap.json"));

  fs.writeFile(config.directories.htdocs + '/posts.rss', Mustache.render(templates.rss, {
    index: index.getPosts(10),
    pubDate: dateFormat(index.pubDate, 'ddd, dd mmm yyyy hh:MM:ss o'),
    config: config
  }), fileReady('/posts.rss'));

  fs.writeFile(config.directories.htdocs + '/rss.json', JSON.stringify(RssJs(allPosts, dateFormat(index.pubDate, 'ddd, dd mmm yyyy hh:MM:ss o'))), fileReady('/rss.json'));

  fs.writeFile(config.directories.htdocs + '/posts.atom', Mustache.render(templates.atom, {
    index: index.getPosts(10),
    pubDate: dateFormat(index.pubDate, 'isoDateTime'),
    config: config
  }), fileReady('/posts.atom'));

  fs.writeFile(config.directories.htdocs + '/sitemap.xml', Mustache.render(templates.sitemap, {
    index: index.getPosts(10),
    config: config
  }), fileReady('/sitemap.xml'));

  var tags = index.getTags();
  fs.remove(config.directories.htdocs + '/tagged', function (err) {
    Object.keys(tags).map(function (key) {
      shell.mkdir('-p', config.directories.htdocs + '/tagged/' + tags[key].id);
      tags[key].config = config;
      fs.writeFile(config.directories.htdocs + '/tagged/' + tags[key].id + '/index.html', Mustache.render(templates.index, tags[key]), fileReady("/tagged/" + tags[key].id + '/index.html'));
    });
  });
};

Generator.copyImages = function () {
  glob(config.directories.data + "/**/*.{png,jpg,gif}", function (er, files) {
    var i, j, copiedFiles = 0;
    var copyEnd = function () {
      copiedFiles ++;
      if (copiedFiles === files.length) {
        console.log("Copied "+copiedFiles+" images");
      }
    };
    for (i = 0; i < files.length; i++) {
      var targetFile = files[i].replace(/^user\//, config.directories.htdocs + '/');
      fs.copy(files[i], targetFile, copyEnd);
      for (j = 0; j < config.imageSizes.length; j++) {
        var imageSize = config.imageSizes[j];
        gm(files[i])
          .resize(imageSize[0], imageSize[1])
          .noProfile()
          .write(targetFile.replace(/(\.[a-z]+$)/,'-'+imageSize[0]+'x'+imageSize[1]+'$1'),function() {

          })
        ;
      }
    }
  });
};

module.exports = Generator;
