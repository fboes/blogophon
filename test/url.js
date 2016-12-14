'use strict';

var Url       = require('../src/helpers/url');
var PostUrl   = require('../src/helpers/post-url');
var AuthorUrl = require('../src/helpers/author-url');
var TagUrl    = require('../src/helpers/tag-url');
var IndexUrl  = require('../src/helpers/index-url');


exports.testExtender = function(test) {
  test.expect(7);

  var url = Url('test');

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
  test.expect(9+3);

  var url;

  url = PostUrl('ich-und-du.md');
  test.strictEqual(url.relativeUrl(), '/posts/ich-und-du/');
  test.ok(url.absoluteUrl().match(/^\S+\/posts\/ich-und-du\/$/));
  test.ok(url.filename().match(/^\S+(\/|\\)posts(\/|\\)ich-und-du(\/|\\)index\.html$/), 'Filename matching');

  url = IndexUrl('Tag');
  test.strictEqual(url.relativeUrl(), '/tag');
  test.ok(url.absoluteUrl().match(/^\S+\/tag$/));
  test.ok(url.filename().match(/^\S+(\/|\\)tag$/));

  url = TagUrl('Tag');
  test.strictEqual(url.relativeUrl(), '/tagged/tag/');
  test.ok(url.absoluteUrl().match(/^\S+\/tagged\/tag\/$/));
  test.ok(url.filename().match(/^\S+(\/|\\)tagged(\/|\\)tag(\/|\\)index\.html$/));

  url = AuthorUrl('Paul Wischwedel');
  test.strictEqual(url.relativeUrl(), '/authored-by/paul-wischwedel/');
  test.ok(url.absoluteUrl().match(/^\S+\/authored\-by\/paul\-wischwedel\/$/));
  test.ok(url.filename().match(/^\S+(\/|\\)authored\-by(\/|\\)paul\-wischwedel(\/|\\)index\.html$/));

  test.done();
};

exports.testSpecialTransformation = function(test) {
  test.expect(12);

  var url;

  url = PostUrl('Ich-ünd-Dü.md');
  test.strictEqual(url.relativeUrl(), '/posts/ich-uend-due/');
  test.ok(url.absoluteUrl().match(/^\S+\/posts\/ich-uend-due\/$/));
  test.ok(url.filename().match(/^\S+(\/|\\)posts(\/|\\)ich-uend-due(\/|\\)index\.html$/), 'Filename matching Umlauts');

  url = TagUrl('Ich bin ein merkwürdiges Tag');
  test.strictEqual(url.relativeUrl(), '/tagged/ich-bin-ein-merkwuerdiges-tag/');
  test.ok(url.absoluteUrl().match(/^\S+\/tagged\/ich-bin-ein-merkwuerdiges-tag\/$/));
  test.ok(url.filename().match(/^\S+(\/|\\)tagged(\/|\\)ich-bin-ein-merkwuerdiges-tag(\/|\\)index\.html$/));

  url = IndexUrl('/Tag');
  test.strictEqual(url.relativeUrl(), '/tag');
  test.ok(url.absoluteUrl().match(/^\S+\/tag$/));
  test.ok(url.filename().match(/^\S+(\/|\\)tag$/));

  url = IndexUrl('////Tag');
  test.strictEqual(url.relativeUrl(), '/tag');
  test.ok(url.absoluteUrl().match(/^\S+\/tag$/));
  test.ok(url.filename().match(/^\S+(\/|\\)tag$/));

  test.done();
};

exports.testPosts = function(test) {
  test.expect(2);

  test.strictEqual(PostUrl('users/posts/ich-und-du.md').relativeUrl(), '/posts/ich-und-du/');
  test.strictEqual(PostUrl('/users/posts/ich-und-du.md').relativeUrl(), '/posts/ich-und-du/');

  test.done();
};

exports.testEmptyTransformation = function(test) {
  test.expect(9);

  test.strictEqual(PostUrl(null).relativeUrl(), null);
  test.strictEqual(PostUrl(null).absoluteUrl(), null);
  test.strictEqual(PostUrl(null).filename(), null);

  test.strictEqual(IndexUrl(null).relativeUrl(), null);
  test.strictEqual(IndexUrl(null).absoluteUrl(), null);
  test.strictEqual(IndexUrl(null).filename(), null);

  test.strictEqual(TagUrl(null).relativeUrl(), null);
  test.strictEqual(TagUrl(null).absoluteUrl(), null);
  test.strictEqual(TagUrl(null).filename(), null);

  test.done();
};
