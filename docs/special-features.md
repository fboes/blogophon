![Blogophon -](blogophon.png) Special features
=================

All features listed here can be activated during installation. Later on you can add features by calling `blogophon` again, or edit your `user/config.json`.

Multiple authors
----------------

If this feature is activated, there will be index pages generated for every author, so you can see all pages written by a single author.

For each article with an author different from the set default author, just [add the author name](markdown.md).

RSS
----------------

For every index page (start page, tag pages, author pages) there will be a corresponding RSS newsfeed.

All required links will be added to your page.

ATOM
----------------

For every index page (start page, tag pages, author pages) there will be a corresponding ATOM newsfeed.

All required links will be added to your page.

Teaser snippets
---------------

This will generate small teaser snippets for your articles, linking to other articles.

JSON Feed
----------------

For every index page (start page, tag pages, author pages) there will be a corresponding [JSON Feed](https://jsonfeed.org/).

All required links will be added to your page.

JSON-RSS
----------------

For every index page (start page, tag pages, author pages) there will be a corresponding JSON-RSS newsfeed.

All required links will be added to your page.

This is like a RSS newsfeed, but in JSON. This will help parsers to digest information from your page. See [JSON-RSS](http://blog.3960.org/post/8478676503/rss-mit-json).

JSON for Slack
----------------

For every index page (start page, tag pages, author pages) there will be a corresponding `slack.json` newsfeed.

This JSON is understood by [Slack's slash command](https://slack.com/apps/A0F82E8CA-slash-commands), so you can have a Slack bot telling you about current articles.

Markdown
--------

For every article there will be a corresponding `article.md`.

Facebook Instant Articles
-------------------------

For every index page (start page, tag pages, author pages) there will be a corresponding RSS newsfeed suitable for [Facebook Instant Articles](https://developers.facebook.com/docs/instant-articles/publishing/setup-rss-feed).

To have all links for discoverability of the RSS newsfeed showing up on your page, you also have to activate "RSS".

Apple News
----------------

For every article there will be a corresponding `article.json`, to be digested by [Apple News](https://developer.apple.com/library/content/documentation/General/Conceptual/Apple_News_Format_Ref/AppleNewsFormat.html#//apple_ref/doc/uid/TP40015408-CH79-SW1).

You still have to push these JSON files to Apple.

Accelerated Mobile Pages
----------------

For every article there will be a corresponding [Accelerated Mobile Page](https://www.ampproject.org/) by the name of `amp.html`, to be found by Google Search Bot and indexed as a special page for mobile users.

All required links will be added to your page.

Microsoft tiles
----------------

This will add the last five articles as notifications to any user who adds your page to his/her Microsoft Windows desktop tiles.

GeoJSON
-------

For every index page (start page, tag pages, author pages) there will be a corresponding GeoJSON newsfeed.

All required links will be added to your page.

GeoJson will show all pages with geo coordinates. You may [add geo coordinates to any article](markdown.md). GeoJSON can be digested by Google Maps or Leaflet.js.

The `properties` of each location will be structured like an `item` in [JSON Feed](https://jsonfeed.org/), without `id` & `content_text`, but with a `marker-symbol`.

KML
-------

For every index page (start page, tag pages, author pages) there will be a corresponding Keyhole Markup Language document.

All required links will be added to your page.

KML will show all pages with geo coordinates. You may [add geo coordinates to any article](markdown.md). KML can be digested by Google Earth.

ICS-Calendar
------------

For every index page (start page, tag pages, author pages) there will be a corresponding ICS calendar `calendar.ics`.

ICS calendars can be subscribed to with any calendar software. This results in a calendar with all your blog posts being daily events.

AJAX
-----

Exports all articles as `index.json`. These files may be used for AJAX loading of articles.

Exports all indexes as `index.json`, containing references to the AJAX articles.

Server Side Includes
--------------------

Check this option if your web server supports [Server Side Includes](https://en.wikipedia.org/wiki/Server_Side_Includes). This improves browser and search engine performance by replacing all AJAX snippets with Server Side Includes. These snippets are used for generating related links etc.

---

Return to [table of contents](README.md).
