'use strict';

/**
 * Send Webmentions for posts
 * @see    http://alistapart.com/article/webmentions-enabling-better-communication-on-the-internet
 * @return {Object} [description]
 */
const webmentions = function() {
  const external = {};
  const internal = {};

  /**
   * Send Webmentions to all external URLs found in article
   * @param  {Post}   post [description]
   * @return {Promise}      of external URLs informed
   */
  external.findAndSendMentions = function(post) {
    return external.sendMentions(post.meta.AbsoluteUrl, external.findExternalLinks(post));
  };

  /**
   * [findExternalLinks description]
   * @param  {Post}  post [description]
   * @return {Array}      [description]
   */
  external.findExternalLinks = function(post) {
    let externalUrls = [];
    if (post.meta && post.meta.hasExternalLink && post.meta.Link && internal.isExternalUrl(post.meta.Link)) {
      externalUrls.push(post.meta.Link);
    }
    if (post.html) {
      const links = post.html.match(/href="(https?:\/\/[^"]+)"/) || [];
      links.forEach(function(all, index) {
        if (index >= 1) {
          externalUrls.push(all);
        }
      });
    }
    externalUrls = externalUrls.filter(function(value, index, self) {
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
    return url.match(/^https?:\/\//);
  };

  /**
   * Send mentions for multiple external links, originating from one single internal link.
   * @param  {String}  internalLink  [description]
   * @param  {Array}   externalLinks [description]
   * @return {Promise}               [description]
   */
  external.sendMentions = function(internalLink, externalLinks) {
    if (!Array.isArray(externalLinks)) {
      externalLinks = [externalLinks];
    }
    const promises = externalLinks.map(function(externalLink) {
      return internal.sendMention(internalLink, externalLink);
    });
    return Promise.all(promises);
  };

  /**
   * Send a single mention from an internal link to an external link.
   * @param  {String}    internalLink [description]
   * @param  {String}    externalLink [description]
   * @return {[Promise]}              [description]
   */
  internal.sendMention = function(internalLink, externalLink) {
    return internal
      .discoverEndpoint(externalLink)
      .then(function(endpointUrl) {
        return internal.notifyReceiver(endpointUrl, internalLink);
      })
    ;
  };

  internal.discoverEndpoint = function(externalLink) {
    return new Promise(function(resolve, reject) {
      if (!externalLink) {
        reject();
      }
      // TODO: Here goes the logic of calling
      resolve('ENDPOINT-URL for ' + externalLink);
    });
  };

  internal.notifyReceiver = function(endpointUrl, internalLink) {
    return new Promise(function(resolve, reject) {
      if (!endpointUrl) {
        reject();
      }
      console.log([endpointUrl, internalLink]);
      // TODO: Here goes the logic of calling
      resolve(1);
    });
  };

  return external;
};

module.exports = webmentions;


/*
Sending Webmentions
===================

Sender discovers receiver webmention endpoint
---------------------------------------------

The sender MUST fetch the target URL and check for an HTTP Link header with rel="webmention", or a <link> or <a> element with rel="webmention". If more than one of these is present, the first HTTP Link header takes precedence, followed by the first <link> element, and finally the first <a> element. Clients MUST support all three options and fall back in this order. Senders MAY initially make an HTTP HEAD request to check for the Link header before making a GET request.

  GET /post-by-aaron HTTP/1.1
  Host: aaronpk.com

  HTTP/1.1 200 OK
  Link: <http://aaronpk.com/webmention-endpoint>; rel="webmention"

  <html>
  <head>
  ...
  <link href="http://aaronpk.com/webmention-endpoint" rel="webmention" />
  ...
  </head>
  <body>
  ....
  <a href="http://aaronpk.com/webmention-endpoint" rel="webmention" />
  ...
  </body>
  </html>

Sender notifies receiver
------------------------

The sender MUST post x-www-form-urlencoded source and target parameters to the webmention endpoint, where source is the URL of the sender's page containing a link, and the target is the URL of the page being linked to.

The webmention endpoint will validate and process the request, and return an HTTP status code. Most often, 202 Accepted or 201 Created will be returned, indicating that the request is queued and being processed asynchronously to prevent DoS attacks. If the response code is 201, the Location header will include a URL that can be used to monitor the status of the request.

Any 2xx response code MUST be considered a success.

  POST /webmention-endpoint HTTP/1.1
  Host: aaronpk.com
  Content-Type: application/x-www-form-urlencoded

  source=https://waterpigs.co.uk/post-by-barnaby&
  target=https://aaronpk.com/post-by-aaron

  HTTP/1.1 202 Accepted

 */
