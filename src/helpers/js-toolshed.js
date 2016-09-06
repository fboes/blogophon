(function () {
  'use strict';
  /** @class String */

  /**
   * Replace `%s`, `%d`, `%f` in given string with parameters.
   * @param  {scalar}  args One or morge arguments
   * @return {String}         [description]
   */
  String.prototype.sprintf = function () {
    var i, that = this;
    if (arguments) {
      for (i = 0; i < arguments.length; ++i) {
        switch (that.match(/%([sdfF])/)[1]) {
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
        that = that.replace(/%[sdfF]/,arguments[i]);
      }
    }
    return that;
  };

  /**
   * Convert `#string` into `string`.
   * @return {String}           [description]
   */
  String.prototype.fromId = function () {
    return this.replace(/^#/,'');
  };

  /**
   * Remove any special characters from string and convert into lowercase.
   * @return {String} [description]
   */
  String.prototype.asciify = function () {
    return this.toLowerCase()
      .replace(/[äåæ]/g,'ae')
      .replace(/[áàâ]/g,'a')
      .replace(/[öøœ]/g,'oe')
      .replace(/[óòô]/g,'o')
      .replace(/[ü]/g,'ue')
      .replace(/[úùû]/g,'u')
      .replace(/[ëéèê]/g,'e')
      .replace(/[ñ]/g,'n')
      .replace(/[ß]/g,'ss')
      .replace(/[^a-z0-9\-]/g,'-')
    ;
  };

  /**
   * Convert `#string` into `string`.
   * @return {String}           [description]
   */
  String.prototype.toId = function () {
    return '#' + this.asciify();
  };

  /**
   * Convert string to XML / HTML safe string.
   * @return {String}           [description]
   */
  String.prototype.htmlEncode = function () {
    return this.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };

  /**
   * Convert String like '?a=b&c=d' into `{a:'b',c:'d'}`. See Window.location.getParameters() for implementation.
   * @param  {RegExp}  splitter term to split key/value-pairs
   * @return {Object}  E.g. `{a:'b',c:'d'}`
   */
  String.prototype.paramsToObject = function (splitter) {
    var obj = {}, parts, i, currItem;
    splitter = splitter ? splitter : /&/;
    parts = this.replace(/^\?/,'').split(splitter);
    for (i=0; i < parts.length; i++) {
      currItem = parts[i].split('=');
      obj[currItem[0]] = (currItem[1] !== undefined) ? decodeURIComponent(currItem[1]) : true;
    }
    return obj;
  };

  String.prototype.niceShorten = function (maxChars, replaceString) {
    replaceString = replaceString ? replaceString : '';
    if (this.length > maxChars) {
      return this.trim().replace(new RegExp('^(.{0,' + (maxChars-2) + '}\\W)(.*?)'),'$1') + replaceString;
    }
    return this.trim();
  };

  /** @class Number */

  /**
   * Convert a number to a string representation with a fixed width, e.g. by padding it with `0`. See also `.toFixed()` for padding the decimals of a given number.
   * @param  {integer} digits number of characters
   * @return {String}         [description]
   */
  Number.prototype.toFixedString = function (digits, decimals) {
    decimals = decimals ? decimals : 0;
    if (digits <= 0) {
      return '';
    }
    var thisString = Math.abs(Math.roundPrecision(this, decimals)).toFixed(decimals),i;
    if (this >= 0) {
      for (i = (digits - 1); i > 0; i--) {
        if (this < Math.pow(10,i)) {
          thisString = '0' + thisString;
        }
      }
    } else {
      for (i = (digits - 1); i > 0; i--) {
        if (this > -Math.pow(10,i)) {
          thisString = '0' + thisString;
        }
      }
      thisString = '-' + thisString;
    }
    return thisString;
  };

  /** @class Math */

  /**
   * Round number to a given number of decimals.
   * @param  {Number}  val       [description]
   * @param  {integer} precision [description]
   * @return {Number}            [description]
   */
  Math.roundPrecision = function (val, precision) {
    return Math.round(val * Math.pow(10,precision)) / Math.pow(10,precision);
  };

  /**
   * Get a random number between min (inclusive) and max (inclusive).
   * @param  {integer} min [description]
   * @param  {integer} max [description]
   * @return {integer}     [description]
   */
  Math.randomInt = function (min, max) {
    min = parseInt(min);
    max = parseInt(max);
    return Math.floor(Math.random() * (max - min +1)) + min;
  };
}());
