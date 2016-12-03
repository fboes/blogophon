![Blogophon -](blogophon.png) Advanced stuff
==============

In this document you will find some stuff for hardcore CLI wizards and server gurus.

Other means of editing articles
-------------------------------

If you do not want to use [`node index.js`](index.js), [read the manual operations instructions](manual.md).

Gulp
-----

`gulp watch` will compile articles automatically as soon as you save an altered Markdown file. This may be useful if you like to keep checking how your editing turns out.

Cronjob
-------

As the Blogophon will ignore articles with a publishing date set into the future, you may want to build some mechanism for generating your unpublished pages automatically. Here is how:

Get the path to your `generate.js` by typing `pwd`. Then edit your Crontab: `crontab -e`

Add one of these lines:

```
58 23 * * * cd PATH_TO_YOUR_BLOG && node ./generate.js >/dev/null 2>&1 # Midnight, daily without log
58 23 * * * cd PATH_TO_YOUR_BLOG && node ./generate.js --log >> logs/generate.log 2>&1 # Midnight, daily with log
```

For more exotic execution times check http://crontab-generator.org/. And keep in mind to check the timezone your crontab will be executed in.

Article deployment
------------------

If you like to keep your editing and your HTML files in separate directory or a separate machine, the `deployCmd` in `user/config.json` may come in handy. Here are some examples you might find useful:

```bash
echo \"Publishing...\" && rsync -az --delete htdocs HOST:PATH_TO_YOUR_BLOG && echo \"Published\" # Sync only published HTML files, keep Blogophon from live server
echo \"Publishing...\" && rsync -az --delete user HOST:PATH_TO_YOUR_BLOG && echo \"Published\"   # Sync only Markdown files, let publishing be done by Cronjob or Daemon
```

Editor
------

If you use Sublime Text for editing your markdown files, consider installing `Markdown Extended`. It supports YAML frontmatter and code block syntax highlighting in Markdown files.

Multiple blogs & global installation
------------------------------------

There are setup instructions on [hot to use Blogophon globally / for multiple blogs on one machine](global-installation.md).

Server setup
------------

### Apache installation

The Blogophon will generate a `.htaccess` file initially. If possible, move the contents of this file to your server configuration file. If you cannot modify your server configuration, but Apache executes `.htaccess`, Blogophon's `.htaccess` should be all you need.

### nginx installation

There is a [sample nginx configuration](nginx.conf) to use for your server.

Automatically publish to external services
------------------------------------------

The Blogophon RSS feed allows for other services to automatically re-publish news about your new articles. This can be used, to advertise for your articles on services like Twitter or Facebook.

There are services which handle this re-pbulishing, like [If This Than That](https://ifttt.com). After registering an account you just copy your RSS feed url (`http://www.example.com/posts.rss`) to link it to the following services:

* For Twitter use ["New entries to an RSS will be automatically tweeted"](https://ifttt.com/applets/5539p-new-entries-to-an-rss-will-be-automatically-tweeted).
* For Facebook use ["Rss => Facebook page "](https://ifttt.com/applets/114206p-rss-facebook-page-with-description-thumbnail).
