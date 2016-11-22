'use strict';

var markdownConvert = require('marked');
var crypto          = require('crypto');
var SuperString     = require('../helpers/super-string');
var markyMark       = require('../helpers/marky-mark');
var ampify          = require('../helpers/ampify')();
var postUrl         = require('../helpers/post-url');
var tagUrl          = require('../helpers/tag-url');
var authorUrl       = require('../helpers/author-url');
var shareLinks      = require('../helpers/share-links');
var blogophonDate   = require('../models/blogophon-date');
var imageStyles     = require('../helpers/image-styles');

/**
 * This class holds Markdown and converts it into a proper post.
 * @constructor
 */
var Post = function (filename, markdown, meta, config) {
  config = config || require('../config');
  var external = {};
  var internal = {};

  /**
   * Convert input data into final object
   * @param  {String} filename [description]
   * @param  {String} markdown [description]
   * @param  {Object} meta     [description]
   * @return {Post}            [description]
   */
  external.makeMeta = function (filename, markdown, meta) {
    if (!filename) {
      throw new Error('filename is empty');
    }
    if (!meta) {
      throw new Error('meta is empty in post '+filename);
    }
    if (!markdown) {
      throw new Error('markdown is empty in post '+filename);
    }
    if (!meta.Date) {
      throw new Error('meta.Date not supplied in post '+filename);
    }
    if (!meta.Description) {
      meta.Description = markdown;
    }
    if (!meta.DateModified) {
      meta.DateModified = meta.Date;
    }
    if (!meta.Language) {
      meta.Language = config.language;
    }
    if (!meta.Id) {
      meta.Id = filename.replace(new RegExp('^' + process.cwd() + '/'), '');
    }

    meta.Created     = blogophonDate(meta.Date, meta.Language);
    meta.Modified    = blogophonDate(meta.DateModified, meta.Language);
    if (meta.Created.timestamp > meta.Modified.timestamp) {
      meta.Modified  = meta.Created;
    }

    var path = config.htdocs.posts;
    if (config.postPathMode){
      switch (config.postPathMode) {
        case 'Year':
          path = meta.Created.year;
          break;
        case 'Year/Month':
          path = meta.Created.year + '/' + meta.Created.month;
          break;
        case 'Year/Month/Day':
          path = meta.Created.year + '/' + meta.Created.month + '/' + meta.Created.day;
          break;
      }
    }

    meta.urlObj = postUrl(filename, path);
    if (meta.urlObj) {
      meta.Url = meta.urlObj.relativeUrl();
      meta.AbsoluteUrl = meta.urlObj.absoluteUrl();
      meta.Filename = meta.urlObj.filename();
      if (config.specialFeatures.acceleratedmobilepages) {
        meta.AbsoluteUrlAmp = meta.urlObj.absoluteUrl('amp');
      }
    }

    external.htmlTeaser   = internal.markyMark(meta.Description.trim(), meta.Url);
    external.html         = internal.markyMark(markdown, meta.Url);

    if (!meta.Title) {
      meta.Title = markdown.split(/\n/)[0];
    }
    if (meta.Keywords) {
      meta.Tags = meta.Keywords.trim().split(/,\s*/).map(function(tag){
        var tagUrlObj = tagUrl(tag, config.htdocs.tag);
        return {
          title: tag,
          id: SuperString(tag).asciify(),
          url: tagUrlObj.relativeUrl(),
          urlObj: tagUrlObj
        };
      });
    }
    if (!meta.Classes) {
      meta.Classes = 'Normal article';
    }
    meta.Classes = meta.Classes.trim().split(/,\s*/).map(function(c) {
      return SuperString(c).asciify();
    });
    if (meta.Classes.indexOf('images') >= 0) {
      external.htmlTeaser   = internal.galleryHtml(external.htmlTeaser);
      external.html         = internal.galleryHtml(external.html);
    }
    if (meta.Description) {
      meta.MarkdownDescription = meta.Description;
      meta.Description = meta.Description
        .replace(/>/g,' ')
        .replace(/!?\[([^\]]*)\]\(.+?\)/g, '$1')
        .replace(/\s\s+/g, ' ')
        .replace(/http(s)?:\S+/g, '')
      ;
      meta.Description = SuperString(meta.Description).niceShorten(320);
    }
    if (!meta.Author) {
      meta.Author = config.defaultAuthor.name + ' <' + config.defaultAuthor.email + '>';
    }
    var metaAuthor = meta.Author.match(/^(.+?)(?:\s<(.+)>)?$/);
    if (metaAuthor) {
      meta.AuthorName   = metaAuthor[1];
      meta.AuthorEmail  = metaAuthor[2] ? metaAuthor[2].trim() : config.defaultAuthor.email;
      meta.AuthorImage  = 'https://www.gravatar.com/avatar/' + crypto.createHash('md5').update(meta.AuthorEmail.toLowerCase()).digest('hex');
    }
    meta.authorUrlObj = authorUrl(meta.AuthorName, config.htdocs.author);
    if (!meta.Image) {
      var match = external.html.match(/<img.+?src="(.+?)"/);
      if (match) {
        meta.Image = match[1];
      }
    }
    if (!meta.Image && config.themeConf.ogImage) {
      meta.Image = config.themeConf.ogImage;
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

    external.filename       = filename;
    external.markdown       = markdown;
    external.meta           = meta;
    external.share          = shareLinks( meta.Title, meta.AbsoluteUrl, meta.Twitter, config.name);
    external.hash           = crypto.createHash('md5').update(JSON.stringify([
      external.markdown,
      external.share,
      external.meta,
      external.html,
      external.htmlTeaser
    ])).digest('hex');

    // Add extra stuff
    if (config.specialFeatures.jsonrss || config.specialFeatures.atom || config.specialFeatures.rss) {
      external.safeHtml       = internal.makeSafeHtml(external.html);
      external.safeHtmlTeaser = internal.makeSafeHtml(external.htmlTeaser);
    }
    if (config.specialFeatures.acceleratedmobilepages) {
      external.ampHtml        = ampify.ampifyHtml(external.html);
      external.ampHtmlTeaser  = ampify.ampifyHtml(external.htmlTeaser);
    }

    return external;
  };

  /**
   * [markyMark description]
   * @param  {String} html   [description]
   * @param  {String} relUrl [description]
   * @return {String}        [description]
   */
  internal.markyMark = function(html, relUrl) {
    if (relUrl) {
      html = html.replace(/(!\[.*?\]\()/g, '$1'+relUrl);
    }
    html = markyMark(markdownConvert(html)).toString();
    html = imageStyles(config).replaceImgHtml(html);
    return html
      .replace(/<p>===<\/p>(\s*<[^>]+)(>)/g,'<!-- more -->$1 id="more"$2')
      .replace(/(<\/?h)3/g,'$14')
      .replace(/(<\/?h)2/g,'$13')
      .replace(/(<\/?h)1/g,'$12')
      .replace(/(<h2.+?<\/h2>)/,'') // Remove title, will be put into meta.Title
      .replace(
        /<p>\s*(?:<a)?[^>]*?youtube.+v=([a-zA-Z0-9\-_]+)[^>]*?(?:>(.+?)<\/a>)?\s*<\/p>/g,
        '<div class="video-player youtube"><iframe allowfullscreen="true" src="https://www.youtube-nocookie.com/embed/$1?enablejsapi=1"><a href="https://www.youtube.com/watch?v=$1"><img src="https://img.youtube.com/vi/$1/hqdefault.jpg" alt="$2" /></a></iframe></div>'
      )
      .replace(
        /<p>\s*(?:<a)?[^>]*?vimeo.com\/(\d+)[^>]*?(?:>(.+?)<\/a>)?\s*<\/p>/g,
        '<div class="video-player vimeo"><iframe allowfullscreen="true" src="https://player.vimeo.com/video/$1"><a href="https://vimeo.com/$1">$2</a></iframe></div>'
      )
      .replace(
        /<p>\s*(?:<a)?[^>]*?giphy.com\/gifs\/[^"]+\-([a-zA-Z0-9]+)[^>]*?(?:>(.+?)<\/a>)?\s*<\/p>/g,
        '<img src="https://i.giphy.com/$1.gif" alt="" />'
      )
      .replace(/(<img[^>]+src="[^"]+\-(\d+)x(\d+)\.[^"]+")/g,'$1 width="$2" height="$3"')
      .replace(/(href=")([a-zA-Z0-9\-]+)\.md(")/g, '$1' + config.basePath + config.htdocs.posts + '/$2/$3')
      .replace(/(>)\[ \](\s)/g,'$1<span class="checkbox"></span>$2')
      .replace(/(>)\[[xX]\](\s)/g,'$1<span class="checkbox checkbox--checked"></span>$2')
      .replace(/(<(?:img)[^>]*[^/])(>)/g,'$1 /$2')
      .replace(/(<(?:hr|br)[^/])(>)/g,'$1 /$2')
      .replace(/(<table>)([\s\S]+?)(\/table)/g, function(all, before,content,after) {
        return before + content.replace(/(<tr>[\s]*)<td><strong>(.+?)<\/strong><\/td>/g,'$1<th scope="row">$2</th>') + after;
      })
      .trim()
    ;
  };

  /**
   * [galleryHtml description]
   * @param  {String} html [description]
   * @return {String}      [description]
   */
  internal.galleryHtml = function(html) {
    return html
      .replace(/(<img[^>]+src="([^"]+)(?:\-\d+x\d+)(\.(?:jpg|png|gif))"[^>]*>)/g,'<a href="$2$3" class="image">$1</a>')
    ;
  };

  /**
   * Remove HTML parts which may be considered unsafe for syndication.
   * @param  {String} html [description]
   * @return {String}      [description]
   */
  internal.makeSafeHtml = function(html) {
    return html
      .replace(/(<\/?)iframe[^>]*>/g,'')
      .replace(/((?:src|href)=")(\/)/g,'$1' + config.baseUrl +'$2')
    ;
  };

  /**
   * [toString description]
   * @return {String} [description]
   */
  external.toString = function() {
    return external.hash;
  };

  /**
   * [toJSON description]
   * @return {Object} [description]
   */
  external.toJSON = function() {
    var json = external;
    if (json.next && json.next.Id) {
      json.next = json.next.urlObj.relativeUrl('index','json');
    }
    if (json.prev && json.prev.Id) {
      json.prev = json.prev.urlObj.relativeUrl('index','json');
    }
    return json;
  };

  /**
   * Get all images using image styles. This list may come in handy for the image resizer.
   * @return {Array} of {filename, style}
   */
  external.getAllImagesWithStyle = function () {
    var singleImage;
    var allMarkdown = external.meta.MarkdownDescription + "\n" + markdown;
    var all = allMarkdown.match(/!\[.*?\]\(([^\s\/]+?)(?:#(\S+))?\)/g) || [];
    return all.map(function(i) {
      singleImage = i.match(/!\[.*?\]\(([^\s\/]+?)(?:#(\S+))?\)/);
      return {
        filename: singleImage[1] || null,
        style: singleImage[2] || null
      };
    });
  };

  external.getAllImagesWithStyleObject = function () {
    var styles = external.getAllImagesWithStyle();
    var returnObject = {};
    styles.forEach(function(s) {
      if (s.style) {
        if (!returnObject[s.filename]) {
          returnObject[s.filename] = [];
        }
        if (returnObject[s.filename].indexOf(s.style) === -1) {
          returnObject[s.filename].push(s.style);
        }
      }
    });
    return returnObject;
  };

  return external.makeMeta(filename, markdown, meta);
};

module.exports = Post;
