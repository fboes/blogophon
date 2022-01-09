import { marked } from 'marked';
import crypto from 'crypto';
import fs from 'fs';
import SuperString from '../helpers/super-string.js';
import markyMark from '../helpers/marky-mark.js';
import ampify from '../helpers/Ampify.js';
import PostUrl from '../helpers/PostUrl.js';
import TagUrl from '../helpers/TagUrl.js';
import CategoryUrl from '../helpers/CategoryUrl.js';
import AuthorUrl from '../helpers/AuthorUrl.js';
import shareLinks from '../helpers/share-links.js';
import imageStyles from '../helpers/image-styles.js';
import webcomponents from '../helpers/webcomponents-from-html.js';

/**
 * This class holds Markdown and converts it into a proper post.
 * @constructor
 * @param {String} filename [description]
 * @param {String} markdown [description]
 * @param {Object} meta     [description]
 * @param {Object} config   [description]
 */
const Post = function(filename, markdown, meta, config) {
  if (!config) {
    throw new Error('Missing configuration config.json');
  }
  const external = {};
  const internal = {};

  /**
   * Convert input data into final object
   * @param  {String} filename [description]
   * @param  {String} markdown [description]
   * @param  {Object} meta     [description]
   * @return {Post}            [description]
   */
  external.makeMeta = function(filename, markdown, meta) {
    if (!filename) {
      throw new Error('filename is empty');
    }
    if (!meta) {
      throw new Error('meta is empty in post ' + filename);
    }
    if (!markdown) {
      throw new Error('markdown is empty in post ' + filename);
    }
    if (!meta.Date) {
      throw new Error('meta.Date not supplied in post ' + filename);
    }
    if (!meta.Description) {
      meta.Description = markdown;
    }
    if (!meta.DateModified) {
      meta.DateModified = meta.Date;
    }
    if (!meta.Language) {
      meta.Language = config.locale.language;
    }
    meta.LanguagePosix = meta.Language.replace('-', '_');
    meta.isMicropost = (meta.Classes && /Micro post/.test(meta.Classes)) || false;

    if (!meta.Direction) {
      if (meta.Language === config.locale.Language) {
        meta.Direction = config.locale.direction;
      } else {
        meta.Direction = (meta.Language.match(/^(ar|zh|fa|he)/) ? 'rtl' : 'ltr');
      }
    }
    if (!meta.Schema) {
      meta.Schema = 'http://schema.org/BlogPosting';
    }

    meta.isDefaultLanguage = (meta.Language === config.locale.language && meta.Direction === config.locale.direction);

    if (!meta.Id) {
      meta.Id = filename.replace(new RegExp('^' + process.cwd() + '/'), '');
    }

    meta.Created     = new Date(meta.Date);
    meta.Modified    = new Date(meta.DateModified);
    if (meta.Created.getTime() > meta.Modified.getTime()) {
      meta.Modified  = meta.Created;
    }
    if (meta.Category) {
      const categoryUrlObj = new CategoryUrl(meta.Category, config.htdocs.category);
      meta.CategoryObj = {
        title: meta.Category,
        id: SuperString(meta.Category).asciify(),
        url: categoryUrlObj.relativeUrl(),
        urlObj: categoryUrlObj
      };
    }

    let path = config.htdocs.posts;
    if (config.postPathMode){
      switch (config.postPathMode) {
        case 'Year':
          path = meta.Created.getFullYear();
          break;
        case 'Year/Month':
          path = meta.Created.getFullYear() + '/' + String(meta.Created.getMonth() + 1).padStart(2, 0);
          break;
        case 'Year/Month/Day':
          path = meta.Created.getFullYear() + '/' + String(meta.Created.getMonth() + 1).padStart(2, 0) + '/' + String(meta.Created.getDate()).padStart(2, 0);
          break;
        case 'Category':
          if (meta.CategoryObj) {
            path = meta.CategoryObj.urlObj.relativeDirname();
          }
          break;
      }
    }

    meta.urlObj = new PostUrl(filename, path);
    if (meta.urlObj) {
      meta.Url = meta.urlObj.relativeUrl();
      meta.AbsoluteUrl = meta.urlObj.absoluteUrl();
      meta.Filename = meta.urlObj.filename();
      if (config.specialFeatures.acceleratedmobilepages) {
        meta.AbsoluteUrlAmp = meta.urlObj.absoluteUrl('amp');
      }
      if (config.specialFeatures.gopher) {
        meta.markdownUrl = meta.urlObj.relativeUrl('article', 'md');
      }
    }
    meta.hasExternalLink = (meta.Link && meta.Link !== meta.Url);
    meta.AbsoluteLink = meta.Link || meta.AbsoluteUrl;
    meta.Link = meta.Link || meta.Url;

    external.htmlTeaser   = internal.markyMark(meta.Description.trim(), meta.Url);
    external.html         = internal.markyMark(markdown, meta.Url);

    if (!meta.Title) {
      meta.Title = markdown.split(/\n/)[0];
    }
    meta.MarkdownTitle = meta.Title;
    external.htmlTitle = internal.markyMark(meta.Title, meta.Url).replace(/<\/?p>/g, '');
    meta.Title = SuperString(internal.stripHtmlTags(external.htmlTitle)).niceShorten(320);

    const wordCount = external.html.replace(/<.+?>/g, '').match(/\s+/g);
    meta.Wordcount  = wordCount ? wordCount.length : 0;

    if (meta.Keywords || meta.Tags) {
      meta.Keywords = (meta.Tags && !meta.Keywords)
        ? internal.listToArray(meta.Tags)
        : internal.listToArray(meta.Keywords)
      ;
      meta.Tags = meta.Keywords.map(function(tag){
        let tagUrlObj = new TagUrl(tag, config.htdocs.tag);
        return {
          title: tag,
          id: SuperString(tag).asciify(),
          url: tagUrlObj.relativeUrl(),
          urlObj: tagUrlObj
        };
      });
    } else {
      meta.Keywords = [];
      meta.Tags = [];
    }
    if (!meta.Classes) {
      meta.Classes = ['Normal article'];
    }
    meta.Classes = internal.listToArray(meta.Classes);
    meta.Classes = meta.Classes.map(function(c) {
      return SuperString(c).asciify();
    });
    if (meta.Classes.indexOf('images') >= 0) {
      external.htmlTeaser   = internal.galleryHtml(external.htmlTeaser);
      external.html         = internal.galleryHtml(external.html);
    } else if (meta.Classes.indexOf('recipe') >= 0) {
      meta.Schema = 'http://schema.org/Recipe';
      external.html         = internal.recipeHtml(external.html);
    }
    if (meta.Description) {
      meta.MarkdownDescription = meta.Description;
      meta.Description = SuperString(internal.stripHtmlTags(external.htmlTeaser)).niceShorten(160);
    }

    // Author
    if (!meta.Author) {
      meta.Author        = config.defaultAuthor.name + ' <' + config.defaultAuthor.email + '>';
      meta.AuthorTwitter = config.twitterAccount;
    }
    let metaAuthor = meta.Author.match(/^(.+?)(?:\s<(.+)>)?$/);
    if (metaAuthor) {
      meta.AuthorName   = metaAuthor[1];
      meta.AuthorEmail  = metaAuthor[2] ? metaAuthor[2].trim() : config.defaultAuthor.email;
      meta.AuthorImage  = 'https://www.gravatar.com/avatar/' + crypto.createHash('md5').update(meta.AuthorEmail.toLowerCase()).digest('hex');
    }
    meta.authorUrlObj = new AuthorUrl(meta.AuthorName, config.htdocs.author);

    // Image
    if (!meta.Image) {
      let match = external.html.match(/<(?:!-- )?img.+?src="(.+?\.(?:jpg|gif|png))"/);
      if (match) {
        meta.Image = match[1];
      }
    }
    if (!meta.ImageAlt) {
      meta.ImageAlt = '';
    }
    if (meta.Image) {
      if (!meta.ImageAlt) {
        let match = external.html.match(/<(?:!-- )?img.+?alt="(.*?)"/);
        meta.ImageAlt = match ? match[1] : meta.ImageAlt;
      }
      meta.ProperImage = meta.Image; // contains an explicitly set image, ignoring fallback image (see below)
    }
    if (!meta.Image && config.themeConf.ogImage) {
      meta.Image = config.themeConf.ogImage;
    }
    if (meta.Image && !meta.Image.match(/^http/)) {
      meta.Image = config.baseUrl + meta.Image;
    }

    // Stuff
    if (!meta.Twitter) {
      meta.Twitter = meta.Title;
    } else {
      meta.Twitter = meta.Twitter.replace(/\\(#)/g, '$1');
    }
    if (meta.Rating) {
      let match2 = meta.Rating.match(/^(\d)\/(\d)$/);
      if (match2) {
        meta.RatingObj = {
          worst: 1,
          best: match2[2],
          value: match2[1]
        };
      }
    }
    if (meta.Enclosure) {
      meta.Enclosure = internal.listToArray(meta.Enclosure);
      meta.Enclosure = meta.Enclosure.map(function(f) {
        return internal.getEnclosure(f, filename);
      });
    }

    external.filename       = filename;
    external.markdown       = markdown;
    external.meta           = meta;
    external.attachmentDir  = filename.replace(/([\\/]index)?\.md$/, '');
    external.share          = shareLinks( meta.Title, meta.AbsoluteUrl, meta.Twitter, config.name);
    external.hash           = crypto.createHash('md5').update(JSON.stringify([
      external.markdown,
      external.share,
      external.meta,
      external.html,
      external.htmlTeaser
    ])).digest('hex');

    external.componentScripts = {
      html: webcomponents.getScripts(webcomponents.findComponents(external.html), config),
      htmlTeaser: webcomponents.getScripts(webcomponents.findComponents(external.htmlTeaser), config),
      safeHtml: webcomponents.getScripts(webcomponents.findComponents(external.safeHtml), config),
      safeHtmlTeaser: webcomponents.getScripts(webcomponents.findComponents(external.safeHtmlTeaser), config)
    };

    // Add extra stuff
    if (
      config.specialFeatures.jsonrss
      || config.specialFeatures.atom
      || config.specialFeatures.rss
      || config.specialFeatures.kml
    ) {
      external.safeHtml       = internal.makeSafeHtml(external.html,       meta.AbsoluteUrl);
      external.safeHtmlTeaser = internal.makeSafeHtml(external.htmlTeaser, meta.AbsoluteUrl);
    }
    if (config.specialFeatures.acceleratedmobilepages) {
      external.ampHtml        = ampify.ampifyHtml(external.html);
      external.ampHtmlTeaser  = ampify.ampifyHtml(external.htmlTeaser);
      external.componentScripts.ampHtml = webcomponents.getScripts(
        webcomponents.findComponents(external.ampHtml), config
      );
      external.componentScripts.ampHtmlTeaser = webcomponents.getScripts(
        webcomponents.findComponents(external.ampHtmlTeaser), config
      );
    }

    return external;
  };

  /**
   * Convert Markdown into some proper HTML.
   * @param  {String} markdown [description]
   * @param  {String} relUrl   [description]
   * @return {String}          [description]
   */
  internal.markyMark = function(markdown, relUrl) {
    let html = markyMark(marked(markdown), {
      language: config.locale.language,
      headline: config.themeConf.articleHeadlineLevel
    }).toString();
    if (relUrl) {
      html = html.replace(/((?:src|href)=")([^/][^"]+)/g, function(all, attribute, url) {
        return (!url.match(/^http/) && !url.match(/\.md$/)) ? attribute + relUrl + url : all;
      });
    }
    return imageStyles(config)
      .replaceImgHtml(html)
      .replace(/(href=")(?:\.\.\/)?([^/]+)(?:\/index)?\.md(")/g, '$1' + config.basePath + config.htdocs.posts + '/$2/$3')
    ;
  };

  /**
   * Remove HTML tags from String
   * @param  {String} html [description]
   * @return {String}          [description]
   */
  internal.stripHtmlTags = function(html) {
    const entityMap = {
      'lt': '<',
      'gt': '>',
      'quot': '"',
      'amp': '&'
    };
    return html
      .replace(/<span [^>]*aria-hidden="true"[^>]*><\/span>/g, '')
      .replace(/\s*<\/(?:p|h\d|div|li)>\s*/g, "\n")
      .replace(/<br[^>]*>/g, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/&#(\d+);/, (all, code) => {
        return String.fromCharCode(code);
      })
      .replace(/&(lt|gt|quot|amp);/g, (all, s) => {
        return entityMap[s];
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
      .replace(/<p>(\s*(?:<img[^>]+>\s*){2,})<\/p>/g, function(all, content) {
        let count = content.match(/<img/g).length;
        content = content.replace(/(<img.+?>)/g, '  <div class="gallery__slide">$1</div>' + "\n");
        return '<div class="gallery gallery--' + count + '"'
          + ' data-gallery-count="' + count + '"'
          + ' style="--gallery-count:' + count + ';">'
          + "\n" + content + '</div>';
      })
      .replace(/(<img[^>]+src="([^"]+)(?:-\d+x\d+)(\.(?:jpg|png|gif|webp))"[^>]*>)/g, '<a href="$2$3" class="gallery__link">$1</a>')
      .replace(/(<a[^>]+)(><img[^>]+alt="")/g, '$1 title="Zoom in"$2')
      .replace(/(<a[^>]+)(><img[^>]+alt=")([^"]+?)(")/g, '$1 title="$3"$2$3$4')
    ;
  };

  /**
   * Add schema.org blocks for recipes
   * @param  {String} html [description]
   * @return {String}      [description]
   */
  internal.recipeHtml = function(html) {
    return html
      .replace(/(<p)([\s\S]+?<\/p>)/, function(all, tag, description) {
        return tag + ' itemprop="description"' + description ;
      })
      .replace(/<ul>[\s\S]+?<\/ul>/, function(all) {
        return all.replace(/(<li)/g, '$1 itemprop="recipeIngredient"');
      })
      .replace(/(<ol)(>)([\s\S]+?<\/ol>)/, function(all, tagStart, tagEnd, items) {
        return tagStart
          + ' itemprop="recipeInstructions" itemscope itemtype="http://schema.org/ItemList"'
          + tagEnd
          + items.replace(/(<li)/g, '$1 itemprop="itemListElement" itemscope itemtype="http://schema.org/HowToStep"');
      })
    ;
  };

  /**
   * Remove HTML parts which may be considered unsafe for syndication.
   * @param  {String} html       [description]
   * @param  {String} articleUrl [description]
   * @return {String}            [description]
   */
  internal.makeSafeHtml = function(html, articleUrl) {
    return html
      .replace(/((?:src|href)=")(\/)/g, '$1' + config.baseUrl + '$2')
      .replace(/((?:src|href)=")([^/][^"]+)/g, function(all, attribute, url) {
        return !url.match(/^http/) ? attribute + articleUrl + url : all;
      })
      .replace(/ (data-\S+|sizes|srcset)="[^"]*"/g, '')
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
    let json = external;
    if (json.next && json.next.Id) {
      json.next = json.next.urlObj.relativeUrl('index', 'json');
    }
    if (json.prev && json.prev.Id) {
      json.prev = json.prev.urlObj.relativeUrl('index', 'json');
    }
    return json;
  };

  /**
   * Get all images using image styles. This list may come in handy for the image resizer.
   * @return {Array} of {filename, style}
   */
  external.getAllImagesWithStyle = function() {
    let singleImage;
    let allMarkdown = external.meta.MarkdownDescription + "\n" + markdown;
    let all = allMarkdown.match(/!\[.*?\]\(([^\s/]+?)(?:#(\S+))?\)/g) || [];
    return all.map(function(i) {
      singleImage = i.match(/!\[.*?\]\(([^\s/]+?)(?:#(\S+))?\)/);
      if (singleImage[2] && singleImage[2].match(/^\d+x\d+$/)) {
        singleImage[2] = null;
      }
      return {
        filename: singleImage[1] || null,
        style: singleImage[2] || null
      };
    });
  };

  external.getAllImagesWithStyleObject = function() {
    let styles = external.getAllImagesWithStyle();
    let returnObject = {};
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

  /**
   * Get all links to external ressources
   * @return {Array} [description]
   */
  external.getAllExternalLinks = function() {
    let search = /<a[^>]+href="(http[^"]+)"/g;
    let matched;
    let externalLinks = [];
    while ((matched = search.exec(external.html)) !== null) {
      externalLinks.push(matched[1]);
    }
    return externalLinks;
  };

  /**
   * Generate meta data for RSS enclosures from filename
   * @param  {String} filename         [description]
   * @param  {String} markdownFilename [description]
   * @return {Object}                  [description]
   */
  internal.getEnclosure = function(filename, markdownFilename) {
    const e = {};
    if (!e.length) {
      const stats = fs.statSync(markdownFilename.replace(/\.md$/, '/') + filename);
      e.length = stats.size;
    }
    e.type = 'application/octet-stream';
    switch (filename.replace(/^.+\.(.+?)$/, '$1')) {
      case 'mp3':
        e.type = 'audio/mpeg'; break;
      case 'mpg':
        e.type = 'video/mpeg'; break;
      case 'm4a':
        e.type = 'audio/mp4'; break;
      case 'm4v':
      case 'mp4':
        e.type = 'video/mp4'; break;
      case 'ogg':
      case 'oga':
        e.type = 'audio/ogg'; break;
      case 'ogv':
        e.type = 'video/ogg'; break;
    }
    e.url = meta.AbsoluteUrl + filename;
    return e;
  };

  /**
   * Converts a comma-separated string into an array.
   * If the first argument is an array, this array will be returned unaltered.
   * @param  {String|Array} input [description]
   * @return {Array}              [description]
   */
  internal.listToArray = function(input) {
    return Array.isArray(input) ? input : input.trim().split(/,\s*/);
  };

  return external.makeMeta(filename, markdown, meta);
};

export default Post;
