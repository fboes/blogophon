![Blogophon -](blogophon.png) Markdown
========

All Blogophon articles are written in [Markdown](https://daringfireball.net/projects/markdown/syntax). At the beginning of each Markdown file you can add an optional [YAML front matter](https://jekyllrb.com/docs/frontmatter/) section for meta information. A typical Blogophon-Markdown document may look like this:

```markdown
---
{{YAML front matter}}
---

{{Your text, written in Markdown…}}

```

Metadata via YAML front matter
-----------------------------

At the beginning of each post there is a YAML block for metadata. This block will not be shown in your article, but will contain extra data for your article.

Each YAML declaration starts with the declaration **key**, followed by `:`, and a declaration **value**. Please note the uppercased first letter in each declaration key.

All of these declarations are optional.

```yaml
Title:     Title                                    # Title of document. If not set the first line of your Markdown will be used as title.
Description: Some nice text                         # Teaser text. If not set will be generated from article text. For details see below.
Date:      Wed Aug 25 2016 19:13:32 GMT+0200 (CEST) # Publishing date. If not set this will be taken from the file date. If this date set into the future, the article will not be published until the date is reached.
DateModified: Wed Aug 25 2016 19:18:32 GMT+0200 (CEST) # Last modified date. If not set this will be taken from the file date publishing date.
Keywords:  Tag, Tag                                 # Comma-separated list of keywords / tags.
Twitter:   \#Hashtag and some text                  # This text will be used on Twitter. If not set will default to title of document.
Classes:   Images                                   # Sets the article type. E.g. `Images`, `Link`. This will be used as `class` attribute on the article, allowing for special CSS.
Location:  Lista Lighthouse, Norway                 # Plain address this post is supposed to be located at.
Marker:    marker                                   # See https://github.com/mapbox/simplestyle-spec/blob/master/1.1.0/README.md#3-client-behavior, definition for "marker-symbol"
Latitude:  58.109285                                # Geolocation decimal latitude in WGS84, ranging from -90 to 90.
Longitude: 6.5664576                                # Geolocation decimal longitude in WGS84, ranging from -180 to 180.
Language:  en                                       # Language of current article, given in ISO 639-1 or RFC1766. If not set will default to blog's language.
Author:    Example <example@example.org>            # Author name and email.
Image:     /post/image/image.png                    # Image URL used for sharing. It is best to make this URL absolute.
Link:      http://www.example.com/                  # By clicking on links to this article redirect to this URL instead of the original post's link.
Rating:    1/5                                      # Rating given in a review, with `x` out of `y`, `1` being the lowest possible rating.
```

Basic Markdown example
----------------------

To get you started quickly, here is a small Markdown example. For more information check out the full [Markdown documentation](https://daringfireball.net/projects/markdown/syntax).

```markdown
Title of your document
======================

Some paragraph with **bold** text, linking to [an example](https://www.example.com/).

Another paragraph with some _italic_ text.

```

Teaser text
-----------

The most simple way to provide a teaser text for index pages is to set it via the **YAML front matter block**.

Another way to generate a teaser text is to **split your article text** via a single line `***` (which normally would result in a horizontal line). The first part above the `***` will be used as description, and both parts for the full version of the text:

```markdown

This part can be seen on index pages as well as article pages.

***

And this part will only be shown on article pages.

```

If you do not use both methods, the Blogophon will build a **teaser text from article text** by using the first 160 characters.

Images
------

Put images for your articles into a folder having the same name as the corresponding Markdown file:

```
/user/posts/example.md         # Markdown file
/user/posts/example/image.jpg  # Image folder with example image
```

Link these images into your Markdown file like this:

```markdown

![Image description](image.jpg)         _produces an unscaled image_
![Image description](image.jpg#default) _produces an image, which will be scaled to match the `default` style_
![Image description](image.jpg#quad)    _produces an image, which will be scaled to match the `quad` style_
![Image description](image.jpg#320x240) _mark up this image as being 320 wide and 240 high_

```

It is always wise to use image styles, as these styles scale your images to a sensible size. Image styles will also produce responsive image variants.

If you do not use image styles, consider to at least state the size of the image. This will speed up the rendering of the whole page while the image has not yet loaded.

Youtube & Vimeo
---------------

For displaying a embedded video player for Youtube or Vimeo, just put a link to the given video into a single line. This will be converted to a full blown video player.

Giphy
-----

For displaying a Giphy image, just put a link to the Giphy page into a single line. This will be converted to the corresponding image.

Checkboxes
-----------

```markdown

* [ ] _Produces an empty checkbox_
* [X] _Produces a checked checkbox_

```

Emojis
------

Just enter ASCII smileys to produce Emojis:

| ASCII | Result |
|-------|--------|
| :) | &#x1F60A; |
| :)) | &#x1F602; |
| :( | &#x1F629; |
| :'( | &#x1F622; |
| :\| | &#x1F610; |
| :/ | &#x1F612; |
| :D | &#x1F604; |
| :P | &#x1F60B; |
| :O | &#x1F632; |
| :? | &#x1F914; |
| :@ | &#x1F620; |
| :* | &#x1F618; |
| ;) | &#x1F609; |
| B) | &#x1F60E; |
| XP | &#x1F61D; |
| 8o | &#x1F628; |
| `:+1:` | &#x1F44D; |
| `:-1:` | &#x1F44E; |
| <3 | &#x1F495; |
| </3 | &#x1F494; |
| (!) | &#x26A0; |


Tables
------

```markdown
| \     | A | B | C |
|-------|---|–––|---|
| **1** | X | X | X |
| **2** | O | X |   |
| **3** |   | O | O |

```

In this example the first line of the table will be treated as table header. The first column will be treated as row header, because its content is enclosed in `**`.

[Colons can be used to align columns](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#tables).

Fenced code blocks
------------------

Fenced code blocks are used for longer listing and are started like this:

    ```
    Your code here
    ```

You can add an optional language identifier to enable syntax highlighting in your fenced code block by prepending a language identifier just after the opening ticks:

    ```javascript
    Your code here
    ```

The following identifiers are supported:

* `css`
* `html` & `xml`
* `markdown` to output Markdown examples.
* `shell` for shell examples. Lines starting with `$` are interpreted as shell input, all other lines as shell output.

All other languages will be converted with a catch-all code highlighter, which works well enough for `php` and `javascript`, as well as most other programming languages.
