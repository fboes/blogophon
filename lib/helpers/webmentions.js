'use strict';

const url   = require('url');
const http  = require('http');
const https = require('https');
const querystring = require('querystring');

/**
 * Send Webmentions for posts
 * @see    https://www.w3.org/TR/webmention/
 * @see    https://indieweb.org/Webmention
 * @see    http://alistapart.com/article/webmentions-enabling-better-communication-on-the-internet
 * @return {Object} [description]
 */
const webmentions = function() {
  const external = {};
  const internal = {};

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
   * @return {Promise}               which fullfills when all external links have been tried
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
   * @return {Promise}                which fullfills when the external link has been tried
   */
  internal.sendMention = function(internalLink, externalLink) {
    return internal
      .discoverEndpoint(externalLink)
      .then(function(endpointUrl) {
        return internal.notifyReceiver(endpointUrl, internalLink, externalLink);
      })
      .catch(function() {
        return true;
      })
    ;
  };

  internal.discoverEndpoint = function(externalLink) {
    return new Promise(function(resolve, reject) {
      if (!externalLink) {
        reject();
      }
      const client = internal.getClient(externalLink);
      client.get(externalLink, function(response) {
        let matches = [];
        if(response.headers && response.headers.link) {
          matches = response.headers.link.match(/^.*<([^>]*)>.*rel="?webmention/);
          if (matches) {
            resolve(internal.makeCompleteUrl(externalLink, matches[1]));
          }
        }
        if (!matches || !matches[1]) {
          let body = '';
          response.on('data', function(d) {
            body += d;
          });
          response.on('end', function() {
            matches = body.match(/href="([^"]*)"[^>]+webmention/) || body.match(/webmention[^>]+href="([^"]*)"/);
            if (matches) {
              resolve(internal.makeCompleteUrl(externalLink, matches[1]));
            } else {
              reject();
            }
          });
          response.on('error', function() {
            reject();
          });
        }
      });
    });
  };

  internal.notifyReceiver = function(endpointUrl, internalLink, externalLink) {
    return new Promise(function(resolve, reject) {
      if (!endpointUrl) {
        reject();
      }

      const postData = querystring.stringify({
        source: internalLink,
        target: externalLink
      });
      const endpointUrlObj = url.parse(endpointUrl);
      endpointUrlObj.method = 'POST';
      endpointUrlObj.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      };

      const client = internal.getClient(endpointUrl);
      const request = client.request(endpointUrlObj, function(response) {
        if (response.statusCode >= 400) {
          reject();
        }
        // let body = '';
        // response.on('data', function(d) {
        //   body += d;
        // });
        // response.on('end', function() {
        //   console.log(response.statusCode);
        //   console.log(body);
        //   console.log(postData);
        // });
        request.on('error', function() {
          reject();
        });
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
      const baseUrlObj = url.parse(baseUrl);
      givenUrl = url.resolve(baseUrlObj.protocol + '//' + baseUrlObj.host, givenUrlObj.path);
    }
    return givenUrl;
  };

  return external;
};

module.exports = webmentions;


/*
Sending Webmentions
===================

Sender discovers receiver webmention endpoint
---------------------------------------------

The sender MUST fetch the target URL and check for an HTTP Link header with
rel="webmention", or a <link> or <a> element with rel="webmention". If more than
one of these is present, the first HTTP Link header takes precedence, followed
by the first <link> element, and finally the first <a> element. Clients MUST
support all three options and fall back in this order. Senders MAY initially
make an HTTP HEAD request to check for the Link header before making a GET
request.

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

The sender MUST post x-www-form-urlencoded source and target parameters to the
webmention endpoint, where source is the URL of the sender's page containing a
link, and the target is the URL of the page being linked to.

The webmention endpoint will validate and process the request, and return an
HTTP status code. Most often, 202 Accepted or 201 Created will be returned,
indicating that the request is queued and being processed asynchronously to
prevent DoS attacks. If the response code is 201, the Location header will
include a URL that can be used to monitor the status of the request.

Any 2xx response code MUST be considered a success.

  POST /webmention-endpoint HTTP/1.1
  Host: aaronpk.com
  Content-Type: application/x-www-form-urlencoded

  source=https://waterpigs.co.uk/post-by-barnaby&
  target=https://aaronpk.com/post-by-aaron

  HTTP/1.1 202 Accepted

 */
