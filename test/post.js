import assert from 'assert';
import post from '../lib/models/post.js';
import configJs from '../lib/config.js';

describe('Post', function() {
  const config = configJs( process.cwd() + '/test');

  it('must throw errors on broken posts', function() {
    assert.throws(function() {
      post();
    }, Error);
    assert.throws(function() {
      post('test.md');
    }, Error);
    assert.throws(function() {
      post('test.md', 'Test');
    }, Error);
    assert.throws(function() {
      post('test.md', 'Test', {});
    }, Error);
    assert.doesNotThrow(function() {
      post('test.md', 'Test', {
        Description: 'Description',
        Date: new Date()
      }, config);
    }, Error);
  });

  it('must have a bunch of properties', function() {
    let testPost = post('test.md', 'Test', {
      Description: 'Description',
      Date: new Date()
    }, config);

    assert.ok(testPost.markdown);
    assert.ok(testPost.share);
    assert.ok(testPost.share.twitter);
    assert.ok(testPost.meta);
    assert.ok(testPost.meta.Description);
    assert.ok(testPost.meta.Language);
    assert.ok(testPost.meta.LanguagePosix);
    assert.ok(testPost.meta.Date);
    assert.ok(testPost.meta.DateModified);
    assert.ok(testPost.meta.Url);
    assert.ok(testPost.meta.AbsoluteUrl);
    assert.ok(testPost.meta.Link);
    assert.ok(testPost.meta.AbsoluteLink);
    assert.ok(testPost.hash);
    assert.match(testPost.hash, /^[a-z0-9]+$/);
    assert.ok(testPost.html);
    assert.strictEqual(testPost.html, '<p>Test</p>');
    assert.ok(testPost.htmlTeaser);
    assert.strictEqual(testPost.htmlTeaser, '<p>Description</p>');
    assert.strictEqual(String(testPost), testPost.hash);
    assert.strictEqual(testPost.meta.Url, testPost.meta.Link);
    assert.strictEqual(testPost.meta.AbsoluteUrl, testPost.meta.AbsoluteLink);
  });

  it('must convert Markdown into HTML', function() {
    let testMarkdown = 'Text ![](some-image.jpg) and [some internal link](internal.md).';
    let testMarkdownDescription = 'Description ![](some-image.jpg) and [some internal link](internal.md).';
    let testMeta = {
      Description: testMarkdownDescription,
      Date: new Date()
    };
    let testPost = post('test.md', testMarkdown, testMeta, config);

    //console.log(testPost);

    assert.strictEqual(testPost.markdown, testMarkdown, 'Input markdown equals output markdown');
    assert.strictEqual(testPost.meta.Description, 'Description  and some internal link.', 'Description has no markdown');
    assert.strictEqual(
      testPost.meta.MarkdownDescription,
      testMarkdownDescription,
      '...but there is a description with markdown'
    );
    assert.match(testPost.meta.Image, /some-image\.jpg/);
    assert.match(testPost.meta.ProperImage, /some-image\.jpg/);
    assert.ok(!testPost.meta.ImageAlt);
    assert.match(testPost.html, /test\/some-image\.jpg/, 'Image has path added');
    assert.match(testPost.htmlTeaser, /test\/some-image\.jpg/, 'Image has path added');
    assert.doesNotMatch(testPost.html, /internal\.md/, 'Internal links are converted');
    assert.doesNotMatch(testPost.htmlTeaser, /internal\.md/, 'Internal links are converted');
    assert.doesNotMatch(testPost.meta.Title, /\[/, 'Links are removed from title');
  });

  it('must shorten descriptions', function() {
    let testMarkdown = `Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
    sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
    sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
    clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
    tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
    vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
    no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
    consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
    dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo
    duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
    Lorem ipsum dolor sit amet.`;
    let testMeta = {
      Date: new Date()
    };
    let testPost = post('test.md', testMarkdown, testMeta, config);
    assert.ok(testPost.meta.Description.length < 180, 'Description must be shortened to somewhat like 160 characters.');

    testMarkdown = `Lorem ipsum dolor sit amet, consetetur sadipscing elitr.`;
    testMeta = {
      Date: new Date()
    };
    testPost = post('test.md', testMarkdown, testMeta, config);
    assert.strictEqual(testPost.meta.Description.length, 56, 'Description must not be shortened when to short anyway.');
  });

  it('must find images', function() {
    let testPost = post(
      'test.md',
      `Single image with style: ![(C) by Mutti](markdown.jpg#default)
- and without style: ![](markdown.jpg) - and remote image ![](http://www.example.com/remote.jpg)`,
      {
        Description: 'Single image with style: ![](description.jpg#default) - and without style: ![](description.jpg)',
        Date: new Date()
      },
      config
    );

    assert.ok(testPost.markdown);
    assert.ok(testPost.meta.MarkdownDescription);
    assert.match(testPost.meta.Image, /markdown\.jpg/);
    assert.match(testPost.meta.ProperImage, /markdown\.jpg/);
    //console.log(testPost.html);
    assert.ok(testPost.meta.ImageAlt.match(/by Mutti/));
    assert.ok(testPost.componentScripts);

    let imageStyles = testPost.getAllImagesWithStyle();
    //console.log(imageStyles);
    assert.strictEqual(imageStyles[0].filename, 'description.jpg');
    assert.strictEqual(imageStyles[0].style,    'default');
    assert.strictEqual(imageStyles[1].filename, 'description.jpg');
    assert.strictEqual(imageStyles[1].style,    null);
    assert.strictEqual(imageStyles[2].filename, 'markdown.jpg');
    assert.strictEqual(imageStyles[2].style,    'default');
    assert.strictEqual(imageStyles[3].filename, 'markdown.jpg');
    assert.strictEqual(imageStyles[3].style,    null);

    imageStyles = testPost.getAllImagesWithStyleObject();
    //console.log(imageStyles);
    assert.ok(imageStyles['description.jpg']);
    assert.ok(imageStyles['markdown.jpg']);
    assert.ok(testPost.html.match(/src="http:\/\/www\.example\.com\/remote\.jpg"/));
    assert.strictEqual(testPost.html.match(/srcset/).length, 1);
  });

  it('must also build proper galleries', function() {
    let filename = 'test.md';
    let markdown;
    let testPost;

    markdown = '![alt1](img1-64x48.jpg)';
    testPost = post(filename, markdown, {
      Description: 'None',
      Date: new Date(),
      Classes: 'images'
    }, config);
    assert.ok(!testPost.html.match(/<div class="gallery/));

    markdown = '![alt1](img1-64x48.jpg) ![alt2](img2-64x48.jpg) ![alt3](img3-64x48.jpg)';
    testPost = post(filename, markdown, {
      Description: 'None',
      Date: new Date(),
      Classes: 'images'
    }, config);
    assert.ok(testPost.html.match(/<div class="gallery/));

    markdown = '![alt1](img1-64x48.jpg) ![alt2](img2-32x24.jpg) ![alt3](img3-64x48.jpg)';
    testPost = post(filename, markdown, {
      Description: 'None',
      Date: new Date(),
      Classes: 'images'
    }, config);
    assert.ok(testPost.html.match(/<div class="gallery/));

    markdown = '![alt1](img1-64x48.jpg) ![alt2](img2-32x24.jpg) ![alt3](img3-64x48.jpg)';
    testPost = post(filename, markdown, {
      Description: 'None',
      Date: new Date()
    }, config);
    assert.ok(!testPost.html.match(/<div class="gallery/));
  }, config);

  it('must find external links', function() {
    const markdown = `www.1test.com _will_ be found as of \`marked@0.3.15\`
And [this link](http://www.2test.com) will be found.
As will be [this link](https://www.3test.com).
An ![image](https://www.4test.com) must not be found.
As will be [this link](https://www.5test.com/some-compilcated-foo?a#b).
But not example.6test.com or 7test.com (URLs with subdomains without proper links)`
  ;
    const html = post('test.md', markdown, {
      Description: 'None',
      Date: new Date()
    }, config);
    const testLinks = html.getAllExternalLinks();

    //console.log(testLinks);

    assert.strictEqual(testLinks.length, 4);
    assert.strictEqual(testLinks[0],    'http://www.1test.com');
    assert.strictEqual(testLinks[1],    'http://www.2test.com');
    assert.strictEqual(testLinks[2],    'https://www.3test.com');
    assert.strictEqual(testLinks[3],    'https://www.5test.com/some-compilcated-foo?a#b');
  });

  it('must convert internal links', function() {
    const markdown = `This is an [internal link](internal-link.md),
as is [this](internal-link2/index.md) and [this](../internal-link3/index.md).`;
    const testPost = post('test.md', markdown, {
      Description: 'Description',
      Date: new Date()
    }, config);
    const testLinks = testPost.getAllExternalLinks();
    //console.log(testPost.html);

    assert.strictEqual(testLinks.length, 0);
    assert.ok(testPost.html.match(/\/posts\/internal-link\//));
    assert.ok(testPost.html.match(/\/posts\/internal-link2\//));
    assert.ok(testPost.html.match(/\/posts\/internal-link3\//));
  });

  it('must do proper headlining', function() {
    const markdown = `Title
=======

Title 2
-------

## Title 2 too

### More Tütle 2

#### More Title 3!

##### More T#tle 4
`;
    const testPost = post('test.md', markdown, {
      Description: 'Description',
      Date: new Date()
    }, config);

    assert.ok(!testPost.html.match(/<h1/g), 'Removes <h1> from article');
    assert.strictEqual(testPost.html.match(/<h2 id="/g).length,               2);
    assert.strictEqual(testPost.html.match(/<h3 id="more-tütle-2"/g).length,  1);
    assert.strictEqual(testPost.html.match(/<h4 id="more-title-3"/g).length, 1);
    assert.strictEqual(testPost.html.match(/<h5 id="more-ttle-4"/g).length,  1);
  });

  it('must properly convert Markdown tables into HTML', function() {
    const markdown = `##### Tic Tac Toe

| \\    | A   | B   | C   |
| ----- | --- | --- | --- |
| **1** | X   | X   | X   |
| **2** | O   | X   |     |
| **3** |     | O   | O   |


##### Centred tables

| \\    | A   | B   | C   |
| ----- |:--- |:---:| ---:|
| **1** | X   | X   | X   |
| **2** | O   | X   |     |
| **3** |     | O   | O   |
`;
    const testPost = post('test.md', markdown, {
      Description: 'Description',
      Date: new Date()
    }, config);
    //console.log(testPost.html);

    assert.strictEqual(testPost.html.match(/<caption id="/g).length, 2);
    assert.strictEqual(testPost.html.match(/<th>/g).length,          5);
    assert.strictEqual(testPost.html.match(/<th(?:>|\s)/g).length,   14);
    assert.strictEqual(testPost.html.match(/<thead/g).length,        2);
    assert.strictEqual(testPost.html.match(/<tbody/g).length,        2);
    assert.strictEqual(testPost.html.match(/text-align/g).length,    12);
    assert.strictEqual(testPost.html.match(/table-cell--/g).length,  3);
  });

  it('must properly convert Markdown tables into HTML', function() {
    const markdown = `##### Row header
| \\  | A   | B   | C   |
|:--- | ---:|:---:|:--- |
| 1   | X   | X   | X   |
| 2   | O   | X   |     |
| 3   |     | O   | O   |
`;
    const testPost = post('test.md', markdown, {
      Description: 'Description',
      Date: new Date()
    }, config);
    //console.log(testPost.html);

    assert.strictEqual(testPost.html.match(/<caption id="/g).length, 1,  'Has <caption>');
    assert.strictEqual(testPost.html.match(/<th(?:>|\s)/g).length,   7,  'Has <th>');
    assert.strictEqual(testPost.html.match(/<thead/g).length,        1,  'Has <thead>');
    assert.strictEqual(testPost.html.match(/<tbody/g).length,        1,  'Has <tbody>');
    assert.strictEqual(testPost.html.match(/text-align/g).length,    16);
    assert.strictEqual(testPost.html.match(/scope="row"/g).length,   3);
    assert.strictEqual(testPost.html.match(/table-cell--/g).length,  4);
  });

  it('must properly convert checkbox lists', function() {
    const markdown = `### Charaktere

* [ ] Interessante und einzigartige Charaktere mit Tiefgang, mit denen man mitfühlt
* [x] Spannende und/oder witzige Interaktion zwischen den Charakteren
* [x] Verzicht auf aufgepfropfte Romanzen oder Fehden

### Ambiente

* [x] Technik im Stil der alten Filme - kein Hochglanz, kein High-Tech, sondern gutes altes LoFi-SciFi
* [x] Coole, charakteristische Fahrzeuge bzw. Raumschiffe, gerne auch etwas abgewetzt
* [x] Orte, an denen man sich zuhause fühlt, und nicht aus dem Prospekt kommen
`;
    const testPost = post('test.md', markdown, {
      Description: 'Description',
      Date: new Date()
    }, config);
    //console.log(testPost.html);

    assert.ok(!testPost.html.match(/dl/g));
    assert.strictEqual(testPost.html.match(/<ul/g).length,  2);
    assert.ok(!testPost.html.match(/<ul>/g));
    assert.strictEqual(testPost.html.match(/<li/g).length,   6);
    assert.ok(!testPost.html.match(/<li>/g));
  });

  it('must do proper HTML', function() {
    const markdown = `It's complicated
-----------------

It <i>always</i> is and \`<em>\` is not a stranger to this story.`;
    const testPost = post('test.md', markdown, {
      Description: 'HTML\'s - a &quot;disaster&quot; <em>waiting</em> to happen',
      Date: new Date()
    }, config);
    //console.log(testPost.meta);

    assert.ok(!testPost.html.match(/<em>/g));
    assert.strictEqual(testPost.html.match(/<i>/g).length,  1);
    assert.ok(!testPost.meta.Title.match(/&#/g));
    assert.ok(!testPost.meta.Description.match(/&quot;/g));
    assert.ok(!testPost.meta.Description.match(/<em>/g));
  });

  it('must handle galleries', function() {
    const markdown = `Flugnavigation mittels Rechenscheibe zum Selberbau
=========

![Eine Rechenscheibe zur Berechnung von Distanzen und Geschwindigkeiten.](distanz-geraet.jpg#quad) Da ich mich
in letzter Zeit verstärkt mit
der [Jagd-Fliegerei des Zweiten Weltkriegs](../2021-01-31-einsteiger-tutorial-fuer-il-2-sturmovik/index.md)
beschäftigt habe, musste ich mich wohl oder übel verstärkt mit Flug-Navigation ohne GPS oder sonstige technische
Unterstützung auseinandersetzen. Dabei hilft es enorm, den Zusammenhang zwischen Fluggeschwindigkeit und zurückgelegter
Strecke zu kennen.

![](distanz-geraet-detail.jpg#default)
`;
    const testPost = post('test.md', markdown, {
      Date: new Date(),
      Classes: 'Images'
    }, config);
    //console.log(testPost.html);

    assert.strictEqual(testPost.html.match(/"gallery__link"/g).length,  2);
    assert.ok(testPost.html.match(/title="/g).length >= 2);
  });
  it('must handle download links', function() {
    const markdown = `Vector-Art für "Hardspace: Shipbreakers"
=========

![](lynx-salvage.svg#quad) Das Spiel [Hardspace: Shipbreakers](https://hardspace-shipbreaker.com/) hat es
 mir sehr angetan. Neben dem gelungenen Spielprinzip zieht mich vor allen Dingen die Atmosphäre in den Bann.

Zur Atmosphäre gehört das allgegenwärtige Branding des Arbeitgebers des Protagonisten, "Lynx Salvage". Für die
private Verwendung habe ich daher das [Logo der Firma "Lynx Salvage" als SVG-Vektor-Art](lynx-salvage.svg) vektorisiert.

Diese Datei besteht aus überschneidungsfreien Außenlinien des Logos und des Schriftzugs - und eignet
sich daher zum Bedrucken oder Besticken von Kleidung.`;
    const testPost = post('test.md', markdown, {
      Date: new Date()
    }, config);

    assert.strictEqual(testPost.html.match(/[^"]+\/lynx-salvage\.svg/g).length,  2);
    assert.strictEqual(testPost.htmlTeaser.match(/[^"]+\/lynx-salvage\.svg/g).length,  2);
    assert.strictEqual(testPost.safeHtml.match(/[^"]+\/lynx-salvage\.svg/g).length,  2);
    assert.strictEqual(testPost.safeHtmlTeaser.match(/[^"]+\/lynx-salvage\.svg/g).length,  2);
  });

  it('must handle Web Components (at least for AMP pages)', function() {
    const markdown = `Vector-Art für "Hardspace: Shipbreakers"
=========

<amp-youtube>A B C</amp-youtube>

`;
    const testPost = post('test.md', markdown, {
      Date: new Date()
    }, config);

    assert.ok(testPost.html);
    assert.ok(testPost.ampHtml);
    assert.ok(testPost.componentScripts, 'Found Web Component scripts');
    assert.ok(testPost.componentScripts.html, 'Found Web Component scripts in regular HTML');
    assert.ok(testPost.componentScripts.ampHtml, 'Found Web Component scripts in AMP HTML');
  });
});
