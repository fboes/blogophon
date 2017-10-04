'use strict';

exports.testGeneralFunctionality = function(test) {
  test.expect(1);

  const index = require('../src/blogophon-index');

  test.ok(index(), 'Index does compile');

  test.done();
};
