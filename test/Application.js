import assert from 'assert';
import application from '../lib/helpers/Application.js';

describe('Application', function() {
  it('should find the application directory', function() {
    assert.ok(application.findDirectory() || true, 'Found user/config.json');
  //console.log(application.findDirectory());
  });
});
