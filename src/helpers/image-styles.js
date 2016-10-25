'use strict';

var gm             = require('gm').subClass({imageMagick: true});
var Promise        = require('promise/lib/es6-extensions');

var imageStyles = function (config) {
  var external = {};
  var internal = {};

  /**
   * Cycle through all styles and indexes, generate alls variants fo the given image.
   * @param  {String}  filename [description]
   * @return {Promise}          [description]
   */
  external.generateImages = function(filename) {
    var currentStyle;
    var srcset = [];
    var i;
    var processed = 0;
    var maxProcessed = 0;

    Object.keys(config.themeConf.imageStyles).forEach(function(style) {
      currentStyle = internal.getStyle(style);
      for (i = 0; i < currentStyle.srcset.length; i++) {
        maxProcessed ++;
        srcset.push([style,i]);
      }
    });

    return new Promise (
      function(resolve, reject) {
        var style;
        var checkProcessed = function(err) {
          if (err) {
            reject(err);
          }
          if (++processed === maxProcessed) {
            gm(filename)
              .noProfile()
              .interlace('Line')
              .write(filename,function () {
                processed++;
                resolve( processed );
              })
            ;
          }
        };
        srcset.forEach(function(src) {
          style = src[0];
          i     = src[1];
          currentStyle = internal.getStyle(style);
          gm(filename)
            .noProfile()
            .geometry(currentStyle.srcset[i][0], currentStyle.srcset[i][1], "^")
            .gravity('Center')
            .crop(currentStyle.srcset[i][0], currentStyle.srcset[i][1])
            .interlace('Line')
            .write(external.getFilename(filename, style, i), checkProcessed)
          ;
        });
      }
    );
  };


  /**
   * Replace IMG-tags in HTML with HTML for their current style.
   * @param  {String} html [description]
   * @return {String}      [description]
   */
  external.replaceImgHtml = function(html) {
    return html.replace(/(?:<img src=")([^"]+)#([^"]+)(?:")/g, internal.parseImagesReplace);
  };

  internal.parseImagesReplace = function(all, filename, style) {
    style = style || "default";
    var currentStyle = internal.getStyle(style);
    var dominantIndex = (currentStyle.srcset.length - 1);
    var srcset = [];
    var i;

    var html = '<img data-src="'+filename+'" src="'+external.getFilename(filename, style, dominantIndex)+'" class="'+style+'"';
    // html += ' width="'+currentStyle.srcset[dominantIndex][0]+'" height="'+currentStyle.srcset[dominantIndex][1]+'"';

    if (currentStyle.srcset.length > 1) {
      for (i = 0; i < currentStyle.srcset.length; i++) {
        srcset.push(external.getFilename(filename, style, i) + ' '+currentStyle.srcset[i][0]+'w');
      }
      html += ' srcset="'+srcset.join(', ')+'"';
      if (currentStyle.sizes.length) {
        html += ' sizes="'+currentStyle.sizes.join(', ')+'"';
      }
    }

    return html;
  };

  /**
   * Get computed filename of image, given its style and index.
   * @param  {String}  filename [description]
   * @param  {String}  style    [description]
   * @param  {Integer} index    [description], optional
   * @return {String}           [description]
   */
  external.getFilename = function(filename, style, index) {
    var currentStyle = internal.getStyle(style);
    index = index || 0;
    if (!currentStyle.srcset[index]) {
      throw new Error("Wrong image index in style: "+style + ', ' +index);
    }
    return filename.replace(/^(.+)(\.[^\.]+)$/,'$1-'+currentStyle.srcset[index][0]+'x'+currentStyle.srcset[index][1]+'$2');
  };

  /**
   * Get style properties.
   * @param  {String} style [description]
   * @return {Object}       [description]
   */
  internal.getStyle = function(style) {
    style = style || "default";
    if (config.themeConf && config.themeConf.imageStyles[style] !== undefined) {
      return config.themeConf.imageStyles[style];
    } else {
      throw new Error("Wrong image style: "+style);
    }
  };

  return external;
};

module.exports = imageStyles;
