Multi-blog
==========

It is possible to install the Blogophon generator once globally and administer and generate multiple blogs on a single computer.

Installation
------------

1. Make sure you have [Node.js](https://nodejs.org/) installed by calling `node -v`.
1. Clone this repository to some global path on your local machine.
1. Run `npm install -g` to install the Blogophon globally.

General idea
------------

* The CLI command `blogophon` calls Blogophon's `index.js` in the current folder.
* The CLI command `blogophon-generate` calls Blogophon's `generate.js` in the current folder. All parameters usable on `generate.js` can also be used with `blogophon-generate`.
* If you are in a sub-folder of your blog folder, both commands will automatically traverse upwards.
* If there is no blog folder found, the Blogophon will create a new blog project.

Setup a new blog
----------------

1. Create a new folder and change into the newly created folder.
1. Run `blogophon` to start the configuration dialog.
1. Set your web server's document root folder to `htdocs` of this directory (as there will be the HTML files generated by the Blogophon Generator).

Edit stuff in your blog
-----------------------

1. Go to the folder containing your blog.
1. Run `blogophon` to start the Blogophon dialog.

Use the generator
-----------------

1. Go to the folder containing your blog.
1. Run `blogophon-generate` to start the Blogophon generator.