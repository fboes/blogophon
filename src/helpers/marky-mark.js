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
        case '<>':
          if (chunk.match(/<code class/)) {
            var lang = chunk.match(/(css|html)/);
            if (lang && lang[1]) {
              newMode = '<'+lang[1]+'>';
            }
            else {
              newMode = '<code>';
            }
          }
          break;
      }
      external.chunks.push(chunk);
    }
    internal.mode = newMode;
    return newMode;
  };

  /**
   * Convert text node
   * @param {String} string
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
      '&lt;=': '⇐'
    };
    string = string.replace(/(\.\.\.|… …|\(C\)|\(R\)|\(TM\)|\(+-\)|\(1\/4\)|\(1\/2\)|\(3\/4\)|-&gt;|=&gt;|&lt;-|&lt;=)/g, function(s) {
      return entityMap[s];
    });
    return string
      .replace(/\s--\s/g, ' — ')
      .replace(/(\d)\s*-\s*(\d)/g,'$1–$2')
      .replace(/(\s)-(\s)/g,'$1–$2')
      .replace(/(\d\s*)(x|\*)(\s*\d)/g,'$1×$3')
      .replace(/(^|[^\S])&quot;(\S.*?\S)&quot;([^\S]|$)/g,'$1„$2“$3')
      .replace(/^&quot;/, '„')
      .replace(/&quot;$/, '“')
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
      .replace(/(\b)(var|function|method|class|const|external|internal|protected|use)(\b)/gi, '$1<i class="c1">$2</i>$3')
      .replace(/(\b)(and|array|break|case|die|do|echo|else(if)?|elsif|final|for(each)?|global|if|include(_once)?|length|list|map|new|or|require(_once)?|return|self|switch|this|throw|while)(\b)/gi, '$1<i class="c2">$2</i>$3')
      .replace(/([^\\])(&quot;|'|&#39;)(.*?)(&quot;|'|&#39;)/g,'$1<i class="c3">$2$3$4</i>')
      .replace(/([\s|=|;])([\d\.]+)([\s|=|;])/g, '$1<i class="c4">$2</i>$3')
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
      .replace(/(\b)(color|background-color|float|text-align|position|display)(\b)/gi, '$1<i class="c1">$2</i>$3')
      .replace(/(\b)(inherit|top|bottom|left|right|auto|center|middle|block|inline|inline-block|none)(\b)/gi, '$1<i class="c2">$2</i>$3')
      .replace(/(\b)((?:\.|#)[a-z0-9_\-]+)(\b)/gi, '$1<i class="c2">$2</i>$3')
      .replace(/(\b)((?:$)[a-z0-9_\-]+)(\b)/gi, '$1<i class="c3">$2</i>$3')
      .replace(/(\b)(@(?:include|if|extend|mixin|function|else|elseif))(\b)/gi, '$1<i class="c1">$2</i>$3')
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
      .replace(/(&amp;[a-z0-9]+?;)/g, '<i class="c4">$1</i>')
      .replace(/(\s)([a-z0-9_\-]+?)(=&quot;)(.+?)(&quot;)/gi, '$1<i class="c2">$2</i>$3<i class="c3">$4</i>$5')
      .replace(/(&lt;--.+?--&gt;)/g, '<i class="comment">$1</i>')
    ;
  };

  return external.convert(string);
};

module.exports = markyMark;
