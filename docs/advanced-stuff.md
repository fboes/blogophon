![Blogophon -](blogophon.png) Advanced stuff
==============

In this document you will find some stuff for hardcore CLI wizards and server gurus.

Other means of editing articles
-------------------------------

If you do not want to use [`blogophon`](../index.js), [read the manual operations instructions](manual.md).

Cronjob
-------

As the Blogophon will ignore articles with a publishing date set into the future, you may want to build some mechanism for generating your unpublished pages automatically. Here is how:

Get the path to your blog by typing `pwd`. Then edit your Crontab: `crontab -e`

Add one of these lines:

```
58 23 * * * cd PATH_TO_YOUR_BLOG && blogophon-generate >/dev/null 2>&1 # Midnight, daily without log
58 23 * * * cd PATH_TO_YOUR_BLOG && blogophon-generate --log >> logs/generate.log 2>&1 # Midnight, daily with log
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

Server setup
------------

### Apache installation

The Blogophon will generate a `.htaccess` file initially. If possible, move the contents of this file to your server configuration file. If you cannot modify your server configuration, but Apache executes `.htaccess`, Blogophon's `.htaccess` should be all you need.

### nginx installation

There is a [sample nginx configuration](nginx.conf) to use for your server.

Automatically publish to external services
------------------------------------------

The Blogophon RSS feed allows for other services to automatically re-publish news about your new articles. This can be used to promote your articles on services like Twitter or Facebook. This idea is called [POSSE](https://indieweb.org/POSSE) (Publish (on your) Own Site, Syndicate Elsewhere).

### IFTT

[If This Than That](https://ifttt.com) handles republishing of RSS feeds to other services. After registering an account just follow these steps:

1. Click on your user account and select "New applet".
2. For `if [this]` select "Feed > New feed item".
3. Add the feed URL of your blog (e.g. `http://www.example.com/posts.rss`). You may also choose to use the RSS feed of a special tag (e.g. `http://www.example.com/tagged/…/posts.rss`).
4. For `then [that]` select "Twitter > Post a tweet", "Facebook > Create a link post", "Slack > Post to channel", or whatever service you want to use.
5. Allow IFTTT to access the service you selected.
6. Configure how your blog post's URL and title will be posted to the service you selected.

You may want to deactivate URL shortening in [IFTTT's settings](https://ifttt.com/settings).

### Slack

Slack offers a plugin to import RSS feeds directly to a Slack channel. Just [follow the instructions on installing the RSS app into Slack](https://get.slack.help/hc/en-us/articles/218688467-Add-RSS-feeds-to-Slack).

If you are not able to globally install the Blogophon
-----------------------------------------------------

In certain environments you may not be able to install the Blogophon globally. Thankfully there is a way to locally install the Blogophon.

1. Run `npm install blogophon` in a folder you have access to.

* All commands relating to `blogophon` may now be called by executing `node node_modules/blogophon/index.js`
* All commands relating to `blogophon-generate` may now be called by executing `node node_modules/blogophon/generate.js`
