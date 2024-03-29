import readline from 'readline';
import yaml from 'js-yaml';
import fs from 'fs';
import post from './models/post.js';

/**
 * This class reads Markdown files into an object.
 * @constructor
 * @param {String} file   [description]
 * @param {Object} config [description]
 */
const PostReader = function(file, config) {
  if (!config) {
    throw new Error('Missing configuration config.json');
  }
  if (!file) {
    throw new Error('File ' + file + ' is empty');
  }

  let readYaml = true;
  let lineNumber = 0;
  let yamlBuffer = '';
  let descriptionBuffer = '';
  let startDescriptionBuffer = false;
  let fileStat;
  const postData = {
    meta:     {},
    markdown: ''
  };

  return new Promise(
    function(resolve, reject) {
      fs.stat(file, function(err, stats) {
        fileStat = stats;
      });

      readline.createInterface({
        input: fs.createReadStream( file )
      })
        .on('line', function(line) {
          lineNumber ++;
          if (lineNumber === 1) {
            // Start YAML parser
            readYaml = line.match(/^---$/);
            if (!readYaml) {
              postData.meta.Title = line;
              postData.markdown += line + "\n";
            }
          } else if(readYaml && line.match(/^---$/)) {
            // Finish YAML parser
            readYaml = false;
            postData.meta = yaml.load(yamlBuffer);
            if (!postData.meta) {
              postData.meta = {};
            }
          } else if (readYaml) {
            // Add to YAML buffer
            yamlBuffer += line + "\n";
          } else {
            // Add to Markdown buffer
            if (!postData.meta.Title && line !== '') {
              postData.meta.Title = line;
            }
            if (!postData.meta.Description) {
              if (line.match(/^(={3,})$/) && !startDescriptionBuffer) { // TODO: This does not work for '#'-style headlines
                startDescriptionBuffer = true;
              } else if (line.match(/^(={3}|\*{3})$/) && startDescriptionBuffer) {
                startDescriptionBuffer = false;
                line = '===';
                postData.meta.Description = descriptionBuffer;
              } else if (startDescriptionBuffer) {
                descriptionBuffer += line + "\n";
              }
            }
            postData.markdown += line + "\n";
          }
        })
        .once('close', function() {
          if (!postData.meta || !postData.markdown) {
            reject(new Error('File ' + file + ' seems to be empty or cannot be parsed'));
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
        })
      ;
    }
  );
};

export default PostReader;
