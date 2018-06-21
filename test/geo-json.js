'use strict';

const assert = require('assert');

describe('GeoJson', function() {
  const config = require('../lib/config');
  const item = {
    htmlTeaser: 1,
    meta: {
      AbsoluteUrl: 2,
      Title: 3,
      Created: new Date('2017-05-18'),
      tags: [6, 7],
      Longitude: 8,
      Latitude: 9
    }
  };
  const geojson = require('../lib/models/geo-json')([item], new Date(), config);

  it('should have basic properties', function() {
    assert.ok(geojson.type !== undefined);
    assert.ok(geojson.features !== undefined);
    assert.ok(geojson.features[0] !== undefined);
    assert.ok(geojson.features[0].properties !== undefined);
    assert.ok(geojson.features[0].properties.title !== undefined);
  });
  it('should have a geometry with coordinates', function() {
    assert.ok(geojson.features[0].geometry !== undefined);
    assert.ok(geojson.features[0].geometry.type !== undefined);
    assert.ok(geojson.features[0].geometry.coordinates !== undefined);
    assert.ok(geojson.features[0].geometry.coordinates[0] === 8);
    assert.ok(geojson.features[0].geometry.coordinates[1] === 9);
  });
});
