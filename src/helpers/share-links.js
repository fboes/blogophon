'use strict';

/**
 * Generate object of share links.
 * @param  {String} title       [description]
 * @param  {String} link        [description]
 * @param  {String} description Optional, defaults to `title`
 * @param  {String} siteName    Optional, defaults to `title`
 * @param  {String} image       Optional: Absolute image url
 * @return {Object} [description]
 */
const shareLinks = function(title, link, description, siteName, image) {
  if (!link) {
    throw new Error('Missing required URL for share link');
  }
  title       = title       || '';
  description = description || title;
  siteName    = siteName    || title;

  let urlParameter = function(paramObject) {
    let param = [];
    for (let key in paramObject) {
      param.push(key + '=' + encodeURIComponent(paramObject[key]));
    }
    return param.join('&');
  };

  return {
    facebook: 'https://www.facebook.com/sharer.php?u='+encodeURIComponent(link),
    gplus:    'https://plus.google.com/share?link='+encodeURIComponent(link),
    xing:     'https://www.xing.com/spi/shares/new?url='+encodeURIComponent(link),
    twitter:  'https://twitter.com/intent/tweet?' + urlParameter({
      original_referer: link,
      source: 'tweetbutton',
      text: description+' '+link,
      link: link
    }),
    pinterest: (!image ? null : 'https://pinterest.com/pin/create/button/?'+urlParameter({
      url:   link,
      media: image,
      description: description
    })),
    linkedin: 'https://www.linkedin.com/shareArticle?'+urlParameter({
      mini:   'true',
      url:     link,
      title:   title,
      summary: description
    }),
    pocket: 'https://getpocket.com/save?'+urlParameter({
      url:     link,
      title:   title
    }),
    tumblr: 'https://www.tumblr.com/share/link?'+urlParameter({
      url:     link,
      name:    title,
      description: description
    }),
    wordpress: 'https://wordpress.com/press-this.php?'+urlParameter({
      u:       link,
      t:       title,
      s:       description,
      i:       image
    }),
    whatsapp: 'whatsapp://send?text=' +encodeURIComponent(title + ' [' + link + ']'),
    email:    'mailto:?'+urlParameter({
      subject: siteName,
      body: title+'\n\n'+link
    })
  };
};

module.exports = shareLinks;
