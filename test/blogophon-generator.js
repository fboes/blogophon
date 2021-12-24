import assert from 'assert';
import blogophonConsole from '../lib/blogophon-console.js';

describe('Blogophon Console', function() {
  it('should test for general syntax errors', function() {
    assert.ok(blogophonConsole, 'Console does compile');
  });
});
