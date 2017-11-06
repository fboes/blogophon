'use strict';

/**
 * Convert ASCII smileys into proper UTF-8 Emoji characters
 * @constructor
 * @param  {String}  string Input HTML
 * @param  {Boolean} returnPlain Set to `true` if you do not want extra HTML output.
 * @return {String}  Converted HTML
 */
const emojiConvert = function(string, returnPlain) {
  const entityMap = {
    ':)': '\u1F60A',
    ':o)': '\u1F921',
    ':))': '\u1F602',
    ':D': '\u1F604',
    ';)': '\u1F609',
    'B)': '\u1F60E',
    ':P': '\u1F60B',
    'xP': '\u1F61D',
    ':*': '\u1F618',
    ':O': '\u1F632',
    ':|': '\u1F610',
    ':?': '\u1F914',
    ':/': '\u1F612',
    'xO': '\u1F635',
    ':(': '\u1F629',
    ":'(": '\u1F622',
    ";(": '\u1F622',
    ':@': '\u1F620',
    ':$': '\u1F633',
    '8O': '\u1F628',
    '\\o/': '\u1F64C',
    '8<': '\u2702',
    ':+1:': '\u1F44D',
    ':-1:': '\u1F44E',
    '&lt;3': '\u2764',
    '&lt;/3': '\u1F494',
    '(!)': '\u26A0'
  };
  return string.replace(
    /(\W|^)(:(?:'?\(|\)\)|[)|/DPO*?@$])|:o\)|[;B]\)|;\(|x[PO]|\\o\/|8[o<]|:[+-]1:|&lt;\?3|\(!\))(\W|$)/g,
    function(all, before, s, after) {
      let codePoint = entityMap[s].codePointAt(0).toString(16);
      return (returnPlain)
        ? before + entityMap[s] + after
        : before + '<span class="emoji emoji--' + codePoint + '" title="' + s + '">&#x' + codePoint.toUpperCase() + ';</span>' + after;
    }
  );
};

module.exports = emojiConvert;
