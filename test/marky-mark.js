var markyMark = require('../src/helpers/marky-mark');

exports.testSimpleString = function(test) {
  'use strict';
  test.expect(6);

  var m;

  m = markyMark('<p><a href="test">Test 12x24</a> - &quot;Test&quot;</p>');
  test.ok(m.match(/Test 12/));
  test.ok(m !== undefined, 'String is not undefined');

  m = markyMark(
    '<p>&quot;Meine vierjährige Tochter hat gesagt, dass sie sofort alle Buchstaben lernen will.&quot;</p>'+
    '<p>&quot;Na, dann gib ihr mal eine <a href="http://www.fileformat.info/info/charset/UTF-8/list.htm">UTF-8-Tabelle</a>.&quot;</p>'
  );
  //console.log(m);
  test.ok(m !== undefined, 'String is not undefined');
  test.ok(m.match(/Tochter hat gesagt/));
  test.ok(m.match(/dann gib ihr mal eine/));
  test.ok(m.match(/www\.fileformat\.info/));
  test.done();
};

exports.testCodeHighlighting = function(test) {
  'use strict';
  test.expect(6);

  var m;

  m = markyMark('<p id="more">Mein Anwendungsfall: Ich warte auf eine bestimmte Anzahl von Events, und löse mein eigenes Event aus, wenn alle meine Sub-Events erfolgreich abgeschlossen haben. Bisher sah das so aus (schon mit der Kraft von <a href="/posts/nodejs-pattern-array-foreach/"><code>Array.forEach</code></a>):</p>  <pre><code class="lang-javascript">  var files = [\'a.txt\',\'b.txt\',\'c.txt\'];  /*var processed = 0;*/  var checkProcessed  = function(err) {    if (err) {      console.log("Error!");    }    if (++processed === files.length) {      console.log("Done!");    }  };  files.forEach(function(file) {    fs.writeFile(file, "Test test test", checkProcessed);  }); // Comment  </code></pre>');
  test.ok(m !== undefined, 'String is not undefined');
  test.ok(m.match(/<i class/));

  m = markyMark('<pre><code class="lang-html">&lt;-- Comment --&gt;&lt;a href=&quot;#&quot;&gt;Test &amp;amp; Fest&lt;/a&gt;</code></pre>');
  test.ok(m !== undefined, 'String is not undefined');
  test.ok(m.match(/<i class/));

  m = markyMark('<pre><code class="lang-markdown">'+
     "H1\n=====\n\nH2\n-----\n\n[Links](#) with some *italic* and **bold** text.\n\n### Headline\n"+
    '</code></pre>'
  );
  //console.log(m);
  test.ok(m !== undefined, 'String is not undefined');
  test.ok(m.match(/<i class/));

  test.done();
};

/**
 * [testDiffing description]
 * @param  {[type]} test [description]
 * @return {[type]}      [description]
 */
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
  test.ok(m !== undefined, 'String is not undefined');
  test.ok(m.match(/<ins>/));
  test.ok(m.match(/<del>/));

  test.done();
};

/**
 * [testShell description]
 * @param  {[type]} test [description]
 * @return {[type]}      [description]
 */
exports.testShell = function(test) {
  'use strict';

  test.expect(3);

  var m;

  m = markyMark(
    '<pre><code class="lang-shell">'+
    "\n$ rm -rf ."+
    "\n# Nasty nasty"+
    "\nx files have been deleted"+
    "\n</code></pre>"
  );
  //console.log(m);
  test.ok(m !== undefined, 'String is not undefined');
  test.ok(m.match(/<i class/));
  test.ok(m.match(/comment/));

  test.done();
};

/**
 * [testQuotation description]
 * @param  {[type]} test [description]
 * @return {[type]}      [description]
 */
exports.testQuotation = function(test) {
  'use strict';

  test.expect(1);

  var m, x = '<p>&quot;Ah, there you are. As you said: \'Quotation is important\'&quot;.</p>';

  m = markyMark(x, {
    quotation: {
      primary:   ['«','»'],
      secondary: ['“','”']
    }
  });
  //console.log(m);

  test.ok(m !== markyMark(x, {
    quotation: {
      primary:   ['„','“'],
      secondary: ['‚','‘']
    }
  }), 'Quotation changed');

  test.done();
};
