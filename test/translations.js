import assert from 'assert';
import translations from '../lib/helpers/translations.js';

describe('Translations', function() {
  it('should throw execeptions on wrong handling', function() {

    assert.throws(function() {
      translations('xx');
    }, Error);
  });

  it('should translate stuff', function() {
    // Fallback on unknown string
    assert.strictEqual(translations('ru').getString('Unknown stuntman'), 'Unknown stuntman');

    // No fallback on known string
    assert.notStrictEqual(translations('ru').getString('Home'), 'Home');

    // Ignore sub strings
    assert.strictEqual(translations('ru').getString('Home'), translations('ru-RU').getString('Home'));
  });
});
