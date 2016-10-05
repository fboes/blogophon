'use strict';

var url         = require('../helpers/url');
var SuperString = require('../helpers/super-string');

/**
 * [postUrl description]
 * @param {[type]} identifier [description]
 */
var postUrl = function (identifier, path) {
  var external = url(identifier);
  external.path = path || 'posts';

  external.convert = function (base, type) {
    base = base || 'index';
    type = type || 'html';
    return !external.identifier ? null : external.path + '/' + new SuperString(external.identifier.replace(/\.[^\.]+$/,'').replace(/.+\//,'')).asciify() + '/' + base + '.' + type;
  };

  return external;
};

module.exports = postUrl;
