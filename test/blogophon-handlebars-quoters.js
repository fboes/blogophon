import assert from 'assert';
import blogophonHandlebarsQuoter from '../lib/helpers/blogophon-handlebars-quoters.js';

describe('Blogophon Handlebars Quoters', function() {
  it('must not have any syntax errors', function() {
    assert.ok(blogophonHandlebarsQuoter, 'Does compile');
  });

  it('must convert images', function() {
    let tested = blogophonHandlebarsQuoter._getDimensions('test/test-123x456.jpg');
    assert.ok(tested);
    assert.strictEqual(tested.width,  123);
    assert.strictEqual(tested.height, 456);
    assert.notStrictEqual(tested.width,  "123");
    assert.notStrictEqual(tested.height, "456");

    tested = blogophonHandlebarsQuoter._getDimensions('test/test.jpg');
    // console.log(tested);
    assert.ok(tested);
    assert.strictEqual(tested.width,  0);
    assert.strictEqual(tested.height, 0);

    tested = blogophonHandlebarsQuoter._getRatio(16, 9);
    assert.strictEqual(tested,  1.78);

    tested = blogophonHandlebarsQuoter._getRatio(1920, 1080);
    assert.strictEqual(tested,  1.78);

    tested = blogophonHandlebarsQuoter._getRatio(4, 3);
    assert.strictEqual(tested,  1.33);

    tested = blogophonHandlebarsQuoter._getRatio(640, 480);
    assert.strictEqual(tested,  1.33);
  });

  it('must add lazy loading to images and iframes', function() {
    const inputHtml = `<img src="celebration.jpg" alt="..." />
<iframe src="video-player.html"></iframe>`;
    let outputHtml = blogophonHandlebarsQuoter.lazyloadAttributes(inputHtml);
    assert.strictEqual(outputHtml.match(/ loading="lazy"/g).length,  2);

    outputHtml = blogophonHandlebarsQuoter.lazyloadAttributes(inputHtml, 'eager');
    assert.strictEqual(outputHtml.match(/ loading="eager"/g).length,  2);

    outputHtml = blogophonHandlebarsQuoter.lazyloadAttributes(inputHtml, 'lazy', true);
    assert.strictEqual(outputHtml.match(/ loading="lazy"/g).length,  1);

    outputHtml = blogophonHandlebarsQuoter.lazyloadAttributes(inputHtml, 'lazy', 1);
    assert.strictEqual(outputHtml.match(/ loading="lazy"/g).length,  1);
  });

  it('must properly identify Gopher links', function() {
    assert.strictEqual(blogophonHandlebarsQuoter._getGopherUrlType('https://www.example.com'), 'h');
    assert.strictEqual(blogophonHandlebarsQuoter._getGopherUrlType('/test'), '9');
    assert.strictEqual(blogophonHandlebarsQuoter._getGopherUrlType('/test/'), '1');
    assert.strictEqual(blogophonHandlebarsQuoter._getGopherUrlType('/test/index.txt'), '0');
    assert.strictEqual(blogophonHandlebarsQuoter._getGopherUrlType('/test/index.md'), '0');
    assert.strictEqual(blogophonHandlebarsQuoter._getGopherUrlType('/test/index.gif'), 'g');
    assert.strictEqual(blogophonHandlebarsQuoter._getGopherUrlType('/test/index.jpg'), 'I');
    assert.strictEqual(blogophonHandlebarsQuoter._getGopherUrlType('/test/index.pdf'), 'd');
  });

  it('must properly modify Gopher text', function() {
    let inputPlainText = `![](image.jpg) Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.

At vero eos et accusam et justo duo dolores et
ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
no sea takimata sanctus est Lorem ipsum dolor sit amet.`;
    let outputPlainText = blogophonHandlebarsQuoter.gophermapQuote({
      fn: () => {
        return inputPlainText;
      }
    });


    assert.strictEqual(outputPlainText.match(/!\[\]\(image\.jpg\)/g), null, 'Removed image');
    assert.strictEqual(outputPlainText.match(/\n/g).length, 10, 'Added line breaks');

    inputPlainText = `SpaceX hat einen kleinen Andock-Simulator für die
[Internationale Raum Station](https://iss-sim.spacex.com/ "nomention") veröffentlicht. In diesem Simulator
darf man versuchen, einen "<i>Space Dragon</i>"-Transporter an der ISS anzudocken. Dieser Simulator läuft direkt
im Browser, und lässt sich mit Maus oder Tastatur (undokumentiert) steuern.

Falls Ihr lieber auf dem Trockenen üben wollt: Es gibt
ein [fantastisches Lego-Modell der ISS](https://www.lego.com/de-de/product/international-space-station-21321) -
die dort mitgelieferten Teile für das inzwischen ausgemusterte <i>Space Shuttle</i> kann man wahrscheinlich
für den Bau einer [<i>Space Dragon</i>-](gopher://baud.baby/0/phlog/fs20181102.txt)
oder [<i>Soyuz</i>-Kapsel](../internal/index.md) verwenden, die tatsächlich an der ISS im Betrieb sind.

Mehr dazu gibt es in der [Raumfahrt-Sektion](/tagged/raumfahrt/).`;
    outputPlainText = blogophonHandlebarsQuoter.gophermapQuote({
      fn: () => {
        return inputPlainText;
      }
    });

    assert.strictEqual(outputPlainText.match(/\n/g).length, 17, 'Added line breaks');
    assert.strictEqual(outputPlainText.match(/\nh/g).length, 2, 'Added h links');
    assert.strictEqual(outputPlainText.match(/\n9/g).length, 1, 'Added "9" links');
  });
});
