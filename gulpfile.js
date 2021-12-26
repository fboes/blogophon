// Include gulp
import gulp from 'gulp';
import fs   from 'fs';

// Include Our Plugins
import eslint        from 'gulp-eslint';
import mocha         from 'gulp-mocha';
import browserSyncJs from 'browser-sync';
import sassJs        from 'gulp-sass';
import sassCompiler  from 'sass';
import rename        from "gulp-rename";
import uglify        from 'gulp-uglify';
import postcss       from 'gulp-postcss';
import replace       from 'gulp-replace';
import autoprefixer  from 'autoprefixer';
import gulpStylelint from '@ronilaukkarinen/gulp-stylelint';

const browserSync = browserSyncJs.create();
const pkg = JSON.parse(fs.readFileSync('./package.json'));
const sass = sassJs(sassCompiler);

const doEslint = function() {
  return gulp.src(
    [
      '*.js',
      pkg.directories.bin + '/**/*',
      pkg.directories.lib + '/**/*.js',
      pkg.directories.test + '/**/*.js'
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    // .pipe(eslint.failAfterError())
  ;
};

const doMocha = function() {
  return gulp.src(pkg.directories.test + '/**/*.js', {read: false})
    .pipe(mocha({
      reporter: 'dot'
    }))
  ;
};

const buildJs = function() {
  return gulp.src(pkg.directories.theme + '/**/js-src/*.js')
    .pipe(eslint())
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
};

const buildCss = function() {
  return gulp.src(pkg.directories.theme + '/**/*.scss')
    .pipe(gulpStylelint({
      reporters: [
        {formatter: 'string', console: true}
      ]
    }))
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(rename(function(path){
      path.dirname = path.dirname.replace(/sass/, 'css');
    }))
    .pipe(replace(/(\n)\s*\n/g, '$1'))
    .pipe(gulp.dest(pkg.directories.theme))
  ;
};

const serve = function() {
  browserSync.init({
    server: pkg.directories.htdocs,
    port: 8080
  });
  gulp.watch(pkg.directories.htdocs + '/**/*').on('change', browserSync.reload);
};

// Watch Files For Changes
const watch = function() {
  gulp.watch(['gulpfile.js', 'package.json'], process.exit);
  gulp.watch(
    [
      '*.js', pkg.directories.bin + '/**/*',
      pkg.directories.lib + '/**/*.js',
      pkg.directories.test + '/**/*.js'
    ],
    test
  );
  gulp.watch(pkg.directories.theme + '/**/*.js',   buildJs);
  gulp.watch(pkg.directories.theme + '/**/*.scss', buildCss);
};


// Bundle tasks
const test = gulp.parallel(doEslint, doMocha);
const build = gulp.parallel(buildJs, buildCss);
const defaultTask = gulp.parallel(serve, watch);

// Expose tasks
export {doEslint, doMocha, buildJs, buildCss, serve, watch, test, build};
export default defaultTask;
