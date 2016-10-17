Special features
=================

All features listed here can be activated during installation. Later on you can add features by calling `install.js` again, or edit your `user/config.json`.

Multiple authors
----------------

If this feature is activated, there will be index pages generated for every author, so you can see all pages written by a single author.

For each article with an author different from the set default auhtor, just [add the author name](markdown.md).

RSS
----------------

For every index page (start page, tag pages, author pages) there will be a corresponding RSS newsfeed.

All required links will be added to your page.

ATOM
----------------

For every index page (start page, tag pages, author pages) there will be a corresponding ATOM newsfeed.

All required links will be added to your page.

JSON-RSS
----------------

For every index page (start page, tag pages, author pages) there will be a corresponding JSON-RSS newsfeed.

All required links will be added to your page.

This is like a RSS newsfeed, but in JSON. This will help parsers to digest information from your page.

Apple News
----------------

For every article there will be a corresponding `article.json`, to be digested by Apple News.

You still have to push these JSON files to Apple.

Accelerated Mobile Pages
----------------

For every article there will be a corresponding `amp.html`, to be found by Google Search Bot and indexed as a special page for mobile users.

All required links will be added to your page.

Microsoft tiles
----------------

This will add the last five articles as notifications to any user who adds your page to his/her Microsoft Windows desktop tiles.

GeoJSON
-------

For every index page (start page, tag pages, author pages) there will be a corresponding GeoJSON newsfeed.

All required links will be added to your page.

GeoJson will have all pages with geo coordinates. You may [add geo coordinates to any article](markdown.md). GeoJSON can be digestet by Google Maps or Leaflet.js.

ICS-Calendar
------------

For every index page (start page, tag pages, author pages) there will be a corresponding ICS calendar `calendar.ics`.

ICS calendards can be subscribed to with any calendar software. This results in a calendar with all your blog posts being daily events.