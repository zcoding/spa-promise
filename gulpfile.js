var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var compress = require('gulp-zip');
var replace = require('gulp-replace');

var pkg = require('./package.json');

var sources = ['./src/intro.js', './src/promise.js', './src/outro.js'];

gulp.task('build', function() {

  return gulp.src(sources)
    .pipe(concat('ipromise.js', {newLine: '\n'}))
    .pipe(replace(/@@version/g, pkg.version))
    .pipe(replace(/@@author/g, pkg.author))
    .pipe(replace(/@@repository/g, pkg.repository.url))
    .pipe(gulp.dest('./build'))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename('ipromise.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build'));

});

gulp.task('release', ['build'], function() {

  return gulp.src(['src/*', 'script/*', 'demo/*', 'build/*', 'gulpfile.js', 'LICENSE', 'package.json', 'README.md'], {base: '.'})
    .pipe(compress('spa-promise-' + pkg.version + '.zip'))
    .pipe(gulp.dest('./release'));

});

gulp.task('dev', ['build'], function() {

  gulp.watch(sources, ['build']).on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });

});
