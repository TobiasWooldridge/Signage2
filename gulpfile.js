var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    react = require('gulp-react'),
    imagemin = require('gulp-imagemin'),
    less = require('gulp-less');

gulp.task('styles', function() {
  return gulp.src('src/css/*.*ss')
    .pipe(less())
    .pipe(rename({extname: ".css"}))
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('vendors', function() {
  gulp.src(['vendor/react/react-with-addons.js',
            'vendor/react-bootstrap/react-bootstrap.js',
            'vendor/moment/moment.js'])
    .pipe(gulp.dest('dist/vendor/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/vendor/js'));
});

gulp.task('scripts', function() {
  return gulp.src('src/js/**/*.js*')
    .pipe(react({ harmony : true }))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest('dist/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/images'));
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
    return gulp.start('html', 'styles', 'scripts', 'vendors', 'images');
});

gulp.task('watch', function() {
  gulp.watch('src/css/**/*', ['styles']);
  gulp.watch('src/js/**/*', ['scripts']);
  gulp.watch('src/images/**/*', ['images']);
  gulp.watch('src/**/*.html', ['html']);

  gulp.start('default');
});

