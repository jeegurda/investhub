var gulp = require('gulp');
var livereload = require('gulp-livereload');
var sass = require('gulp-sass');
var notifier = require('node-notifier');

var src = {
    css: ['./**/*.css', '!./node_modules/**'],
    sass: ['./sass/**/*.{scss,sass}', './scss/**/*.{scss,sass}', '!./node_modules/**']
};

gulp.task('reload-page', function() {
    livereload.reload();
});

gulp.task('reload-css', function() {
    gulp.src(src.css)
        .pipe(livereload());
});

gulp.task('build-sass', function() {
    gulp.src(src.sass)
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .on('error', function(err) {
            notifier.notify({
                title: 'Gulp sass',
                message: err.formatted
            });
            console.log('Sass error in ' + err.file + '\n' + err.formatted);
        })
        .pipe(gulp.dest('./css'));
});

gulp.task('watch', function() {
    livereload.listen();

    gulp.watch(src.sass, ['build-sass']);
    gulp.watch(src.css, ['reload-css']);
    gulp.watch(['./**/*.{html,js,json,png,jpg,jpeg}', '!./node_modules/**'], ['reload-page']);
});

