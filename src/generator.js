'use strict';

var config         = require('./config');
var Promise        = require('promise/lib/es6-extensions');
var Mustache       = require('mustache');
var fs             = require('fs-extra');
var shell          = require('shelljs');
var glob           = require("glob");
var gm             = require('gm').subClass({imageMagick: true});
var dateFormat     = require('dateformat');
var PostReader     = require('./post-reader');
var RssJs          = require('./rssjs');
var Url            = require('./rssjs');
var toolshed       = require('./js-toolshed/src/js-toolshed');
var BlogophonUrls  = require('./blogophon-urls')();

/**
 * Generator used for creating the blog
 * @constructor
 */
var Generator = {};

var templates = {
  post:    fs.readFileSync(config.directories.theme+'/post.html', 'utf8'),
  index:   fs.readFileSync(config.directories.theme+'/index.html', 'utf8'),
  tags:    fs.readFileSync(config.directories.theme+'/tags.html', 'utf8'),
  four:    fs.readFileSync(config.directories.theme+'/404.html', 'utf8'),
  rss:     fs.readFileSync(config.directories.theme+'/rss.xml', 'utf8'),
  atom:    fs.readFileSync(config.directories.theme+'/atom.xml', 'utf8'),
  sitemap: fs.readFileSync(config.directories.theme+'/sitemap.xml', 'utf8')
};
var partials = {
  meta:    fs.readFileSync(config.directories.theme+'/partials/meta.html', 'utf8'),
  header:  fs.readFileSync(config.directories.theme+'/partials/header.html', 'utf8'),
  sidebar: fs.readFileSync(config.directories.theme+'/partials/sidebar.html', 'utf8'),
  footer:  fs.readFileSync(config.directories.theme+'/partials/footer.html', 'utf8')
};
var strings = {
  'index': 'Startseite',
  'page': 'Seite %d/%d',
  'tag': 'Artikel mit dem Tag "%s"',
};

Mustache.escape = function (string) {
  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(string).replace(/[&<>"']/g, function (s) {
    return entityMap[s];
  });
};
Object.keys(templates).map(function (template) {
  Mustache.parse(template);
});

var index = require('./index')();

/**
 * Get all articles from file system and populate `index` them into {Post}. Uses {PostReader}.
 * @return {Promise} with first parameter of `resolve` being the number of files converted.
 */
Generator.getArticles = function() {
  var i, processed = 0, maxProcessed = -1;
  index.clear();
  return new Promise (
    function(resolve, reject) {
     glob(config.directories.data + "/**/*.md", function (err, files) {
        if (err) {
          reject(err);
        }
        maxProcessed = files.length;
        var checkProcessed  = function(post) {
          index.push(post);
          if (++processed === maxProcessed) {
            index.makeNextPrev();
            resolve( processed );
          }
        };
        for (i = 0; i < maxProcessed; i++) {
          PostReader(files[i]).then(
            checkProcessed,
            reject
          );
        }
      });
    }
  );
};

/**
 * Get all {Post} from `index` and generate HTML pages.
 * @return {Promise} with first parameter of `resolve` being the number of files converted, second being the number of articles skipped.
 */
Generator.buildAllArticles = function ( force ) {
  var i,
    allPosts = index.getPosts(),
    processed = 0,
    skipped = 0,
    maxProcessed = allPosts.length,
    hashes = {}
  ;
  if (force === undefined || !force) {
    try {
      hashes = JSON.parse(fs.readFileSync('./user/hashes.json'));
    } catch (e) {
      // Here you get the error when the file was not found,
      // but you also get any other error
    }
  }
  return new Promise (
    function(resolve, reject) {
      var checkProcessed  = function(err) {
        if (err) {
          reject(err);
        }
        if (++processed === maxProcessed) {
          fs.writeFile('./user/hashes.json', JSON.stringify(hashes));
          console.log("Created " + (processed - skipped) + " articles, skipped " +  skipped + " articles");
          resolve( processed, skipped );
        }
      };

      for (i = 0; i < maxProcessed; i++) {
        var post = allPosts[i], currentHash = String(post);
        if (hashes[post.meta.Url] !== undefined && hashes[post.meta.Url] === currentHash) {
          skipped++;
          checkProcessed();
        } else {
          hashes[post.meta.Url] = currentHash;
          shell.mkdir('-p', config.directories.htdocs + post.meta.Url);
          fs.writeFile(post.meta.Filename, Mustache.render(templates.post, {
            post: post,
            config: config
          },partials),checkProcessed);
        }
      }
    }
  );
};

/**
 * Build special pages from `index` like index pages, tag pages, etc.
 * @return {Promise} with first parameter of `resolve` being the number of files converted.
 */
