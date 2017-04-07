Development
===========

Gulp
----

The Blogophon supports [Gulp](http://gulpjs.com/). This is recommended if you plan on building themes or new Javascript functionality.

| Command      | Description                                 |
|--------------|---------------------------------------------|
| `gulp`       | Starts `watch` and `serve`                  |
| `gulp watch` | Executes `test` and `build` on file changes |
| `gulp serve` | Starts webserver at http://localhost:8000/  |
| `gulp test`  | Executes linters and tests                  |
| `gulp build` | Build compressed Javascript and CSS         |

Development
-----------

* All SASS files in `htdocs` will be converted into CSS files.
* All JS files in `htdocs` will be converted into compressed JS files.

Webserver
---------

After starting `gulp` or `gulp serve`, a webserver will be spawned on your computer. It will be reachable via http://localhost:8000/.

This webserver will also spawn a [LiveReload](http://livereload.com/) service. Given there is a LiveReload plugin installed and activated in your browser, the page will reload all ressources in your browsers which have been changed while you are looking at the page. This is very helpful for developing CSS and Javascript, as well as looking at freshly generated HTML pages.
