exports.testTranslations = function(test) {
  'use strict';
  test.expect(3);

  var translations = require('../src/helpers/translations');

  test.throws(function() {translations('xx');}, Error);

  // Fallback on unknown string
  test.equal(translations('ru').getString('Unknown stuntman'), 'Unknown stuntman');

  // No fallback on known string
  test.ok(translations('ru').getString('Home') !== 'Home');

  test.done();
};
