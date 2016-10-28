'use strict';

/**
 * Convert HTML in even better HTML.
 * @param {String} string
 * @return {String}
 * @constructor
 */
var markyMark = function markyMark (string) {
  var internal = {};
  var external = {};

  external.chunks = [];
  internal.mode   = '';

  /**
   * Do actual conversion
   * @param {String} string
   * @return {String}
   */
  external.convert = function convert (string) {
    external.chunks = [];
    internal.mode   = '';
    var currentChunk = '';
    for (var i = 0, len = string.length; i < len; i++) {
      var c = string[i];

      if (internal.mode === '<>' || internal.mode === '</>') {
        internal.pushChunk(currentChunk, '');
        currentChunk = '';
      }
      if (c === '<') {
        internal.pushChunk(currentChunk, c);
        currentChunk = '';
      }
      else if (internal.mode === '<' && c === '/') {
        internal.mode += c;
      }
      else if (c === '>') {
        internal.mode += c;
      }
      currentChunk += c;
    }
    internal.pushChunk(currentChunk);
    return external.chunks.join('');
  };

  /**
   * Push a single chunk to the chunk array, but convert chunks by looking at the current mode
   * @param {String} chunk
   * @param {String} mode
   * @return {Boolean}
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
        case '<markdown>':
          chunk = internal.convertMarkdown(chunk);
          break;
        case '<>':
          if (chunk.match(/<code class/)) {
            var lang = chunk.match(/(css|html|markdown)/);
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
      external.chunks.push(chunk);
    }
    internal.mode = newMode;
    return newMode;
  };

  /**
   * Convert text node. Will do some pretty clever UTF-8 emoji stunts as well.
   * @see    http://apps.timwhitlock.info/emoji/tables/unicode
   * @param  {String} string
   * @return {String}
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
    };
    string = string.replace(/(\.\.\.|… …|\(C\)|\(R\)|\(TM\)|\(+-\)|\(1\/4\)|\(1\/2\)|\(3\/4\)|-&gt;|=&gt;|&lt;-|&lt;=)/g, function(s) {
      return entityMap[s];
    });

    entityMap = {
      ':)': '&#x1F60A;',
      ':(': '&#x1F615;',
      ':|': '&#x1F610;',
      ':D': '&#x1F604;',
      ':P': '&#x1F60B;',
      ':O': '&#x1F62F;',
      ';)': '&#x1F609;',
      '8)': '&#x1F60E;',
    };
    string = string.replace(/(\W|^)(:(?:\(|\)|\||D|P|O)|(?:;|8)\))(\W|$)/g, function(all, before, s, after) {
      return before + entityMap[s] + after;
    });

    return string
      .replace(/\s--\s/g, ' — ')
      .replace(/(\d)\s*-\s*(\d)/g,'$1–$2')
      .replace(/(\s)-(\s)/g,'$1–$2')
      .replace(/(\d\s*)(x|\*)(\s*\d)/g,'$1×$3')
      .replace(/(^|[^\S])&quot;(\S.*?\S)&quot;([^\S]|$)/g,'$1„$2“$3') // TODO: Fix quotation with inline tags
      .replace(/(^|[^\S])(?:'|&#39;)(\S.*?\S)(?:'|&#39;)([^\S]|$)/g,'$1‚$2‘$3')
    ;
  };

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
      .replace(/([^\\])(&quot;|'|&#39;)(.*?)(&quot;|'|&#39;)/g,'$1<i class="c5">$2$3$4</i>')
      .replace(/(\b)(null|undefined|true|false)(\b)/gi, '$1<i class="c1">$2</i>$3')
      .replace(/((?:\/\/|\s#).+?(?:\n|$))/g, '<i class="comment">$1</i>')
      .replace(/(\/\*[\s\S]+?\*\/)/g, '<i class="comment">$1</i>')
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
      .replace(/([^\\])(&quot;|'|&#39;)(.*?)(&quot;|'|&#39;)/g,'$1<i class="c5">$2$3$4</i>')
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
      .replace(/(&lt;\/?)([a-zA-Z0-9]+)/g, '$1<i class="c1">$2</i>')
      .replace(/(&amp;(?:#x)?[a-zA-F0-9]+?;)/g, '<i class="c4">$1</i>')
      .replace(/(\s)([a-zA-Z0-9_\-]+?)(=&quot;)(.+?)(&quot;)/g, '$1<i class="c2">$2</i>$3<i class="c3">$4</i>$5')
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
      .replace(/(^|\n|\r)([=\-]{3,})(\n|\r|$)/g, '$1<i class="c1">$2</i>')
      .replace(/(#+.+?(?:\n|$))/g, '<i class="c2">$1</i>')
    ;
  };

  return external.convert(string);
};

module.exports = markyMark;
