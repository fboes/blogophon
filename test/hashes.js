'use strict';

const hashes = require('../lib/models/hashes')('test.json');

exports.testHashesFunctionality = function testHashesFunctionality(test) {
  test.expect(6);

  test.ok(hashes, 'Hashes loaded on empty file');
  test.ok(!hashes.matchesHash('Test Key', 'Test Hash'), 'No hash present');
  test.ok(hashes.update('Test Key', 'Test Hash'),       'Setting hash');
  test.ok(hashes.matchesHash('Test Key', 'Test Hash'),  'Hash matches after being set');
  test.ok(!hashes.update('Test Key', 'Test Hash'),      'No further update required setting hash');
  test.ok(hashes.getUpdatedHashes(),                    'Updatable keys found');

  test.done();
};
