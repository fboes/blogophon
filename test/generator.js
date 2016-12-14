'use strict';

exports.testCompilability = function(test) {
  //test.expect(2);

  var generator = require('../src/generator');

  test.throws(function() {
    generator();
  }, Error);

  test.done();
};
