Change log
==========

For detailed information check [Blogophon's releases on Github](https://github.com/fboes/blogophon/releases).

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

* :pill: Add PWA and SEO fixes to AMP templates
* :pill: Fix handling of locales like `de-DE` or `en-US` in dates
* :pill: Fix broken <table> alignment HTML from GFM specs
* :gift: Add Markdown for call-outs
* :gift: Add Handlebar tests `ifHasDimensions`, `ifHasAspectRatio`, `ifHasMinDimensions` & `ifHasMaxDimensions`

2.1.0
-----

* :pill: Generate Apache configuration file, Nginx configuration file, `.htaccess` to `user` directory
* :pill: Improve `manifest.json` by ignoring illegal image URLs and adding proper `short_name`
* :gift: Add definition lists for Markdown
* :gift: Add more fractions like `(2/3)` to be converted in Markdown
* :gift: Add [Markdown for conversations](docs/markdown.md)
* :gift: Add [Progressive Web App for offline functionality](docs/special-features.md)
* :gift: Add `title` to `<iframe>` for improved accessibility

2.0.1
-----

* :bomb: Move timestamp conversion into templates, freeing models of converted timestamps
* :bomb: Switch unit tests to use [Mocha](https://mochajs.org/) instead of Nodeunit
* :bomb: Change Geo-JSON properties to match JSON-Feed, add `atom:update` to RSS & JSON-RSS, fix date format in feeds
* :bomb: Replace `_language` in JSON feed with more general `_rss`
* :bomb: Replace proprietary date properties in JSON-RSS with Atom-properties and change JSON-RSS to have proper XMLNS
* :bomb: Switching Markdown file structure from `post/TITLE.md` to `post/TITLE/index.md` (see documentation on [how to move articles into new structure](advanced-stuff.md))
* :pill: Fix `browserconfig.xml` and the way configuration is handled
* :pill: Fix time zone for ICS files
* :gift: Add tracking pixel to newsfeeds, with `%url` and `%title` as replacements
* :gift: Add and improve SQL syntax highlighting in Markdown articles
* :gift: Add more Handlebar helpers like `asciify` and `niceShorten`
* :gift: Fix schema.org recipes by removing some properties by adding `ifEquals` Handlebars helper
* :gift: Add `--version` CLI option to all CLI tools
* :gift: Make configuration testable
* :gift: Improve Bash syntax highlighting in Markdown articles
* :gift: Add [Webmention](https://indieweb.org/Webmention) to notify other blogs of links
* :gift: Add favicons to feeds
* :gift: Add new properties to `manifest.json`
* :gift: Add [abc music notation](http://abcnotation.com/wiki/abc:standard:v2.1) syntax highlighter
* :gift: Add [Exapunks AXIOM](http://www.zachtronics.com/exapunks/) syntax highlighter
* :gift: Add more information to `opensearch.xml`
* :gift: Add Handlebar helpers to export Google Tag Manager Datalayer
* :gift: Add Handlebar helpers for data dumping

1.5.0
-----

* :bomb: Change template engine from Mustache to [Handlebars](https://handlebarsjs.com/)
* :gift: Add `hreflang`-attribute to links leading to articles with different language
* :gift: Improve code styling for Markdown code examples in blog posts
* :gift: Improve `h-entry`, `h-feed` & `h-card` [microformats](https://indieweb.org/microformats2) for better syndication
* :gift: Add configurable HTML snippets for analytics
* :gift: Add CSS variable `--gallery-count` to gallery HTML
* :pill: Fix creating new projects in empty folders

1.4.4
-----

* :gift: Added `colspan` for tables
* :gift: Added issue template for filing Github issues and improved development documentation
* :gift: Added configuration field for copyright notice which will show up on all pages and feeds
* :gift: Changed `Expires` headers to have HTML snippets perform better
* :gift: Added mechanism to switch between AJAX snippets and Server Side Includes
* :gift: Markdown now supports links without extra link syntax
* :gift: Adding MIME type to favicons, supporting SVG favicons
* :gift: Adding wordcount for articles via `meta.Wordcount`
* :gift: Support for podcasts / RSS enclosures
* :pill: Fixed `<caption>` for tables
* :pill: Fixed broken NPM dependencies
* :pill: Converting relative links to absolute links in syndication files
* :pill: XHTML fixes
* :pill: Fixed Markdown examples for tables
* :pill: General fix to meta files like GEO-JSON, Apple News Format, KML etc.
* :pill: Fixed audio and video file types and adding more file types
* :pill: Better schema.org HTML for recipes

1.4.3
-----

* :pill: Fixed broken page generator

1.4.2
-----

* :pill: Fixed broken image generator

1.4.1
-----

* :gift: Supporting SVG & WebP images
* :gift: Converting images folder into general attachment files folder
* :gift: Improved accessibility
* :gift: Pressing ESC in browser closes image popups
* :pill: Improved heading structure in HTML output

1.4.0
-----

* :gift: Markdown articles accessible via http
* :gift: Adding `<div class="table-wrapper"></div>` around `<table>…</table>`
* :gift: Improved editing of tags and dates
* :gift: Added update instructions
* :gift: Adding table captions with `#####` headlines
* :gift: Moved Emoji converter to separate module and added more Emojis
* :gift: Improved layout for gallery
* :pill: Switched back to `marked`
* :pill: Fixed URL generator to generate better filenames and delete old categories
* :bomb: Changed internal file system structure to match Node.js standards

1.3.0
-----

* :gift: New template variables for first and last page on index pages
* :gift: Adding INI syntax highlighting
* :pill: Switched to `8fold-marked`
* :pill: Removed AMP pages from sitemap as of https://twitter.com/JohnMu/status/786588362706673664
* :pill: Fixing parser for articles without YAML header
* :bomb: Bumping to ECMA version 6, Node 4

1.2.1
-----

* :gift: Adding support for recipes
* :gift: Adding support for embedding JSFiddle
* :gift: Adding YAML syntax highlighting
* :gift: Linking related articles in post
* :gift: Adding article type "Micro post"
* :gift: Adding article type "Review"
* :gift: Improved drafting of articles
* :gift: Image sublines for images
* :gift: Minor styling update to default theme
* :pill: Fixed `nginx.conf`

1.2.0
-----

* :gift: Support for [JSON Feed](https://jsonfeed.org/)
* :gift: i18n
* :gift: Teaser snippets
* :gift: New option to automatically add the current date to generated filenames
* :gift: Embedding of Github Gist added
* :pill: Multiline YAML parser added, fixed broken YAML generation

1.1.1
-----

* :gift: Improving code highlighting by handling strings and comments separately from standard code
* :gift: Adding `h-entry` microformats and English template language
* :gift: Added `8<` symbol (for snippets)
* :gift: Codepen.io integration
* :gift: More sharing links (Pocket, Tumblr, Wordpress)
* :gift: JSON for Slack added
* :gift: Improved default theme

1.1.0
-----

* :gift: New (and very basic) default theme
* :gift: Image gallery added
* :gift: Adding support for video / audio tags in Markdown
* :pill: Fixed major bug for installations in subfolders

1.0.4
-----

* :gift: Making Yandex and Nginx happy
* :gift: New portrait image size
* :pill: Fixed minor problem with paragraphs containing attributes not being found by `marky-mark.js`

1.0.3
-----

* :gift: Documentation improved
* :gift: Geocoder added, see [Markdown documentation](docs/markdown.md).

1.0.2
-----

* :pill: Fixed broken partials

1.0.1
-----

* :gift: Documentation improved

1.0.0
-----

* :gift: Initial stable release
