var MarkyMark = require('../src/helpers/marky-mark');

exports.testSimpleString = function(test) {
  'use strict';
  test.expect(2);

  var m;

  m = new MarkyMark('<a href="test">Test 12x24</a> - &quot;Test&quot;');
  test.ok(m.toString() !== undefined);

  m = new MarkyMark('<p>&quot;Meine vierjährige Tochter hat gesagt, dass sie sofort alle Buchstaben lernen will.&quot;</p>'+'    <p>&quot;Na, dann gib ihr mal eine <a href="http://www.fileformat.info/info/charset/UTF-8/list.htm">UTF-8-Tabelle</a>.&quot;</p>');
  //console.log(m.toString());
  test.ok(m.toString() !== undefined);
  test.done();
};

exports.testCodeHighlighting = function(test) {
  'use strict';
  test.expect(2);

  var m;

  m = new MarkyMark('<p id="more">Mein Anwendungsfall: Ich warte auf eine bestimmte Anzahl von Events, und löse mein eigenes Event aus, wenn alle meine Sub-Events erfolgreich abgeschlossen haben. Bisher sah das so aus (schon mit der Kraft von <a href="/posts/nodejs-pattern-array-foreach/"><code>Array.forEach</code></a>):</p>  <pre><code class="lang-javascript">  var files = [\'a.txt\',\'b.txt\',\'c.txt\'];  /*var processed = 0;*/  var checkProcessed  = function(err) {    if (err) {      console.log("Error!");    }    if (++processed === files.length) {      console.log("Done!");    }  };  files.forEach(function(file) {    fs.writeFile(file, "Test test test", checkProcessed);  }); // Comment  </code></pre>');
  //console.log(m.toString());
  test.ok(m.toString() !== undefined);

  m = new MarkyMark('<pre><code class="lang-html">&lt;-- Comment --&gt;&lt;a href=&quot;#&quot;&gt;Test &amp;amp; Fest&lt;/a&gt;</code></pre>');
  //console.log(m.toString());
  test.ok(m.toString() !== undefined);

  test.done();
};
