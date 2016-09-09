exports.testTranslations = function(test) {
  'use strict';
  test.expect(2);

  var Translations = require('../src/helpers/translations');

  test.throws(function() {new Translations('xx');}, Error);
  test.throws(function() {new Translations('de').getString('xx');}, Error);

  test.done();
};
