'use strict';

const assert = require('assert');

describe('Generator', function() {
  it('should test Compilability', function() {
    const generator = require('../lib/generator');

    assert.throws(function() {
      generator();
    }, Error);
  });
});
