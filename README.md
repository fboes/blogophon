Blogophon
=========

[![Dependency Status](https://david-dm.org/fboes/blogophon/status.svg)](https://david-dm.org/fboes/blogophon)
[![devDependency Status](https://david-dm.org/fboes/blogophon/dev-status.svg)](https://david-dm.org/fboes/blogophon?type=dev)

A small and simple [Static Site Generator](https://davidwalsh.name/introduction-static-site-generators) for blogs. A live example of this blog generator can be found at [3960! Journal](http://journal.3960.org).

**Features:**

* Generate static HTML files from Markdown files.
* Simple and fast templating via Mustache.
* Generate all required teaser pages.
* Generate all required tag pages.
* Scale images and remove unneccessary cruft.
* Puts all relevant meta stuff into `<head>` for SEO and social sharing.
* Publish files to remote server.

Installation
------------

1. Clone this repository to your webserver.
1. Set your web server's document root folder to `htdocs` of this project (as there will be the HTML files generated by the Blogophon Generator).
1. Run `npm install` to install all dependencies and start the configuration dialogue. You can restart this dialogue later on by calling [`node ./install.js`](install.js) from CLI.
1. Optional: Change the template files in `theme`.

How it works
------------

Almost all stuff you will be doing with Blogophon is done via command line. Just call `npm start` or [`node ./index.js`](index.js) (which results in the same task being called), so you will not need any manual at all.

![The main menu in action.](docs/example.png)

Articles are written in [Markdown with some extra features](docs/markdown.md).

If you do not want to use [`node ./index.js`](index.js), [read the manual](docs/manual.md).

Version
-------

Version: 0.1.0 (2016-08-16)

Legal stuff
-----------

Author: [Frank Boës](http://3960.org)

Copyright & license: See [LICENSE.txt](LICENSE.txt)
