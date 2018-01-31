'use strict';

/**
 * Returns a geoJson object. See http://geojson.org/
 * @see  https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0
 * @see  https://tools.ietf.org/html/rfc7946
 * @constructor
 * @param  {Array}  index [description]
 * @return {Object}       [description]
 */
const geoJson = function(index) {
  return {
    type: 'FeatureCollection',
    features: index.map(function(item){
      return {
        type: 'Feature',
        id: item.meta.Id || item.meta.AbsoluteUrl,
        properties: {
          title: item.meta.Title,
          description: item.meta.Description,
          link: item.meta.AbsoluteUrl,
          "marker-symbol": item.meta.Marker || "marker",
          pubDate: item.meta.Created.rfc,
          categories: item.meta.Keywords || []
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
