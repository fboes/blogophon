'use strict';

/**
 * [Url description]
 * @param  {String} identifier [description]
 * @return {Url}    [description]
 */
var SuperString = function (string) {
  this.string = String(string);
  return this;
};

/**
 * Replace `%s`, `%d`, `%f` in given string with parameters.
 * @param  {scalar}  args One or morge arguments
 * @return {String}         [description]
 */
SuperString.prototype.sprintf = function() {
  var i, that = this;
  if (arguments) {
    for (i = 0; i < arguments.length; ++i) {
      switch (that.string.match(/%([sdfF])/)[1]) {
        case 'd':
          arguments[i] = parseInt(arguments[i]);
          break;
        case 'f':
        case 'F':
          arguments[i] = parseFloat(arguments[i]);
          break;
        case 's':
          arguments[i] = String(arguments[i]);
          break;
      }
      that.string = that.string.replace(/%[sdfF]/,arguments[i]);
    }
  }
  return that.string;
};

/**
 * Convert `#string` into `string`.
 * @return {String}           [description]
 */
SuperString.prototype.fromId = function() {
  return this.string.replace(/^#/,'');
};

/**
 * Remove any special characters from string and convert into lowercase.
 * @return {String} [description]
 */
SuperString.prototype.asciify = function() {
  return this.string.toLowerCase().replace(/[äåæáàâãöøœóòôõüúùûëéèêïíìîÿýñß]/g, function(s) {
    return s.replace(/[äåæ]/g,'ae')
      .replace(/[áàâã]/,'a')
      .replace(/[öøœ]/,'oe')
      .replace(/[óòôõ]/,'o')
      .replace(/[ü]/,'ue')
      .replace(/[úùû]/,'u')
      .replace(/[ëéèê]/,'e')
      .replace(/[ïíìî]/,'i')
      .replace(/[ÿý]/,'y')
      .replace(/[ñ]/,'n')
      .replace(/[ß]/,'ss')
    ;
  }).replace(/[^a-z0-9\-]/g,'-');
};

/**
 * Convert `#string` into `string`.
 * @return {String}           [description]
 */
SuperString.prototype.toId = function() {
  return '#' + this.asciify();
};

/**
 * Convert string to XML / HTML safe SuperString.
 * @return {String}           [description]
 */
SuperString.prototype.htmlEncode = function() {
  return this.string.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
};

/**
 * Convert String like '?a=b&c=d' into `{a:'b',c:'d'}`. See Window.location.getParameters() for implementation.
 * @param  {RegExp}  splitter term to split key/value-pairs
 * @return {Object}  E.g. `{a:'b',c:'d'}`
 */
SuperString.prototype.paramsToObject = function(splitter) {
  var obj = {}, parts, i, currItem;
  splitter = splitter ? splitter : /&/;
  parts = this.string.replace(/^\?/,'').split(splitter);
  for (i=0; i < parts.length; i++) {
    currItem = parts[i].split('=');
    obj[currItem[0]] = (currItem[1] !== undefined) ? decodeURIComponent(currItem[1]) : true;
  }
  return obj;
};

SuperString.prototype.niceShorten = function(maxChars, replaceString) {
  replaceString = replaceString ? replaceString : '…';
  if (this.string.length > maxChars) {
    return this.string.trim().replace(new RegExp('^(.{0,' + (maxChars-2) + '})(\\W.*?)$'),'$1') + replaceString;
  }
  return this.string.trim();
};

/**
 * [toString description]
 * @return {String} [description]
 */
SuperString.prototype.toString = function() {
  return this.string;
};

module.exports = SuperString;
