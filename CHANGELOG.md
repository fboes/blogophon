Change log
==========

For detailed information check [Blogophon's releases on Github](https://github.com/fboes/blogophon/releases).

* :gift: Markdown now supports links without extra link syntax
* :gift: Adding MIME type to favicons, supporting SVG favicons
* :gift: Adding wordcount for articles via `meta.Wordcount`
* :gift: Support for podcasts / RSS enclosures
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
