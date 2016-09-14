var Url       = require('../src/helpers/url');
var PostUrl   = require('../src/helpers/post-url');
var AuthorUrl = require('../src/helpers/author-url');
var TagUrl    = require('../src/helpers/tag-url');
var IndexUrl  = require('../src/helpers/index-url');


exports.testExtender = function(test) {
  'use strict';
  test.expect(7);

  var url = new Url('test');

  test.ok(url.relativeUrl());
  test.ok(url.absoluteUrl());
  test.ok(url.filename());
  test.ok(url.dirname());

  test.strictEqual(url.relativeUrl(), '/test/');
  test.ok(url.filename().match(/index\.html$/));
  test.ok(!url.dirname().match(/index\.html$/));

  test.done();
};

exports.testBasicTransformation = function(test) {
  'use strict';
  test.expect(9+3);

  var url;

  url = new PostUrl('ich-und-du.md');
  test.strictEqual(url.relativeUrl(), '/posts/ich-und-du/');
  test.ok(url.absoluteUrl().match(/^\S+\/posts\/ich-und-du\/$/));
  test.ok(url.filename().match(/^\S+\/posts\/ich-und-du\/index\.html$/));

  url = new IndexUrl('Tag');
  test.strictEqual(url.relativeUrl(), '/tag');
  test.ok(url.absoluteUrl().match(/^\S+\/tag$/));
  test.ok(url.filename().match(/^\S+\/tag$/));

  url = new TagUrl('Tag');
  test.strictEqual(url.relativeUrl(), '/tagged/tag/');
  test.ok(url.absoluteUrl().match(/^\S+\/tagged\/tag\/$/));
  test.ok(url.filename().match(/^\S+\/tagged\/tag\/index\.html$/));

  url = new AuthorUrl('Paul Wischwedel');
  test.strictEqual(url.relativeUrl(), '/authored-by/paul-wischwedel/');
  test.ok(url.absoluteUrl().match(/^\S+\/authored\-by\/paul\-wischwedel\/$/));
  test.ok(url.filename().match(/^\S+\/authored\-by\/paul\-wischwedel\/index\.html$/));

  test.done();
};

exports.testSpecialTransformation = function(test) {
  'use strict';
  test.expect(12);

  var url;

  url = new PostUrl('Ich-ünd-Dü.md');
  test.strictEqual(url.relativeUrl(), '/posts/ich-uend-due/');
  test.ok(url.absoluteUrl().match(/^\S+\/posts\/ich-uend-due\/$/));
  test.ok(url.filename().match(/^\S+\/posts\/ich-uend-due\/index\.html$/));

  url = new TagUrl('Ich bin ein merkwürdiges Tag');
  test.strictEqual(url.relativeUrl(), '/tagged/ich-bin-ein-merkwuerdiges-tag/');
  test.ok(url.absoluteUrl().match(/^\S+\/tagged\/ich-bin-ein-merkwuerdiges-tag\/$/));
  test.ok(url.filename().match(/^\S+\/tagged\/ich-bin-ein-merkwuerdiges-tag\/index\.html$/));

  url = new IndexUrl('/Tag');
  test.strictEqual(url.relativeUrl(), '/tag');
  test.ok(url.absoluteUrl().match(/^\S+\/tag$/));
  test.ok(url.filename().match(/^\S+\/tag$/));

  url = new IndexUrl('////Tag');
  test.strictEqual(url.relativeUrl(), '/tag');
  test.ok(url.absoluteUrl().match(/^\S+\/tag$/));
  test.ok(url.filename().match(/^\S+\/tag$/));

  test.done();
};

exports.testPosts = function(test) {
  'use strict';
  test.expect(2);

  test.strictEqual(new PostUrl('users/posts/ich-und-du.md').relativeUrl(), '/posts/ich-und-du/');
  test.strictEqual(new PostUrl('/users/posts/ich-und-du.md').relativeUrl(), '/posts/ich-und-du/');

  test.done();
};

exports.testEmptyTransformation = function(test) {
  'use strict';
  test.expect(9);

  test.strictEqual(new PostUrl(null).relativeUrl(), null);
  test.strictEqual(new PostUrl(null).absoluteUrl(), null);
  test.strictEqual(new PostUrl(null).filename(), null);

  test.strictEqual(new IndexUrl(null).relativeUrl(), null);
  test.strictEqual(new IndexUrl(null).absoluteUrl(), null);
  test.strictEqual(new IndexUrl(null).filename(), null);

  test.strictEqual(new TagUrl(null).relativeUrl(), null);
  test.strictEqual(new TagUrl(null).absoluteUrl(), null);
  test.strictEqual(new TagUrl(null).filename(), null);

  test.done();
};
