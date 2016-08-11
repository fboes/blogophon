'use strict';

var fs              = require('fs');
var markdownConvert = require('marked');
var config          = require('./config');
var dateFormat      = require('dateformat');
var toolshed        = require('./js-toolshed/src/js-toolshed');
var hash            = require('object-hash');

var markyMark = function (html, relUrl) {
  if (relUrl) {
    html = html.replace(/(!\[.+?\]\()/g, '$1'+relUrl);
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
  html = html.replace(/(\.\.\.|… …|\(C\)|\(R\)|\(TM\)|\(+-\)|\(1\/4\)|\(1\/2\)|\(3\/4\)|->|=>|<-|<=)/g, function (s) {
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
    .replace(/<p>===<\/p>/g,'<!-- more -->')
    .replace(/(<\/?h)3/g,'$14')
    .replace(/(<\/?h)2/g,'$13')
    .replace(/(<\/?h)1/g,'$12')
    .replace(/(<h2.+?<\/h2>)/,'') // Remove title, will be put into meta.Title
    .replace(/(<img)/,'$1 itemprop="image"')
    // <img src="images/articles-1280/article.jpg" srcset="images/articles-640/article.jpg 640w, images/articles-1280/article.jpg 1280w" sizes="100vw" alt="" />
    .replace(/(href=")([a-zA-Z0-]+)\.md(")/g, '$1' + config.basePath + 'posts/$2/$3')
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
  if (!meta) {
    throw new Error('meta is empty in post');
  }
  if (!markdown) {
    throw new Error('markdown is empty in post');
  }
  if (meta.Url === undefined) {
    throw new Error('meta.Url not supplied in post');
  }
  if (meta.Description === undefined) {
    throw new Error('meta.Description not supplied in post');
  }
  if (meta.Date === undefined) {
    throw new Error('meta.Date not supplied in post');
  }

  var htmlTeaser = markyMark(meta.Description.trim(), meta.Url);
  var html       = markyMark(markdown, meta.Url);

  if (meta.Title === undefined) {
    meta.Title = markdown.split(/\n/)[0];
  }
  if (meta.Keywords !== undefined) {
    meta.Tags = meta.Keywords.trim().split(/,\s+/).map(function(tag){
      return {
        title: tag,
        id: String(tag).asciify()
      };
    });
  }
  if (meta.Classes === undefined) {
    meta.Classes = '';
  }
  meta.Classes = meta.Classes.trim().split(/,\s+/).map(function(c) {
    return c.asciify();
  });
  if (meta.Description !== undefined) {
    meta.Description = meta.Description.replace(/\n|>/g,' ').replace(/!?\[(.+?)\]\(.+?\)/g, '$1').niceShorten(160);
  }
  if (meta.Language === undefined) {
    meta.Language = config.language;
  }
  if (meta.Author === undefined) {
    meta.Author = config.defaultAuthor.name + ' <' + config.defaultAuthor.email + '>';
  }
  var metaAuthor = meta.Author.match(/^(.+?)(?:\s<(.+)>)?$/);
  if (metaAuthor) {
    meta.AuthorName  = metaAuthor[1];
    meta.AuthorEmail = metaAuthor[2] ? metaAuthor[2] : config.defaultAuthor.email;
  }
  if (meta.Image === undefined) {
    var match = htmlTeaser.match(/<img.+?src="(.+?)"/);
    if (match) {
      meta.Image = match[1];
    }
  }

  meta.localeDate  = dateFormat(meta.Date,'dd.mm.yyyy');
  meta.isoDate     = dateFormat(meta.Date,'isoDateTime').replace(/(\d{2})(\d{2})$/,'$1:$2');
  meta.rfcDate     = dateFormat(meta.Date,'ddd, dd mmm yyyy hh:MM:ss o'); // Wed, 02 Oct 2002 15:00:00 +0200
  meta.timestamp   = Math.round(new Date(meta.Date).getTime() / 1000);
  meta.AbsoluteUrl = config.baseUrl + meta.Url;

  var share = {
    twitter: "https://twitter.com/intent/tweet?original_referer="+encodeURIComponent(meta.AbsoluteUrl)+"&source=tweetbutton&text="+encodeURIComponent(meta.Title)+"&url="+encodeURIComponent(meta.AbsoluteUrl),
    facebook: "http://www.facebook.com/sharer.php?u="+encodeURIComponent(meta.AbsoluteUrl),
    gplus: "https://plus.google.com/share?url="+encodeURIComponent(meta.AbsoluteUrl),
    mail: "mailto:?subject="+encodeURIComponent('Email von ' + config.name)+"&body="+encodeURIComponent(meta.title+"\n\n"+meta.AbsoluteUrl)+"."
  };

  return {
    markdown: markdown,
    share: share,
    meta: meta,
    html: html,
    htmlTeaser: htmlTeaser,
    toString: function() {
      return hash([markdown,share,meta,html,htmlTeaser]);
    }
  };
};

module.exports = Post;
