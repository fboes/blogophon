'use strict';

/**
 * Convert HTML in even better HTML.
 * @constructor
 * @param  {String}  string Input HTML
 * @param  {Object}  rules  Object with settings
 * @return {String}  Converted HTML
 */
var markyMark = function(string, rules) {
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
        case '<bash>':
        case '<shell>':
          chunk = internal.convertShell(chunk);
          break;
        case '<>':
          if (chunk.match(/<code class/)) {
            var lang = chunk.match(/(css|html|xml|markdown|shell|bash)/);
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
      external.output += chunk; // this is the perfect place for a result emitter
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
      ':)': '1F60A',
      ':))': '1F602',
      ':(': '1F629',
      ":'(": '1F622',
      ':|': '1F610',
      ':/': '1F612',
      ':D': '1F604',
      ':P': '1F60B',
      ':p': '1F60B',
      ':O': '1F632',
      ':o': '1F632',
      ':?': '1F914',
      ':@': '1F620',
      ':*': '1F618',
      ';)': '1F609',
      'B)': '1F60E',
      'XP': '1F61D',
      '8o': '1F628',
      '8<': '2702',
      ':+1:': '1F44D',
      ':-1:': '1F44E',
      '&lt;3': '2764',
      '&lt;/3': '1F494',
      '(!)': '26A0'
    };
    string = string.replace(/(\W|^)(:(?:'?\(|\)\)|[\)\|\/DPpOo\*\?@])|[;B]\)|XP|8[o<]|:[\+\-]1:|&lt;\?3|\(!\))(\W|$)/g, function(all, before, s, after) {
      return before + '<span class="emoji emoji--' + entityMap[s] + '" title="'+s+'">&#x' + entityMap[s] + ';</span>' + after;
    });

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
      .replace(/('|&#39;)(.+?)\1/g, internal.rules.quotation.secondary[0] + '$2' + internal.rules.quotation.secondary[1])
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
   * @return {String}                         [description]
   */
  internal.convertGeneralCode = function(code, codeConverterFunction, breaker) {
    codeConverterFunction = codeConverterFunction || function(codeRest) {
      return codeRest;
    };
    breaker = breaker || /(\/\*[\S\s]+?\*\/|(?:\/\/|\#).+?[\n\r]|&quot;.*?&quot;|'[^']*?'|`[^`]*?`)/g;
    var myArray;
    var chunks = [];
    var lastIndex = 0;

    code = code.replace(/&#39\;/g, "'");
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
        .replace(/(^|\b)(var|function|method|class|const|external|internal|protected|use|namespace|public|private)(\b)/g, '$1<b>$2</b>$3')
        .replace(/(^|\b)(and|array|break|case|die|do|echo|s?printf?|else(if)?|elsif|final|for(each|Each)?|map|try|catch|then|global|if|include(_once)?|length|list|map|new|or|require(_once)?|return|self|switch|this|throw|while)(\b)/g, '$1<i>$2</i>$3')
        .replace(/([\$|@|%][a-zA-Z0-9_]+)/g, '<var>$1</var>')
        .replace(/([^a-zA-Z$#\d])(\-?\d[\d\.]*)/g, '$1<em>$2</em>')
        .replace(/(\b)(null|undefined|true|false)(\b)/gi, '$1<samp>$2</samp>$3')
        .replace(/((?:\\)(?:&.+?;|[^\&]))/g, '<samp>$1</samp>')
        .replace(/(\n)(\+ .+?)(\n)/g, '$1<ins>$2</ins>$3')
        .replace(/(\n)(\- .+?)(\n)/g, '$1<del>$2</del>$3')
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
        .replace(/([\b\s])((?:margin|padding|border)(?:\-[a-z]+)?|(?:[a-z]+\-)?color|float|text-align|position|display|overflow)(\s*:)/g, '$1<b>$2</b>$3')
        .replace(/(:\s)(inherit|top|bottom|left|right|auto|center|middle|block|inline|inline-block|none|hidden|static|absolute|relative)(\b)/g, '$1<i>$2</i>$3')
        .replace(/([\b\s])([\.\#][a-zA-Z][a-zA-Z0-9_\-]+)(\b)/g, '$1<i>$2</i>$3')
        .replace(/([\b\s])(\$[a-zA-Z0-9_\-]+)(\b)/g, '$1<var>$2</var>$3')
        .replace(/([\b\s])(@(?:include|if|extend|mixin|function|else|elseif))(\b)/g, '$1<b>$2</b>$3')
        .replace(/(\D)(\d[\d\.]*[a-z]+)(\b)/g, '$1<samp>$2</samp>$3')
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
        .replace(/(^|\b)(set|echo|cd|exit|time|sudo)(\b)/g, '$1<b>$2</b>$3')
        .replace(/(^|\b)(if|fi|then|case|esac|function)(\b)/g, '$1<i>$2</i>$3')
        .replace(/(\b)((?:\$)[a-zA-Z0-9_\-]+)(\b)/g, '$1<var>$2</var>$3')
        .replace(/(\n)(\$ .+?)(\n|$)/g, '$1<em>$2</em>$3')
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
      .replace(/(\s)([a-zA-Z0-9_\-]+?)(=&quot;)(.+?[^\\])(&quot;)/g, '$1<var>$2</var>$3<kbd>$4</kbd>$5')
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
      .replace(/(^|\n|\r)(\S.+?(?:\n|\r)[=\-]{3,})(\n|\r|$)/g, '$1<em>$2</em>$3')
      .replace(/(^|\n|\r)(#+.+?)(\n|\r|$)/g, '$1<em>$2</em>$3')
    ;
  };

  /**
   * [convertResult description]
   * @param  {String} html [description]
   * @return {String}      [description]
   */
  internal.convertResult = function(html) {
    return html
      .replace(/<p>===<\/p>(\s*<[^>]+)(>)/g, '<!-- more -->$1 id="more"$2')
      .replace(/( id="[^"]+")( id=")/g, '$2')
      .replace(/(<h1.+?<\/h1>)/, '') // Remove title, will be put into meta.Title
      .replace(/(<\/?h)(\d)/g, function(all, tag, number) {
        // Decrement headlines, so h2, will be h3
        return tag + (Number(number)+1);
      })
      .replace(/\/\/youtu\.be\/([a-zA-Z0-9\-_]+)/g, '//www.youtube.com/watch?v=$1')
      .replace(/(<p(?:\s[^>]+)?>)\s*(<a[^>]+?>[^<]+?<\/a>)\s*(<\/p>)/g, function(all, before, inline) { // after
        return inline
          .replace(
            /(?:<a)?[^>]*?youtube.+v=([a-zA-Z0-9\-_]+)[^>]*?(?:>(.+?)<\/a>)/g,
            '<div class="video-player video-player--youtube"><iframe allowfullscreen="allowfullscreen" src="https://www.youtube-nocookie.com/embed/$1?enablejsapi=1" scrolling="no"></iframe><!-- img src="https://img.youtube.com/vi/$1/hqdefault.jpg" --></div>'
          )
          .replace(
            /(?:<a)?[^>]*?vimeo.com\/(\d+)[^>]*?(?:>(.+?)<\/a>)/g,
            '<div class="video-player video-player--vimeo"><iframe allowfullscreen="allowfullscreen" src="https://player.vimeo.com/video/$1" scrolling="no"></iframe></div>'
          )
          .replace(
            /(?:<a)?[^>]*?giphy.com\/gifs\/[^"]+\-([a-zA-Z0-9]+)[^>]*?(?:>(.+?)<\/a>)/g,
            '<img src="https://i.giphy.com/$1.gif" alt="" />'
          )
          .replace(
            /(?:<a)?[^>]*?codepen\.io\/([a-zA-Z0-9\-_]+)\/pen\/([a-zA-Z0-9\-_]+)[^>]*?(?:>(.+?)<\/a>)/g,
            '<div class="embed embed--codepen"><iframe allowfullscreen="allowfullscreen" src="//codepen.io/$1/embed/$2/?height=265&amp;theme-id=0&amp;default-tab=result&amp;embed-version=2" height="265" scrolling="no"></iframe></div>'
          )
        ;
      })
      .replace(/(<img[^>]+src="[^"]+\-(\d+)x(\d+)\.[^"]+")/g, '$1 width="$2" height="$3"')
      .replace(/(<)img([^>]src="[^"]+\.(mp[234g]|webm|og[gamv])(?:#[^"]*)?"+[^>]*?)\s*\/?>/, function(all, first, last, suffix) {
        var tag = suffix.match(/^(?:mp[24g]|webm|og[gmv])$/) ? 'video' : 'audio';
        all = first + tag + last + ' controls="controls"></' + tag + '>';
        return all.replace(/\salt="([^"]*)"([^>]*>)/, '$2$1');
      })
      .replace(/(<(?:img|hr|br)[^>]*[^/])(>)/g, '$1 /$2')
      .replace(/(<p(?:\s[^>]+)?>)\s*(<video[^>]+>\s*<\/video>)\s*<\/p>/g, '<div class="video-player video-player--html5">$2</div>')
      .replace(/(>)\[ \](\s)/g, '$1<input type="checkbox" />$2')
      .replace(/(>)\[[xX]\](\s)/g, '$1<input type="checkbox" checked="checked" />$2')
      .replace(/(<li)(><input type="checkbox")/g, '$1 class="task-list__item"$2')
      .replace(/(<table[^>]*>)([\s\S]+?)(\/table)/g, function(all, before, content, after) {
        return before + content.replace(/(<tr[^>]*>[\s]*)<td([^>]*>)<strong>(.+?)<\/strong><\/td>/g, '$1<th scope="row"$2$3</th>') + after;
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
