![Blogophon -](blogophon.png) Development
===========

The Blogophon supports the building of custom themes and frontend functionality. You ware free to change the styling of the pages build by the Blogophon.

Gulp
----

The Blogophon sports [Gulp](http://gulpjs.com/), which will support you if you plan to build themes or new Javascript functionality. If will check and compress your files while you are editing.

| Command      | Description                                 |
|--------------|---------------------------------------------|
| `gulp`       | Starts `watch` and `serve`                  |
| `gulp watch` | Executes `test` and `build` on file changes |
| `gulp serve` | Starts webserver at http://localhost:3000/  |
| `gulp test`  | Executes linters and tests                  |
| `gulp build` | Build compressed Javascript and CSS         |

Webserver
---------

After starting `gulp` or `gulp serve`, a webserver will be spawned on your computer. It will be reachable via http://localhost:3000/.

This webserver will also spawn a [LiveReload](http://livereload.com/) service. Given there is a LiveReload plugin installed and activated in your browser, the page will reload all ressources in your browsers which have been changed while you are looking at the page.

Theming
-------

To develop a new theme follow these steps:

1. Copy `htdocs/theme/default/` to `htdocs/theme/YOUR_THEME_NAME`.
1. Call `blogophon` and choose your new theme `YOUR_THEME_NAME`.
1. Run `gulp` to start the SASS- & JS-compiler. This will also reload your browser on theme changes if you have the [LiveReload plugin](http://livereload.com/extensions/) installed.
1. Start making modifications to your copied theme files.

---

Return to [table of contents](README.md).
