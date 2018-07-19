'use strict';

const blogophonDateFormat = require('../helpers/blogophon-date-format');

/**
 * Returns a geoJson object. See http://geojson.org/
 * @see  https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0
 * @see  https://tools.ietf.org/html/rfc7946
 * @see  https://jsonfeed.org/
 * @constructor
 * @param  {Array}  index [description]
 * @return {Object}       [description]
 */
const geoJson = function(index) {
  return {
    type: 'FeatureCollection',
    features: index.map(function(post){
      return {
        type: 'Feature',
        id: post.meta.Id || post.meta.AbsoluteUrl,
        properties: {
          url: post.meta.AbsoluteUrl,
          title: post.meta.Title,
          summary: post.meta.Description || '',
          date_published: blogophonDateFormat(post.meta.Created, 'rfc3339'),
          date_modified: post.meta.Modified ? blogophonDateFormat(post.meta.Modified, 'rfc3339') : null,
          tags: !post.meta.Tags ? [] : post.meta.Tags.map(function(t){
            return t.title;
          }),
          "marker-symbol": post.meta.Marker || "marker"
        },
        geometry: {
          type: 'Point',
          coordinates: [
            post.meta.Longitude, post.meta.Latitude
          ]
        }
      };
    })
  };
};

module.exports = geoJson;
