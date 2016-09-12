/* eslint-disable */

'use strict';

var sass = require('gulp-sass'),
    documentation = require('gulp-documentation'),
    coffee = require( 'gulp-coffee' ),
    gutil = require( 'gulp-util' ),
    gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var webpack = require('gulp-webpack');
var del = require('del');
var eslint = require('gulp-eslint');
const babel = require('gulp-babel');
var minify = require('gulp-minify');

gulp.task('compile-sass', ['copy-prism'], function () {
  gulp.src('./app/sass/app.scss')
    .pipe(sass({outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('app/dist'));
});

gulp.task('copy-prism', function () {
  return gulp.src('node_modules/prismjs/themes/prism-coy.css')
  .pipe(rename('_prism-coy.scss'))
  .pipe(gulp.dest('app/sass'));
});

gulp.task('webpack', function () {
  return gulp.src('app/modules/app.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('app/dist'));
});

//Clean the documentation folder
gulp.task('clean', function () {
  return del([
    'documentation/**/*'
  ]);
});

//Can't minify ES6 with webpack, so need to transpile it first
gulp.task('babel', ['webpack'], () => {
    return gulp.src('app/dist/app.bundle.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(minify({
            ext:{
                min:'.min.js'
            }
        }))
        .pipe(gulp.dest('app/dist'));
});

/**
 * Process JavaScript files with eslint
 */
gulp.task('lint', () => {
   // ESLint ignores files with "node_modules" paths.
   // So, it's best to have gulp ignore the directory as well.
   // Also, Be sure to return the stream from the task;
   // Otherwise, the task may end before the stream has finished.
   return gulp.src(['app/modules/**/*.js', '!*.min.js', '!app.bundle.js', '!app.bundle.min.js', '!svg-assets.js'])
       // eslint() attaches the lint output to the "eslint" property
       // of the file object so it can be used by other modules.
       .pipe(eslint())
       // eslint.format() outputs the lint results to the console.
       // Alternatively use eslint.formatEach() (see Docs).
       .pipe(eslint.format())
       // To have the process exit with an error code (1) on
       // lint error, return the stream and pipe to failAfterError last.
       .pipe(eslint.failAfterError());
});

/**
 * Jasmine
 */
gulp.task('coffee', function() {
  gulp.src('./testing/spec/*.coffee')
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('./testing/spec/'));
});

/**
 * Generate the angular scripts documentation
 */
var shell = require('gulp-shell');
gulp.task('docs', shell.task([
  'node_modules/jsdoc/jsdoc.js '+
    '-c node_modules/angular-jsdoc/common/conf.json '+   // config file
    '-t node_modules/angular-jsdoc/angular-template '+   // template file
    '-d documentation '+                           // output directory
    './README.md ' +                            // to include README.md as index contents
    '-r app/modules/*.js app/modules/**/*.js '                  // source code directory
    // '-u tutorials'                              // tutorials directory
]));

// gulp.task(
//   'php-doc',
//   shell.task(['vendor/bin/phpdoc -d ./inc/ -t testing/doc/php -i vendor/,node_modules/,server.php,inc/custom-header.php,inc/jetpack.php,inc/settings.php,inc/template-tags.php,inc/customizer.php'])
// );

gulp.task('build', ['clean', 'docs', 'babel', 'compile-sass']);

gulp.task('watch-docs', function () {
  gulp.watch('./app/modules/**/*.js', ['docs']);
  gulp.watch('README.md', ['docs']);
});

gulp.task('watch', function () {
  gulp.watch('./app/sass/**/*.scss', ['compile-sass']);
  gulp.watch('./app/modules/**/*.js', ['webpack']);
  gulp.watch('testing/spec/*.coffee', ['coffee']);
});
