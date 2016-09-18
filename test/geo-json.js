exports.testBasicProperties = function(test) {
  'use strict';
  test.expect(10);

  var config = require('../src/config');
  var item = {
      htmlTeaser: 1,
      meta: {
        AbsoluteUrl: 2,
        Title: 3,
        Created: {
          rfc: 4
        },
        tags: [6,7],
        Longitude: 8,
        Latitude: 9
      }
  };
  var geojson = require('../src/models/geo-json')([item], new Date(), config);

  test.ok(geojson.type !== undefined);
  test.ok(geojson.features !== undefined);
  test.ok(geojson.features[0] !== undefined);
  test.ok(geojson.features[0].properties !== undefined);
  test.ok(geojson.features[0].properties.title !== undefined);
  test.ok(geojson.features[0].geometry !== undefined);
  test.ok(geojson.features[0].geometry.type !== undefined);
  test.ok(geojson.features[0].geometry.coordinates !== undefined);
  test.ok(geojson.features[0].geometry.coordinates[0] === 8);
  test.ok(geojson.features[0].geometry.coordinates[1] === 9);

  test.done();
};
