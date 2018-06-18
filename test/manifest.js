'use strict';

const assert = require('assert');

describe('Manifest', function() {
  it('should have basic properties', function() {
    const config = require('../lib/config');
    const manifest = require('../lib/models/manifest')(config);

    // console.log(manifest);

    assert.ok(manifest.lang !== undefined,        'Language is defined');
    assert.ok(manifest.name !== undefined,        'Name is defined');
    assert.ok(manifest.description !== undefined, 'Description is defined');
    assert.ok(manifest.theme_color !== undefined, 'Theme color is defined');
    assert.ok(manifest.start_url !== undefined,   'Start URL is defined');
    assert.ok(manifest.icons !== undefined,   'Icons are defined');
  });
});
