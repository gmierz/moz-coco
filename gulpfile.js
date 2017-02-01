var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var less = require('gulp-less');
var autoprefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css')

//Pre-compiled directory
var lessDir = 'src/less';

//Compiled directory
var targetCSSDir = 'css/';

gulp.task('css', function () {
    return gulp.src(lessDir + '/*.less')
        .pipe(less({ style: 'compressed' }).on('error', gutil.log))
        .pipe(gulp.dest(targetCSSDir))
        .pipe(notify('CSS minified'))
});

gulp.task('watch', function () {
    gulp.watch(lessDir + '/*.less', ['css']);
});

gulp.task('default', ['css', 'watch']);