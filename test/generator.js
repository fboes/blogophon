'use strict';

exports.testCompilability = function(test) {
  //test.expect(2);

  const generator = require('../lib/generator');

  test.throws(function() {
    generator();
  }, Error);

  test.done();
};
