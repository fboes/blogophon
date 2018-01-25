Special post types
==================

With special post types you can have your Blogophon act as…

* a conventional blog or micro-blog,
* a photo book,
* a cook-book with recipes,
* a travel journal with dates and locations,
* some kind of geo-caching site (using [GeoJSON or KML](special-features.md)), or
* a calendar (using [ICS calendars](special-features.md)).

Special post types change the way your article behaves. You can choose a post type by altering the `Classes` value in your [YAML frontmatter](markdown.md).

Regular post types
------------------

Some post types give you the ability to add special styling, but do not alter the structure of the post. Examples are `Video`, `Link`, `Quote`, `Review`, `Location`.

`Images`
--------

This class of articles is built like a regular article, but every image used in this article will have a special JavaScript attached to it, which will show multiple images in a row as a gallery. This also adds functionality to open images in a bigger version by clicking on them.

An image gallery is built by supplying a paragraph consisting only of images:

```markdown
![Subline 1](img1.jpg#default) ![Subline 2](img2.jpg#default) ![Subline 3](img3.jpg#default)

```

`Recipe`
--------

A recipe is built like a normal article, but has a special structure for content:

```markdown
Name of your meal
=================

Description of your recipe

* Ingredient A
* Ingredient B
* Ingredient C

Instructions
------------

1. Instruction 1
2. Instruction 2
3. Instruction 3

```

`Micro post`
--------

A micro post is meant for [micro blogging](https://en.wikipedia.org/wiki/Microblogging). These posts are rather short (e.g. 160 characters), and do not have a title.
