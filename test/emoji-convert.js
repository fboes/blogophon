import assert from 'assert';
import emojiConvert from '../lib/helpers/emoji-convert.js';

describe('Generator', function() {
  let convertedHtml;

  it('must not convert basic HTML', function() {
    convertedHtml = emojiConvert('I am HTML');
    assert.strictEqual(convertedHtml, 'I am HTML');

    convertedHtml = emojiConvert('<strong>I am HTML</strong>');
    assert.strictEqual(convertedHtml, '<strong>I am HTML</strong>');
  });
  it('must convert simple smilies', function() {
    convertedHtml = emojiConvert('<strong>I am :)</strong>', true);
    assert.doesNotMatch(convertedHtml, /&#[a-zA-Z0-9]+;/);
    assert.notStrictEqual(convertedHtml, '<strong>I am :)</strong>');

    convertedHtml = emojiConvert('8<', true);
    assert.doesNotMatch(convertedHtml, /&#[a-zA-Z0-9]+;/);
    assert.notStrictEqual(convertedHtml, '8<');

    convertedHtml = emojiConvert('8&lt;');
    assert.match(convertedHtml, /&#[a-zA-Z0-9]+;/);
    assert.notStrictEqual(convertedHtml, '8&lt;');
    //console.log(convertedHtml);
  });

  it('must add an extra <span>', function() {
    convertedHtml = emojiConvert('<strong>I am :)</strong>');
    assert.match(convertedHtml, /<span class="emoji emoji--[\da-z]+"/, 'Extra HTML for Emojis present');
    assert.match(convertedHtml, /&#[a-zA-Z0-9]+;/);
    assert.strictEqual(convertedHtml, '<strong>I am <span class="emoji emoji--1f60a" title=":)">&#x1F60A;</span></strong>');

    convertedHtml = emojiConvert('<strong>I am :/</strong>');
    assert.match(convertedHtml, /<span class="emoji emoji--[\da-z]+"/, 'Extra HTML for Emojis present');
    assert.match(convertedHtml, /&#[a-zA-Z0-9]+;/);
    assert.strictEqual(convertedHtml, '<strong>I am <span class="emoji emoji--1f612" title=":/">&#x1F612;</span></strong>');

    convertedHtml = emojiConvert('<strong>I am xO</strong>');
    assert.match(convertedHtml, /<span class="emoji emoji--[\da-z]+"/, 'Extra HTML for Emojis present');
    assert.match(convertedHtml, /&#[a-zA-Z0-9]+;/);
    assert.strictEqual(convertedHtml, '<strong>I am <span class="emoji emoji--1f635" title="xO">&#x1F635;</span></strong>');
  });

  it('must also work with smilies with noses', function() {
    convertedHtml = emojiConvert('<strong>I am :-)</strong>');
    assert.match(convertedHtml, /<span class="emoji emoji--[\da-z]+"/, 'Extra HTML for Emojis present');
    assert.strictEqual(convertedHtml.match(/&#[a-zA-Z0-9]+;/g).length, 1);
    assert.strictEqual(convertedHtml, '<strong>I am <span class="emoji emoji--1f60a" title=":-)">&#x1F60A;</span></strong>');

    convertedHtml = emojiConvert('<strong>I am x-O</strong>');
    assert.match(convertedHtml, /<span class="emoji emoji--[\da-z]+"/, 'Extra HTML for Emojis present');
    assert.strictEqual(convertedHtml.match(/&#[a-zA-Z0-9]+;/g).length, 1);
    assert.strictEqual(convertedHtml, '<strong>I am <span class="emoji emoji--1f635" title="x-O">&#x1F635;</span></strong>');

    //console.log(convertedHtml);
  });

  it('must answer to `yes` and `no`', function() {
    convertedHtml = emojiConvert('This is :yes: or :no:, ist it?');
    assert.match(convertedHtml, /<span class="emoji emoji--[\da-z]+"/, 'Extra HTML for Emojis present');
    assert.strictEqual(convertedHtml.match(/&#[a-zA-Z0-9]+;/g).length, 2);
  });
});
