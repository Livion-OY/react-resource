'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var stylus = require('gulp-stylus');
var nodemon = require('gulp-nodemon');
var del = require('del');
// set variable via $ gulp --type production
var environment = $.util.env.type || 'development';
var isProduction = environment === 'production';
var webpackConfig = require('./webpack.config.js').getConfig(environment);

var port = $.util.env.port || 1337;
var app = 'app/';
var dist = 'dist/';

gulp.task('scripts', function() {
  return gulp.src(webpackConfig.entry)
    .pipe($.webpack(webpackConfig))
    .pipe(isProduction ? $.uglifyjs() : $.util.noop())
    .pipe(gulp.dest(dist + 'js/'))
    .pipe($.size({ title : 'js' }))
    .pipe($.connect.reload());
});

// copy html from app to dist
gulp.task('html', function() {
  return gulp.src(app + 'index.html')
    .pipe(gulp.dest(dist))
    .pipe($.size({ title : 'html' }))
    .pipe($.connect.reload());
});

gulp.task('styles', function () {
  return gulp.src('./app/stylus/*.styl')
    .pipe(stylus())
    .pipe($.minifyCss())
    .pipe(gulp.dest(dist + 'css/'))
    .pipe($.connect.reload());
});

// add livereload on the given port
gulp.task('serve', function() {
  $.connect.server({
    root: dist,
    port: port,
    livereload: {
      port: 35729
    }
  });
});

// copy images
gulp.task('images', function() {
  return gulp.src(app + 'images/**/*.{png,jpg,jpeg,gif}')
    .pipe($.size({ title : 'images' }))
    .pipe(gulp.dest(dist + 'images/'));
});

gulp.task('fonts', function() {
  return gulp.src(app + 'bower_components/fontawesome/fonts/*.{otf,svg,ttf,woff,woff2}')
    .pipe($.size({ title : 'fonts' }))
    .pipe(gulp.dest(dist + 'fonts/'));
});


// watch styl, html and js file changes
gulp.task('watch', ['build'], function() {
  gulp.watch(app + 'stylus/*.styl', ['styles']);
  gulp.watch(app + 'index.html', ['html']);
  gulp.watch(app + 'scripts/**/*.js', ['scripts']);
  gulp.watch(app + 'scripts/**/*.jsx', ['scripts']);
  gulp.watch('../resource.js', ['scripts']);
});

// remove bundels
gulp.task('clean', function(cb) {
  del([dist], cb);
});

/*
 * Run backend
 */
gulp.task('backend', function () {
  nodemon({
    script: 'server.js',
    ext: 'js',
    ignore: ['app/**/*', 'dist/**/*']
  });
});

// by default build project and then watch files in order to trigger livereload
gulp.task('default', ['backend', 'watch']);

// waits until clean is finished then builds the project
gulp.task('build', ['clean'], function() {
  gulp.start(['images', 'fonts', 'html', 'scripts', 'styles']);
});
