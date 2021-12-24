
// Blogophon internal
import trackReplace from '../helpers/track-replace.js';
import blogophonDateFormat from '../helpers/blogophon-date-format.js';

/**
 * Returns RSS as a javascript object.
 * @constructor
 * @param  {Array}  index   [description]
 * @param  {String} pubDate [description]
 * @param  {Object} config  [description]
 * @param  {String} title   [description]
 * @param  {String} feedUrl [description]
 * @return {Object}         [description]
 */
const jsonRss = function(index, pubDate, config, title, feedUrl) {
  return {
    version: "2.0",
    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
      content: "http://purl.org/rss/1.0/modules/content/",
      georss: "http://www.georss.org/georss",
      gml: "http://www.opengis.net/gml"
    },
    channel: {
      title: (config.name || '') + (title ? ' | ' + title : ''),
      link: config.baseUrl + config.basePath,
      description: config.description || '',
      language: config.locale.language,
      copyright: config.copyright || undefined,
      atom_link: {
        href: feedUrl,
        rel: 'self',
        type: 'application/rss+json'
      },
      lastBuildDate: blogophonDateFormat(pubDate, 'rfc2822'),
      atom_updated: blogophonDateFormat(pubDate, 'rfc3339'),
      generator: config.generator,
      image: (!config.themeConf.icon128 || !config.themeConf.icon128.src) ? undefined : {
        url: config.themeConf.icon128.src,
        title: config.name,
        link: config.absoluteBasePath
      },
      items: index.map(function(item){
        let returnItem = {
          title: item.meta.Title,
          description: item.safeHtmlTeaser || item.htmlTeaser,
          content_encoded: item.safeHtml || item.html,
          link: item.meta.AbsoluteLink || item.meta.AbsoluteUrl,
          pubDate: blogophonDateFormat(item.meta.Created, 'rfc2822'),
          atom_published: blogophonDateFormat(item.meta.Created, 'rfc3339'),
          atom_updated: item.meta.Modified ? blogophonDateFormat(item.meta.Modified, 'rfc3339') : null,
          guid: item.meta.Id || item.meta.AbsoluteUrl,
          author: item.meta.AuthorEmail + ' (' + item.meta.AuthorName + ')'
        };

        if (config.htmlAnalyticsFeed) {
          returnItem.content_encoded += trackReplace(
            config.htmlAnalyticsFeed,
            item.meta.AbsoluteUrl,
            item.meta.Title
          );
        }

        if (item.meta.Keywords) {
          returnItem.categories = item.meta.Keywords;
        }

        if (item.meta.Latitude || item.meta.Longitude) {
          returnItem.georss_point = item.meta.Latitude + ' ' + item.meta.Longitude;
        }

        if (item.meta.Enclosure) {
          returnItem.enclosure = item.meta.Enclosure.map(function(t){
            return t;
          });
        }

        return returnItem;
      })
    }
  };
};

export default jsonRss;
