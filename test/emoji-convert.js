'use strict';

const emojiConvert = require('../lib/helpers/emoji-convert');

/**
 * Test basic functionality of converter to leave normal HTML alone
 * @param  {[type]} test [description]
 * @return {[type]}      [description]
 */
exports.testBasic = function(test) {
  test.expect(4);

  let convertedHtml = emojiConvert('I am HTML');
  test.equal(convertedHtml, 'I am HTML');

  convertedHtml = emojiConvert('<strong>I am HTML</strong>');
  test.equal(convertedHtml, '<strong>I am HTML</strong>');

  convertedHtml = emojiConvert('<strong>I am :)</strong>', true);
  test.ok(!convertedHtml.match(/&#[a-zA-Z0-9]+;/));
  test.notEqual(convertedHtml, '<strong>I am :)</strong>');
  //console.log(convertedHtml);

  test.done();
};

/**
 * Test for special HTML conversion
 * @param  {[type]} test [description]
 * @return {[type]}      [description]
 */
exports.testHtmlEntities = function(test) {
  test.expect(3 + 3 + 3);

  let convertedHtml = emojiConvert('<strong>I am :)</strong>');
  test.ok(convertedHtml.match(/<span class="emoji emoji--[\da-z]+"/), 'Extra HTML for Emojis present');
  test.ok(convertedHtml.match(/&#[a-zA-Z0-9]+;/));
  test.equal(convertedHtml, '<strong>I am <span class="emoji emoji--1f60a" title=":)">&#x1F60A;</span></strong>');

  convertedHtml = emojiConvert('<strong>I am :/</strong>');
  test.ok(convertedHtml.match(/<span class="emoji emoji--[\da-z]+"/), 'Extra HTML for Emojis present');
  test.ok(convertedHtml.match(/&#[a-zA-Z0-9]+;/));
  test.equal(convertedHtml, '<strong>I am <span class="emoji emoji--1f612" title=":/">&#x1F612;</span></strong>');

  convertedHtml = emojiConvert('<strong>I am xO</strong>');
  test.ok(convertedHtml.match(/<span class="emoji emoji--[\da-z]+"/), 'Extra HTML for Emojis present');
  test.ok(convertedHtml.match(/&#[a-zA-Z0-9]+;/));
  test.equal(convertedHtml, '<strong>I am <span class="emoji emoji--1f635" title="xO">&#x1F635;</span></strong>');

  test.done();
};
