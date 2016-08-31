'use strict';

var config         = require('./config');
var Promise        = require('promise/lib/es6-extensions');
var Mustache       = require('./blogophon-mustache');
var fs             = require('fs-extra');
var shell          = require('shelljs');
var glob           = require("glob");
var gm             = require('gm').subClass({imageMagick: true});
var dateFormat     = require('dateformat');
var PostReader     = require('./post-reader');
var RssJs          = require('./rssjs');
var Manifest       = require('./manifest');
var translations   = require('./translations');
var toolshed       = require('./js-toolshed/src/js-toolshed');
var BlogophonUrls  = require('./blogophon-urls')();
var path           = require('path');

/**
 * Generator used for creating the blog.
 * @constructor
 */
var Generator = {};
var index = require('./index')();

Generator.strings = translations(config.language).getAll();

/**
 * Get all articles from file system and populate `index` into {Post}. Uses {PostReader}.
 * @return {Promise} with first parameter of `resolve` being the number of files converted.
 */
Generator.getArticles = function() {
  index.clear();
  return new Promise (
    function(resolve, reject) {
      glob(config.directories.data + "/**/*.md", function (err, files) {
        if (err) {
          reject(err);
        }
       // Making promises
        var promises = files.map(function(i) {
          return PostReader(i);
        });
        // Checking promises
        Promise
          .all(promises)
          .then(function(posts) {
            index.pushArray(posts);
            console.log('Removed ' + index.removeFutureItems() + ' item(s) with future timestamp from index');
            index.makeNextPrev();
            resolve( files.length );
          })
          .catch(reject)
        ;
      });
    }
  );
};

/**
 * Get all {Post} from `index` and generate HTML pages.
 * @return {Promise} with first parameter of `resolve` being the list of files generated.
 */
Generator.buildAllArticles = function( force ) {
  var i,
    allPosts = index.getPosts(),
    skipped = 0,
    hashes = {},
    generatedArticles = []
  ;
  if (force === undefined || !force) {
    try {
      hashes = require('../user/hashes.json');
    } catch (e) {
      hashes = {};
    }
  }
  return new Promise (
    function(resolve, reject) {
      // Making promises
      var promises = allPosts.map(function(post) {
        var currentHash = String(post);
        if (hashes[post.meta.Url] !== undefined && hashes[post.meta.Url] === currentHash) {
          skipped++;
        } else {
          hashes[post.meta.Url] = currentHash;
          generatedArticles.push(post.meta.Url);

          return Generator.buildSingleArticle(post);
        }
      });
      // Checking promises
      Promise
        .all(promises)
        .then(function() {
          fs.writeFileSync('./user/hashes.json', JSON.stringify(hashes, undefined, 2));
          console.log("Created " + generatedArticles.length + " articles, skipped " +  skipped + " articles");
          resolve(generatedArticles);
        })
        .catch(reject)
      ;
    }
  );
};

/**
 * Build a single article
 * @param  {Post} post [description]
 * @return {Promise}  with first parameter being the filename
 */
Generator.buildSingleArticle = function( post ) {
  if (!post) {
    throw new Error('Empty post');
  }
  return new Promise (
    function (resolve, reject) {
      shell.mkdir('-p', config.directories.htdocs + post.meta.Url);
      fs.writeFile(post.meta.Filename, Mustache.render(Mustache.templates.post, {
        post: post,
        config: config
      },Mustache.partials), function(err) {
        if (err) {
          reject(err);
        }
        resolve(post.meta.Filename);
      });
    }
  );
};

/**
 * Build special pages from `index` like index pages, tag pages, etc.
 * @return {Promise} with first parameter of `resolve` being the number of files converted.
 */
