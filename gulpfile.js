'use strict';

// Include gulp
var gulp = require('gulp');
var fs = require('fs');
var pkg = JSON.parse(fs.readFileSync('./package.json'));
var beep = require('beepbeep');
var onError = function (err) { beep(); };

// Include Our Plugins
var jshint     = require('gulp-jshint');
var nodeunit   = require('gulp-nodeunit');
var livereload = require('gulp-livereload');
var plumber    = require('gulp-plumber');
var shell      = require('gulp-shell');

// Lint Task
gulp.task('jshint', function() {
  return gulp.src([
      '*.js',
      pkg.directories.lib+'/**/*.js',
      pkg.directories.test+'/**/*.js'
    ])
    .pipe(plumber({errorHandler: onError}))
    .pipe(jshint({ // see https://github.com/jshint/jshint/blob/master/examples/.jshintrc
      node: true,
      curly: true,
      undef: true,
      strict: true
    }))
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
  ;
});

// Node Unit
gulp.task('nodeunit', function() {
  return gulp.src(pkg.directories.test + '/**/*.js')
    .pipe(plumber({errorHandler: onError}))
    .pipe(nodeunit({
      reporter: 'junit',
      reporterOptions: {
        output: 'test'
      }
    }))
  ;
});

// Watch Files For Changes
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(['gulpfile.js','package.json'], process.exit);
  gulp.watch(['*.js',pkg.directories.lib+'/**/*.js',pkg.directories.test+'/**/*.js'], ['default']);
  gulp.watch([pkg.directories.data+'/**/*'], ['compile']);
});

// Default Task
gulp.task('default',     ['jshint']);
gulp.task('test',        ['jshint','nodeunit']);
gulp.task('compile',     shell.task(['npm run start']));
