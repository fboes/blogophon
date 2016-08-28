Advanced stuff
==============

In this document you will find some stuff for hardcore CLI wizards.

Gulp
-----

`gulp watch` will compile articles automatically as soon as you save an altered Markdown file. This may be useful if you like to keep checking how your editing turns out.

Cronjob
-------

As the Blogophon will ignore articles with a publising date set into the future, you may want to build some mechanism for generating your pages automatically. Ideally this will generate all pages anew.

Get the path to your `generate.js` by typing `pwd`. Then edit your Crontab: `crontab -e`

Add one of these lines:

```
58 23 * * * cd PATH_TO_YOUR_BLOG && node ./generate.js >/dev/null 2>&1 # Midnight, daily without log
58 23 * * * cd PATH_TO_YOUR_BLOG && node ./generate.js --log >> logs/generate.log 2>&1 # Midnight, daily with log
```

For more exotic execution times check http://crontab-generator.org/. And keep in mind to check the timezone your crontab will be executed in.
