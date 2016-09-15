exports.testCompilability = function(test) {
  'use strict';
  //test.expect(2);

  var Generator = require('../src/generator');

  test.throws(function() {new Generator();}, Error);

  test.done();
};
