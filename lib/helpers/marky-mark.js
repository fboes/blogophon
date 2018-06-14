'use strict';

const emojiConvert = require('./emoji-convert');

/**
 * Convert HTML in even better HTML.
 * @constructor
 * @param  {String}  string Input HTML
 * @param  {Object}  rules  Object with settings
 * @return {String}  Converted HTML
 */
const markyMark = function(string, rules) {
  const internal = {};
  const external = {};

  external.output       = '';
  internal.mode         = '';
  internal.currentChunk = '';
  internal.rules           = rules || {};
  internal.rules.language  = internal.rules.language  || 'en';
  internal.rules.quotation = internal.rules.quotation || {};
  internal.rules.headline  = internal.rules.headline  || 2; // legacy headline handling
  // See https://en.wikipedia.org/wiki/Quotation_mark
  switch (internal.rules.language) {
    case 'fr':
    case 'it':
    case 'pt':
    case 'no':
    case 'ru':
      internal.rules.quotation.primary   = internal.rules.quotation.primary   || ['«', '»'];
      internal.rules.quotation.secondary = internal.rules.quotation.secondary || ['“', '”'];
      break;
    case 'dk':
      internal.rules.quotation.primary   = internal.rules.quotation.primary   || ['»', '«'];
      internal.rules.quotation.secondary = internal.rules.quotation.secondary || ['›', '‹'];
      break;
    case 'nl':
    case 'de':
      internal.rules.quotation.primary   = internal.rules.quotation.primary   || ['„', '“'];
      internal.rules.quotation.secondary = internal.rules.quotation.secondary || ['‚', '‘'];
      break;
    case 'pl':
      internal.rules.quotation.primary   = internal.rules.quotation.primary   || ['„', '“'];
      internal.rules.quotation.secondary = internal.rules.quotation.secondary || ['«', '»'];
      break;
    case 'se':
      internal.rules.quotation.primary   = internal.rules.quotation.primary   || ['”', '”'];
      internal.rules.quotation.secondary = internal.rules.quotation.secondary || ['’', '’'];
      break;
    default:
      internal.rules.quotation.primary   = internal.rules.quotation.primary   || ['“', '”'];
      internal.rules.quotation.secondary = internal.rules.quotation.secondary || ['‘', '’'];
      break;
  }


  /**
   * Put a complete string through the parser and return the results.
   * @param  {String} string [description]
   * @return {String}        [description]
   */
  external.convert = function(string) {
    external.output       = '';
    internal.mode         = '';
    internal.currentChunk = '';
    for (let i = 0, len = string.length; i < len; i++) {
      external.pushCharacter(string[i]);
    }
    return external.getResults();
  };

  /**
   * Push a single character into the parser.
   * @param  {String}  c [description]
   * @return {Boolean}   [description]
   */
  external.pushCharacter = function(c) {
    if (c === '<') {
      internal.pushChunk(internal.currentChunk, c);
      internal.currentChunk = '';
    } else if (internal.mode === '<' && c === '/') {
      internal.mode += c;
    } else if (c === '>') {
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
   * @param  {String} newMode  [description]
   * @return {String}          Name of new mode
   */
  internal.pushChunk = function(chunk, newMode) {
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
        case '<less>':
        case '<sass>':
          chunk = internal.convertCss(chunk);
          break;
        case '<html>':
          chunk = internal.convertHtml(chunk);
          break;
        case '<xml>':
        case '<xslt>':
          chunk = internal.convertHtml(chunk);
          break;
        case '<markdown>':
          chunk = internal.convertMarkdown(chunk);
          break;
        case '<bash>':
        case '<shell>':
        case '<dos>':
          chunk = internal.convertShell(chunk);
          break;
        case '<yaml>':
          chunk = internal.convertYaml(chunk);
          break;
        case '<ini>':
          chunk = internal.convertIni(chunk);
          break;
        case '<apacheconf>':
          chunk = internal.convertApacheConf(chunk);
          break;
        case '<sql>':
          chunk = internal.convertSql(chunk);
          break;
        case '<>':
          if (chunk.match(/<code class/)) {
            const lang = chunk.match(/(css|less|sass|html|xml|xslt|markdown|shell|bash|dos|yaml|ini|apacheconf|sql)/);
            if (lang && lang[1]) {
              newMode = '<'+lang[1]+'>';
            } else {
              newMode = '<code>';
            }
          } else if (chunk === '<code>') {
            newMode = '<no>';
          }
          break;
      }
      external.output += chunk; // this is the perfect place for a result event emitter
    }
    internal.mode = newMode;
    return newMode;
  };

  /**
   * Get current state of parsed characters by joining all chunks.
   * @return {String} [description]
   */
  external.getResults = function() {
    internal.pushChunk(internal.currentChunk);
    return internal.convertResult(external.output);
  };

  /**
   * Convert text node. Will do some pretty clever UTF-8 emoji stunts as well.
   * @see    http://apps.timwhitlock.info/emoji/tables/unicode
   * @param  {String} string [description]
   * @return {String}        [description]
   */
  internal.convertText = function(string) {
    const entityMap = {
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
    string = string.replace(/(\.\.\.|… …|\(C\)|\(R\)|\(TM\)|\(+-\)|\(1\/4\)|\(1\/2\)|\(3\/4\)|-&gt;|=&gt;|&lt;-|&lt;=|--)/g, function(s) {
      return entityMap[s];
    });

    string = emojiConvert(string);

    return string
      .replace(/(\d)\s*-\s*(\d)/g, '$1–$2')
      .replace(/(\s)-(\s)/g, '$1–$2')
      .replace(/(\d\s*)(x|\*)(\s*\d)/g, '$1×$3')
    ;
  };

  /**
   * [convertTextBlock description]
   * @param  {String} string [description]
   * @return {String}        [description]
   */
  internal.convertTextBlock = function(string) {
    return string
      .replace(/(&quot;)(.+?)\1/g, internal.rules.quotation.primary[0] + '$2' + internal.rules.quotation.primary[1])
      .replace(/(\B)('|&#39;)(.+?)\2/g, '$1' + internal.rules.quotation.secondary[0] + '$3' + internal.rules.quotation.secondary[1])
    ;
  };

  /*
    .c1, b    { color: #66D9EF; } // blue
    .c2, i    { color: #F92672; } // red
    .c3, var  { color: #A6E22E; } // green
    .c4, tt   { color: #FD971F; } // orange
    .c5, kbd  { color: #E6DB74; } // yellow
    .c6, samp { color: #AE81FF; } // purple
    .comment, u {
      &, * { color:#75715E !important; }
    }
   */

  /**
   * Find strings and comments in code and encapsulate them with HTML. For other code use `codeConverterFunction`.
   * @param  {String}   code                  [description]
   * @param  {Function} codeConverterFunction Convert code not being strings or comments
   * @param  {RegExp}   breaker               [description]
   * @return {String}                         [description]
   */
  internal.convertGeneralCode = function(code, codeConverterFunction, breaker) {
    codeConverterFunction = codeConverterFunction || function(codeRest) {
      return codeRest;
    };
    breaker = breaker || /(\/\*[\S\s]+?\*\/|(?:\/\/|#).+?[\n\r]|&quot;.*?&quot;|'[^']*?'|`[^`]*?`)/g;
    let myArray;
    let chunks = [];
    let lastIndex = 0;

    code = code.replace(/&#39;/g, "'");
    while ((myArray = breaker.exec(code)) !== null) {
      if (lastIndex !== breaker.lastIndex - myArray[0].length) {
        chunks.push(codeConverterFunction(code.substring(lastIndex, breaker.lastIndex - myArray[0].length)));
      }
      switch(myArray[0].charAt(0)) {
        case '/':
        case '#':
          myArray[0] = ('<u>' + myArray[0] + '</u>').replace(/(\n)(<\/u>)$/, '$2$1');
          break;
        case "'":
        case '"':
        case '`':
        case '&':
          myArray[0] = '<kbd>' + myArray[0] + '</kbd>';
          break;
      }
      lastIndex = breaker.lastIndex;
      chunks.push(myArray[0]);
    }
    if (lastIndex !== code.length) {
      chunks.push(codeConverterFunction(code.substring(lastIndex)));
    }
    return chunks.join('');
  };

  /**
   * Convert code text node
   * @param {String} string [description]
   * @return {String}       [description]
   */
  internal.convertCode = function(string) {
    return internal.convertGeneralCode(string, function(codeRest) {
      return codeRest
        .replace(/(^|\b)(var|function|method|class|const|let|external|internal|protected|use|namespace|public|private)(\b)/g, '$1<b>$2</b>$3')
        .replace(/(^|\b)(and|array|break|case|die|do|echo|s?printf?|else(if)?|elsif|final|for(each|Each)?|map|try|catch|then|global|if|include(_once)?|length|list|map|new|or|require(_once)?|return|self|switch|this|throw|while)(\b)/g, '$1<i>$2</i>$3')
        .replace(/([$@%][a-zA-Z0-9_]+)/g, '<var>$1</var>')
        .replace(/([^a-zA-Z$#\d])(-?\d[\d.]*)/g, '$1<em>$2</em>')
        .replace(/(\b)(null|undefined|true|false)(\b)/gi, '$1<samp>$2</samp>$3')
        .replace(/((?:\\)(?:&.+?;|[^&]))/g, '<samp>$1</samp>')
        .replace(/(\n)([+] .+?)(\n)/g, '$1<ins>$2</ins>$3')
        .replace(/(\n)([-] .+?)(\n)/g, '$1<del>$2</del>$3')
      ;
    });
  };

  /**
   * Convert code text node
   * @param  {String} string [description]
   * @return {String}        [description]
   */
  internal.convertCss = function(string) {
    return internal.convertGeneralCode(string, function(codeRest) {
      return codeRest
        .replace(/(\W)((?:margin|padding|border)(?:-[a-z]+)?|(?:[a-z]+-)?color|float|text-align|position|display|overflow)(\s*:)/g, '$1<b>$2</b>$3')
        .replace(/(:\s)(inherit|top|bottom|left|right|auto|center|middle|block|inline|inline-block|none|hidden|static|absolute|relative)(\b)/g, '$1<i>$2</i>$3')
        .replace(/(\W)([.#][a-zA-Z][a-zA-Z0-9_-]+)(\b)/g, '$1<i>$2</i>$3')
        .replace(/(\W)(\$[a-zA-Z0-9_-]+)(\b)/g, '$1<var>$2</var>$3')
        .replace(/(\W)(@(?:include|if|extend|mixin|function|else|elseif))(\b)/g, '$1<b>$2</b>$3')
        .replace(/(\D)(\d[\d.]*[a-z]+)(\b)/g, '$1<samp>$2</samp>$3')
      ;
    }, /(\/\*[\S\s]+?\*\/|(?:\/\/).+?[\n\r]|&quot;.*?&quot;|'[^']*?'|`[^`]*?`)/g);
  };

  /**
   * Convert bash / shell text node
   * @param  {String} string [description]
   * @return {String}        [description]
   */
  internal.convertShell = function(string) {
    return internal.convertGeneralCode(string, function(codeRest) {
      return codeRest
        .replace(/(^|\b)(set|echo|cd|rm|del|md|mkdir|cp|copy|mv|move|ren|touch|less|more|exit|time|sudo)(\W)/g, '$1<b>$2</b>$3')
        .replace(/(^|\b)(if|fi|then|case|esac|function)(\W)/g, '$1<i>$2</i>$3')
        .replace(/(\W)((?:\$)[a-zA-Z0-9_-]+)(\W)/g, '$1<var>$2</var>$3')
        .replace(/(\W)(%[a-zA-Z0-9_-]+%)(\W)/g, '$1<var>$2</var>$3')
        .replace(/(^|\n)(\$)( .+?)/g, '$1<em>$2</em>$3')
      ;
    });
  };

  /**
   * Convert code text node
   * @param  {String} string [description]
   * @return {String}        [description]
   */
  internal.convertHtml = function(string) {
    return string
      .replace(/(&lt;\/?)([a-zA-Z0-9]+)/g, '$1<i>$2</i>')
      .replace(/(&amp;(?:#x)?[a-zA-F0-9]+?;)/g, '<samp>$1</samp>')
      .replace(/(\s)([a-zA-Z0-9_-]+?)(=&quot;)(.+?[^\\])(&quot;)/g, '$1<var>$2</var>$3<kbd>$4</kbd>$5')
      .replace(/(&lt;--.+?--&gt;)/g, '<u>$1</u>')
    ;
  };

  /**
   * Convert Markdown code text node
   * @param  {String} string [description]
   * @return {String}        [description]
   */
  internal.convertMarkdown = function(string) {
    return string
      .replace(/(\[)(.*?)(\]\()(.+?)(\))/g, '$1<b>$2</b>$3<var>$4</var>$5')
      .replace(/(^|\s)(https?:\/\/\S+)/g, '$1<var>$2</var>')
      .replace(/(^|\n|\r)(\S.+?(?:\n|\r)[=-]{3,})(\n|\r|$)/g, '$1<em>$2</em>$3')
      .replace(/(^|\n|\r)(#+.+?)(\n|\r|$)/g, '$1<em>$2</em>$3')
      .replace(/(^|\n|\r)(\*|\d+\.)( )/g, '$1<kbd>$2</kbd>$3')
      .replace(/(^|\s)(`\S.*?\S`)/g, '$1<samp>$2</samp>')
      .replace(/(^|\s)(([*_]{1,2})\S.*?\S\3)/g, '$1<i>$2</i>')
    ;
  };

  /**
   * Convert Yaml code text node
   * @param  {String} string [description]
   * @return {String}        [description]
   */
  internal.convertYaml = function(string) {
    return internal.convertGeneralCode(string, function(codeRest) {
      return codeRest
        .replace(/((?:^|\n)\s*)([a-zA-Z0-9_]+)(:)/g, '$1<i>$2</i>$3')
        .replace(/(:\s)(null|true|false|yes|no|on|off|y|n|~)(\n|$)/gi, '$1<samp>$2</samp>$3')
        .replace(/(:\s)(-?[0-9.]+)(\n|$)/g, '$1<em>$2</em>$3')
        .replace(/(:\s)([\d-]+T[\d-:.]+)(\n|$)/g, '$1<em>$2</em>$3')
      ;
    });
  };

  /**
   * Convert INI configuration text node
   * @param  {String} string [description]
   * @return {String}        [description]
   */
  internal.convertIni = function(string) {
    return string
      .replace(/(^|\s+)([;].+)/g, '$1<u>$2</u>')
      .replace(/((?:^|\s+)\[)([^\]]+)(\])/g, '$1<b>$2</b>$3')
      .replace(/(^|\s+)([^;[][\S]+)(=)(.+)/g, '$1<i>$2</i>$3<kbd>$4</kbd>')
    ;
  };

  /**
   * Convert Apache config code text node
   * @param  {String} string [description]
   * @return {String}        [description]
   */
  internal.convertApacheConf = function(string) {
    return internal.convertGeneralCode(string, function(codeRest) {
      return codeRest
        .replace(/((?:^|\n)\s*)([a-zA-Z0-9_]\S+)(\s)/g, '$1<i>$2</i>$3')
      ;
    });
  };

  /**
   * Convert SQL code text node
   * @param  {String} string [description]
   * @return {String}        [description]
   */
  internal.convertSql = function(string) {
    return internal.convertGeneralCode(string, function(codeRest) {
      return codeRest
        .replace(/(^|\b)(SELECT|UPDATE|INSERT|REPLACE|DELETE|INTO|FROM|(?:LEFT |RIGHT |INNER |OUTER |CROSS )?JOIN|ON|CONCAT|WHERE|BETWEEN|IS|NOT|X?OR|AND|AS|LIKE|COUNT|UNIQUE|CREATE|DISTINCT|INDEX|ALTER|EXISTS|IF|VALUES|SET|USE|LIMIT|ORDER|GROUP BY|HAVING)(\W)/g, '$1<b>$2</b>$3')
        .replace(/(^|\b)(NULL|TRUE|FALSE|[\d.]+)(\W)/g, '$1<i>$2</i>$3')
        .replace(/<\/b>(\s*)<b>/, '$1')
        .replace(/(^|\b)([a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)(\W)/g, '$1<var>$2</var>$3')
      ;
    });
  };

  /**
   * [convertResult description]
   * @param  {String} html [description]
   * @return {String}      [description]
   */
  internal.convertResult = function(html) {
    html = html.replace(/(<h1.+?<\/h1>)/, ''); // Remove title, will be put into meta.Title
    if (internal.rules.headline > 1) {
      html = html.replace(/(<\/?h)(\d)/g, function(all, tag, number) {
        // Decrement headlines, so h2, will be h3
        return tag + (Number(number) + internal.rules.headline - 1);
      });
    }
    return html
      .replace(/<p>===<\/p>(\s*<[^>]+)(>)/g, '<!-- more -->$1 id="more"$2')
      .replace(/( id="[^"]+")( id=")/g, '$2')
      .replace(/\/\/youtu\.be\/([a-zA-Z0-9\-_]+)/g, '//www.youtube.com/watch?v=$1')
      .replace(/(<p(?:\s[^>]+)?>)\s*(<a[^>]+?>[^<]+?<\/a>)\s*(<\/p>)/g, function(all, before, inline) { // after
        return inline
          .replace(
            /(?:<a)?[^>]*?youtube.+v=([a-zA-Z0-9\-_]+)[^>]*?(?:>(.+?)<\/a>)/g,
            '<div class="video-player video-player--youtube"><iframe allowfullscreen="allowfullscreen" src="https://www.youtube-nocookie.com/embed/$1?enablejsapi=1"></iframe><!-- img src="https://img.youtube.com/vi/$1/hqdefault.jpg" --></div>'
          )
          .replace(
            /(?:<a)?[^>]*?vimeo.com\/(\d+)[^>]*?(?:>(.+?)<\/a>)/g,
            '<div class="video-player video-player--vimeo"><iframe allowfullscreen="allowfullscreen" src="https://player.vimeo.com/video/$1"></iframe></div>'
          )
          .replace(
            /(?:<a)?[^>]*?giphy.com\/gifs\/[^"]+-([a-zA-Z0-9]+)[^>]*?(?:>(.+?)<\/a>)/g,
            '<img src="https://i.giphy.com/$1.gif" alt="" />'
          )
          .replace(
            /(?:<a)?[^>]*?codepen\.io\/([a-zA-Z0-9\-_]+)\/pen\/([a-zA-Z0-9\-_]+)[^>]*?(?:>(.+?)<\/a>)/g,
            '<div class="embed embed--codepen"><iframe allowfullscreen="allowfullscreen" src="//codepen.io/$1/embed/$2/?height=265&amp;theme-id=0&amp;default-tab=result&amp;embed-version=2" height="265"></iframe></div>'
          )
          .replace(
            /<a[^>]+href="([^"]+gist.github.com[^"]+)".+?<\/a>/g,
            '<div class="embed embed--github"><script async="async" src="$1.js"></script></div>'
          )
          .replace(
            /<a[^>]+href="([^"]+jsfiddle.net\/.+?\/).+?<\/a>/g,
            '<div class="embed embed--jsfiddle"><script async="async" src="$1embed/"></script></div>'
          )
        ;
      })
      .replace(/(<img[^>]+src="[^"]+-(\d+)x(\d+)\.[^"]+")/g, '$1 width="$2" height="$3"')
      .replace(/(<)img([^>]src="[^"]+\.(mp[34g]|m4[av]|webm|og[gav])(?:#[^"]*)?"+[^>]*?)\s*\/?>/, function(all, first, last, suffix) {
        const tag = suffix.match(/^(?:mp[4g]|m4v|webm|ogv)$/) ? 'video' : 'audio';
        all = first + tag + last + ' controls="controls"></' + tag + '>';
        return all.replace(/\salt="([^"]*)"([^>]*>)/, '$2$1');
      })
      .replace(/(<img[^>]+alt=")(?:&gt;\s?)([^"]+)("[^>]*>)/g, function(all, first, alt, last) {
        const img = '<span class="figure">' + first + alt + last + '<span class="figcaption" aria-hidden="true">' + alt + '<br /></span></span>';
        return img.replace(/(class="figure)(".+<img[^>]+src="[^"]+#)([^"]+)(")/, '$1 $3$2$3$4');
      })
      .replace(/(<(?:img[^>]*[^/]|hr|br))(>)/g, '$1 /$2')
      .replace(/(<p(?:\s[^>]+)?>)\s*(<video[^>]+>\s*<\/video>)\s*<\/p>/g, '<div class="video-player video-player--html5">$2</div>')
      .replace(/(\s(checked|disabled)=")(")/g, '$1$2$3')
      .replace(/(<li)(><input[^>]+type="checkbox")>/g, '$1 class="task-list__item"$2 />')
      .replace(/(<ul)(>[\s\S]*<li class=")(\S+)(__item")/g, '$1 class="$3"$2$3$4')
      .replace(/<h[56]([^>]*)>([\s\S]+?)<\/h[56]>(\s*)(<table>)/g, '$4$3<caption$1>$2</caption>')
      .replace(/(<table[^>]*>)([\s\S]+?)(\/table>)/g, function(all, before, content, after) {
        return '<div class="table-wrapper">'
          + before
          + content
            .replace(/(<tr[^>]*>[\s]*)<td([^>]*>)<strong>(.+?)<\/strong><\/td>/g, '$1<th scope="row"$2$3</th>')
            .replace(/(<(?:th|td) style="text-align:\s?([a-z]+)[^"]*")/g, '$1 class="table-cell--$2"')
            .replace(/(<(th|td))(.+?)\s+([²³⁴⁵⁶⁷⁸⁹])(<\/\2>)/g, function(all, before, tag, content, index, after) {
              let colspan = index.charCodeAt(0);
              colspan -= (colspan > 8000) ? 8304 : 176;
              return before + ' colspan="' + colspan + '"' + content + after;
            })
          + after
          + '</div>'
        ;
      })
      .replace(/(<(p|h\d|li)(?:\s[^>]+)?>)([\s\S]+?)(<\/\2>)/g, function(all, before, tag, inline, after) {
        return before + internal.convertTextBlock(inline) + after;
      })
      .trim()
    ;
  };

  return external.convert(string);
};

module.exports = markyMark;
