var gulp = require('gulp');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var livereload = require('gulp-livereload');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var notifier = require('node-notifier');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');  // this works for pure css and scss
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var del = require('del');
var eslint = require('gulp-eslint');

// Image min plugins
var jpegoptim = require('imagemin-jpegoptim');
var pngquant = require('imagemin-pngquant');  // change its content
var optipng = require('imagemin-optipng');  //lostless which means makes your png files smaller without actually changing its content
var svgo = require('imagemin-svgo');
var size = require('gulp-size');  // this module helps compare the size of files before and after compressing

// File paths
var DIST_PATH = 'public/dist';
var SCRIPTS_PATH = 'public/js/**/*.js';
var CSS_PATH = 'public/scss/**/*.scss';
var IMAGES_PATH = 'public/images/**/*.{png,jpeg,jpg,gif,svg}';

// Styles
gulp.task('styles', function() {
  console.log('starting styles task');

  return gulp.src('public/scss/wimf.scss')
    .pipe(plumber(function(err) {
      console.log('STYLES ERROR: ==============================================================\n');
      console.log(err);
      this.emit('end');
    }))
    .pipe(sourcemaps.init())  // kick off the process, it needs to know what the files looked like before your concatenate
    .pipe(autoprefixer())
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(sourcemaps.write()) // write the sourcemap in the new file to give information
    .pipe(gulp.dest(DIST_PATH))
    .pipe(livereload());
});

// Images
gulp.task('images', function() {
  console.log('starting images task');

  return gulp.src(IMAGES_PATH)
    .pipe(size({
      title: 'Uncompressed images',
    }))
    .pipe(pngquant({
      quality: '65-80',
    })())
    .pipe(optipng({
      optimizationLevel: 3,
    })())
    .pipe(jpegoptim({
      max: 70,
    })())
    .pipe(svgo()())
    .pipe(size({
      title: 'Compressed images',
    }))
    .pipe(gulp.dest(DIST_PATH + '/images'))
});

var notify = function(error) {
  var message = 'In: ';
  var title = 'Error: ';

  if (error.description) {
    title += error.description;
  } else if (error.message) {
    title += error.message;
  }

  if (error.filename) {
    var file = error.filename.split('/');
    message += file[file.length-1];
  }

  if (error.lineNumber) {
    message += '\nOn Line: ' + error.lineNumber;
  }

  notifier.notify({ title: title, message: message });
};

var bundler = watchify(browserify({
  entries: ['./public/app.jsx'],
  transform: [reactify],
  extensions: ['.jsx'],
  debug: true,
  cache: {},
  packageCache: {},
  fullPaths: true,
}));

function bundle() {
  return bundler
    .bundle()
    .on('error', notify)
    .pipe(source('app.js'))
    .pipe(gulp.dest(DIST_PATH))
    .pipe(livereload());
}
bundler.on('update', bundle);

gulp.task('scripts', function() {
  console.log('starting scripts task');
  bundle();
});

gulp.task('clean', function() {
  return del.sync([
    DIST_PATH,
  ]);
});

gulp.task('eslint', function() {
  gulp.src(['public/**/*.jsx','!node_modules/**', '!gulpfile.js', '!server.js', '!public/dist/**'])
    .pipe(eslint({
      extends: 'eslint:recommended',
      configFile: '.eslintrc',
      rules: {
        'strict': 2,
      },
      globals: {
        'jQuery': false,
        '$': true,
      },
      env: {
        'browser': true,
        'node': true,
      },
    }))
    .pipe(eslint.formatEach('compact', process.stderr));
});

gulp.task('default', ['clean', 'images', 'styles', 'scripts']);

gulp.task('watch', ['default'], function() {
  console.log('starting watch task');
  require('./server.js');
  livereload.listen();
  gulp.watch(SCRIPTS_PATH, ['scripts']);
  gulp.watch(CSS_PATH, ['styles']);
});
