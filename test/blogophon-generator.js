'use strict';

const assert = require('assert');
const blogophonConsole = require('../lib/blogophon-console');

describe('Blogophon Console', function() {
  it('should test for general syntax errors', function() {
    assert.ok(blogophonConsole, 'Console does compile');
  });
});
