'use strict';

const assert = require('assert');
const markyMark = require('../lib/helpers/marky-mark');

describe('MarkyMark', function() {
  describe('Simple HTML improvement', function() {

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

      m = markyMark('<p><img src="http://www.example.com" alt="" /></p>');
      assert.ok(m.match(/src="http:\/\/www\.example\.com/));
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
    it('should have some class(es)', function() {
      let m, x = '<a href="https://www.example.com" title="nomention">Test</a>';
      m = markyMark(x);
      assert.ok(m.match(/class/));
      assert.ok(!m.match(/title/));

      x = '<a href="https://www.example.com" title="nofollow">Test</a>';
      m = markyMark(x);
      assert.ok(m.match(/rel/));
      assert.ok(!m.match(/class/));
      assert.ok(!m.match(/title/));

      x = '<a href="https://www.example.com" title="nofun">Test</a>';
      m = markyMark(x);
      assert.ok(!m.match(/class/));
      assert.ok(m.match(/title/));
    });
  });

  describe('Tables', function() {
    it('should make HTML tables even nicer', function() {
      let m, x = `<table>
  <thead>
    <tr><th>Model</th><th style="text-align:right">Pathfinder</th><th style="text-align:right">Hauler</th><th style="text-align:right">Diamondback Scout</th></tr></thead><tbody>
    <tr><td><strong>Manufacturer</strong></td><td style="text-align:right">Zorgon Peterson</td><td style="text-align:right">Zorgon Peterson</td><td style="text-align:right">Lakon Spaceways</td></tr>
    <tr><td><strong>Type</strong></td><td style="text-align:right">Light Explorer</td><td style="text-align:right">Light Freighter</td><td style="text-align:right">Light Combat Explorer</td></tr>
    <tr><td><strong>Cost</strong></td><td style="text-align:right">~460,000 CR</td><td style="text-align:right">52,720 Cr</td><td style="text-align:right">564,320 Cr</td></tr>
    <tr><td><strong>Top Speed</strong></td><td style="text-align:right">230 m/s</td><td style="text-align:right">200 m/s</td><td style="text-align:right">280 m/s</td></tr>
    <tr><td><strong>Boost Speed</strong></td><td style="text-align:right">340 m/s</td><td style="text-align:right">300 m/s</td><td style="text-align:right">380 m/s</td></tr>
    <tr><td><strong>Manoeuvrability</strong></td><td style="text-align:right">8</td><td style="text-align:right">6</td><td style="text-align:right">8</td></tr>
    <tr><td><strong>Hull Mass</strong></td><td style="text-align:right">45 t</td><td style="text-align:right">14 t</td><td style="text-align:right">170 t</td></tr>
    <tr><td><strong>Max. Cargo Capacity</strong></td><td style="text-align:right">20 t</td><td style="text-align:right">22 t</td><td style="text-align:right">28 t</td></tr>
    <tr><td><strong>Max. Jump Range</strong></td><td style="text-align:right">38 Ly</td><td style="text-align:right">37 Ly</td><td style="text-align:right">30 Ly</td></tr>
    <tr><td><strong>Landing Pad Size</strong></td><td style="text-align:right">Small</td><td style="text-align:right">Small</td><td style="text-align:right">Small</td></tr>
    <tr><td><strong>Power Plant</strong></td><td style="text-align:right">2</td><td style="text-align:right">2</td><td style="text-align:right">4</td></tr>
    <tr><td><strong>Thrusters</strong></td><td style="text-align:right">3</td><td style="text-align:right">2</td><td style="text-align:right">4</td></tr>
    <tr><td><strong>Frame Shift Drive</strong></td><td style="text-align:right">3</td><td style="text-align:right">2</td><td style="text-align:right">4</td></tr>
    <tr><td><strong>Life Support</strong></td><td style="text-align:right">1</td><td style="text-align:right">1</td><td style="text-align:right">2</td></tr>
    <tr><td><strong>Power Distributor</strong></td><td style="text-align:right">1</td><td style="text-align:right">1</td><td style="text-align:right">2</td></tr>
    <tr><td><strong>Sensors</strong></td><td style="text-align:right">2</td><td style="text-align:right">1</td><td style="text-align:right">3</td></tr>
    <tr><td><strong>Fuel Tank</strong></td><td style="text-align:right">2</td><td style="text-align:right">2</td><td style="text-align:right">4</td></tr>
    <tr><td><strong>Hardpoints Medium</strong></td><td style="text-align:right">-</td><td style="text-align:right">-</td><td style="text-align:right">2x</td></tr>
    <tr><td><strong>Hardpoints Small</strong></td><td style="text-align:right">2x</td><td style="text-align:right">1x</td><td style="text-align:right">2x</td></tr>
    <tr><td><strong>Utility Mounts</strong></td><td style="text-align:right">1x</td><td style="text-align:right">2x</td><td style="text-align:right">4x</td></tr>
    <tr><td><strong>Size 3 Compartments</strong></td><td style="text-align:right">1x</td><td style="text-align:right">2x</td><td style="text-align:right">3x</td></tr>
    <tr><td><strong>Size 2 Compartments</strong></td><td style="text-align:right">2x</td><td style="text-align:right">1x</td><td style="text-align:right">1x</td></tr>
    <tr><td><strong>Size 1 Compartments</strong></td><td style="text-align:right">2x</td><td style="text-align:right">1x</td><td style="text-align:right">-</td></tr>
  </tbody>
</table>`;
      m = markyMark(x);
      //console.log(m, m.match(/<th[> ]/g).length);
      assert.ok(m, 'Got output');
      assert.equal(m.match(/<th[> ]/g).length, 27, 'Markup added');
      assert.ok(m.match(/<div class="table-wrapper"/), 'Table wrapper added');
      assert.ok(m.match(/ class="table-cell--right"/g), 'Table cell class added');
      assert.ok(!m.match(/<td><strong>/), 'Markup removed');
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

  describe('Audio, video, images', function() {
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

    it('should do embedding of Youtube, Vimeo & co', function() {
      let m;

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
    });
  });

  describe('Syntax highlighting', function() {
    it('should do code highlighting for Javascript', function() {
      let m;

      m = markyMark(`
<p id="more">Mein Anwendungsfall: Ich warte auf eine bestimmte Anzahl von Events, und löse mein eigenes Event aus, wenn alle meine Sub-Events erfolgreich abgeschlossen haben. Bisher sah das so aus (schon mit der Kraft von <a href="/posts/nodejs-pattern-array-foreach/"><code>Array.forEach</code></a>):</p>
<pre><code class="lang-javascript">
  var files = ['a.txt','b.txt','c.txt'];
  /*var processed = 0;*/
  var checkProcessed  = function(err) {
    if (err) {
      console.log("Error!");
    }
    if (++processed === files.length) {
      console.log("Done!");
    }
  };
  files.forEach(function(file) {
    fs.writeFile(file, "Test test test", checkProcessed
  }); // Comment
</code></pre>
        `);
      assert.ok(m !== undefined, 'String is not undefined');
      assert.ok(m.match(/<\/?(b|i|var|em|kbd|samp|u)>/));
    });

    it('should do code highlighting for HTML', function() {
      let m;

      m = markyMark('<pre><code class="lang-html">&lt;-- Comment --&gt;&lt;a href=&quot;#&quot;&gt;Test &amp;amp; Fest&lt;/a&gt;</code></pre>');
      assert.ok(m !== undefined, 'String is not undefined');
      assert.ok(m.match(/<\/?(b|i|var|em|kbd|samp|u)>/));
    });

    it('should do code highlighting for Markdown', function() {
      let m = markyMark(`<pre><code class="lang-markdown">
H1
=====

H2
-----

[Links](#) with some *italic* and **bold** and _bold_ text.

### Headline

There is also _italic_ and __bold__ but not _ unbold _.
And some \`code\` or stuff like that, but it's only one \` on some places.

* And some \`code\` or stuff like that

Add CSS variable \`--gallery-count\` to gallery HTML.
And some \`code\` or stuff * like * that, and an http://www.example.com URL
</code></pre>`
      );
      //console.log(m);
      assert.ok(m !== undefined, 'String is not undefined');
      assert.equal(m.match(/<\/?(b|i|var|em|kbd|samp|u)>/g).length, 16 * 2);
    });

    it('should do code highlighting for Diffs', function() {
      let m = markyMark(
        `<pre><code class="lang-javascript">'+
- var test = 1;
+ var test = 2;
</code></pre>`
      );
      //console.log(m);
      assert.ok(m !== undefined, 'String is not undefined');
      assert.ok(m.match(/<ins>/));
      assert.ok(m.match(/<del>/));
    });

    const tests = [
      {
        language: 'PHP',
        snippet: `<p>Autoloading ist in PHP eine feine Sache. Statt jede einzelne Klasse mittels eigenem <code>require_once</code> einzubinden, kann man bei existierendem Autoloader einfach durch Aufruf der Klasse diese Laden.</p>
<!-- more -->
<p id="more">Eine Klasse legt man dabei einfach in einer Verzeichnisstruktur ab, z.B. unter <code>Example/Foo.php</code>. Das Innere der Datei sieht dann wie folgt aus:</p>
<pre><code class="lang-php">namespace Example;

class Foo
{
  // Stuff here
}
</code></pre>
<p>Der kleinste Autoloader der Welt sieht dann wie folgt aus, und verarbeitet alle in PHP unbekannte Klassen:</p>
<pre><code class="lang-php">function __autoload($classname)
{
  require_once($classname.<i class="c5">&#39;.php&#39;);
}
</code></pre>
<p>Und die Klasse setzt man dann nach eingeschalteten Autoloader wie folgt ein:</p>
<pre><code class="lang-php">$foo = new \\Example\\Foo();
</code></pre>`,
        expected: 22
      },
      // -----------------------------------------------------------------------
      {
        language: 'Shell (simple example)',
        snippet: `<pre><code class="lang-shell">$ rm -rf *
$ rm -rf .
$ cd %USERPROFILE%
# Nasty nasty
echo $DING
x files have been deleted
</code></pre>`,
        expected: 12 * 2
      },
      // -----------------------------------------------------------------------
      {
        language: 'Shell (long example)',
        snippet: `<pre><code class="lang-shell">#!/bin/bash
set -e
cd \`dirname $0\`/..
if [ ! -e build/config.sh ]; then
  cp build/_config.sh build/config.sh
  fi
source build/config.sh

if [ &quot;$LOCAL_DB_HOST&quot; ]; then
  mysql -h $LOCAL_DB_HOST -u root -proot --execute &quot;CREATE DATABASE IF NOT EXISTS $LOCAL_DB_DB&quot;
  mysql -h $LOCAL_DB_HOST -u root -proot --execute &quot;GRANT ALL ON $LOCAL_DB_DB.* TO '$LOCAL_DB_USR'@'localhost' IDENTIFIED BY '$LOCAL_DB_PWD'&quot;
  fi
if [ -f build/mysql/dbdump.sql ]; then
  build/import-dbdump.sh
  fi

if [ -x &quot;/usr/sbin/sestatus&quot; ]; then
  echo &quot;&quot;
  echo -e &quot;=== \\x1B[32mDirectory access\\x1B[m ===&quot;
  echo &quot;&quot;
  fi

function make_writable_directory {
  mkdir -p $1 && chmod -R ugo+rwX $1
  if [ -x &quot;/usr/sbin/sestatus&quot; ]; then
    echo &quot;semanage fcontext -a -t httpd_sys_rw_content_t &quot;$LOCAL_DIRECTORY/$1(/.*)?&quot;&quot;
  fi
}

# mkdir -p tmp
# make_writable_directory htdocs/files
#[ -h TARGET ] || ln -s SOURCE TARGET
#[ -f TARGET ] || cp SOURCE TARGET

if [ ! -d /vagrant ]; then
  echo &quot;&quot;
  echo -e &quot;=== \\x1B[32mApache2 vhost config\\x1B[m ===&quot;
  echo &quot;&quot;
  sed &quot;s#/var/www#$LOCAL_DIRECTORY#g&quot; build/apache/macro-broilerplate.conf
  sed &quot;s#/var/www#$LOCAL_DIRECTORY#g;s#localhost#$LOCAL_HOST#g&quot; build/apache/httpd-vhost.conf
  echo &quot;&quot;
  echo -e &quot;=== \\x1B[32m/etc/hosts\\x1B[m === &quot;
  echo &quot;&quot;
  echo &quot;127.0.0.1    $LOCAL_HOST&quot;
  echo &quot;"
  [ -d node_modules ] || npm install
  else
  [ -d node_modules ] || sudo npm install --no-bin-links
fi</code></pre>`,
        expected: 87 * 2,
        hasComments: true
      },
      // -----------------------------------------------------------------------
      {
        language: 'Bash (git config)',
        snippet: `<pre><code class="lang-bash">git config --global user.name YOUR NAME
git config --global user.email YOURMAIL@example.com
git config --global tag.sort version:refname
git config --global core.autocrlf false # https://stackoverflow.com/a/13154031/3232532
git config --global alias.chmod 'update-index --add --chmod=+x' # FILE: Makes files executable in Git
git config --global alias.reset-unpushed 'reset HEAD~1' # Undo last commits which have not been pushed
git config --global alias.reset-pushed 'revert HEAD' # Undo last commits which have been pushed
git config --global alias.tag-current 'describe --tags' # Shows current tag
git config --global alias.tag-sorted 'tag --sort=v:refname' # Show tags sorted
git config --global alias.remove-keep 'rm --cached -r' # FILE: Remove from Git but keep locally
git config --global alias.acp '!f() { git add -A && git commit -m &quot;$@&quot; && git push; }; f' # Add, commit, push, https://stackoverflow.com/a/35049625/3232532
git config --global alias.graph 'git log --oneline --graph' # Show commits as graph

# git show: Diff of latest commit
# git branch -r: Show all branches</code></pre>`,
        expected: 62,
        hasComments: true
      },
      // -----------------------------------------------------------------------
      {
        language: 'Bash (npm publish)',
        snippet: `<pre><code class="lang-bash">#!/bin/bash
set -e
cd \`dirname $0\`/..

npm update
npm test
rm package-lock.json
npm version patch
git push --follow-tags
npm publish</code></pre>`,
        expected: 14
      },
      // -----------------------------------------------------------------------
      {
        language: 'Shell (mysql)',
        snippet: `<pre><code class="lang-shell">$ mysql -h $HOSTNAME -u $USERNAME -p$PASSWORD $DATABASE &lt; MYSCRIPT.sql
$ mysqldump -h $HOSTNAME -u $USERNAME -p$PASSWORD --skip-comments --add-drop-table --single-transaction --quick $DATABASE &lt; dbdump-$(date "+%Y-%m-%d-%H-%M").sql
</code></pre>`,
        expected: 42
      },
      // -----------------------------------------------------------------------
      {
        language: 'Bash (with `...`)',
        snippet: `<pre><code class="language-bash">npm install glob --save-dev   # Installiert das Paket \`glob\`</code></pre>`,
        expected: 4
      },
      // -----------------------------------------------------------------------
      {
        language: 'CSS',
        snippet: `<pre><code class="lang-css">
    }
* {
  margin: 0;
  padding: 0;
}
* + h1, * + h2, * + h3, * + h4 {
  margin-top: 1.2em;
}
#identifier {
  margin-top: 0.5em;
}
.class {
  margin-top: 0.2em;
}
</code></pre>`,
        expected: 20
      },
      // -----------------------------------------------------------------------
      {
        language: 'Apache Configuration',
        snippet: `<pre><code class="lang-apacheconf"># Apache redirects
RewriteRule  /url_1/  https://%{HTTP_HOST}/url_a/  [R=301,L]
RewriteRule  /url_2/  https://%{HTTP_HOST}/url_b/  [R=301,L]
</code></pre>`,
        expected: 6,
        hasComments: true
      },
      // -----------------------------------------------------------------------
      {
        language: 'SQL',
        snippet: `<pre><code class="lang-sql">SELECT
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
;</code></pre>`,
        expected: 50
      },
      // -----------------------------------------------------------------------
      {
        language: 'SQL',
        snippet: `<pre><code class="lang-sql"># Update prices
UPDATE articles_prices SET price = 12.40 WHERE articles_prices.ean = 'ABC 1';
UPDATE articles_prices SET price = 19.49 WHERE articles_prices.ean = 'ABC 2';
UPDATE articles_prices SET price = 14.99 WHERE articles_prices.ean = 'ABC 3';</code></pre>`,
        expected: 38
      },
      // -----------------------------------------------------------------------
      {
        language: 'abc',
        snippet: `<pre><code class="lang-abc">
X:1
T:Speed the Plough
M:4/4
C:Trad.
K:G
[|:GABc dedB|dedB dedB|c2ec B2dB|c2A2 A2BA|
GABc dedB|dedB dedB|c2ec B2dB|A2F2 G4:|
|:g2gf gdBd|g2f2 e2d2|c2ec B2dB|c2A2 A2df|
g2gf g2Bd|g2f2 e2d2|c2ec B2dB|A2F2 G4:|
| (d e f) !trill!g | [CEGc] |
|:DEF FED| % this is an end of line comment
% this is a comment line with !trill!
DEF [r:and this is a remark with a | or so] FED:|]
</code></pre>`,
        expected: 66
      },
      // -----------------------------------------------------------------------
      {
        language: 'abc',
        snippet: `<pre><code class="lang-abc">[|:GABc dedB|dedB dedB|c2ec B2dB|c2A2 A2BA|
GABc dedB|dedB dedB|c2ec B2dB|A2F2 G4:|
|:g2gf gdBd|g2f2 e2d2|c2ec B2dB|c2A2 A2df|
g2gf g2Bd|g2f2 e2d2|c2ec B2dB|A2F2 G4:|
| (d e f) !trill!g | [CEGc] |
|:DEF FED| % this is an end of line comment
% this is a comment line with !trill!
DEF [r:and this is a remark with a | or so] FED:|]
</code></pre>`,
        expected: 56
      },
      // -----------------------------------------------------------------------
      {
        language: 'Axiom for Exapunks',
        snippet: `<pre><code class="lang-axiom">GRAB 200
SEEK 9999
SEEK -2
COPY F X
COPY F T
SEEK -9999

NOTE READ FILE TO OTHER EXA
MARK READING
  COPY F M
  TEST EOF
FJMP READING
WIPE

NOTE GET STUFF FROM API
COPY #SYS X
ADDI X 1 X
SUBI X 1 X
MULI X 1 X
DIVI X 1 X
TEST X = 1
TJMP WRITING
HALT

NOTE WRITE API TO FILE
MARK WRITING
MAKE
COPY X F

LINK -1
DROP

NOTE DONE

@REP 3
  TEST X = @{0,5}
  TJMP CASE@{0,1}
@END
</code></pre>`,
        hasComments: true,
        expected: 124 + 16
      }
    ];

    tests.forEach(function(test) {
      it('should do code highlighting for ' + test.language, function() {
        const m = markyMark(test.snippet);
        if (test.output) {
          console.log(m);
        }
        assert.ok(m, 'Got output');
        assert.ok(!m.match(/<(tt)>/), 'Should contain no <tt>');
        assert.ok(!m.match(/(<(?:b|i|var|em|kbd|samp|u)>){2}/), 'Should not do double quoting');
        let tagsFound = m.match(/<\/?(b|i|var|em|kbd|samp|u)>/g).length;
        if (test.expected) {
          assert.equal(tagsFound, test.expected, 'Markup added');
        } else {
          assert.ok(tagsFound > 0, 'Markup added with ' + tagsFound + ' tags');
        }
        if (test.output) {
          console.log('Markup added with ' + tagsFound + ' tags');
        }
        if (test.hasComments) {
          assert.ok(m.match(/<u>/), 'Comments found');
        }
      });
    });
  });


  describe('Emojis', function() {

    it('should convert ASCII art to Emojis', function() {
      let m, x = ':) and ;) and \\o/ ';
      m = markyMark(x);

      assert.ok(m, 'Got output');
      assert.equal(m.match(/&#x([\dA-Z]+);/g).length, 3, 'Emojis added');
    });
  });
});
