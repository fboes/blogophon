'use strict';

var url         = require('../helpers/url');
var SuperString = require('../helpers/super-string');

/**
 * [authorUrl description]
 * @param  {String} identifier [description]
 * @param  {String} path       [description]
 * @return {Object}            [description]
 */
var authorUrl = function(identifier, path) {
  var external = url(identifier);
  external.path = path || 'authored-by';

  external.convert = function(base, type) {
    base = base || 'index';
    type = type || 'html';
    return !external.identifier ? null : external.path + '/' + SuperString(external.identifier).asciify() + '/' + base + '.' + type;
  };
  return external;
};



module.exports = authorUrl;
