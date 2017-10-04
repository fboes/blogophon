'use strict';

exports.testCompilability = function(test) {
  //test.expect(2);

  const generator = require('../src/generator');

  test.throws(function() {
    generator();
  }, Error);

  test.done();
};
