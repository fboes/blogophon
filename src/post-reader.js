'use strict';

var Promise        = require('promise/lib/es6-extensions');
var fs             = require('fs');
var readline       = require('readline');
var yaml           = require('js-yaml');
var post           = require('./models/post');

/**
 * This class reads Markdown files into an object.
 * @constructor
 * @param {String} file   [description]
 * @param {Object} config [description]
 */
var PostReader = function(file, config) {
  config = config || require('../config');
  if (!file) {
    throw new Error('File '+file+' is empty');
  }

  var readYaml = true;
  var yamlBuffer = '';
  var descriptionBuffer = '';
  var startDescriptionBuffer = false;
  var fileStat;
  var postData = {
    meta:     {},
    markdown: ''
  };

  return new Promise(
    function(resolve, reject) {
      fs.stat(file, function(err, stats) {
        fileStat = stats;
      });

      readline.createInterface({
        input: require('fs').createReadStream( file )
      }).on('line', function(line) {
        if (readYaml && line.match(/\S+:[\s\S]/)) {
          yamlBuffer += line + "\n";
        } else if(readYaml && line.match(/^---$/)) {
          // do nothing
        } else {
          if (readYaml) {
            readYaml = false;
            console.log(file);
            postData.meta = yaml.safeLoad(yamlBuffer);
            if (!postData.meta) {
              postData.meta = {};
            }
          } else {
            if (!postData.meta.Title && line !== '') {
              postData.meta.Title = line;
            }
            if (!postData.meta.Description) {
              if (line.match(/^(={3,})$/) && !startDescriptionBuffer) {
                startDescriptionBuffer = true;
              } else if (line.match(/^(={3}|\*{3})$/) && startDescriptionBuffer) {
                startDescriptionBuffer = false;
                line = '===';
                postData.meta.Description = descriptionBuffer;
              } else if (startDescriptionBuffer) {
                descriptionBuffer += line+"\n";
              }
            }
            postData.markdown += line + "\n";
          }
        }
      })
      .once('close', function() {
        if (!postData.meta || !postData.markdown) {
          reject(new Error('File '+file+' seems to be empty or cannot be parsed'));
        }
        postData.meta.hasNoExtraDescription = false;
        if (!postData.meta.Description) {
          postData.meta.Description = descriptionBuffer || postData.markdown;
          postData.meta.hasNoExtraDescription = true;
        }
        if (fileStat.mtime) {
          postData.meta.DateModified = fileStat.mtime;
        }
        if (!postData.meta.Date && postData.meta.DateModified) {
          postData.meta.Date = postData.meta.DateModified;
        }
        resolve( post(file, postData.markdown, postData.meta, config) );
      });
    }
  );
};

module.exports = PostReader;
