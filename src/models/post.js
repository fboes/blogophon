'use strict';

var config          = require('../config');
var markdownConvert = require('marked');
var crypto          = require('crypto');
var PostUrl         = require('../helpers/post-url');
var TagUrl          = require('../helpers/tag-url');
var AuthorUrl       = require('../helpers/author-url');
var toolshed        = require('../helpers/js-toolshed');
var shareLinks      = require('../helpers/share-links');
var blogophonDate   = require('../models/blogophon-date');

/**
 * This class holds Markdown and converts it into a proper post.
 * @constructor
 */
var Post = function (filename, markdown, meta) {
  return this.makeMeta(filename, markdown, meta);
};

/**
 * Convert input data into final object
 * @param  {String} filename [description]
 * @param  {String} markdown [description]
 * @param  {Object} meta     [description]
 * @return {Post}            [description]
 */
Post.prototype.makeMeta = function (filename, markdown, meta) {
  if (!filename) {
    throw new Error('filename is empty');
  }
  if (!meta) {
    throw new Error('meta is empty in post');
  }
  if (!markdown) {
    throw new Error('markdown is empty in post');
  }
  if (!meta.Description) {
    throw new Error('meta.Description not supplied in post');
  }
  if (!meta.Date) {
    throw new Error('meta.Date not supplied in post');
  }
  if (!meta.DateModified) {
    meta.DateModified = meta.Date;
  }
  if (!meta.Language) {
    meta.Language = config.language;
  }

  this.urlObj = new PostUrl(filename);
  if (this.urlObj) {
    meta.Url         = this.urlObj.relativeUrl();
    meta.AbsoluteUrl = this.urlObj.absoluteUrl();
    meta.Filename    = this.urlObj.filename();
  }

  meta.Created     = blogophonDate(meta.Date, meta.Language);
  meta.Modified    = blogophonDate(meta.DateModified, meta.Language);

  var htmlTeaser   = this.markyMark(meta.Description.trim(), meta.Url);
  var html         = this.markyMark(markdown, meta.Url);

  if (!meta.Title) {
    meta.Title = markdown.split(/\n/)[0];
  }
  if (meta.Keywords !== undefined) {
    meta.Tags = meta.Keywords.trim().split(/,\s*/).map(function(tag){
      var tagUrlObj = new TagUrl(tag);
      return {
        title: tag,
        id: String(tag).asciify(),
        url: tagUrlObj.relativeUrl(),
        urlObj: tagUrlObj
      };
    });
  }
  if (!meta.Classes) {
    meta.Classes = 'Normal article';
  }
  meta.Classes = meta.Classes.trim().split(/,\s*/).map(function(c) {
    return c.asciify();
  });
  if (meta.Classes.indexOf('images') >= 0) {
    htmlTeaser   = this.galleryHtml(htmlTeaser);
    html         = this.galleryHtml(html);
  }
  if (meta.Description !== undefined) {
    meta.Description = meta.Description
      .replace(/>/g,' ')
      .replace(/!?\[([^\]]*)\]\(.+?\)/g, '$1')
      .replace(/\s\s+/g, ' ')
      .replace(/http(s)?:\S+/g, '')
      .niceShorten(160)
    ;
  }
  if (!meta.Author) {
    meta.Author = config.defaultAuthor.name + ' <' + config.defaultAuthor.email + '>';
  }
  var metaAuthor = meta.Author.match(/^(.+?)(?:\s<(.+)>)?$/);
  if (metaAuthor) {
    meta.AuthorName   = metaAuthor[1];
    meta.AuthorEmail  = metaAuthor[2] ? metaAuthor[2].trim() : config.defaultAuthor.email;
    meta.Gravatar     = 'https://www.gravatar.com/avatar/' + crypto.createHash('md5').update(meta.AuthorEmail.toLowerCase()).digest('hex');
  }
  meta.AuthorUrlObj = new AuthorUrl(meta.AuthorName);
  if (!meta.Image) {
    var match = html.match(/<img.+?src="(.+?)"/);
    if (match) {
      meta.Image = match[1];
    }
  }
  if (meta.Image && !meta.Image.match(/^http/)) {
    meta.Image = config.baseUrl + meta.Image;
  }
  if (!meta.Twitter) {
    meta.Twitter = meta.Title;
  } else {
    meta.Twitter = meta.Twitter.replace(/\\(#)/g,'$1');
  }
  if (meta.Rating) {
    var match2 = meta.Rating.match(/^(\d)\/(\d)$/);
    if (match2) {
      meta.RatingObj = {
        worst: 1,
        best: match2[2],
        value: match2[1]
      };
    }
  }

  this.markdown       = markdown;
  this.meta           = meta;
  this.html           = html;
  this.htmlTeaser     = htmlTeaser;
  this.share          = shareLinks( meta.Title, meta.AbsoluteUrl, meta.Twitter, config.name);
  this.hash           = crypto.createHash('md5').update(JSON.stringify([this.markdown,this.share,this.meta,this.html,this.htmlTeaser])).digest('hex');
  this.safeHtml       = this.makeSafeHtml(this.html);
  this.safeHtmlTeaser = this.makeSafeHtml(this.htmlTeaser);
  return this;
};

/**
 * [markyMark description]
 * @param  {String} html   [description]
 * @param  {String} relUrl [description]
 * @return {String}        [description]
 */
Post.prototype.markyMark = function(html, relUrl) {
  if (relUrl) {
    html = html.replace(/(!\[.*?\]\()/g, '$1'+relUrl);
  }
  var entityMap = {
    '...': '…',
    '… …': '…',
    '(C)': '©',
    '(R)': '®',
    '(TM)': '™',
    '(+-)': '±',
    '(1/4)': '¼',
    '(1/2)': '½',
    '(3/4)': '¾',
    '->': '→',
    //'=>': '⇒',
    '<-': '←',
    //'<=': '⇐'
  };
  html = html.replace(/(\.\.\.|… …|\(C\)|\(R\)|\(TM\)|\(+-\)|\(1\/4\)|\(1\/2\)|\(3\/4\)|->|=>|<-|<=)/g, function(s) {
    return entityMap[s];
  });
  html = html
    .replace(/\s--\s/g, ' — ')
    .replace(/(\d)\s*-\s*(\d)/g,'$1–$2')
    .replace(/(\s)-(\s)/g,'$1–$2')
    //.replace(/(\d\s*)(x|\*)(\s*\d)/g,'$1×$3')
    .replace(/([^\S])"(\S.*?\S)"([^\S])/g,'$1„$2“$3')
    .replace(/([^\S])'(\S.*?\S)'([^\S])/g,'$1‚$2‘$3')
  ;

  return markdownConvert(html)
    .replace(/<p>===<\/p>(\s*<[^>]+)(>)/g,'<!-- more -->$1 id="more"$2')
    .replace(/(<\/?h)3/g,'$14')
    .replace(/(<\/?h)2/g,'$13')
    .replace(/(<\/?h)1/g,'$12')
    .replace(/(<h2.+?<\/h2>)/,'') // Remove title, will be put into meta.Title
    .replace(
      /<p>\s*(?:<a)?[^>]*?youtube.+v=([a-zA-Z0-9\-_]+)[^>]*?(?:>(.+?)<\/a>)?\s*<\/p>/g,
      '<div class="video-player youtube"><iframe allowfullscreen="true" src="https://www.youtube.com/embed/$1?enablejsapi=1"><a href="https://www.youtube.com/watch?v=$1"><img src="http://img.youtube.com/vi/$1/hqdefault.jpg" alt="$2" /></a></iframe></div>'
    )
    .replace(
      /<p>\s*(?:<a)?[^>]*?vimeo.com\/(\d+)[^>]*?(?:>(.+?)<\/a>)?\s*<\/p>/g,
      '<div class="video-player vimeo"><iframe allowfullscreen="true" src="https://player.vimeo.com/video/$1"><a href="https://vimeo.com/$1">$2</a></iframe></div>'
    )
    .replace(
      /<p>\s*(?:<a)?[^>]*?giphy.com\/gifs\/[^"]+\-([a-zA-Z0-9]+)[^>]*?(?:>(.+?)<\/a>)?\s*<\/p>/g,
      '<img src="https://i.giphy.com/$1.gif" alt="" />'
    )
    .replace(/(<img)/,'$1 itemprop="image"')
    .replace(/(<img[^>]+src="[^"]+\-(\d+)x(\d+)\.[^"]+")/g,'$1 width="$2" height="$3"')
    // <img src="images/articles-1280/article.jpg" srcset="images/articles-640/article.jpg 640w, images/articles-1280/article.jpg 1280w" sizes="100vw" alt="" />
    .replace(/(href=")([a-zA-Z0-9\-]+)\.md(")/g, '$1' + config.basePath + 'posts/$2/$3')
    .replace(/(>)\[ \](\s)/g,'$1<span class="checkbox"></span>$2')
    .replace(/(>)\[[xX]\](\s)/g,'$1<span class="checkbox checkbox--checked"></span>$2')
    .trim()
  ;
};

/**
 * [galleryHtml description]
 * @param  {String} html [description]
 * @return {String}      [description]
 */
Post.prototype.galleryHtml = function(html) {
  return html
    .replace(/(<img[^>]+src="([^"]+)(?:\-\d+x\d+)(\.(?:jpg|png|gif))"[^>]*>)/g,'<a href="$2$3" class="image">$1</a>')
  ;
};

/**
 * [makeSafeHtml description]
 * @param  {String} html [description]
 * @return {String}      [description]
 */
Post.prototype.makeSafeHtml = function(html) {
  return html
    .replace(/\s(itemprop|itemscope|allowfullscreen)(="[^"]*?")?/g,'')
    .replace(/(<\/?)iframe/g,'$1a')
  ;
};

/**
 * [ampifyHtml description]
 * @param  {String} html [description]
 * @return {String}      [description]
 */
Post.prototype.ampifyHtml = function(html) {
  return html
    .replace(/(<\/?)(img|video|audio|iframe)/g, '$1amp-$2')
  ;
};

/**
 * [ampHtml description]
 * @return {String} [description]
 */
Post.prototype.ampHtml = function() {
  return this.ampifyHtml(this.html);
};

/**
 * [ampHtmlTeaser description]
 * @return {String} [description]
 */
Post.prototype.ampHtmlTeaser = function() {
  return this.ampifyHtml(this.htmlTeaser);
};

/**
 * [toString description]
 * @return {String} [description]
 */
Post.prototype.toString = function() {
  return this.hash;
};


module.exports = Post;
