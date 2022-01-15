import path from 'path';
import SuperString from './super-string.js';
import configJs from '../config.js';

const config = configJs();

class Url {
  /**
   * [url description]
   * @constructor
   * @param  {String} identifier [description]
   */
  constructor(identifier) {
    this.identifier = identifier ? identifier.replace(/^\/+/, '') : null;
  }

  /**
   * [convert description]
   * @param  {String} base Filename of file
   * @param  {String} type File type
   * @return {String}      [description]
   */
  convert(base = 'index', type = 'html') {
    return !this.identifier ? null : SuperString(this.identifier).asciify() + '/' + base + '.' + type;
  }

  /**
   * [relativeUrl description]
   * @param  {String} base Filename of file
   * @param  {String} type File type
   * @return {String} [description]
   */
  relativeUrl(base, type) {
    const url = this.convert(base, type);
    return !url ? null : config.basePath + url.replace(/\/index\.html$/, '/');
  }

  /**
   * [absoluteUrl description]
   * @param  {String} base Filename of file
   * @param  {String} type File type
   * @return {String} [description]
   */
  absoluteUrl(base, type) {
    const url = this.relativeUrl(base, type);
    return !url ? null : config.baseUrl + url;
  }

  /**
   * [absoluteUrlDirname description]
   * @return {String} [description]
   */
  absoluteUrlDirname() {
    const url = this.absoluteUrl();
    return !url ? null : path.dirname(url + '-');
  }

  /**
   * [filename description]
   * @param  {String} base Filename of file
   * @param  {String} type File type
   * @return {String} [description]
   */
  filename(base, type) {
    const url = this.relativeFilename(base, type);
    return !url ? null : path.join(config.directories.htdocs, url);
  }

  /**
   * [dirname description]
   * @return {String} [description]
   */
  dirname() {
    const url = this.filename();
    return !url ? null : path.dirname(url);
  }

  /**
   * [relativeFilename description]
   * @param  {[type]} base [description]
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  relativeFilename(base, type) {
    const url = this.convert(base, type);
    return !url ? null : url.replace(/(\/)$/, '$1index.html');
  }

  /**
   * [relativeDirname description]
   * @param  {[type]} base [description]
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  relativeDirname(base, type) {
    const url = this.relativeFilename(base, type);
    return !url ? null : path.dirname(url);
  }

  /**
   * [toString description]
   * @return {String} [description]
   */
  toString() {
    return this.identifier;
  }
}

export default Url;
