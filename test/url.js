import assert from 'assert';
import Url from '../lib/helpers/url.js';
import PostUrl from '../lib/helpers/post-url.js';
import AuthorUrl from '../lib/helpers/author-url.js';
import TagUrl from '../lib/helpers/tag-url.js';
import IndexUrl from '../lib/helpers/index-url.js';

describe('URL', function() {
  it('should test Extender', function() {
    let url = Url('test');

    assert.ok(url.relativeUrl());
    assert.ok(url.absoluteUrl());
    assert.ok(url.filename());
    assert.ok(url.dirname());

    assert.ok(url.relativeUrl().match(/\/$/), 'No index.html at the end');
    assert.ok(url.filename().match(/[/\\]index\.html$/));
    assert.ok(!url.dirname().match(/[/\\]index\.html$/), 'No index.html at the end');
    assert.ok(!url.dirname().match(/[/\\]$/), 'No trailing slash');

    /*console.log([
      url.relativeUrl(),
      url.filename(),
      url.dirname()
    ]);*/
  });

  it('should test BasicTransformation', function() {
    let url;

    url = PostUrl('ich-und-du.md');
    assert.ok(url.relativeUrl().match(/^\S*\/posts\/ich-und-du\/$/));
    assert.ok(url.absoluteUrl().match(/^\S*\/posts\/ich-und-du\/$/));
    assert.ok(url.filename().match(/^\S+(\/|\\)posts(\/|\\)ich-und-du(\/|\\)index\.html$/), 'Filename matching');

    url = IndexUrl('Tag');
    assert.ok(url.relativeUrl().match(/^\S*\/tag$/));
    assert.ok(url.absoluteUrl().match(/^\S*\/tag$/));
    assert.ok(url.filename().match(/^\S+(\/|\\)tag$/));

    url = TagUrl('Tag');
    assert.ok(url.relativeUrl().match(/^\S*\/tagged\/tag\/$/));
    assert.ok(url.absoluteUrl().match(/^\S*\/tagged\/tag\/$/));
    assert.ok(url.filename().match(/^\S+(\/|\\)tagged(\/|\\)tag(\/|\\)index\.html$/));

    url = AuthorUrl('Paul Wischwedel');
    assert.ok(url.relativeUrl().match(/^\S*\/authored-by\/paul-wischwedel\/$/));
    assert.ok(url.absoluteUrl().match(/^\S*\/authored-by\/paul-wischwedel\/$/));
    assert.ok(url.filename().match(/^\S+(\/|\\)authored-by(\/|\\)paul-wischwedel(\/|\\)index\.html$/));
  });

  it('should test SpecialTransformation', function() {
    let url;

    url = PostUrl('Ich-ünd-Dü.md');
    assert.ok(url.relativeUrl().match(/^\S*\/posts\/ich-uend-due\/$/));
    assert.ok(url.absoluteUrl().match(/^\S*\/posts\/ich-uend-due\/$/));
    assert.ok(
      url.filename().match(/^\S+(\/|\\)posts(\/|\\)ich-uend-due(\/|\\)index\.html$/),
      'Filename matching Umlauts'
    );

    url = TagUrl('Ich bin ein merkwürdiges Tag');
    assert.ok(url.relativeUrl().match(/^\S*\/tagged\/ich-bin-ein-merkwuerdiges-tag\/$/));
    assert.ok(url.absoluteUrl().match(/^\S*\/tagged\/ich-bin-ein-merkwuerdiges-tag\/$/));
    assert.ok(url.filename().match(/^\S+(\/|\\)tagged(\/|\\)ich-bin-ein-merkwuerdiges-tag(\/|\\)index\.html$/));

    url = IndexUrl('/Tag');
    assert.ok(url.relativeUrl().match(/^\S*\/tag$/));
    assert.ok(url.absoluteUrl().match(/^\S*\/tag$/));
    assert.ok(url.filename().match(/^\S+(\/|\\)tag$/));

    url = IndexUrl('////Tag');
    assert.ok(url.relativeUrl().match(/^\S*\/tag$/));
    assert.ok(url.absoluteUrl().match(/^\S*\/tag$/));
    assert.ok(url.filename().match(/^\S+(\/|\\)tag$/));
  });

  it('should test Posts', function() {
    assert.ok(PostUrl('users/posts/ich-und-du.md').relativeUrl().match(/^\S*\/posts\/ich-und-du\/$/));
    assert.ok(PostUrl('/users/posts/ich-und-du.md').relativeUrl().match(/^\S*\/posts\/ich-und-du\/$/));
    assert.ok(PostUrl('\\users\\posts\\ich-und-du.md').relativeUrl().match(/^\S*\/posts\/ich-und-du\/$/));
    assert.ok(PostUrl('/users/posts/ich-und-du/index.md').relativeUrl().match(/^\S*\/posts\/ich-und-du\/$/));
    assert.ok(PostUrl('\\users\\posts\\ich-und-du\\index.md').relativeUrl().match(/^\S*\/posts\/ich-und-du\/$/));
  });

  it('should test EmptyTransformation', function() {
    assert.strictEqual(PostUrl(null).relativeUrl(), null);
    assert.strictEqual(PostUrl(null).absoluteUrl(), null);
    assert.strictEqual(PostUrl(null).filename(), null);

    assert.strictEqual(IndexUrl(null).relativeUrl(), null);
    assert.strictEqual(IndexUrl(null).absoluteUrl(), null);
    assert.strictEqual(IndexUrl(null).filename(), null);

    assert.strictEqual(TagUrl(null).relativeUrl(), null);
    assert.strictEqual(TagUrl(null).absoluteUrl(), null);
    assert.strictEqual(TagUrl(null).filename(), null);
  });
});
