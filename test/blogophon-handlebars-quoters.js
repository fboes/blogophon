'use strict';

const assert = require('assert');
const blogophonHandlebarsQuoter = require('../lib/helpers/blogophon-handlebars-quoters');

describe('Blogophon Handlebars Quoters', function() {
  it('must not have any syntax errors', function() {
    assert.ok(blogophonHandlebarsQuoter, 'Does compile');
  });

  it('must convert images', function() {
    let tested = blogophonHandlebarsQuoter._getDimensions('test/test-123x456.jpg');
    assert.ok(tested);
    assert.strictEqual(tested.width,  123);
    assert.strictEqual(tested.height, 456);
    assert.notStrictEqual(tested.width,  "123");
    assert.notStrictEqual(tested.height, "456");

    tested = blogophonHandlebarsQuoter._getDimensions('test/test.jpg');
    // console.log(tested);
    assert.ok(tested);
    assert.strictEqual(tested.width,  0);
    assert.strictEqual(tested.height, 0);
  });
});
