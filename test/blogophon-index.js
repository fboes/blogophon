'use strict';

const assert = require('assert');

describe('Blogophon Index', function() {
  it('should test GeneralFunctionality', function() {
    const index = require('../lib/blogophon-index');

    assert.ok(index(), 'Index does compile');
  });
});
