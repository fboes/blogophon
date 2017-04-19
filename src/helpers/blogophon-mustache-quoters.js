'use strict';

var blogophonMustacheQuoters = {
  icsQuote: function() {
    return function(text, render) {
      var newText = render(text)
        .replace(/(\n|\r|\r\n)/g, "\\n")
        .replace(/(,|;)/g, '\\$1');
      if (newText.length > 30) {
        newText = newText.match(/[\s\S]{1,72}/g).join("\r\n ");
        newText = "\r\n "+newText;
      }
      return newText;
    };
  },
  ymlQuote: function() {
    return function(text, render) {
      text = render(text);
      console.log(text);
      if (text.match(/:\s/)) {
        text = "'" + text.replace(/(')/g, '\\$1') + "'";
      }
      return text;
    };
  },
  noLineBreak: function() {
    return function(text, render) {
      return render(text).replace(/\s*[\n|\r]+/g, ' ');
    };
  },
  nl2br: function() {
    return function(text, render) {
      return render(text).replace(/[\n|\r]+/g, '<br />$0');
    };
  },
  encodeURIComponent: function() {
    return function(text, render) {
      return encodeURIComponent(render(text));
    };
  }
};

module.exports = blogophonMustacheQuoters;
