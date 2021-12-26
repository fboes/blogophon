import url from 'url';
import http from 'http';
import https from 'https';
import querystring from 'querystring';

/**
 * Send Webmentions for posts
 * @see    https://www.w3.org/TR/webmention/
 * @see    https://indieweb.org/Webmention
 * @see    http://alistapart.com/article/webmentions-enabling-better-communication-on-the-internet
 * @param  {Boolean} useConsole [description]
 * @param  {String}  ua         [description]
 * @param  {Object}  options    Like `blacklist`
 * @return {Object}             [description]
 */
const webmentions = function(useConsole = false, ua = 'Blogophon\'s Webmention Adapter', options = {}) {
  const external = {};
  const internal = {};

  options.blacklist = options.blacklist || /[/.](wikipedia\.org|wikia\.com|steampowered\.com|github\.com|developer\.mozilla\.org|fritz\.box|localhost)/;

  /**
   * Send Webmentions to all external URLs found in article
   * @param  {Post}   post [description]
   * @return {Promise}     like in `sendMentions`
   */
  external.findAndSendMentions = function(post) {
    return external.sendMentions(post.meta.AbsoluteUrl, external.findExternalLinks(post));
  };

  /**
   * Find all URLs pointing to external sources in post.
   * @param  {Post}  post [description]
   * @return {Array}      of URLs
   */
  external.findExternalLinks = function(post) {
    let externalUrls = [];
    if (post.meta) {
      if (post.meta.NoWebmention) {
        return externalUrls;
      }
      if (post.meta.hasExternalLink && post.meta.Link && internal.isExternalUrl(post.meta.Link)) {
        externalUrls.push(post.meta.Link);
      }
    }
    if (post.html) {
      const links = post.html.match(/<(?:a|link)[^>]+href="(https?:\/\/[^"]+)"[^>]*>/g) || [];
      links.forEach(function(all) {
        if (!all.match(/(class|rel)="[^"]*nomention/)) {
          let possibleUrl = all.replace(/^.*href="([^"]*)".*$/, '$1');
          if (internal.isExternalUrl(possibleUrl)) {
            externalUrls.push(possibleUrl);
          }
        }
      });
    }
    externalUrls = externalUrls.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
    return externalUrls;
  };

  /**
   * Check if given string is an external URL
   * @param  {String}  url [description]
   * @return {Boolean}     [description]
   */
  internal.isExternalUrl = function(url) {
    return url.match(/^https?:\/\//) && (!options.blacklist || !url.match(options.blacklist));
  };

  /**
   * Send mentions for multiple external links, originating from one single internal link.
   * @param  {String}  sourceUrl  [description]
   * @param  {Array}   targetUrls [description]
   * @return {Promise}             which fullfills when all external links have been tried
   */
  external.sendMentions = function(sourceUrl, targetUrls) {
    if (!Array.isArray(targetUrls)) {
      targetUrls = [targetUrls];
    }
    const promises = targetUrls.map(function(targetUrl) {
      return internal.sendMention(sourceUrl, targetUrl);
    });
    return Promise.all(promises);
  };

  /**
   * Send a single mention from an internal link to an external link.
   * @param  {String}  sourceUrl [description]
   * @param  {String}  targetUrl [description]
   * @return {Promise}           which fullfills when the external link has been tried
   */
  internal.sendMention = function(sourceUrl, targetUrl) {
    if (useConsole) {
      console.log('Trying to send Webmention to ' + targetUrl);
    }
    return internal
      .discoverEndpoint(targetUrl)
      .then(function(endpointUrl) {
        return internal.notifyReceiver(endpointUrl, sourceUrl, targetUrl);
      })
      .catch(function(error) {
        if (useConsole) {
          console.log('No Webmention endpoint found for ' + targetUrl);
        }
        return error;
      })
    ;
  };

  /**
   * [discoverEndpoint description]
   * @param  {String}  targetUrl  URL for which to search for endpoint URL
   * @param  {Number} loop      [description]
   * @return {Promise}            which will resolve to an endpoint URL, or
   *                              which will reject with a HTTP status code.
   *                              `400` means, no endpoint was discovered.
   */
  internal.discoverEndpoint = function(targetUrl, loop = 0) {
    return new Promise(function(resolve, reject) {
      if (!targetUrl) {
        reject();
      } else if (loop > 3) {
        reject(508); // Loop Detected
      }

      const client = internal.getClient(targetUrl);
      const targetUrlObj = url.parse(targetUrl);
      let searchBody = true;
      targetUrlObj.method  = (loop === 0) ? 'HEAD' : 'GET';
      targetUrlObj.timeout = 3500;
      targetUrlObj.headers = {
        'User-Agent': ua,
        accept: 'text/html'
      };
      loop ++;

      //console.log(targetUrlObj, loop);

      const request = client.request(targetUrlObj, function(response) {
        let matches = [];
        if (response.statusCode >= 400) {
          reject(response.statusCode);
        }
        if(response.headers) {
          if(response.headers.link) {
            matches = response.headers.link.match(/^.*<([^>]*)>.*rel="?webmention/);
            if (matches) {
              searchBody = false;
              resolve(internal.makeCompleteUrl(targetUrl, matches[1]));
            }
          } else if (response.statusCode >= 300 && response.headers.location) {
            targetUrl = url.resolve(targetUrl, response.headers.location);
            searchBody = false;
            internal.discoverEndpoint(targetUrl, loop)
              .then(resolve)
              .catch(reject)
            ;
          }
        }

        if (targetUrlObj.method === 'HEAD') {
          internal.discoverEndpoint(targetUrl, loop)
            .then(resolve)
            .catch(reject)
          ;
        } else if (searchBody) {
          let body = '';
          response
            .on('data', function(d) {
              body += d;
            })
            .on('end', function() {
              matches = body
                .replace(/<!--[\s\S]*?-->/, '')
                .match(/<(?:link|a)([^>]+rel="?(?:[^"]+ )?webmention[^>]+)>/g)
              ;
              if (matches) {
                matches.forEach(function(m) {
                  if (m.match(/href=/)) {
                    resolve(internal.makeCompleteUrl(targetUrl, m.replace(/^.*href="([^"]*)".*$/, '$1')));
                  }
                });
              }
              reject(400);
            })
            .on('timeout', function() {
              reject(408);// Request Timeout
            })
            .on('error', function() {
              reject(response.statusCode);
            })
          ;
        }
      });
      request.end();
    });
  };

  /**
   * [notifyReceiver description]
   * @param  {String} endpointUrl [description]
   * @param  {String} sourceUrl   [description]
   * @param  {String} targetUrl   [description]
   * @return {Promise}            which will resolve / reject with HTTP status
   *                              code. A status code of >= 400 will be
   *                              rejected.
   */
  internal.notifyReceiver = function(endpointUrl, sourceUrl, targetUrl) {
    return new Promise(function(resolve, reject) {
      if (!endpointUrl) {
        reject(400);
      }

      const postData = querystring.stringify({
        source: sourceUrl,
        target: targetUrl
      });
      const endpointUrlObj = url.parse(endpointUrl);
      endpointUrlObj.method  = 'POST';
      endpointUrlObj.timeout = 5000;
      endpointUrlObj.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length,
        'User-Agent': ua
      };

      const client = internal.getClient(endpointUrl);
      const request = client.request(endpointUrlObj, function(response) {
        if (response.statusCode >= 400) {
          // let body = '';
          // response.on('data', function(d) {
          //   body += d;
          // });
          // response.on('end', function() {
          //   console.log([
          //     response.statusCode,
          //     body,
          //     endpointUrl,
          //     sourceUrl,
          //     targetUrl
          //   ]);
          // });
          if (useConsole) {
            console.log('Webmention successfully sent to ' + targetUrl);
          }
          reject(response.statusCode);
        } else {
          // console.log(targetUrl);
          resolve(response.statusCode);
        }
        response
          .on('timeout', function() {
            reject(408);// Request Timeout
          })
          .on('error', function() {
            reject(response.statusCode);
          })
        ;
      });
      request.write(postData);
      request.end();
    });
  };

  /**
   * Get matching HTTP / HTTPS client, depending on procotol
   * @param  {String} url [description]
   * @return {http}   or {https}
   */
  internal.getClient = function(url) {
    return url.match(/^https:/) ? https : http;
  };

  /**
   * Fix one URL by substituting parts of other URL
   * @param  {String} baseUrl  [description]
   * @param  {String} givenUrl [description]
   * @return {String}          [description]
   */
  internal.makeCompleteUrl = function(baseUrl, givenUrl) {
    if (!givenUrl) {
      return baseUrl;
    }
    const givenUrlObj = url.parse(givenUrl, false, true);
    if (!givenUrlObj.protocol) {
      givenUrl = url.resolve(baseUrl, givenUrlObj.path);
    }
    return givenUrl;
  };

  return external;
};

export default webmentions;
