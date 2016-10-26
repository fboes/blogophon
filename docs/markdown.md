Markdown
========

All Blogophon articles are written in [Markdown](https://daringfireball.net/projects/markdown/syntax). At the beginning of each Markdown file you cann add a [YAML frontmatter](https://jekyllrb.com/docs/frontmatter/) section for meta information. A typical Markdown document may look like this:

```markdown
---
{{YAML}}
---

{{Your text, written in Markdown…}}

```

Metadata and YAML
-----------------

At the beginning of each post there is a YAML block for metadata. All of these are optional.

Each YAML declaration starts with the declaration **key**, followed by `:`, and a declaration **value**. Please note the uppercased first letter in each declaration key.

```yaml
Title:     Title                                    # Title of document. If not set the first line of your Markdown will be used as title.
Description: Some nice text                         # Teaser text. If not set will be generated from article text. For details see below.
Date:      Wed Aug 25 2016 19:13:32 GMT+0200 (CEST) # Publishing date. If not set this will be taken from the file date.
DateModified: Wed Aug 25 2016 19:18:32 GMT+0200 (CEST) # Last modified date. If not set this will be taken from the file date publishing date.
Keywords:  Tag, Tag                                 # Comma-separated list of keywords / tags.
Twitter:   \#Hashtag and some text                  # This text will be used on Twitter. If not set will default to title of document.
Classes:   Images                                   # Sets the article type. E.g. `Images`, `Link`. This will be used as `class` attribute on the article, allowing for special CSS.
Latitude:  58.109285                                # Geolocation decimal latitude in WGS84, ranging from -90 to 90.
Longitude: 6.5664576                                # Geolocation decimal longitude in WGS84, rangin from -180 to 180.
Language:  en                                       # Language of current article, given in ISO 639-1 or RFC1766.
Author:    Example <example@example.org>            # Author name and email.
Image:     /post/image/image.png                    # Image URL used for sharing. It is best to make this URL absolute.
Rating:    1/5                                      # Rating given in a review, with `x` out of `y`, `1` being the lowest possible rating.
```

Teaser text
-----------

The most simple way to provide a teaser text for index pages is to set it via the **YAML block**.

Another way to generate a teaser text is to **split your article text** via a single line `===`. The first part above the `===` will be used as description, and both parts for the full version of the text:

```markdown

This part can be seen on index pages as well as article pages.

===

And this part will only be shown on article pages.

```

If you do not use both methods, the Blogophon will build a ***teaser text from article text** by using the first 160 characters.

Images
------

Put images for your articles into a folder having the same name as the corresponding Markdown file:

```
example.md         # Markdown file
example/image.jpg  # Image folder with example image
```

Link these images into your Markdown file like this:

```markdown

![Image description](image.jpg)         <-- produces an unscaled image
![Image description](image.jpg#default) <-- produces an image, which will be scaled to match the `default` style
![Image description](image.jpg#quad)    <-- produces an image, which will be scaled to match the `quad` style

```

It is always wise to use image styles, as these styles scale your images to a sensible size. Image styles will also produce responsive image variants.

Youtube & Vimeo
---------------

For displaying a embedded video player for Youtube or Vimeo, just put a link to the given video into a single line. This will be converted to a full blown video player.

Giphy
-----

For displaying a Giphy image, just put a linkt to the Giphy page into a single line. This will be converted to the corresponding image.

Checkboxes
-----------

```markdown

* [ ] <-- Produces an empty checkbox
* [X] <-- Produces a checked checkbox

```
