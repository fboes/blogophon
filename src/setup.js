'use strict';
var Mustache       = require('./helpers/blogophon-mustache');
var fs             = require('fs-extra-promise');
var path           = require('path');
var Promise        = require('promise/lib/es6-extensions');

var setup = function() {
  Mustache.getTemplates();

  var external = {};

  /**
   * Writes static files which will only be needed anew when the blog gets a new URL
   * @param  {Object}  config  [description]
   * @param  {Object}  answers [description]
   * @return {Promise} [description]
   */
  external.buildBasicFiles = function(config, answers) {
    var manifest = require('./models/manifest');

    fs.ensureDirSync(config.directories.data);
    fs.ensureDirSync(config.directories.htdocs);

    var promises = [
      fs.writeFileAsync(
        path.join(config.directories.user,   'config.json'),
        JSON.stringify(answers, undefined, 2)),
      fs.writeFileAsync(
        path.join(config.directories.htdocs, '.htaccess'),
        Mustache.render(Mustache.templates.htaccess, {
          config: config
        })
      ),
      fs.writeFileAsync(
        path.join(config.directories.htdocs, 'robots.txt'),
        Mustache.render(Mustache.templates.robotsTxt, {
          config: config
        })
      ),
      fs.writeFileAsync(
        path.join(config.directories.htdocs, 'opensearch.xml'),
        Mustache.render( Mustache.templates.opensearchXml, {
          config: config
        })
      ),
      fs.writeFileAsync(
        path.join(config.directories.htdocs, 'browserconfig.xml'),
        Mustache.render( Mustache.templates.browserconfigXml, {
          config: config
        })
      ),
      fs.writeFileAsync(
        path.join(config.directories.htdocs, 'manifest.json'),
        JSON.stringify(manifest(config), undefined, 2))
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

module.exports = setup;
