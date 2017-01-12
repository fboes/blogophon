'use strict';

var markyMark = require('../src/helpers/marky-mark');

exports.testSimpleString = function(test) {
  test.expect(10);

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

  m = markyMark('<p><a href="https://youtu.be/VQ01tJ4EWeg">Dunkirk</a></p>');
  test.ok(m.match(/embed\/VQ01tJ4EWeg/));

  m = markyMark('<p><a href="https://youtu.be/VQ01tJ4EWeg?t=2m19s">Dunkirk</a></p>');
  test.ok(m.match(/embed\/VQ01tJ4EWeg/));
  test.ok(!m.match(/t=2m19s/));

  m = markyMark('<p><img src="http://www.example.com" alt="" /></p>');
  test.ok(m.match(/src="http:\/\/www\.example\.com/));

  test.done();
};

exports.testCodeHighlighting = function(test) {
  test.expect(6);

  var m;

  m = markyMark('<p id="more">Mein Anwendungsfall: Ich warte auf eine bestimmte Anzahl von Events, und löse mein eigenes Event aus, wenn alle meine Sub-Events erfolgreich abgeschlossen haben. Bisher sah das so aus (schon mit der Kraft von <a href="/posts/nodejs-pattern-array-foreach/"><code>Array.forEach</code></a>):</p>  <pre><code class="lang-javascript">  var files = [\'a.txt\',\'b.txt\',\'c.txt\'];  /*var processed = 0;*/  var checkProcessed  = function(err) {    if (err) {      console.log("Error!");    }    if (++processed === files.length) {      console.log("Done!");    }  };  files.forEach(function(file) {    fs.writeFile(file, "Test test test", checkProcessed);  }); // Comment  </code></pre>');
  test.ok(m !== undefined, 'String is not undefined');
  test.ok(m.match(/<\/?(b|i|var|tt|kbd|samp|u)>/));

  m = markyMark('<pre><code class="lang-html">&lt;-- Comment --&gt;&lt;a href=&quot;#&quot;&gt;Test &amp;amp; Fest&lt;/a&gt;</code></pre>');
  test.ok(m !== undefined, 'String is not undefined');
  test.ok(m.match(/<\/?(b|i|var|tt|kbd|samp|u)>/));

  m = markyMark('<pre><code class="lang-markdown">'+
     "H1\n=====\n\nH2\n-----\n\n[Links](#) with some *italic* and **bold** text.\n\n### Headline\n"+
    '</code></pre>'
  );
  //console.log(m);
  test.ok(m !== undefined, 'String is not undefined');
  test.ok(m.match(/<\/?(b|i|var|tt|kbd|samp|u)>/));

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
  test.ok(m.match(/<\/?(b|i|var|tt|kbd|samp)>/));
  test.ok(m.match(/<\/?(u)>/));

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
  test.ok(m.match(/<(b|i|var|tt|kbd|samp|u)>\/\//));
  test.ok(m.match(/<(b|i|var|tt|kbd|samp|u)>namespace<\/(b|i|var|tt|kbd|samp|u)>/));
  test.ok(m.match(/<(b|i|var|tt|kbd|samp|u)>\$classname<\/(b|i|var|tt|kbd|samp|u)>/));
  test.ok(m.match(/<(b|i|var|tt|kbd|samp|u)>\$foo<\/(b|i|var|tt|kbd|samp|u)>/));

  test.done();
};

exports.testBash = function(test) {
  test.expect(6);
  var m, x = '<pre><code class="lang-shell">#!/bin/bash\nset -e\ncd `dirname $0`/..\nif [ ! -e build/config.sh ]; then\n  cp build/_config.sh build/config.sh\nfi\nsource build/config.sh\n\nif [ &quot;$LOCAL_DB_HOST&quot; ]; then\n  mysql -h $LOCAL_DB_HOST -u root -proot --execute &quot;CREATE DATABASE IF NOT EXISTS $LOCAL_DB_DB&quot;\n  mysql -h $LOCAL_DB_HOST -u root -proot --execute &quot;GRANT ALL ON $LOCAL_DB_DB.* TO \'$LOCAL_DB_USR\'@\'localhost\' IDENTIFIED BY \'$LOCAL_DB_PWD\'&quot;\nfi\nif [ -f build/mysql/dbdump.sql ]; then\n  build/import-dbdump.sh\nfi\n\nif [ -x &quot;/usr/sbin/sestatus&quot; ]; then\n  echo &quot;&quot;\n  echo -e &quot;=== \x1B[32mDirectory access\x1B[m ===&quot;\n  echo &quot;&quot;\nfi\n\nfunction make_writable_directory {\n  mkdir -p $1 && chmod -R ugo+rwX $1\n  if [ -x &quot;/usr/sbin/sestatus&quot; ]; then\n    echo &quot;semanage fcontext -a -t httpd_sys_rw_content_t \&quot;$LOCAL_DIRECTORY/$1(/.*)?\&quot;&quot;\n  fi\n}\n\n# mkdir -p tmp\n# make_writable_directory htdocs/files\n#[ -h TARGET ] || ln -s SOURCE TARGET\n#[ -f TARGET ] || cp SOURCE TARGET\n\nif [ ! -d /vagrant ]; then\n  echo &quot;&quot;\n  echo -e &quot;=== \x1B[32mApache2 vhost config\x1B[m ===&quot;\n  echo &quot;&quot;\n  sed &quot;s#/var/www#$LOCAL_DIRECTORY#g&quot; build/apache/macro-broilerplate.conf\n  sed &quot;s#/var/www#$LOCAL_DIRECTORY#g;s#localhost#$LOCAL_HOST#g&quot; build/apache/httpd-vhost.conf\n  echo &quot;&quot;\n  echo -e &quot;=== \x1B[32m/etc/hosts\x1B[m === &quot;\n  echo &quot;&quot;\n  echo &quot;127.0.0.1    $LOCAL_HOST&quot;\n  echo &quot;"\n  [ -d node_modules ] || npm install\nelse\n  [ -d node_modules ] || sudo npm install --no-bin-links\nfi</code></pre>';

  m = markyMark(x);
  //console.log(m);
  test.ok(m, 'Got output');
  test.ok(m.match(/<(b|i|var|tt|kbd|samp|u)>/), 'Markup added');
  test.ok(m.match(/<u>#/), 'Comments found');

  x = '<pre><code class="lang-bash">#!/bin/bash\nset -e\ncd `dirname $0`/..\nif [ ! -e build/config.sh ]; then\n  cp build/_config.sh build/config.sh\nfi\nsource build/config.sh\n\nif [ &quot;$LOCAL_DB_HOST&quot; ]; then\n  mysql -h $LOCAL_DB_HOST -u root -proot --execute &quot;CREATE DATABASE IF NOT EXISTS $LOCAL_DB_DB&quot;\n  mysql -h $LOCAL_DB_HOST -u root -proot --execute &quot;GRANT ALL ON $LOCAL_DB_DB.* TO \'$LOCAL_DB_USR\'@\'localhost\' IDENTIFIED BY \'$LOCAL_DB_PWD\'&quot;\nfi\nif [ -f build/mysql/dbdump.sql ]; then\n  build/import-dbdump.sh\nfi\n\nif [ -x &quot;/usr/sbin/sestatus&quot; ]; then\n  echo &quot;&quot;\n  echo -e &quot;=== \x1B[32mDirectory access\x1B[m ===&quot;\n  echo &quot;&quot;\nfi\n\nfunction make_writable_directory {\n  mkdir -p $1 && chmod -R ugo+rwX $1\n  if [ -x &quot;/usr/sbin/sestatus&quot; ]; then\n    echo &quot;semanage fcontext -a -t httpd_sys_rw_content_t \&quot;$LOCAL_DIRECTORY/$1(/.*)?\&quot;&quot;\n  fi\n}\n\n# mkdir -p tmp\n# make_writable_directory htdocs/files\n#[ -h TARGET ] || ln -s SOURCE TARGET\n#[ -f TARGET ] || cp SOURCE TARGET\n\nif [ ! -d /vagrant ]; then\n  echo &quot;&quot;\n  echo -e &quot;=== \x1B[32mApache2 vhost config\x1B[m ===&quot;\n  echo &quot;&quot;\n  sed &quot;s#/var/www#$LOCAL_DIRECTORY#g&quot; build/apache/macro-broilerplate.conf\n  sed &quot;s#/var/www#$LOCAL_DIRECTORY#g;s#localhost#$LOCAL_HOST#g&quot; build/apache/httpd-vhost.conf\n  echo &quot;&quot;\n  echo -e &quot;=== \x1B[32m/etc/hosts\x1B[m === &quot;\n  echo &quot;&quot;\n  echo &quot;127.0.0.1    $LOCAL_HOST&quot;\n  echo &quot;"\n  [ -d node_modules ] || npm install\nelse\n  [ -d node_modules ] || sudo npm install --no-bin-links\nfi</code></pre>';

  m = markyMark(x);
  //console.log(m);
  test.ok(m, 'Got output');
  test.ok(m.match(/<(b|i|var|tt|kbd|samp|u)>/), 'Markup added');
  test.ok(m.match(/<u>#/), 'Comments found');

  test.done();
};
