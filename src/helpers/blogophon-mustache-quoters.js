'use strict';

var blogophonMustacheQuoters = {
  icsQuote: function () {
    return function (text, render) {
      return render(text)
        .replace(/(\n|\r|\r\n)/g, "\\n\r\n")
        .replace(/^([\s\S]{1,50}(?:\s))([\s\S]+)$/, function(all, first, last) {
          return first + "\r\n" + last.match(/[\s\S]{1,72}(\s|$)/g).join("\r\n");
        })
        .replace(/(\r\n)/g, '$1 ')
      ;
    };
  },
  noLineBreak: function () {
    return function (text, render) {
      return render(text).replace(/\s*[\n|\r]+/g, ' ');
    };
  },
  nl2br: function () {
    return function (text, render) {
      return render(text).replace(/[\n|\r]+/g, '<br />$0');
    };
  },
  encodeURIComponent: function () {
    return function (text, render) {
      return encodeURIComponent(render(text));
    };
  }
};

module.exports = blogophonMustacheQuoters;
