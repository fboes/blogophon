'use strict';

var fs             = require('fs');

/**
 * Represents all posts.
 * @constructor
 */
var Hashes = function () {
  var hashes = {};
  var hashFilename = './user/hashes.json';

  try {
    hashes = JSON.parse(fs.readFileSync(hashFilename, 'utf8'));
  } catch (e) {
    hashes = {};
  }

  return {
    isHashed: function (url, hash) {
      return (hashes[url] !== undefined && hashes[url] === hash);
    },
    update: function (url, hash) {
      hashes[url] = hash;
    },
    save: function () {
      fs.writeFileSync(hashFilename, JSON.stringify(hashes, undefined, 2));
    }
  };
};

module.exports = Hashes;
