// Include gulp
import gulp from 'gulp';
import fs   from 'fs';

// Include Our Plugins
import eslint        from 'gulp-eslint';
import mocha         from 'gulp-mocha';
import browserSyncJs from 'browser-sync';
import sass          from 'gulp-sass';
import rename        from "gulp-rename";
import uglify        from 'gulp-uglify';
import postcss       from 'gulp-postcss';
import replace       from 'gulp-replace';
import autoprefixer  from 'autoprefixer';
import gulpStylelint from 'gulp-stylelint';

const browserSync = browserSyncJs.create();
const pkg = JSON.parse(fs.readFileSync('./package.json'));
const tasks = {
  doEslint: function() {
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
  },

  doMocha: function() {
    return gulp.src(pkg.directories.test + '/**/*.js', {read: false})
      .pipe(mocha({
        reporter: 'dot'
      }))
    ;
  },

  buildJs: function() {
    return gulp.src(pkg.directories.theme + '/**/js-src/*.js')
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
  },

  buildCss: function() {
    return gulp.src(pkg.directories.theme + '/**/*.scss')
      .pipe(gulpStylelint({
        reporters: [
          {formatter: 'string', console: true}
        ]
      }))
      .pipe(sass({outputStyle: 'compact'}).on('error', sass.logError))
      .pipe(postcss([
        autoprefixer()
      ]))
      .pipe(rename(function(path){
        path.dirname = path.dirname.replace(/sass/, 'css');
      }))
      .pipe(replace(/(\n)\s*\n/g, '$1'))
      .pipe(gulp.dest(pkg.directories.theme))
    ;
  },

  serve: function() {
    browserSync.init({
      server: pkg.directories.htdocs,
      port: 8080
    });
    gulp.watch(pkg.directories.htdocs + '/**/*').on('change', browserSync.reload);
  },

  // Watch Files For Changes
  watch: function() {
    gulp.watch(['gulpfile.js', 'package.json'], process.exit);
    gulp.watch(
      [
        '*.js', pkg.directories.bin + '/**/*',
        pkg.directories.lib + '/**/*.js',
        pkg.directories.test + '/**/*.js'
      ],
      tasks.test
    );
    gulp.watch(pkg.directories.theme + '/**/*.js',   tasks.buildJs);
    gulp.watch(pkg.directories.theme + '/**/*.scss', tasks.buildCss);
  }
};

// Bundle tasks
tasks.test = gulp.parallel(tasks.doEslint, tasks.doMocha);
tasks.build = gulp.parallel(tasks.buildJs, tasks.buildCss);
tasks.defaultTask = gulp.parallel(tasks.serve, tasks.watch);

// Expose tasks
gulp.task('buildJs',  tasks.buildJs);
gulp.task('buildCss', tasks.buildCss);
gulp.task('test',     tasks.test);
gulp.task('serve',    tasks.serve);
gulp.task('build',    tasks.build);
gulp.task('watch',    tasks.watch);
gulp.task('default',  tasks.defaultTask);
