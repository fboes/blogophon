'use strict';

const assert = require('assert');

describe('Generator', function() {
  it('should have no syntax errors', function() {
    const generator = require('../lib/generator');

    assert.throws(function() {
      generator();
    }, Error);
  });
});
