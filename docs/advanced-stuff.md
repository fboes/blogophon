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

1. Click on your user account and select "New applet".
2. For `if [this]` select "Feed > New feed item".
3. Add the feed URL of your blog. You may also choose to only use the RSS feed of a special tag.
4. For `then [that]` select "Twitter > Post a tweet", "Facebbok > Create a link post", "Slack > Post to channel" or whatever service you want to use.
5. Allow IFTTT to access the service you selected.
6. Configure how your blog post`s URL and title will be posted to the service you selected.

You may want to deactivate URL shortening in [IFTTT's settings](https://ifttt.com/settings).
