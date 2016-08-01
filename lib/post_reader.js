'use strict';

var EventEmitter = require( "events" ).EventEmitter;

/**
 * Represents a single blog item.
 * @constructor
 */
var PostReader = new EventEmitter();

PostReader.parse = function ( file ) {
  var Post = require('./post');
  var fs = require('fs');
  var readline = require("readline");
  var yamljs = require('yamljs');
  var util = require('util');

  EventEmitter.call(this);
  var readYaml = true,
    yamlBuffer = '',
    descriptionBuffer = '',
    startDescriptionBuffer = false,
    fileStat,
    exports = {
      meta : {},
      markdown : ''
    }
  ;

  fs.stat(file, function(err, stats) {
    fileStat = stats;
  });

  var lineReader = readline.createInterface({
    input: require('fs').createReadStream( file )
  }).on('line', function (line) {
    if (readYaml && line.match(/\S+:[\s\S]/)) {
      yamlBuffer += line + "\n";
    } else {
      if (readYaml) {
        readYaml = false;
        exports.meta = yamljs.parse(yamlBuffer);
        if (!exports.meta) {
          exports.meta = {};
        }
      } else {
        if (exports.meta.Title === undefined && line !== '') {
          exports.meta.Title = line;
        }
        if (exports.meta.Description === undefined) {
          if (line.match(/^={3}/) && !startDescriptionBuffer) {
            startDescriptionBuffer = true;
          } else if (line.match(/^={3}/) && startDescriptionBuffer) {
            startDescriptionBuffer = false;
            exports.meta.Description = descriptionBuffer;
          } else if (startDescriptionBuffer) {
            descriptionBuffer += line+"\n";
          }
        }
        exports.markdown += line + "\n";
      }
    }
  })
  .once('close',function () {
    if (exports.meta.Description === undefined && descriptionBuffer) {
      exports.meta.Description = descriptionBuffer;
    }
    if (exports.meta.Date) {
      exports.meta.Date = exports.meta.Date;
    } else if (exports.meta.Date === undefined && fileStat.mtime !== undefined) {
      exports.meta.Date = fileStat.mtime;
    }

    exports.meta.Url = file.replace(/user\//,'').replace(/\.md$/,'/');

    //console.log(exports);
    PostReader.emit('parsed', Post(exports.markdown, exports.meta));
  });

  return this;
};

module.exports = PostReader;
