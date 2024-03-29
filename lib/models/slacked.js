import blogophonDateFormat from '../helpers/blogophon-date-format.js';

/**
 * Return newsfeed JSON object suitable for Slack API
 * @see https://api.slack.com/docs/messages/builder
 * @constructor
 * @param  {Array}  index   [description]
 * @param  {String} pubDate [description]
 * @param  {Object} config  [description]
 * @param  {String} title   [description]
 * @return {Object}         [description]
 */
const slacked = function(index, pubDate, config, title) {
  return {
    "response_type": "ephemeral",
    "text": (config.name || '') + (title ? ' | ' + title : ''),
    "attachments":  index.map(function(item){
      return {
        "author_name": item.meta.AuthorName,
        "fallback": item.meta.Title + ' - ' + item.meta.AbsoluteUrl,
        "title": item.meta.Title,
        "title_link": item.meta.AbsoluteUrl,
        "text": item.meta.Description,
        "thumb_url": item.meta.Image,
        "footer": config.name || '',
        "ts": blogophonDateFormat(item.meta.Created, 'timestamp')
      };
    })
  };
};

export default slacked;
