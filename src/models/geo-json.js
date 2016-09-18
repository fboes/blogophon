'use strict';

/**
 * Returns a GeoJson object. See http://geojson.org/
 * @constructor
 */
var GeoJson = function(index) {
  return {
    type: 'FeatureCollection',
    features: index.map(function(item){
      var tags = [];
      if (item.meta.Tags !== undefined) {
        tags = item.meta.Tags.map(function(t){
          return t.title;
        });
      }
      return {
        type: 'Feature',
        id: item.meta.AbsoluteUrl,
        properties: {
          title: item.meta.Title,
          description: item.safeHtmlTeaser || item.htmlTeaser,
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

module.exports = GeoJson;
