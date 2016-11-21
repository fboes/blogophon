var markyMark = require('../src/helpers/marky-mark');

exports.testSimpleString = function(test) {
  'use strict';
  test.expect(2);

  var m;

  m = markyMark('<a href="test">Test 12x24</a> - &quot;Test&quot;');
  //console.log(m);
  test.ok(m !== undefined);

  m = markyMark('<p>&quot;Meine vierjährige Tochter hat gesagt, dass sie sofort alle Buchstaben lernen will.&quot;</p>'+'    <p>&quot;Na, dann gib ihr mal eine <a href="http://www.fileformat.info/info/charset/UTF-8/list.htm">UTF-8-Tabelle</a>.&quot;</p>');
  //console.log(m);
  test.ok(m !== undefined);
  test.done();
};

exports.testCodeHighlighting = function(test) {
  'use strict';
  test.expect(3);

  var m;

  m = markyMark('<p id="more">Mein Anwendungsfall: Ich warte auf eine bestimmte Anzahl von Events, und löse mein eigenes Event aus, wenn alle meine Sub-Events erfolgreich abgeschlossen haben. Bisher sah das so aus (schon mit der Kraft von <a href="/posts/nodejs-pattern-array-foreach/"><code>Array.forEach</code></a>):</p>  <pre><code class="lang-javascript">  var files = [\'a.txt\',\'b.txt\',\'c.txt\'];  /*var processed = 0;*/  var checkProcessed  = function(err) {    if (err) {      console.log("Error!");    }    if (++processed === files.length) {      console.log("Done!");    }  };  files.forEach(function(file) {    fs.writeFile(file, "Test test test", checkProcessed);  }); // Comment  </code></pre>');
  //console.log(m);
  test.ok(m !== undefined);

  m = markyMark('<pre><code class="lang-html">&lt;-- Comment --&gt;&lt;a href=&quot;#&quot;&gt;Test &amp;amp; Fest&lt;/a&gt;</code></pre>');
  test.ok(m !== undefined);

  m = markyMark('<pre><code class="lang-markdown">'+
     "H1\n=====\n\nH2\n-----"+
    '</code></pre>'
  );
  //console.log(m);
  test.ok(m !== undefined);

  test.done();
};

exports.testChess = function(test) {
  'use strict';
  test.expect(1);

  var m;

  m = markyMark('<pre><code class="language-chess">br bk bb bx bq bb bk br\nbp bp    bp bp bp bp bp\n      bp\n\n         wp\n\nwp wp wp    wp wp wp wp\nwr wk wb wx wq wb wk wr\n</code></pre>');
  //console.log(m);
  test.ok(m !== undefined);

  test.done();
};
