'use strict';

/**
 * Convert ASCII smileys into proper UTF-8 Emoji characters
 * @constructor
 * @see    https://mathiasbynens.be/notes/javascript-unicode
 * @param  {String}  string Input HTML
 * @param  {Boolean} returnPlain Set to `true` if you do not want extra HTML output.
 * @return {String}  Converted HTML
 */
const emojiConvert = function(string, returnPlain) {
  // Also supports combined characters like `\u{1F44D}\u{1F3FB}`
  const entityMap = {
    ':)': '\u{1F60A}',
    ':o)': '\u{1F921}',
    ':))': '\u{1F602}',
    ':D': '\u{1F604}',
    ';)': '\u{1F609}',
    'B)': '\u{1F60E}',
    ':P': '\u{1F60B}',
    'xP': '\u{1F61D}',
    ':*': '\u{1F618}',
    ':O': '\u{1F632}',
    ':|': '\u{1F610}',
    ':?': '\u{1F914}',
    ':/': '\u{1F612}',
    'xO': '\u{1F635}',
    ':(': '\u{1F629}',
    ":'(": '\u{1F622}',
    ";(": '\u{1F622}',
    ':@': '\u{1F620}',
    ':$': '\u{1F633}',
    '8O': '\u{1F628}',
    '\\o/': '\u{1F64C}',
    '8<': '\u{2702}',
    ':+1:': '\u{1F44D}',
    ':-1:': '\u{1F44E}',
    '&lt;3': '\u{2764}',
    '&lt;/3': '\u{1F494}',
    '(!)': '\u{26A0}'
  };
  return string.replace(
    /(\W|^)(:(?:'?\(|\)\)|[)|/DPO*?@$])|:o\)|[;B]\)|;\(|x[PO]|\\o\/|8[o<]|:[+-]1:|&lt;\?3|\(!\))(\W|$)/g,
    function(all, before, s, after) {
      if (!entityMap[s]) {
        return before + s + after;
      } else if (returnPlain) {
        return before + entityMap[s] + after;
      } else {
        const codePoints = Array.from(entityMap[s]).map(function(x) {
          return x.codePointAt(0).toString(16).toUpperCase();
        });
        return before
          + '<span class="emoji'
          +' emoji--' + codePoints.join(' emoji--').toLowerCase()
          + '" title="' + s + '">'
          + '&#x' + codePoints.join(';&#x') + ';'
          +'</span>'
          + after;
      }
    }
  );
};

module.exports = emojiConvert;
