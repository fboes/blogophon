const ampify = {
  /**
   * Convert regular HTML in AMP-HTML.
   * @see    https://www.ampproject.org/
   * @param  {String} html [description]
   * @return {String}      [description]
   */
  ampifyHtml(html) {
    return html
      .replace(/(<\/?)(img|video|audio|iframe)/g, '$1amp-$2')
      .replace(/(<amp-img[^>]+?)(?:\s?\/)?>/g, '$1></amp-img>')
      .replace(/(<amp-(?:video|iframe|audio|img).+?>).*?(<\/amp-(?:video|iframe|audio|img))/g, '$1$2')
      .replace(/(<amp-(?:video|iframe|audio|img|twitter))/g, '$1 layout="responsive"')
      .replace(/(<amp-img layout=")responsive("[^>]+src="[^"]+\.svg)/g, '$1intrinsic$2')
      .replace(/(<amp-(?:video|iframe|twitter))/g, '$1 width="640" height="360"')
      .replace(/(<amp-(?:audio))/g, '$1 width="640" height="60"')
      .replace(/<amp-iframe([^>]*) src="https:\/\/www.youtube[^.]*.com\/embed\/(.+?)\?enablejsapi=1"([^>]*)><\/amp-iframe>/g, '<amp-youtube$1 data-videoid="$2"$3></amp-youtube>')
      .replace(/<amp-iframe([^>]*) src="https:\/\/player\.vimeo\.com\/video\/(.+?)"([^>]*)>(.*?)<\/amp-iframe>/g, '<amp-vimeo$1 data-videoid="$2"$3></amp-vimeo>')
      .replace(/( (height)="[^"]*")([^>]* \2="[^"]*")/g, '$3')
      .replace(/( (width)="[^"]*")([^>]* \2="[^"]*")/g, '$3')
      .replace(/(<amp-(?:video|audio|youtube|vimeo)[^>]+) allowfullscreen=".+?"/g, '$1')
      .replace(/<div class="gallery"[^>]*>([\s\S]+?)<\/div>/g, function(all, content) {
        let width = html.match(/width="(\d+)"/) || ['', '640'];
        let height = html.match(/height="(\d+)"/) || ['', '360'];
        content = content.replace(/<\/?a(\s[^>]+)?>/g, '');
        return '<amp-carousel width="' + width[1] + '" height="' + height[1] + '" layout="responsive" type="slides">' + content + '</amp-carousel>';
      })
      .replace(/( (?:style|srcdoc)=".+?")/g, '')
    ;
  },

  /**
   * Check if certain AMP tags are used in `html`.
   * @see    https://www.ampproject.org/
   * @param  {String} html [description]
   * @return {Object}      with properties like `hasVideo`, `hasAudio` etc.
   */
  ampifyProperties(html) {
    return {
      hasImg: html.search(/<amp-img/) >= 0,
      hasVideo: html.search(/<amp-video/) >= 0,
      hasAudio: html.search(/<amp-audio/) >= 0,
      hasIframe: html.search(/<amp-iframe/) >= 0,
      hasYoutube: html.search(/<amp-youtube/) >= 0,
      hasVimeo: html.search(/<amp-vimeo/) >= 0,
      hasCarousel: html.search(/<amp-carousel/) >= 0,
      hasTwitter: html.search(/<amp-twitter/) >= 0
    };
  },

  /**
   * Cycle trough array of posts, check if any teaser has an AMP-property
   * @param  {Array}  index of posts
   * @return {Object}       [description]
   */
  getConsolidatedProperties(index) {
    let properties = ['ampProperties', 'ampPropertiesTeaser'];
    let consolidatedProperties = {};
    index.forEach(function(post) {
      properties.forEach(function(property) {
        if (post[property]) {
          if (!consolidatedProperties[property]) {
            consolidatedProperties[property] = post[property];
          } else {
            for (let key in post[property]) {
              consolidatedProperties[property][key] |= post[property][key];
            }
          }
        }
      });
    });
    return consolidatedProperties;
  }
};

export default ampify;
