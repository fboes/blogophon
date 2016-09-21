'use strict';

/**
 * Convert HTML in even better HTML.
 * @param {String} string
 * @returns {String}
 * @constructor
 */
var MarkyMark = function (string) {
  this.chunks = [];
  this.mode   = '';
  this.convert(string);
  return this;
};

/**
 * Do actual conversion
 * @param {String} string
 * @returns {String}
 */
MarkyMark.prototype.convert = function (string) {
  this.chunks = [];
  this.mode   = '';
  var currentChunk = '';
  for (var i = 0, len = string.length; i < len; i++) {
    var c = string[i];

    if (this.mode === '<>' || this.mode === '</>') {
      this._pushChunk(currentChunk, '');
      currentChunk = '';
    }
    if (c === '<') {
      this._pushChunk(currentChunk, c);
      currentChunk = '';
    }
    else if (this.mode === '<' && c === '/') {
      this.mode += c;
    }
    else if (c === '>') {
      this.mode += c;
    }
    currentChunk += c;
  }
  this._pushChunk(currentChunk);
  return this;
};

/**
 * Returns string representation of chunks
 * @return {String}
 */
MarkyMark.prototype.toString = function () {
  return this.chunks.join('');
};

/**
 * Push a single chunk to the chunk array, but convert chunks by looking at the current mode
 * @param {String} chunk
 * @param {String} mode
 * @returns {Boolean}
 */
MarkyMark.prototype._pushChunk = function (chunk, newMode) {
  newMode = newMode || '';
  if (chunk) {
    switch (this.mode) {
      case '':
        // Text node
        chunk = this.convertText(chunk);
        break;
      case '<code>':
        chunk = this.convertCode(chunk);
        break;
      case '<>':
        if (chunk.match(/<code class/)) {
          newMode = '<code>';
        }
        break;
    }
    this.chunks.push(chunk);
  }
  this.mode = newMode;
  return newMode;
};

/**
 * Convert text node
 * @param {String} string
 * @return {String}
 */
MarkyMark.prototype.convertText = function (string) {
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
    .replace(/([^\S])&quot;(\S.*?\S)&quot;([^\S]|$)/g,'$1„$2“$3')
    .replace(/([^\S])(?:'|&#39;)(\S.*?\S)(?:'|&#39;)([^\S]|$)/g,'$1‚$2‘$3')
  ;
};

/**
 * Convert code text node
 * @param {String} string
 * @return {String}
 */
MarkyMark.prototype.convertCode = function (string) {
  return string
    .replace(/(\b)(var|function|method|class)(\b)/g, '$1<i class="reserved">$2</i>$3')
    .replace(/(\/\/.+?(?:\n|$))/g, '<i class="comment">$1</i>')
    .replace(/([^\\])(&quot;|'|&#39;)(.*?)(&quot;|'|&#39;)/g,'$1<i class="string">$2$3$4</i>')
  ;
};

module.exports = MarkyMark;
