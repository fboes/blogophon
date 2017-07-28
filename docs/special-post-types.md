Special post types
==================

Special post types change the way your article behaves. You can choose a post type by altering the `Classes` value in your [YAML frontmatter](markdown.md).

Regular post types
------------------

Some post types give you the ability to add special styling, but do not alter the structure of the post. Examples are `Video`, `Link`, `Quote`, `Review`, `Location`.

`Images`
--------

This class of articles is built like a regular article, but every image used in this article will have a special Javascript attached to it, which show multiple images in a row as gallery. This also adds functionality to open images in a bigger version by clicking on them.

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

Instructions for your recipe
```

These articles will be altered to match Google's specification for recipes and allow for structured searching for recipes.

`Micro post`
--------

A micro post is meant for [micro bloggin](https://en.wikipedia.org/wiki/Microblogging). These posts are rather short (e.g. 160 characters), and do not have a title.
