![Blogophon -](blogophon.png) Manual operations
=================

You do not have to use `blogophon` to generate your blog. All operations can be done by a bunch of other tools.

## Create a new article

1. Create a new Markdown file in `user/posts`.
1. Edit your new files (see below).

## Edit existing markdown files

1. Edit a file in `user/posts` using [Markdown](markdown.md) and save it.
1. Generate HTML files either automatically or manually (see below).

## Generate HTML files manually

1. Run [`blogophon-generate`](../bin/blogophon-generate) to make the Blogophon Generator generate all HTML files in the folder you are in.

`blogophon-generate` has some options:

* `--force`: Create _all_ articles anew, ignoring cached versions.
* `--deploy`:  Execute `deployCmd` command found in `user/config.json`.
* `--log`:  Ouputs a header with the current date. This may be useful if you want to pipe the output of this command to a logfile. See [advanced stuff](advanced-stuff.md).
* `--no-images`: Do not generate images.

## Using drafts

If you want to write an article without publishing it, you can append a `~` to your Markdown file. This will hide it from the Blogophon Generator. To publish it, simply remove `~` from your Markdown filename and follow the generator process above.

## Delete articles

If you want to completely delete an article, you will have to delete all HTML files and Markdown files as well as any images associated with the selected article.

After that you will have to generate all pages anew, as the index pages will still link to the deleted article.

---

Return to [table of contents](README.md).
