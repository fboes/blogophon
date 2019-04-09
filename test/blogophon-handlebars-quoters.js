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

    tested = blogophonHandlebarsQuoter._getRatio(16, 9);
    assert.strictEqual(tested,  1.78);

    tested = blogophonHandlebarsQuoter._getRatio(1920, 1080);
    assert.strictEqual(tested,  1.78);

    tested = blogophonHandlebarsQuoter._getRatio(4, 3);
    assert.strictEqual(tested,  1.33);

    tested = blogophonHandlebarsQuoter._getRatio(640, 480);
    assert.strictEqual(tested,  1.33);
  });

  it('must add lazy loading to images and iframes', function() {
    const inputHtml = `<img src="celebration.jpg" alt="..." />
<iframe src="video-player.html"></iframe>`;
    let outputHtml = blogophonHandlebarsQuoter.lazyloadAttributes(inputHtml);
    assert.strictEqual(outputHtml.match(/ loading="lazy"/g).length,  2);

    outputHtml = blogophonHandlebarsQuoter.lazyloadAttributes(inputHtml, 'eager');
    assert.strictEqual(outputHtml.match(/ loading="eager"/g).length,  2);
  });
});
