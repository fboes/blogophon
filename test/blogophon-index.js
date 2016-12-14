'use strict';

exports.testGeneralFunctionality = function(test) {
  //test.expect(2);

  var index = require('../src/blogophon-index');

  test.ok(index(), 'Index does compile');

  //test.throws(function() {translations('xx');}, Error);
  //test.throws(function() {translations('de').getString('xx');}, Error);

  test.done();
};
