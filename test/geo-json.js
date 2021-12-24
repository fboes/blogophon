
import assert from 'assert';
import configJs from '../lib/config.js';
import geojsonJs from '../lib/models/geo-json.js';

describe('GeoJson', function() {
  const config = configJs( process.cwd() + '/test');
  const item = {
    htmlTeaser: 1,
    meta: {
      AbsoluteUrl: 2,
      Title: 3,
      Created: new Date('2017-05-18'),
      Modified: new Date('2017-05-28'),
      Tags: [6, 7],
      Longitude: 8,
      Latitude: 9,
      Description: 'Lorem ipsum'
    }
  };
  const geojson = geojsonJs([item], new Date(), config);

  it('should have basic properties', function() {
    assert.ok(geojson.type);
    assert.equal(geojson.features.length, 1);
    assert.ok(geojson.features[0]);
    assert.ok(geojson.features[0].properties);
    assert.ok(geojson.features[0].properties.title);
    assert.ok(geojson.features[0].properties.summary);
  });
  it('should have proper dates', function() {
    assert.ok(geojson.features[0].properties.date_published.match(/^2017-05-18T/));
    assert.ok(geojson.features[0].properties.date_modified.match(/^2017-05-28T/));
  });
  it('should have a geometry with coordinates', function() {
    assert.ok(geojson.features[0].geometry !== undefined);
    assert.ok(geojson.features[0].geometry.type !== undefined);
    assert.ok(geojson.features[0].geometry.coordinates !== undefined);
    assert.ok(geojson.features[0].geometry.coordinates[0] === 8);
    assert.ok(geojson.features[0].geometry.coordinates[1] === 9);
  });
});
