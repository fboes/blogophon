import assert from 'assert';
import index from '../lib/blogophon-index.js';

describe('Blogophon Index', function() {
  it('should test for general syntax errors', function() {
    assert.ok(index(), 'Index does compile');
  });
});
