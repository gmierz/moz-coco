var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var less = require('gulp-less');
var autoprefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
var connect = require('gulp-connect');
var livereload = require('gulp-livereload');

//Pre-compiled directory
var lessDir = 'src/less';

//Compiled directory
var targetCSSDir = 'css/';

gulp.task('css', function () {
    return gulp.src(lessDir + '/*.less')
        .pipe(less({ style: 'compressed' }).on('error', gutil.log))
        .pipe(gulp.dest(targetCSSDir))
        .pipe(notify('CSS minified'))
        .pipe(livereload())
});

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch(lessDir + '/*.less', ['css']);
});

gulp.task('connect', function() {
    connect.server({
        root: '.',
        livereload: true
    })
});

gulp.task('default', ['css', 'watch', 'connect']);