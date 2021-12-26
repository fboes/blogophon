import assert from 'assert';
import configJs from '../lib/config.js';
import manifestJs from '../lib/models/manifest.js';

describe('Manifest', function() {
  const config = configJs( process.cwd() + '/test');
  config.themeConf.icons = [
    {
      "src": "https://cdn.3960.org/favicon-16x16.png",
      "sizes": "16x16",
      "type": "image/png"
    },
    {
      "src": "https://cdn.3960.org/favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "https://cdn.3960.org/images/tile-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "https://cdn.3960.org/apple-touch-icon-180x180.png",
      "sizes": "180x180",
      "type": "image/png"
    },
    {
      "src": "img/favicon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "img/favicon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "https://cdn.3960.org/images/tile-270x270.png",
      "sizes": "270x270",
      "type": "image/png"
    },
    {
      "src": "https://cdn.3960.org/images/tile-558x270.png",
      "sizes": "558x270",
      "type": "image/png"
    },
    {
      "src": config.baseUrl + "/images/tile-558x558.png",
      "sizes": "558x558",
      "type": "image/png"
    },
    {
      "src": "https://cdn.3960.org/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ];
  const manifest = manifestJs(config);
  // console.log(manifest);

  it('should have basic properties', function() {
    assert.ok(manifest.lang !== undefined,        'Language is defined');
    assert.ok(manifest.name !== undefined,        'Name is defined');
    assert.ok(manifest.short_name !== undefined,  'Short name is defined');
    assert.ok(manifest.short_name.length <= 12,   'Short name should be short');
    assert.ok(manifest.description !== undefined, 'Description is defined');
    assert.ok(manifest.theme_color !== undefined, 'Theme color is defined');
    assert.ok(manifest.start_url !== undefined,   'Start URL is defined');
    assert.ok(manifest.icons !== undefined,       'Icons are defined');
    assert.strictEqual(manifest.icons.length, 3);
  });

  it('should have extra properties', function() {
    assert.ok(manifest.orientation !== undefined, 'orientation is defined');
    assert.ok(manifest.display !== undefined,     'display is defined');
  });
});
