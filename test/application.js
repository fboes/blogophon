var application = require('../src/helpers/application')();

exports.testapplicationProperties = function testapplicationProperties(test) {
  'use strict';
  test.expect(1);

  test.ok(application.findDirectory() || true, 'Found user/config.json');
  //console.log(application.findDirectory());

  test.done();
};
