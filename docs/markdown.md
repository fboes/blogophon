Markdown
========

Metadata and YAML
-----------------

At the beginning of each post there is a YAML block for metadata. All of these are optional.

```yaml
Description: Some nice text                         # Teaser text
Date:      Wed Aug 25 2016 19:13:32 GMT+0200 (CEST) # Publishing date.
Keywords:  Tag, Tag                                 # Comma-separated list of keywords / tags
Twitter:   \#Hashtag and some text                  # This text will be used on Twitter
Classes:   Images                                   # Sets the article type. E.g. `Images`, `Link`
Latitude:  58.109285                                # Geolocation latitude
Longitude: 6.5664576                                # Geolocation longitude
Language:  en                                       # Language of current article
Author:    Example <example@example.org>            # Author name and email
Image:     /post/image/image.png                    # Image used for sharing
Rating:    1/5                                      # Rating given in a review
```

You may use even more metadata and use these in your theme's template accordingly.

```html
  <p>{{ post.meta.Description }}</p>
```

Youtube & Vimeo
---------------

For displaying a embedded video player for Youtube or Vimeo, just put a link to the given video into a single line. This will be converted to a full blown video player.
