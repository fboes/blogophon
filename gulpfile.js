'use strict';

// Include gulp
var gulp = require('gulp');
var pkg  = require('./package.json');
var beep = require('beepbeep');
var onError = function () { beep(); };

// Include Our Plugins
var jshint     = require('gulp-jshint');
var nodeunit   = require('gulp-nodeunit');
var livereload = require('gulp-livereload');
var plumber    = require('gulp-plumber');
var shell      = require('gulp-shell');
var sass       = require('gulp-sass');
var rename     = require("gulp-rename");
var uglify     = require('gulp-uglify');

// Lint Task
gulp.task('jshint', function() {
  return gulp.src([
      '*.js',
      pkg.directories.src+'/**/*.js',
      pkg.directories.test+'/**/*.js'
    ])
    .pipe(plumber({errorHandler: onError}))
    .pipe(jshint())
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


// Lint Task
gulp.task('build-js', function() {
  return gulp.src([
      pkg.directories.theme + '/**/js-src/*.js'
    ])
    .pipe(plumber({errorHandler: onError}))
    .pipe(jshint({ // see https://github.com/jshint/jshint/blob/master/examples/.jshintrc
       browser: true,
       jquery: true,
       strict: true,
       curly: true,
       undef:true
    }))
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(uglify({output: {
      max_line_len: 9000
    }}))
    .pipe(rename(function(path){
      path.dirname = path.dirname.replace(/js\-src/, 'js');
      return path;
    }))
    .pipe(gulp.dest(pkg.directories.theme))
  ;
});

// Sass
gulp.task('build-sass', function() {
  return gulp.src(pkg.directories.theme + '/**/*.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sass({outputStyle: 'compact'}).on('error', sass.logError))
    .pipe(rename(function(path){
      path.dirname = path.dirname.replace(/sass/, 'css');
      return path;
    }))
    .pipe(gulp.dest(pkg.directories.theme))
  ;
});


// Watch Files For Changes
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(['gulpfile.js','package.json'], process.exit);
  gulp.watch(['*.js',pkg.directories.src+'/**/*.js',pkg.directories.test+'/**/*.js'], ['default']);
  gulp.watch([pkg.directories.data+'/**/*'], ['generate']);
  gulp.watch(pkg.directories.theme + '/**/*.js', ['build-js']);
  gulp.watch(pkg.directories.theme + '/**/*.scss', ['build-sass']);
});

// Default Task
gulp.task('default',     ['jshint','nodeunit']);
gulp.task('test',        ['jshint','nodeunit']);
gulp.task('generate',    shell.task(['npm run generate']));
