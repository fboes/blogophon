#!/usr/bin/env node
'use strict';

var fs     = require('fs-extra');
var pkg    = JSON.parse(fs.readFileSync('./package.json'));
var config = JSON.parse(fs.readFileSync('./user/config.json'));
var shell  = require('shelljs');
var glob   = require("glob");

var Mustache   = require('mustache');
var PostReader = require('./lib/post_reader');

// Priming stuff
var itemTemplate = fs.readFileSync(pkg.directories.theme+'/item.html', 'utf8');
var indexTemplate = fs.readFileSync(pkg.directories.theme+'/index.html', 'utf8');
var rssTemplate = fs.readFileSync(pkg.directories.theme+'/rss.xml', 'utf8');
var sitemapTemplate = fs.readFileSync(pkg.directories.theme+'/sitemap.xml', 'utf8');
var index = require('./lib/index')();
Mustache.parse(itemTemplate);
Mustache.parse(indexTemplate);
Mustache.parse(rssTemplate);
Mustache.parse(sitemapTemplate);

// Read items
glob(pkg.directories.data + "/**/*.md", function (er, files) {
  var i, finished = 0;

  PostReader.on('parsed', function (post) {
    shell.mkdir('-p', pkg.directories.htdocs + '/' + post.meta.Url);
    fs.writeFile(pkg.directories.htdocs + '/' + post.meta.Url + 'index.html', Mustache.render(itemTemplate, {
      meta: post.meta,
      content: post.html,
      config: config
    }));
    console.log("Wrote " + post.meta.Url + "index.html");
    index.push(post);
    finished ++;
    if (finished === files.length) {
      var pagedPosts = index.getPagedPosts(5), page, indexFilename;

      fs.writeFile(pkg.directories.htdocs + '/sitemap.json', JSON.stringify(index.getPosts()));
      fs.writeFile(pkg.directories.htdocs + '/sitemap-pages.json', JSON.stringify(pagedPosts));
      console.log("Wrote sitemap.json");

      fs.remove(pkg.directories.htdocs + '/index*', function (err) {
        for (page = 0; page < pagedPosts.length; page ++) {
          var curPageObj    = index.getPageData(page, pagedPosts.length);
          curPageObj.index  = pagedPosts[page];
          curPageObj.config = config;
          fs.writeFile(pkg.directories.htdocs + '/' + curPageObj.currentUrl, Mustache.render(indexTemplate, curPageObj));
          console.log("Wrote " + curPageObj.currentUrl);
        }
      });

      fs.writeFile(pkg.directories.htdocs + '/posts.rss', Mustache.render(rssTemplate, {
        index: index.getPosts(10),
        config: config
      }));
      console.log("Wrote posts.rss");

      fs.writeFile(pkg.directories.htdocs + '/sitemap.xml', Mustache.render(sitemapTemplate, {
        index: index.getPosts(10),
        config: config
      }));
      console.log("Wrote sitemap.xml");

      var tags = index.getTags();
      Object.keys(tags).map(function (key) {
        shell.mkdir('-p', pkg.directories.htdocs + '/tagged/' + tags[key].id);
        tags[key].config = config;
        fs.writeFile(pkg.directories.htdocs + '/tagged/' + tags[key].id + '/index.html', Mustache.render(indexTemplate, tags[key]));
        console.log("Wrote tagged/" + tags[key].id + '/index.html');

      });
    }
  });

  for (i = 0; i < files.length; i++) {
    PostReader.parse(files[i]);
  }
});

glob(pkg.directories.data + "/**/*.{png,jpg,gif}", function (er, files) {
  var i;
  for (i = 0; i < files.length; i++) {
    fs.copySync(files[i], files[i].replace(/^user\//, 'htdocs/'));
  }
});
