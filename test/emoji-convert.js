'use strict';

const emojiConvert = require('../lib/helpers/emoji-convert');

exports.testBasic = function(test) {
  test.expect(5);

  test.equal(emojiConvert('I am HTML'), 'I am HTML');

  let convertedHtml = emojiConvert('<strong>I am HTML</strong>');
  test.equal(convertedHtml, '<strong>I am HTML</strong>');

  convertedHtml = emojiConvert('<strong>I am :)</strong>');
  test.ok(convertedHtml.match(/<span class="emoji emoji--[\d]+/), 'Extra HTML for Emojis present');
  test.equal(convertedHtml, '<strong>I am <span class="emoji emoji--1f60" title=":)">&#x1F60;</span></strong>');

  convertedHtml = emojiConvert('<strong>I am :)</strong>', true);
  test.ok(!convertedHtml.match(/&#[a-zA-Z0-9]+;/));
  //console.log(convertedHtml);

  test.done();
};
