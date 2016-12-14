'use strict';

var markyMark = require('../src/helpers/marky-mark');

exports.testSimpleString = function(test) {
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

  test.expect(1);

  var m, x = '<p>&quot;Ah, there you are. As you said: \'Quotation is important\'&quot;.</p>';

  m = markyMark(x, {
    quotation: {
      primary: ['«', '»'],
      secondary: ['“', '”']
    }
  });
  //console.log(m);

  test.ok(m !== markyMark(x, {
    quotation: {
      primary: ['„', '“'],
      secondary: ['‚', '‘']
    }
  }), 'Quotation changed');

  test.done();
};

exports.testPhp = function(test) {

  test.expect(5);

  var m, x = '              <p>Autoloading ist in PHP eine feine Sache. Statt jede einzelne Klasse mittels eigenem <code>require_once</code> einzubinden, kann man bei existierendem Autoloader einfach durch Aufruf der Klasse diese Laden.</p>'+"\n"+
  '<!-- more -->'+"\n"+
  '<p id="more">Eine Klasse legt man dabei einfach in einer Verzeichnisstruktur ab, z.B. unter <code>Example/Foo.php</code>. Das Innere der Datei sieht dann wie folgt aus:</p>'+"\n"+
  '<pre><code class="lang-php">namespace Example;'+"\n"+
  ''+"\n"+
  'class Foo'+"\n"+
  '{'+"\n"+
  '  // Stuff here'+"\n"+
  '}'+"\n"+
  '</code></pre>'+"\n"+
  '<p>Der kleinste Autoloader der Welt sieht dann wie folgt aus, und verarbeitet alle in PHP unbekannte Klassen:</p>'+"\n"+
  '<pre><code class="lang-php">function __autoload($classname)'+"\n"+
  '{  '+"\n"+
  '  require_once($classname.<i class="c5">&#39;.php&#39;);'+"\n"+
  '}'+"\n"+
  '</code></pre>'+"\n"+
  '<p>Und die Klasse setzt man dann nach eingeschalteten Autoloader wie folgt ein:</p>'+"\n"+
  '<pre><code class="lang-php">$foo = new \Example\Foo();'+"\n"+
  '</code></pre>';

  m = markyMark(x);
  //console.log(m);

  test.ok(m);
  test.ok(m.match(/<i class="comment">\/\//));
  test.ok(m.match(/<i class="[^"]+">namespace<\/i>/));
  test.ok(m.match(/<i class="[^"]+">\$classname<\/i>/));
  test.ok(m.match(/<i class="[^"]+">\$foo<\/i>/));

  test.done();
};
