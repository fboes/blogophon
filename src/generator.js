'use strict';

var config         = require('./config');
var Promise        = require('promise/lib/es6-extensions');
var fs             = require('fs-extra-promise');
var glob           = require("glob");
var gm             = require('gm').subClass({imageMagick: true});
var dateFormat     = require('dateformat');
var Mustache       = require('./helpers/blogophon-mustache').getTemplates(config.directories.currentTheme + '/templates');
var PostReader     = require('./post-reader');
var rssJs          = require('./models/rss-js');
var manifest       = require('./models/manifest');
var Translations   = require('./helpers/translations');
var toolshed       = require('./helpers/js-toolshed');
var IndexUrl       = require('./helpers/index-url');
var index          = require('./index');
var hashes         = require('./models/hashes');

/**
 * Generator used for creating the blog.
 * @constructor
 */
var Generator = {
  strings: new Translations(config.language).getAll(),
  currentIndex: null,
  hashes: hashes(),

  /**
   * Get all articles from file system and populate `index` into {Post}. Uses {PostReader}.
   * @return {Promise} with first parameter of `resolve` being the number of files converted.
   */
  getArticles: function() {
    Generator.currentIndex = index();
    return new Promise (
      function(resolve, reject) {
        glob(config.directories.data + "/**/*.md", function(err, files) {
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
              Generator.currentIndex.pushArray(posts);
              console.log('Removed ' + Generator.currentIndex.removeFutureItems() + ' item(s) with future timestamp from index');
              Generator.currentIndex.makeNextPrev();
              resolve( files.length );
            })
            .catch(reject)
          ;
        });
      }
    );
  },

  /**
   * Get all {Post} from `index` and generate HTML pages.
   * @return {Promise} with first parameter of `resolve` being the list of files generated.
   */
  buildAllArticles: function(force) {
    var allPosts = Generator.currentIndex.getPosts();
    var skipped = 0;
    var generatedArticles = [];

    if (force) {
      fs.removeSync(config.directories.htdocs + '/posts/*');
    }

    return new Promise (
      function(resolve, reject) {
        // Making promises
        var promises = allPosts.map(function(post) {
          if (!force && Generator.hashes.isHashed(post.meta.Url, post.hash)) {
            skipped++;
          } else {
            generatedArticles.push(post.meta.Url);
            return Generator.buildSingleArticle(post);
          }
        });
        // Checking promises
        Promise
          .all(promises)
          .then(function() {
            Generator.hashes.save();
            console.log("Created " + generatedArticles.length + " articles, skipped " +  skipped + " articles");
            resolve(generatedArticles);
          })
          .catch(reject)
        ;
      }
    );
  },

  /**
   * Build a single article
   * @param  {Post} post [description]
   * @return {Promise}  with first parameter being the filename
   */
  buildSingleArticle: function(post) {
    if (!post) {
      throw new Error('Empty post');
    }
    return new Promise (
      function(resolve, reject) {
        fs.ensureDir(config.directories.htdocs + post.meta.Url, function() {
          fs.writeFile(post.meta.Filename, Mustache.render(Mustache.templates.post, {
            post: post,
            config: config
          },Mustache.partials), function(err) {
            if (err) {
              reject(err);
            }
            if (Generator.hashes) {
              Generator.hashes.update(post.meta.Url, post.hash);
            }
            resolve(post.meta.Filename);
          });
        });
      }
    );
  },

  /**
   * Build special pages from `index` like index pages, tag pages, etc.
   * @return {Promise} with first parameter of `resolve` being an array with the numbers of files converted.
   */
  buildSpecialPages: function() {
    return new Promise (
      function(resolve, reject) {
        Promise
          .all([
            Generator.buildIndexFiles(),
            Generator.buildTagPages(),
            Generator.buildAuthorPages(),
            Generator.buildMetaFiles()
          ])
          .then(resolve)
          .catch(reject)
        ;
       }
    );
  },

  /**
   * [buildIndexFiles description]
   * @return {Promise} with first parameter of `resolve` being the number of files converted.
   */
  buildIndexFiles: function() {
    return new Promise (
      function(resolve, reject) {
        fs.remove(config.directories.htdocs + '/index*', function(err) {
          var promises = [];
          var page;
          var pagedPosts = Generator.currentIndex.getPagedPosts(config.itemsPerPage);

          for (page = 0; page < pagedPosts.length; page ++) {
            var curPageObj    = Generator.currentIndex.getPageData(page, pagedPosts.length);
            curPageObj.index  = pagedPosts[page];
            curPageObj.config = config;
            curPageObj.meta   = {
              title      : (curPageObj.currentPage === 1) ? Generator.strings.index : Generator.strings.page.sprintf(curPageObj.currentPage, curPageObj.maxPages),
              absoluteUrl: new IndexUrl(curPageObj.currentUrl).absoluteUrl()
            };
            curPageObj.prevUrl = new IndexUrl(curPageObj.prevUrl).relativeUrl();
            curPageObj.nextUrl = new IndexUrl(curPageObj.nextUrl).relativeUrl();
            promises.push(fs.writeFile(new IndexUrl(curPageObj.currentUrl).filename(), Mustache.render(Mustache.templates.index, curPageObj, Mustache.partials)));
          }
          Promise
            .all(promises)
            .then(function() {
              console.log("Wrote "+promises.length+" index files");
              return resolve(promises.length);
            })
            .catch(reject)
          ;
        });
      }
    );
  },

  /**
   * [buildTagPages description]
   * @return {Promise} with first parameter of `resolve` being the number of files converted.
   */
  buildTagPages: function() {
    return new Promise (
      function(resolve, reject) {
        var tags = Generator.currentIndex.getTags();
        var tagPages = Object.keys(tags).sort().map(function(key) {
          return {
            title: tags[key].title,
            url  : tags[key].urlObj.relativeUrl()
          };
        });

        fs.remove(config.directories.htdocs + '/tagged', function(err) {
          fs.ensureDirSync(config.directories.htdocs + '/tagged');

          var promises = Object.keys(tags).map(function(key) {
            fs.ensureDirSync(tags[key].urlObj.dirname());
            tags[key].config = config;
            tags[key].meta   = {
              title      : Generator.strings.tag.sprintf(tags[key].title),
              absoluteUrl: tags[key].urlObj.absoluteUrl()
            };
            return fs.writeFile(tags[key].urlObj.filename(), Mustache.render(Mustache.templates.index, tags[key], Mustache.partials));
          });

          promises.push(fs.writeFile( new IndexUrl('tagged/index.html').filename(), Mustache.render(Mustache.templates.tags, {
            index: tagPages,
            config: config
          }, Mustache.partials)));

          Promise
            .all(promises)
            .then(function() {
              console.log("Wrote "+promises.length+" tag pages");
              return resolve(promises.length);
            })
            .catch(reject)
          ;
        });
      }
    );
  },

  /**
   * [buildAuthorPages description]
   * @return {Promise} with first parameter of `resolve` being the number of files converted.
   */
  buildAuthorPages: function() {
    return new Promise (
      function(resolve, reject) {
        var authors = Generator.currentIndex.getAuthors();
        var authorPages = Object.keys(authors).sort().map(function(name) {
          return {
            title: name,
            url  : authors[name].urlObj.relativeUrl()
          };
        });

        fs.remove(config.directories.htdocs + '/authored-by', function(err) {
          fs.ensureDirSync(config.directories.htdocs + '/authored-by');

          var promises = Object.keys(authors).map(function(name) {
            fs.ensureDirSync(authors[name].urlObj.dirname());
            authors[name].config = config;
            authors[name].meta   = {
              title      : Generator.strings.tag.sprintf(authors[name].title),
              absoluteUrl: authors[name].urlObj.absoluteUrl()
            };
            return fs.writeFile(authors[name].urlObj.filename(), Mustache.render(Mustache.templates.index, authors[name], Mustache.partials));
          });

          promises.push(fs.writeFile( new IndexUrl('authored-by/index.html').filename(), Mustache.render(Mustache.templates.authors, {
            index: authorPages,
            config: config
          }, Mustache.partials)));

          Promise
            .all(promises)
            .then(function() {
              console.log("Wrote "+promises.length+" author pages");
              return resolve(promises.length);
            })
            .catch(reject)
          ;
        });
      }
    );
  },

  /**
   * Build 404 pages, sitemaps, newsfeeds an stuff like that
   * @return {Promise} with first parameter of `resolve` being the number of files converted.
   */
  buildMetaFiles: function() {
    return new Promise (
      function(resolve, reject) {
        var tags = Generator.currentIndex.getTags();
        var tagPages = Object.keys(tags).sort().map(function(key) {
          return {
            title: tags[key].title,
            url  : tags[key].urlObj.relativeUrl()
          };
        });

        var promises = [
          fs.writeFile( new IndexUrl('404.html').filename(), Mustache.render(Mustache.templates.four, {
            index: Generator.currentIndex.getPosts(5),
            config: config
          }, Mustache.partials)),

          fs.writeFile( new IndexUrl('posts.rss').filename(), Mustache.render(Mustache.templates.rss, {
            index: Generator.currentIndex.getPosts(10),
            pubDate: dateFormat(Generator.currentIndex.pubDate, 'ddd, dd mmm yyyy hh:MM:ss o'),
            config: config
          })),

          fs.writeFile( new IndexUrl('rss.json').filename(), JSON.stringify(rssJs(Generator.currentIndex.getPosts(20), dateFormat(Generator.currentIndex.pubDate, 'ddd, dd mmm yyyy hh:MM:ss o'), config), undefined, 2)),

          fs.writeFile( new IndexUrl('manifest.json').filename(), JSON.stringify(manifest(config), undefined, 2)),

          fs.writeFile( new IndexUrl('posts.atom').filename(), Mustache.render(Mustache.templates.atom, {
            index: Generator.currentIndex.getPosts(10),
            pubDate: dateFormat(Generator.currentIndex.pubDate, 'isoDateTime').replace(/(\d\d)(\d\d)$/, '$1:$2'),
            config: config
          })),

          fs.writeFile( new IndexUrl('sitemap.xml').filename(), Mustache.render(Mustache.templates.sitemap, {
            index: Generator.currentIndex.getPosts(),
            tagPages: tagPages,
            pubDate: dateFormat(Generator.currentIndex.pubDate, 'isoDateTime').replace(/(\d\d)(\d\d)$/, '$1:$2'),
            config: config
          }))
        ];

        Promise
          .all(promises)
          .then(function() {
            console.log("Wrote "+promises.length+" meta files");
            return resolve(promises.length);
          })
          .catch(reject)
        ;
      }
    );
  },

  /**
   * Copy images from Markdown area to live `htdocs`, scaling and optimizing them.
   * @return {Promise} with first parameter of `resolve` being the number of files converted.
   */
  copyImages: function(article) {
    article = article.replace(/\/$/, '').replace(/^.+\//,'') || '**';
    var i, j, processed = 0, maxProcessed = -1;
    return new Promise (
      function(resolve, reject) {
        glob(config.directories.data + "/" + article + "/*.{png,jpg,gif}", function(er, files) {
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
            fs.ensureDirSync(targetFile.replace(/(\/).+?$/, '$1'));
            gm(files[i])
              .noProfile()
              .interlace('Line')
              .write(targetFile,checkProcessed)
            ;
            for (j = 0; j < config.imageSizes.length; j++) {
              var imageSize = config.imageSizes[j];
              gm(files[i])
                .noProfile()
                .geometry(imageSize[0], imageSize[1], "^")
                .gravity('Center')
                .crop(imageSize[0], imageSize[1])
                .interlace('Line')
                .write(targetFile.replace(/(\.[a-z]+$)/,'-'+imageSize[0]+'x'+imageSize[1]+'$1'),checkProcessed)
              ;
            }
          }
        });
      }
    );
  },

  /**
   * Build all articles, special pages and images.
   * @return {Promise} [description]
   */
  buildAll: function(force) {
    return new Promise (
      function(resolve, reject) {
        Generator
          .buildAllArticles(force)
          .then(function(generatedArticles) {
            var promises = generatedArticles.map(function(article) {
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
  },

  /**
   * Executes deployment command as given in `config.json`.
   * @return {Boolean} [description]
   */
  deploy: function() {
    var shell = require('shelljs');
    if (config.deployCmd) {
      console.log('Deploying...');
      shell.exec(config.deployCmd);
      console.log('Finished deploying');
    }
    return true;
  }
};

module.exports = Generator;
