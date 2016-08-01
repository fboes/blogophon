#!/usr/bin/env node
'use strict';

/* global DateSetFromIsoString */

var fs = require('fs-extra');
var pkg = JSON.parse(fs.readFileSync('./package.json'));

var toolshed = require('./lib/js-toolshed/src/js-toolshed');

var glob = require("glob");
var readline = require("readline");
var yamljs = require('yamljs');


var fileConvert = function(file, newFile) {
  var yaml = '',
    markdown = '',
    readYaml = false,
    fileStat
  ;

  fs.stat(file, function(err, stats) {
    fileStat = stats;
  });

  var lineReader = readline.createInterface({
    input: require('fs').createReadStream( file )
  }).on('line', function (line) {
    if (line === '---' && yaml === '') {
      yaml += "# YML start\n";
      readYaml = true;
    } else if (line === '---' && readYaml) {
      yaml = yamljs.parse(yaml);
      readYaml = false;
    } else if (readYaml) {
      yaml += line + "\n";
    } else if (!readYaml) {
      markdown += line.replace(/\[plugin:embed\]\((.+?)\)/,'$1') + "\n";
    }
  })
  .once('close',function () {
    var date;

    if (yaml.title !== undefined) {
      markdown = 'Title:    '+yaml.title+"  \n\n"+yaml.title + "\n===============\n"+markdown;
    }
    if (yaml.publish_date !== undefined) {
      date = new DateSetFromIsoString(yaml.publish_date);
    } else if (yaml.date !== undefined) {
      date = new DateSetFromIsoString(yaml.date);
    } else if (fileStat.mtime !== undefined) {
      date = fileStat.mtime;
    }
    if (date) {
      markdown = 'Date:     '+ date + "  \n"+markdown;
    }

    if (yaml.taxonomy.tag !== undefined) {
      markdown = 'Keywords: '+yaml.taxonomy.tag.join(', ')+"  \n"+markdown;
    }
    //markdown += "\n"+markdownConvert(markdown);
    //markdown += "\n"+markdownConvert(markdown.replace(/\S+:[\s\S]+?\n\n/,''));
    //console.log(yamljs.parse(markdown.match(/\S+:[\s\S]+?\n\n/)[0]));
    fs.writeFile(newFile, markdown);
    console.log("Wrote "+newFile);
  });
};

var reg = new RegExp(pkg.directories.import);
glob(pkg.directories.import + "/**/*.md", function (er, files) {
  var i;
  for (i = 0; i < files.length; i++) {
    var target = files[i]
      .replace(reg, pkg.directories.data)
      .replace(/\/item.[a-z]+(.md)$/,'$1')
    ;
    fileConvert(files[i], target);
  }
});

glob(pkg.directories.import + "/**/*.{png,jpg,gif}", function (er, files) {
  var i;
  for (i = 0; i < files.length; i++) {
    fs.copySync(files[i], files[i].replace(reg, pkg.directories.data));
  }
});
