'use strict';

var fs             = require('fs');
var path           = require('path');

/**
 * Represents all list of item hashes. This may be useful to determine if a item has been altered.
 * On invocation this will load the old hash state from the hashing file.
 * @param  {String}  hashFilename  Defaults to project default
 * @constructor
 */
var hashes = function(hashFilename) {
  hashFilename = hashFilename || path.join(process.cwd(), 'user/hashes.json');

  var external = {};

  var hashes = {};
  var updatedHashes = {};
  try {
    hashes = JSON.parse(fs.readFileSync(hashFilename, 'utf8'));
  } catch (e) {
    hashes = {};
  }

  /**
   * Check if a hash for `key` exists, and if it matches `hash`
   * @param  {String}  key  [description]
   * @param  {String}  hash [description]
   * @return {Boolean}      If `key` exists and matches `hash`.
   */
  external.matchesHash = function(key, hash) {
    return (hashes[key] && hashes[key] === hash || false);
  };

  /**
   * Change the state of the current hash for a given key (e.g. after updating an item).
   * @param  {String} key  [description]
   * @param  {String} hash [description]
   * @return {Boolean}     Whether or nor an update was needed.
   */
  external.update = function(key, hash) {
    if (hashes[key] !== hash) {
      updatedHashes[key] = hashes[key];
      hashes[key] = hash;
      return true;
    }
    return false;
  };

  /**
   * Get a list of all keys (with their hashes) which have been altered by calling `.update()`.
   * @return {Object} [description]
   */
  external.getUpdatedHashes = function () {
    return updatedHashes;
  };

  /**
   * Save current state of hashes back to hashing file.
   * @return {Boolean} [description]
   */
  external.save = function() {
    return fs.writeFileSync(hashFilename, JSON.stringify(hashes, undefined, 2));
  };

  return external;
};

module.exports = hashes;
