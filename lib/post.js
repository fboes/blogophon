'use strict';

var fs              = require('fs');
var markdownConvert = require('marked');
var config          = require('./config');
var dateFormat      = require('dateformat');
var toolshed        = require('./js-toolshed/src/js-toolshed');

var markyMark = function (html, relUrl) {
  if (relUrl) {
    html = html.replace(/(!\[.+?\]\()/g, '$1'+relUrl);
  }
  html = html
    .replace(/\s--\s/g, ' — ')
    .replace(/\.\.\./g, '…')
    .replace(/… …/g, '… ')
    .replace(/\(C\)/g, '©')
    .replace(/\(R\)/g, '®')
    .replace(/\(TM\)/g, '™')
    .replace(/\(+-\)/g, '±')
    .replace(/\(1\/4\)/g, '¼')
    .replace(/\(1\/2\)/g, '½')
    .replace(/\(3\/4\)/g, '¾')
    .replace(/->/g, '→')
    .replace(/=>/g, '⇒')
    .replace(/<-/g, '←')
    .replace(/<=/g, '⇐')
    .replace(/(\d)\s*-\s*(\d)/g,'$1–$2')
    .replace(/(\s)-(\s)/g,'$1–$2')
    .replace(/(\d\s*)(x|\*)(\s*\d)/g,'$1×$3')
    .replace(/"(\S.*?\S)"/g,'„$1“')
    .replace(/'(\S.*?\S)'/g,'‚$1‘')
  ;
  return markdownConvert(html)
    .replace(/<p>===<\/p>/g,'<!-- more -->')
    .replace(/(<\/?h)3/g,'$14')
    .replace(/(<\/?h)2/g,'$13')
    .replace(/(<\/?h)1/g,'$12')
    .replace(
      /(<p>)\s*(?:<a.+>)?[^<]*?youtube.+v=([a-zA-Z0-9\-_]+)[^>]*?(?:<\/a>)?\s*(<\/p>)/g,
      '<div class="video-player youtube"><iframe allowfullscreen="true" src="https://www.youtube.com/embed/$2?enablejsapi=1"></iframe></div>'
    )
    .replace(
      /(<p>)\s*(?:<a.+>)?[^<]*?vimeo.com\/(\d+)[^>]*?(?:<\/a>)?\s*(<\/p>)/g,
      '<div class="video-player vimeo"><iframe allowfullscreen="true" src="https://player.vimeo.com/video/$2"></iframe></div>'
    )
  ;
};

/**
 * Represents a single post
 * @constructor
 */
var Post = function (markdown, meta) {
  var htmlTeaser = markyMark(meta.Description.trim() || '', meta.Url);
  if (meta.Keywords !== undefined) {
    meta.Tags = [];
    meta.Keywords.trim().split(/,\s+/).forEach(function(tag){
      meta.Tags.push({
        title: tag,
        id: String(tag).toId()
      });
    });
  }
  if (meta.Description !== undefined) {
    meta.Description = meta.Description.replace(/\[(.+?)\]\(.+?\)/g, '$1').trim();
  }
  if (meta.Language === undefined) {
    meta.Language = config.language;
  }
  if (meta.Date !== undefined) {
    meta.localeDate = dateFormat(meta.Date,'dd.mm.yyyy');
    meta.isoDate    = dateFormat(meta.Date,'isoDateTime');
    meta.rfcDate    = dateFormat(meta.Date,'ddd, dd mmm yyyy hh:MM:ss o'); // Wed, 02 Oct 2002 15:00:00 +0200
    meta.timestamp  = Math.round(new Date(meta.Date).getTime() / 1000);
  }
  return {
    markdown: markdown,
    meta: meta,
    html: markyMark(markdown, meta.Url),
    htmlTeaser: htmlTeaser
  };
};

module.exports = Post;
