var MarkyMark = require('../src/helpers/marky-mark');

exports.testSimpleString = function(test) {
  'use strict';
  //test.expect(5);

  var m = new MarkyMark('<a href="test">Test 12x24</a> - &quot;Test&quot;');
  //console.log(m.toString());
  test.ok(m.toString() !== undefined);

  test.done();
};

exports.testConfigProperties = function(test) {
  'use strict';
  //test.expect(5);

  var m = new MarkyMark('<p id="more">Mein Anwendungsfall: Ich warte auf eine bestimmte Anzahl von Events, und löse mein eigenes Event aus, wenn alle meine Sub-Events erfolgreich abgeschlossen haben. Bisher sah das so aus (schon mit der Kraft von <a href="/posts/nodejs-pattern-array-foreach/"><code>Array.forEach</code></a>):</p>  <pre><code class="lang-javascript">  var files = [\'a.txt\',\'b.txt\',\'c.txt\'];  var processed = 0;  var checkProcessed  = function(err) {    if (err) {      console.log("Error!");    }    if (++processed === files.length) {      console.log("Done!");    }  };  files.forEach(function(file) {    fs.writeFile(file, "Test test test", checkProcessed);  }); // Comment  </code></pre>');
  //console.log(m.toString());
  test.ok(m.toString() !== undefined);

  test.done();
};
