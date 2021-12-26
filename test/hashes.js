import assert from 'assert';
import hashesJs from '../lib/models/hashes.js';

describe('Hashes', function() {
  it('should have hashes', function() {
    const hashes = hashesJs('test.json');
    assert.ok(hashes, 'Hashes loaded on empty file');
    assert.ok(!hashes.matchesHash('Test Key', 'Test Hash'), 'No hash present');
    assert.ok(hashes.update('Test Key', 'Test Hash'),       'Setting hash');
    assert.ok(hashes.matchesHash('Test Key', 'Test Hash'),  'Hash matches after being set');
    assert.ok(!hashes.update('Test Key', 'Test Hash'),      'No further update required setting hash');
    assert.ok(hashes.getUpdatedHashes(),                    'Updatable keys found');
  });
});
