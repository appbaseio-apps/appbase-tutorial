var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var rename = require("gulp-rename");
var connect = require('gulp-connect');
var watch = require('gulp-watch');
var jshint = require('gulp-jshint');
var eslint = require('gulp-eslint');

var eslintConfig = {
	rules: {
		'no-alert': 0,
		'no-bitwise': 0,
		'camelcase': 0,
		'curly': 1,
		'eqeqeq': 0,
		'no-eq-null': 0,
		'guard-for-in': 1,
		'no-empty': 1,
		'no-use-before-define': 0,
		'no-obj-calls': 2,
		'no-unused-vars': 0,
		'new-cap': 1,
		'no-shadow': 0,
		'strict': 0,
		'no-invalid-regexp': 2,
		'comma-dangle': 2,
		'no-undef': 0,
		'no-new': 1,
		'no-extra-semi': 1,
		'no-debugger': 1,
		'no-caller': 1,
		'semi': 1,
		'quotes': 0,
		'no-unreachable': 2
	},

	globals: ['$'],

	envs: ['node']
};

var files = {
	css: {
		vendor: [
			'bower_components/bootstrap/dist/css/bootstrap.min.css',
			'bower_components/codemirror/lib/codemirror.css',
			'bower_components/codemirror/addon/fold/foldgutter.css',
			'bower_components/codemirror/addon/dialog/dialog.css',
			'bower_components/font-awesome/css/font-awesome.min.css',
			'bower_components/bootstrap3-dialog/dist/css/bootstrap-dialog.min.css'
			
		],
		custom: ['css/*.css'],
		sassFile: ['assets/styles/*.scss']
	},
	js: {
		vendor: [
			'bower_components/appbase-js/browser/appbase.min.js',
			'bower_components/jquery/dist/jquery.min.js',
			'bower_components/angular/angular.min.js',
			'bower_components/bootstrap/dist/js/bootstrap.min.js',
			'bower_components/codemirror/lib/codemirror.js',
			'bower_components/codemirror/addon/search/searchcursor.js',
			'bower_components/codemirror/addon/search/search.js',
			'bower_components/codemirror/addon/dialog/dialog.js',
			'bower_components/codemirror/addon/edit/matchbrackets.js',
			'bower_components/codemirror/addon/edit/closebrackets.js',
			'bower_components/codemirror/addon/comment/comment.js',
			'bower_components/codemirror/addon/comment/comment.js',
			'bower_components/codemirror/addon/fold/foldcode.js',
			'bower_components/codemirror/addon/fold/foldgutter.js',
			'bower_components/codemirror/addon/fold/brace-fold.js',
			'bower_components/codemirror/addon/fold/xml-fold.js',
			'bower_components/codemirror/addon/fold/markdown-fold.js',
			'bower_components/codemirror/addon/fold/comment-fold.js',
			'bower_components/codemirror/mode/yaml/yaml.js',
			'bower_components/codemirror/keymap/sublime.js',
			'bower_components/bootstrap3-dialog/dist/js/bootstrap-dialog.min.js',
			'assets/vendor/*.js'
		],
		custom: [
			'app/config/*.js',
			'app/service/*.js',
			'app/*/*.js'
		],
		html: [
			'app/**/*.html', 
			'index.html'
		]
	}
};


gulp.task('vendorcss', function() {
	return gulp.src(files.css.vendor)
		.pipe(concat('vendor.min.css'))
		.pipe(gulp.dest('dist/css'));
});

gulp.task('customcss', function() {
	return gulp.src(files.css.custom)
		.pipe(minifyCSS())
		.pipe(concat('style.min.css'))
		.pipe(gulp.dest('dist/css'))
		.pipe(connect.reload());
});

gulp.task('vendorjs', function() {
	return gulp.src(files.js.vendor)
		.pipe(concat('vendor.min.js'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('customjs', function() {
	return gulp.src(files.js.custom)
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(eslint(eslintConfig))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
		.pipe(concat('app.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(uglify())
		.pipe(concat('app.min.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(connect.reload());
});

gulp.task('reload', function() {
	return gulp.src(files.html)
		.pipe(connect.reload());
});

gulp.task('sass', function() {
	return gulp.src(files.css.sassFile)
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(gulp.dest('css'));
});

gulp.task('moveCss', function() {
	return gulp.src(['bower_components/bootstrap/dist/css/bootstrap.min.css.map'])
		.pipe(gulp.dest('dist/css'));
});

gulp.task('moveFonts', function() {
	return gulp.src([
			'bower_components/bootstrap/dist/fonts/*',
			'bower_components/font-awesome/fonts/*',
			'assets/fonts/**/*'
		])
		.pipe(gulp.dest('dist/fonts'));
});

gulp.task('connect', function() {
	connect.server({
		root: './',
		livereload: true,
		port: 1357
	});
});

gulp.task('compact', ['sass',
	'customcss',
	'vendorcss',
	'vendorjs',
	'customjs',
	'moveCss',
	'moveFonts'
]);

gulp.task('watchfiles', function() {
	gulp.watch(files.js.custom, ['customjs']);
	gulp.watch(files.css.custom, ['customcss']);
	gulp.watch(files.css.sassFile, ['sass']);
	gulp.watch(files.html, ['reload'])
});

gulp.task('default', ['compact']);

gulp.task('watch', ['compact', 'watchfiles', 'connect']);
