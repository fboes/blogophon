'use strict';

var fs             = require('fs');
var path           = require('path');

/**
 * Represents all posts.
 * @constructor
 */
var hashes = function() {
  var hashes = {};
  var hashFilename = path.join(process.cwd(), 'user/hashes.json');

  try {
    hashes = JSON.parse(fs.readFileSync(hashFilename, 'utf8'));
  } catch (e) {
    hashes = {};
  }

  return {
    isHashed: function(url, hash) {
      return (hashes[url] && hashes[url] === hash);
    },
    update: function(url, hash) {
      hashes[url] = hash;
    },
    save: function() {
      fs.writeFileSync(hashFilename, JSON.stringify(hashes, undefined, 2));
    }
  };
};

module.exports = hashes;