Generator.buildSpecialPages = function () {
  var pagedPosts = index.getPagedPosts(config.itemsPerPage),
    page,
    indexFilename,
    i,
    allPosts = index.getPosts(),
    tags = index.getTags(),
    authors = index.getAuthors(),
    processed = 0,
    maxProcessed = 8 + pagedPosts.length + Object.keys(tags).length + Object.keys(authors).length
  ;
  var tagPages = Object.keys(tags).sort().map(function (key) {
    return {
      title: tags[key].title,
      url  : BlogophonUrls.getUrlOfTagged(tags[key].title)
    };
  });
  var authorPages = Object.keys(authors).sort().map(function (name) {
    return {
      title: name,
      url  : BlogophonUrls.getUrlOfAuthor(name)
    };
  });

  return new Promise (
    function(resolve, reject) {
      var checkProcessed = function(err) {
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
            title      : (curPageObj.currentPage === 1) ? Generator.strings.index : Generator.strings.page.sprintf(curPageObj.currentPage, curPageObj.maxPages),
            absoluteUrl: BlogophonUrls.getAbsoluteUrlOfIndex(curPageObj.currentUrl)
          };
          curPageObj.prevUrl = BlogophonUrls.getUrlOfIndex(curPageObj.prevUrl);
          curPageObj.nextUrl = BlogophonUrls.getUrlOfIndex(curPageObj.nextUrl);
          fs.writeFile(BlogophonUrls.getFileOfIndex(curPageObj.currentUrl), Mustache.render(Mustache.templates.index, curPageObj, Mustache.partials), checkProcessed);
        }
      });

      fs.remove(config.directories.htdocs + '/tagged', function (err) {
        shell.mkdir('-p', config.directories.htdocs + '/tagged');
        Object.keys(tags).map(function (key) {
          shell.mkdir('-p', config.directories.htdocs + '/tagged/' + tags[key].id);
          tags[key].config = config;
          tags[key].meta   = {
            title      : Generator.strings.tag.sprintf(tags[key].title),
            absoluteUrl: BlogophonUrls.getAbsoluteUrlOfTagged(tags[key].id)
          };
          fs.writeFile(BlogophonUrls.getFileOfTagged(tags[key].id), Mustache.render(Mustache.templates.index, tags[key], Mustache.partials), checkProcessed);
        });

        fs.writeFile( BlogophonUrls.getFileOfIndex('tagged/index.html'), Mustache.render(Mustache.templates.tags, {
          index: tagPages,
          config: config
        }, Mustache.partials), checkProcessed);
      });

      fs.remove(config.directories.htdocs + '/authored-by', function (err) {
        shell.mkdir('-p', config.directories.htdocs + '/authored-by');
        Object.keys(authors).map(function (name) {
          shell.mkdir('-p', path.dirname(BlogophonUrls.getFileOfAuthor(name)));
          fs.writeFile(BlogophonUrls.getFileOfAuthor(name), Mustache.render(Mustache.templates.index, {
            config: config,
            index: authorPages[name],
            meta:  {
              title      : Generator.strings.author.sprintf(name),
              absoluteUrl: BlogophonUrls.getAbsoluteUrlOfAuthor(name)
            }
          }, Mustache.partials), checkProcessed);
        });

        fs.writeFile( BlogophonUrls.getFileOfIndex('authored-by/index.html'), Mustache.render(Mustache.templates.authors, {
          index: authorPages,
          config: config
        }, Mustache.partials), checkProcessed);
      });

      fs.writeFile( BlogophonUrls.getFileOfIndex('404.html'), Mustache.render(Mustache.templates.four, {
        index: index.getPosts(5),
        config: config
      }, Mustache.partials), checkProcessed);

      fs.writeFile( BlogophonUrls.getFileOfIndex('posts.rss'), Mustache.render(Mustache.templates.rss, {
        index: index.getPosts(10),
        pubDate: dateFormat(index.pubDate, 'ddd, dd mmm yyyy hh:MM:ss o'),
        config: config
      }), checkProcessed);

      fs.writeFile( BlogophonUrls.getFileOfIndex('rss.json'), JSON.stringify(RssJs(index.getPosts(20), dateFormat(index.pubDate, 'ddd, dd mmm yyyy hh:MM:ss o')), undefined, 2), checkProcessed);

      fs.writeFile( BlogophonUrls.getFileOfIndex('manifest.json'), JSON.stringify(Manifest, undefined, 2), checkProcessed);

      fs.writeFile( BlogophonUrls.getFileOfIndex('posts.atom'), Mustache.render(Mustache.templates.atom, {
        index: index.getPosts(10),
        pubDate: dateFormat(index.pubDate, 'isoDateTime').replace(/(\d\d)(\d\d)$/, '$1:$2'),
        config: config
      }), checkProcessed);

      fs.writeFile( BlogophonUrls.getFileOfIndex('sitemap.xml'), Mustache.render(Mustache.templates.sitemap, {
        index: allPosts,
        tagPages: tagPages,
        pubDate: dateFormat(index.pubDate, 'isoDateTime').replace(/(\d\d)(\d\d)$/, '$1:$2'),
        config: config
      }), checkProcessed);
    }
  );
};

/**
 * Copy images from Markdown area to live `htdocs`, scaling and optimizing them.
 * @return {Promise} with first parameter of `resolve` being the number of files converted.
 */
Generator.copyImages = function ( article ) {
  article = article.replace(/\/$/, '').replace(/^.+\//,'') || '**';
  var i, j, processed = 0, maxProcessed = -1;
  return new Promise (
    function(resolve, reject) {
      glob(config.directories.data + "/" + article + "/*.{png,jpg,gif}", function (er, files) {
        maxProcessed = files.length * (config.imageSizes.length + 1);
        if (files.length === 0) {
          resolve( processed );
        }
        var checkProcessed = function(err) {
          if (err) {
            reject(err);
          }
          if (++processed === maxProcessed) {
            console.log("Converted " + processed + " images");
            resolve( processed );
          }
        };
        for (i = 0; i < files.length; i++) {
          var targetFile = files[i].replace(/^user\//, config.directories.htdocs + '/');
          shell.mkdir('-p', targetFile.replace(/(\/).+?$/, '$1'));
          gm(files[i])
            .noProfile()
            .interlace('Line')
            .write(targetFile,checkProcessed)
          ;
          for (j = 0; j < config.imageSizes.length; j++) {
            var imageSize = config.imageSizes[j];
            gm(files[i])
              .resize(imageSize[0], imageSize[1])
              .interlace('Line')
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
      Generator
        .buildAllArticles(force)
        .then(function (generatedArticles) {
          var promises = generatedArticles.map(function( article ) {
            return Generator.copyImages( article );
          });
          if (generatedArticles.length) {
            promises.push(Generator.buildSpecialPages());
          }
          Promise
            .all(promises)
            .then(resolve)
            .catch(reject)
          ;
        })
        .catch(reject)
      ;
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
