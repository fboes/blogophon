/**
 * Convert ASCII smileys into proper UTF-8 Emoji characters
 * @constructor
 * @see    https://mathiasbynens.be/notes/javascript-unicode
 * @param  {String}  string Input HTML or Markdown
 * @param  {Boolean} returnPlain Set to `true` if you do not want extra HTML output.
 * @return {String}  Converted HTML or plain text
 */
const emojiConvert = function(string, returnPlain) {
  // Also supports combined characters like `\u{1F44D}\u{1F3FB}`
  const entityMap = {
    ':)': '\u{1F60A}', ':-)': '\u{1F60A}',
    ':o)': '\u{1F921}',
    ':))': '\u{1F602}', ':-))': '\u{1F602}',
    ':D': '\u{1F604}', ':-D': '\u{1F604}',
    ';)': '\u{1F609}', ';-)': '\u{1F609}',
    'B)': '\u{1F60E}', 'B-)': '\u{1F60E}',
    ':P': '\u{1F60B}', ':-P': '\u{1F60B}',
    'xP': '\u{1F61D}', 'x-P': '\u{1F61D}',
    ':*': '\u{1F618}', ':-*': '\u{1F618}',
    ':O': '\u{1F632}', ':-O': '\u{1F632}',
    ':|': '\u{1F610}', ':-|': '\u{1F610}',
    ':?': '\u{1F914}', ':-?': '\u{1F914}',
    ':/': '\u{1F612}', ':-/': '\u{1F612}',
    'xO': '\u{1F635}', 'x-O': '\u{1F635}',
    ':(': '\u{1F641}', ':-(': '\u{1F641}',
    ":'(": '\u{1F622}', ";(": '\u{1F622}',  ":'-(": '\u{1F622}', ";-(": '\u{1F622}',
    ':@': '\u{1F620}', ':-@': '\u{1F620}',
    ':$': '\u{1F633}', ':-$': '\u{1F633}',
    '8O': '\u{1F628}', '8-O': '\u{1F628}',
    '\\o/': '\u{1F64C}',
    '/o\\': '\u{1F926}',
    '8<': '\u{2702}', '8&lt;': '\u{2702}',
    ':+1:': '\u{1F44D}',
    ':-1:': '\u{1F44E}',
    ':yes:': '\u{2705}',
    ':no:': '\u{26D4}',
    '<3': '\u{2764}', '&lt;3': '\u{2764}',
    '</3': '\u{1F494}', '&lt;/3': '\u{1F494}',
    '(!)': '\u{26A0}'
  };
  return string.replace(
    /(\W|^)(:-?(?:'?\(|\)\)|[)|/DPO*?@$])|:o\)|[;B]-?\)|;-?\(|x-?[PO]|\\o\/|\/o\\|8-?o|8(?:<|&lt;)|:(?:[+-]1|yes|no):|(?:<|&lt;)\?3|\(!\))(\W|$)/g,
    function(all, before, s, after) {
      if (!entityMap[s]) {
        return before + s + after;
      } else if (returnPlain) {
        return before + entityMap[s] + after;
      }
      const codePoints = Array.from(entityMap[s]).map(function(x) {
        return x.codePointAt(0).toString(16).toUpperCase();
      });
      return before
          + '<span class="emoji'
          + ' emoji--' + codePoints.join(' emoji--').toLowerCase()
          + '" title="' + s + '">'
          + '&#x' + codePoints.join(';&#x') + ';'
          + '</span>'
          + after;

    }
  );
};

export default emojiConvert;
