'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');
const runSequence = require('run-sequence');
const pagespeed = require('psi');
const app = require('./server');
const vinylfs = require('vinyl-fs');

const AUTOPREFIXER_BROWSERS = [
	// Your browsers list
];

// Lint JavaScript
gulp.task('jshint', function () {
	return gulp.src('site-assets/*.js')
		.pipe($.jshint())
		.pipe($.jshint.reporter('jshint-stylish'));
});

// Optimize Images
gulp.task('images', function () {
	return gulp.src('site-assets/*.{png,jpg,svg}')
		.pipe($.cache($.imagemin({
			progressive: true,
			interlaced: true
		})))
		.pipe(gulp.dest('dist/site-assets'))
		.pipe($.size({title: 'images'}));
});

// Copy All Files At The Root Level (app)
gulp.task('copy', function () {
	return vinylfs.src([
		'examples/**',
		'bower_components/**',
		'learn.json',
		'CNAME',
		'.nojekyll',
		'site-assets/favicon.ico'
	], {
		dots: true,
		base: './',
		followSymlinks: false,
	})
	.pipe(vinylfs.dest('dist'))
	.pipe($.size({title: 'copy'}));
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function () {
	return gulp.src([
		'site-assets/*.css'
	])
	.pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
	.pipe(gulp.dest('dist/site-assets'))
	.pipe($.size({title: 'styles'}))
	.pipe(gulp.dest('.tmp/site-assets'));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
	const assets = $.useref.assets({searchPath: '{.tmp,.}'});

	return gulp.src('index.html')
		.pipe(assets)
		.pipe(assets.restore())
		.pipe($.useref())
		.pipe(gulp.dest('dist'))
		.pipe($.vulcanize({ dest: 'dist', strip: true }))
		.pipe($.size({title: 'html'}));
});

// Clean Output Directory
gulp.task('clean', function () {
	return del(['.tmp', 'dist']);
});

// Build Production Files, the Default Task
gulp.task('default', gulp.series('clean', gulp.parallel('styles', 'copy'), gulp.parallel('jshint', 'html', 'images')));

// Run PageSpeed Insights
gulp.task('pagespeed', function () {
	return pagespeed('https://todomvc.com', {
		strategy: 'mobile'
	});
});

gulp.task('serve', function (cb) {
	app.listen(8080, cb);
});

gulp.task('test-server', function (cb) {
	app.listen(8000, cb);
});
