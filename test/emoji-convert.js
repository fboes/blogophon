'use strict';

const assert = require('assert');
const emojiConvert = require('../lib/helpers/emoji-convert');

describe('Emoji Convert', function() {
  let convertedHtml;

  it('should not convert basic HTML', function() {
    convertedHtml = emojiConvert('I am HTML');
    assert.equal(convertedHtml, 'I am HTML');

    convertedHtml = emojiConvert('<strong>I am HTML</strong>');
    assert.equal(convertedHtml, '<strong>I am HTML</strong>');
  });
  it('should convert simple smilies', function() {
    convertedHtml = emojiConvert('<strong>I am :)</strong>', true);
    assert.ok(!convertedHtml.match(/&#[a-zA-Z0-9]+;/));
    assert.notEqual(convertedHtml, '<strong>I am :)</strong>');

    convertedHtml = emojiConvert('8<', true);
    assert.ok(!convertedHtml.match(/&#[a-zA-Z0-9]+;/));
    assert.notEqual(convertedHtml, '8<');

    convertedHtml = emojiConvert('8&lt;');
    assert.ok(convertedHtml.match(/&#[a-zA-Z0-9]+;/));
    assert.notEqual(convertedHtml, '8&lt;');
    //console.log(convertedHtml);
  });

  it('should add an extra <span>', function() {
    convertedHtml = emojiConvert('<strong>I am :)</strong>');
    assert.ok(convertedHtml.match(/<span class="emoji emoji--[\da-z]+"/), 'Extra HTML for Emojis present');
    assert.ok(convertedHtml.match(/&#[a-zA-Z0-9]+;/));
    assert.equal(convertedHtml, '<strong>I am <span class="emoji emoji--1f60a" title=":)">&#x1F60A;</span></strong>');

    convertedHtml = emojiConvert('<strong>I am :/</strong>');
    assert.ok(convertedHtml.match(/<span class="emoji emoji--[\da-z]+"/), 'Extra HTML for Emojis present');
    assert.ok(convertedHtml.match(/&#[a-zA-Z0-9]+;/));
    assert.equal(convertedHtml, '<strong>I am <span class="emoji emoji--1f612" title=":/">&#x1F612;</span></strong>');

    convertedHtml = emojiConvert('<strong>I am xO</strong>');
    assert.ok(convertedHtml.match(/<span class="emoji emoji--[\da-z]+"/), 'Extra HTML for Emojis present');
    assert.ok(convertedHtml.match(/&#[a-zA-Z0-9]+;/));
    assert.equal(convertedHtml, '<strong>I am <span class="emoji emoji--1f635" title="xO">&#x1F635;</span></strong>');
  });

  it('should also work with smilies with noses', function() {
    convertedHtml = emojiConvert('<strong>I am :-)</strong>');
    assert.ok(convertedHtml.match(/<span class="emoji emoji--[\da-z]+"/), 'Extra HTML for Emojis present');
    assert.ok(convertedHtml.match(/&#[a-zA-Z0-9]+;/));
    assert.equal(convertedHtml, '<strong>I am <span class="emoji emoji--1f60a" title=":-)">&#x1F60A;</span></strong>');

    convertedHtml = emojiConvert('<strong>I am x-O</strong>');
    assert.ok(convertedHtml.match(/<span class="emoji emoji--[\da-z]+"/), 'Extra HTML for Emojis present');
    assert.ok(convertedHtml.match(/&#[a-zA-Z0-9]+;/));
    assert.equal(convertedHtml, '<strong>I am <span class="emoji emoji--1f635" title="x-O">&#x1F635;</span></strong>');

    //console.log(convertedHtml);
  });
});
