/* eslint-disable */
'use strict';

const build = false;

const gulp = require('gulp');
const {src, dest, parallel, series, pipe} = gulp;
const concat = require('gulp-concat');

const browserSync = require('browser-sync').create();

const paths = {
	src: './src/',
	outdir: './build/',
	fonts: './src/assets/fonts/*.*',
	js: ['./src/assets/js/lib/**/*.js', './src/component/**/*.js', './src/assets/js/script/**/*.js', './src/assets/js/App.js'],
	styles: [
		'./src/assets/css/lib/*.+(css|scss)',
		'./src/assets/css/var.scss',
		'./src/assets/css/var.scss',
		'./src/assets/css/font.scss',
		'./src/assets/css/reset.scss',
		'./src/assets/css/atomic.scss',
		'./src/assets/css/mixin.scss',
		'./src/assets/css/style.scss',
		'./src/assets/css/old_css.+(css|scss)',
		'./src/assets/css/animation.scss',
		'./src/assets/css/ui/**/*.scss',
		'./src/UI/**/*.scss',
		'./src/component/**/*.scss',
		'./src/feature/**/*.scss',
		'./src/particles/**/*.scss',
	],
	html: ['./src/**/*.(njk|html)'],
	img: ['./src/assets/img/*.+(png|jpg)']
}

function browsersync() {
	browserSync.init({
		files: '.*.html',
		startPath: 'page/index.html',
		server: {
			baseDir: paths.outdir,
		},
		notify: false,
		online: true,
	});
}

function css_sprite () {
	const csso = require('gulp-csso');
	const groupcss = require('gulp-group-css-media-queries');
	const sass = require('gulp-sass')(require('sass'));

	const gulp_postcss = require('gulp-postcss');
	const postcss = require('postcss');
	const strites = require('postcss-sprites');
	const updateRule = require('postcss-sprites/lib/core').updateRule;
	const opts = {
		spritePath: './build/img/',
		basePath: './src/assets/',
		stylesheetPath: './build',
		filterBy: function (image) {
			if (!/icon|market|site|stat|path/.test(image.url)) {
				return Promise.reject();
			}
			return Promise.resolve();
		},
		groupBy: function (image) {
			if (image.url.indexOf('icon') !== -1) {
				return Promise.resolve('icon');
			}
			if (image.url.indexOf('market') !== -1) {
				return Promise.resolve('market');
			}
			if (image.url.indexOf('site') !== -1) {
				return Promise.resolve('site');
			}
			if (image.url.indexOf('stat') !== -1) {
				return Promise.resolve('stat');
			}
			if (image.url.indexOf('path') !== -1) {
				return Promise.resolve('path');
			}
			return Promise.reject(new Error('other'));
		},
		hooks: {
			onUpdateRule: function (rule, token, image) {
				['width', 'height'].forEach(function (prop) {
					updateRule(rule, token, image);

					let value = image.coords[prop];

					let backgroundSizeX = (image.spriteWidth / image.coords.width) * 100;
					let backgroundSizeY = (image.spriteHeight / image.coords.height) * 100;
					let backgroundPositionX = (image.coords.x / (image.spriteWidth - image.coords.width)) * 100;
					let backgroundPositionY = (image.coords.y / (image.spriteHeight - image.coords.height)) * 100;

					backgroundSizeX = isNaN(backgroundSizeX) ? 0 : backgroundSizeX;
					backgroundSizeY = isNaN(backgroundSizeY) ? 0 : backgroundSizeY;
					backgroundPositionX = isNaN(backgroundPositionX) ? 0 : backgroundPositionX;
					backgroundPositionY = isNaN(backgroundPositionY) ? 0 : backgroundPositionY;

					const backgroundSize = postcss.decl({
						prop: 'background-size',
						value: backgroundSizeX + '% ' + backgroundSizeY + '%',
					});

					const backgroundPosition = postcss.decl({
						prop: 'background-position',
						value: backgroundPositionX + '% ' + backgroundPositionY + '%',
					});

					const backgroundImage = postcss.decl({
						prop: 'background-image',
						value: 'url("/' + image.spriteUrl + '")',
					});

					if (image.retina) {
						value /= image.ratio;
					}
					rule.insertAfter(rule.last, postcss.decl({
						prop: prop,
						value: value + 'px',
					}));

					rule.insertAfter(rule.last, backgroundImage);
					rule.insertAfter(backgroundImage, backgroundPosition);
					rule.insertAfter(backgroundPosition, backgroundSize);
				});
			},
		},
	};
	const postcss_modules = [strites(opts)];

	const cache = require('gulp-cache');

	return src('./src/assets/css/sprite.scss')
		.pipe(cache(gulp_postcss(postcss_modules)))
		.pipe(src(paths.styles))
		.pipe(concat('style.css', {rebaseUrls: false}))
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(cache(gulp_postcss(postcss_modules)))
		.pipe(groupcss())
		.pipe(csso())
		.pipe(dest('./build/css/'))
		.pipe(browserSync.stream());
}

function css() {
	const csso = require('gulp-csso');
	const groupcss = require('gulp-group-css-media-queries');
	const sass = require('gulp-sass')(require('sass'));

	const gulp_postcss = require('gulp-postcss');
	const postcss = require('postcss');
	const autoprefixer = require('autoprefixer');
	const postcss_modules = [autoprefixer()];

	return src(paths.styles)
		.pipe(concat('style.css', {rebaseUrls: false}))
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(gulp_postcss(postcss_modules))
		.pipe(groupcss())
		.pipe(csso())
		.pipe(dest('./build/css/'))
		.pipe(browserSync.stream());
}

function img() {
	const imagemin = require('gulp-imagemin');

	return src(paths.img)
		.pipe(
			imagemin([
				imagemin.mozjpeg({quality: 75, progressive: true}),
				imagemin.optipng({optimizationLevel: 5})
			])
		)
		.pipe(dest('./build/img/'))
		.pipe(browserSync.stream());
}

function fonts() {
	return src(paths.fonts)
		.pipe(dest('./build/fonts'));
}

function html() {
	const gulp_nunjucks = require('gulp-nunjucks');
	//const nunjucks = require('nunjucks');
	const rename = require("gulp-rename");

	return src(['./src/*.njk'])
		.pipe(gulp_nunjucks.compile(
			{option: {}}
		))
		.pipe(rename({dirname: ''}))
		.pipe(dest('./build/page/'))
		.pipe(browserSync.stream());
}

function js() {
	const terser = require('gulp-terser');
	return src(paths.js)
		.pipe(concat('App.js'))
		//.pipe(terser())
		.pipe(gulp.dest('./build/js/'))
		.pipe(browserSync.stream());
}

function watch() {
	browsersync();
	gulp.watch(paths.styles, css);
	gulp.watch(paths.html, html);
	gulp.watch(paths.js, js);
	gulp.watch(paths.img, img);
}

gulp.task('build', parallel(css, js, html, img, fonts));
gulp.task('font', fonts);
gulp.task('css', css);
gulp.task('img', img);
gulp.task('js', js);
gulp.task('html', html);
gulp.task('default', watch);
