var gulp           = require('gulp'),
		gutil          = require('gulp-util' ),
		sass           = require('gulp-sass'),
		browserSync    = require('browser-sync'),
		concat         = require('gulp-concat'),
		uglify         = require('gulp-uglify'),
		cleanCSS       = require('gulp-clean-css'),
		rename         = require('gulp-rename'),
		del            = require('del'),
		image          = require('gulp-image'),
		cache          = require('gulp-cache'),

		fileinclude = require("gulp-file-include"),
		pxtorem = require('postcss-pxtorem'),
		postcss = require('gulp-postcss'),
		autoprefixer = require('autoprefixer'),
		//vinylPaths = require('vinyl-paths'),

		notify         = require("gulp-notify");

// Скрипты проекта

gulp.task('common-js', function() {
	return gulp.src([
		'app/js/common.js',
		])
	.pipe(concat('common.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'));
});

gulp.task('js', ['common-js'], function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/js/common.min.js', // Всегда в конце
		])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Минимизировать весь js (на выбор)
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({stream: true}));
});


gulp.task('html', function() {
	return gulp.src('app/templates/*.html')
	.pipe(fileinclude({
				prefix: '@@',
				basepath: 'app/templates/'
			}))
	.pipe(gulp.dest('app'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	});
});

gulp.task('sass', function() {
	return gulp.src('app/sass/*.scss')
	.pipe(sass.sync().on('error', sass.logError))
	.pipe( postcss([ pxtorem({ replace: true,minPixelValue: 3,propWhiteList: [],selectorBlackList: [/^html$/,'.col-','.row','.container']}),
	                               autoprefixer({ browsers: ['last 15 versions',]})
	 ]))
	.pipe(rename({suffix: '.min', prefix : ''}))
	.pipe(cleanCSS({debug:true,mediaMerging:true}))
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['sass', 'js', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.scss', ['sass']);
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
	gulp.watch('app/templates/*.*', ['html']);
});

gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*')
	//.pipe(vinylPaths(del))
	//.pipe(gulp.dest('app/images_finished/'))
	  .pipe(image({
	    pngquant: true,
	    optipng: true,
	    zopflipng: true,
	    jpegRecompress: true,
	    jpegoptim: true,
	    mozjpeg: false,
	    guetzli: false,
	    gifsicle: true,
	    svgo: true,
	    concurrent: 12
	}))
	.pipe(gulp.dest('dist/img')); 
});

//gulp.task('build', [ 'imagemin', 'sass', 'js'], function() {
gulp.task('build', ['removedist', 'imagemin', 'sass', 'js'], function() {

	var buildFiles = gulp.src([
		'app/*.html',
		]).pipe(gulp.dest('dist'));

	var buildCss = gulp.src([
		'app/css/main.min.css',
		]).pipe(gulp.dest('dist/css'));

	var buildJs = gulp.src([
		'app/js/scripts.min.js',
		]).pipe(gulp.dest('dist/js'));

	var buildFonts = gulp.src([
		'app/fonts/**/*',
		]).pipe(gulp.dest('dist/fonts'));

});


gulp.task('removedist', function() { return del.sync('dist'); });

gulp.task('default', ['watch']);
