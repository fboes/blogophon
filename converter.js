#!/usr/bin/env node
'use strict';

/* global DateSetFromIsoString */

var fs = require('fs-extra');
var pkg = JSON.parse(fs.readFileSync('./package.json'));


var glob = require("glob");
var readline = require("readline");
var yamljs = require('yamljs');

/**
 * Convert given UTC string into Date object
 * @param  {String} dateString like '2015-11-06 13:21:00+02:00'
 * @return {Date}              [description]
 */
var DateSetFromIsoString = function (dateString) {
  var dateValues = dateString.match(/^(\d+)\-(\d+)\-(\d+)(?:.(\d+):(\d+):(\d+)(?:(\+|\-)(\d+)\:(\d+))?)?/), i, that = new Date();
  if (dateValues) {
    for (i = 0; i <= 9; i++) {
      if (!dateValues[i]) {
        switch (i) {
          case 7:
            dateValues[i] = (that.getTimezoneOffset() >= 0) ? '+' : '-';
            break;
          case 8:
            dateValues[i] = Math.abs(that.getTimezoneOffset()/60);
            break;
          default:
            dateValues[i] = 0;
            break;
        }
      } else if (i !== 7) {
        dateValues[i] = parseInt(dateValues[i]);
      }
    }
    that = new Date(Date.UTC(
      (dateValues[3]),
      (dateValues[2] - 1),
      (dateValues[1]),
      ((dateValues[7] === '+') ? dateValues[4] - dateValues[8] : dateValues[4] + dateValues[8]),
      ((dateValues[7] === '+') ? dateValues[5] - dateValues[9] : dateValues[5] + dateValues[9]),
      (dateValues[6])
    ));
    return that;
  }
  throw "No valid ISO time string";
};

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
