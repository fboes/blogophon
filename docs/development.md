![Blogophon -](blogophon.png) Development
===========

The Blogophon supports the building of custom themes and frontend functionality. You are free to change the styling of the pages build by the Blogophon.

Gulp
----

The Blogophon sports [Gulp](http://gulpjs.com/), which will support you if you plan to build themes or new Javascript functionality. It will check and compress your files while you are editing.

| Command      | Description                                           |
| ------------ | ----------------------------------------------------- |
| `gulp`       | Starts `gulp watch` and `gulp serve`                  |
| `gulp serve` | Starts webserver at http://localhost:3000/            |
| `gulp watch` | Executes `gulp test` and `gulp build` on file changes |
| `gulp test`  | Executes linters and tests                            |
| `gulp build` | Build compressed Javascript and CSS                   |

Webserver
---------

After starting `gulp` or `gulp serve`, a webserver will be spawned on your computer. It will be reachable via http://localhost:3000/.

This webserver will also spawn a [LiveReload](http://livereload.com/) service. Given there is a LiveReload plugin installed and activated in your browser, the page will reload all resources in your browsers which have been changed while you are looking at the page.

Theming
-------

The themes of the Blogophon use [Handlebars templating](https://handlebarsjs.com/). To develop a new theme follow these steps:

1. Copy `htdocs/theme/default/` to `htdocs/theme/YOUR_THEME_NAME`.
1. Call `blogophon` and choose your new theme `YOUR_THEME_NAME`.
1. Run `gulp` to start the SASS- & JS-compiler. This will also reload your browser on theme changes if you have the [LiveReload plugin](http://livereload.com/extensions/) installed.
1. Start making modifications to your copied Handlebars theme files.

Take special note of `theme.json`, as it contains settings for your theme like settings for responsive images, images and icons:

| Key                    | Description   |
| ---------------------- | ------------- |
| `themeColor`           | Hex colour code, will be used e.g. for URL bar in Google Chrome mobile. |
| `articleHeadlineLevel` | `1` means all article headings will be output as is. Setting it to `2` will convert headings of level 1 to heading level 2 etc. |
| `icons`                | As defined in [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest), but sizes may contain `any` as in the [`sizes`-attribute used in `<link>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link). |

### Template variables

Keep in mind that every property in the article's [YAML frontmatter](markdown.md) will become a Handlebars `post.meta` variable. This may help you in adding extra article properties to your template.

There is also a Handlebars `config` variable, which will contain all settings from your `user/config.json`.

Last but not least have a look at [`lib/helpers/blogophon-handlebars-quoters.js`](../lib/helpers/blogophon-handlebars-quoters.js) on what (block) helpers are available for you to use.

```html
<!-- Translate string -->
{{#i18n}}All tags{{/i18n}}

<!-- output meta.Created as ISO 8601 formatted date -->
{{dateFormat meta.Created 'iso'}}

<!-- output meta.Created as date formatted in given locales standard format -->
{{dateFormat meta.Created 'locale' meta.Language}}

<!-- Replace %url and %title in config.htmlAnalyticsFeed with meta.AbsoluteLink & meta.Title -->
{{{trackReplace config.htmlAnalyticsFeed meta.AbsoluteLink meta.Title}}}

```

---

Return to [table of contents](README.md).
