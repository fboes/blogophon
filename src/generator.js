'use strict';

var SuperString    = require('./helpers/super-string');
var Promise        = require('promise/lib/es6-extensions');
var fs             = require('fs-extra-promise');
var glob           = require("glob");
var gm             = require('gm').subClass({imageMagick: true});
var blogophonDate  = require('./models/blogophon-date');
var Mustache       = require('./helpers/blogophon-mustache');
var PostReader     = require('./post-reader');
var jsonRss        = require('./models/json-rss');
var geoJson        = require('./models/geo-json');
var Translations   = require('./helpers/translations');
var IndexUrl       = require('./helpers/index-url');
var Index          = require('./index');
var hashes         = require('./models/hashes');
var appleNewsFormat = require('./models/apple-news-format');

/**
 * Generator used for creating the blog.
 * @constructor
 */
var Generator = function (config) {
  if (!config) {
    throw new Error('config is empty');
  }
  this.config       = config;
  this.strings      = new Translations(config.language).getAll();
  this.currentIndex = null;
  this.hashes       = hashes();
  Mustache = Mustache.getTemplates(config.directories.currentTheme + '/templates');
  return this;
};

/**
 * Get all articles from file system and populate `index` into {Post}. Uses {PostReader}.
 * @return {Promise} with first parameter of `resolve` being the number of files converted.
 */
