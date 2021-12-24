
import assert from 'assert';
import generator from '../lib/generator.js';

describe('Generator', function() {
  it('should have no syntax errors', function() {

    assert.throws(function() {
      generator();
    }, Error);
  });
});
