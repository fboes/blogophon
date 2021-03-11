'use strict';

// Blogophon internal
const superString         = require('../helpers/super-string');
const trackReplace        = require('../helpers/track-replace');
const blogophonDateFormat = require('../helpers/blogophon-date-format');

/**
 * Defines methods to be used by `Handlebars.registerHelper`
 * @type {Object}
 */
const blogophonHandlebarsQuoters = {

  /**
   * This will word-wrap your text, indent it properly and do proper quoting for ICS calendar output.
   *
   * @param   {Object} options Handelbars text object
   * @returns {Object} Handelbars text object
   */
  icsQuote: function(options) {
    let newText = options.fn(this)
      .replace(/(\n|\r|\r\n)/g, "\\n")
      .replace(/(,|;)/g, '\\$1');
    if (newText.length > 30) {
      newText = newText.match(/[\s\S]{1,72}/g).join("\r\n ");
      newText = " \r\n " + newText;
    }
    return newText;
  },

  /**
   * This will put `'` around textblocks which are unsafe in YAML.
   *
   * @param   {Object} options Handelbars text object
   * @returns {Object} Handelbars text object
   */
  ymlQuote: function(options) {
    let text = options.fn(this);
    if (text.match(/['":#{}[\],&*?|<>=!%@`-]/) && !text.match(/^\d[\d:\-+T]+\d$/)) {
      text = "'" + text.replace(/(')/g, '$1$1') + "'";
    }
    return text;
  },

  /**
   * This will put `"` around a textblock and do proper quoting for CSV output.
   *
   * @see     https://en.wikipedia.org/wiki/Comma-separated_values
   * @param   {Object} options Handelbars text object
   * @returns {Object} Handelbars text object
   */
  csvQuote: function(options) {
    let text = options.fn(this);
    if (text.match(/["\n\r\t,;]/)) {
      text = '"' + text.replace(/(")/g, '$1$1') + '"';
    }
    return text;
  },

  /**
   * This will put `'` around a textblock and do proper quoting for JavaScript output.
   *
   * @param   {Object} options Handelbars text object
   * @returns {Object} Handelbars text object
   */
  jsQuote: function(options) {
    return options.fn(this).replace(/[\n|\r]/g, '\\n').replace(/(')/g, '\\$1');
  },

  gophermapQuote: function(options) {
    let newText = options.fn(this).trim();
    let links = [];
    newText = newText
      .replace(/(\S)[ ]?\n[ ]?(\S)/g, '$1 $2')
      .replace(/\t/g, '  ')
      .replace(/<(i|b)>(.+?)<\/\1>/g, '$2')
      .replace(/(^|\n)(http\S+?\/\/([^/]+)[\S]*)(\n|$)/g, '$1h$3	URL:$2$4')
      .replace(/!(\[.*?\])\((.+?)\)\s*/g, '')
      .replace(/(\[.+?\])\((.+?)\)/g, (all, linkname, url) => {
        url = url.replace(/\s"[^"]+"/, '');
        let urlType = blogophonHandlebarsQuoters._getGopherUrlType(url);
        if (url.match(/^http/)) {
          links.push('h' + linkname + '	URL:' + url);
        } else if (url.match(/^gopher/)) {
          links.push(urlType + linkname + '	' + url.replace(/gopher:\/\/(.+?)(\/.+)$/, '$2	$1	70'));
        } else if (url.match(/^\//)) {
          // local absolute file
          links.push(urlType + linkname + '	' + url);
        }
        return linkname;
      })
    ;
    if (newText.length > 30) {
      newText = newText.match(/[^\n]{1,68}(?:\s|$)/g).join("\n");
    }
    if (links.length > 0) {
      newText += "\n\n" + links.join("\n");
    }
    return newText;
  },

  noLineBreak: function(options) {
    return options.fn(this).replace(/\s*[\n|\r]+/g, ' ');
  },

  nl2br: function(options) {
    return options.fn(this).replace(/[\n|\r]+/g, '<br />$0');
  },

  noNewline: function(options) {
    return options.fn(this).replace(/[\n|\r]+/g, ' ');
  },

  encodeURIComponent: function(options) {
    return encodeURIComponent(options.fn(this));
  },

  /**
   * Remove image tags from HTML.
   * @param  {Object} options See Handlebars
   * @return {Object} See Handlebars
   */
  removeImages: function(options) {
    return options.fn(this)
      .replace(/<(picture|amp-img)[\s\S]+?\/\1>/g, '')
      .replace(/<(span) class="figcaption"[\s\S]+?\/\1>/g, '')
      .replace(/<img[^>]+>/g, '')
      .replace(/<(p)>[\s]*?<\/\1>/g, '') // empty paragraphs
    ;
  },

  /**
   * Convert `<img src="" srcset="" />` to `<img data-src="" data-srcset="" class="lazyload" />`
   * May be combined with `lazyloadAttributes` method.
   * Do not use this technique for AMP pages.
   * @param  {Object} options See Handlebars
   * @return {Object} See Handlebars
   */
  lazyloadImages: function(options) {
    return options.fn(this)
      .replace(/(<img )([^>]+>)/g, function(all, before, after) {
        after
          .replace(/( )((?:sizes|src|srcset)=")/g, '$1data$2')
        ;
        return before + 'class="lazyload" ' + after;

      })
    ;
  },

  /**
   * Add `loading="lazy"` attribute to all tags that support it.
   * May be combined with `lazyloadImages` method.
   * Do not use this technique for AMP pages.
   * @see    https://addyosmani.com/blog/lazy-loading/
   * @param  {String} text       [description]
   * @param  {String} loading    Attribute value, defaults to 'lazy'
   * @return {String}            [description]
   */
  lazyloadAttributes: function(text, loading = 'lazy') {
    return text.replace(/(<(?:img|iframe) )/g, '$1loading="' + loading + '" ');
  },

  /**
   * Add url-encoded parameters to first string
   * @param  {String} html  [description]
   * @param  {String} url   [description]
   * @param  {String} title [description]
   * @return {String}       [description]
   */
  trackReplace: trackReplace,

  /**
   * Output a Date object with the given date formats.
   *
   * - locale: Requires extra locale string
   * - iso: Returns an ISO 8601 / RFC 3339 formatted date / time
   * - rfc: Returns an RFC 2822 formatted date / time
   * - ics: Required for UTC ICS date / time
   * - icsDay: Required for ICS date
   * - timestamp: Returns a timestamp in seconds
   *
   * @param  {Date}   date   [description]
   * @param  {String} format see https://github.com/felixge/node-dateformat and
   *                         the above list of additional formats
   * @param  {String} locale like 'en', 'de'
   * @return {String}        [description]
   */
  dateFormat: blogophonDateFormat,

  /**
   * Remove any special characters from string and convert into lowercase.
   * @param  {String} text [description]
   * @return {String}      [description]
   */
  asciify: function(text) {
    return superString(text).asciify();
  },

  /*
   * Shorten string to a given maxChars length, using replaceString if it has
   * to be shortened.
   * @param  {String} text          [description]
   * @param  {Number} maxChars      [description]
   * @param  {String} replaceString [description]
   * @return {String}               [description]
   */
  niceShorten: function(text, maxChars = 160, replaceString = '...') {
    return superString(text).niceShorten(maxChars, replaceString);
  },

  /**
   * [description]
   * @param  {Object} dumpData  [description]
   * @param  {String} options   [description]
   * @return {String}           [description]
   */
  consoleDump: function(dumpData, options) {
    let html = '<script>';
    html += 'window.dumpData = window.dumpData || [];';
    html += 'window.dumpData.push(' + options.fn(JSON.stringify(dumpData)) + ');';
    html += 'console.log(window.dumpData[window.dumpData.length - 1]);';
    html += '</script>';
    return html;
  },

  /**
   * [description]
   * @param  {Object} dataLayer [description]
   * @param  {String} options)  [description]
   * @return {String}           [description]
   */
  dataLayer: function(dataLayer, options) {
    let html = 'window.dataLayer = window.dataLayer || [];';
    html += 'window.dataLayer.push(' + options.fn(JSON.stringify(dataLayer)) + ');';
    return html;
  },

  /**
   * @see https://stackoverflow.com/questions/34252817/handlebarsjs-check-if-a-string-is-equal-to-a-value
   * @param  {String}  haystack  [description]
   * @param  {String}  needle    [description]
   * @param  {Object}  options   [description]
   * @return {Boolean}           [description]
   */
  ifEquals: function(haystack, needle, options) {
    return (haystack === needle) ? options.fn(this) : options.inverse(this);
  },

  /**
   * Match an expression agains a pattern. Uses `RegExp().test()`.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
   * @param  {String}  haystack  [description]
   * @param  {String}  pattern   A pattern to give to `RegExp`
   * @param  {Object}  options   [description]
   * @return {Boolean}           [description]
   */
  ifMatches: function(haystack, pattern, options) {
    return (new RegExp(pattern).test(haystack)) ? options.fn(this) : options.inverse(this);
  },

  /**
   * Check if a given image URL has dimension included (e.g. `image-123x456.jpg`)
   * and if its aspect ratio matches the given aspect ratio.
   * If no dimensions are found, this will return `true` as well. See `ifHasDimensions`.
   * @param  {String}  imageUrl [description]
   * @param  {Number}  width    [description]
   * @param  {Number}  height   [description]
   * @param  {Object}  options  [description]
   * @return {Boolean} If aspect ratio matches
   */
  ifHasAspectRatio: function(imageUrl, width, height, options) {
    const dimensions    = blogophonHandlebarsQuoters._getDimensions(imageUrl);
    const imageUrlRatio = blogophonHandlebarsQuoters._getRatio(dimensions.width, dimensions.height);
    const givenRatio    = blogophonHandlebarsQuoters._getRatio(width, height);
    return (imageUrlRatio === 0 || imageUrlRatio === givenRatio) ? options.fn(this) : options.inverse(this);
  },

  /**
   * Check if a given image URL has dimension included (e.g. `image-123x456.jpg`)
   * and if its dimensions are bigger than the given ratios.
   * If no dimensions are found, this will return `true` as well. See `ifHasDimensions`.
   * @param  {String}  imageUrl [description]
   * @param  {Number}  width    [description]
   * @param  {Number}  height   [description]
   * @param  {Object}  options  [description]
   * @return {Boolean} if its dimensions are bigger than the given ratios
   */
  ifHasMinDimensions: function(imageUrl, width, height, options) {
    width  = Number(width);
    height = Number(height);
    const dimensions = blogophonHandlebarsQuoters._getDimensions(imageUrl);
    return (dimensions.width >= width && dimensions.height >= height)
      ? options.fn(this)
      : options.inverse(this)
    ;
  },

  /**
   * Check if a given image URL has dimension included (e.g. `image-123x456.jpg`)
   * and if its dimensions are smaller than the given ratios.
   * If no dimensions are found, this will return `true` as well. See `ifHasDimensions`.
   * @param  {String}  imageUrl [description]
   * @param  {Number}  width    [description]
   * @param  {Number}  height   [description]
   * @param  {Object}  options  [description]
   * @return {Boolean} if its dimensions are smaller than the given ratios
   */
  ifHasMaxDimensions: function(imageUrl, width, height, options) {
    width  = Number(width);
    height = Number(height);
    const dimensions = blogophonHandlebarsQuoters._getDimensions(imageUrl);
    return (dimensions.width <= width && dimensions.height <= height)
      ? options.fn(this)
      : options.inverse(this)
    ;
  },

  /**
   * Check if a given image URL has dimension included (e.g. `image-123x456.jpg`)
   * @param  {String}  imageUrl [description]
   * @param  {Object}  options  [description]
   * @return {Boolean} if it has dimensions
   */
  ifHasDimensions: function(imageUrl, options) {
    const dimensions = blogophonHandlebarsQuoters._getDimensions(imageUrl);
    return (dimensions.width && dimensions.height)
      ? options.fn(this)
      : options.inverse(this)
    ;
  },

  /**
   *
   * @param  {String} imageUrl [descriptuion]
   * @return {Object} with `width`, `height`
   */
  _getDimensions: function(imageUrl) {
    const dimensions = imageUrl.match(/\D+(\d+)x(\d+)\.[a-zA-Z]+/);
    return {
      width:  dimensions ? Number(dimensions[1]) : 0,
      height: dimensions ? Number(dimensions[2]) : 0
    };
  },

  /**
   * Return ratio of width/height
   * @param  {Number}  width   [description]
   * @param  {Number}  height  [description]
   * @return {Number}  Ratio
   */
  _getRatio: function(width, height) {
    width  = Number(width);
    height = Number(height);
    return height ? Math.round(100 * width / height) / 100 : 0;
  },

  _getGopherUrlType: function(url) {
    if (url.match(/^http/)) {
      return 'h';
    }
    let matches = url.match(/\/(.+?\.(.+?))?$/);
    if (!matches) {
      return '9';
    }
    if (!matches[1]) {
      return '1';
    }
    switch (matches[2]) {
      case 'txt':
      case 'md':
        return '0';
      case 'zip':
        return '5';
      case 'gif':
        return 'g';
      case 'html':
        return 'h';
      case 'jpg':
      case 'png':
        return 'I';
      case 'pdf':
        return 'd';
    }
    return '9';
  }
};

module.exports = blogophonHandlebarsQuoters;
