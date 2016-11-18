var markyMark = require('../src/helpers/marky-mark');

exports.testSimpleString = function(test) {
  'use strict';
  test.expect(2);

  var m;

  m = markyMark('<a href="test">Test 12x24</a> - &quot;Test&quot;');
  test.ok(m !== undefined);

  m = markyMark(
    '<p>&quot;Meine vierjährige Tochter hat gesagt, dass sie sofort alle Buchstaben lernen will.&quot;</p>'+
    '<p>&quot;Na, dann gib ihr mal eine <a href="http://www.fileformat.info/info/charset/UTF-8/list.htm">UTF-8-Tabelle</a>.&quot;</p>'
  );
  console.log(m);
  test.ok(m !== undefined);
  test.done();
};

exports.testCodeHighlighting = function(test) {
  'use strict';
  test.expect(6);

  var m;

  m = markyMark('<p id="more">Mein Anwendungsfall: Ich warte auf eine bestimmte Anzahl von Events, und löse mein eigenes Event aus, wenn alle meine Sub-Events erfolgreich abgeschlossen haben. Bisher sah das so aus (schon mit der Kraft von <a href="/posts/nodejs-pattern-array-foreach/"><code>Array.forEach</code></a>):</p>  <pre><code class="lang-javascript">  var files = [\'a.txt\',\'b.txt\',\'c.txt\'];  /*var processed = 0;*/  var checkProcessed  = function(err) {    if (err) {      console.log("Error!");    }    if (++processed === files.length) {      console.log("Done!");    }  };  files.forEach(function(file) {    fs.writeFile(file, "Test test test", checkProcessed);  }); // Comment  </code></pre>');
  test.ok(m !== undefined);
  test.ok(m.match(/<i class/));

  m = markyMark('<pre><code class="lang-html">&lt;-- Comment --&gt;&lt;a href=&quot;#&quot;&gt;Test &amp;amp; Fest&lt;/a&gt;</code></pre>');
  test.ok(m !== undefined);
  test.ok(m.match(/<i class/));

  m = markyMark('<pre><code class="lang-markdown">'+
     "H1\n=====\n\nH2\n-----\n\n[Links](#) with some *italic* and **bold** text.\n\n### Headline\n"+
    '</code></pre>'
  );
  //console.log(m);
  test.ok(m !== undefined);
  test.ok(m.match(/<i class/));

  test.done();
};

exports.testDiffing = function(test) {
  'use strict';

  test.expect(3);

  var m;

  m = markyMark(
    '<pre><code class="lang-javascript">'+
    "\n- var test = 1;"+
    "\n+ var test = 2;"+
    "\n</code></pre>"
  );
  //console.log(m);
  test.ok(m !== undefined);
  test.ok(m.match(/<ins>/));
  test.ok(m.match(/<del>/));

  test.done();
};
