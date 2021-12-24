
/**
 * Add url-encoded parameters to first string
 * @param  {String} html  [description]
 * @param  {String} url   [description]
 * @param  {String} title [description]
 * @return {String}       [description]
 */
const trackReplace = function(html, url = '', title = '') {
  if (html) {
    return html.replace(/%(?:url|title)/g, function(all) {
      return all
        .replace(/%url/g, encodeURIComponent(url || ''))
        .replace(/%title/g, encodeURIComponent(title || ''))
      ;
    });
  }
};

export default trackReplace;
