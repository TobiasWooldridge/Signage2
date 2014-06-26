var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    react = require('gulp-react');

gulp.task('styles', function() {
  return gulp.src('src/css/*.css')
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('vendors', function() {
  gulp.src(['vendor/react/react.js',
            'vendor/react-bootstrap/react-bootstrap.js',
            'vendor/moment/moment.js'])
    .pipe(gulp.dest('dist/vendor/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/vendor/js'));

  gulp.src('vendor/bootstrap/dist/css/*')
    .pipe(gulp.dest('dist/vendor/css'));
});

gulp.task('scripts', function() {
  return gulp.src('src/js/**/*.js*')
    .pipe(react())
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    // .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('html', function() {
  return gulp.src('src/index.html')
    .pipe(gulp.dest('dist'));
})

gulp.task('clean', function() {
  return gulp.src(['dist/css', 'dist/js', 'dist'], {read: false})
    .pipe(clean());
});

gulp.task('default', ['clean'], function() {
    return gulp.start('html', 'styles', 'scripts', 'vendors');
});

gulp.task('watch', function() {
  gulp.watch('src/styles/**/*.css', ['styles']);
  gulp.watch('src/scripts/**/*.js*', ['scripts']);
  gulp.watch('src/**/*.html', ['html']);
  gulp.watch('vendors/**', ['vendors']);

  gulp.start('default');
});

