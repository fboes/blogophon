'use strict';

var config          = require('../config');
var markdownConvert = require('marked');
var crypto          = require('crypto');
var blogophonUrls   = require('../blogophon-urls');
var toolshed        = require('../helpers/js-toolshed');
var blogophonDate   = require('../models/blogophon-date');

/**
 * This class holds Markdown and converts it into a proper post.
 * @constructor
 */
var Post = function (filename, markdown, meta) {
  var internal = {
    /**
     * [markyMark description]
     * @param  {[type]} html   [description]
     * @param  {[type]} relUrl [description]
     * @return {[type]}        [description]
     */
    markyMark: function (html, relUrl) {
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
        .replace(/<p>===<\/p>(\s*<[^>]+)(>)/g,'<!-- more -->$1 id="more"$2')
        .replace(/(<\/?h)3/g,'$14')
        .replace(/(<\/?h)2/g,'$13')
        .replace(/(<\/?h)1/g,'$12')
        .replace(/(<h2.+?<\/h2>)/,'') // Remove title, will be put into meta.Title
        .replace(
          /<p>\s*(?:<a)?[^>]*?youtube.+v=([a-zA-Z0-9\-_]+)[^>]*?(?:>(.+?)<\/a>)?\s*<\/p>/g,
          '<div class="video-player youtube"><iframe allowfullscreen="true" src="https://www.youtube.com/embed/$1?enablejsapi=1"><img src="http://img.youtube.com/vi/$1/hqdefault.jpg" alt="$2" /></iframe></div>'
        )
        .replace(
          /<p>\s*(?:<a)?[^>]*?vimeo.com\/(\d+)[^>]*?(?:>(.+?)<\/a>)?\s*<\/p>/g,
          '<div class="video-player vimeo"><iframe allowfullscreen="true" src="https://player.vimeo.com/video/$1">$2</iframe></div>'
        )
        .replace(/(<img)/,'$1 itemprop="image"')
        .replace(/(<img[^>]+src="[^"]+\-(\d+)x(\d+)\.[^"]+")/g,'$1 height="$2" width="$3"')
        // <img src="images/articles-1280/article.jpg" srcset="images/articles-640/article.jpg 640w, images/articles-1280/article.jpg 1280w" sizes="100vw" alt="" />
        .replace(/(href=")([a-zA-Z0-9\-]+)\.md(")/g, '$1' + config.basePath + 'posts/$2/$3')
        .replace(/(>)\[ \](\s)/g,'$1<span class="checkbox"></span>$2')
        .replace(/(>)\[[xX]\](\s)/g,'$1<span class="checkbox checkbox--checked"></span>$2')
        .trim()
      ;
      //       '<div class="video-player youtube"><a href="https://www.youtube.com/embed/$2?enablejsapi=1"><img class="preview" src="http://img.youtube.com/vi/$2/sddefault.jpg" alt="" /></a><!--iframe allowfullscreen="true" src="https://www.youtube.com/embed/$2?enablejsapi=1"></iframe--></div>'
    },
    /**
     * [galleryHtml description]
     * @param  {[type]} html [description]
     * @return {[type]}      [description]
     */
    galleryHtml: function(html) {
      return html
        .replace(/(<img[^>]+src="([^"]+)(?:\-\d+x\d+)(\.(?:jpg|png|gif))"[^>]*>)/g,'<a href="$2$3" class="image">$1</a>')
      ;
    },
    /**
     * [makeSafeHtml description]
     * @param  {[type]} html [description]
     * @return {[type]}      [description]
     */
    makeSafeHtml: function(html) {
      return html
        .replace(/\s(itemprop|itemscope|allowfullscreen)(="[^"]*?")?/g,'')
        .replace(/(<\/?)iframe/g,'$1a')
      ;
    },
    /**
     * [ampifyHtml description]
     * @param  {[type]} html [description]
     * @return {[type]}      [description]
     */
    ampifyHtml: function(html) {
      return html
        .replace(/(<\/?)(img|video|audio|iframe)/g, '$1amp-$2')
      ;
    }
  };

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

  meta.Url         = blogophonUrls.getUrlOfPost(filename);
  meta.AbsoluteUrl = blogophonUrls.getAbsoluteUrlOfPost(filename);
  meta.Filename    = blogophonUrls.getFileOfPost(filename);

  meta.Created     = blogophonDate(meta.Date, meta.Language);
  meta.Modified    = blogophonDate(meta.DateModified, meta.Language);

  var htmlTeaser   = internal.markyMark(meta.Description.trim(), meta.Url);
  var html         = internal.markyMark(markdown, meta.Url);

  if (!meta.Title) {
    meta.Title = markdown.split(/\n/)[0];
  }
  if (meta.Keywords !== undefined) {
    meta.Tags = meta.Keywords.trim().split(/,\s+/).map(function(tag){
      return {
        title: tag,
        id: String(tag).asciify(),
        url: blogophonUrls.getUrlOfTagged(tag),
      };
    });
  }
  if (!meta.Classes) {
    meta.Classes = 'Normal article';
  }
  meta.Classes = meta.Classes.trim().split(/,\s+/).map(function(c) {
    return c.asciify();
  });
  if (meta.Classes.indexOf('images') >= 0) {
    htmlTeaser   = internal.galleryHtml(htmlTeaser);
    html         = internal.galleryHtml(html);
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
    meta.AuthorName  = metaAuthor[1];
    meta.AuthorEmail = metaAuthor[2] ? metaAuthor[2].trim() : config.defaultAuthor.email;
    meta.Gravatar    = 'https://www.gravatar.com/avatar/' + crypto.createHash('md5').update(meta.AuthorEmail.toLowerCase()).digest('hex');
  }
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

  var share = {
    twitter: "https://twitter.com/intent/tweet?original_referer="+encodeURIComponent(meta.AbsoluteUrl)+"&source=tweetbutton&text="+encodeURIComponent(meta.Twitter)+"&url="+encodeURIComponent(meta.AbsoluteUrl),
    facebook: "http://www.facebook.com/sharer.php?u="+encodeURIComponent(meta.AbsoluteUrl),
    gplus: "https://plus.google.com/share?url="+encodeURIComponent(meta.AbsoluteUrl),
    whatsapp: 'whatsapp://send?text=' +encodeURIComponent(meta.Title + ' [' + meta.AbsoluteUrl + ']'),
    mail: "mailto:?subject="+encodeURIComponent('Email von ' + config.name)+"&body="+encodeURIComponent(meta.title+"\n\n"+meta.AbsoluteUrl)+"."
  };
  var hashOfData = crypto.createHash('md5').update(JSON.stringify([markdown,share,meta,html,htmlTeaser])).digest('hex');

  return {
    markdown: markdown,
    share: share,
    meta: meta,
    html: html,
    htmlTeaser: htmlTeaser,
    safeHtml: internal.makeSafeHtml(html),
    safeHtmlTeaser: internal.makeSafeHtml(htmlTeaser),
    hash:hashOfData,
    /**
     * [ampHtml description]
     * @return {[type]} [description]
     */
    ampHtml: function() {
      return internal.ampifyHtml(html);
    },
    /**
     * [ampHtmlTeaser description]
     * @return {[type]} [description]
     */
    ampHtmlTeaser: function() {
      return internal.ampifyHtml(htmlTeaser);
    },
    /**
     * [toString description]
     * @return {[type]} [description]
     */
    toString: function() {
      return hashOfData;
    }
  };
};

module.exports = Post;
