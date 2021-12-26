import fs from 'fs';
import path from 'path';
import url from 'url';
import os from 'os';

/**
 * Returns an object with all configuration settings found in `package.json` and `config.json`.
 * @param  {String} baseDirectory       [description]
 * @return {Object}                [description]
 */
const config = function(baseDirectory = process.cwd()) {
  const pkg    = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  let external   = {};
  try {
    external = JSON.parse(fs.readFileSync( path.join(baseDirectory, 'user', 'config.json'), 'utf8'));
  } catch (e) {
    external = {
      notInitialized: true
    };
  }

  if (!external.language && process.env && process.env.LANG) {
    external.language = process.env.LANG.replace(/^([a-zA-Z]+).*?$/, '$1');
  }

  external.name               = external.name          || 'Blog';
  external.shortName          = external.shortName     || external.name.replace(/^(.{0,12})(\W.*?)$/, '$1');
  external.generator          = pkg.name;
  external.generatorVersion   = pkg.version;
  external.theme              = external.theme         || 'default';
  external.htdocs             = external.htdocs        || {};
  external.directories        = pkg.directories;
  external.directories.user   = path.join(baseDirectory, pkg.directories.user);
  external.directories.data   = path.join(baseDirectory, pkg.directories.data);
  external.directories.htdocs = path.join(baseDirectory, pkg.directories.htdocs);
  external.directories.logs = path.join(external.directories.htdocs, '..', 'logs');
  external.directories.themeBase = pkg.directories.theme;
  external.htdocs.theme       = external.htdocs.theme  || 'themes/' + external.theme;
  external.directories.theme  = path.join(baseDirectory, pkg.directories.theme);
  external.directories.currentTheme = path.join(external.directories.theme, external.theme);
  external.isWin              = /^win/.test(process.platform);
  external.baseUrl            = external.baseUrl       || 'http://' + (os.hostname() || 'example.com');
  external.basePath           = external.basePath      || '/';
  external.absoluteBasePath   = external.baseUrl + external.basePath;
  external.domain             = external.baseUrl.replace(/^[a-z]+:\/\/(.+?)(:\d+)?$/, '$1');
  external.isHttps            = external.baseUrl.match(/^https:\/\//);
  external.timeZone           = process.env.TZ || 'Europe/Berlin';
  external.locale             = external.locale  || {};
  external.locale.language    = external.locale.language  || external.language || 'en';
  external.locale.languagePosix = external.locale.language.replace('-', '_');
  external.locale.direction   =
    external.locale.direction
    || (external.locale.language.match(/^(ar|zh|fa|he)/) ? 'rtl' : 'ltr')
  ;
  external.itemsPerPage       = Number(external.itemsPerPage) || 5;
  external.defaultAuthor      = external.defaultAuthor        || {};
  external.defaultAuthor.name = external.defaultAuthor.name   || external.name;
  external.defaultAuthor.email = external.defaultAuthor.email  || 'info@' + external.domain;
  external.copyright          = external.copyright            || undefined;
  external.tags               = external.tags          || [];
  external.categories         = external.categories    || [];
  external.htdocs.posts       = external.htdocs.posts  || 'posts';
  external.htdocs.tag         = external.htdocs.tag    || 'tagged';
  external.htdocs.author      = external.htdocs.author || 'authored-by';
  external.htdocs.category    = external.htdocs.category   || 'category';
  external.searchUrl          = external.searchUrl || 'https://www.google.de/search?q=';
  external.searchMatcher      = external.searchUrl.match(/^(.*)[?&](.+)=.*?$/);
  external.searchTarget       = external.searchMatcher ? external.searchMatcher[1] : external.searchUrl;
  external.searchParam        = external.searchMatcher ? external.searchMatcher[2] : 'q';
  external.html               = external.html              || {};
  external.htmlAnalytics      = external.htmlAnalytics     || '<!-- Add analytics here -->';
  external.htmlAnalyticsAmp   = external.htmlAnalyticsAmp  || '<!-- Add AMP analytics here -->';
  external.htmlAnalyticsFeed  = external.htmlAnalyticsFeed || '<!-- Add Feed analytics here with %url and %title -->';
  external.specialFeatures    = {};
  if (external.useSpecialFeature) {
    external.useSpecialFeature.forEach(function(v) {
      external.specialFeatures[v.toLowerCase().replace(/[^a-z]/g, '')] = true;
    });
  }

  const ampComponentScripts = {
    "amp-social-share": "https://cdn.ampproject.org/v0/amp-social-share-0.1.js",
    "amp-audio": "https://cdn.ampproject.org/v0/amp-audio-0.1.js",
    "amp-iframe": "https://cdn.ampproject.org/v0/amp-iframe-0.1.js",
    "amp-youtube": "https://cdn.ampproject.org/v0/amp-youtube-0.1.js",
    "amp-vimeo": "https://cdn.ampproject.org/v0/amp-vimeo-0.1.js",
    "amp-carousel": "https://cdn.ampproject.org/v0/amp-carousel-0.1.js",
    "amp-twitter": "https://cdn.ampproject.org/v0/amp-twitter-0.1.js"
  };

  external.componentScripts = external.componentScripts || {};
  for (const webComponentName in ampComponentScripts) {
    if (!external.componentScripts[webComponentName]) {
      external.componentScripts[webComponentName] = ampComponentScripts[webComponentName];
    }
  }

  try {
    external.themeConf = JSON.parse(
      fs.readFileSync(path.join(external.directories.currentTheme, 'theme.json'), 'utf8')
    );
    external.themeConf.icon128 = undefined;
    external.themeConf.icons = external.themeConf.icons.map(function(icon) {
      icon.src = url.resolve(
        external.absoluteBasePath + external.htdocs.theme + '/',
        icon.src
      );
      if (icon.sizes === '128x128') {
        external.themeConf.icon128 = icon;
      }
      return icon;
    });
    external.themeConf.ogImage = url.resolve(
      external.absoluteBasePath + external.htdocs.theme + '/',
      external.themeConf.ogImage
    );
  } catch (e) {
    external.themeConf = {};
  }

  return external;
};

export default config;
