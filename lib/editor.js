'use strict';

const glob           = require('glob');
const fs             = require('fs-extra-promise');
const path           = require('path');
const shell          = require('shelljs');
const https          = require('https');
const blogophonDate  = require('./models/blogophon-date');
const SuperString    = require('./helpers/super-string');
const Mustache       = require('./helpers/blogophon-mustache');

const editor = function(config) {
  const external = {};

  /**
   * Get listing of all Markdown files which may be edited
   * @param  {[type]} separator [description]
   * @return {Array}   [description]
   */
  external.makeFiles = function(separator) {
    let files = [];
    if (!config.notInitialized) {
      files = glob.sync(config.directories.data + "/**/*.{md,md~}").map(function(v) {
        let filename = v.replace(/^.+\/(.+?)$/, '$1');
        let fileStat = fs.lstatSync(v);
        return {
          name: fileStat.mtime.toLocaleString(config.locale.language || 'en')
            + "\t" + filename + "\t" +Math.ceil(fileStat.size/1000)+' kB',
          value: filename,
          short: filename
        };
      });
      if (files.length > 1 && separator) {
        files.push(separator);
      }
    }
    return files;
  };

  /**
   * Returns the title to be used for generating a filename.
   * @param  {String} title  [description]
   * @param  {Object} config [description]
   * @param  {String} date   [description]
   * @return {String}        [description]
   */
  external.titleForFilename = function(title, config, date) {
    date = date || new Date();
    if (config.postFileMode) {
      return config.postFileMode
        .replace(/Title/, title)
        .replace(/Date/, blogophonDate(date).format('yyyy-mm-dd'))
      ;
    }
    return title;
  };

  /**
   * Convert title to Markdown filename
   * @param  {String} title [description]
   * @return {String}       [description]
   */
  external.filenameFromTitle = function(title) {
    return path.join(config.directories.data, external.shortfilenameFromTitle(title));
  };

  /**
   * Remove stop words from filename and limit it to a sane length.
   * @param  {String} title [description]
   * @return {String}       [description]
   */
  external.shortfilenameFromTitle = function(title) {
    return SuperString(title.trim().toLowerCase())
      .asciify()
      .replace(/(^|-)([a-z]|de[rnms]|die(s|se|ser|ses|sen|sem)?|d[aoe]s|[msd]?ein(e|es|er|em|en)?|th(e|is|at|ese|ose)|my|[ea]l|l[ao]s?|[ia][nm]|o[nf]|ist?|[ua]nd)-/g, '$1')
      .replace(/(^[-]+|[-]+$)/g, '')
      .replace(/([-])[-]+/g, '$1')
      .replace(/-(md~?)$/, '.$1')
      .replace(/^(.{64}[^-]*).*?(\.md~?)?$/, '$1$2')
    ;
  };

  /**
   * Convert Markdown filename into corresponding directory name (e.g. for images)
   * @param  {String} filename [description]
   * @return {String}          [description]
   */
  external.dirnameFromFilename = function(filename) {
    return filename.replace(/\.md~?$/, '');
  };

  /**
   * Get coordinates for address
   * @param  {String}   address  [description]
   * @param  {String}   language [description]
   * @param  {Function} callback [description]
   * @return {Object}            with `latitude, longitude`
   */
  external.convertAddress = function(address, language, callback) {
    https.get({
      host: 'nominatim.openstreetmap.org',
      path: '/search?q='+encodeURIComponent(address)+'&format=json&accept-language='+encodeURIComponent(language || 'en')
    }, function(response) {
      let body = '';
      response.on('data', function(d) {
        body += d;
      });
      response.on('end', function() {
        let parsed = JSON.parse(body);
        callback(null, {
          latitude:  parsed[0] ? parsed[0].lat : null,
          longitude: parsed[0] ? parsed[0].lon : null
        });
      });
    });
  };

  external.makePost = function(markdownFilename, filename, templateData, callback) {
    fs.writeFile(
      markdownFilename,
      Mustache.renderExtra(Mustache.templates.postMd, templateData),
      function(err) {
        if (!err) {
          if (templateData.classes === 'Images' || templateData.images) {
            shell.mkdir('-p', filename);
          }
        }
        callback(err);
      }
    );
  };

  //external.createFile = function(answers) {};
  //external.renameFile = function(answers) {};
  //external.deleteFile = function(answers) {};

  return external;
};

module.exports = editor;
