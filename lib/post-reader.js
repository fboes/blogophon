'use strict';

var Promise        = require('promise/lib/es6-extensions');
var fs             = require('fs');
var config         = require('./config');
var Post           = require('./post');
var readline       = require("readline");
var yamljs         = require('yamljs');
var util           = require('util');

/**
 * Represents a single blog item.
 * @constructor
 */
var PostReader = function ( file ) {
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
  return new Promise (
    function(resolve, reject) {
      fs.stat(file, function(err, stats) {
        fileStat = stats;
      });

      var lineReader = readline.createInterface({
        input: require('fs').createReadStream( file )
      }).on('line', function (line) {
        if (readYaml && line.match(/\S+:[\s\S]/)) {
          yamlBuffer += line + "\n";
        } else if(readYaml && line.match(/^---$/)) {
          // do nothing
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
        if (!exports.meta || !exports.markdown) {
          reject(new Error('File '+file+' seems to be empty or cannot be parsed'));
        }
        exports.meta.noLinkNeeded = false;
        if (exports.meta.Description === undefined && descriptionBuffer) {
          exports.meta.Description = descriptionBuffer;
          exports.meta.noLinkNeeded = true;
        }
        if (exports.meta.Date) {
          exports.meta.Date = exports.meta.Date;
        } else if (exports.meta.Date === undefined && fileStat.mtime !== undefined) {
          exports.meta.Date = fileStat.mtime;
        }

        exports.meta.Url = file.replace(/user\//,config.basePath).replace(/\.md$/,'/');

        //console.log(exports);
        resolve( Post(exports.markdown, exports.meta) );
      });
    }
  );
};

module.exports = PostReader;
