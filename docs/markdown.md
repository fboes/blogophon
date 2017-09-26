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

At the beginning of each post there is a [YAML](http://symfony.com/doc/current/components/yaml/yaml_format.html) block for metadata. This block will not be shown in your article, but will contain extra data for your article.

Each YAML declaration starts with the declaration **key**, followed by `:`, a whitespace, and a declaration **value**. Please note the uppercased first letter in each declaration key.

All of these declarations are optional.

```yaml
Title:        'Title'                   # Title of document. If not set the first line of your Markdown will be used as 
                                        # title.
Description:  'Some nice text'          # Teaser text. If not set will be generated from article text.
                                        # For details see below.
Date:         2016-08-25T19:13:12+02:00 # Publishing date in ISO-8601.
                                        # If not set this will be taken from the file date. If this date set into the
                                        # future, the article will not be published until the date is reached.
DateModified: 2016-08-26                # Last modified date in ISO-8601.
                                        # If not set this will be taken from the file date publishing date.
Keywords:     Tag, Tag                  # Comma-separated list of keywords / tags.
Category:     My little category        # Category the article belongs to.
Twitter:      '#Hashtag and some text'  # This text will be used on Twitter.
                                        # If not set will default to title of document.
Classes:      Images                    # Sets the article type. E.g. `Images`, `Link`. This will be used as `class`
                                        # attribute on the article, allowing for special CSS.
Location:     Lista Lighthouse, Norway  # Plain address this post is supposed to be located at.
Marker:       marker                    # Marker symbol on for this location. You may want to use symbol names
                                        # supplied via https://www.mapbox.com/maki-icons/.
Latitude:     58.109285                 # Geolocation decimal latitude in WGS84, ranging from -90 to 90.
                                        # If not given will be inferred from `Location` if given.
Longitude:    6.5664576                 # Geolocation decimal longitude in WGS84, ranging from -180 to 180.
                                        # If not given will be inferred from `Location` if given.
Language:     en                        # Language of current article, given in ISO 639-1 or RFC1766.
                                        # If not set will default to blog's language.
Author:       Name <email@example.org>  # Author name and email. If not set will default to blog's main author.
Image:        /post/image/image.png     # Image URL used for sharing. It is best to make this URL absolute.
                                        # If not set the first image found in the article text will be used.
Link:         http://www.example.com/   # If given clicking on links to this article redirects to this URL instead
                                        # of the original post's link.
Rating:       1/5                       # Rating given in a review, with `x` out of `y`, `1` being the lowest possible
                                        # rating.
Draft:        yes                       # If set to `yes` this will prevent the article from being published. 
                                        # Use this for drafts.
```

Because the teaser text uses Markdown (see below), you may also use multiline description field for YAML frontmatter like this:

```yaml
Description: |
  This multiline teaser text may contain [Markdown](https://www.example.com/). It is most important that the first line is a pipe symbol, `|`.

  All your line breaks are belong to us.

```

There are also [special post types](special-post-types.md), which are activated by choosing a special `Classes` value.

Basic Markdown example
----------------------

To get you started quickly, here is a small Markdown example. For more information check out the full [Markdown documentation](https://daringfireball.net/projects/markdown/syntax).

```markdown
Title of your document
======================

Some paragraph with **bold** text, linking to [an example](https://www.example.com/).

Another paragraph with some _italic_ text. And there is also `typewriter-style code`.

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

If you do not use one of the methods mentioned above, the Blogophon will build a **teaser text from article text** by using the first 160 characters.

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
![> Image description](image.jpg)       _produces an unscaled image with visible image description_
```

It is always wise to use image styles, as these styles scale your images to a sensible size. Image styles will also produce responsive image variants.

If you do not use image styles, consider to at least state the size of the image. This will speed up the rendering of the whole page while the image has not yet loaded.

Videos & audio files
--------------------

To show video and audio files you just have to use the regular Markdown used for images:

```markdown
![Audio description](/media/audio.mp3)    _produces an audio player_
![Video description](/media/video.mp4)    _produces an video player_
![Video description](/media/video.webm)   _produces an video player_

```

Remember to use valid URLs for your video / audio files. You may want to upload this kind of files directly to `htdocs/media`.

### Youtube & Vimeo

For displaying a embedded video player for Youtube or Vimeo, just put a link to the given video into a single line. This will be converted to a full blown video player.

Embedding other services
--------------

### Giphy

For displaying a Giphy image, just put a link to the Giphy page into a single line. This will be converted to the corresponding image.

### Codepen, Github Gist and JSFiddle

For displaying code examples from Codepen, Github Gist or JSFiddle, just put a link to the page into a single line. This will be converted to the corresponding example script.

Special characters
------------------

There are some Markdown codes in the Blogophon to add special characters like Emojis to your HTML output:

| Markdown | Results in… | Description    |
|----------|-------------|----------------|
| `&shy;`  |           | [Soft hyphen](https://en.wikipedia.org/wiki/Soft_hyphen), to break words across lines by inserting visible hyphens |
| `&nbsp;` |           | Non-breaking space, prevents an automatic line break at its position |
| `--`     | —         | [Em dash](http://www.thepunctuationguide.com/em-dash.html) |
| `(C)`    | ©         | Copyright sign   |
| `(R)`    | ®         | Registered sign  |
| `(TM)`   | ™         | Trade mark sign  |
| `(+-)`   | ±         | Plus-minus sign  |
| `:)`     | &#x1F60A; | Smiling face with smiling eyes |
| `:))`    | &#x1F602; | Face with tears of joy |
| `:D`     | &#x1F604; | Smiling face with open mouth and smiling eyes |
| `;)`     | &#x1F609; | Winking face     |
| `B)`     | &#x1F60E; | Smiling face with sunglasses |
| `:P`     | &#x1F60B; | Face with stuck-out tongue |
| `xP`     | &#x1F61D; | Face with stuck-out tongue and tightly-closed eyes |
| `:*`     | &#x1F618; | Face throwing a kiss |
| `:O`     | &#x1F632; | Astonished face  |
| `:\|`    | &#x1F610; | Neutral face     |
| `:?`     | &#x1F914; | Thinking face    |
| `:/`     | &#x1F612; | Unamused face    |
| `xO`     | &#x1F635; | Dizzy face       |
| `:(`     | &#x1F629; | Weary face       |
| `:'(` / `;(` | &#x1F622; | Crying face  |
| `:@`     | &#x1F620; | Angry face       |
| `:$`     | &#x1F633; | Flushed face     |
| `8O`     | &#x1F628; | Fearful face     |
| `\o/`    | &#x1F64C; | Person raising both hands in celebration |
| `8<`     | &#x2702;  | Scissors         |
| `:+1:`   | &#x1F44D; | Thumbs up sign   |
| `:-1:`   | &#x1F44E; | Thumbs down sign |
| `<3`     | &#x2764;  | Heart            |
| `</3`    | &#x1F494; | Broken heart     |
| `(!)`    | &#x26A0;  | Warning sign     |

Please use the proper upper-/lowercasing, as some characters are intentionally lowercased to avoid replacing acronyms by mistake.

For more Emojis and special characters refer to a [Emoji UTF-8 table](http://apps.timwhitlock.info/emoji/tables/unicode), and convert a code like `U+1F680` into `&#x1F680;`.

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
* `yaml`
* `ini`
* `apacheconf`
* `markdown` to output Markdown examples.
* `shell` for shell examples. Lines starting with `$` are interpreted as shell input, all other lines as shell output.

All other languages will be converted with a catch-all code highlighter, which works well enough for `php` and `javascript`, as well as most other programming languages.

Checkboxes
-----------

```markdown

* [ ] _Produces an empty checkbox_
* [X] _Produces a checked checkbox_

```

---

Return to [table of contents](README.md).
