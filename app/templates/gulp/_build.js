'use strict';

var gulp = require('gulp');
var merge = require('merge-stream');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

<% if (props.htmlPreprocessor.key === 'none') { %>
gulp.task('partials', function () {
<% } else { %>
gulp.task('partials', ['markups'], function () {
<% } %>
  return gulp.src([
    paths.src + '/{app,components}/**/*.html',
    paths.tmp + '/serve/{app,components}/**/*.html'
  ])
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: '<%= appName %>'
    }))
    .pipe(gulp.dest(paths.tmp + '/partials/'));
});

gulp.task('html', ['inject', 'partials'], function () {
  var partialsInjectFile = gulp.src(paths.tmp + '/partials/templateCacheHtml.js', { read: false });
  var partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: paths.tmp + '/partials',
    addRootSlash: false
  };

  var htmlFilter = $.filter('*.html');
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');
  var assets;

  return gulp.src(paths.tmp + '/serve/*.html')
    .pipe($.inject(partialsInjectFile, partialsInjectOptions))
    .pipe(assets = $.useref.assets())
    .pipe($.rev())
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe($.uglify({preserveComments: $.uglifySaveLicense}))
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
<% if (props.ui.key === 'bootstrap' && props.cssPreprocessor.extension === 'scss') { %>
    .pipe($.replace('/bower_components/bootstrap-sass-official/assets/fonts/bootstrap/', '../fonts/'))
<% } else if (props.ui.key === 'bootstrap' && props.cssPreprocessor.extension === 'less') { %>
    .pipe($.replace('/bower_components/bootstrap/fonts/', '../fonts/'))
<% } %>
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(htmlFilter)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe(htmlFilter.restore())
    .pipe(gulp.dest(paths.dist + '/'))
    .pipe($.size({ title: paths.dist + '/', showFiles: true }));
});
<% if (imageMin) { %>

gulp.task('images', function () {
  return gulp.src(paths.src + '/assets/images/**/*')
    .pipe($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(paths.dist + '/assets/images/'));
});
<% } %>

// Only applies for fonts from bower dependencies
gulp.task('fonts', function () {
  var customFonts = gulp.src(paths.src + '/assets/fonts/**/*')
    .pipe(gulp.dest(paths.dist + '/assets/fonts/'));

  var bowerFonts = gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe($.flatten())
    .pipe(gulp.dest(paths.dist + '/fonts/'));

  return merge(customFonts, bowerFonts);
});

gulp.task('other', function () {
  return gulp.src([
    paths.src + '/**/*',
    '!' + paths.src + '/**/*.{<%= processedFileExtension %>}'
  ])
    .pipe(gulp.dest(paths.dist + '/'));
});

<% if (props.jsPreprocessor.key === 'typescript') { %>
gulp.task('clean', ['tsd:purge'], function (done) {
<% } else { %>
gulp.task('clean', function (done) {
<% } %>
  $.del([paths.dist + '/', paths.tmp + '/'], done);
});

<% if (imageMin) { %>
gulp.task('build', ['html', 'images', 'fonts', 'other']);
<% } else { %>
gulp.task('build', ['html', 'fonts', 'other']);
<% } %>