Generator.buildSpecialPages = function () {
  var pagedPosts = index.getPagedPosts(5),
    page,
    indexFilename,
    i,
    allPosts = index.getPosts(),
    tags = index.getTags(),
    processed = 0,
    maxProcessed = 6 + pagedPosts.length + Object.keys(tags).length
  ;

  return new Promise (
    function(resolve, reject) {
      var checkProcessed  = function(err) {
        if (err) {
          reject(err);
        }
        if (++processed === maxProcessed) {
          console.log("Created " + processed + " special pages");
          resolve( processed );
        }
      };

      fs.remove(config.directories.htdocs + '/index*', function (err) {
        for (page = 0; page < pagedPosts.length; page ++) {
          var curPageObj    = index.getPageData(page, pagedPosts.length);
          curPageObj.index  = pagedPosts[page];
          curPageObj.config = config;
          curPageObj.meta   = {
            title      : (curPageObj.currentPage === 1) ? strings.index : strings.page.sprintf(curPageObj.currentPage, curPageObj.maxPages),
            absoluteUrl: BlogophonUrls.getAbsoluteUrlOfIndex(curPageObj.currentUrl)
          };
          fs.writeFile(BlogophonUrls.getFileOfIndex(curPageObj.currentUrl), Mustache.render(templates.index, curPageObj, partials), checkProcessed);
        }
      });

      fs.remove(config.directories.htdocs + '/tagged', function (err) {
        Object.keys(tags).map(function (key) {
          shell.mkdir('-p', config.directories.htdocs + '/tagged/' + tags[key].id);
          tags[key].config = config;
          tags[key].meta   = {
            title      : strings.tag.sprintf(tags[key].title),
            absoluteUrl: BlogophonUrls.getAbsoluteUrlOfTagged(tags[key].id)
          };
          fs.writeFile(BlogophonUrls.getFileOfTagged(tags[key].id), Mustache.render(templates.index, tags[key], partials), checkProcessed);
        });

  console.log(BlogophonUrls.getFileOfIndex('tagged/index.html'));
        fs.writeFile( BlogophonUrls.getFileOfIndex('tagged/index.html'), Mustache.render(templates.tags, {
          index: Object.keys(tags).sort().map(function (key) {
            return {
              title: tags[key].title,
              url  : BlogophonUrls.getUrlOfTagged(tags[key].title)
            };
          }),
          config: config
        }, partials), checkProcessed);
      });

      fs.writeFile( BlogophonUrls.getFileOfIndex('404.html'), Mustache.render(templates.four, {
        index: index.getPosts(5),
        config: config
      }, partials), checkProcessed);

      fs.writeFile( BlogophonUrls.getFileOfIndex('posts.rss'), Mustache.render(templates.rss, {
        index: index.getPosts(10),
        pubDate: dateFormat(index.pubDate, 'ddd, dd mmm yyyy hh:MM:ss o'),
        config: config
      }), checkProcessed);

      fs.writeFile( BlogophonUrls.getFileOfIndex('rss.json'), JSON.stringify(RssJs(index.getPosts(20), dateFormat(index.pubDate, 'ddd, dd mmm yyyy hh:MM:ss o'))), checkProcessed);

      fs.writeFile( BlogophonUrls.getFileOfIndex('posts.atom'), Mustache.render(templates.atom, {
        index: index.getPosts(10),
        pubDate: dateFormat(index.pubDate, 'isoDateTime').replace(/(\d\d)(\d\d)$/, '$1:$2'),
        config: config
      }), checkProcessed);

      fs.writeFile( BlogophonUrls.getFileOfIndex('sitemap.xml'), Mustache.render(templates.sitemap, {
        index: allPosts,
        pubDate: dateFormat(index.pubDate, 'isoDateTime').replace(/(\d\d)(\d\d)$/, '$1:$2'),
        config: config
      }), checkProcessed);
    }
  );
};

/**
 * Build all articles and special pages.
 * @return {Promise} [description]
 */
Generator.buildAllPages = function ( force ) {
  return new Promise (
    function(resolve, reject) {
      Promise.all([
        Generator.buildAllArticles(force),
        Generator.buildSpecialPages()
      ]).then(
        resolve,
        reject
      );
    }
  );
};

/**
 * Copy images from Markdown area to live `htdocs`, scaling and optimizing them.
 * @return {Promise} with first parameter of `resolve` being the number of files converted.
 */
Generator.copyImages = function () {
  var i, j, processed = 0, maxProcessed = -1;
  return new Promise (
    function(resolve, reject) {
      glob(config.directories.data + "/**/*.{png,jpg,gif}", function (er, files) {
        maxProcessed = files.length * (config.imageSizes.length + 1);
        var checkProcessed  = function(err) {
          if (err) {
            reject(err);
          }
          if (++processed === maxProcessed) {
            console.log("Created " + processed + " images");
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
 * Build all articles, special pages and images.
 * @return {Promise} [description]
 */
Generator.buildAll = function ( force ) {
  return new Promise (
    function(resolve, reject) {
      Promise.all([
        Generator.buildAllArticles(force),
        Generator.buildSpecialPages(),
        Generator.copyImages()
      ]).then(
        resolve,
        reject
      );
    }
  );
};

/**
 * Executes deployment command as given in `config.json`.
 * @return {Boolean} [description]
 */
Generator.deploy = function () {
  if (config.deployCmd) {
    shell.exec(config.deployCmd);
  }
  return true;
};

module.exports = Generator;
