import glob from "glob";
import fs from 'fs-extra-promise';
import path from 'path';
import SuperString from './helpers/super-string.js';
import blogophonDateFormat from './helpers/blogophon-date-format.js';
import Handlebars from './helpers/blogophon-handlebars.js';
import PostReader from './post-reader.js';
import jsonRss from './models/json-rss.js';
import geoJson from './models/geo-json.js';
import translations from './helpers/translations.js';
import IndexUrl from './helpers/IndexUrl.js';
import blogophonIndex from './blogophon-index.js';
import hashes from './models/hashes.js';
import appleNewsFormat from './models/apple-news-format.js';
import imageStyles from './helpers/image-styles.js';
import webcomponents from './helpers/webcomponents-from-html.js';
import slacked from './models/slacked.js';
import jsonFeed from './models/json-feed.js';
import jsonLd from './models/json-ld.js';
import categoriesUrls from './models/categories.js';
import webmentionsJs from './helpers/webmentions.js';
import shell from 'shelljs';

/**
 * Generator used for creating the blog.
 * @constructor
 * @param {Object} config [description]
 */
const Generator = function(config) {
  if (!config) {
    throw new Error('config is empty');
  }
  const external = {};
  const internal = {};
  const webmentions = webmentionsJs(true);

  Handlebars.getTemplates(config.locale.language);
  Handlebars.getThemeTemplates(path.join(config.directories.currentTheme, 'templates'), config.locale.language);

  if (!Handlebars.ampCss && config.specialFeatures.acceleratedmobilepages) {
    const ampFilePath = path.join(Handlebars.themePath, '../css/amp.css');
    if (fs.existsSync(ampFilePath)) {
      Handlebars.ampCss = fs.readFileSync(ampFilePath, 'utf8').replace(/\s*[\n\r]+\s*/g, '');
    }
  }

  internal.currentIndex = null;
  internal.translation  = translations(config.locale.language);
  internal.hashes       = hashes();
  internal.imageStyles  = imageStyles(config);
  config.categoriesUrls = categoriesUrls(config);

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
          let promises = files.map(function(i) {
            return PostReader(i, config);
          });
          // Checking promises
          Promise
            .all(promises)
            .then(function(posts) {
              internal.currentIndex.pushArray(posts);
              console.log(
                'Removed ' + internal.currentIndex.removeFutureItems() + ' item(s) with future timestamp from index'
              );
              console.log('Removed ' + internal.currentIndex.removeDrafts() + ' draft(s) from index');
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
   * @param  {Boolean} force    If set to `true`, all articles will be rebuilt.
   *                            Otherwise, only changed articles will be build.
   * @param  {Boolean} noimages If set to `true`, no images will be created
   * @return {Promise}          with first parameter of `resolve` being the list of files generated.
   */
  external.buildAllArticles = function(force, noimages) {
    let allPosts = internal.currentIndex.getPosts();
    let skipped  = 0;
    let generatedArticles = [];

    if (force && !noimages) {
      fs.removeSync(path.join(config.directories.htdocs, config.htdocs.posts, '*'));
    }

    return new Promise(
      function(resolve, reject) {
        // Making promises
        let promises = allPosts.map(function(post) {
          if (!force && internal.hashes.matchesHash(post.meta.Url, post.hash)) {
            skipped++;
          } else {
            generatedArticles.push([post.meta.Url, post.filename]);
            return external.buildSingleArticle(post, noimages, force);
          }
        });
        // Checking promises
        Promise
          .all(promises)
          .then(function() {
            internal.hashes.save();
            console.log("Created " + generatedArticles.length + " article(s), skipped " +  skipped + " article(s)");
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
   * @param  {Boolean} force     If set to `true`, this article knows it is forced to being rebuild.
   * @return {Promise} with first parameter being the filename
   */
  external.buildSingleArticle = function(post, noimages, force) {
    if (!post) {
      throw new Error('Empty post');
    }
    return new Promise(
      function(resolve, reject) {
        fs.ensureDirSync(post.meta.urlObj.dirname());
        let promises = [
          fs.writeFileAsync(post.meta.urlObj.filename(), Handlebars.compileExtra(Handlebars.themeTemplates.postHtml, {
            post,
            config
          }, Handlebars.themePartials))
        ];
        if (config.specialFeatures.applenews) {
          promises.push(fs.writeFileAsync(
            post.meta.urlObj.filename('article', 'json'),
            JSON.stringify(appleNewsFormat(post), undefined, 2))
          );
        }
        if (config.specialFeatures.acceleratedmobilepages) {
          promises.push(fs.writeFileAsync(
            post.meta.urlObj.filename('amp'),
            Handlebars.compileExtra(Handlebars.themeTemplates.ampPostHtml, {
              post,
              ampCss: Handlebars.ampCss,
              config
            }, Handlebars.themePartials))
          );
        }
        if (config.specialFeatures.ajax) {
          promises.push(fs.writeFileAsync(
            post.meta.urlObj.filename('index', 'json'),
            JSON.stringify(post, undefined, 2)
          ));
        }
        if (config.specialFeatures.jsonld) {
          promises.push(fs.writeFileAsync(
            post.meta.urlObj.filename('index', 'jsonld'),
            JSON.stringify(jsonLd(post, config), undefined, 2)
          ));
        }
        if (config.specialFeatures.markdown || config.specialFeatures.gopher) {
          promises.push(fs.copy(
            post.filename,
            post.meta.urlObj.filename('article', 'md')
          ));
        }
        promises.push(external.copyAttachmentFiles(post));
        if (!noimages) {
          promises.push(external.buildArticleImages(post));
        }
        if (!force && config.specialFeatures.webmentions) {
          promises.push(webmentions.findAndSendMentions(post));
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
    if (!post.meta.urlObj || !post.filename || !post.attachmentDir) {
      return false;
    }
    // Target directory
    let sourceDirectory = post.attachmentDir; // Source directory
    let sourceGlob      = glob.sync(path.join(sourceDirectory, "*.{png,jpg,gif,webp}"));
    let imageStyles     = sourceGlob ? post.getAllImagesWithStyleObject() : {};

    return new Promise(
      function(resolve, reject) {
        let promises = sourceGlob.map(function(sourceFile) {
          let targetFile = path.join(post.meta.urlObj.dirname(), path.basename(sourceFile));
          fs.copySync(sourceFile, targetFile);
          //console.log(imageStyles[path.basename(sourceFile)] || []);
          return internal.imageStyles.generateImagesWithStyles(
            sourceFile, targetFile, imageStyles[path.basename(sourceFile)] || []
          );
        });
        Promise
          .all(promises)
          .then(function(generatedImages) {
            let processed = 0;
            if (promises.length > 0) {
              processed = generatedImages.reduce(function(accumulatedValue, generatedImage) {
                return accumulatedValue + generatedImage;
              });
              console.log("Resized " + processed + " image(s)");
            }
            return resolve(processed);
          })
          .catch(reject)
        ;
      }
    );
  };

  external.copyAttachmentFiles = function(post) {
    if (!post.meta.urlObj || !post.filename || !post.attachmentDir) {
      return false;
    }
    // Target directory
    let sourceDirectory = post.attachmentDir; // Source directory
    let sourceGlob      = glob.sync(path.join(sourceDirectory, "!(*.png|*.jpg|*.gif|*.webp|*.md)"));

    return new Promise(
      function(resolve, reject) {
        let promises = sourceGlob.map(function(sourceFile) {
          let targetFile = path.join(post.meta.urlObj.dirname(), path.basename(sourceFile));
          fs.copy(sourceFile, targetFile);
        });
        Promise
          .all(promises)
          .then(function() {
            if (promises.length > 0) {
              console.log("Copied " + promises.length + " attachment file(s)");
            }
            return resolve(promises.length);
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
        let promises = [
          external.buildIndexFiles(),
          external.buildTagPages(),
          external.buildCategoryPages(),
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
        let page;
        let pagedPosts = index.getPagedPosts(config.itemsPerPage);
        let urls = {
          indexHtml:   new IndexUrl(path + 'index.html'),
          rss:         new IndexUrl(path + 'posts.rss'),
          jsonrss:     new IndexUrl(path + 'rss.json'),
          snippetHtml: new IndexUrl(path + 'snippet._html'),
          jsonfeed:    new IndexUrl(path + 'feed.json'),
          slackjson:   new IndexUrl(path + 'slack.json'),
          geojs:       new IndexUrl(path + 'geo.json'),
          networkKml:  new IndexUrl(path + 'network.kml'),
          placesKml:   new IndexUrl(path + 'places.kml'),
          atom:        new IndexUrl(path + 'posts.atom'),
          ics:         new IndexUrl(path + 'posts.ics'),
          journal:     new IndexUrl(path + 'journal.ics'),
          ajax:        new IndexUrl(path + 'index.json'),
          gophermap:   new IndexUrl(path + 'gophermap')
        };
        let promises = [];
        if (config.specialFeatures.rss || config.specialFeatures.facebookinstantarticles) {
          promises.push(fs.writeFileAsync( urls.rss.filename(), Handlebars.compileExtra(Handlebars.templates.rssXml, {
            index:       index.getPosts(10),
            pubDate:     blogophonDateFormat(index.pubDate, 'rfc'),
            config,
            absoluteUrl: urls.rss.absoluteUrl(),
            title
          }, {
            contentHtml: config.specialFeatures.facebookinstantarticles
              ? Handlebars.templates.facebookHtml
              : '{{{safeHtml}}}'
          })));
        }
        if (config.specialFeatures.atom) {
          promises.push(fs.writeFileAsync( urls.atom.filename(), Handlebars.compileExtra(Handlebars.templates.atomXml, {
            index: index.getPosts(10),
            pubDate:     index.pubDate,
            config,
            absoluteUrl: urls.atom.absoluteUrl(),
            title
          })));
        }
        if (config.specialFeatures.gopher) {
          promises.push(fs.writeFileAsync( urls.gophermap.filename(), Handlebars.compileExtra(
            Handlebars.themeTemplates.gophermapTxt, {
              index: index.getPosts(10),
              pubDate:     index.pubDate,
              config,
              absoluteUrl: urls.gophermap.absoluteUrl(),
              title
            })
          ));
        }
        if (config.specialFeatures.teasersnippets) {
          promises.push(fs.writeFileAsync(
            urls.snippetHtml.filename(),
            Handlebars.compileExtra(Handlebars.themeTemplates.snippetHtml, {
              index:       index.getPosts(3),
              absoluteUrl: urls.indexHtml.absoluteUrl(),
              title
            })
          ));
        }
        if (config.specialFeatures.icscalendar) {
          promises.push(fs.writeFileAsync(
            urls.ics.filename(),
            Handlebars.compileExtra(Handlebars.templates.calendarIcs, {
              index: index.getPosts(),
              pubDate:     blogophonDateFormat(index.pubDate, 'ics'),
              config,
              absoluteUrl: urls.ics.absoluteUrl(),
              title
            })
          ));
        }
        if (config.specialFeatures.icsjournal) {
          promises.push(fs.writeFileAsync(
            urls.journal.filename(),
            Handlebars.compileExtra(Handlebars.templates.journalIcs, {
              index: index.getPosts(),
              pubDate:     blogophonDateFormat(index.pubDate, 'ics'),
              config,
              absoluteUrl: urls.journal.absoluteUrl(),
              title
            })
          ));
        }
        if (config.specialFeatures.jsonfeed) {
          promises.push(fs.writeFileAsync(
            urls.jsonfeed.filename(),
            JSON.stringify(
              jsonFeed(index.getPosts(20), index.pubDate, config, title, urls.jsonfeed.absoluteUrl()),
              undefined,
              2
            )
          ));
        }
        if (config.specialFeatures.jsonrss) {
          promises.push(fs.writeFileAsync(
            urls.jsonrss.filename(),
            JSON.stringify(
              jsonRss(index.getPosts(20), index.pubDate, config, title, urls.jsonrss.absoluteUrl()),
              undefined,
              2
            )
          ));
        }
        if (config.specialFeatures.jsonforslack) {
          promises.push(fs.writeFileAsync(
            urls.slackjson.filename(),
            JSON.stringify(slacked(index.getPosts(3), index.pubDate, config, title), undefined, 2))
          );
        }
        if (config.specialFeatures.geojson) {
          promises.push(fs.writeFileAsync(
            urls.geojs.filename(),
            JSON.stringify(geoJson(index.getGeoArticles()), undefined, 2))
          );
        }
        if (config.specialFeatures.kml) {
          promises.push(fs.writeFileAsync(
            urls.networkKml.filename(),
            Handlebars.compileExtra(Handlebars.templates.networkKml, {
              config,
              absoluteUrl: urls.networkKml.absoluteUrl(),
              title,
              link:        urls.placesKml.absoluteUrl()
            })
          ));
          promises.push(fs.writeFileAsync(
            urls.placesKml.filename(),
            Handlebars.compileExtra(Handlebars.templates.placesKml, {
              index:       index.getPosts(),
              config,
              absoluteUrl: urls.placesKml.absoluteUrl(),
              title
            })
          ));
        }
        if (config.specialFeatures.ajax) {
          promises.push(fs.writeFileAsync(
            urls.ajax.filename(),
            JSON.stringify(index, undefined, 2)
          ));
        }

        for (page = 0; page < pagedPosts.length; page ++) {
          let curPageObj    = index.getPageData(page, pagedPosts.length, false, path);
          let curUrlObj     = new IndexUrl(curPageObj.currentUrl);
          curPageObj.index  = pagedPosts[page];
          curPageObj.config = config;
          curPageObj.meta   = {
            title,
            subtitle:    (curPageObj.currentPage === 1)
              ? ''
              : SuperString(internal.translation.getString('Page %d/%d')).sprintf(
                curPageObj.currentPage,
                curPageObj.maxPages
              ),
            absoluteUrl: curUrlObj.absoluteUrl(),
            absoluteUrlDirname: curUrlObj.absoluteUrlDirname(),
            isHomepage:  (path === '/')
          };
          curPageObj.firstUrl = new IndexUrl(curPageObj.firstUrl).relativeUrl();
          curPageObj.prevUrl = new IndexUrl(curPageObj.prevUrl).relativeUrl();
          curPageObj.nextUrl = new IndexUrl(curPageObj.nextUrl).relativeUrl();
          curPageObj.lastUrl = new IndexUrl(curPageObj.lastUrl).relativeUrl();
          if (config.specialFeatures.acceleratedmobilepages) {
            curPageObj.meta.AbsoluteUrlAmp = curUrlObj.absoluteUrl('amp');
          }
          promises.push(fs.writeFileAsync(
            new IndexUrl(curPageObj.currentUrl).filename(),
            Handlebars.compileExtra(Handlebars.themeTemplates.indexHtml, curPageObj, Handlebars.themePartials))
          );

          curPageObj.componentScripts = webcomponents.getConsolidatedComponentScripts(curPageObj.index);

          if (config.specialFeatures.acceleratedmobilepages) {
            curPageObj.ampCss = Handlebars.ampCss;
            curPageObj.firstUrl = new IndexUrl(curPageObj.firstUrl).relativeUrl('amp');
            curPageObj.prevUrl = new IndexUrl(curPageObj.prevUrl).relativeUrl('amp');
            curPageObj.nextUrl = new IndexUrl(curPageObj.nextUrl).relativeUrl('amp');
            curPageObj.lastUrl = new IndexUrl(curPageObj.lastUrl).relativeUrl('amp');

            promises.push(fs.writeFileAsync(
              new IndexUrl(curPageObj.currentUrl).filename('amp'),
              Handlebars.compileExtra(
                Handlebars.themeTemplates.ampIndexHtml,
                curPageObj,
                Handlebars.themePartials
              )
            ));
          }
        }
        Promise
          .all(promises)
          .then(function() {
            console.log("Wrote " + promises.length + " files for '" + title + "'");
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
    let tags = internal.currentIndex.getTags();
    let tagPages = Object.keys(tags).sort().map(function(key) {
      return {
        title: tags[key].title,
        url:   tags[key].urlObj.relativeUrl()
      };
    });

    fs.removeSync(path.join(config.directories.htdocs, config.htdocs.tag));
    fs.ensureDirSync(path.join(config.directories.htdocs, config.htdocs.tag));

    return new Promise(
      function(resolve, reject) {
        let promises = Object.keys(tags).map(function(key) {
          return external.buildIndexFiles(
            tags[key].index,
            '/' + tags[key].urlObj.relativeDirname() + '/',
            SuperString(internal.translation.getString('Articles with tag "%s"')).sprintf(tags[key].title)
          );
        });

        promises.push(fs.writeFileAsync(
          new IndexUrl(config.htdocs.tag + '/index.html').filename(),
          Handlebars.compileExtra(Handlebars.themeTemplates.tagsHtml, {
            index: tagPages,
            config
          }, Handlebars.themePartials))
        );

        if (config.specialFeatures.ajax) {
          promises.push(fs.writeFileAsync(
            new IndexUrl(config.htdocs.tag + '/index.json').filename(),
            JSON.stringify(tags, undefined, 2)
          ));
        }

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
   * [buildCategoryPages description]
   * @return {Promise} with first parameter of `resolve` being the number of files converted.
   */
  external.buildCategoryPages = function() {
    let categories = internal.currentIndex.getCategories();
    let categoryPages = Object.keys(categories).sort().map(function(key) {
      return {
        title: categories[key].title,
        url:   categories[key].urlObj.relativeUrl()
      };
    });

    if (config.postPathMode !== 'Category') {
      fs.removeSync(path.join(config.directories.htdocs, config.htdocs.category));
      fs.ensureDirSync(path.join(config.directories.htdocs, config.htdocs.category));
    }

    return new Promise(
      function(resolve, reject) {
        let promises = Object.keys(categories).map(function(key) {
          return external.buildIndexFiles(
            categories[key].index,
            '/' + categories[key].urlObj.relativeDirname() + '/',
            categories[key].title
          );
        });

        promises.push(fs.writeFileAsync(
          new IndexUrl(config.htdocs.category + '/index.html').filename(),
          Handlebars.compileExtra(Handlebars.themeTemplates.tagsHtml, {
            index: categoryPages,
            config
          }, Handlebars.themePartials)
        ));

        if (config.specialFeatures.ajax) {
          promises.push(fs.writeFileAsync(
            new IndexUrl(config.htdocs.category + '/index.json').filename(),
            JSON.stringify(categories, undefined, 2)
          ));
        }

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
    let authors = internal.currentIndex.getAuthors();
    let authorPages = Object.keys(authors).sort().map(function(name) {
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

          let promises = Object.keys(authors).map(function(name) {
            return external.buildIndexFiles(
              authors[name].index,
              '/' + authors[name].urlObj.relativeDirname() + '/',
              SuperString(internal.translation.getString('Articles written by %s')).sprintf(name)
            );
          });

          promises.push(fs.writeFileAsync(
            new IndexUrl(config.htdocs.author + '/index.html').filename(),
            Handlebars.compileExtra(Handlebars.themeTemplates.authorsHtml, {
              index: authorPages,
              config
            },
            Handlebars.themePartials)
          ));

          if (config.specialFeatures.ajax) {
            promises.push(fs.writeFileAsync(
              new IndexUrl(config.htdocs.author + '/index.json').filename(),
              JSON.stringify(authors, undefined, 2)
            ));
          }

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
        let promises = [
          fs.writeFileAsync(
            new IndexUrl('404.html').filename(),
            Handlebars.compileExtra(
              Handlebars.themeTemplates.notFoundHtml, {
                index: internal.currentIndex.getPosts(5),
                config
              },
              Handlebars.themePartials
            )
          ),

          fs.writeFileAsync(
            new IndexUrl('sitemap.xml').filename(),
            Handlebars.compileExtra(
              Handlebars.templates.sitemapXml, {
                index: internal.currentIndex.getPosts(),
                pubDate: internal.currentIndex.pubDate,
                config
              }
            )
          )
        ];

        if (config.specialFeatures.microsofttiles) {
          fs.ensureDirSync(config.directories.htdocs + '/notifications');
          internal.currentIndex.getPosts(5).forEach(function(post, index) {
            promises.push(
              fs.writeFileAsync(
                new IndexUrl('notifications/livetile-' + (index + 1) + '.xml').filename(),
                Handlebars.compileExtra(
                  Handlebars.templates.livetileXml, {
                    post
                  }
                )
              )
            );
          });
        }


        Promise
          .all(promises)
          .then(function() {
            console.log("Wrote " + promises.length + " meta files");
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
    if (config.deployCmd) {
      console.log('Deploying...');
      shell.exec('cd ' + path.join(__dirname, '..') + '; ' + config.deployCmd);
      console.log('Finished deploying');
    }
    return true;
  };

  return external;
};

export default Generator;
