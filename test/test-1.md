---
Title:        'Title'                       # Title of document. If not set the first line of your Markdown will be used as title.
Description:  'Some nice text'              # Teaser text. If not set will be generated from article text. For details see below.
Date:         2016-08-25T19:13:12+02:00     # Publishing date in ISO-8601. If not set this will be taken from the file date. If this date set into the future, the article will not be published until the date is reached.
DateModified: 2016-08-26                    # Last modified date in ISO-8601. If not set this will be taken from the file date publishing date.
Keywords:     Tag, Tag                      # Comma-separated list of keywords / tags.
Twitter:      '#Hashtag and some text'      # This text will be used on Twitter. If not set will default to title of document.
Classes:      Images                        # Sets the article type. E.g. `Images`, `Link`. This will be used as `class` attribute on the article, allowing for special CSS.
Location:     Lista Lighthouse, Norway      # Plain address this post is supposed to be located at.
Marker:       marker                        # See https://github.com/mapbox/simplestyle-spec/blob/master/1.1.0/README.md#3-client-behavior, definition for "marker-symbol"
Latitude:     58.109285                     # Geolocation decimal latitude in WGS84, ranging from -90 to 90. If not given will be inferred from `Location` if given.
Longitude:    6.5664576                     # Geolocation decimal longitude in WGS84, ranging from -180 to 180. If not given will be inferred from `Location` if given.
Language:     en                            # Language of current article, given in ISO 639-1 or RFC1766. If not set will default to blog's language.
Author:       Example <example@example.org> # Author name and email. If not set will default to blog's main author.
Image:        /post/image/image.png         # Image URL used for sharing. It is best to make this URL absolute. If not set the first image found in the article text will be used.
Link:         http://www.example.com/       # If given clicking on links to this article redirects to this URL instead of the original post's link.
Rating:       1/5                           # Rating given in a review, with `x` out of `y`, `1` being the lowest possible rating.
---

Title of your document
======================

This part can be seen on index pages as well as article pages.

***

Some paragraph with **bold** text, linking to [an example](https://www.example.com/).

Another paragraph with some _italic_ text. And there is also `typewriter-style code`.
