'use strict';
const Mustache       = require('./helpers/blogophon-mustache');
const fs             = require('fs-extra-promise');
const path           = require('path');
const Promise        = require('promise/lib/es6-extensions');

const setup = function() {
  Mustache.getTemplates();

  const external = {};

  /**
   * Writes static files which will only be needed anew when the blog gets a new URL
   * @param  {Object}  config  [description]
   * @param  {Object}  answers [description]
   * @return {Promise} [description]
   */
  external.buildBasicFiles = function(config, answers) {
    let manifest = require('./models/manifest');

    fs.ensureDirSync(config.directories.data);
    fs.ensureDirSync(config.directories.htdocs);

    let promises = [
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
      .then(() => {
        console.log("Wrote " + promises.length + " basic files");
      })
      .catch((err) => {
        console.error(err);
      })
    ;
  };

  return external;
};

module.exports = setup;
