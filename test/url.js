import assert from 'assert';
import Url from '../lib/helpers/Url.js';
import PostUrl from '../lib/helpers/PostUrl.js';
import AuthorUrl from '../lib/helpers/AuthorUrl.js';
import TagUrl from '../lib/helpers/TagUrl.js';
import IndexUrl from '../lib/helpers/IndexUrl.js';

describe('URL', function() {
  it('should test Extender', function() {
    let url = new Url('test');

    assert.ok(url.relativeUrl());
    assert.ok(url.absoluteUrl());
    assert.ok(url.filename());
    assert.ok(url.dirname());

    assert.match(url.relativeUrl(), /\/$/, 'No index.html at the end');
    assert.match(url.filename(), /[/\\]index\.html$/);
    assert.doesNotMatch(url.dirname(), /[/\\]index\.html$/, 'No index.html at the end');
    assert.doesNotMatch(url.dirname(), /[/\\]$/, 'No trailing slash');

    /*console.log([
      url.relativeUrl(),
      url.filename(),
      url.dirname()
    ]);*/
  });

  it('should test BasicTransformation', function() {
    let url;

    url = new PostUrl('ich-und-du.md');
    assert.match(url.relativeUrl(), /^\S*\/posts\/ich-und-du\/$/);
    assert.match(url.absoluteUrl(), /^\S*\/posts\/ich-und-du\/$/);
    assert.match(url.filename(), /^\S+(\/|\\)posts(\/|\\)ich-und-du(\/|\\)index\.html$/, 'Filename matching');

    url = new IndexUrl('Tag');
    assert.match(url.relativeUrl(), /^\S*\/tag$/);
    assert.match(url.absoluteUrl(), /^\S*\/tag$/);
    assert.match(url.filename(), /^\S+(\/|\\)tag$/);

    url = new TagUrl('Tag');
    assert.match(url.relativeUrl(), /^\S*\/tagged\/tag\/$/);
    assert.match(url.absoluteUrl(), /^\S*\/tagged\/tag\/$/);
    assert.match(url.filename(), /^\S+(\/|\\)tagged(\/|\\)tag(\/|\\)index\.html$/);

    url = new AuthorUrl('Paul Wischwedel');
    assert.match(url.relativeUrl(), /^\S*\/authored-by\/paul-wischwedel\/$/);
    assert.match(url.absoluteUrl(), /^\S*\/authored-by\/paul-wischwedel\/$/);
    assert.match(url.filename(), /^\S+(\/|\\)authored-by(\/|\\)paul-wischwedel(\/|\\)index\.html$/);
  });

  it('should test SpecialTransformation', function() {
    let url;

    url = new PostUrl('Ich-ünd-Dü.md');
    assert.match(url.relativeUrl(), /^\S*\/posts\/ich-uend-due\/$/);
    assert.match(url.absoluteUrl(), /^\S*\/posts\/ich-uend-due\/$/);
    assert.match(
      url.filename(), /^\S+(\/|\\)posts(\/|\\)ich-uend-due(\/|\\)index\.html$/,
      'Filename matching Umlauts'
    );

    url = new TagUrl('Ich bin ein merkwürdiges Tag');
    assert.match(url.relativeUrl(), /^\S*\/tagged\/ich-bin-ein-merkwuerdiges-tag\/$/);
    assert.match(url.absoluteUrl(), /^\S*\/tagged\/ich-bin-ein-merkwuerdiges-tag\/$/);
    assert.match(url.filename(), /^\S+(\/|\\)tagged(\/|\\)ich-bin-ein-merkwuerdiges-tag(\/|\\)index\.html$/);

    url = new IndexUrl('/Tag');
    assert.match(url.relativeUrl(), /^\S*\/tag$/);
    assert.match(url.absoluteUrl(), /^\S*\/tag$/);
    assert.match(url.filename(), /^\S+(\/|\\)tag$/);

    url = new IndexUrl('////Tag');
    assert.match(url.relativeUrl(), /^\S*\/tag$/);
    assert.match(url.absoluteUrl(), /^\S*\/tag$/);
    assert.match(url.filename(), /^\S+(\/|\\)tag$/);
  });

  it('should test Posts', function() {
    assert.match(new PostUrl('users/posts/ich-und-du.md').relativeUrl(), /^\S*\/posts\/ich-und-du\/$/);
    assert.match(new PostUrl('/users/posts/ich-und-du.md').relativeUrl(), /^\S*\/posts\/ich-und-du\/$/);
    assert.match(new PostUrl('\\users\\posts\\ich-und-du.md').relativeUrl(), /^\S*\/posts\/ich-und-du\/$/);
    assert.match(new PostUrl('/users/posts/ich-und-du/index.md').relativeUrl(), /^\S*\/posts\/ich-und-du\/$/);
    assert.match(new PostUrl('\\users\\posts\\ich-und-du\\index.md').relativeUrl(), /^\S*\/posts\/ich-und-du\/$/);
  });

  it('should test EmptyTransformation', function() {
    assert.strictEqual(new PostUrl(null).relativeUrl(), null);
    assert.strictEqual(new PostUrl(null).absoluteUrl(), null);
    assert.strictEqual(new PostUrl(null).filename(), null);

    assert.strictEqual(new IndexUrl(null).relativeUrl(), null);
    assert.strictEqual(new IndexUrl(null).absoluteUrl(), null);
    assert.strictEqual(new IndexUrl(null).filename(), null);

    assert.strictEqual(new TagUrl(null).relativeUrl(), null);
    assert.strictEqual(new TagUrl(null).absoluteUrl(), null);
    assert.strictEqual(new TagUrl(null).filename(), null);
  });
});
