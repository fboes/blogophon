exports.testGeneralFunctionality = function(test) {
  'use strict';
  //test.expect(2);

  var Index = require('../src/index');

  test.ok(new Index());

  //test.throws(function() {translations('xx');}, Error);
  //test.throws(function() {translations('de').getString('xx');}, Error);

  test.done();
};
