
/**
 * [url description]
 * @param  {String} string [description]
 * @return {url}           [description]
 */
const SuperString = function(string) {
  const external = {};
  external.string = String(string);

  /**
   * Replace `%s`, `%d`, `%f` in given string with parameters.
   * @param  {scalar}  args One or more arguments
   * @return {String}       [description]
   */
  external.sprintf = function() {
    let i;
    if (arguments) {
      for (i = 0; i < arguments.length; ++i) {
        switch (external.string.match(/%([sdfF])/)[1]) {
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
        external.string = external.string.replace(/%[sdfF]/, arguments[i]);
      }
    }
    return external.string;
  };

  /**
   * Convert `#string` into `string`.
   * @return {String}           [description]
   */
  external.fromId = function() {
    return external.string.replace(/^#/, '');
  };

  /**
   * Remove any special characters from string and convert into lowercase.
   * @return {String} [description]
   */
  external.asciify = function() {
    return external.string.toLowerCase().replace(/[äåæáàâãöøœóòôõüúùûëéèêïíìîÿýñß]/g, function(s) {
      return s.replace(/[äåæ]/g, 'ae')
        .replace(/[áàâã]/, 'a')
        .replace(/[öøœ]/, 'oe')
        .replace(/[óòôõ]/, 'o')
        .replace(/[ü]/, 'ue')
        .replace(/[úùû]/, 'u')
        .replace(/[ëéèê]/, 'e')
        .replace(/[ïíìî]/, 'i')
        .replace(/[ÿý]/, 'y')
        .replace(/[ñ]/, 'n')
        .replace(/[ß]/, 'ss')
      ;
    })
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/(-)-+/g, '$1')
    ;
  };

  /**
   * Convert `#string` into `string`.
   * @return {String}           [description]
   */
  external.toId = function() {
    return '#' + external.asciify();
  };

  /**
   * Convert string to XML / HTML safe SuperString.
   * @return {String}           [description]
   */
  external.htmlEncode = function() {
    return external.string.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  /**
   * Convert String like '?a=b&c=d' into `{a:'b',c:'d'}`. See Window.location.getParameters() for implementation.
   * @param  {RegExp}  splitter term to split key/value-pairs
   * @return {Object}  E.g. `{a:'b',c:'d'}`
   */
  external.paramsToObject = function(splitter) {
    let obj = {}, parts, i, currItem;
    splitter = splitter ? splitter : /&/;
    parts = external.string.replace(/^\?/, '').split(splitter);
    for (i = 0; i < parts.length; i++) {
      currItem = parts[i].split('=');
      obj[currItem[0]] = (currItem[1]) ? decodeURIComponent(currItem[1]) : true;
    }
    return obj;
  };

  /**
   * Shorten string to a given maxChars length, using replaceString if it has
   * to be shortened.
   * @param  {Number} maxChars      [description]
   * @param  {String} replaceString [description]
   * @return {String}               [description]
   */
  external.niceShorten = function(maxChars, replaceString) {
    replaceString = replaceString ? replaceString : '…';
    if (external.string.length > maxChars) {
      return external.string.trim().replace(new RegExp('^([\\s\\S]{0,' + (maxChars - 2) + '})(\\W[\\s\\S]*?)$'), '$1' + replaceString );
    }
    return external.string.trim();
  };

  /**
   * [toString description]
   * @return {String} [description]
   */
  external.toString = function() {
    return external.string;
  };
  return external;
};

export default SuperString;
