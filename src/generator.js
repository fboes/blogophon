'use strict';

var glob           = require("glob");
var Promise        = require('promise/lib/es6-extensions');
var fs             = require('fs-extra-promise');
var path           = require('path');
var SuperString    = require('./helpers/super-string');
var blogophonDate  = require('./models/blogophon-date');
var Mustache       = require('./helpers/blogophon-mustache');
var PostReader     = require('./post-reader');
var jsonRss        = require('./models/json-rss');
var geoJson        = require('./models/geo-json');
var translations   = require('./helpers/translations');
var indexUrl       = require('./helpers/index-url');
var blogophonIndex = require('./blogophon-index');
var hashes         = require('./models/hashes');
var appleNewsFormat = require('./models/apple-news-format');
var imageStyles    = require('./helpers/image-styles');

/**
 * Generator used for creating the blog.
 * @constructor
 */
var Generator = function (config) {
  if (!config) {
    throw new Error('config is empty');
  }
  var external = {};
  external.config       = config;
  external.strings      = translations(config.language).getAll();
  external.currentIndex = null;
  external.hashes       = hashes();
  Mustache = Mustache.getTemplates(path.join(config.directories.currentTheme, 'templates'));

  var internal = {};
  internal.imageStyles  = imageStyles(config);

  /**
   * Get all articles from file system and populate `index` into {Post}. Uses {PostReader}.
   * @return {Promise} with first parameter of `resolve` being the number of files converted.
   */
  external.getArticles = function() {
    external.currentIndex = blogophonIndex();
    return new Promise (
      function(resolve, reject) {
        glob(external.config.directories.data + "/**/*.md", function(err, files) {
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
              external.currentIndex.pushArray(posts);
              console.log('Removed ' + external.currentIndex.removeFutureItems() + ' item(s) with future timestamp from index');
              external.currentIndex.makeNextPrev();
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
  external.buildAllArticles = function(force, keepOld) {
    var allPosts = external.currentIndex.getPosts();
    var skipped  = 0;
    var generatedArticles = [];

    if (force && !keepOld) {
      fs.removeSync(external.config.directories.htdocs + '/posts/*');
    }

    return new Promise (
      function(resolve, reject) {
        // Making promises
        var promises = allPosts.map(function(post) {
          if (!force && external.hashes.isHashed(post.meta.Url, post.hash)) {
            skipped++;
          } else {
            generatedArticles.push([post.meta.Url, post.filename]);
            return external.buildSingleArticle(post);
          }
        });
        // Checking promises
        Promise
          .all(promises)
          .then(function() {
            external.hashes.save();
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
  external.buildSingleArticle = function(post) {
    if (!post) {
      throw new Error('Empty post');
    }
    return new Promise (
      function(resolve, reject) {
        fs.ensureDirSync(external.config.directories.htdocs + post.meta.Url);
        var promises = [];
        if (external.config.specialFeatures.applenews) {
          promises.push(fs.writeFileAsync( post.meta.urlObj.filename('article','json'), JSON.stringify(appleNewsFormat(post), undefined, 2)));
        }
        if (external.config.specialFeatures.acceleratedmobilepages) {
          Mustache.ampCss = Mustache.ampCss || fs.readFileSync(path.join(Mustache.themePath, '../css/amp.css'), 'utf8').replace(/\s*[\n\r]+\s*/g,'');
          promises.push(fs.writeFileAsync( post.meta.urlObj.filename('amp') , Mustache.render(Mustache.templates.amp, {
            post: post,
            ampHtml: post.ampHtml(),
            ampCss: Mustache.ampCss,
            config: external.config
          },Mustache.partials)));
        }
        if (external.config.specialFeatures.ajax) {
          promises.push(fs.writeFileAsync( post.meta.urlObj.filename('index','json'), JSON.stringify(post, undefined, 2)));
        }
        Promise
          .all(promises)
          .then(function() {
            fs.writeFileAsync(post.meta.urlObj.filename(), Mustache.render(Mustache.templates.post, {
              post: post,
              config: external.config
            },Mustache.partials), function(err) {
              if (err) {
                reject(err);
              }
              if (external.hashes) {
                external.hashes.update(post.meta.Url, post.hash);
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
  external.buildSpecialPages = function() {
    return new Promise (
      function(resolve, reject) {
        var promises = [
          external.buildIndexFiles(),
          external.buildTagPages(),
          external.buildMetaFiles()
        ];

        if (external.config.specialFeatures.multipleauthors) {
          promises.push(external.buildAuthorPages());
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
  external.buildIndexFiles = function(index, path, title) {
    index = index || external.currentIndex;
    path  = path  || '/';
    title = title || external.strings.index;

    fs.ensureDirSync(external.config.directories.htdocs + path);
    fs.removeSync(external.config.directories.htdocs + path + 'index*');
    return new Promise (
      function(resolve, reject) {
        var page;
        var pagedPosts = index.getPagedPosts(external.config.itemsPerPage);
        var urls = {
          rss   : indexUrl(path + 'posts.rss'),
          rssjs : indexUrl(path + 'rss.json'),
          geojs : indexUrl(path + 'geo.json'),
          atom  : indexUrl(path + 'posts.atom'),
          ics   : indexUrl(path + 'posts.ics'),
          ajax  : indexUrl(path + 'index.json')
        };
        var promises = [];
        var pubDate = blogophonDate(index.pubDate);


        if (external.config.specialFeatures.rss) {
          promises.push(fs.writeFileAsync( urls.rss.filename(), Mustache.render(Mustache.templates.rss, {
            index: index.getPosts(10),
            pubDate: pubDate.rfc,
            config: external.config,
            absoluteUrl : urls.rss.absoluteUrl(),
            title: title
          })));
        }
        if (external.config.specialFeatures.atom) {
          promises.push(fs.writeFileAsync( urls.atom.filename(), Mustache.render(Mustache.templates.atom, {
            index: index.getPosts(10),
            pubDate: pubDate.iso,
            config: external.config,
            absoluteUrl : urls.atom.absoluteUrl(),
            title: title
          })));
        }
        if (external.config.specialFeatures.icscalendar) {
          promises.push(fs.writeFileAsync( urls.ics.filename(), Mustache.render(Mustache.templates.calendar, {
            index: index.getPosts(),
            pubDate: pubDate.ics,
            config: external.config,
            absoluteUrl : urls.ics.absoluteUrl(),
            title: title
          })));
        }
        if (external.config.specialFeatures.jsonrss) {
          promises.push(fs.writeFileAsync( urls.rssjs.filename(), JSON.stringify(jsonRss(index.getPosts(20), pubDate.rfc, external.config, title), undefined, 2)));
        }
        if (external.config.specialFeatures.geojson) {
          promises.push(fs.writeFileAsync( urls.geojs.filename(), JSON.stringify(geoJson(index.getGeoArticles()), undefined, 2)));
        }
        if (external.config.specialFeatures.ajax) {
          promises.push(fs.writeFileAsync( urls.ajax.filename(), JSON.stringify(index, undefined, 2)));
        }

        for (page = 0; page < pagedPosts.length; page ++) {
          var curPageObj    = index.getPageData(page, pagedPosts.length, false, path);
          var curUrlObj     = indexUrl(curPageObj.currentUrl);
          curPageObj.index  = pagedPosts[page];
          curPageObj.config = external.config;
          curPageObj.meta   = {
            title      : title,
            subtitle   : (curPageObj.currentPage === 1) ? '' : SuperString(external.strings.page).sprintf(curPageObj.currentPage, curPageObj.maxPages),
            absoluteUrl: curUrlObj.absoluteUrl(),
            absoluteUrlDirname: curUrlObj.absoluteUrlDirname()
          };
          curPageObj.prevUrl = indexUrl(curPageObj.prevUrl).relativeUrl();
          curPageObj.nextUrl = indexUrl(curPageObj.nextUrl).relativeUrl();
          promises.push(fs.writeFileAsync(indexUrl(curPageObj.currentUrl).filename(), Mustache.render(Mustache.templates.index, curPageObj, Mustache.partials)));
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
  };

  /**
   * [buildTagPages description]
   * @return {Promise} with first parameter of `resolve` being the number of files converted.
   */
  external.buildTagPages = function() {
    var tags = external.currentIndex.getTags();
    var tagPages = Object.keys(tags).sort().map(function(key) {
      return {
        title: tags[key].title,
        url  : tags[key].urlObj.relativeUrl()
      };
    });

    fs.removeSync(external.config.directories.htdocs + '/tagged');
    fs.ensureDirSync(external.config.directories.htdocs + '/tagged');

    return new Promise (
      function(resolve, reject) {
        var promises = Object.keys(tags).map(function(key) {
          return external.buildIndexFiles(
            tags[key].index,
            tags[key].urlObj.relativeUrl(),
            SuperString(external.strings.tag).sprintf(tags[key].title)
          );
        });

        promises.push(fs.writeFileAsync( indexUrl('tagged/index.html').filename(), Mustache.render(Mustache.templates.tags, {
          index: tagPages,
          config: external.config
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
  };

  /**
   * [buildAuthorPages description]
   * @return {Promise} with first parameter of `resolve` being the number of files converted.
   */
  external.buildAuthorPages = function() {
    var authors = external.currentIndex.getAuthors();
    var authorPages = Object.keys(authors).sort().map(function(name) {
      return {
        title: name,
        url  : authors[name].urlObj.relativeUrl()
      };
    });

    fs.remove(external.config.directories.htdocs + '/authored-by', function(err) {
      return new Promise (
        function(resolve, reject) {
          if (err) {
            reject(err);
          }
          fs.ensureDirSync(external.config.directories.htdocs + '/authored-by');

          var promises = Object.keys(authors).map(function(name) {
            return external.buildIndexFiles(
              authors[name].index,
              authors[name].urlObj.relativeUrl(),
              SuperString(external.strings.author).sprintf(name)
            );
          });

          promises.push(fs.writeFileAsync( indexUrl('authored-by/index.html').filename(), Mustache.render(Mustache.templates.authors, {
            index: authorPages,
            config: external.config
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
   * Build 404 pages, sitemaps, newsfeeds an stuff like external
   * @return {Promise} with first parameter of `resolve` being the number of files converted.
   */
  external.buildMetaFiles = function() {
    return new Promise (
      function(resolve, reject) {
        var tags = external.currentIndex.getTags();
        var tagPages = Object.keys(tags).sort().map(function(key) {
          return {
            title: tags[key].title,
            url  : tags[key].urlObj.relativeUrl()
          };
        });

        var promises = [
          fs.writeFileAsync( indexUrl('404.html').filename(), Mustache.render(Mustache.templates.four, {
            index: external.currentIndex.getPosts(5),
            config: external.config
          }, Mustache.partials)),

          fs.writeFileAsync( indexUrl('sitemap.xml').filename(), Mustache.render(Mustache.templates.sitemap, {
            index: external.currentIndex.getPosts(),
            tagPages: tagPages,
            pubDate: blogophonDate(external.currentIndex.pubDate).iso,
            config: external.config
          }))
        ];

        if (external.config.specialFeatures.microsofttiles) {
          fs.ensureDirSync(external.config.directories.htdocs + '/notifications');
          external.currentIndex.getPosts(5).forEach(function(post,index) {
            promises.push(
              fs.writeFileAsync( indexUrl('notifications/livetile-'+(index+1)+'.xml').filename(), Mustache.render(Mustache.templates.livetile, {
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
   * @param  {[type]}  targetDirectory [description]
   * @param  {[type]}  articleFilename [description]
   * @return {Promise} with first parameter of `resolve` being the number of files converted.
   */
  external.copyImages = function(targetDirectory, articleFilename) {
    if (!targetDirectory || !articleFilename) {
      return false;
    }
    // Target directory
    var sourceDirectory = articleFilename.replace(/\.md$/, '') + "/"; // Source directory
    var sourceReg = new RegExp(sourceDirectory);

    return new Promise (
      function(resolve, reject) {
        var promises = glob.sync(sourceDirectory + "*.{png,jpg,gif}").map(function(file) {
          var targetFile = file.replace(sourceReg, external.config.directories.htdocs + targetDirectory);
          fs.copySync(file, targetFile);
          return internal.imageStyles.generateImages(targetFile);
        });
        Promise
          .all(promises)
          .then(function(generatedImages) {
            var processed = 0;
            if (promises.length > 0) {
              generatedImages.forEach(function(generatedImage) {
                processed += generatedImage;
              });
              console.log("Resized "+processed+" images");
            }
            return resolve(processed);
          })
          .catch(reject)
        ;
      }
    );
  };

  /**
   * Build all articles, special pages and images.
   * @param  {Boolean} force    [description]
   * @param  {Boolean} noimages [description]
   * @return {Promise} [description]
   */
  external.buildAll = function(force, noimages) {
    return new Promise (
      function(resolve, reject) {
        external
          .buildAllArticles(force, noimages)
          .then(function(generatedArticles) {
            var promises = [];
            if (!noimages) {
              promises = generatedArticles.map(function(article) {
                return external.copyImages( article[0], article[1] );
              });
            }
            if (generatedArticles.length) {
              promises.push(external.buildSpecialPages());
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
   * Executes deployment command as given in `external.config.json`.
   * @return {Boolean} [description]
   */
  external.deploy = function() {
    var shell = require('shelljs');
    if (external.config.deployCmd) {
      console.log('Deploying...');
      shell.exec('cd '+path.join(__dirname,'..')+'; ' + external.config.deployCmd);
      console.log('Finished deploying');
    }
    return true;
  };

  /**
   * Writes static files which will only be needed anew when the blog gets a new URL
   * @return {Promise} [description]
   */
  external.buildBasicFiles = function(answers) {
    var manifest = require('./models/manifest');

    fs.ensureDirSync(external.config.directories.data);
    fs.ensureDirSync(external.config.directories.htdocs);

    var promises = [
      fs.writeFileAsync(path.join(external.config.directories.user,   'config.json'), JSON.stringify(answers, undefined, 2)),
      fs.writeFileAsync(path.join(external.config.directories.htdocs, '.htaccess'), Mustache.render(Mustache.templates.htaccess, {
        config: external.config
      })),
      fs.writeFileAsync(path.join(external.config.directories.htdocs, 'robots.txt'), Mustache.render(Mustache.templates.robots, {
        config: external.config
      })),
      fs.writeFileAsync(path.join(external.config.directories.htdocs, 'browserconfig.xml'), Mustache.render( Mustache.templates.browserconfig, {
        config: external.config
      })),
      fs.writeFileAsync(path.join(external.config.directories.htdocs, 'manifest.json'), JSON.stringify(manifest(external.config), undefined, 2))
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
  return external;
};

module.exports = Generator;
