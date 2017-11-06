'use strict';

exports.testBasicProperties = function(test) {
  test.expect(10);

  const config = require('../lib/config');
  const item = {
    htmlTeaser: 1,
    meta: {
      AbsoluteUrl: 2,
      Title: 3,
      Created: {
        rfc: 4
      },
      tags: [6, 7],
      Longitude: 8,
      Latitude: 9
    }
  };
  const geojson = require('../lib/models/geo-json')([item], new Date(), config);

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
