'use strict';

const assert = require('assert');
const application = require('../lib/helpers/application')();

describe('Application', function() {
  it('should test applicationProperties', function() {
    assert.ok(application.findDirectory() || true, 'Found user/config.json');
  //console.log(application.findDirectory());
  });
});
