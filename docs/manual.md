Manual
======

## Create a new article

1. Create a new Markdown file in `user/posts`.
1. Generate HTML files either automatically or manually (see below).

## Generate HTML files automatically

1. Start Gulp watcher via `gulp watch`.
1. Edit your Markdown file. Gulp will automatically create all HTML files via the Blogophon Generator.

## Generate HTML files manually

1. Edit your Markdown file.
1. Run [`./generate.js`](generate.js) to make the Blogophon Generator generate all HTML files.

`generate.js` has some options:

* `--force`: Create _all_ articles anew, ignoring cached versions.
* `--deploy`:  Execute `deployCmd` command found in `user/config.json`.

## Using drafts

If you want to write an article without publishing it, you can append a `~` to your Markdown file. This will hide it from the Blogophon Generator. To publish it, simply remove `~` from your Makrdown filename and follow the generator process above.

## Delete articles

If you want to completly delete an article, you will have to delete all HTML- and Markdown files as well as any images associated with the selected article.
