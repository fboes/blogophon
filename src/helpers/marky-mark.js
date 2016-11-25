'use strict';

/**
 * Convert HTML in even better HTML.
 * @param  {String}  string
 * @param  {Object}  rules  Object with settings
 * @return {String}
 * @constructor
 */
var markyMark = function markyMark (string, rules) {
  var internal = {};
  var external = {};

  external.output       = '';
  internal.mode         = '';
  internal.currentChunk = '';
  internal.rules           = rules || {};
  internal.rules.language  = internal.rules.language  || 'en';
  internal.rules.quotation = internal.rules.quotation || {};
  // See https://en.wikipedia.org/wiki/Quotation_mark
  switch (internal.rules.language) {
    case 'fr':
    case 'it':
    case 'pt':
    case 'no':
    case 'ru':
      internal.rules.quotation.primary   = internal.rules.quotation.primary   || ['«','»'];
      internal.rules.quotation.secondary = internal.rules.quotation.secondary || ['“','”'];
      break;
    case 'dk':
      internal.rules.quotation.primary   = internal.rules.quotation.primary   || ['»','«'];
      internal.rules.quotation.secondary = internal.rules.quotation.secondary || ['›','‹'];
      break;
    case 'nl':
    case 'de':
      internal.rules.quotation.primary   = internal.rules.quotation.primary   || ['„','“'];
      internal.rules.quotation.secondary = internal.rules.quotation.secondary || ['‚','‘'];
      break;
    case 'pl':
      internal.rules.quotation.primary   = internal.rules.quotation.primary   || ['„','“'];
      internal.rules.quotation.secondary = internal.rules.quotation.secondary || ['«','»'];
      break;
    case 'se':
      internal.rules.quotation.primary   = internal.rules.quotation.primary   || ['”','”'];
      internal.rules.quotation.secondary = internal.rules.quotation.secondary || ['’','’'];
      break;
    default:
      internal.rules.quotation.primary   = internal.rules.quotation.primary   || ['“','”'];
      internal.rules.quotation.secondary = internal.rules.quotation.secondary || ['‘','’'];
      break;
  }


  /**
   * Put a complete string through the parser and return the results.
   * @param  {String} string
   * @return {String}
   */
  external.convert = function convert (string) {
    external.output       = '';
    internal.mode         = '';
    internal.currentChunk = '';
    for (var i = 0, len = string.length; i < len; i++) {
      external.pushCharacter(string[i]);
    }
    return external.getResults();
  };

  /**
   * Push a single character into the parser.
   * @param  {String}  c [description]
   * @return {Boolean}   [description]
   */
  external.pushCharacter = function pushCharacter (c) {
      if (c === '<') {
        internal.pushChunk(internal.currentChunk, c);
        internal.currentChunk = '';
      }
      else if (internal.mode === '<' && c === '/') {
        internal.mode += c;
      }
      else if (c === '>') {
        internal.mode += c;
      }
      internal.currentChunk += c;
      if (internal.mode === '<>' || internal.mode === '</>') {
        internal.pushChunk(internal.currentChunk, '');
        internal.currentChunk = '';
      }
      return true;
  };

  /**
   * Push a single chunk of characters into the chunk array, but convert chunks by looking at the current mode
   * @param  {String} chunk    List of characters
   * @param  {String} newMode
   * @return {String}          Name of new mode
   */
  internal.pushChunk = function pushChunk (chunk, newMode) {
    newMode = newMode || '';
    if (chunk) {
      switch (internal.mode) {
        case '':
          // Text node
          chunk = internal.convertText(chunk);
          break;
        case '<code>':
          chunk = internal.convertCode(chunk);
          break;
        case '<css>':
          chunk = internal.convertCss(chunk);
          break;
        case '<html>':
          chunk = internal.convertHtml(chunk);
          break;
        case '<xml>':
          chunk = internal.convertHtml(chunk);
          break;
        case '<markdown>':
          chunk = internal.convertMarkdown(chunk);
          break;
        case '<>':
          if (chunk.match(/<code class/)) {
            var lang = chunk.match(/(css|html|xml|markdown)/);
            if (lang && lang[1]) {
              newMode = '<'+lang[1]+'>';
            }
            else {
              newMode = '<code>';
            }
          }
          else if (chunk === '<code>') {
              newMode = '<no>';
          }
          break;
      }
      external.output += chunk; // this is the perfect place for a result emitter
    }
    internal.mode = newMode;
    return newMode;
  };

  /**
   * Get current state of parsed characters by joining all chunks.
   * @return {String} [description]
   */
  external.getResults = function getResults () {
    internal.pushChunk(internal.currentChunk);
    return internal.convertResult(external.output);
  };

  /**
   * Convert text node. Will do some pretty clever UTF-8 emoji stunts as well.
   * @see    http://apps.timwhitlock.info/emoji/tables/unicode
   * @param  {String} string
   * @return {String}x
   */
  internal.convertText = function convertText(string) {
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
      '-&gt;': '→',
      '=&gt;': '⇒',
      '&lt;-': '←',
      '&lt;=': '⇐',
      '--': '—'
    };
    string = string.replace(/(\.\.\.|… …|\(C\)|\(R\)|\(TM\)|\(+-\)|\(1\/4\)|\(1\/2\)|\(3\/4\)|-&gt;|=&gt;|&lt;-|&lt;=|\-\-)/g, function(s) {
      return entityMap[s];
    });

    entityMap = {
      ':)': '&#x1F60A;',
      ':))': '&#x1F602;',
      ':(': '&#x1F629;',
      ':\'(': '&#x1F622;',
      ':|': '&#x1F610;',
      ':/': '&#x1F612;',
      ':D': '&#x1F604;',
      ':P': '&#x1F60B;',
      ':p': '&#x1F60B;',
      ':O': '&#x1F632;',
      ':o': '&#x1F632;',
      ':?': '&#x1F914;',
      ':@': '&#x1F620;',
      ':*': '&#x1F618;',
      ';)': '&#x1F609;',
      'B)': '&#x1F60E;',
      'XP': '&#x1F61D;',
      '8o': '&#x1F628;',
      '+1': '&#x1F44D;',
      '-1': '&#x1F44E;',
      '&lt;3': '&#x1F495;',
      '&lt;/3': '&#x1F494;',
      '(!)': '&#x26A0;'
    };
    string = string.replace(/(\W|^)(:(?:'?\(|\)|\)\)|\||\/|D|P|p|O|o|\*|\?|@)|(?:;|B)\)|XP|8o|(?:\+|\-)1|&lt;\?3|\(!\))(\W|$)/g, function(all, before, s, after) {
      return before + '<span class="emoji" title="'+s+'">' + entityMap[s] + '</span>' + after;
    });

    return string
      .replace(/(\d)\s*-\s*(\d)/g,'$1–$2')
      .replace(/(\s)-(\s)/g,'$1–$2')
      .replace(/(\d\s*)(x|\*)(\s*\d)/g,'$1×$3')
    ;
  };

  /**
   * [convertTextBlock description]
   * @param  {String} string [description]
   * @return {String}        [description]
   */
  internal.convertTextBlock = function convertTextBlock(string) {
    return string
      .replace(/&quot;(.+?)&quot;/g, internal.rules.quotation.primary[0] + '$1' + internal.rules.quotation.primary[1])
      .replace(/(?:'|&#39;)(.+?)(?:'|&#39;)/g, internal.rules.quotation.secondary[0] + '$1' + internal.rules.quotation.secondary[1])
    ;
  };

  /*
    &.c1 {color:#66D9EF;} // blue
    &.c2 {color:#F92672;} // red
    &.c3 {color:#A6E22E;} // green
    &.c4 {color:#FD971F;} // orange
    &.c5 {color:#E6DB74;} // yellow
    &.c6 {color:#AE81FF;} // purple
   */

  /**
   * Convert code text node
   * @param {String} string
   * @return {String}
   */
  internal.convertCode = function convertCode(string) {
    return string
      .replace(/(\b)(var|function|method|class|const|external|internal|protected|use|public|private)(\b)/g, '$1<i class="c1">$2</i>$3')
      .replace(/(\b)(and|array|break|case|die|do|echo|s?printf?|else(if)?|elsif|final|for(each|Each)?|map|try|catch|then|global|if|include(_once)?|length|list|map|new|or|require(_once)?|return|self|switch|this|throw|while)(\b)/g, '$1<i class="c2">$2</i>$3')
      .replace(/([\s|=|;])([\d\.]+)([\s|=|;])/g, '$1<i class="c4">$2</i>$3')
      .replace(/([^\\])(&quot;)(.*?[^\\])(&quot;)/g,'$1<i class="c5">$2$3$4</i>')
      .replace(/([^\\])(')(.*?[^\\])(')/g,'$1<i class="c5">$2$3$4</i>')
      .replace(/([^\\])(&#39;)(.*?[^\\])(&#39;)/g,'$1<i class="c5">$2$3$4</i>')
      .replace(/(\b)(null|undefined|true|false)(\b)/gi, '$1<i class="c6">$2</i>$3')
      .replace(/((?:\\)(?:&.+?;|[^\&]))/g, '<i class="c6">$1</i>')
      .replace(/((?:\/\/|\s#).+?(?:\n|$))/g, '<i class="comment">$1</i>')
      .replace(/(\/\*[\s\S]+?\*\/)/g, '<i class="comment">$1</i>')
      .replace(/(\n)(\+ .+?)(\n)/g, '$1<ins>$2</ins>$3')
      .replace(/(\n)(\- .+?)(\n)/g, '$1<del>$2</del>$3')
    ;
  };

  /**
   * Convert code text node
   * @param {String} string
   * @return {String}
   */
  internal.convertCss = function convertCss(string) {
    return string
      .replace(/(\b)(color|background-color|float|text-align|position|display)(\b)/g, '$1<i class="c1">$2</i>$3')
      .replace(/(\b)(inherit|top|bottom|left|right|auto|center|middle|block|inline|inline-block|none)(\b)/g, '$1<i class="c2">$2</i>$3')
      .replace(/(\b)((?:\.|#)[a-zA-Z0-9_\-]+)(\b)/g, '$1<i class="c2">$2</i>$3')
      .replace(/(\b)((?:$)[a-zA-Z0-9_\-]+)(\b)/g, '$1<i class="c3">$2</i>$3')
      .replace(/(\b)(@(?:include|if|extend|mixin|function|else|elseif))(\b)/g, '$1<i class="c1">$2</i>$3')
      .replace(/([^\\])(&quot;)(.*?[^\\])(&quot;)/g,'$1<i class="c5">$2$3$4</i>')
      .replace(/([^\\])(')(.*?[^\\])(')/g,'$1<i class="c5">$2$3$4</i>')
      .replace(/([^\\])(&#39;)(.*?[^\\])(&#39;)/g,'$1<i class="c5">$2$3$4</i>')
      .replace(/([\d\.]+[a-z]+)/g, '$1<i class="c6">$2</i>$3')
      .replace(/(\/\/.+?(?:\n|$))/g, '<i class="comment">$1</i>')
      .replace(/(\/\*[\s\S]+?\*\/)/g, '<i class="comment">$1</i>')
      ;
  };

  /**
   * Convert code text node
   * @param {String} string
   * @return {String}
   */
  internal.convertHtml = function convertHtml(string) {
    return string
      .replace(/(&lt;\/?)([a-zA-Z0-9]+)/g, '$1<i class="c2">$2</i>')
      .replace(/(&amp;(?:#x)?[a-zA-F0-9]+?;)/g, '<i class="c6">$1</i>')
      .replace(/(\s)([a-zA-Z0-9_\-]+?)(=&quot;)(.+?[^\\])(&quot;)/g, '$1<i class="c3">$2</i>$3<i class="c5">$4</i>$5')
      .replace(/(&lt;--.+?--&gt;)/g, '<i class="comment">$1</i>')
    ;
  };

  /**
   * Convert Markdown code text node
   * @param {String}
   * @return {String}
   */
  internal.convertMarkdown = function convertMarkdown(string) {
    return string
      .replace(/(\[)(.*?)(\]\()(.+?)(\))/g, '$1<i class="c1">$2</i>$3<i class="c3">$4</i>$5')
      .replace(/(^|\n|\r)(\S.+?(?:\n|\r)[=\-]{3,})(\n|\r|$)/g, '$1<i class="c4">$2</i>$3')
      .replace(/(^|\n|\r)(#+.+?)(\n|\r|$)/g, '$1<i class="c4">$2</i>$3')
    ;
  };

  /**
   * [convertResult description]
   * @param  {String} html [description]
   * @return {String}      [description]
   */
  internal.convertResult = function convertResult (html) {
    return html
      .replace(/<p>===<\/p>(\s*<[^>]+)(>)/g,'<!-- more -->$1 id="more"$2')
      .replace(/(<\/?h)3/g,'$14')
      .replace(/(<\/?h)2/g,'$13')
      .replace(/(<\/?h)1/g,'$12')
      .replace(/(<h2.+?<\/h2>)/,'') // Remove title, will be put into meta.Title
      .replace(
        /<p>\s*(?:<a)?[^>]*?youtube.+v=([a-zA-Z0-9\-_]+)[^>]*?(?:>(.+?)<\/a>)?\s*<\/p>/g,
        '<div class="video-player youtube"><iframe allowfullscreen="allowfullscreen" src="https://www.youtube-nocookie.com/embed/$1?enablejsapi=1"><a href="https://www.youtube.com/watch?v=$1"><img src="https://img.youtube.com/vi/$1/hqdefault.jpg" alt="$2" /></a></iframe></div>'
      )
      .replace(
        /<p>\s*(?:<a)?[^>]*?vimeo.com\/(\d+)[^>]*?(?:>(.+?)<\/a>)?\s*<\/p>/g,
        '<div class="video-player vimeo"><iframe allowfullscreen="allowfullscreen" src="https://player.vimeo.com/video/$1"><a href="https://vimeo.com/$1">$2</a></iframe></div>'
      )
      .replace(
        /<p>\s*(?:<a)?[^>]*?giphy.com\/gifs\/[^"]+\-([a-zA-Z0-9]+)[^>]*?(?:>(.+?)<\/a>)?\s*<\/p>/g,
        '<img src="https://i.giphy.com/$1.gif" alt="" />'
      )
      .replace(/(<img[^>]+src="[^"]+\-(\d+)x(\d+)\.[^"]+")/g,'$1 width="$2" height="$3"')
      .replace(/(>)\[ \](\s)/g,'$1<span class="checkbox"></span>$2')
      .replace(/(>)\[[xX]\](\s)/g,'$1<span class="checkbox checkbox--checked"></span>$2')
      .replace(/(<(?:img)[^>]*[^/])(>)/g,'$1 /$2')
      .replace(/(<(?:hr|br)[^/])(>)/g,'$1 /$2')
      .replace(/(<table>)([\s\S]+?)(\/table)/g, function(all, before,content,after) {
        return before + content.replace(/(<tr>[\s]*)<td><strong>(.+?)<\/strong><\/td>/g,'$1<th scope="row">$2</th>') + after;
      })
      .replace(/(<(?:p|h\d|li)>)([\s\S]+?)(<\/(?:p|h\d|li)>)/g,function(all, before, inline, after) {
        return before + internal.convertTextBlock(inline) + after;
      })
      .trim()
    ;
  };

  return external.convert(string);
};

module.exports = markyMark;
