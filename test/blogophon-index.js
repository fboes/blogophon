exports.testGeneralFunctionality = function(test) {
  'use strict';
  //test.expect(2);

  var index = require('../src/blogophon-index');

  test.ok(index());

  //test.throws(function() {translations('xx');}, Error);
  //test.throws(function() {translations('de').getString('xx');}, Error);

  test.done();
};
