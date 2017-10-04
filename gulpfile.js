'use strict';

// Include gulp
let gulp = require('gulp');
let pkg  = require('./package.json');
let beep = require('beepbeep');
let onError = function() {
  beep();
  return true;
};

// Include Our Plugins
let eslint     = require('gulp-eslint');
let nodeunit   = require('gulp-nodeunit');
let gls        = require('gulp-live-server');
let plumber    = require('gulp-plumber');
let sass       = require('gulp-sass');
let rename     = require("gulp-rename");
let uglify     = require('gulp-uglify');
let postcss    = require('gulp-postcss');
let replace    = require('gulp-replace');
let autoprefixer = require('autoprefixer');

// Lint Task
gulp.task('eslint', function() {
  return gulp.src(
    [
      '*.js',
      pkg.directories.src+'/**/*.js',
      pkg.directories.test+'/**/*.js'
    ])
    .pipe(plumber({errorHandler: onError}))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
  ;
});

// Node Unit
gulp.task('nodeunit', function() {
  return gulp.src(pkg.directories.test + '/**/*.js')
    .pipe(plumber({errorHandler: onError}))
    .pipe(nodeunit({
      reporter: 'minimal'
    }))
  ;
});

// Lint Task
gulp.task('build-js', function() {
  return gulp.src(pkg.directories.theme + '/**/js-src/*.js')
    .pipe(plumber({errorHandler: onError}))
    .pipe(eslint({
      'useEslintrc': false,
      'rules': {
        'strict': [
          2,
          'safe'
        ],
        'curly': 2,
        "semi": [
          2,
          "always"
        ],
        'no-undef': 2
      },
      'envs': [
        'browser'
      ],
      "extends": [
        "eslint:recommended"
      ]
    }))
    .pipe(eslint.format())
    //.pipe(eslint.failAfterError())
    .pipe(rename(function(path){
      path.dirname = path.dirname.replace(/js-src/, 'js');
    }))
    .pipe(uglify({output: {
      max_line_len: 9000
    }}))
    .pipe(gulp.dest(pkg.directories.theme))
  ;
});

// Sass
gulp.task('build-css', function() {
  return gulp.src(pkg.directories.theme + '/**/*.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sass({outputStyle: 'compact'}).on('error', sass.logError))
    .pipe(postcss([
      autoprefixer({
        browsers: ['last 2 versions', '> 0.5%', 'ie 8-11']
      })
    ]))
    .pipe(rename(function(path){
      path.dirname = path.dirname.replace(/sass/, 'css');
    }))
    .pipe(replace(/(\n)\s*\n/g, '$1'))
    .pipe(gulp.dest(pkg.directories.theme))
  ;
});

gulp.task('serve', function() {
  let server = gls.static(pkg.directories.htdocs);
  server.start();
  gulp.watch(pkg.directories.htdocs + '/**/*', function(file) {
    /* eslint-disable */
    server.notify.apply(server, [file]);
    /* eslint-enable */
  });
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch(['gulpfile.js', 'package.json'], process.exit);
  gulp.watch(['*.js', pkg.directories.src+'/**/*.js', pkg.directories.test+'/**/*.js'], ['test']);
  gulp.watch(pkg.directories.theme + '/**/*.js',   ['build-js']);
  gulp.watch(pkg.directories.theme + '/**/*.scss', ['build-css']);
});

// Default Task
gulp.task('test',    ['eslint', 'nodeunit']);
gulp.task('build',   ['build-js', 'build-css']);
gulp.task('default', ['serve', 'watch']);