Generator.prototype.getArticles = function() {
  var that = this;
  this.currentIndex = new Index();
  return new Promise (
    function(resolve, reject) {
      glob(that.config.directories.data + "/**/*.md", function(err, files) {
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
            that.currentIndex.pushArray(posts);
            console.log('Removed ' + that.currentIndex.removeFutureItems() + ' item(s) with future timestamp from index');
            that.currentIndex.makeNextPrev();
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
 * @param  {Boolean} force    [description]
 * @param  {Boolean} keepOld  If set to `true`, the articles will not be deleted before being rebuild
 * @return {Promise}          with first parameter of `resolve` being the list of files generated.
 */
Generator.prototype.buildAllArticles = function(force, keepOld) {
  var that     = this;
  var allPosts = this.currentIndex.getPosts();
  var skipped  = 0;
  var generatedArticles = [];

  if (force && !keepOld) {
    fs.removeSync(this.config.directories.htdocs + '/posts/*');
  }

  return new Promise (
    function(resolve, reject) {
      // Making promises
      var promises = allPosts.map(function(post) {
        if (!force && that.hashes.isHashed(post.meta.Url, post.hash)) {
          skipped++;
        } else {
          generatedArticles.push([post.meta.Url, post.filename]);
          return that.buildSingleArticle(post);
        }
      });
      // Checking promises
      Promise
        .all(promises)
        .then(function() {
          that.hashes.save();
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
Generator.prototype.buildSingleArticle = function(post) {
  var that     = this;
  if (!post) {
    throw new Error('Empty post');
  }
  return new Promise (
    function(resolve, reject) {
      fs.ensureDirSync(that.config.directories.htdocs + post.meta.Url);
      var promises = [];
      if (that.config.specialFeatures.applenews) {
        promises.push(fs.writeFile( post.meta.urlObj.filename('article','json'), JSON.stringify(appleNewsFormat(post), undefined, 2)));
      }
      if (that.config.specialFeatures.acceleratedmobilepages) {
        promises.push(fs.writeFile( post.meta.urlObj.filename('amp') , Mustache.render(Mustache.templates.amp, {
          post: post,
          ampHtml: post.ampHtml(),
          config: that.config
        },Mustache.partials)));
      }
      Promise
        .all(promises)
        .then(function() {
          fs.writeFile(post.meta.urlObj.filename(), Mustache.render(Mustache.templates.post, {
            post: post,
            config: that.config
          },Mustache.partials), function(err) {
            if (err) {
              reject(err);
            }
            if (that.hashes) {
              that.hashes.update(post.meta.Url, post.hash);
            }
            resolve(post.meta.Filename);
          });
        })
        .catch(reject)
      ;
    }
  );
};

/**
 * Build special pages from `index` like index pages, tag pages, etc.
 * @return {Promise} with first parameter of `resolve` being an array with the numbers of files converted.
 */
Generator.prototype.buildSpecialPages = function() {
  var that = this;
  return new Promise (
    function(resolve, reject) {
      var promises = [
        that.buildIndexFiles(),
        that.buildTagPages(),
        that.buildMetaFiles()
      ];

      if (that.config.specialFeatures.multipleauthors) {
        promises.push(that.buildAuthorPages());
      }

      Promise
        .all(promises)
        .then(resolve)
        .catch(reject)
      ;
     }
  );
};

/**
 * [buildIndexFiles description]
 * @return {Promise} with first parameter of `resolve` being the number of files converted.
 */
Generator.prototype.buildIndexFiles = function(index, path, title) {
  var that = this;
  index = index || this.currentIndex;
  path  = path  || '/';
  title = title || this.strings.index;

  fs.ensureDirSync(that.config.directories.htdocs + path);
  fs.remove(that.config.directories.htdocs + path + 'index*', function(err) {
    return new Promise (
      function(resolve, reject) {
        if (err) {
          reject(err);
        }
        var page;
        var pagedPosts = index.getPagedPosts(that.config.itemsPerPage);
        var urls = {
          rss   : new IndexUrl(path + 'posts.rss'),
          rssjs : new IndexUrl(path + 'rss.json'),
          geojs : new IndexUrl(path + 'geo.json'),
          atom  : new IndexUrl(path + 'posts.atom')
        };
        var promises = [];
        var pubDate = blogophonDate(index.pubDate);


        if (that.config.specialFeatures.rss) {
          promises.push(fs.writeFile( urls.rss.filename(), Mustache.render(Mustache.templates.rss, {
            index: index.getPosts(10),
            pubDate: pubDate.rfc,
            config: that.config,
            absoluteUrl : urls.rss.absoluteUrl(),
            title: title
          })));
        }
        if (that.config.specialFeatures.atom) {
          promises.push(fs.writeFile( urls.atom.filename(), Mustache.render(Mustache.templates.atom, {
            index: index.getPosts(10),
            pubDate: pubDate.iso,
            config: that.config,
            absoluteUrl : urls.atom.absoluteUrl(),
            title: title
          })));
        }
        if (that.config.specialFeatures.jsonrss) {
          promises.push(fs.writeFile( urls.rssjs.filename(), JSON.stringify(jsonRss(index.getPosts(20), pubDate.rfc, that.config, title), undefined, 2)));
        }
        if (that.config.specialFeatures.geojson) {
          promises.push(fs.writeFile( urls.geojs.filename(), JSON.stringify(geoJson(index.getGeoArticles()), undefined, 2)));
        }

        for (page = 0; page < pagedPosts.length; page ++) {
          var curPageObj    = index.getPageData(page, pagedPosts.length, false, path);
          var curUrlObj     = new IndexUrl(curPageObj.currentUrl);
          curPageObj.index  = pagedPosts[page];
          curPageObj.config = that.config;
          curPageObj.meta   = {
            title      : title,
            subtitle   : (curPageObj.currentPage === 1) ? '' : new SuperString(that.strings.page).sprintf(curPageObj.currentPage, curPageObj.maxPages),
            absoluteUrl: curUrlObj.absoluteUrl(),
            absoluteUrlDirname: curUrlObj.absoluteUrlDirname()
          };
          curPageObj.prevUrl = new IndexUrl(curPageObj.prevUrl).relativeUrl();
          curPageObj.nextUrl = new IndexUrl(curPageObj.nextUrl).relativeUrl();
          promises.push(fs.writeFile(new IndexUrl(curPageObj.currentUrl).filename(), Mustache.render(Mustache.templates.index, curPageObj, Mustache.partials)));
        }
        Promise
          .all(promises)
          .then(function() {
            console.log("Wrote "+promises.length+" files for '"+title+"'");
            return resolve(promises.length);
          })
          .catch(reject)
        ;
      }
    );
  });
};

/**
 * [buildTagPages description]
 * @return {Promise} with first parameter of `resolve` being the number of files converted.
 */
Generator.prototype.buildTagPages = function() {
  var that = this;
  var tags = that.currentIndex.getTags();
  var tagPages = Object.keys(tags).sort().map(function(key) {
    return {
      title: tags[key].title,
      url  : tags[key].urlObj.relativeUrl()
    };
  });

  fs.remove(that.config.directories.htdocs + '/tagged', function(err) {
    return new Promise (
      function(resolve, reject) {
        if (err) {
          reject(err);
        }
        fs.ensureDirSync(that.config.directories.htdocs + '/tagged');

        var promises = Object.keys(tags).map(function(key) {
          return that.buildIndexFiles(
            tags[key].index,
            tags[key].urlObj.relativeUrl(),
            new SuperString(that.strings.tag).sprintf(tags[key].title)
          );
        });

        promises.push(fs.writeFile( new IndexUrl('tagged/index.html').filename(), Mustache.render(Mustache.templates.tags, {
          index: tagPages,
          config: that.config
        }, Mustache.partials)));

        Promise
          .all(promises)
          .then(function() {
            return resolve(promises.length);
          })
          .catch(reject)
        ;
      }
    );
  });
};

/**
 * [buildAuthorPages description]
 * @return {Promise} with first parameter of `resolve` being the number of files converted.
 */
Generator.prototype.buildAuthorPages = function() {
  var that = this;
  var authors = that.currentIndex.getAuthors();
  var authorPages = Object.keys(authors).sort().map(function(name) {
    return {
      title: name,
      url  : authors[name].urlObj.relativeUrl()
    };
  });

  fs.remove(that.config.directories.htdocs + '/authored-by', function(err) {
    return new Promise (
      function(resolve, reject) {
        if (err) {
          reject(err);
        }
        fs.ensureDirSync(that.config.directories.htdocs + '/authored-by');

        var promises = Object.keys(authors).map(function(name) {
          return that.buildIndexFiles(
            authors[name].index,
            authors[name].urlObj.relativeUrl(),
            new SuperString(that.strings.author).sprintf(name)
          );
        });

        promises.push(fs.writeFile( new IndexUrl('authored-by/index.html').filename(), Mustache.render(Mustache.templates.authors, {
          index: authorPages,
          config: that.config
        }, Mustache.partials)));

        Promise
          .all(promises)
          .then(function() {
            return resolve(promises.length);
          })
          .catch(reject)
        ;
      }
    );
  });
};

/**
 * Build 404 pages, sitemaps, newsfeeds an stuff like that
 * @return {Promise} with first parameter of `resolve` being the number of files converted.
 */
Generator.prototype.buildMetaFiles = function() {
  var that = this;
  return new Promise (
    function(resolve, reject) {
      var tags = that.currentIndex.getTags();
      var tagPages = Object.keys(tags).sort().map(function(key) {
        return {
          title: tags[key].title,
          url  : tags[key].urlObj.relativeUrl()
        };
      });

      var promises = [
        fs.writeFile( new IndexUrl('404.html').filename(), Mustache.render(Mustache.templates.four, {
          index: that.currentIndex.getPosts(5),
          config: that.config
        }, Mustache.partials)),

        fs.writeFile( new IndexUrl('sitemap.xml').filename(), Mustache.render(Mustache.templates.sitemap, {
          index: that.currentIndex.getPosts(),
          tagPages: tagPages,
          pubDate: blogophonDate(that.currentIndex.pubDate).iso,
          config: that.config
        }))
      ];

      if (that.config.specialFeatures.microsofttiles) {
        fs.ensureDirSync(that.config.directories.htdocs + '/notifications');
        that.currentIndex.getPosts(5).forEach(function(post,index) {
          promises.push(
            fs.writeFile( new IndexUrl('notifications/livetile-'+(index+1)+'.xml').filename(), Mustache.render(Mustache.templates.livetile, {
              post: post
            }))
          );
        });
      }


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
};

/**
 * Copy images from Markdown area to live `htdocs`, scaling and optimizing them.
 * @return {Promise} with first parameter of `resolve` being the number of files converted.
 */
Generator.prototype.copyImages = function(targetDirectory, articleFilename) {
  if (!targetDirectory || !articleFilename) {
    return false;
  }
  var that = this;
  var i;
  var j;
  var processed = 0;
  var maxProcessed = -1;

  // Target directory
  var sourceDirectory = articleFilename.replace(/\.md$/, '') + "/"; // Source directory
  var sourceReg = new RegExp(sourceDirectory);

  return new Promise (
    function(resolve, reject) {
      glob(sourceDirectory + "*.{png,jpg,gif}", function(er, files) {
        maxProcessed = files.length * (that.config.imageSizes.length + 1);
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
          var targetFile = files[i].replace(sourceReg, that.config.directories.htdocs + targetDirectory);
          fs.ensureDirSync(targetFile.replace(/(\/).+?$/, '$1'));
          gm(files[i])
            .noProfile()
            .interlace('Line')
            .write(targetFile,checkProcessed)
          ;
          for (j = 0; j < that.config.imageSizes.length; j++) {
            var imageSize = that.config.imageSizes[j];
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
};

/**
 * Build all articles, special pages and images.
 * @param  {Boolean} force    [description]
 * @param  {Boolean} noimages [description]
 * @return {Promise} [description]
 */
Generator.prototype.buildAll = function(force, noimages) {
  var that = this;
  return new Promise (
    function(resolve, reject) {
      that
        .buildAllArticles(force, noimages)
        .then(function(generatedArticles) {
          var promises = [];
          if (!noimages) {
            promises = generatedArticles.map(function(article) {
              return that.copyImages( article[0], article[1] );
            });
          }
          if (generatedArticles.length) {
            promises.push(that.buildSpecialPages());
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
 * Executes deployment command as given in `this.config.json`.
 * @return {Boolean} [description]
 */
Generator.prototype.deploy = function() {
  var shell = require('shelljs');
  if (this.config.deployCmd) {
    console.log('Deploying...');
    shell.exec(this.config.deployCmd);
    console.log('Finished deploying');
  }
  return true;
};

/**
 * Writes static files which will only be needed anwed if the blog gets a new URL
 * @return {Promise} [description]
 */
Generator.prototype.buildBasicFiles = function(answers) {
  var that = this;
  var manifest = require('./models/manifest');

  fs.ensureDirSync(that.config.directories.data);
  fs.ensureDirSync(that.config.directories.htdocs);

  ['/css', '/js'].forEach(function(link) {
    fs.unlink(that.config.directories.htdocs + link, function() {
      fs.linkSync(that.config.directories.theme + '/' + answers.theme + link,that.config.directories.htdocs + link);
    });
  });

  var promises = [
    fs.writeFile(that.config.directories.user + '/config.json', JSON.stringify(answers, undefined, 2)),
    fs.writeFile(that.config.directories.htdocs+'/.htaccess', Mustache.render(Mustache.templates.htaccess, {
      config: that.config
    })),
    fs.writeFile(that.config.directories.htdocs+'/robots.txt', Mustache.render(Mustache.templates.robots, {
      config: that.config
    })),
    fs.writeFile(that.config.directories.htdocs+'/browserconfig.xml', Mustache.render( Mustache.templates.browserconfig, {
      config: that.config
    })),
    fs.writeFile( that.config.directories.htdocs+'/manifest.json', JSON.stringify(manifest(that.config), undefined, 2))
  ];
  return Promise
    .all(promises)
    .then(function() {
        console.log("Wrote " + promises.length + " basic files");
    })
    .catch(function(err) {
      console.error(err);
    })
  ;
};

module.exports = Generator;
