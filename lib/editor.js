import glob from 'glob';
import fs from 'fs-extra-promise';
import path from 'path';
import https from 'https';
import SuperString from './helpers/super-string.js';
import Handlebars from './helpers/blogophon-handlebars.js';
import blogophonDateFormat from './helpers/blogophon-date-format.js';

const editor = function(config) {
  const external = {};
  const internal = {
    markdownFixedFilename: 'index.md'
  };

  /**
   * Get listing of all Markdown files which may be edited
   * @param  {[type]} separator [description]
   * @return {Array}   [description]
   */
  external.makeFiles = function(separator) {
    let files = [];
    if (!config.notInitialized) {
      files = glob.sync(config.directories.data + "/**/*.{md,md~}").map((v) => {
        let filename = path.relative(config.directories.data, v);
        let fileStat = fs.lstatSync(v);
        return {
          name: blogophonDateFormat(fileStat.ctime, 'yyyy-mm-dd HH:MM')
            + "\t" + external.getSlugFromFilename(filename) + "\t" + Math.ceil(fileStat.size / 1000) + ' kB',
          value: filename,
          short: filename
        };
      });
      if (files.length > 4 && separator) {
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
        .replace(/Date/, blogophonDateFormat(date, 'yyyy-mm-dd'))
      ;
    }
    return title;
  };

  /**
   * Convert title to Markdown filename
   * @param  {String} title        of post
   * @param  {Number} filenameMode If set to `0` will generate `TITLE.md`.
   *                               If set to `1` will generate `TITLE/index.md`.
   * @return {String}              Generated filename
   */
  external.filenameFromTitle = function(title, filenameMode = 1) {
    return (filenameMode && internal.markdownFixedFilename)
      ? path.join(config.directories.data, external.shortfilenameFromTitle(title), internal.markdownFixedFilename)
      : path.join(config.directories.data, external.shortfilenameFromTitle(title) + '.md')
    ;
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
  external.getAttachmentDirectoryFromFilename = function(filename) {
    if (!external.isSlugInDirectory(filename)) {
      filename = filename.replace(/(\.md)$/, '/index$1');
    }
    return path.dirname(filename);
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
      path: '/search?q=' + encodeURIComponent(address) + '&format=json&accept-language=' + encodeURIComponent(language || 'en')
    }, (response) => {
      let body = '';
      response.on('data', (d) => {
        body += d;
      });
      response.on('end', () => {
        let parsed = JSON.parse(body);
        callback(null, {
          latitude:  parsed[0] ? parsed[0].lat : null,
          longitude: parsed[0] ? parsed[0].lon : null
        });
      });
    });
  };

  /**
   * [createFile description]
   * @param  {String}   filename     [description]
   * @param  {String}   templateData [description]
   * @param  {Function} callback     [description]
   * @return {[type]}                [description]
   */
  external.createFile = function(filename, templateData, callback) {
    fs.ensureDir(path.dirname(filename), (err) => {
      if (err) {
        callback(err);
      } else {
        fs.writeFile(
          filename,
          Handlebars.compileExtra(Handlebars.templates.postMd, templateData),
          (err) => {
            callback(err);
          }
        );
      }
    });
  };

  /**
   * [renameFile description]
   * @param  {String}   filename [description]
   * @param  {String}   newSlug       [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  external.renameFile = function(filename, newSlug, callback) {
    let processed = 0, maxProcessed = 0;
    const checkProcessed = (err) => {
      if (++processed === maxProcessed) {
        callback(err);
      }
    };
    const articleSourceFile = path.join(
      config.directories.data,
      filename
    );
    const articleSourceDirectory = path.join(
      config.directories.data,
      external.getAttachmentDirectoryFromFilename(filename)
    );
    const articleDirectory = path.join(
      config.directories.data.replace(/([/\\])user([/\\])/, '$1htdocs$2'),
      external.getAttachmentDirectoryFromFilename(filename)
    );

    if (!external.isSlugInDirectory(filename) && fs.existsSync(articleSourceFile)) {
      maxProcessed++;
      fs.move(
        articleSourceFile,
        path.join(config.directories.data, newSlug + '.md'),
        checkProcessed
      );
    }
    if (fs.existsSync(articleSourceDirectory)) {
      maxProcessed ++;
      fs.move(
        articleSourceDirectory,
        path.join(config.directories.data, newSlug),
        checkProcessed
      );
    }
    if (fs.existsSync(articleDirectory)) {
      maxProcessed ++;
      fs.move(
        articleDirectory,
        path.join(config.directories.data.replace(/([/\\])user([/\\])/, '$1htdocs$2'), newSlug),
        checkProcessed
      );
    }
  };

  /**
   * [deleteFile description]
   * @param  {String}   filename [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  external.deleteFile = function(filename, callback) {
    let processed = 0, maxProcessed = 0;
    const checkProcessed = (err) => {
      if (++processed === maxProcessed) {
        callback(err);
      }
    };
    const articleSourceFile = path.join(
      config.directories.data,
      filename
    );
    const articleSourceDirectory = path.join(
      config.directories.data,
      external.getAttachmentDirectoryFromFilename(filename)
    );
    const articleDirectory = path.join(
      config.directories.data.replace(/([/\\])user([/\\])/, '$1htdocs$2'),
      external.getAttachmentDirectoryFromFilename(filename)
    );

    if (!external.isSlugInDirectory(filename) && fs.existsSync(articleSourceFile)) {
      maxProcessed++;
      fs.remove(articleSourceFile, checkProcessed);
    }
    if (fs.existsSync(articleSourceDirectory)) {
      maxProcessed++;
      fs.remove(articleSourceDirectory, checkProcessed);
    }
    if (fs.existsSync(articleDirectory)) {
      maxProcessed++;
      fs.remove(articleDirectory, checkProcessed);
    }
  };

  /**
   * Check if the current filename hides its slug in a directory or in its
   * filename.
   * @param  {String}  filename [description]
   * @return {Boolean}          [description]
   */
  external.isSlugInDirectory = function(filename) {
    return (path.basename(filename) === internal.markdownFixedFilename);
  };

  /**
   * Get slug from filename.
   * @param  {String}  filename [description]
   * @return {Boolean}          [description]
   */
  external.getSlugFromFilename = function(filename) {
    return external.isSlugInDirectory(filename)
      ? path.dirname(filename).replace(/^.*[/\\]/, '')
      : path.basename(filename).replace(/\.md$/, '')
    ;
  };

  return external;
};

export default editor;
