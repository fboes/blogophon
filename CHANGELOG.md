Change log
==========

For detailed information check [Blogophon's releases on Github](https://github.com/fboes/blogophon/releases).

* 🎁 Improve syntax highlighting for shell variables

2.1.5
-----

* 💊 Limit meta description to 160 characters 
* 💊 Updating Service Worker for PWA
* 🎁 Add syntax highlighting for nginx configuration code

2.1.4
-----

* 💣 Major overhaul of `<blockquote>` HTML
* 💊 Improve schema.org HTML for publisher property
* 💊 Fix blockquotes with `cite`
* 💊 Improve `aria` attributes in HTML
* 💊 Lots of small HTML and JavaScript fixes
* 💊 Fixing [maskable icons to `manifest.json`](https://css-tricks.com/maskable-icons-android-adaptive-icons-for-your-pwa/)
* 🎁 Improve documentation for WebP and custom schema.org properties
* 🎁 Add `gzip` to Apache configuration stub
* 🎁 Add Twitter author for articles
* 🎁 Add more compact YouTube embedding HTML by using `srcdoc` on `iframe`

2.1.3
-----

* 💊 Fix shortening of article descriptions to max. ~320 characters
* 💊 Fix Markdown conversion for XML comments
* 💊 Fix Markdown conversion for titles and description, adding `htmlTitle`
* 💊 Remove unsupported `dir()` from CSS
* 💊 Fix output of HTML entities in non-HTML strings
* 🔧 Add Stylelint for testing
* 🎁 Improve HTML for blockquotes
* 🎁 Adding [maskable icons to `manifest.json`](https://css-tricks.com/maskable-icons-android-adaptive-icons-for-your-pwa/)

2.1.2
-----

* 💊 Enable translations in templates
* 💊 Update WhatsApp sharing link, ditch protocol links
* 💊 Fix CLI output for `--help` and `--version`
* 💊 Fix HTML for checkbox lists and definition lists
* 💊 Improve handling of RTL layout
* 🎁 Add more Markdown syntax highlighting to better support C++ code blocks
* 🎁 Add Handlebar helper `lazyloadAttributes`
* 🎁 Make site search URL configurable
* 🎁 Enable image scaler for WebP
* 🎁 Enhance default theme
* 🎁 Enhance conversion of fractions like `(2/10)`
* 🎁 Streamline Nginx configuration
* 🎁 Enhance accessibility by adding new attributes to HTML
* 🎁 Add `:yes:` and `:no:`
* 🎁 Add new way to add row headers to `<table>`
* 🎁 Add more `rel`-attributes to links
* 🎁 Add Handlebar helpers `removeImages` & `lazyloadImages`
* 🎁 Add `csvQuote` to Handlebar templating
* 🔧 Update development tools to Gulp@4.0.0

2.1.1
-----

* 💊 Add PWA and SEO fixes to AMP templates
* 💊 Fix handling of locales like `de-DE` or `en-US` in dates
* 💊 Fix broken `<table>` alignment HTML from GFM specs
* 🎁 Add Markdown for call-outs
* 🎁 Add Handlebar tests `ifHasDimensions`, `ifHasAspectRatio`, `ifHasMinDimensions` & `ifHasMaxDimensions`

2.1.0
-----

* 💊 Generate Apache configuration file, Nginx configuration file, `.htaccess` to `user` directory
* 💊 Improve `manifest.json` by ignoring illegal image URLs and adding proper `short_name`
* 🎁 Add definition lists for Markdown
* 🎁 Add more fractions like `(2/3)` to be converted in Markdown
* 🎁 Add [Markdown for conversations](docs/markdown.md)
* 🎁 Add [Progressive Web App for offline functionality](docs/special-features.md)
* 🎁 Add `title` to `<iframe>` for improved accessibility

2.0.1
-----

* 💣 Move timestamp conversion into templates, freeing models of converted timestamps
* 💣 Switch unit tests to use [Mocha](https://mochajs.org/) instead of Nodeunit
* 💣 Change Geo-JSON properties to match JSON-Feed, add `atom:update` to RSS & JSON-RSS, fix date format in feeds
* 💣 Replace `_language` in JSON feed with more general `_rss`
* 💣 Replace proprietary date properties in JSON-RSS with Atom-properties and change JSON-RSS to have proper XMLNS
* 💣 Switching Markdown file structure from `post/TITLE.md` to `post/TITLE/index.md` (see documentation on [how to move articles into new structure](advanced-stuff.md))
* 💊 Fix `browserconfig.xml` and the way configuration is handled
* 💊 Fix time zone for ICS files
* 🎁 Add tracking pixel to newsfeeds, with `%url` and `%title` as replacements
* 🎁 Add and improve SQL syntax highlighting in Markdown articles
* 🎁 Add more Handlebar helpers like `asciify` and `niceShorten`
* 🎁 Fix schema.org recipes by removing some properties by adding `ifEquals` Handlebars helper
* 🎁 Add `--version` CLI option to all CLI tools
* 🎁 Make configuration testable
* 🎁 Improve Bash syntax highlighting in Markdown articles
* 🎁 Add [Webmention](https://indieweb.org/Webmention) to notify other blogs of links
* 🎁 Add favicons to feeds
* 🎁 Add new properties to `manifest.json`
* 🎁 Add [abc music notation](http://abcnotation.com/wiki/abc:standard:v2.1) syntax highlighter
* 🎁 Add [Exapunks AXIOM](http://www.zachtronics.com/exapunks/) syntax highlighter
* 🎁 Add more information to `opensearch.xml`
* 🎁 Add Handlebar helpers to export Google Tag Manager Datalayer
* 🎁 Add Handlebar helpers for data dumping

1.5.0
-----

* 💣 Change template engine from Mustache to [Handlebars](https://handlebarsjs.com/)
* 🎁 Add `hreflang`-attribute to links leading to articles with different language
* 🎁 Improve code styling for Markdown code examples in blog posts
* 🎁 Improve `h-entry`, `h-feed` & `h-card` [microformats](https://indieweb.org/microformats2) for better syndication
* 🎁 Add configurable HTML snippets for analytics
* 🎁 Add CSS variable `--gallery-count` to gallery HTML
* 💊 Fix creating new projects in empty folders

1.4.4
-----

* 🎁 Added `colspan` for tables
* 🎁 Added issue template for filing Github issues and improved development documentation
* 🎁 Added configuration field for copyright notice which will show up on all pages and feeds
* 🎁 Changed `Expires` headers to have HTML snippets perform better
* 🎁 Added mechanism to switch between AJAX snippets and Server Side Includes
* 🎁 Markdown now supports links without extra link syntax
* 🎁 Adding MIME type to favicons, supporting SVG favicons
* 🎁 Adding wordcount for articles via `meta.Wordcount`
* 🎁 Support for podcasts / RSS enclosures
* 💊 Fixed `<caption>` for tables
* 💊 Fixed broken NPM dependencies
* 💊 Converting relative links to absolute links in syndication files
* 💊 XHTML fixes
* 💊 Fixed Markdown examples for tables
* 💊 General fix to meta files like GEO-JSON, Apple News Format, KML etc.
* 💊 Fixed audio and video file types and adding more file types
* 💊 Better schema.org HTML for recipes

1.4.3
-----

* 💊 Fixed broken page generator

1.4.2
-----

* 💊 Fixed broken image generator

1.4.1
-----

* 🎁 Supporting SVG & WebP images
* 🎁 Converting images folder into general attachment files folder
* 🎁 Improved accessibility
* 🎁 Pressing ESC in browser closes image popups
* 💊 Improved heading structure in HTML output

1.4.0
-----

* 🎁 Markdown articles accessible via http
* 🎁 Adding `<div class="table-wrapper"></div>` around `<table>…</table>`
* 🎁 Improved editing of tags and dates
* 🎁 Added update instructions
* 🎁 Adding table captions with `#####` headlines
* 🎁 Moved Emoji converter to separate module and added more Emojis
* 🎁 Improved layout for gallery
* 💊 Switched back to `marked`
* 💊 Fixed URL generator to generate better filenames and delete old categories
* 💣 Changed internal file system structure to match Node.js standards

1.3.0
-----

* 🎁 New template variables for first and last page on index pages
* 🎁 Adding INI syntax highlighting
* 💊 Switched to `8fold-marked`
* 💊 Removed AMP pages from sitemap as of https://twitter.com/JohnMu/status/786588362706673664
* 💊 Fixing parser for articles without YAML header
* 💣 Bumping to ECMA version 6, Node 4

1.2.1
-----

* 🎁 Adding support for recipes
* 🎁 Adding support for embedding JSFiddle
* 🎁 Adding YAML syntax highlighting
* 🎁 Linking related articles in post
* 🎁 Adding article type "Micro post"
* 🎁 Adding article type "Review"
* 🎁 Improved drafting of articles
* 🎁 Image sublines for images
* 🎁 Minor styling update to default theme
* 💊 Fixed `nginx.conf`

1.2.0
-----

* 🎁 Support for [JSON Feed](https://jsonfeed.org/)
* 🎁 i18n
* 🎁 Teaser snippets
* 🎁 New option to automatically add the current date to generated filenames
* 🎁 Embedding of Github Gist added
* 💊 Multiline YAML parser added, fixed broken YAML generation

1.1.1
-----

* 🎁 Improving code highlighting by handling strings and comments separately from standard code
* 🎁 Adding `h-entry` microformats and English template language
* 🎁 Added `8<` symbol (for snippets)
* 🎁 Codepen.io integration
* 🎁 More sharing links (Pocket, Tumblr, Wordpress)
* 🎁 JSON for Slack added
* 🎁 Improved default theme

1.1.0
-----

* 🎁 New (and very basic) default theme
* 🎁 Image gallery added
* 🎁 Adding support for video / audio tags in Markdown
* 💊 Fixed major bug for installations in subfolders

1.0.4
-----

* 🎁 Making Yandex and Nginx happy
* 🎁 New portrait image size
* 💊 Fixed minor problem with paragraphs containing attributes not being found by `marky-mark.js`

1.0.3
-----

* 🎁 Documentation improved
* 🎁 Geocoder added, see [Markdown documentation](docs/markdown.md).

1.0.2
-----

* 💊 Fixed broken partials

1.0.1
-----

* 🎁 Documentation improved

1.0.0
-----

* 🎁 Initial stable release
