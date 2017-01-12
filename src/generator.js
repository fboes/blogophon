'use strict';

var glob           = require("glob");
var Promise        = require('promise/lib/es6-extensions');
var fs             = require('fs-extra-promise');
var path           = require('path');
var SuperString    = require('./helpers/super-string');
var blogophonDate  = require('./models/blogophon-date');
var Mustache       = require('./helpers/blogophon-mustache');
var MustacheQuoters= require('./helpers/blogophon-mustache-quoters');
var PostReader     = require('./post-reader');
var jsonRss        = require('./models/json-rss');
var geoJson        = require('./models/geo-json');
var translations   = require('./helpers/translations');
var indexUrl       = require('./helpers/index-url');
var blogophonIndex = require('./blogophon-index');
var hashes         = require('./models/hashes');
var appleNewsFormat = require('./models/apple-news-format');
var imageStyles    = require('./helpers/image-styles');
var ampify         = require('./helpers/ampify')();

/**
 * Generator used for creating the blog.
 * @constructor
 * @param {Object} config [description]
 */
var Generator = function(config) {
  if (!config) {
    throw new Error('config is empty');
  }
  var external = {};
  var internal = {};

  Mustache = Mustache.getTemplates(path.join(config.directories.currentTheme, 'templates'));

  if (config.specialFeatures.facebookinstantarticles) {
    Mustache.facebookHtml = Mustache.facebookHtml || fs.readFileSync(path.join(__dirname, '/templates/facebook.html'), 'utf8');
  }
  if (config.specialFeatures.acceleratedmobilepages) {
    Mustache.ampCss = Mustache.ampCss || fs.readFileSync(path.join(Mustache.themePath, '../css/amp.css'), 'utf8').replace(/\s*[\n\r]+\s*/g, '');
  }

  internal.currentIndex = null;
  internal.translation  = translations(config.locale.language);
  internal.hashes       = hashes();
  internal.imageStyles  = imageStyles(config);

  /**
   * Get all articles from file system and populate `index` into {Post}. Uses {PostReader}.
   * @return {Promise} with first parameter of `resolve` being the number of files converted.
   */
  external.getArticles = function() {
    internal.currentIndex = blogophonIndex();
    return new Promise(
      function(resolve, reject) {
        glob(config.directories.data + "/**/*.md", function(err, files) {
          if (err) {
            reject(err);
          }
          // Making promises
          var promises = files.map(function(i) {
            return PostReader(i, config);
          });
          // Checking promises
          Promise
            .all(promises)
            .then(function(posts) {
              internal.currentIndex.pushArray(posts);
              console.log('Removed ' + internal.currentIndex.removeFutureItems() + ' item(s) with future timestamp from index');
              internal.currentIndex.makeNextPrev();
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
   * @param  {Boolean} force    If set to `true`, all articles will be rebuilt. Otherwise, only changed articles will be build.
   * @param  {Boolean} noimages If set to `true`, no images will be created
   * @return {Promise}          with first parameter of `resolve` being the list of files generated.
   */
  external.buildAllArticles = function(force, noimages) {
    var allPosts = internal.currentIndex.getPosts();
    var skipped  = 0;
    var generatedArticles = [];

    if (force && !noimages) {
      fs.removeSync(path.join(config.directories.htdocs, config.htdocs.posts, '*'));
    }

    return new Promise(
      function(resolve, reject) {
        // Making promises
        var promises = allPosts.map(function(post) {
          if (!force && internal.hashes.matchesHash(post.meta.Url, post.hash)) {
            skipped++;
          } else {
            generatedArticles.push([post.meta.Url, post.filename]);
            return external.buildSingleArticle(post, noimages);
          }
        });
        // Checking promises
        Promise
          .all(promises)
          .then(function() {
            internal.hashes.save();
            console.log("Created " + generatedArticles.length + " articles, skipped " +  skipped + " articles");
            resolve(generatedArticles);
          })
          .catch(reject)
        ;
      }
    );
  };

  /**
   * Build a single article.
   * @param  {Post}    post      [description]
   * @param  {Boolean} noimages  If set to `true`, no images will be created
   * @return {Promise} with first parameter being the filename
   */
  external.buildSingleArticle = function(post, noimages) {
    if (!post) {
      throw new Error('Empty post');
    }
    return new Promise(
      function(resolve, reject) {
        fs.ensureDirSync(post.meta.urlObj.dirname());
        var promises = [
          fs.writeFileAsync(post.meta.urlObj.filename(), Mustache.render(Mustache.templates.post, {
            post: post,
            config: config
          }, Mustache.partials))
        ];
        if (config.specialFeatures.applenews) {
          promises.push(fs.writeFileAsync( post.meta.urlObj.filename('article', 'json'), JSON.stringify(appleNewsFormat(post), undefined, 2)));
        }
        if (config.specialFeatures.acceleratedmobilepages) {
          promises.push(fs.writeFileAsync(post.meta.urlObj.filename('amp'), Mustache.render(Mustache.templates.amp, {
            post: post,
            ampCss: Mustache.ampCss,
            config: config
          }, Mustache.partials)));
        }
        if (config.specialFeatures.ajax) {
          promises.push(fs.writeFileAsync( post.meta.urlObj.filename('index', 'json'), JSON.stringify(post, undefined, 2)));
        }
        if (!noimages) {
          promises.push(external.buildArticleImages(post));
        }

        Promise
          .all(promises)
          .then(function() {
            if (internal.hashes) {
              internal.hashes.update(post.meta.Url, post.hash);
            }
            resolve(post.meta.Filename);
          })
          .catch(reject)
        ;
      }
    );
  };

  /**
   * Copy images from Markdown area to live `htdocs`, scaling and optimizing them.
   * @param  {Post}    post [description]
   * @return {Promise} with first parameter of `resolve` being the number of files converted.
   */
  external.buildArticleImages = function(post) {
    if (!post.meta.Url || !post.filename) {
      return false;
    }
    // Target directory
    var sourceDirectory = post.filename.replace(/\.md$/, '') + "/"; // Source directory
    var sourceGlob      = glob.sync(sourceDirectory + "*.{png,jpg,gif}");
    var sourceReg       = new RegExp(sourceDirectory);
    var imageStyles     = sourceGlob ? post.getAllImagesWithStyleObject() : {};

    return new Promise(
      function(resolve, reject) {
        var promises = sourceGlob.map(function(sourceFile) {
          var targetFile = sourceFile.replace(sourceReg, config.directories.htdocs + post.meta.Url);
          fs.copySync(sourceFile, targetFile);
          //console.log(imageStyles[path.basename(sourceFile)] || []);
          return internal.imageStyles.generateImagesWithStyles(sourceFile, targetFile, imageStyles[path.basename(sourceFile)] || []);
        });
        Promise
          .all(promises)
          .then(function(generatedImages) {
            var processed = 0;
            if (promises.length > 0) {
              processed = generatedImages.reduce(function(accumulatedValue, generatedImage) {
                return accumulatedValue + generatedImage;
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
   * Build special pages from `index` like index pages, tag pages, etc.
   * @return {Promise} with first parameter of `resolve` being an array with the numbers of files converted.
   */
  external.buildSpecialPages = function() {
    return new Promise(
      function(resolve, reject) {
        var promises = [
          external.buildIndexFiles(),
          external.buildTagPages(),
          external.buildMetaFiles()
        ];

        if (config.specialFeatures.multipleauthors) {
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
   * @param  {Array}   index [description]
   * @param  {String}  path  [description]
   * @param  {String}  title [description]
   * @return {Promise} with first parameter of `resolve` being the number of files converted.
   */
  external.buildIndexFiles = function(index, path, title) {
    index = index || internal.currentIndex;
    path  = path  || '/';
    title = title || internal.translation.getString('Home');

    fs.ensureDirSync(config.directories.htdocs + path);
    fs.removeSync(config.directories.htdocs + path + 'index*');

    return new Promise(
      function(resolve, reject) {
        var page;
        var pagedPosts = index.getPagedPosts(config.itemsPerPage);
        var urls = {
          rss:   indexUrl(path + 'posts.rss'),
          rssjs: indexUrl(path + 'rss.json'),
          geojs: indexUrl(path + 'geo.json'),
          networkKml: indexUrl(path + 'network.kml'),
          placesKml:  indexUrl(path + 'places.kml'),
          atom:  indexUrl(path + 'posts.atom'),
          ics:   indexUrl(path + 'posts.ics'),
          ajax:  indexUrl(path + 'index.json')
        };
        var promises = [];
        var pubDate = blogophonDate(index.pubDate);

        if (config.specialFeatures.rss || config.specialFeatures.facebookinstantarticles) {
          promises.push(fs.writeFileAsync( urls.rss.filename(), Mustache.render(Mustache.templates.rss, {
            index:       index.getPosts(10),
            pubDate:     pubDate.rfc,
            config:      config,
            absoluteUrl: urls.rss.absoluteUrl(),
            title:       title
          }, {contentHtml: Mustache.facebookHtml || '{{{safeHtml}}}'})));
        }
        if (config.specialFeatures.atom) {
          promises.push(fs.writeFileAsync( urls.atom.filename(), Mustache.render(Mustache.templates.atom, {
            index: index.getPosts(10),
            pubDate:     pubDate.iso,
            config:      config,
            absoluteUrl: urls.atom.absoluteUrl(),
            title:       title
          })));
        }
        if (config.specialFeatures.icscalendar) {
          promises.push(fs.writeFileAsync( urls.ics.filename(), Mustache.render(Mustache.templates.calendar, {
            index: index.getPosts(),
            pubDate:     pubDate.ics,
            config:      config,
            absoluteUrl: urls.ics.absoluteUrl(),
            title:       title,
            icsQuote:    MustacheQuoters.icsQuote
          })));
        }
        if (config.specialFeatures.jsonrss) {
          promises.push(fs.writeFileAsync( urls.rssjs.filename(), JSON.stringify(jsonRss(index.getPosts(20), pubDate, config, title), undefined, 2)));
        }
        if (config.specialFeatures.geojson) {
          promises.push(fs.writeFileAsync( urls.geojs.filename(), JSON.stringify(geoJson(index.getGeoArticles()), undefined, 2)));
        }
        if (config.specialFeatures.kml) {
          promises.push(fs.writeFileAsync( urls.networkKml.filename(), Mustache.render(Mustache.templates.networkKml, {
            pubDate:     pubDate.iso,
            config:      config,
            absoluteUrl: urls.networkKml.absoluteUrl(),
            title:       title,
            link:        urls.placesKml.absoluteUrl()
          })));
          promises.push(fs.writeFileAsync( urls.placesKml.filename(), Mustache.render(Mustache.templates.placesKml, {
            index:       index.getPosts(),
            pubDate:     pubDate.iso,
            config:      config,
            absoluteUrl: urls.placesKml.absoluteUrl(),
            title:       title
          })));
        }
        if (config.specialFeatures.ajax) {
          promises.push(fs.writeFileAsync( urls.ajax.filename(), JSON.stringify(index, undefined, 2)));
        }

        for (page = 0; page < pagedPosts.length; page ++) {
          var curPageObj    = index.getPageData(page, pagedPosts.length, false, path);
          var curUrlObj     = indexUrl(curPageObj.currentUrl);
          curPageObj.index  = pagedPosts[page];
          curPageObj.config = config;
          curPageObj.meta   = {
            title:       title,
            subtitle:    (curPageObj.currentPage === 1) ? '' : SuperString(internal.translation.getString('Page %d/%d')).sprintf(curPageObj.currentPage, curPageObj.maxPages),
            absoluteUrl: curUrlObj.absoluteUrl(),
            absoluteUrlDirname: curUrlObj.absoluteUrlDirname()
          };
          curPageObj.prevUrl = indexUrl(curPageObj.prevUrl).relativeUrl();
          curPageObj.nextUrl = indexUrl(curPageObj.nextUrl).relativeUrl();
          if (config.specialFeatures.acceleratedmobilepages) {
            curPageObj.meta.AbsoluteUrlAmp = curUrlObj.absoluteUrl('amp');
          }
          promises.push(fs.writeFileAsync(indexUrl(curPageObj.currentUrl).filename(), Mustache.render(Mustache.templates.index, curPageObj, Mustache.partials)));

          if (config.specialFeatures.acceleratedmobilepages) {
            curPageObj.ampCss = Mustache.ampCss;
            curPageObj.prevUrl = indexUrl(curPageObj.prevUrl).relativeUrl('amp');
            curPageObj.nextUrl = indexUrl(curPageObj.nextUrl).relativeUrl('amp');
            curPageObj.consolidatedProperties = ampify.getConsolidatedProperties(curPageObj.index);

            promises.push(fs.writeFileAsync(
              indexUrl(curPageObj.currentUrl).filename('amp'),
              Mustache.render(
                Mustache.templates.ampIndex,
                curPageObj,
                Mustache.partials
              )
            ));
          }

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
    var tags = internal.currentIndex.getTags();
    var tagPages = Object.keys(tags).sort().map(function(key) {
      return {
        title: tags[key].title,
        url:   tags[key].urlObj.relativeUrl()
      };
    });

    fs.removeSync(path.join(config.directories.htdocs, config.htdocs.tag));
    fs.ensureDirSync(path.join(config.directories.htdocs, config.htdocs.tag));

    return new Promise(
      function(resolve, reject) {
        var promises = Object.keys(tags).map(function(key) {
          return external.buildIndexFiles(
            tags[key].index,
            tags[key].urlObj.relativeUrl(),
            SuperString(internal.translation.getString('Articles with tag "%s"')).sprintf(tags[key].title)
          );
        });

        promises.push(fs.writeFileAsync( indexUrl(config.htdocs.tag + '/index.html').filename(), Mustache.render(Mustache.templates.tags, {
          index: tagPages,
          config: config
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
    var authors = internal.currentIndex.getAuthors();
    var authorPages = Object.keys(authors).sort().map(function(name) {
      return {
        title: name,
        url:   authors[name].urlObj.relativeUrl()
      };
    });

    fs.remove(path.join(config.directories.htdocs, config.htdocs.author), function(err) {
      return new Promise(
        function(resolve, reject) {
          if (err) {
            reject(err);
          }
          fs.ensureDirSync(path.join(config.directories.htdocs, config.htdocs.author));

          var promises = Object.keys(authors).map(function(name) {
            return external.buildIndexFiles(
              authors[name].index,
              authors[name].urlObj.relativeUrl(),
              SuperString(internal.translation.getString('Articles written by %s')).sprintf(name)
            );
          });

          promises.push(fs.writeFileAsync( indexUrl(config.htdocs.author+'/index.html').filename(), Mustache.render(Mustache.templates.authors, {
            index: authorPages,
            config: config
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
    return new Promise(
      function(resolve, reject) {
        var tags = internal.currentIndex.getTags();
        var tagPages = Object.keys(tags).sort().map(function(key) {
          return {
            title: tags[key].title,
            url:   tags[key].urlObj.relativeUrl()
          };
        });

        var promises = [
          fs.writeFileAsync( indexUrl('404.html').filename(), Mustache.render(Mustache.templates.four, {
            index: internal.currentIndex.getPosts(5),
            config: config
          }, Mustache.partials)),

          fs.writeFileAsync( indexUrl('sitemap.xml').filename(), Mustache.render(Mustache.templates.sitemap, {
            index: internal.currentIndex.getPosts(),
            tagPages: tagPages,
            pubDate: blogophonDate(internal.currentIndex.pubDate).iso,
            config: config
          }))
        ];

        if (config.specialFeatures.microsofttiles) {
          fs.ensureDirSync(config.directories.htdocs + '/notifications');
          internal.currentIndex.getPosts(5).forEach(function(post, index) {
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
   * Build all articles, special pages and images.
   * @param  {Boolean} force    [description]
   * @param  {Boolean} noimages [description]
   * @return {Promise} [description]
   */
  external.buildAll = function(force, noimages) {
    return new Promise(
      function(resolve, reject) {
        external
          .buildAllArticles(force, noimages)
          .then(function(generatedArticles) {
            return generatedArticles.length ? external.buildSpecialPages() : true;
          })
          .then(resolve)
          .catch(reject)
        ;
      }
    );
  };

  /**
   * Executes deployment command as given in `config.json`.
   * @return {Boolean} [description]
   */
  external.deploy = function() {
    var shell = require('shelljs');
    if (config.deployCmd) {
      console.log('Deploying...');
      shell.exec('cd '+path.join(__dirname, '..')+'; ' + config.deployCmd);
      console.log('Finished deploying');
    }
    return true;
  };

  /**
   * Writes static files which will only be needed anew when the blog gets a new URL
   * @param  {Object}  answers [description]
   * @return {Promise} [description]
   */
  external.buildBasicFiles = function(answers) {
    var manifest = require('./models/manifest');

    fs.ensureDirSync(config.directories.data);
    fs.ensureDirSync(config.directories.htdocs);

    var promises = [
      fs.writeFileAsync(path.join(config.directories.user,   'config.json'), JSON.stringify(answers, undefined, 2)),
      fs.writeFileAsync(path.join(config.directories.htdocs, '.htaccess'), Mustache.render(Mustache.templates.htaccess, {
        config: config
      })),
      fs.writeFileAsync(path.join(config.directories.htdocs, 'robots.txt'), Mustache.render(Mustache.templates.robots, {
        config: config
      })),
      fs.writeFileAsync(path.join(config.directories.htdocs, 'opensearch.xml'), Mustache.render( Mustache.templates.opensearch, {
        config: config
      })),
      fs.writeFileAsync(path.join(config.directories.htdocs, 'browserconfig.xml'), Mustache.render( Mustache.templates.browserconfig, {
        config: config
      })),
      fs.writeFileAsync(path.join(config.directories.htdocs, 'manifest.json'), JSON.stringify(manifest(config), undefined, 2))
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
