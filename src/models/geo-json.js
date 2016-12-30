'use strict';

/**
 * Returns a geoJson object. See http://geojson.org/
 * @see  https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0
 * @constructor
 * @param  {Array}  index [description]
 * @return {Object}       [description]
 */
var geoJson = function(index) {
  return {
    type: 'FeatureCollection',
    features: index.map(function(item){
      var tags = [];
      if (item.meta.Tags) {
        tags = item.meta.Tags.map(function(t){
          return t.title;
        });
      }
      return {
        type: 'Feature',
        id: item.meta.Id || item.meta.AbsoluteUrl,
        properties: {
          title: item.meta.Title,
          description: item.meta.Description,
          link: item.meta.AbsoluteUrl,
          pubDate: item.meta.Created.rfc,
          categories: tags
        },
        geometry: {
          type: 'Point',
          coordinates: [
            item.meta.Longitude, item.meta.Latitude
          ]
        }
      };
    })
  };
};

module.exports = geoJson;
