exports.testTranslations = function(test) {
  'use strict';
  test.expect(2);

  var translations = require('../src/helpers/translations');

  test.throws(function() {translations('xx');}, Error);
  test.throws(function() {translations('de').getString('xx');}, Error);

  test.done();
};
