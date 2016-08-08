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

Mustache.escape = function (string) {
  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  };
  return String(string).replace(/[&<>"]/g, function (s) {
    return entityMap[s];
  });
}

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
        var i, finishedFiles = 0;
        PostReader.on('parsed', function (post) {
          index.push(post);
          finishedFiles ++;
          if (finishedFiles === files.length) {
            index.makeNextPrev();
            resolve( finishedFiles );
          }
        });
        for (i = 0; i < files.length; i++) {
          PostReader.parse(files[i]);
        }
      });
    }
  );
};

Generator.buildAllArticles = function () {
  var i, allPosts = index.getPosts(), processed = 0, maxProcessed = allPosts.length;

  return new Promise (
    function(resolve, reject) {
      var checkProcessed  = function(filename) {
        processed ++;
        if (processed === maxProcessed) {
          console.log("Created "+processed+" articles");
          resolve( processed );
        }
      };

      for (i = 0; i < allPosts.length; i++) {
        var post = allPosts[i];
        shell.mkdir('-p', config.directories.htdocs + '/' + post.meta.Url);
        fs.writeFile(config.directories.htdocs + post.meta.Url + 'index.html', Mustache.render(templates.post, {
          post: post,
          config: config
        }),checkProcessed( post.meta.Url + 'index.html'));
      }
    }
  );
};

Generator.buildSpecialPages = function () {
  var pagedPosts = index.getPagedPosts(5),
    page,
    indexFilename,
    i,
    allPosts = index.getPosts(),
    tags = index.getTags(),
    processed = 0,
    maxProcessed = 4 + pagedPosts.length + Object.keys(tags).length
  ;

  return new Promise (
    function(resolve, reject) {
      var checkProcessed  = function(filename) {
        // console.log("Wrote " + filename);
        processed ++;
        if (processed === maxProcessed) {
          console.log("Created "+processed+" special pages");
          resolve( processed );
        }
      };

      fs.remove(config.directories.htdocs + '/index*', function (err) {
        for (page = 0; page < pagedPosts.length; page ++) {
          var curPageObj    = index.getPageData(page, pagedPosts.length);
          curPageObj.index  = pagedPosts[page];
          curPageObj.config = config;
          fs.writeFile(config.directories.htdocs + '/' + curPageObj.currentUrl, Mustache.render(templates.index, curPageObj), checkProcessed('index file'));
        }
      });

      fs.remove(config.directories.htdocs + '/tagged', function (err) {
        Object.keys(tags).map(function (key) {
          shell.mkdir('-p', config.directories.htdocs + '/tagged/' + tags[key].id);
          tags[key].config = config;
          fs.writeFile(config.directories.htdocs + '/tagged/' + tags[key].id + '/index.html', Mustache.render(templates.index, tags[key]), checkProcessed("/tagged/" + tags[key].id + '/index.html'));
        });
      });

      fs.writeFile(config.directories.htdocs + '/posts.rss', Mustache.render(templates.rss, {
        index: index.getPosts(10),
        pubDate: dateFormat(index.pubDate, 'ddd, dd mmm yyyy hh:MM:ss o'),
        config: config
      }), checkProcessed('/posts.rss'));

      fs.writeFile(config.directories.htdocs + '/rss.json', JSON.stringify(RssJs(index.getPosts(20), dateFormat(index.pubDate, 'ddd, dd mmm yyyy hh:MM:ss o'))), checkProcessed('/rss.json'));

      fs.writeFile(config.directories.htdocs + '/posts.atom', Mustache.render(templates.atom, {
        index: index.getPosts(10),
        pubDate: dateFormat(index.pubDate, 'isoDateTime'),
        config: config
      }), checkProcessed('/posts.atom'));

      fs.writeFile(config.directories.htdocs + '/sitemap.xml', Mustache.render(templates.sitemap, {
        index: index.getPosts(10),
        config: config
      }), checkProcessed('/sitemap.xml'));
    }
  );
};

Generator.copyImages = function () {
  var i, j, processed = 0, maxProcessed = -1;
  return new Promise (
    function(resolve, reject) {
      glob(config.directories.data + "/**/*.{png,jpg,gif}", function (er, files) {
        maxProcessed = files.length * (config.imageSizes.length + 1);
        var checkProcessed = function () {
          processed ++;
          if (processed === maxProcessed) {
            console.log("Created "+processed+" images");
            resolve( processed );
          }
        };
        for (i = 0; i < files.length; i++) {
          var targetFile = files[i].replace(/^user\//, config.directories.htdocs + '/');
          gm(files[i])
            .noProfile()
            .write(targetFile,checkProcessed)
          ;
          for (j = 0; j < config.imageSizes.length; j++) {
            var imageSize = config.imageSizes[j];
            gm(files[i])
              .resize(imageSize[0], imageSize[1])
              .noProfile()
              .write(targetFile.replace(/(\.[a-z]+$)/,'-'+imageSize[0]+'x'+imageSize[1]+'$1'),checkProcessed)
            ;
          }
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
  Generator.buildAllArticles();
  Generator.buildSpecialPages();
};

Generator.deploy = function () {
  console.log('# ' + config.deploy);
};

module.exports = Generator;
