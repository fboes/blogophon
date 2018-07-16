'use strict';

const assert = require('assert');
const markyMark = require('../lib/helpers/marky-mark');

describe('MarkyMark', function() {
  it('should convert simple strings', function() {
    let m;

    m = markyMark('<p><a href="test">Test 12x24</a> - &quot;Test&quot;</p>');
    assert.ok(m.match(/Test 12/));
    assert.ok(m !== undefined, 'String is not undefined');

    m = markyMark(
      '<p>&quot;Meine vierjährige Tochter hat gesagt, dass sie sofort alle Buchstaben lernen will.&quot;</p>'+
    '<p>&quot;Na, dann gib ihr mal eine <a href="http://www.fileformat.info/info/charset/UTF-8/list.htm">UTF-8-Tabelle</a>.&quot;</p>'
    );
    //console.log(m);
    assert.ok(m !== undefined, 'String is not undefined');
    assert.ok(m.match(/Tochter hat gesagt/));
    assert.ok(m.match(/dann gib ihr mal eine/));
    assert.ok(m.match(/www\.fileformat\.info/));

    m = markyMark('<p><a href="https://youtu.be/VQ01tJ4EWeg">Dunkirk</a></p>');
    assert.ok(m.match(/embed\/VQ01tJ4EWeg/));

    m = markyMark('<p><a href="https://youtu.be/VQ01tJ4EWeg?t=2m19s">Dunkirk</a></p>');
    assert.ok(m.match(/embed\/VQ01tJ4EWeg/));
    assert.ok(!m.match(/t=2m19s/));

    m = markyMark('<p><a href="http://codepen.io/larsenwork/pen/MpjXrb">Codepen</a></p>');
    assert.ok(m.match(/codepen\.io\/larsenwork\/embed\/MpjXrb\//));
    assert.ok(m.match(/<iframe/));

    m = markyMark('<p><a href="https://gist.github.com/defunkt/2059">Github Gist</a></p>');
    assert.ok(m.match(/<script async="async" src="https:\/\/gist.github.com\/defunkt\/2059.js">/));

    m = markyMark('<p><a href="https://jsfiddle.net/6cLkvdag/">Github Gist</a></p>');
    assert.ok(m.match(/<script async="async" src="https:\/\/jsfiddle.net\/6cLkvdag\/embed\/">/));

    m = markyMark('<p><img src="http://www.example.com" alt="" /></p>');
    assert.ok(m.match(/src="http:\/\/www\.example\.com/));
  });

  it('should do code highlighting', function() {
    let m;

    m = markyMark('<p id="more">Mein Anwendungsfall: Ich warte auf eine bestimmte Anzahl von Events, und löse mein eigenes Event aus, wenn alle meine Sub-Events erfolgreich abgeschlossen haben. Bisher sah das so aus (schon mit der Kraft von <a href="/posts/nodejs-pattern-array-foreach/"><code>Array.forEach</code></a>):</p>  <pre><code class="lang-javascript">  var files = [\'a.txt\',\'b.txt\',\'c.txt\'];  /*var processed = 0;*/  var checkProcessed  = function(err) {    if (err) {      console.log("Error!");    }    if (++processed === files.length) {      console.log("Done!");    }  };  files.forEach(function(file) {    fs.writeFile(file, "Test test test", checkProcessed);  }); // Comment  </code></pre>');
    assert.ok(m !== undefined, 'String is not undefined');
    assert.ok(m.match(/<\/?(b|i|var|em|kbd|samp|u)>/));

    m = markyMark('<pre><code class="lang-html">&lt;-- Comment --&gt;&lt;a href=&quot;#&quot;&gt;Test &amp;amp; Fest&lt;/a&gt;</code></pre>');
    assert.ok(m !== undefined, 'String is not undefined');
    assert.ok(m.match(/<\/?(b|i|var|em|kbd|samp|u)>/));

    m = markyMark('<pre><code class="lang-markdown">'+
    "H1\n=====\n\nH2\n-----\n\n[Links](#) with some *italic* and **bold** and _bold_ text.\n\n### Headline\n"+
    "There is also _italic_ and __bold__ but not _ unbold _.\n"+
    "And some `code` or stuff like that, but it's ` on some place\n"+
    "* And some `code` or stuff like that\n"+
    "Add CSS variable `--gallery-count` to gallery HTML.\n"+
    "And some `code` or stuff * like * that, and an http://www.example.com URL\n"+
    '</code></pre>'
    );
    //console.log(m);
    assert.ok(m !== undefined, 'String is not undefined');
    assert.equal(m.match(/<\/?(b|i|var|em|kbd|samp|u)>/g).length, 16 * 2);
  });

  it('should do code highlighting for Diffs', function() {

    let m;

    m = markyMark(
      '<pre><code class="lang-javascript">'+
    "\n- var test = 1;"+
    "\n+ var test = 2;"+
    "\n</code></pre>"
    );
    //console.log(m);
    assert.ok(m !== undefined, 'String is not undefined');
    assert.ok(m.match(/<ins>/));
    assert.ok(m.match(/<del>/));
  });

  it('should do code highlighting for Shell / Bash', function() {

    let m;

    m = markyMark(
      '<pre><code class="lang-shell">$ rm -rf *'+
    "\n$ rm -rf ."+
    "\n$ cd %USERPROFILE%"+
    "\n# Nasty nasty"+
    "\necho $DING"+
    "\nx files have been deleted"+
    "\n</code></pre>"
    );
    //console.log(m);
    assert.ok(m !== undefined, 'String is not undefined');
    assert.ok(m.match(/<\/?(b|i|var|em|kbd|samp)>/));
    assert.ok(m.match(/<\/?(u)>/));
  });

  it('should use proper quotes', function() {
    let m, x = '<h1>Delete me</h1><h2>Downgrade me</h2><p>&quot;Ah, there you are. As you said: \'Quotation is important\'&quot;.</p>';

    m = markyMark(x, {
      quotation: {
        primary: ['«', '»'],
        secondary: ['“', '”']
      }
    });
    //console.log(m);

    assert.ok(m !== markyMark(x, {
      quotation: {
        primary: ['„', '“'],
        secondary: ['‚', '‘']
      }
    }), 'Quotation changed');
    assert.ok(!m.match(/<h1>/), '<h1> removal happened');
    assert.ok(!m.match(/<h2>/), 'Headline downgraded happened');
    assert.ok(m.match(/<h3>/), 'Headline downgraded happened');
    assert.ok(m.match(/«/));
    assert.ok(m.match(/“/));

    m = markyMark(x, {
      headline: 1
    });
    assert.ok(!m.match(/<h1>/), '<h1> removal did not happen');
    assert.ok(m.match(/<h2>/), 'No headline downgraded happened');
    assert.ok(!m.match(/<h3>/), 'No headline downgraded happened');

    x = "<p>Yesterday, upon the stair,<br>I met a man who wasn't there.<br>He wasn't there again today.<br>I wish, I wish he'd go away.<br><cite>Hughes Mearns</cite> <img href=\"example.jpg\"><hr></p>";
    m = markyMark(x, {
      quotation: {
        primary: ['%', '%'],
        secondary: ['%', '%']
      }
    });
    //console.log(m);
    assert.ok(!m.match(/%/));
  });

  it('should do code highlighting for PHP', function() {

    let m, x = '              <p>Autoloading ist in PHP eine feine Sache. Statt jede einzelne Klasse mittels eigenem <code>require_once</code> einzubinden, kann man bei existierendem Autoloader einfach durch Aufruf der Klasse diese Laden.</p>'+"\n"+
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
  '<pre><code class="lang-php">$foo = new \\Example\\Foo();'+"\n"+
  '</code></pre>';

    m = markyMark(x);
    //console.log(m);

    assert.ok(m);
    assert.ok(m.match(/<(b|i|var|em|kbd|samp|u)>\/\//g));
    assert.ok(m.match(/<(b|i|var|em|kbd|samp|u)>namespace<\/\1>/g));
    assert.ok(m.match(/<(b|i|var|em|kbd|samp|u)>\$classname<\/\1>/g));
    assert.ok(m.match(/<(b|i|var|em|kbd|samp|u)>\$foo<\/\1>/g));
  });

  it('should do more code highlighting for Shell / Bash', function() {
    let m, x = '<pre><code class="lang-shell">#!/bin/bash\nset -e\ncd `dirname $0`/..\nif [ ! -e build/config.sh ]; then\n  cp build/_config.sh build/config.sh\nfi\nsource build/config.sh\n\nif [ &quot;$LOCAL_DB_HOST&quot; ]; then\n  mysql -h $LOCAL_DB_HOST -u root -proot --execute &quot;CREATE DATABASE IF NOT EXISTS $LOCAL_DB_DB&quot;\n  mysql -h $LOCAL_DB_HOST -u root -proot --execute &quot;GRANT ALL ON $LOCAL_DB_DB.* TO \'$LOCAL_DB_USR\'@\'localhost\' IDENTIFIED BY \'$LOCAL_DB_PWD\'&quot;\nfi\nif [ -f build/mysql/dbdump.sql ]; then\n  build/import-dbdump.sh\nfi\n\nif [ -x &quot;/usr/sbin/sestatus&quot; ]; then\n  echo &quot;&quot;\n  echo -e &quot;=== \\x1B[32mDirectory access\\x1B[m ===&quot;\n  echo &quot;&quot;\nfi\n\nfunction make_writable_directory {\n  mkdir -p $1 && chmod -R ugo+rwX $1\n  if [ -x &quot;/usr/sbin/sestatus&quot; ]; then\n    echo &quot;semanage fcontext -a -t httpd_sys_rw_content_t &quot;$LOCAL_DIRECTORY/$1(/.*)?&quot;&quot;\n  fi\n}\n\n# mkdir -p tmp\n# make_writable_directory htdocs/files\n#[ -h TARGET ] || ln -s SOURCE TARGET\n#[ -f TARGET ] || cp SOURCE TARGET\n\nif [ ! -d /vagrant ]; then\n  echo &quot;&quot;\n  echo -e &quot;=== \\x1B[32mApache2 vhost config\\x1B[m ===&quot;\n  echo &quot;&quot;\n  sed &quot;s#/var/www#$LOCAL_DIRECTORY#g&quot; build/apache/macro-broilerplate.conf\n  sed &quot;s#/var/www#$LOCAL_DIRECTORY#g;s#localhost#$LOCAL_HOST#g&quot; build/apache/httpd-vhost.conf\n  echo &quot;&quot;\n  echo -e &quot;=== \\x1B[32m/etc/hosts\\x1B[m === &quot;\n  echo &quot;&quot;\n  echo &quot;127.0.0.1    $LOCAL_HOST&quot;\n  echo &quot;"\n  [ -d node_modules ] || npm install\nelse\n  [ -d node_modules ] || sudo npm install --no-bin-links\nfi</code></pre>';

    m = markyMark(x);
    //console.log(m);
    assert.ok(m, 'Got output');
    assert.ok(m.match(/<(b|i|var|em|kbd|samp|u)>/g).length > 0, 'Markup added');
    assert.ok(m.match(/<u>#/), 'Comments found');

    x = '<pre><code class="lang-bash">#!/bin/bash\nset -e\ncd `dirname $0`/..\nif [ ! -e build/config.sh ]; then\n  cp build/_config.sh build/config.sh\nfi\nsource build/config.sh\n\nif [ &quot;$LOCAL_DB_HOST&quot; ]; then\n  mysql -h $LOCAL_DB_HOST -u root -proot --execute &quot;CREATE DATABASE IF NOT EXISTS $LOCAL_DB_DB&quot;\n  mysql -h $LOCAL_DB_HOST -u root -proot --execute &quot;GRANT ALL ON $LOCAL_DB_DB.* TO \'$LOCAL_DB_USR\'@\'localhost\' IDENTIFIED BY \'$LOCAL_DB_PWD\'&quot;\nfi\nif [ -f build/mysql/dbdump.sql ]; then\n  build/import-dbdump.sh\nfi\n\nif [ -x &quot;/usr/sbin/sestatus&quot; ]; then\n  echo &quot;&quot;\n  echo -e &quot;=== \\x1B[32mDirectory access\\x1B[m ===&quot;\n  echo &quot;&quot;\nfi\n\nfunction make_writable_directory {\n  mkdir -p $1 && chmod -R ugo+rwX $1\n  if [ -x &quot;/usr/sbin/sestatus&quot; ]; then\n    echo &quot;semanage fcontext -a -t httpd_sys_rw_content_t &quot;$LOCAL_DIRECTORY/$1(/.*)?&quot;&quot;\n  fi\n}\n\n# mkdir -p tmp\n# make_writable_directory htdocs/files\n#[ -h TARGET ] || ln -s SOURCE TARGET\n#[ -f TARGET ] || cp SOURCE TARGET\n\nif [ ! -d /vagrant ]; then\n  echo &quot;&quot;\n  echo -e &quot;=== \x1B[32mApache2 vhost config\x1B[m ===&quot;\n  echo &quot;&quot;\n  sed &quot;s#/var/www#$LOCAL_DIRECTORY#g&quot; build/apache/macro-broilerplate.conf\n  sed &quot;s#/var/www#$LOCAL_DIRECTORY#g;s#localhost#$LOCAL_HOST#g&quot; build/apache/httpd-vhost.conf\n  echo &quot;&quot;\n  echo -e &quot;=== \\x1B[32m/etc/hosts\\x1B[m === &quot;\n  echo &quot;&quot;\n  echo &quot;127.0.0.1    $LOCAL_HOST&quot;\n  echo &quot;"\n  [ -d node_modules ] || npm install\nelse\n  [ -d node_modules ] || sudo npm install --no-bin-links\nfi</code></pre>';

    m = markyMark(x);
    //console.log(m);
    assert.ok(m, 'Got output');
    assert.ok(m.match(/<(b|i|var|em|kbd|samp|u)>/g).length > 0, 'Markup added');
    assert.ok(m.match(/<u>#/), 'Comments found');
  });

  it('should make HTML tables even nicer', function() {
    let m, x = '<table><thead><tr><th>Model</th><th style="text-align:right">Pathfinder</th><th style="text-align:right">Hauler</th><th style="text-align:right">Diamondback Scout</th></tr></thead><tbody><tr><td><strong>Manufacturer</strong></td><td style="text-align:right">Zorgon Peterson</td><td style="text-align:right">Zorgon Peterson</td><td style="text-align:right">Lakon Spaceways</td></tr><tr><td><strong>Type</strong></td><td style="text-align:right">Light Explorer</td><td style="text-align:right">Light Freighter</td><td style="text-align:right">Light Combat Explorer</td></tr><tr><td><strong>Cost</strong></td><td style="text-align:right">~460,000 CR</td><td style="text-align:right">52,720 Cr</td><td style="text-align:right">564,320 Cr</td></tr><tr><td><strong>Top Speed</strong></td><td style="text-align:right">230 m/s</td><td style="text-align:right">200 m/s</td><td style="text-align:right">280 m/s</td></tr><tr><td><strong>Boost Speed</strong></td><td style="text-align:right">340 m/s</td><td style="text-align:right">300 m/s</td><td style="text-align:right">380 m/s</td></tr><tr><td><strong>Manoeuvrability</strong></td><td style="text-align:right">8</td><td style="text-align:right">6</td><td style="text-align:right">8</td></tr><tr><td><strong>Hull Mass</strong></td><td style="text-align:right">45 t</td><td style="text-align:right">14 t</td><td style="text-align:right">170 t</td></tr><tr><td><strong>Max. Cargo Capacity</strong></td><td style="text-align:right">20 t</td><td style="text-align:right">22 t</td><td style="text-align:right">28 t</td></tr><tr><td><strong>Max. Jump Range</strong></td><td style="text-align:right">38 Ly</td><td style="text-align:right">37 Ly</td><td style="text-align:right">30 Ly</td></tr><tr><td><strong>Landing Pad Size</strong></td><td style="text-align:right">Small</td><td style="text-align:right">Small</td><td style="text-align:right">Small</td></tr><tr><td><strong>Power Plant</strong></td><td style="text-align:right">2</td><td style="text-align:right">2</td><td style="text-align:right">4</td></tr><tr><td><strong>Thrusters</strong></td><td style="text-align:right">3</td><td style="text-align:right">2</td><td style="text-align:right">4</td></tr><tr><td><strong>Frame Shift Drive</strong></td><td style="text-align:right">3</td><td style="text-align:right">2</td><td style="text-align:right">4</td></tr><tr><td><strong>Life Support</strong></td><td style="text-align:right">1</td><td style="text-align:right">1</td><td style="text-align:right">2</td></tr><tr><td><strong>Power Distributor</strong></td><td style="text-align:right">1</td><td style="text-align:right">1</td><td style="text-align:right">2</td></tr><tr><td><strong>Sensors</strong></td><td style="text-align:right">2</td><td style="text-align:right">1</td><td style="text-align:right">3</td></tr><tr><td><strong>Fuel Tank</strong></td><td style="text-align:right">2</td><td style="text-align:right">2</td><td style="text-align:right">4</td></tr><tr><td><strong>Hardpoints Medium</strong></td><td style="text-align:right">-</td><td style="text-align:right">-</td><td style="text-align:right">2x</td></tr><tr><td><strong>Hardpoints Small</strong></td><td style="text-align:right">2x</td><td style="text-align:right">1x</td><td style="text-align:right">2x</td></tr><tr><td><strong>Utility Mounts</strong></td><td style="text-align:right">1x</td><td style="text-align:right">2x</td><td style="text-align:right">4x</td></tr><tr><td><strong>Size 3 Compartments</strong></td><td style="text-align:right">1x</td><td style="text-align:right">2x</td><td style="text-align:right">3x</td></tr><tr><td><strong>Size 2 Compartments</strong></td><td style="text-align:right">2x</td><td style="text-align:right">1x</td><td style="text-align:right">1x</td></tr><tr><td><strong>Size 1 Compartments</strong></td><td style="text-align:right">2x</td><td style="text-align:right">1x</td><td style="text-align:right">-</td></tr></tbody></table>';
    m = markyMark(x);
    //console.log(m);
    assert.ok(m, 'Got output');
    assert.ok(m.match(/<th>/), 'Markup added');
    assert.ok(m.match(/<th /), 'Markup added');
    assert.ok(m.match(/<div class="table-wrapper"/), 'Table wrapper added');
    assert.ok(m.match(/ class="table-cell--right"/), 'Table cell class added');
    assert.ok(!m.match(/<td><strong>/), 'Markup removed');
  });

  it('should convert video, audio and image tags', function() {
    let m;

    m = markyMark('<img src="video.jpg" alt="Description" />');
    assert.ok(m.match(/<img/), 'Image tag still present');
    assert.ok(!m.match(/<(video|audio)/), 'No audio/video tag present');

    m = markyMark('<img src="video.mp4" alt="Description" />');
    assert.ok(!m.match(/<(img|audio)/), 'Image tag is gone');
    assert.ok(m.match(/<video.+?>Description<\/video>/), 'Video tag with description is present');

    m = markyMark('<img src="video.mp4#12x24" alt="" />');
    assert.ok(!m.match(/<(img|audio)/), 'Image tag is gone');
    assert.ok(m.match(/<video/), 'Video tag is present');

    m = markyMark('<img src="video.mp3" alt="" />');
    assert.ok(!m.match(/<(img|video)/), 'Image tag is gone');
    assert.ok(m.match(/<audio/), 'Audio tag is present');

    m = markyMark('<p><img src="video.mp4" alt="" /></p>');
    assert.ok(!m.match(/<(img|audio)/), 'Image tag is gone');
    assert.ok(m.match(/<video/), 'Video tag is present');
    assert.ok(m.match(/<div class="video/), 'Wrapper div tag is present');
    assert.ok(!m.match(/<p/), 'P tag is gone');

    m = markyMark('<p>Inline video: <img src="video.mp4" alt="" /></p>');
    assert.ok(!m.match(/<(img|audio)/), 'Image tag is gone');
    assert.ok(m.match(/<video/), 'Video tag is present');
    assert.ok(!m.match(/<div class="video/), 'Wrapper div tag is not present');
    assert.ok(m.match(/<p/), 'P tag is still there');

    m = markyMark("<p><img src=\"img.png#default\" alt=\"&gt; Alt-Text\">\nJawoll</p>\n");
    assert.ok(m.match(/<(img|video)/), 'Image tag is present');
    assert.ok(m.match(/figure/), 'figure is present');
    assert.ok(m.match(/figcaption/), 'figcaption is present');

    m = markyMark("<p><img src=\"img.png#default\" alt=\"&gt; Alt-Text\">\nJawoll</p>\n");
    assert.ok(m.match(/<(img|video)/), 'Image tag is present');
    assert.ok(m.match(/figure/), 'figure is present');
    assert.ok(m.match(/"figure default"/), 'new class is present');
    //console.log(m);
  });

  it('should do code highlighting for CSS', function() {
    let m, x = '<pre><code class="lang-css">* { margin: 0; padding: 0; }'+"\n"
    +'* + h1, * + h2, * + h3, * + h4 { margin-top: 1.2em; }'+"\n"
    +'#identifier { margin-top: 0.5em; }'+"\n"
    +'.class { margin-top: 0.2em; }</code></pre>';

    m = markyMark(x);
    //console.log(m);
    assert.ok(m, 'Got output');
    assert.equal(m.match(/<(b|i|var|em|kbd|samp|u)>/g).length, 10, 'Markup added');
  });

  it('should do code highlighting for SQL', function() {
    let m, x = `<pre><code class="lang-sql">SELECT
  CONCAT(
    &quot;UPDATE articles_prices SET price = &quot;,
    IF(personal_offers.personal_offer = 0, products.products_price, personal_offers.personal_offer),
    &quot; WHERE articles_prices.ean = &quot;,
    QUOTE(REPLACE(products.products_model,' ','-')),
    &quot;;&quot;
  ) AS '#query'
  FROM personal_offers
  JOIN products ON products.id = personal_offers.products_id
  WHERE personal_offers.type = 1
;</code></pre>`;

    m = markyMark(x);
    //console.log(m);
    assert.ok(m, 'Got output');
    assert.equal(m.match(/<(b|i|var|em|kbd|samp|u)>/g).length, 24, 'Markup added');
  });

  it('should convert ASCII art to Emojis', function() {
    let m, x = ':) and ;) and \\o/ ';
    m = markyMark(x);

    assert.ok(m, 'Got output');
    assert.equal(m.match(/&#x([\dA-Z]+);/g).length, 3, 'Emojis added');
  });

  it('should do col spanning in tables if asked to do so', function() {
    const x = `<table>
<caption id="test">Test</caption>
<thead>
<tr>
<th style="text-align:right">Ich und du</th>
<th style="text-align:left">Müllers Kuh</th>
<th>Müllers Esel</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:right"></td>
<td style="text-align:left">Das bist du und so    ⁴</td>
</tr>
</tbody>
</table>`;

    let m = markyMark(x);
    assert.ok(m, 'Got output');
    assert.equal(m.match(/colspan="\d"/g).length, 1, 'Colspan added');
  });
});
