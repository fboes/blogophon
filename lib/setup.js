'use strict';

// External
const fs             = require('fs-extra-promise');
// Node.js internal
const path           = require('path');
// Blogophon internal
const Handlebars     = require('./helpers/blogophon-handlebars');

const setup = function() {

  const external = {};

  /**
   * Writes static files which will only be needed anew when the blog gets a new URL
   * @param  {Object}  config  [description]
   * @param  {Object}  answers [description]
   * @return {Promise} [description]
   */
  external.buildBasicFiles = function(config, answers) {
    Handlebars.getTemplates(config.locale.language);
    let manifest = require('./models/manifest');

    fs.ensureDirSync(config.directories.data);
    fs.ensureDirSync(config.directories.htdocs);

    fs.writeFileSync(
      path.join(config.directories.user,   'config.json'),
      JSON.stringify(answers, undefined, 2)
    );
    config = require('./config')();
    let promises = [
      fs.writeFileAsync(
        path.join(config.directories.user, config.domain + '-apache.conf'),
        Handlebars.compileExtra(Handlebars.templates.apacheConf, {
          config: config
        })
      ),
      fs.writeFileAsync(
        path.join(config.directories.user, config.domain + '-nginx.conf'),
        Handlebars.compileExtra(Handlebars.templates.nginxConf, {
          config: config
        })
      ),
      fs.writeFileAsync(
        path.join(config.directories.user, '.htaccess'),
        Handlebars.compileExtra(Handlebars.templates.htaccess, {
          config: config
        })
      ),
      fs.writeFileAsync(
        path.join(config.directories.htdocs, 'robots.txt'),
        Handlebars.compileExtra(Handlebars.templates.robotsTxt, {
          config: config
        })
      ),
      fs.writeFileAsync(
        path.join(config.directories.htdocs, 'browserconfig.xml'),
        Handlebars.compileExtra( Handlebars.templates.browserconfigXml, {
          config: config
        })
      ),
      fs.writeFileAsync(
        path.join(config.directories.htdocs, 'manifest.json'),
        JSON.stringify(manifest(config), undefined, 2)
      )
    ];
    if (config.searchUrl) {
      promises.push(
        fs.writeFileAsync(
          path.join(config.directories.htdocs, 'opensearch.xml'),
          Handlebars.compileExtra( Handlebars.templates.opensearchXml, {
            config: config
          })
        )
      );
    }
    if (config.specialFeatures.progressivewebapp) {
      promises.push(
        fs.writeFileAsync(
          path.join(config.directories.htdocs, 'sw.js'),
          Handlebars.compileExtra( Handlebars.templates.swJs, {
            config: config
          })
        )
      );
    }
    return Promise
      .all(promises)
      .then(() => {
        console.log("Wrote " + (1 + promises.length) + " basic files");
      })
      .catch((err) => {
        console.error(err);
      })
    ;
  };

  return external;
};

module.exports = setup;
