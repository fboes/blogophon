exports.testCompilability = function(test) {
  'use strict';
  //test.expect(2);

  var generator = require('../src/generator');

  test.throws(function() {generator();}, Error);

  test.done();
};
