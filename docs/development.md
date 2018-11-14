![Blogophon -](blogophon.png) Development
===========

The Blogophon supports the building of custom themes and frontend functionality. You are free to change the styling of the pages build by the Blogophon.

Gulp
----

The Blogophon sports [Gulp](http://gulpjs.com/), which will support you if you plan to build themes or new JavaScript functionality. It will check and compress your files while you are editing.

To install all tools required for Gulp execute these commands from the project root directory:

```bash
npm install gulp -g
npm install
```

Afterwards these commands become available:


| Command      | Description                                           |
| ------------ | ----------------------------------------------------- |
| `gulp`       | Starts `gulp watch` and `gulp serve`                  |
| `gulp serve` | Starts webserver at http://localhost:8080/            |
| `gulp watch` | Executes `gulp test` and `gulp build` on file changes |
| `gulp test`  | Executes linters and tests                            |
| `gulp build` | Build compressed JavaScript and CSS                   |

Webserver
---------

After starting `gulp` or `gulp serve`, a [development webserver](https://www.browsersync.io/) will be spawned on your computer. It will be reachable via http://localhost:8080/.

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

<!-- Test if two strings are equal -->
{{#ifEquals tag 'new'}}It's new!{{/ifEquals}}

<!--  Test if first string matches against regular expression -->
{{#ifMatches tag '[Nn]ew'}}It's new!{{/ifMatches}}

{{#ifHasAspectRatio img.src 16 9}}
  <img src="{{img.src}}" alt="" /><!-- has an aspect ratio of 16:9 -->
{{/ifHasAspectRatio}}

{{#ifHasMaxDimensions img.src 270 270}}
  <img src="{{img.src}}" alt="" /><!-- is not bigger than 270×270 px -->
{{/ifHasMaxDimensions}}

<!-- Export template variables to S (e.g. for Google Tag Manager) -->
<script>{{{dataLayer post.meta}}}</script>
```

### Favicons

The Blogophon uses special icon sizes defined in your `theme.json` for special purposes:

| Size    | Purpose |
| ------- | ------- |
| 128×128 | Will be used as icon for RSS feeds, ATOM feeds, JSON-RSS, JSON-Feed and `browserconfig.xml` |
| 270×270 | Will be used in `browserconfig.xml` |
| 558×270 | Will be used in `browserconfig.xml` |
| 558×558 | Will be used in `browserconfig.xml` |

The base template will als use any icon's filename containing `apple-touch-icon` as Apple Touch Icon.

---

Return to [table of contents](README.md).
