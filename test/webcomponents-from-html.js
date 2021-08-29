'use strict';

const assert                = require('assert');
const WebcomponentsFromHtml = require('../lib/helpers/webcomponents-from-html.js');

describe('WebcomponentsFromHtml', function() {
  const testCase = `<div>
  <h1>Test Case</h1>
  <p>Testing finding Web Components</p>
  <easy-component>Like this</easy-component>
  <complex-component test="true"></complex-component>
</div>`;

  const config = {
    componentScripts: {
      "easy-component": "https://example.com/easy-component.js",
      "complex-component": "https://example.com/complex-component.js",
      "unused-component": "https://example.com/unused-component.js",
      "ping-pong": "https://www.example.com/ping-pong.js"
    }
  };

  it('should find Web Components in HTML', function() {
    let components = WebcomponentsFromHtml.findComponents(testCase);
    assert.strictEqual(components.length, 2);
    assert.strictEqual(components[0], 'easy-component');
    assert.strictEqual(components[1], 'complex-component');
  });

  it('should have JavaScript URLs for components', function() {
    let scripts = WebcomponentsFromHtml.getScripts(WebcomponentsFromHtml.findComponents(testCase), {});
    assert.strictEqual(Object.keys(scripts).length, 0);

    scripts = WebcomponentsFromHtml.getScripts(WebcomponentsFromHtml.findComponents(testCase), config);
    assert.strictEqual(Object.keys(scripts).length, 2);
    assert.strictEqual(scripts['easy-component'], 'https://example.com/easy-component.js');
    assert.strictEqual(scripts['complex-component'], 'https://example.com/complex-component.js');
  });

  it('should also consolidate properties', function() {
    let post = {
      html: `<div>
  <h1>Test Case</h1>
  <p>Testing finding Web Components</p>
  <easy-component>Like this</easy-component>
</div>`,
      ampHtml: `<div>
  <h1>Test Case</h1>
  <p>Testing finding Web Components</p>
  <ping-pong test="true"></ping-pong>
</div>`
    };

    post.componentScripts = {
      html:  WebcomponentsFromHtml.getScripts(WebcomponentsFromHtml.findComponents(post.html), config),
      ampHtml:  WebcomponentsFromHtml.getScripts(WebcomponentsFromHtml.findComponents(post.ampHtml), config)
    };
    let index = [
      post, post, []
    ];

    let scripts = WebcomponentsFromHtml.getConsolidatedComponentScripts(index);

    assert.ok(scripts.html);
    assert.strictEqual(Object.keys(scripts.html).length, 1);
    assert.strictEqual(scripts.html['easy-component'], 'https://example.com/easy-component.js');
    assert.ok(scripts.ampHtml);
    assert.strictEqual(Object.keys(scripts.ampHtml).length, 1);
    assert.strictEqual(scripts.ampHtml['ping-pong'], 'https://www.example.com/ping-pong.js');
  });
});
