import gmJs from 'gm';

/**
 * Converts images and replaces HTML for image integration.
 * @constructor
 * @param  {Object} config [description]
 * @return {Object}        [description]
 */
const imageStyles = function(config) {
  const external = {};
  const internal = {};
  const gm = gmJs.subClass({imageMagick: true});

  internal.jpgQuality = 85;

  /**
   * Improve image without changing its dimensions.
   * @param  {String}  sourceFilename [description]
   * @param  {String}  targetFilename [description]
   * @return {Promise}                [description]
   */
  external.generateNoStyleImage = function(sourceFilename, targetFilename) {
    if (!targetFilename) {
      throw new Error('No target filename given for conversion');
    }
    return new Promise(
      function(resolve, reject) {
        //console.log(sourceFilename);
        gm(sourceFilename)
          .strip() //noProfile()
          .colorspace('sRGB')
          .samplingFactor(1, 1) // @see https://developers.google.com/speed/docs/insights/OptimizeImages
          .interlace('Plane')
          .quality(internal.jpgQuality)
          .write(targetFilename, function(err) {
            if (err) {
              reject(err);
            }
            resolve( 1 );
          })
        ;
      }
    );
  };

  /**
   * Convert image to all different images sizes for a given style.
   * @param  {String}  sourceFilename [description]
   * @param  {String}  targetFilename [description]
   * @param  {String}  style          [description]
   * @return {Promise}                [description]
   */
  external.generateImagesFromStyle = function(sourceFilename, targetFilename, style) {
    if (!targetFilename) {
      throw new Error('No target filename given for conversion');
    }
    let styleData    = internal.getStyle(style);
    let processed    = 0;
    let maxProcessed = styleData.srcset.length;

    return new Promise(
      function(resolve, reject) {
        let checkProcessed = function(err) {
          if (err) {
            reject(err);
          }
          if (++processed === maxProcessed) {
            resolve( processed );
          }
        };

        styleData.srcset.forEach(function(currentSrcSet) {
          //console.log(sourceFilename);
          gm(sourceFilename)
            .strip() //noProfile()
            .colorspace('sRGB')
            .samplingFactor(1, 1) // @see https://developers.google.com/speed/docs/insights/OptimizeImages
            .geometry(currentSrcSet[0], currentSrcSet[1], "^")
            .gravity('Center')
            .crop(currentSrcSet[0], currentSrcSet[1])
            .unsharp(2, 0.5, 0.5, 0)
            .interlace('Plane')
            .quality(internal.jpgQuality)
            .write(external.getFilenameSrcset(targetFilename, currentSrcSet), checkProcessed)
          ;
        });
      }
    );
  };

  /**
   * Cycle through all styles, generate all sizes for the given image, including
   * a conversion of the original file to an optimized copy of itself.
   * @param  {String}  sourceFilename [description]
   * @param  {String}  targetFilename [description]
   * @param  {Array}   styles         Optional, defaults to all styles
   * @return {Promise}                [description]
   */
  external.generateImagesWithStyles = function(sourceFilename, targetFilename, styles) {
    if (!targetFilename) {
      throw new Error('No target filename given for conversion');
    }
    styles = styles || Object.keys(config.themeConf.imageStyles);
    let processed = 0;

    return new Promise(
      function(resolve, reject) {
        let promises = styles.map(function(style) {
          return external.generateImagesFromStyle(sourceFilename, targetFilename, style);
        });
        Promise
          .all(promises)
          .then(function(generatedImages) {
            if (promises.length > 0) {
              processed = generatedImages.reduce(function(accumulatedValue, generatedImage) {
                return accumulatedValue + generatedImage;
              });
            }
            return external.generateNoStyleImage(sourceFilename, targetFilename);
          })
          .then(function() {
            processed++;
            resolve(processed);
          })
          .catch(reject)
        ;
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

  /**
   * Returns HTML for a given filename and image style.
   * Used by `external.replaceImgHtml()`.
   * @see    https://caniuse.com/#search=webp
   * @param  {String} all      Will be ignored (as it comes from a `.replace` operation)
   * @param  {String} filename Filename of image
   * @param  {String} style    Style for image
   * @return {String}          HTML for IMG-tag
   */
  internal.parseImagesReplace = function(all, filename, style) {
    style = style || "default";
    let html;

    if (style.match(/^\d+x\d+$/)) {
      html = '<img src="' + filename + '" ' + style.replace(/^(\d+)x(\d+)$/, function(all, width, height) {
        return 'width="' + width +'" height="' + height + '" style="--aspect-ratio: ' + internal.getAspectRatio(width, height) + ';"'
      });
    } else if (filename.match(/\.(svg)/)) {
      let currentStyle = internal.getStyle(style);
      let dominantIndex = (currentStyle.srcset.length - 1);
      html = '<img src="' + filename + '" class="' + style + '"';
      html += ' width="' + currentStyle.srcset[dominantIndex][0] + '" height="' + currentStyle.srcset[dominantIndex][1] + '"';
      html += ' style="--aspect-ratio: ' + internal.getAspectRatio(currentStyle.srcset[dominantIndex][0], currentStyle.srcset[dominantIndex][1]) + ';"';
    } else {
      let currentStyle = internal.getStyle(style);
      let dominantIndex = (currentStyle.srcset.length - 1);
      let srcset = [];
      let i;

      html = '<img data-src="' + filename + '" src="' + external.getFilenameSrcset(filename, currentStyle.srcset[dominantIndex]) + '" class="' + style + '"';
      html += ' width="' + currentStyle.srcset[dominantIndex][0] + '" height="' + currentStyle.srcset[dominantIndex][1] + '"';
      html += ' style="--aspect-ratio: ' + internal.getAspectRatio(currentStyle.srcset[dominantIndex][0], currentStyle.srcset[dominantIndex][1]) + ';"';

      if (currentStyle.srcset.length > 1) {
        for (i = 0; i < currentStyle.srcset.length; i++) {
          srcset.push(external.getFilenameSrcset(filename, currentStyle.srcset[i]) + ' ' + currentStyle.srcset[i][0] + 'w');
        }
        html += ' srcset="' + srcset.join(', ') + '"';
        if (currentStyle.sizes.length) {
          html += ' sizes="' + currentStyle.sizes.join(', ') + '"';
        }
      }
    }

    return html;
  };

  /**
   * Get computed filename of image, given its style and index.
   * @param  {String}  filename Original filename.
   * @param  {String}  style    like `default`, `quad`
   * @param  {Integer} index    Index of style, defaults to `0`.
   * @return {String}           Converted filename for given style.
   */
  external.getFilename = function(filename, style, index) {
    let currentStyle = internal.getStyle(style);
    index = index || 0;
    if (!currentStyle.srcset[index]) {
      throw new Error("Wrong image index in style: " + style + ', ' + index);
    }
    return external.getFilenameSrcset(filename, currentStyle.srcset[index]);
  };

  /**
   * Get computed filename of image, given its srcset.
   * @param  {String} filename Original filename.
   * @param  {Array}  srcset   with [width,height]
   * @return {String}          Converted filename for given style.
   */
  external.getFilenameSrcset = function(filename, srcset) {
    return filename.replace(/^(.+)(\.[^.]+)$/, '$1-' + Number(srcset[0]) + 'x' + Number(srcset[1]) + '$2');
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
    } else if (style.match(/^\d+x\d+$/)) {
      return {};
    }
    throw new Error("Wrong image style: " + style);
  };

  /**
   * Normalize aspect ratio
   * @param {Integer} width
   * @param {Integer} height
   * @return {String}
   */
  internal.getAspectRatio = function(width, height) {
    switch (Number(width) / Number(height)) {
      case 21/9: return '21/9';
      case 16/9: return '16/9';
      case 16/10: return '16/10';
      case 4/3: return '4/3';
      case 3/2: return '3/2';
      case 1/2: return '1/2';
      case 1/1: return '1/1';
      case 2/1: return '2/1';
      case 2/3: return '2/3';
      case 3/4: return '3/4';
      case 10/16: return '10/16';
      case 9/16: return '9/16';
      case 9/21: return '9/21';
    }
    return String(width) + '/' + String(height);
  };

  return external;
};

export default imageStyles;
