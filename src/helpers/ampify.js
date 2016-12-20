'use strict';

var ampify = function() {
  var external = {};

  /**
   * Convert regular HTML in AMP-HTML.
   * @see    https://www.ampproject.org/
   * @param  {String} html [description]
   * @return {String}      [description]
   */
  external.ampifyHtml = function(html) {
    return html
      .replace(/(<\/?)(img|video|audio|iframe)/g, '$1amp-$2')
      .replace(/(<amp-img[^>]+?)\s?\/>/g, '$1></amp-img>')
      .replace(/(<amp-(?:video|iframe|audio|img).+?>).*(<\/amp-(?:video|iframe|audio|img))/g, '$1$2')
      .replace(/(<amp-(?:video|iframe|audio|img))/g, '$1 layout="responsive"')
      .replace(/(<amp-(?:video|iframe|audio)[^>]+) allowfullscreen=".+?"/g, '$1')
      .replace(/(<amp-img[^>]+src="[^"]+[^\d](\d+)x(\d+)\.[a-z]+")/g, '$1 width="$2" height="$3"')
      .replace(/(<amp-(?:video|iframe))/g, '$1 width="640" height="360"')
      .replace(/(<amp-(?:audio))/g, '$1 width="640" height="60"')
      .replace(/<amp-iframe([^>]*) src="https:\/\/www.youtube[^\.]*.com\/embed\/(.+?)\?enablejsapi=1"([^>]*)>(.*?)<\/amp-iframe>/g, '<amp-youtube$1 data-videoid="$2"$3></amp-youtube>')
      .replace(/( style=".+?")/g, '')
    ;
  };

  return external;
};

module.exports = ampify;
