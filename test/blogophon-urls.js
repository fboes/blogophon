var BlogophonUrls = require('../src/blogophon-urls');

exports.testBasicTransformation = function(test) {
  'use strict';
  test.expect(9+3);

  test.strictEqual(BlogophonUrls.getUrlOfPost('ich-und-du.md'), '/posts/ich-und-du/');
  test.ok(BlogophonUrls.getAbsoluteUrlOfPost('ich-und-du.md').match(/^\S+\/posts\/ich-und-du\/$/));
  test.ok(BlogophonUrls.getFileOfPost('ich-und-du.md').match(/^\S+\/posts\/ich-und-du\/index\.html$/));

  test.strictEqual(BlogophonUrls.getUrlOfIndex('Tag'), '/tag');
  test.ok(BlogophonUrls.getAbsoluteUrlOfIndex('Tag').match(/^\S+\/tag$/));
  test.ok(BlogophonUrls.getFileOfIndex('Tag').match(/^\S+\/tag$/));

  test.strictEqual(BlogophonUrls.getUrlOfTagged('Tag'), '/tagged/tag/');
  test.ok(BlogophonUrls.getAbsoluteUrlOfTagged('Tag').match(/^\S+\/tagged\/tag\/$/));
  test.ok(BlogophonUrls.getFileOfTagged('Tag').match(/^\S+\/tagged\/tag\/index\.html$/));

  test.strictEqual(BlogophonUrls.getUrlOfAuthor('Paul Wischwedel'), '/authored-by/paul-wischwedel/');
  test.ok(BlogophonUrls.getAbsoluteUrlOfAuthor('Paul Wischwedel').match(/^\S+\/authored\-by\/paul\-wischwedel\/$/));
  test.ok(BlogophonUrls.getFileOfAuthor('Paul Wischwedel').match(/^\S+\/authored\-by\/paul\-wischwedel\/index\.html$/));

  test.done();
};

exports.testSpecialTransformation = function(test) {
  'use strict';
  test.expect(6);

  test.strictEqual(BlogophonUrls.getUrlOfPost('Ich-ünd-Dü.md'), '/posts/ich-uend-due/');
  test.ok(BlogophonUrls.getAbsoluteUrlOfPost('Ich-ünd-Dü.md').match(/^\S+\/posts\/ich-uend-due\/$/));
  test.ok(BlogophonUrls.getFileOfPost('Ich-ünd-Dü.md').match(/^\S+\/posts\/ich-uend-due\/index\.html$/));

  test.strictEqual(BlogophonUrls.getUrlOfTagged('Ich bin ein merkwürdiges Tag'), '/tagged/ich-bin-ein-merkwuerdiges-tag/');
  test.ok(BlogophonUrls.getAbsoluteUrlOfTagged('Ich bin ein merkwürdiges Tag').match(/^\S+\/tagged\/ich-bin-ein-merkwuerdiges-tag\/$/));
  test.ok(BlogophonUrls.getFileOfTagged('Ich bin ein merkwürdiges Tag').match(/^\S+\/tagged\/ich-bin-ein-merkwuerdiges-tag\/index\.html$/));

  test.done();
};

exports.testPosts = function(test) {
  'use strict';
  test.expect(2);

  test.strictEqual(BlogophonUrls.getUrlOfPost('users/posts/ich-und-du.md'), '/posts/ich-und-du/');
  test.strictEqual(BlogophonUrls.getUrlOfPost('/users/posts/ich-und-du.md'), '/posts/ich-und-du/');

  test.done();
};

exports.testEmptyTransformation = function(test) {
  'use strict';
  test.expect(9);

  test.strictEqual(BlogophonUrls.getUrlOfPost(null), null);
  test.strictEqual(BlogophonUrls.getAbsoluteUrlOfPost(null), null);
  test.strictEqual(BlogophonUrls.getFileOfPost(null), null);

  test.strictEqual(BlogophonUrls.getUrlOfIndex(null), null);
  test.strictEqual(BlogophonUrls.getAbsoluteUrlOfIndex(null), null);
  test.strictEqual(BlogophonUrls.getFileOfIndex(null), null);

  test.strictEqual(BlogophonUrls.getUrlOfTagged(null), null);
  test.strictEqual(BlogophonUrls.getAbsoluteUrlOfTagged(null), null);
  test.strictEqual(BlogophonUrls.getFileOfTagged(null), null);

  test.done();
};
