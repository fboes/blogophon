'use strict';

// Include gulp
var gulp = require('gulp');
var pkg  = require('./package.json');
var beep = require('beepbeep');
var onError = function() {
  beep();
  return true;
};

// Include Our Plugins
var eslint     = require('gulp-eslint');
var nodeunit   = require('gulp-nodeunit');
var livereload = require('gulp-livereload');
var plumber    = require('gulp-plumber');
var sass       = require('gulp-sass');
var rename     = require("gulp-rename");
var uglify     = require('gulp-uglify');
var postcss    = require('gulp-postcss');
var autoprefixer = require('autoprefixer');

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
      path.dirname = path.dirname.replace(/js\-src/, 'js');
    }))
    .pipe(uglify({output: {
      max_line_len: 9000
    }}))
    .pipe(gulp.dest(pkg.directories.theme))
  ;
});

// Sass
gulp.task('build-sass', function() {
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
    .pipe(gulp.dest(pkg.directories.theme))
  ;
});

// Watch Files For Changes
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(['gulpfile.js', 'package.json'], process.exit);
  gulp.watch(['*.js', pkg.directories.src+'/**/*.js', pkg.directories.test+'/**/*.js'], ['test']);
  gulp.watch(pkg.directories.theme + '/**/*.js',   ['build-js']);
  gulp.watch(pkg.directories.theme + '/**/*.scss', ['build-sass']);
});

// Default Task
gulp.task('default',     ['eslint', 'nodeunit', 'build-js', 'build-sass']);
gulp.task('test',        ['eslint', 'nodeunit']);
