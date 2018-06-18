'use strict';

const assert = require('assert');

describe('Translations', function() {
  it('should translate stuff', function() {
    const translations = require('../lib/helpers/translations');

    assert.throws(function() {
      translations('xx');
    }, Error);

    // Fallback on unknown string
    assert.equal(translations('ru').getString('Unknown stuntman'), 'Unknown stuntman');

    // No fallback on known string
    assert.ok(translations('ru').getString('Home') !== 'Home');
  });
});
