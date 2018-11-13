'use strict';

// Include gulp
const gulp = require('gulp');
const pkg  = require('./package.json');
const beep = require('beeper');
const onError = function() {
  beep();
  return true;
};

// Include Our Plugins
const eslint       = require('gulp-eslint');
const mocha        = require('gulp-mocha');
const browserSync  = require('browser-sync').create();
const plumber      = require('gulp-plumber');
const sass         = require('gulp-sass');
const rename       = require("gulp-rename");
const uglify       = require('gulp-uglify');
const postcss      = require('gulp-postcss');
const replace      = require('gulp-replace');
const autoprefixer = require('autoprefixer');

// Lint Task
gulp.task('eslint', function() {
  return gulp.src(
    [
      '*.js',
      pkg.directories.bin + '/**/*',
      pkg.directories.lib + '/**/*.js',
      pkg.directories.test + '/**/*.js'
    ])
    .pipe(plumber({errorHandler: onError}))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
  ;
});

// Node Unit
gulp.task('mocha', function() {
  return gulp.src(pkg.directories.test + '/**/*.js', {read: false})
    .pipe(plumber({errorHandler: onError}))
    .pipe(mocha({
      reporter: 'dot'
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
        browsers: ['cover 97%']
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
  browserSync.init({
    server: pkg.directories.htdocs,
    port: 8080
  });
  gulp.watch(pkg.directories.htdocs + '/**/*').on('change', browserSync.reload);
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch(['gulpfile.js', 'package.json'], process.exit);
  gulp.watch(['*.js', pkg.directories.bin + '/**/*', pkg.directories.lib + '/**/*.js', pkg.directories.test + '/**/*.js'], ['test']);
  gulp.watch(pkg.directories.theme + '/**/*.js',   ['build-js']);
  gulp.watch(pkg.directories.theme + '/**/*.scss', ['build-css']);
});

// Default Task
gulp.task('test',    ['eslint', 'mocha']);
gulp.task('build',   ['build-js', 'build-css']);
gulp.task('default', ['serve', 'watch']);
